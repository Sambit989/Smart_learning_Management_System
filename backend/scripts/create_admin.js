const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
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
        const hashedPassword = await bcrypt.hash('123456', 10);

        // Upsert admin user
        await pool.query(`
            INSERT INTO users (name, email, password_hash, role, xp, level, streak, avatar)
            VALUES ('Admin User', 'admin@test.com', $1, 'admin', 0, 1, 0, 'https://github.com/shadcn.png')
            ON CONFLICT (email) 
            DO UPDATE SET role = 'admin', password_hash = $1
        `, [hashedPassword]);

        console.log('Admin user created: admin@test.com / 123456');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
