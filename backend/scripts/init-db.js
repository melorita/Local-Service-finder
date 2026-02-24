const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config.env') });

async function init() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log('Connected to MySQL');

        await connection.query('CREATE DATABASE IF NOT EXISTS local_service_finder');
        await connection.query('USE local_service_finder');

        const schema = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf8');
        const statements = schema.split(';').filter(s => s.trim());

        for (let statement of statements) {
            await connection.query(statement);
        }

        console.log('Database initialized successfully');
        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('Initialization failed:', err);
        process.exit(1);
    }
}

init();
