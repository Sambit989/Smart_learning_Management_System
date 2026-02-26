const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'CourseManagement',
    password: 'Sam@2004',
    port: 5432,
});

client.connect()
    .then(() => {
        console.log('Successfully connected to database "CourseManagement"');
        client.end();
    })
    .catch(err => {
        console.error('Connection failed:', err.message);
        client.end();
    });
