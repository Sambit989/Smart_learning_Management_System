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

async function migrate() {
    try {
        console.log('Running migration...');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(50) DEFAULT \'🎓\'');
        console.log('Migration successful!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        pool.end();
    }
}

migrate();
