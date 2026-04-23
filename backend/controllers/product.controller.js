const db = require('../db/db');

exports.searchProducts = async (req, res) => {
    try {
        const query = req.query.q || '';
        const products = await db.allAsync(`
            SELECT * FROM products 
            WHERE name LIKE ? OR \`desc\` LIKE ?
        `, [`%${query}%`, `%${query}%`]);
        
        const categories = await db.allAsync('SELECT * FROM categories');
        const catMap = {};
        categories.forEach(c => catMap[c.id] = c.name);

        const result = products.map(p => ({
            ...p,
            category: catMap[p.categoryId] || 'Unknown'
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ detail: "Lỗi Server", err: err.message });
    }
};
exports.getAllProducts = async (req, res) => {
    try {
        const products = await db.allAsync('SELECT * FROM products');
        
        // Cần join tên category để trả về `category` (tên category) theo require của frontend JS.
        // JS sử dụng `product.category` hoặc tìm kiếm categoryId.
        // JS: p.category, p.categoryId
        const categories = await db.allAsync('SELECT * FROM categories');
        const catMap = {};
        categories.forEach(c => catMap[c.id] = c.name);

        const result = products.map(p => ({
            ...p,
            category: catMap[p.categoryId] || 'Unknown'
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ detail: "Lỗi Server", err: err.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await db.getAsync('SELECT * FROM products WHERE id = ?', [id]);
        
        if (!product) return res.status(404).json({ detail: "Không tìm thấy sản phẩm." });

        const category = await db.getAsync('SELECT name FROM categories WHERE id = ?', [product.categoryId]);
        
        res.json({
            ...product,
            category: category ? category.name : 'Unknown'
        });
    } catch (err) {
        res.status(500).json({ detail: "Lỗi Server", err: err.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, price, categoryId, stock, desc, image } = req.body;
        
        if (!name || price === undefined) {
            return res.status(400).json({ detail: "Tên và giá sản phẩm là bắt buộc." });
        }

        const result = await db.runAsync(`
            INSERT INTO products (name, price, categoryId, stock, \`desc\`, image)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [name, price, categoryId || null, stock || 0, desc || '', image || '']);

        res.status(201).json({ detail: "Tạo sản phẩm thành công.", id: result.lastID });
    } catch (err) {
        res.status(500).json({ detail: "Lỗi Server", err: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, price, categoryId, stock, desc, image } = req.body;

        const currentProduct = await db.getAsync('SELECT * FROM products WHERE id = ?', [id]);
        if (!currentProduct) return res.status(404).json({ detail: "Không tìm thấy sản phẩm." });

        const newName = name !== undefined ? name : currentProduct.name;
        const newPrice = price !== undefined ? price : currentProduct.price;
        const newCategory = categoryId !== undefined ? categoryId : currentProduct.categoryId;
        const newStock = stock !== undefined ? stock : currentProduct.stock;
        const newDesc = desc !== undefined ? desc : currentProduct.desc;
        const newImage = image !== undefined ? image : currentProduct.image;

        await db.runAsync(`
            UPDATE products
            SET name = ?, price = ?, categoryId = ?, stock = ?, \`desc\` = ?, image = ?
            WHERE id = ?
        `, [newName, newPrice, newCategory, newStock, newDesc, newImage, id]);

        res.json({ detail: "Cập nhật sản phẩm thành công." });
    } catch (err) {
        res.status(500).json({ detail: "Lỗi Server", err: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await db.runAsync('DELETE FROM products WHERE id = ?', [id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, detail: "Không tìm thấy sản phẩm." });
        }
        
        res.json({ success: true, detail: "Xóa sản phẩm thành công." });
    } catch (err) {
        res.status(500).json({ success: false, detail: "Lỗi Server", err: err.message });
    }
};
