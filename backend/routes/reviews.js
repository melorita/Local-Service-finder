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

// Post a review
router.post('/', authenticateToken, async (req, res) => {
    const { provider_id, rating, comment } = req.body;
    const customer_id = req.user.id;

    if (req.user.role !== 'customer') {
        return res.status(403).json({ message: 'Only customers can leave reviews' });
    }

    try {
        await db.query(
            'INSERT INTO reviews (customer_id, provider_id, rating, comment) VALUES (?, ?, ?, ?)',
            [customer_id, provider_id, rating, comment]
        );

        // Update provider's average rating
        const [avgResult] = await db.query(
            'SELECT AVG(rating) as avgRating FROM reviews WHERE provider_id = ?',
            [provider_id]
        );

        await db.query(
            'UPDATE providers SET rating = ? WHERE id = ?',
            [avgResult[0].avgRating, provider_id]
        );

        res.status(201).json({ message: 'Review submitted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
