const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'CourseManagement',
    password: 'Sam@2004',
    port: 5432,
});

async function check() {
    try {
        const courses = await pool.query('SELECT * FROM courses');
        console.log(`Courses found: ${courses.rows.length}`);
        courses.rows.forEach(c => console.log(`- ${c.title} (ID: ${c.id})`));

        const lessons = await pool.query('SELECT * FROM lessons');
        console.log(`Lessons found: ${lessons.rows.length}`);

        const users = await pool.query('SELECT * FROM users');
        console.log(`Users found: ${users.rows.length}`);

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

check();
