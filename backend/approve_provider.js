const db = require('./db');

async function approveProvider() {
    try {
        const [result] = await db.query("UPDATE providers SET status = 'approved' WHERE id = 1");
        console.log('Update result:', result);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

approveProvider();
