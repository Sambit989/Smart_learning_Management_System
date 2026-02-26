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

async function checkActivity() {
    try {
        const today = new Date().toISOString().split('T')[0];
        console.log(`Checking activity for today: ${today}`);

        const res = await pool.query(
            "SELECT u.name, sa.time_spent_minutes FROM student_activity sa JOIN users u ON sa.student_id = u.id WHERE sa.date = $1",
            [today]
        );

        if (res.rows.length === 0) {
            console.log("No activity recorded for today yet.");
        } else {
            console.log("Active Students Today:");
            console.table(res.rows);
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

checkActivity();
