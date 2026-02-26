const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'CourseManagement',
    password: 'Sam@2004',
    port: 5432,
});

async function check() {
    try {
        const res = await pool.query("SELECT * FROM courses LIMIT 1");
        console.log("Columns:", Object.keys(res.rows[0] || {}));
        console.log("Sample Row:", res.rows[0]);
    } catch (e) {
        console.error("Error checking courses table:", e.message);
        // If it fails, let's try to list all columns
        const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'courses'");
        console.log("All Columns in courses table:", cols.rows.map(r => r.column_name));
    } finally {
        pool.end();
    }
}
check();
