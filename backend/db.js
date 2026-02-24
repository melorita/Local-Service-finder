const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, 'config.env');
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
} else {
    require('dotenv').config();
}


const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'local_service_finder',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 5000,
    acquireTimeout: 5000
});

console.log('Database pool created for:', process.env.DB_NAME || 'local_service_finder');


module.exports = pool.promise();
