const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    user: 'postgres', host: 'localhost', database: 'CourseManagement', password: 'Sam@2004', port: 5432,
});

async function check() {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'student_activity'");
    res.rows.forEach(r => console.log(r.column_name));
    pool.end();
}
check();
