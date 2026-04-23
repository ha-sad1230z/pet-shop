require('dotenv').config();
const mysql = require('mysql2/promise');

async function test() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });
        await connection.query('CREATE DATABASE IF NOT EXISTS `petshop`');
        console.log('Successfully connected and created petshop databse');
        process.exit(0);
    } catch(err) {
        console.error('MySQL Error Details:', err);
        process.exit(1);
    }
}
test();
