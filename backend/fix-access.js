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

        // 2. Add location column if missing
        const [regionCol] = await db.query("SHOW COLUMNS FROM users LIKE 'region'");
        const [locationCol] = await db.query("SHOW COLUMNS FROM users LIKE 'location'");

        if (regionCol.length > 0 && locationCol.length === 0) {
            console.log('Renaming region column to location...');
            await db.query("ALTER TABLE users CHANGE COLUMN region location VARCHAR(100)");
        } else if (locationCol.length === 0) {
            console.log('Adding location column...');
            await db.query("ALTER TABLE users ADD COLUMN location VARCHAR(100)");
        }

        // Rename regions table to locations if exists
        try {
            const [tables] = await db.query("SHOW TABLES LIKE 'regions'");
            if (tables.length > 0) {
                console.log('Renaming regions table to locations...');
                await db.query("RENAME TABLE regions TO locations");
            }
        } catch (e) {
            console.log('Regions table handling:', e.message);
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
