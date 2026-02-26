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
        console.log('Connected to DB');

        console.log('Adding last_login to users table...');
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        `);

        console.log('Done!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
