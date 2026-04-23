require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

let pool;

async function initDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
        });
        const dbName = process.env.DB_NAME || 'petshop';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await connection.end();

        pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: dbName,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        console.log(`Connected to the MySQL database '${dbName}'.`);
        await createTables();

    } catch (err) {
        console.error('Error initializing MySQL database:', err.message);
    }
}

async function createTables() {
    try {
        // --- Users Table ---
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                fullName VARCHAR(255),
                role VARCHAR(50) DEFAULT 'CUSTOMER',
                status VARCHAR(50) DEFAULT 'active',
                banReason TEXT
            )
        `);

        await insertDefaultAdmin();

        // --- Categories Table ---
        await pool.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                \`desc\` TEXT
            )
        `);

        // --- Products Table ---
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                price DOUBLE NOT NULL,
                categoryId INT,
                stock INT DEFAULT 0,
                \`desc\` TEXT,
                image TEXT
            )
        `);

        // --- Orders Table ---
        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT,
                date VARCHAR(255) NOT NULL,
                total DOUBLE NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                approvedBy VARCHAR(255),
                approvedById INT,
                items LONGTEXT
            )
        `);

        // --- Cart Items Table ---
        await pool.query(`
            CREATE TABLE IF NOT EXISTS cart_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                productId INT NOT NULL,
                quantity INT DEFAULT 1,
                UNIQUE(userId, productId)
            )
        `);

        console.log("Database tables ensured.");
    } catch (err) {
        console.error("Error creating tables", err);
    }
}

async function insertDefaultAdmin() {
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM users');
        if (rows[0].count === 0) {
            const adminPass = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
            const defaultPassword = bcrypt.hashSync(adminPass, 10);
            await pool.query(`
                INSERT INTO users (username, password, email, fullName, role)
                VALUES (?, ?, ?, ?, ?)
            `, ['admin', defaultPassword, 'admin@petshop.com', 'Administrator', 'ADMIN']);
            console.log("Default admin account created: admin / " + adminPass);
        }
    } catch (err) {
        console.error("Error inserting default admin", err);
    }
}

// Ensure initDB runs
const poolPromise = initDB();

const db = {
    runAsync: async function (sql, params = []) {
        await poolPromise;
        const [result] = await pool.execute(sql, params);
        return {
            lastID: result.insertId,
            changes: result.affectedRows
        };
    },
    getAsync: async function (sql, params = []) {
        await poolPromise;
        const [rows] = await pool.execute(sql, params);
        return rows.length > 0 ? rows[0] : undefined;
    },
    allAsync: async function (sql, params = []) {
        await poolPromise;
        const [rows] = await pool.execute(sql, params);
        return rows;
    }
};

module.exports = db;