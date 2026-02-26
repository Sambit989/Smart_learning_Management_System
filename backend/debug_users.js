const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'CourseManagement',
    password: 'Sam@2004',
    port: 5432,
});

async function debugUsers() {
    try {
        const res = await pool.query('SELECT id, email, password_hash, role FROM users');
        console.log(JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugUsers();
