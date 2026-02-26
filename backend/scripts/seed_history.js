const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function seedHistory() {
    try {
        console.log('Seeding historical data...');

        // 1. Get ALL students
        const usersRes = await pool.query("SELECT id FROM users WHERE role = 'student'");
        if (usersRes.rows.length === 0) {
            console.log('No student found. Please creates a student first.');
            return;
        }

        console.log(`Seeding history for ${usersRes.rows.length} students...`);

        for (const user of usersRes.rows) {
            const studentId = user.id;
            console.log(`Seeding for student ID: ${studentId}`);

            // 2. Clear old history
            await pool.query('DELETE FROM quiz_scores WHERE student_id = $1', [studentId]);
            await pool.query('DELETE FROM student_activity WHERE student_id = $1', [studentId]);

            await seedDataForStudent(studentId);
        }
    } catch (err) {
        console.error('Error seeding history:', err);
    } finally {
        pool.end();
    }
}

async function seedDataForStudent(studentId) {
    // 3. Generate 8 weeks of data
    const today = new Date();

    // Use a course ID (assuming existing course)
    const courseRes = await pool.query('SELECT id FROM courses LIMIT 1');
    const courseId = courseRes.rows[0]?.id;

    if (!courseId) return;

    for (let i = 0; i < 56; i++) { // 8 weeks * 7 days
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];

        // Random Study Time (0-120 mins)
        if (date.getDay() !== 0 && date.getDay() !== 6) { // Weekdays
            const minutes = Math.floor(Math.random() * 120);
            if (minutes > 10) {
                await pool.query(
                    'INSERT INTO student_activity (student_id, course_id, date, time_spent_minutes) VALUES ($1, $2, $3, $4)',
                    [studentId, courseId, dateString, minutes]
                );
            }
        }
    }

    // Quiz Scores (Weekly)
    for (let w = 0; w < 8; w++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (w * 7));
        // Random Score 60-100
        const score = Math.floor(Math.random() * 40) + 60;
        // Quiz ID? Just mock integers
        await pool.query(
            'INSERT INTO quiz_scores (student_id, quiz_id, score, completed_at) VALUES ($1, $2, $3, $4)',
            [studentId, w + 1, score, date]
        );
    }
}

seedHistory();
