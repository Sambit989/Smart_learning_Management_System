const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'CourseManagement',
    password: 'Sam@2004',
    port: 5432,
});

async function inspect() {
    await client.connect();

    console.log('--- Users ---');
    const users = await client.query('SELECT id, name, email, role, password_hash FROM users');
    console.log(users.rows);

    client.end();
}

inspect();
