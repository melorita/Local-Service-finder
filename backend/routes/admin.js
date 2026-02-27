const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err || (user.role !== 'admin' && user.role !== 'super_admin')) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const isSuperAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err || user.role !== 'super_admin') return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Get all providers for approval
router.get('/providers', isAdmin, async (req, res) => {
    try {
        let query = 'SELECT p.*, u.name, u.email FROM providers p JOIN users u ON p.user_id = u.id';
        let params = [];
        let conditions = [];

        // Regional Control
        if (req.user.role === 'admin') {
            const [adminData] = await db.query('SELECT region FROM users WHERE id = ?', [req.user.id]);
            if (adminData.length > 0 && adminData[0].region) {
                conditions.push('p.location LIKE ?');
                params.push(`%${adminData[0].region}%`);
            } else {
                conditions.push('p.id = -1');
            }
        } else if (req.user.role === 'super_admin' && req.query.region) {
            conditions.push('p.location LIKE ?');
            params.push(`%${req.query.region}%`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        const [providers] = await db.query(query, params);
        res.json(providers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all users
router.get('/users', isAdmin, async (req, res) => {
    try {
        let query = 'SELECT id, name, email, role, region, created_at FROM users';
        let params = [];
        let conditions = [];

        if (req.user.role === 'admin') {
            const [adminData] = await db.query('SELECT region FROM users WHERE id = ?', [req.user.id]);
            if (adminData.length > 0 && adminData[0].region) {
                conditions.push('region = ?');
                params.push(adminData[0].region);
                conditions.push('role IN ("customer", "provider")');
            } else {
                conditions.push('id = -1');
            }
        } else if (req.user.role === 'super_admin') {
            if (req.query.region) {
                conditions.push('region = ?');
                params.push(req.query.region);
            }
            if (req.query.role) {
                conditions.push('role = ?');
                params.push(req.query.role);
            }
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        const [users] = await db.query(query, params);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update provider status
router.patch('/providers/:id/status', isAdmin, async (req, res) => {
    const { status } = req.body; // 'approved', 'blocked', 'pending'
    try {
        // Regional Control
        if (req.user.role === 'admin') {
            const [adminData] = await db.query('SELECT region FROM users WHERE id = ?', [req.user.id]);
            const [providerData] = await db.query('SELECT location FROM providers WHERE id = ?', [req.params.id]);

            if (adminData.length > 0 && providerData.length > 0) {
                const adminRegion = adminData[0].region;
                const providerLocation = providerData[0].location;

                if (adminRegion && !providerLocation.toLowerCase().includes(adminRegion.toLowerCase())) {
                    return res.status(403).json({ message: 'Unauthorized: You can only manage providers in your region.' });
                }
            }
        }

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
        let query = `
            SELECT scr.*, u.name as provider_name, p.user_id, p.location
            FROM service_change_requests scr
            JOIN providers p ON scr.provider_id = p.id
            JOIN users u ON p.user_id = u.id
            WHERE scr.status = 'PENDING'
        `;
        let params = [];

        // Regional Control
        if (req.user.role === 'admin') {
            const [adminData] = await db.query('SELECT region FROM users WHERE id = ?', [req.user.id]);
            if (adminData.length > 0 && adminData[0].region) {
                query += ' AND p.location LIKE ?';
                params.push(`%${adminData[0].region}%`);
            } else {
                query += ' AND p.id = -1';
            }
        } else if (req.user.role === 'super_admin' && req.query.region) {
            query += ' AND p.location LIKE ?';
            params.push(`%${req.query.region}%`);
        }

        const [requests] = await db.query(query, params);
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
        const [requests] = await db.query(`
            SELECT scr.*, p.location 
            FROM service_change_requests scr 
            JOIN providers p ON scr.provider_id = p.id 
            WHERE scr.id = ?
        `, [requestId]);

        if (requests.length === 0) return res.status(404).json({ message: 'Request not found' });

        const request = requests[0];

        // Regional Control
        if (req.user.role === 'admin') {
            const [adminData] = await db.query('SELECT region FROM users WHERE id = ?', [req.user.id]);
            if (adminData.length > 0) {
                const adminRegion = adminData[0].region;
                if (adminRegion && !request.location.toLowerCase().includes(adminRegion.toLowerCase())) {
                    return res.status(403).json({ message: 'Unauthorized: You can only manage requests in your region.' });
                }
            }
        }

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

// Create new admin (Super Admin only)
router.post('/create-admin', isSuperAdmin, async (req, res) => {
    const { name, email, password, region } = req.body;

    try {
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ message: 'Email already in use' });

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (name, email, password, role, region) VALUES (?, ?, ?, "admin", ?)',
            [name, email, hashedPassword, region]
        );
        if (region) {
            await db.query('INSERT IGNORE INTO regions (name) VALUES (?)', [region]);
        }

        res.status(201).json({ message: 'Admin account created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
