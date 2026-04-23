const db = require('../db/db');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await db.allAsync('SELECT * FROM categories');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ detail: "Lỗi Server", err: err.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, desc } = req.body;
        if (!name) return res.status(400).json({ detail: "Tên danh mục là bắt buộc." });
        
        await db.runAsync('INSERT INTO categories (name, `desc`) VALUES (?, ?)', [name, desc || '']);
        res.status(201).json({ detail: "Tạo danh mục thành công." });
    } catch (err) {
        res.status(500).json({ detail: "Lỗi Server", err: err.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, desc } = req.body;

        const currentCat = await db.getAsync('SELECT * FROM categories WHERE id = ?', [id]);
        if (!currentCat) return res.status(404).json({ detail: "Không tìm thấy danh mục." });

        const newName = name !== undefined ? name : currentCat.name;
        const newDesc = desc !== undefined ? desc : currentCat.desc;

        await db.runAsync('UPDATE categories SET name = ?, `desc` = ? WHERE id = ?', [newName, newDesc, id]);
        res.json({ detail: "Cập nhật thành công." });
    } catch (err) {
        res.status(500).json({ detail: "Lỗi Server", err: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, detail: "Không tìm thấy danh mục." });
        }
        
        // Optional: Set products categoryId to null?
        await db.runAsync('UPDATE products SET categoryId = NULL WHERE categoryId = ?', [id]);

        res.json({ success: true, detail: "Xóa danh mục thành công." });
    } catch (err) {
        res.status(500).json({ success: false, detail: "Lỗi Server", err: err.message });
    }
};
