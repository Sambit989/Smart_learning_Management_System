const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.connect()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch(err => console.error('Database connection error:', err.stack));

// Routes
// Routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const quizRoutes = require('./routes/quizRoutes');

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes')); // Keeps public /api/courses
app.use('/api/quiz', require('./routes/quizRoutes'));
app.use('/api/study-plan', require('./routes/studyPlanRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// New Modules
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/instructor', require('./routes/instructorRoutes'));

app.get('/', (req, res) => {
    res.send('Smart Course Management API is running');
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = { app, pool };
