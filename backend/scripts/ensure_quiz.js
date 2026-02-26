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

async function checkQuizzes() {
    try {
        const res = await pool.query('SELECT * FROM quizzes');
        console.log(`Found ${res.rows.length} quizzes.`);
        if (res.rows.length === 0) {
            console.log("No quizzes. Creating one...");
            // Need a course
            const courseRes = await pool.query('SELECT id FROM courses LIMIT 1');
            if (courseRes.rows.length > 0) {
                const courseId = courseRes.rows[0].id;
                const newQuiz = await pool.query(
                    'INSERT INTO quizzes (course_id, title, total_score) VALUES ($1, $2, $3) RETURNING id',
                    [courseId, 'Initial Assessment', 100]
                );
                console.log(`Created quiz ${newQuiz.rows[0].id}`);

                // Add questions?
                const quizId = newQuiz.rows[0].id;
                await pool.query(`
                    INSERT INTO questions (quiz_id, question, options, correct, difficulty, hint, explanation)
                    VALUES ($1, 'What is 2+2?', '["3", "4", "5", "6"]', 1, 'Easy', 'Count on fingers', '2 plus 2 equals 4')
                `, [quizId]);
            }
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

checkQuizzes();
