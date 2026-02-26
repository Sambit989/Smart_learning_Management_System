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
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'enrollments'");
        console.log("Enrollment Columns:", res.rows.map(r => r.column_name));
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
check();
