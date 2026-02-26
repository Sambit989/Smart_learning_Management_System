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

async function addMockActivity() {
    try {
        const userRes = await pool.query("SELECT id FROM users WHERE role = 'student' LIMIT 1");
        if (userRes.rows.length === 0) {
            console.log('No student found.');
            return;
        }

        const date19th = '2026-02-19';
        const minutes = 145;

        for (const user of userRes.rows) {
            console.log(`Adding 19th activity for student ID: ${user.id}`);
            await pool.query(`
                INSERT INTO student_activity (student_id, date, time_spent_minutes) 
                VALUES ($1, $2, $3)
            `, [user.id, date19th, minutes]);
        }

        console.log('Mock activity for Feb 19th added successfully!');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

addMockActivity();
