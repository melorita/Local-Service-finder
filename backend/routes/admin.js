const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err || user.role !== 'admin') return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Get all providers for approval
router.get('/providers', isAdmin, async (req, res) => {
    try {
        const [providers] = await db.query('SELECT p.*, u.name, u.email FROM providers p JOIN users u ON p.user_id = u.id');
        res.json(providers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all users
router.get('/users', isAdmin, async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name, email, role, created_at FROM users');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update provider status
router.patch('/providers/:id/status', isAdmin, async (req, res) => {
    const { status } = req.body; // 'approved', 'blocked', 'pending'
    try {
        await db.query('UPDATE providers SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Status updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update admin profile
router.put('/profile', isAdmin, async (req, res) => {
    const { name, email } = req.body;
    try {
        await db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, req.user.id]);
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Service Change Requests ---

// Get all pending service change requests
router.get('/service-change-requests', isAdmin, async (req, res) => {
    try {
        const [requests] = await db.query(`
            SELECT scr.*, u.name as provider_name, p.user_id 
            FROM service_change_requests scr
            JOIN providers p ON scr.provider_id = p.id
            JOIN users u ON p.user_id = u.id
            WHERE scr.status = 'PENDING'
        `);
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Approve or Reject service change request
router.patch('/service-change-requests/:id', isAdmin, async (req, res) => {
    const { status } = req.body; // 'APPROVED' or 'REJECTED'
    const requestId = req.params.id;

    try {
        // 1. Get the request details
        const [requests] = await db.query('SELECT * FROM service_change_requests WHERE id = ?', [requestId]);
        if (requests.length === 0) return res.status(404).json({ message: 'Request not found' });

        const request = requests[0];

        if (status === 'APPROVED') {
            // Update provider's service type
            await db.query('UPDATE providers SET service_type = ? WHERE id = ?', [request.requested_service, request.provider_id]);
            // Update request status
            await db.query('UPDATE service_change_requests SET status = ? WHERE id = ?', ['APPROVED', requestId]);
            res.json({ message: 'Service change approved and updated' });
        } else if (status === 'REJECTED') {
            await db.query('UPDATE service_change_requests SET status = ? WHERE id = ?', ['REJECTED', requestId]);
            res.json({ message: 'Service change rejected' });
        } else {
            res.status(400).json({ message: 'Invalid status' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
