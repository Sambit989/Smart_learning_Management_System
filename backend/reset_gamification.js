const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

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

        console.log('Resetting gamification stats for all users...');
        await pool.query(`
            UPDATE users 
            SET xp = 0, streak = 0, level = 1, last_login = NOW() - INTERVAL '1 day';
        `);

        console.log('Clearing all earned badges...');
        await pool.query('DELETE FROM user_badges');

        console.log('Gamification data reset to 0!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
