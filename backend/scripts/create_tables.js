const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function createTables() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS student_activity (
                id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES users(id),
                course_id INTEGER REFERENCES courses(id),
                date DATE DEFAULT CURRENT_DATE,
                time_spent_minutes INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS quiz_scores (
                id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES users(id),
                quiz_id INTEGER,
                score DECIMAL,
                completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS user_badges (
                user_id INTEGER REFERENCES users(id),
                badge_id INTEGER,
                earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, badge_id)
            );
        `);
        console.log("Tables created successfully");
    } catch (err) {
        console.error("Error creating tables:", err);
    } finally {
        pool.end();
    }
}

createTables();
