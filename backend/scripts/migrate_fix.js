const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    user: 'postgres', host: 'localhost', database: 'CourseManagement', password: 'Sam@2004', port: 5432,
});

async function migrate() {
    try {
        console.log("Checking enrollments table...");
        await pool.query("ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
        await pool.query("ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0");
        console.log("Enrollments table fixed.");

        console.log("Checking courses table...");
        await pool.query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS category VARCHAR(100)");
        await pool.query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail VARCHAR(255)");
        await pool.query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS level VARCHAR(50)");
        await pool.query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS price DECIMAL");
        console.log("Courses table fixed.");

    } catch (e) {
        console.error("Migration Error:", e.message);
    } finally {
        pool.end();
    }
}
migrate();
