const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' }); // Adjust path if running from scripts folder

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'CourseManagement',
    password: 'Sam@2004',
    port: 5432,
});

const generateData = async () => {
    try {
        console.log('Connecting to DB...');
        await pool.connect();

        console.log('Cleaning up old data...');
        await pool.query('DROP TABLE IF EXISTS notifications');
        await pool.query('DROP TABLE IF EXISTS lessons');
        await pool.query('DROP TABLE IF EXISTS study_plans');
        await pool.query('DROP TABLE IF EXISTS student_activity');
        await pool.query('DROP TABLE IF EXISTS quiz_scores');
        await pool.query('DELETE FROM enrollments');
        await pool.query('DELETE FROM courses');
        await pool.query('DELETE FROM users');

        // 1. Alter Users Table to add Gamification columns
        console.log('Updating Users Schema...');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(50) DEFAULT \'🎓\'');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

        // 1. Create Users
        console.log('Creating Users...');
        // Plain text password as per current auth controller logic
        const password = '123456';

        const instructor = await pool.query(
            "INSERT INTO users (name, email, password_hash, role, avatar, created_at) VALUES ('Dr. Smith', 'instructor@test.com', $1, 'instructor', '👨‍🏫', NOW() - INTERVAL '6 months') RETURNING id",
            [password]
        );
        const instructorId = instructor.rows[0].id;

        // Create Leaderboard Users
        await pool.query("INSERT INTO users (name, email, password_hash, role, xp, streak, avatar) VALUES ('Alice Johnson', 'alice.j@test.com', $1, 'student', 4850, 21, '👩‍💻')", [password]);
        await pool.query("INSERT INTO users (name, email, password_hash, role, xp, streak, avatar) VALUES ('Bob Smith', 'bob@test.com', $1, 'student', 4200, 15, '👨‍🎓')", [password]);

        // This is "You" (The main demo user)
        const student1 = await pool.query(
            "INSERT INTO users (name, email, password_hash, role, xp, streak, avatar) VALUES ('Alex Student', 'student@test.com', $1, 'student', 3900, 12, '🎓') RETURNING id",
            [password]
        );
        const studentId = student1.rows[0].id;

        await pool.query("INSERT INTO users (name, email, password_hash, role, xp, streak, avatar) VALUES ('Diana Prince', 'diana@test.com', $1, 'student', 3650, 9, '👩‍🔬')", [password]);
        await pool.query("INSERT INTO users (name, email, password_hash, role, xp, streak, avatar) VALUES ('Eve Williams', 'eve@test.com', $1, 'student', 3000, 5, '👩‍🏫')", [password]);

        // Create Admin User
        await pool.query("INSERT INTO users (name, email, password_hash, role, avatar) VALUES ('System Admin', 'admin@test.com', $1, 'admin', '👨‍💼')", [password]);

        // 2. Create Courses
        console.log('Creating Courses...');
        const courses = [
            { title: 'Intro to Python', desc: 'Basics of Python' },
            { title: 'Data Science 101', desc: 'Intro to Data Science' },
            { title: 'Machine Learning', desc: 'ML Algorithms' }
        ];

        let courseIds = [];
        for (const c of courses) {
            const res = await pool.query(
                "INSERT INTO courses (title, description, instructor_id) VALUES ($1, $2, $3) RETURNING id",
                [c.title, c.desc, instructorId]
            );
            courseIds.push(res.rows[0].id);
        }

        // Create Tables for gamification/features
        console.log('Creating Schema...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS student_activity (
                id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES users(id),
                course_id INTEGER REFERENCES courses(id),
                time_spent_minutes INTEGER DEFAULT 0,
                login_frequency INTEGER DEFAULT 0,
                date DATE DEFAULT CURRENT_DATE,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS quiz_scores (
                id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES users(id),
                quiz_id INTEGER, 
                score INTEGER,
                completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS study_plans (
                id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES users(id),
                title VARCHAR(255) NOT NULL,
                time VARCHAR(50),
                category VARCHAR(50),
                completed BOOLEAN DEFAULT FALSE,
                date DATE DEFAULT CURRENT_DATE
            )
        `);
        await pool.query('DELETE FROM study_plans');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS lessons (
                id SERIAL PRIMARY KEY,
                course_id INTEGER REFERENCES courses(id),
                title VARCHAR(255) NOT NULL,
                duration VARCHAR(50),
                type VARCHAR(50),
                video_url VARCHAR(255),
                "order" INTEGER
            )
        `);
        await pool.query('DELETE FROM lessons');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50),
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await pool.query('DELETE FROM notifications');

        await pool.query("ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0");
        await pool.query("ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP");

        // Enroll all students and generate Activity/Scores
        console.log('Generating Data for ALL Students...');
        const allStudentsRes = await pool.query("SELECT id FROM users WHERE role = 'student'");
        const allStudentIds = allStudentsRes.rows.map(row => row.id);

        for (const sid of allStudentIds) {
            // Enroll in random courses
            for (const cid of courseIds) {
                if (Math.random() > 0.1) { // 90% chance
                    await pool.query(
                        "INSERT INTO enrollments (student_id, course_id, enrolled_at, progress, last_accessed) VALUES ($1, $2, NOW() - INTERVAL '2 months', $3, NOW() - ($4 || ' days')::INTERVAL)",
                        [sid, cid, Math.floor(Math.random() * 100), Math.floor(Math.random() * 14)]
                    );
                }
            }

            // Historical Activity
            for (let i = 0; i < 8; i++) {
                const weeksAgo = 7 - i;
                await pool.query(
                    "INSERT INTO student_activity (student_id, course_id, time_spent_minutes, date) VALUES ($1, $2, $3, CURRENT_DATE - ($4 || ' weeks')::INTERVAL)",
                    [sid, courseIds[0], Math.floor(Math.random() * 300) + 60, weeksAgo]
                );
            }

            // Quiz Scores
            for (let i = 0; i < 8; i++) {
                const weeksAgo = 7 - i;
                await pool.query(
                    "INSERT INTO quiz_scores (student_id, quiz_id, score, completed_at) VALUES ($1, $2, $3, NOW() - ($4 || ' weeks')::INTERVAL)",
                    [sid, 1, Math.floor(Math.random() * 40) + 60, weeksAgo]
                );
            }

            // Study Plans
            const plans = [
                { title: 'Review Python Chapter 5', time: '9:00 AM', category: 'Reading' },
                { title: 'Complete ML Quiz 3', time: '11:00 AM', category: 'Quiz' },
                { title: 'Watch Neural Networks Lecture', time: '2:00 PM', category: 'Video' },
                { title: 'Practice coding exercises', time: '4:00 PM', category: 'Practice' },
                { title: 'Review Statistics notes', time: '6:00 PM', category: 'Reading' }
            ];

            for (const p of plans) {
                await pool.query(
                    "INSERT INTO study_plans (student_id, title, time, category, completed) VALUES ($1, $2, $3, $4, $5)",
                    [sid, p.title, p.time, p.category, false]
                );
            }

            // Notifications
            const notifications = [
                { title: "New Badge Earned", message: "You've earned the 'Fast Learner' badge!", type: "success" },
                { title: "Course Reminder", message: "Continue your 'Intro to Python' course.", type: "info" },
                { title: "System Update", message: "Platform maintenance scheduled for tonight.", type: "warning" },
                { title: "Quiz Result", message: "You scored 90% on your last quiz!", type: "success" }
            ];

            for (const n of notifications) {
                await pool.query(
                    "INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)",
                    [sid, n.title, n.message, n.type]
                );
            }
        }

        // Create Lessons (for courses)
        console.log('Creating Lessons...');
        const lessonData = [
            { title: "Course Introduction", duration: "5:20", type: "video" },
            { title: "Setting Up Environment", duration: "12:45", type: "video" },
            { title: "Core Concepts", duration: "15:30", type: "video" },
            { title: "First Practical Exercise", duration: "25:00", type: "practice" },
            { title: "Summary & Quiz", duration: "10:00", type: "quiz" },
        ];

        for (const courseId of courseIds) {
            let order = 1;
            for (const l of lessonData) {
                await pool.query(
                    'INSERT INTO lessons (course_id, title, duration, type, "order") VALUES ($1, $2, $3, $4, $5)',
                    [courseId, l.title, l.duration, l.type, order++]
                );
            }
        }

        console.log('Data Generation Complete!');
        process.exit(0);

    } catch (err) {
        console.error('Error generating data:', err);
        process.exit(1);
    }
};

generateData();
