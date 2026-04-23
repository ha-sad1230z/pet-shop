const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter (optional, just to be safe)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file hình ảnh!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

const { verifyToken, isStaffOrAdmin } = require('../middleware/auth.middleware');
const uploadSingle = upload.single('image');

router.post('/:productId', verifyToken, isStaffOrAdmin, (req, res) => {
    uploadSingle(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ detail: `Lỗi upload: Form-Data Key bắt buộc là 'image' (${err.message})` });
        } else if (err) {
            return res.status(400).json({ detail: err.message });
        }
        
        try {
            if (!req.file) {
                return res.status(400).json({ detail: 'Vui lòng chọn một file hình ảnh để tải lên.' });
            }
            
            // Return relative path or full URL
            // Using relative path that will be served by static middleware
            const imageUrl = `/uploads/${req.file.filename}`;
            
            // Update product
            const productId = req.params.productId;
            if (productId) {
                const db = require('../db/db');
                const fullUrl = 'http://127.0.0.1:8000' + imageUrl;
                await db.runAsync('UPDATE products SET image = ? WHERE id = ?', [fullUrl, productId]);
            }

            res.json({ 
                message: 'Tải ảnh lên thành công', 
                imageUrl: imageUrl 
            });
        } catch (error) {
            console.error("Upload error:", error);
            res.status(500).json({ detail: 'Lỗi khi xử lý ảnh tải lên.' });
        }
    });
});

module.exports = router;
