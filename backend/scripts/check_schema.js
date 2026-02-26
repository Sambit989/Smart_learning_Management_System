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

async function checkSchema() {
    try {
        console.log('Checking enrollments schema...');
        const res = await pool.query('SELECT * FROM enrollments LIMIT 1');
        if (res.rows.length > 0) {
            console.log('Columns:', Object.keys(res.rows[0]));
        } else {
            console.log('No rows in enrollments. Cannot check columns easily.');
            // Fallback: Check information_schema
            const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'enrollments'");
            console.log('Information Schema Columns:', cols.rows.map(r => r.column_name));
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

checkSchema();
