const { Pool } = require('pg');
const fs = require('fs');
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
    let output = '';
    let currentTable = '';
    for (const row of res.rows) {
        if (row.table_name !== currentTable) {
            output += '\nTable: ' + row.table_name + '\n';
            currentTable = row.table_name;
        }
        output += `  ${row.column_name} (${row.data_type})\n`;
    }
    fs.writeFileSync('schema_utf8.txt', output, 'utf-8');
    pool.end();
}).catch(console.error);
