const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

/* ================================
   🔐 JWT Authentication Middleware
================================ */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};


/* =====================================
   👤 Get Current Provider Profile
===================================== */
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const [providers] = await db.query(
            `SELECT p.*, u.name, u.email 
             FROM providers p 
             JOIN users u ON p.user_id = u.id 
             WHERE p.user_id = ?`,
            [req.user.id]
        );

        if (providers.length === 0)
            return res.status(404).json({ message: 'Provider not found' });

        const provider = providers[0];

        // Check for pending service change
        const [pending] = await db.query(
            `SELECT * FROM service_change_requests 
             WHERE provider_id = ? AND status = 'PENDING'`,
            [provider.id]
        );

        const [reviews] = await db.query(
            `SELECT r.*, u.name as reviewer 
             FROM reviews r 
             JOIN users u ON r.customer_id = u.id 
             WHERE r.provider_id = ?`,
            [provider.id]
        );

        res.json({
            ...provider,
            reviews,
            pending_request: pending.length > 0 ? pending[0] : null
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/* =====================================
   ✏️ Update Provider Profile
   - service_type requires admin approval
===================================== */
router.put('/me', authenticateToken, async (req, res) => {
    const { service_type, location, contact_number, description } = req.body;

    try {
        // Get provider
        const [rows] = await db.query(
            'SELECT * FROM providers WHERE user_id = ?',
            [req.user.id]
        );

        if (rows.length === 0)
            return res.status(404).json({ message: 'Provider not found' });

        const provider = rows[0];

        /* ===============================
           🚫 SERVICE CHANGE REQUIRES APPROVAL
        =============================== */
        if (service_type && service_type !== provider.service_type) {

            // Check if already pending
            const [pending] = await db.query(
                `SELECT * FROM service_change_requests 
                 WHERE provider_id = ? AND status = 'PENDING'`,
                [provider.id]
            );

            if (pending.length > 0) {
                return res.status(400).json({
                    message: 'You already have a pending service change request.'
                });
            }

            await db.query(
                `INSERT INTO service_change_requests 
                 (provider_id, old_service, requested_service) 
                 VALUES (?, ?, ?)`,
                [provider.id, provider.service_type, service_type]
            );

            return res.json({
                message: 'Service change request submitted. Waiting for admin approval.'
            });
        }

        /* ===============================
           ✅ Update other fields normally
        =============================== */
        await db.query(
            `UPDATE providers 
             SET location = ?, contact_number = ?, description = ?
             WHERE user_id = ?`,
            [location, contact_number, description, req.user.id]
        );

        res.json({ message: 'Profile updated successfully' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/* =====================================
   🔍 Get All Approved Providers
===================================== */
router.get('/', async (req, res) => {
    const { service, location } = req.query;

    let query = `
        SELECT p.*, u.name, u.email 
        FROM providers p 
        JOIN users u ON p.user_id = u.id 
        WHERE p.status = 'approved'
    `;

    const params = [];

    if (service) {
        query += ' AND p.service_type LIKE ?';
        params.push(`%${service}%`);
    }

    if (location) {
        query += ' AND p.location LIKE ?';
        params.push(`%${location}%`);
    }

    try {
        const [providers] = await db.query(query, params);
        res.json(providers);

    } catch (err) {
        console.error('Database query error in GET /api/providers:');
        console.error('Query:', query);
        console.error('Params:', params);
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
});


/* =====================================
   📄 Get Provider Details by ID
===================================== */
router.get('/:id', async (req, res) => {
    try {
        const [providers] = await db.query(
            `SELECT p.*, u.name, u.email 
             FROM providers p 
             JOIN users u ON p.user_id = u.id 
             WHERE p.id = ?`,
            [req.params.id]
        );

        if (providers.length === 0)
            return res.status(404).json({ message: 'Provider not found' });

        const [reviews] = await db.query(
            `SELECT r.*, u.name as reviewer 
             FROM reviews r 
             JOIN users u ON r.customer_id = u.id 
             WHERE r.provider_id = ?`,
            [req.params.id]
        );

        res.json({ ...providers[0], reviews });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
