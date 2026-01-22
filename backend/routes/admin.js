const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    // In a real app, verify JWT here. For now, assume it's passed or handled by main server.
    next();
};

// Get all providers for approval
router.get('/providers', async (req, res) => {
    try {
        const [providers] = await db.query('SELECT p.*, u.name, u.email FROM providers p JOIN users u ON p.user_id = u.id');
        res.json(providers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update provider status
router.patch('/providers/:id/status', async (req, res) => {
    const { status } = req.body; // 'approved', 'blocked', 'pending'
    try {
        await db.query('UPDATE providers SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Status updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
