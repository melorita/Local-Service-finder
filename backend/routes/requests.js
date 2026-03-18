const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

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

// Create a new service request
router.post('/', authenticateToken, async (req, res) => {
    const { provider_id, message } = req.body;
    const customer_id = req.user.id;

    if (req.user.role !== 'customer') {
        return res.status(403).json({ message: 'Only customers can send service requests.' });
    }

    try {
        await db.query(
            `INSERT INTO customer_requests (customer_id, provider_id, message) VALUES (?, ?, ?)`,
            [customer_id, provider_id, message]
        );
        res.status(201).json({ message: 'Request sent successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get requests for a provider
router.get('/provider', authenticateToken, async (req, res) => {
    if (req.user.role !== 'provider') {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    try {
        // First get the provider ID for this user
        const [providers] = await db.query('SELECT id FROM providers WHERE user_id = ?', [req.user.id]);
        if (providers.length === 0) return res.status(404).json({ message: 'Provider not found' });
        
        const provider_id = providers[0].id;

        const [requests] = await db.query(
            `SELECT r.*, u.name as customer_name, u.email as customer_email 
             FROM customer_requests r 
             JOIN users u ON r.customer_id = u.id 
             WHERE r.provider_id = ? 
             ORDER BY r.created_at DESC`,
            [provider_id]
        );
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get requests for a customer
router.get('/customer', authenticateToken, async (req, res) => {
    try {
        const [requests] = await db.query(
            `SELECT r.*, u.name as provider_name, p.service_type 
             FROM customer_requests r 
             JOIN providers p ON r.provider_id = p.id 
             JOIN users u ON p.user_id = u.id 
             WHERE r.customer_id = ? 
             ORDER BY r.created_at DESC`,
            [req.user.id]
        );
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update request status
router.patch('/:id/status', authenticateToken, async (req, res) => {
    const { status } = req.body; // 'accepted', 'completed', 'cancelled', 'rejected'
    
    try {
        // Ensure the requester is the provider of this request
        const [providers] = await db.query('SELECT id FROM providers WHERE user_id = ?', [req.user.id]);
        if (providers.length === 0) return res.status(403).json({ message: 'Unauthorized' });

        const provider_id = providers[0].id;

        const [existing] = await db.query(
            'SELECT * FROM customer_requests WHERE id = ? AND provider_id = ?',
            [req.params.id, provider_id]
        );

        if (existing.length === 0) return res.status(404).json({ message: 'Request not found' });

        await db.query(
            'UPDATE customer_requests SET status = ? WHERE id = ?',
            [status, req.params.id]
        );

        res.json({ message: `Request ${status} successfully!` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
