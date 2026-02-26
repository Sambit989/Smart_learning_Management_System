const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'CourseManagement',
    password: 'Sam@2004',
    port: 5432,
});

async function check() {
    try {
        // 1. Find instructor Dr. Smith
        const inst = await pool.query("SELECT id FROM users WHERE email = 'instructor@test.com'");
        if (inst.rows.length === 0) return console.log("Instructor not found");
        const instId = inst.rows[0].id;
        console.log("Instructor ID:", instId);

        // 2. Find instructor's courses
        const courses = await pool.query("SELECT id, title FROM courses WHERE instructor_id = $1", [instId]);
        console.log("Instructor Courses:", courses.rows);

        const courseIds = courses.rows.map(c => c.id);
        if (courseIds.length === 0) return console.log("No courses for this instructor");

        // 3. Find enrollments for these courses
        const enr = await pool.query("SELECT * FROM enrollments WHERE course_id = ANY($1)", [courseIds]);
        console.log("Enrollments found:", enr.rows.length);
        console.table(enr.rows);

        // 4. Test the full query
        const result = await pool.query(`
            SELECT 
                u.id, 
                u.name, 
                string_agg(c.title, ', ') as courses,
                MAX(e.progress) as progress, 
                MAX(e.last_accessed) as "lastActive"
            FROM users u
            JOIN enrollments e ON u.id = e.student_id
            JOIN courses c ON e.course_id = c.id
            WHERE c.instructor_id = $1
            GROUP BY u.id, u.name
        `, [instId]);
        console.log("Full Query Result Count:", result.rows.length);
        console.table(result.rows);

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
check();
