const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: 'Password must include uppercase, lowercase, numbers, and special characters' });
        }

        // Check if user exists
        const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Assign role (default to 'user' if not specified, only allow admin if expressly provided for setup)
        const userRole = role === 'admin' ? 'admin' : 'user';

        // Insert user
        const newUser = await db.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, passwordHash, userRole]
        );

        res.status(201).json({ message: 'User registered successfully', user: newUser.rows[0] });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT
        const payload = {
            id: user.id,
            role: user.role
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' },
            (err, token) => {
                if (err) throw err;

                // Set HttpOnly cookie
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production', // Use secure in production
                    sameSite: 'strict',
                    maxAge: 24 * 60 * 60 * 1000 // 1 day
                });

                res.json({
                    token, // Keep sending token for backwards compatibility during migration
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            }
        );
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// Logout (Clear Cookie)
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

// Admin: Get all users
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const result = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a user (Admin or Self)
router.delete('/users/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const requestingUser = req.user;

        // Authorization check: Only the user themselves or an admin can delete
        if (requestingUser.id !== parseInt(id) && requestingUser.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this user' });
        }

        // Check if target user is an admin
        const targetUserResult = await db.query('SELECT role FROM users WHERE id = $1', [id]);
        if (targetUserResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (targetUserResult.rows[0].role === 'admin') {
            return res.status(403).json({ message: 'Admin accounts cannot be deleted' });
        }

        // Get a dedicated client for the transaction
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            // Manual Cascade 1: Delete all votes cast by this user
            await client.query('DELETE FROM votes WHERE user_id = $1', [id]);

            // Manual Cascade 2: Nullify the created_by field for polls this user created
            await client.query('UPDATE polls SET created_by = NULL WHERE created_by = $1', [id]);

            // Finally: Delete the user
            const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

            await client.query('COMMIT');

            console.log(`User ${id} deletion attempt. Rows affected: ${result.rowCount}`);
            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// Update a user (Admin or Self)
router.put('/users/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password } = req.body;
        const requestingUser = req.user;

        // Authorization check: Only the user themselves or an admin can update
        if (requestingUser.id !== parseInt(id) && requestingUser.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this user' });
        }

        // Validation
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: 'Please enter a valid email address' });
            }
            // Check for duplicate email (excluding current user)
            const duplicateCheck = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
            if (duplicateCheck.rows.length > 0) {
                return res.status(400).json({ message: 'Email is already taken by another account' });
            }
        }

        // Prepare update query dynamically based on provided fields
        const updates = [];
        const values = [];
        let queryIdx = 1;

        if (name) {
            updates.push(`name = $${queryIdx}`);
            values.push(name);
            queryIdx++;
        }

        if (email) {
            updates.push(`email = $${queryIdx}`);
            values.push(email);
            queryIdx++;
        }

        if (password) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (password.length < 8) {
                return res.status(400).json({ message: 'Password must be at least 8 characters long' });
            }
            if (!passwordRegex.test(password)) {
                return res.status(400).json({ message: 'Password must include uppercase, lowercase, numbers, and special characters' });
            }

            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            updates.push(`password_hash = $${queryIdx}`);
            values.push(passwordHash);
            queryIdx++;
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields provided to update' });
        }

        values.push(id); // For the WHERE clause
        const query = `
            UPDATE users 
            SET ${updates.join(', ')} 
            WHERE id = $${queryIdx} 
            RETURNING id, name, email, role
        `;

        const result = await db.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User updated successfully', user: result.rows[0] });

    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

module.exports = router;
