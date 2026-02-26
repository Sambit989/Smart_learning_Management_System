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
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
        console.log(res.rows.map(r => r.column_name));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
