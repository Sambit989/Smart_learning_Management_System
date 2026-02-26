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

async function run() {
    try {
        await pool.connect();

        console.log("Resetting all passwords to '123456'...");
        await pool.query("UPDATE users SET password_hash = '123456'");

        // Ensure Admin exists
        const adminCheck = await pool.query("SELECT * FROM users WHERE role = 'admin'");
        if (adminCheck.rows.length === 0) {
            console.log("Creating admin user...");
            await pool.query("INSERT INTO users (name, email, password_hash, role) VALUES ('Admin User', 'admin@test.com', '123456', 'admin')");
        }

        console.log("Fetching all users...");
        const res = await pool.query("SELECT id, name, email, role, password_hash FROM users ORDER BY id");

        const fs = require('fs');
        let output = "--- User Credentials ---\n";
        res.rows.forEach(u => {
            output += `ID: ${u.id} | Name: ${u.name} | Email: ${u.email} | Role: ${u.role} | Password: ${u.password_hash}\n`;
        });
        output += "------------------------\n";
        fs.writeFileSync('users.txt', output);
        console.log("Written to users.txt");

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
