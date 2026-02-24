const db = require('../db');

async function upgradeRBAC() {
    try {
        console.log('Starting RBAC upgrade...');

        // 1. Add region column if not exists
        const [columns] = await db.query('SHOW COLUMNS FROM users LIKE "region"');
        if (columns.length === 0) {
            console.log('Adding region column to users table...');
            await db.query('ALTER TABLE users ADD COLUMN region VARCHAR(100)');
        }

        // 2. Update role ENUM to include super_admin
        // Note: In MySQL, altering ENUM can be done by MODIFY COLUMN
        console.log('Updating role ENUM to include super_admin...');
        await db.query("ALTER TABLE users MODIFY COLUMN role ENUM('customer', 'provider', 'admin', 'super_admin') DEFAULT 'customer'");

        // 3. Upgrade current admins to super_admin
        console.log('Upgrading existing admins to super_admin...');
        await db.query("UPDATE users SET role = 'super_admin' WHERE role = 'admin'");

        console.log('RBAC upgrade completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('RBAC upgrade failed:', err);
        process.exit(1);
    }
}

upgradeRBAC();
