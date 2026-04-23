const db = require('../db/db');

exports.getAllOrders = async (req, res) => {
    try {
        let orders;
        // User bình thường chỉ xem đơn của họ, Admin/Staff xem toàn bộ
        if (req.user.role === 'CUSTOMER') {
            orders = await db.allAsync('SELECT * FROM orders WHERE userId = ?', [req.user.id]);
        } else {
            orders = await db.allAsync('SELECT * FROM orders');
        }

        // Parse JSON items string back to array
        const result = orders.map(o => ({
            ...o,
            items: o.items ? JSON.parse(o.items) : []
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ detail: "Lỗi Server", err: err.message });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const { items, total } = req.body;
        
        if (!items || !items.length || total === undefined) {
            return res.status(400).json({ detail: "Giỏ hàng rỗng hoặc thiếu tổng tiền." });
        }

        const date = new Date().toISOString();
        const itemsJson = JSON.stringify(items);

        // Deduct quantities in stock
        for (let item of items) {
            const product = await db.getAsync('SELECT stock FROM products WHERE id = ?', [item.id]);
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({ detail: `Sản phẩm ${item.name} không đủ hàng.` });
            }
            // Temporarily deduct stock upon ordering. (Admin can restock if cancelled).
            const newStock = product.stock - item.quantity;
            await db.runAsync('UPDATE products SET stock = ? WHERE id = ?', [newStock, item.id]);
        }

        const result = await db.runAsync(`
            INSERT INTO orders (userId, date, total, status, items)
            VALUES (?, ?, ?, 'pending', ?)
        `, [req.user.id, date, total, itemsJson]);

        // Clear cart for the user
        await db.runAsync(`DELETE FROM cart_items WHERE userId = ?`, [req.user.id]);

        res.status(201).json({ detail: "Tạo đơn hàng thành công.", id: result.lastID });
    } catch (err) {
        res.status(500).json({ detail: "Lỗi Server", err: err.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body; // pending, approved, cancelled

        if (!['pending', 'approved', 'cancelled'].includes(status)) {
            return res.status(400).json({ detail: "Trạng thái không hợp lệ." });
        }

        const order = await db.getAsync('SELECT * FROM orders WHERE id = ?', [id]);
        if (!order) return res.status(404).json({ detail: "Không tìm thấy đơn hàng." });

        await db.runAsync(`
            UPDATE orders SET status = ?, approvedBy = ?, approvedById = ?
            WHERE id = ?
        `, [status, req.user.username, req.user.id, id]);

        // Nếu huỷ đơn hàng thì hoàn lại stock
        if (status === 'cancelled' && order.status !== 'cancelled') {
            const items = order.items ? JSON.parse(order.items) : [];
            for (let item of items) {
                const product = await db.getAsync('SELECT stock FROM products WHERE id = ?', [item.id]);
                if (product) {
                    await db.runAsync('UPDATE products SET stock = ? WHERE id = ?', [product.stock + item.quantity, item.id]);
                }
            }
        }

        res.json({ detail: "Cập nhật trạng thái thành công." });
    } catch (err) {
        res.status(500).json({ detail: "Lỗi Server", err: err.message });
    }
};
