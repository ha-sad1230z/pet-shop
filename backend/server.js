require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');

// Init Database
require('./db/db'); 

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
const uploadRoutes = require('./routes/upload.routes');
const reportRoutes = require('./routes/report.routes');
app.use('/api/upload', uploadRoutes);
app.use('/api/reports', reportRoutes);

// Render Frontend and Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend')));

// Bắt các Route API không có => trả về JSON (thay vì HTML)
app.get('/api', (req, res) => {
    res.json({ message: "Welcome to PetShop API (Node.js/Express)!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ detail: "Lỗi kết nối đến máy chủ nội bộ hoặc có sự cố xảy ra." });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
