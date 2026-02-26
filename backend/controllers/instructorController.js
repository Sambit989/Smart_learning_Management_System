const db = require('../config/db');

// Get Courses
exports.getInstructorCourses = async (req, res) => {
    const instructorId = req.user.id;
    try {
        const result = await db.query('SELECT * FROM courses WHERE instructor_id = $1', [instructorId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create Course
exports.createCourse = async (req, res) => {
    const { title, description, category } = req.body;
    const instructor_id = req.user.id;

    try {
        console.log(`[InstructorController] Creating course: ${title} for instructor ${instructor_id}`);
        // Ensure all possible columns exist (Robust safety)
        const schemaUpdates = [
            'ALTER TABLE courses ADD COLUMN IF NOT EXISTS category VARCHAR(100)',
            'ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail VARCHAR(255)',
            'ALTER TABLE courses ADD COLUMN IF NOT EXISTS level VARCHAR(50) DEFAULT \'Beginner\'',
            'ALTER TABLE courses ADD COLUMN IF NOT EXISTS price DECIMAL DEFAULT 0'
        ];

        for (const sql of schemaUpdates) {
            try { await db.query(sql); } catch (e) { /* ignore */ }
        }

        const result = await db.query(
            'INSERT INTO courses (title, description, instructor_id, category) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, description, instructor_id, category || 'Development']
        );
        console.log(`[InstructorController] Course created successfully: ${result.rows[0].id}`);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('[InstructorController] Create Course Error:', err);
        res.status(500).json({
            message: 'Failed to create course.',
            error: err.message
        });
    }
};

// Get Students
exports.getInstructorStudents = async (req, res) => {
    const instructorId = req.user.id;
    try {
        console.log(`[InstructorController] Fetching students for instructor: ${instructorId}`);

        // Ensure column exists just in case (Safe schema check)
        await db.query("ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP");

        const result = await db.query(`
            SELECT 
                u.id, 
                u.name, 
                string_agg(c.title, ', ') as courses,
                MAX(e.progress) as progress, 
                MAX(e.last_accessed) as "lastActive",
                (SELECT ROUND(AVG(score)) FROM quiz_scores WHERE student_id = u.id) as "quizAvg"
            FROM users u
            JOIN enrollments e ON u.id = e.student_id
            JOIN courses c ON e.course_id = c.id
            WHERE c.instructor_id = $1
            GROUP BY u.id, u.name
            ORDER BY "lastActive" DESC NULLS LAST
        `, [instructorId]);

        console.log(`[InstructorController] Found ${result.rows.length} enrolled students`);

        const studentsWithRisk = result.rows.map(s => {
            const lastActiveDate = s.lastActive ? new Date(s.lastActive) : null;
            const daysSinceActive = lastActiveDate ? (new Date() - lastActiveDate) / (1000 * 60 * 60 * 24) : 999;
            const progress = parseInt(s.progress) || 0;
            const quizAvg = parseInt(s.quizAvg) || 0;

            let risk = 'low';
            if (progress < 20 && daysSinceActive > 7) risk = 'high';
            else if (progress < 50 && daysSinceActive > 3) risk = 'medium';
            else if (quizAvg < 60) risk = 'high';

            return {
                id: s.id,
                name: s.name,
                course: s.courses,
                progress,
                quizAvg,
                risk,
                lastActive: s.lastActive
            };
        });

        res.json(studentsWithRisk);
    } catch (err) {
        console.error('[InstructorController] Get Students Error:', err);
        res.status(500).json({ message: 'Failed to fetch student data', error: err.message });
    }
};

// Instructor Stats
exports.getInstructorStats = async (req, res) => {
    const instructorId = req.user.id;
    try {
        const courses = await db.query('SELECT id FROM courses WHERE instructor_id = $1', [instructorId]);
        const courseIds = courses.rows.map(c => c.id);

        let totalStudents = 0;
        let engagementData = [];
        let avgCompletion = 0;

        if (courseIds.length > 0) {
            // Total Students
            const studentsResult = await db.query(`
                SELECT COUNT(DISTINCT student_id) 
                FROM enrollments 
                WHERE course_id = ANY($1)
            `, [courseIds]);
            totalStudents = parseInt(studentsResult.rows[0].count);

            // Avg Completion
            const progressResult = await db.query(`
                SELECT AVG(progress) 
                FROM enrollments 
                WHERE course_id = ANY($1)
            `, [courseIds]);
            avgCompletion = Math.round(parseFloat(progressResult.rows[0].avg) || 0);

            // Engagement Data
            const engagementQuery = await db.query(`
                WITH days AS (
                    SELECT generate_series(
                        CURRENT_DATE - INTERVAL '6 days',
                        CURRENT_DATE,
                        '1 day'::interval
                    )::date as day
                )
                SELECT 
                    to_char(d.day, 'Dy') as day_name,
                    COUNT(sa.id) as views,
                    (SELECT COUNT(*) FROM quiz_scores qs WHERE date(qs.completed_at) = d.day) as completions
                FROM days d
                LEFT JOIN student_activity sa ON sa.date = d.day AND sa.course_id = ANY($1)
                GROUP BY d.day
                ORDER BY d.day
            `, [courseIds]);

            engagementData = engagementQuery.rows.map(r => ({
                day: r.day_name,
                views: parseInt(r.views),
                completions: parseInt(r.completions)
            }));
        }

        if (engagementData.length === 0) {
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            engagementData = days.map(d => ({ day: d, views: 0, completions: 0 }));
        }

        // At risk count (Safe schema check)
        await db.query("ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP");

        const atRiskResult = await db.query(`
            SELECT COUNT(*) FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            WHERE c.instructor_id = $1 AND (e.progress < 20 AND e.last_accessed < NOW() - INTERVAL '7 days')
        `, [instructorId]);

        res.json({
            totalStudents,
            activeCourses: courses.rows.length,
            atRisk: parseInt(atRiskResult.rows[0].count),
            avgCompletion: `${avgCompletion}%`,
            engagementData
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
// Update Course
exports.updateCourse = async (req, res) => {
    const { title, description, category, price, thumbnail, level } = req.body;
    const { id } = req.params;
    const instructorId = req.user.id;

    try {
        const result = await db.query(
            'UPDATE courses SET title = COALESCE($1, title), description = COALESCE($2, description), category = COALESCE($3, category), price = COALESCE($4, price), thumbnail = COALESCE($5, thumbnail), level = COALESCE($6, level) WHERE id = $7 AND instructor_id = $8 RETURNING *',
            [title, description, category, price, thumbnail, level, id, instructorId]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Course not found or unauthorized' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete Course
exports.deleteCourse = async (req, res) => {
    const { id } = req.params;
    const instructorId = req.user.id;

    try {
        const result = await db.query('DELETE FROM courses WHERE id = $1 AND instructor_id = $2 RETURNING *', [id, instructorId]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Course not found or unauthorized' });
        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Lesson Management ---

exports.getLessons = async (req, res) => {
    const { courseId } = req.params;
    const instructorId = req.user.id;
    try {
        // Verify ownership
        const course = await db.query('SELECT id FROM courses WHERE id = $1 AND instructor_id = $2', [courseId, instructorId]);
        if (course.rows.length === 0) return res.status(404).json({ message: 'Course not found' });

        const result = await db.query('SELECT * FROM lessons WHERE course_id = $1 ORDER BY "order" ASC', [courseId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addLesson = async (req, res) => {
    const { courseId } = req.params;
    const { title, duration, type, video_url } = req.body;
    const instructorId = req.user.id;

    try {
        const course = await db.query('SELECT id FROM courses WHERE id = $1 AND instructor_id = $2', [courseId, instructorId]);
        if (course.rows.length === 0) return res.status(404).json({ message: 'Course not found' });

        const maxOrder = await db.query('SELECT MAX("order") as max FROM lessons WHERE course_id = $1', [courseId]);
        const nextOrder = (maxOrder.rows[0].max || 0) + 1;

        const result = await db.query(
            'INSERT INTO lessons (course_id, title, duration, type, video_url, "order") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [courseId, title, duration, type, video_url, nextOrder]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteLesson = async (req, res) => {
    const { id } = req.params;
    const instructorId = req.user.id;

    try {
        const result = await db.query(`
            DELETE FROM lessons 
            WHERE id = $1 AND course_id IN (SELECT id FROM courses WHERE instructor_id = $2)
            RETURNING *
        `, [id, instructorId]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Lesson not found' });
        res.json({ message: 'Lesson deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
