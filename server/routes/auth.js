const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Default users data
const defaultUsers = {
    student: {
        username: 'student',
        password: 'student123',
        role: 'student',
        full_name: 'Juan Dela Cruz',
        email: 'student@adfc.edu',
        student_id: '2023-00001'
    },
    admin: {
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        full_name: 'System Administrator',
        email: 'admin@adfc.edu'
    },
    cashier: {
        username: 'cashier',
        password: 'cashier123',
        role: 'cashier',
        full_name: 'Maria Santos',
        email: 'cashier@adfc.edu'
    }
};

// Login endpoint
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        // Check default credentials first
        for (const [role, user] of Object.entries(defaultUsers)) {
            if (username === user.username && password === user.password) {
                const { password: _, ...userWithoutPassword } = user;
                return res.json({
                    message: 'Login successful',
                    user: userWithoutPassword
                });
            }
        }

        // Check database as fallback
        const [results] = await db.execute(
            'SELECT * FROM users WHERE username = ?', 
            [username]
        );

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = results[0];
        
        // Simple password check
        if (password === user.password) {
            const { password: _, ...userWithoutPassword } = user;
            res.json({
                message: 'Login successful',
                user: userWithoutPassword
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Signup endpoint
router.post('/signup', async (req, res) => {
    const { firstName, lastName, email, studentId, program, yearLevel, username, password } = req.body;

    if (!firstName || !lastName || !email || !studentId || !program || !yearLevel || !username || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check if username already exists
        const [existingUsers] = await db.execute(
            'SELECT * FROM users WHERE username = ? OR email = ? OR student_id = ?',
            [username, email, studentId]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'Username, email, or student ID already exists' });
        }

        // Insert new user
        const [result] = await db.execute(
            'INSERT INTO users (full_name, email, student_id, program, year_level, username, password, role, balance) VALUES (?, ?, ?, ?, ?, ?, ?, "student", 0)',
            [`${firstName} ${lastName}`, email, studentId, program, yearLevel, username, password]
        );

        res.json({
            message: 'Account created successfully',
            user: {
                id: result.insertId,
                full_name: `${firstName} ${lastName}`,
                email,
                student_id: studentId,
                program,
                year_level: yearLevel,
                username,
                role: 'student',
                balance: 0
            }
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;