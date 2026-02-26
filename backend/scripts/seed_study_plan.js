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

async function seedStudyPlan() {
    try {
        console.log('Creating study_plans table if not exists...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS study_plans (
                id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES users(id),
                title VARCHAR(255) NOT NULL,
                time VARCHAR(50),
                category VARCHAR(50),
                completed BOOLEAN DEFAULT FALSE,
                date DATE DEFAULT CURRENT_DATE
            )
        `);

        // Get all students
        const studentsRes = await pool.query("SELECT id FROM users WHERE role = 'student'");
        const students = studentsRes.rows;

        const plans = [
            { title: 'Review Python Chapter 5', time: '9:00 AM', category: 'Reading' },
            { title: 'Complete ML Quiz 3', time: '11:00 AM', category: 'Quiz' },
            { title: 'Watch Neural Networks Lecture', time: '2:00 PM', category: 'Video' },
            { title: 'Practice coding exercises', time: '4:00 PM', category: 'Practice' },
            { title: 'Review Statistics notes', time: '6:00 PM', category: 'Reading' }
        ];

        console.log(`Seeding plans for ${students.length} students...`);

        for (const student of students) {
            // Check if student already has plans for today
            const check = await pool.query("SELECT count(*) FROM study_plans WHERE student_id = $1 AND date = CURRENT_DATE", [student.id]);

            if (parseInt(check.rows[0].count) === 0) {
                console.log(`Inserting tasks for student ${student.id}`);
                for (const p of plans) {
                    await pool.query(
                        "INSERT INTO study_plans (student_id, title, time, category, completed) VALUES ($1, $2, $3, $4, false)",
                        [student.id, p.title, p.time, p.category]
                    );
                }
            } else {
                console.log(`Student ${student.id} already has a plan for today.`);
            }
        }

        console.log('Study plans seeded successfully!');
    } catch (err) {
        console.error('Error seeding study plans:', err);
    } finally {
        pool.end();
    }
}

seedStudyPlan();
