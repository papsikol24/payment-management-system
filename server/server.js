const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', authRoutes);

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// API route to get dashboard data
app.get('/api/dashboard', async (req, res) => {
    try {
        const [totalResult] = await db.execute(
            'SELECT SUM(amount) as total_collected FROM payments WHERE status = "completed"'
        );
        
        const [successResult] = await db.execute(
            'SELECT COUNT(*) as successful_payments FROM payments WHERE status = "completed"'
        );
        
        const [pendingResult] = await db.execute(
            'SELECT COUNT(*) as pending_payments FROM payments WHERE status = "pending"'
        );
        
        const [overdueResult] = await db.execute(
            'SELECT COUNT(*) as overdue_payments FROM payments WHERE status = "pending" AND due_date < CURDATE()'
        );
        
        const [transactionsResult] = await db.execute(
            `SELECT p.*, u.full_name, u.student_id 
             FROM payments p 
             JOIN users u ON p.student_id = u.id 
             ORDER BY p.payment_date DESC 
             LIMIT 5`
        );

        const dashboardData = {
            total_collected: totalResult[0].total_collected || 0,
            successful_payments: successResult[0].successful_payments,
            pending_payments: pendingResult[0].pending_payments,
            overdue_payments: overdueResult[0].overdue_payments,
            recent_transactions: transactionsResult
        };

        res.json(dashboardData);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Make sure MySQL is running and database '${process.env.DB_NAME}' exists`);
});