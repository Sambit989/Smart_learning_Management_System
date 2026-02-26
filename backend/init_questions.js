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

const createTableQuery = `
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct INTEGER NOT NULL,
    difficulty VARCHAR(50),
    hint TEXT,
    explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const seedQuizQuery = `
INSERT INTO quizzes (course_id, title, total_score) 
SELECT id, 'General Knowledge Quiz', 100 FROM courses LIMIT 1
RETURNING id;
`;

const seedQuestionsQuery = `
INSERT INTO questions (quiz_id, question, options, correct, difficulty, hint, explanation) VALUES
($1, 'What is the time complexity of binary search?', '["O(n)", "O(log n)", "O(n²)", "O(1)"]', 1, 'Easy', 'Think about how the search space is divided.', 'Binary search divides the search space in half each time, resulting in O(log n).'),
($1, 'Which algorithm is used for finding shortest paths in weighted graphs?', '["BFS", "DFS", "Dijkstra''s", "Prim''s"]', 2, 'Medium', 'It''s a greedy algorithm named after a Dutch computer scientist.', 'Dijkstra''s algorithm finds shortest paths from source to all vertices in weighted graphs.'),
($1, 'What is overfitting in machine learning?', '["Model is too simple", "Model memorizes training data", "Model has high bias", "Model is underperforming"]', 1, 'Medium', 'The model works great on training data but...', 'Overfitting occurs when a model learns noise in training data, performing poorly on unseen data.')
;
`;

async function run() {
    try {
        await pool.connect();
        console.log("Creating table...");
        await pool.query(createTableQuery);

        console.log("Seeding quiz...");
        // Check if we have any quizzes
        let quizId;
        const quizRes = await pool.query('SELECT id FROM quizzes LIMIT 1');
        if (quizRes.rows.length === 0) {
            // Need to ensure we have a course first, if not, create one?
            // Assuming courses exist from previous steps or manual entry.
            // If no courses, this might fail. Let's try to get a course.
            const courseRes = await pool.query('SELECT id FROM courses LIMIT 1');
            let courseId;
            if (courseRes.rows.length === 0) {
                const newCourse = await pool.query("INSERT INTO courses (title, description) VALUES ('Demo Course', 'A demo course') RETURNING id");
                courseId = newCourse.rows[0].id;
            } else {
                courseId = courseRes.rows[0].id;
            }

            const newQuiz = await pool.query('INSERT INTO quizzes (course_id, title, total_score) VALUES ($1, $2, $3) RETURNING id', [courseId, 'Demo Quiz', 100]);
            quizId = newQuiz.rows[0].id;
        } else {
            quizId = quizRes.rows[0].id;
        }

        console.log(`Seeding questions for Quiz ID: ${quizId}...`);
        await pool.query(seedQuestionsQuery, [quizId]);

        console.log("Done!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
