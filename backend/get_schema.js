const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'CourseManagement',
    password: 'Sam@2004',
    port: 5432,
});

pool.query(`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    ORDER BY table_name, ordinal_position;
`).then(res => {
    let currentTable = '';
    for (const row of res.rows) {
        if (row.table_name !== currentTable) {
            console.log('\nTable: ' + row.table_name);
            currentTable = row.table_name;
        }
        console.log(`  ${row.column_name} (${row.data_type})`);
    }
    pool.end();
}).catch(console.error);
