const jwt = require('jsonwebtoken');

// Thay đổi nếu có config
const JWT_SECRET = process.env.JWT_SECRET || 'petshop_secret_key_123';

const verifyToken = (req, res, next) => {
    let token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ detail: 'Bắt buộc phải có token xác thực.' });
    }

    // Token from Bearer header
    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ detail: 'Token không hợp lệ hoặc đã hết hạn.' });
        }
        req.user = decoded; // { id, username, role, status }
        
        if (req.user.status === 'banned') {
            return res.status(403).json({ detail: 'Tài khoản của bạn đã bị khóa.' });
        }
        
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        return res.status(403).json({ detail: 'Không có quyền truy cập (yêu cầu Admin).' });
    }
};

const isStaffOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'STAFF')) {
        next();
    } else {
        return res.status(403).json({ detail: 'Không có quyền truy cập (yêu cầu Staff hoặc Admin).' });
    }
};

module.exports = {
    verifyToken,
    isAdmin,
    isStaffOrAdmin,
    JWT_SECRET
};
