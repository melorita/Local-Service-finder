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

module.exports = router;
