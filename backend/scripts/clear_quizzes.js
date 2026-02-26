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

async function clearQuizScores() {
    try {
        console.log('Clearing quiz scores...');
        await pool.query('DELETE FROM quiz_scores');
        console.log('Quiz scores cleared.');
    } catch (err) {
        console.error('Error clearing quiz scores:', err);
    } finally {
        pool.end();
    }
}

clearQuizScores();
