const db = require('../db');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    try {
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', ['admin@example.com']);
        if (existing.length > 0) {
            console.log('Admin already exists');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            ['Admin User', 'admin@example.com', hashedPassword, 'admin']
        );

        console.log('Admin user created successfully');
        console.log('Email: admin@example.com');
        console.log('Password: admin123');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

createAdmin();
