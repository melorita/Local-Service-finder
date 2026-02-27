const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Get regions
router.get('/regions', async (req, res) => {
    try {
        const [regions] = await db.query('SELECT name FROM regions ORDER BY name ASC');
        res.json(regions.map(r => r.name));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Register
router.post('/register', async (req, res) => {
    const { name, email, password, role, region } = req.body;
    try {
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role, region) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, role || 'customer', region || null]
        );

        if (role === 'provider') {
            const { service_type, location, contact_number, description } = req.body;
            await db.query(
                'INSERT INTO providers (user_id, service_type, location, contact_number, description) VALUES (?, ?, ?, ?, ?)',
                [result.insertId, service_type, location || region, contact_number, description]
            );
        }

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        console.log('Login attempt for:', email);
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            console.log('User not found in database');
            return res.status(400).json({ message: 'User not found' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            console.log('Invalid credentials for:', email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!process.env.JWT_SECRET) {
            console.error('CRITICAL: JWT_SECRET is not defined in .env');
            throw new Error('Server configuration error: JWT_SECRET is missing');
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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

router.put('/profile', authenticateToken, async (req, res) => {
    const { name, email } = req.body;
    try {
        await db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, req.user.id]);
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ message: 'Error updating profile', error: err.message });
    }
});

module.exports = router;
