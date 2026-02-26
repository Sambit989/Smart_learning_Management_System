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

async function run() {
    try {
        await pool.connect();
        console.log('Connected to DB');

        // Add columns to users table
        console.log('Adding specific columns to users table...');
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
            ADD COLUMN IF NOT EXISTS avatar VARCHAR(50) DEFAULT '🎓';
        `);

        // Create user_badges table
        console.log('Creating user_badges table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_badges (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                badge_id INTEGER NOT NULL,
                earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, badge_id)
            );
        `);

        // Seed some data for existing users to make leaderboard dynamic
        console.log('Seeding gamification data...');
        const users = await pool.query('SELECT id FROM users');

        for (let user of users.rows) {
            const xp = Math.floor(Math.random() * 5000);
            const streak = Math.floor(Math.random() * 30);
            const level = Math.floor(xp / 500) + 1;
            const avatars = ['👨‍💻', '👩‍💻', '👨‍🎓', '👩‍🎓', '🚀', '🧙‍♂️'];
            const avatar = avatars[Math.floor(Math.random() * avatars.length)];

            await pool.query(
                'UPDATE users SET xp = $1, streak = $2, level = $3, avatar = $4 WHERE id = $5',
                [xp, streak, level, avatar, user.id]
            );

            // Give some badges
            if (xp > 1000) {
                await pool.query('INSERT INTO user_badges (user_id, badge_id) VALUES ($1, 1) ON CONFLICT DO NOTHING', [user.id]);
            }
            if (streak > 5) {
                await pool.query('INSERT INTO user_badges (user_id, badge_id) VALUES ($1, 3) ON CONFLICT DO NOTHING', [user.id]);
            }
        }

        console.log('Done!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
