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

async function addProgress() {
    try {
        console.log('Adding progress column...');
        await pool.query('ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0');
        console.log('Progress column added successfully');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

addProgress();
