const db = require('../db/db');

exports.syncCartItem = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        
        if (!productId) return res.status(400).json({ detail: "Thiếu productId" });

        // Logic sync: Thêm vào bảng cart_items
        const userId = req.user.id;

        // Upsert logic for MySQL
        await db.runAsync(`
            INSERT INTO cart_items (userId, productId, quantity)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
        `, [userId, productId, quantity || 1]);

        res.status(200).json({ detail: "Đã đồng bộ giỏ hàng." });
    } catch (err) {
        res.status(500).json({ detail: "Lỗi Server", err: err.message });
    }
};

exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const rows = await db.allAsync(`
            SELECT 
                c.productId as id,
                p.name,
                p.price,
                p.image,
                c.quantity,
                p.stock
            FROM cart_items c
            JOIN products p ON c.productId = p.id
            WHERE c.userId = ?
        `, [userId]);

        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ detail: "Lỗi Server", err: err.message });
    }
};

exports.removeCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;

        if (!productId) return res.status(400).json({ detail: "Thiếu productId" });

        await db.runAsync(`
            DELETE FROM cart_items
            WHERE userId = ? AND productId = ?
        `, [userId, productId]);

        res.status(200).json({ detail: "Đã xóa sản phẩm khỏi giỏ hàng." });
    } catch (err) {
        res.status(500).json({ detail: "Lỗi Server", err: err.message });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;
        const { quantity } = req.body;

        if (!productId || quantity === undefined || quantity < 1) {
            return res.status(400).json({ detail: "Dữ liệu cập nhật không hợp lệ." });
        }

        const result = await db.runAsync(`
            UPDATE cart_items
            SET quantity = ?
            WHERE userId = ? AND productId = ?
        `, [quantity, userId, productId]);

        if (result.changes === 0) {
            return res.status(404).json({ detail: "Sản phẩm không có trong giỏ hàng." });
        }

        res.status(200).json({ detail: "Cập nhật số lượng thành công." });
    } catch (err) {
        res.status(500).json({ detail: "Lỗi Server", err: err.message });
    }
};
