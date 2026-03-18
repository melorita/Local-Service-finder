const db = require('./backend/db');

async function migrate() {
    try {
        console.log('Migrating database...');

        await db.query(`
            CREATE TABLE IF NOT EXISTS customer_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_id INT NOT NULL,
                provider_id INT NOT NULL,
                status ENUM('pending', 'accepted', 'completed', 'cancelled', 'rejected') DEFAULT 'pending',
                message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
            )
        `);

        console.log('Table customer_requests created successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
