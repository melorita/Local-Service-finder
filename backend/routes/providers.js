const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT
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

// Get current provider's profile
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const [providers] = await db.query(
            'SELECT p.*, u.name, u.email FROM providers p JOIN users u ON p.user_id = u.id WHERE p.user_id = ?',
            [req.user.id]
        );
        if (providers.length === 0) return res.status(404).json({ message: 'Provider not found' });

        const [reviews] = await db.query(
            'SELECT r.*, u.name as reviewer FROM reviews r JOIN users u ON r.customer_id = u.id WHERE r.provider_id = ?',
            [providers[0].id]
        );

        res.json({ ...providers[0], reviews });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update current provider's profile
router.put('/me', authenticateToken, async (req, res) => {
    const { service_type, location, contact_number, description } = req.body;
    try {
        await db.query(
            'UPDATE providers SET service_type = ?, location = ?, contact_number = ?, description = ? WHERE user_id = ?',
            [service_type, location, contact_number, description, req.user.id]
        );
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all approved providers
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

// Get provider details
router.get('/:id', async (req, res) => {
    try {
        const [providers] = await db.query(
            'SELECT p.*, u.name, u.email FROM providers p JOIN users u ON p.user_id = u.id WHERE p.id = ?',
            [req.params.id]
        );
        if (providers.length === 0) return res.status(404).json({ message: 'Provider not found' });

        const [reviews] = await db.query(
            'SELECT r.*, u.name as reviewer FROM reviews r JOIN users u ON r.customer_id = u.id WHERE r.provider_id = ?',
            [req.params.id]
        );

        res.json({ ...providers[0], reviews });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
