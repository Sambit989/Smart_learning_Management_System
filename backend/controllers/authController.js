const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Plain text password storage
        const newUser = await db.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, password, role]
        );

        const token = jwt.sign(
            { id: newUser.rows[0].id, role: newUser.rows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({ token, user: { id: newUser.rows[0].id, name: newUser.rows[0].name, email: newUser.rows[0].email, role: newUser.rows[0].role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if role matches (retained from original logic)
        if (role && user.role !== role) {
            return res.status(403).json({ message: `Access denied. Please log in as ${user.role}.` });
        }

        // Plain text comparison as requested
        if (password !== user.password_hash) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
