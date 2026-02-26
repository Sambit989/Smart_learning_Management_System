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

async function clearHistory() {
    try {
        console.log('Clearing student activity...');

        // Delete all student activity
        await pool.query('DELETE FROM student_activity');

        // Also delete quiz scores if they want "not randomly"
        // But maybe they want to keep quiz scores?
        // User said "wealky study hour ... show that things only".
        // I'll clear activity only.

        console.log('Student activity cleared. Charts will be empty until you stay on the page.');
    } catch (err) {
        console.error('Error clearing history:', err);
    } finally {
        pool.end();
    }
}

clearHistory();
