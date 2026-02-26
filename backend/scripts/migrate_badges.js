const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const badges = [
    { id: 1, name: "First Steps", icon: "🎯", description: "Complete your first course" },
    { id: 2, name: "Quiz Master", icon: "🏆", description: "Score 90%+ on 5 quizzes" },
    { id: 3, name: "Streak Hunter", icon: "🔥", description: "7-day learning streak" },
    { id: 4, name: "Data Wizard", icon: "🧙", description: "Complete all Data Science courses" },
    { id: 5, name: "AI Pioneer", icon: "🚀", description: "Complete ML Fundamentals" },
    { id: 6, name: "Night Owl", icon: "🦉", description: "Study past midnight 3 times" },
];

async function run() {
    try {
        await pool.connect();
        console.log('Connected to DB');

        // Create badges table
        console.log('Creating badges table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS badges (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                icon VARCHAR(50) NOT NULL,
                description TEXT NOT NULL
            );
        `);

        // Seed badges
        console.log('Seeding badges...');
        for (const badge of badges) {
            await pool.query(`
                INSERT INTO badges (id, name, icon, description) 
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (id) DO UPDATE SET 
                name = EXCLUDED.name, 
                icon = EXCLUDED.icon,
                description = EXCLUDED.description;
            `, [badge.id, badge.name, badge.icon, badge.description]);
        }

        // Add FK constraint to user_badges if not exists
        // (Optional, strictly speaking, but good for integrity)
        try {
            await pool.query(`
                ALTER TABLE user_badges 
                ADD CONSTRAINT fk_badge 
                FOREIGN KEY (badge_id) 
                REFERENCES badges(id) 
                ON DELETE CASCADE;
            `);
        } catch (e) {
            // Constraint might already exist or data might violate it (unlikely with our seeding)
            console.log('Constraint might already exist, skipping...');
        }

        // Reset sequence so future badges don't conflict
        await pool.query("SELECT setval('badges_id_seq', (SELECT MAX(id) FROM badges))");

        console.log('Badges migrated successfully!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
