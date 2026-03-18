const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Get locations
router.get('/locations', async (req, res) => {
    try {
        const expectedLocations = [
            'Bole', 'Piassa', '4 Kilo', '5 Kilo', '6 Kilo', 'Ferensay', 
            'Kazanchis', 'Mexico', 'Megenagna', 'CMC', 'Summit', 'Sarbet', 
            'Gerji', 'Ayat', 'Lebu', 'Bole Bulbula', 'Tafo', 'Akaki Kality', 
            'Tor Hailoch', 'Jemo'
        ];

        let [locations] = await db.query('SELECT name FROM locations ORDER BY name ASC');
        
        // If there are less than 20 locations, it means the DB is missing our full list
        if (locations.length < 20) {
            console.log("Auto-seeding locations to the database...");
            await db.query('TRUNCATE TABLE locations'); // Clear out any old misspelled ones like 'Piazza'
            for (const loc of expectedLocations) {
                await db.query('INSERT INTO locations (name) VALUES (?)', [loc]);
            }
            // Fetch again updated
            [locations] = await db.query('SELECT name FROM locations ORDER BY name ASC');
        }

        res.json(locations.map(r => r.name));
    } catch (err) {
        console.error('Error fetching/seeding locations:', err);
        res.status(500).json({ error: err.message });
    }
});

// Register
router.post('/register', async (req, res) => {
    const { name, email, password, role, location } = req.body;
    try {
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role, location) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, role || 'customer', location || null]
        );

        if (role === 'provider') {
            const { service_type, contact_number, description } = req.body;
            // Note: For providers, the location in providers table is same as the one in users table (the area)
            await db.query(
                'INSERT INTO providers (user_id, service_type, location, contact_number, description) VALUES (?, ?, ?, ?, ?)',
                [result.insertId, service_type, location, contact_number, description]
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

router.put('/change-password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const [users] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, users[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Error changing password:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
