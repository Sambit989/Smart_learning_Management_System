const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load env from backend folder
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function debugStudent() {
    try {
        console.log('--- Debugging Student Data ---');

        // 1. List all users
        const users = await pool.query('SELECT id, name, email, role FROM users');
        console.log('Users:', users.rows);

        if (users.rows.length === 0) {
            console.log('NO USERS FOUND!');
            return;
        }

        // 2. Pick the first student (assuming the logged in user is one of them)
        const student = users.rows.find(u => u.role === 'student') || users.rows[0];
        console.log(`Checking enrollments for student: ${student.name} (ID: ${student.id})`);

        // 3. Check enrollments
        const enrollments = await pool.query('SELECT * FROM enrollments WHERE student_id = $1', [student.id]);
        console.log('Enrollments:', enrollments.rows);

        // 4. Check courses
        const courses = await pool.query('SELECT id, title FROM courses');
        console.log('All Courses:', courses.rows);

        if (courses.rows.length > 0) {
            console.log('Attempting to enroll ALL students in first course to fix empty dashboard...');
            for (const u of users.rows) {
                if (u.role === 'student') {
                    // Check existing
                    const check = await pool.query('SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2', [u.id, courses.rows[0].id]);
                    if (check.rows.length === 0) {
                        await pool.query('INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2)', [u.id, courses.rows[0].id]);
                        console.log(`Enrolled ${u.name} in ${courses.rows[0].title}`);
                    } else {
                        console.log(`${u.name} already enrolled in ${courses.rows[0].title}`);
                    }
                }
            }
        }

        // Dump all enrollments
        const allEnrollments = await pool.query('SELECT e.*, u.name as student, c.title as course FROM enrollments e JOIN users u ON e.student_id = u.id JOIN courses c ON e.course_id = c.id');
        console.log('ALL ENROLLMENTS:', allEnrollments.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

debugStudent();
