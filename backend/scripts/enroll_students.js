const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function run() {
    try {
        await pool.connect();
        console.log('Connected to DB');

        // Get course
        const courseRes = await pool.query('SELECT id FROM courses LIMIT 1');
        if (courseRes.rows.length === 0) {
            console.log('No courses found! Create one first.');
            process.exit(1);
        }
        const courseId = courseRes.rows[0].id;
        console.log(`Enrolling all students in Course ID: ${courseId}...`);

        // Get students
        const students = await pool.query("SELECT id FROM users WHERE role = 'student'");

        for (let student of students.rows) {
            await pool.query(
                'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                [student.id, courseId]
            );
        }

        console.log(`Enrolled ${students.rows.length} students!`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
