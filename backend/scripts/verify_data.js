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

        const courses = await pool.query('SELECT id, title FROM courses');
        console.log('Courses:', courses.rows);

        const quizzes = await pool.query('SELECT id, title, course_id FROM quizzes');
        console.log('Quizzes:', quizzes.rows);

        const enrollments = await pool.query('SELECT count(*) FROM enrollments');
        console.log('Enrollments:', enrollments.rows[0].count);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
