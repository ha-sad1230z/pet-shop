const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/db');
const { JWT_SECRET } = require('../middleware/auth.middleware');

exports.register = async (req, res) => {
    try {
        const { username, password, email, fullName } = req.body;

        if (!username || !password) {
            return res.status(400).json({ detail: "Vui lòng cung cấp username và password." });
        }

        // Check user exists
        const existing = await db.getAsync('SELECT * FROM users WHERE username = ?', [username]);
        if (existing) {
            return res.status(400).json({ detail: "Username đã tồn tại." });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const result = await db.runAsync(`
            INSERT INTO users (username, password, email, fullName, role)
            VALUES (?, ?, ?, ?, 'CUSTOMER')
        `, [username, hashedPassword, email || '', fullName || '']);

        res.status(201).json({ detail: "Đăng ký thành công", userId: result.lastID });
    } catch (err) {
        res.status(500).json({ detail: "Lỗi tạo tài khoản", err: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ detail: "Username và Password là bắt buộc." });
        }

        const user = await db.getAsync('SELECT * FROM users WHERE username = ?', [username]);

        if (!user) {
            return res.status(401).json({ detail: "Tài khoản không tồn tại." });
        }

        if (user.status === 'banned') {
            return res.status(403).json({ detail: "Tài khoản đã bị khóa." });
        }

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ detail: "Mật khẩu không đúng." });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, status: user.status },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ access_token: token, token_type: "bearer" });
    } catch (err) {
        res.status(500).json({ detail: "Lỗi đăng nhập", err: err.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ detail: "Vui lòng cung cấp địa chỉ email." });
        }

        const user = await db.getAsync('SELECT * FROM users WHERE email = ?', [email]);

        if (!user) {
            return res.status(404).json({ detail: "Không tìm thấy tài khoản với email này." });
        }

        if (user.status === 'banned') {
            return res.status(403).json({ detail: "Tài khoản của bạn đã bị khóa." });
        }

        // Generate a random 8-character temporary password
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = bcrypt.hashSync(tempPassword, 10);

        await db.runAsync('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);

        res.json({ message: `Đặt lại mật khẩu thành công. Mật khẩu mới của bạn là: ${tempPassword}` });
    } catch (err) {
        res.status(500).json({ detail: "Lỗi xử lý hệ thống", err: err.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ detail: "Vui lòng cung cấp mật khẩu cũ và mật khẩu mới." });
        }

        const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [userId]);
        if (!user) {
            return res.status(404).json({ detail: "Không tìm thấy người dùng." });
        }

        const isMatch = bcrypt.compareSync(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ detail: "Mật khẩu cũ không đúng." });
        }

        const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
        await db.runAsync('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId]);

        res.json({ message: "Đổi mật khẩu thành công." });
    } catch (err) {
        res.status(500).json({ detail: "Lỗi xử lý hệ thống", err: err.message });
    }
};