const db = require('./db');
const bcrypt = require('bcryptjs');

async function fix() {
    try {
        const email = 'admin@example.com';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('Syncing database...');

        // 1. Ensure Table Structure
        await db.query(`ALTER TABLE users MODIFY COLUMN role ENUM('customer', 'provider', 'admin', 'super_admin') DEFAULT 'customer'`);

        // 2. Add region column if missing
        const [cols] = await db.query("SHOW COLUMNS FROM users LIKE 'region'");
        if (cols.length === 0) {
            await db.query("ALTER TABLE users ADD COLUMN region VARCHAR(100)");
        }

        // 3. Reset/Create Admin
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length > 0) {
            console.log('Updating existing admin account...');
            await db.query(
                "UPDATE users SET password = ?, role = 'super_admin' WHERE email = ?",
                [hashedPassword, email]
            );
        } else {
            console.log('Creating new admin account...');
            await db.query(
                "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'super_admin')",
                ['Admin User', email, hashedPassword]
            );
        }

        console.log('\nSUCCESS!');
        console.log('You can now log in with:');
        console.log('Email:', email);
        console.log('Password:', password);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fix();
