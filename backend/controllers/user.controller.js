const db = require('../db/db');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
    try {
        const { username, password, email, fullName, role } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ detail: "Vui lòng cung cấp username và password." });
        }

        const existing = await db.getAsync('SELECT * FROM users WHERE username = ?', [username]);
        if (existing) {
            return res.status(400).json({ detail: "Username đã tồn tại." });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const userRole = role || 'CUSTOMER';

        const result = await db.runAsync(`
            INSERT INTO users (username, password, email, fullName, role)
            VALUES (?, ?, ?, ?, ?)
        `, [username, hashedPassword, email || '', fullName || '', userRole]);

        res.status(201).json({ detail: "Tạo người dùng thành công", id: result.lastID });
    } catch (err) {
        res.status(500).json({ detail: "Lỗi Server", err: err.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await db.getAsync('SELECT id, username, email, fullName, role, status FROM users WHERE id = ?', [req.user.id]);
        if (!user) {
            return res.status(404).json({ detail: "Không tìm thấy user" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ detail: "Lỗi Server", err: err.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await db.allAsync('SELECT id, username, email, fullName, role, status, banReason FROM users');
        res.json(users);
    } catch (err) {
        res.status(500).json({ detail: "Lỗi Server", err: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { fullName, role, status, banReason } = req.body;

        // Lấy thông tin hiện tại
        const currentUser = await db.getAsync('SELECT * FROM users WHERE id = ?', [userId]);
        if (!currentUser) return res.status(404).json({ detail: "Không tìm thấy User." });

        // Merge dữ liệu
        const newFullName = fullName !== undefined ? fullName : currentUser.fullName;
        const newRole = role !== undefined ? role : currentUser.role;
        const newStatus = status !== undefined ? status : currentUser.status;
        const newBanReason = banReason !== undefined ? banReason : currentUser.banReason;

        await db.runAsync(`
            UPDATE users SET fullName = ?, role = ?, status = ?, banReason = ?
            WHERE id = ?
        `, [newFullName, newRole, newStatus, newBanReason, userId]);

        res.json({ detail: "Cập nhật thành công." });
    } catch (err) {
        res.status(500).json({ detail: "Lỗi Server", err: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        await db.runAsync('DELETE FROM users WHERE id = ?', [userId]);
        res.json({ detail: "Xóa người dùng thành công." });
    } catch (err) {
        res.status(500).json({ detail: "Lỗi Server", err: err.message });
    }
};
