const db = require('../config/db');

// Leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT id, name, xp, streak, avatar, role 
            FROM users 
            WHERE role = 'student' 
            ORDER BY xp DESC 
            LIMIT 10
        `);

        // Add rank
        const leaderboard = result.rows.map((user, index) => ({
            ...user,
            rank: index + 1
        }));

        res.json(leaderboard);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Badges
exports.getBadges = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM badges ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Enrolled Courses
exports.getEnrolledCourses = async (req, res) => {
    const studentId = req.user.id;
    const { search } = req.query;
    try {
        let query = `
            SELECT c.*, e.progress 
            FROM courses c
            JOIN enrollments e ON c.id = e.course_id
            WHERE e.student_id = $1
        `;
        const params = [studentId];

        if (search) {
            query += ` AND (c.title ILIKE $2 OR c.description ILIKE $2)`;
            params.push(`%${search}%`);
        }

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Course Recommendations
exports.getRecommendations = async (req, res) => {
    const studentId = req.user.id;
    const { search } = req.query;
    try {
        let query = `
            SELECT * FROM courses 
            WHERE id NOT IN (SELECT course_id FROM enrollments WHERE student_id = $1)
        `;
        const params = [studentId];

        if (search) {
            query += ` AND (title ILIKE $2 OR description ILIKE $2)`;
            params.push(`%${search}%`);
        }

        query += ` LIMIT 5`;

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Enroll in Course
exports.enrollCourse = async (req, res) => {
    const { courseId } = req.body;
    const studentId = req.user.id;

    try {
        // Check if already enrolled
        const check = await db.query('SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2', [studentId, courseId]);
        if (check.rows.length > 0) {
            return res.status(400).json({ message: 'Already enrolled' });
        }

        await db.query('INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2)', [studentId, courseId]);
        res.status(201).json({ message: 'Enrolled successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Student Stats
exports.getStudentStats = async (req, res) => {
    const studentId = req.user.id;
    try {
        const enrolled = await db.query('SELECT COUNT(*) FROM enrollments WHERE student_id = $1', [studentId]);
        const quizzes = await db.query('SELECT COUNT(DISTINCT quiz_id) FROM quiz_scores WHERE student_id = $1', [studentId]);
        const avgScore = await db.query('SELECT AVG(score) FROM quiz_scores WHERE student_id = $1', [studentId]);
        const user = await db.query('SELECT * FROM users WHERE id = $1', [studentId]);
        const userData = user.rows[0] || { xp: 0, streak: 0, level: 1 };

        // Real Study Hours Logic (Simplified for brevity, can import from helper or copy full logic if needed)
        // Copying full logic to ensure "working remain same"
        const studyHoursQuery = await db.query(`
            WITH weeks AS (
                SELECT generate_series(
                    date_trunc('week', CURRENT_DATE - INTERVAL '7 weeks'),
                    date_trunc('week', CURRENT_DATE),
                    '1 week'::interval
                ) as week_start
            )
            SELECT w.week_start, COALESCE(SUM(sa.time_spent_minutes), 0) / 60.0 as hours
            FROM weeks w
            LEFT JOIN student_activity sa ON date_trunc('week', sa.date) = w.week_start AND sa.student_id = $1
            GROUP BY w.week_start
            ORDER BY w.week_start
        `, [studentId]);

        // Fetch daily data for the same period
        const dailyStudyHoursQuery = await db.query(`
            SELECT date, COALESCE(SUM(time_spent_minutes), 0) / 60.0 as hours
            FROM student_activity
            WHERE student_id = $1 AND date >= CURRENT_DATE - INTERVAL '8 weeks'
            GROUP BY date
            ORDER BY date
        `, [studentId]);

        // Format dates as "DD MMM" (e.g., "12 Oct")
        const formatDate = (date) => {
            const d = new Date(date);
            return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
        };

        const formatDateRange = (start, end) => {
            const s = new Date(start);
            const e = new Date(end);
            const sMonth = s.toLocaleString('default', { month: 'short' });
            const eMonth = e.toLocaleString('default', { month: 'short' });
            if (sMonth === eMonth) {
                return `${s.getDate()}-${e.getDate()} ${sMonth}`;
            }
            return `${s.getDate()} ${sMonth} - ${e.getDate()} ${eMonth}`;
        };

        const studyHours = studyHoursQuery.rows.map(r => {
            const week_start = new Date(r.week_start);
            const week_end = new Date(week_start);
            week_end.setDate(week_end.getDate() + 6);

            // Filter daily data for this week
            const days = [];
            for (let i = 0; i < 7; i++) {
                const currentDay = new Date(week_start);
                currentDay.setDate(currentDay.getDate() + i);
                const dateStr = currentDay.toISOString().split('T')[0];

                const dayData = dailyStudyHoursQuery.rows.find(d =>
                    new Date(d.date).toISOString().split('T')[0] === dateStr
                );

                days.push({
                    day: formatDate(currentDay),
                    date: formatDate(currentDay),
                    hours: dayData ? parseFloat(dayData.hours).toFixed(1) : "0.0"
                });
            }

            return {
                week: formatDate(r.week_start),
                hours: parseFloat(r.hours).toFixed(1),
                days
            };
        });

        const quizTrendQuery = await db.query(`
            WITH weeks AS (
                SELECT generate_series(
                    date_trunc('week', CURRENT_DATE - INTERVAL '7 weeks'),
                    date_trunc('week', CURRENT_DATE),
                    '1 week'::interval
                ) as week_start
            )
            SELECT w.week_start, COALESCE(AVG(qs.score), 0) as avg_score
            FROM weeks w
            LEFT JOIN quiz_scores qs ON date_trunc('week', qs.completed_at) = w.week_start AND qs.student_id = $1
            GROUP BY w.week_start
            ORDER BY w.week_start
        `, [studentId]);

        const quizTrend = quizTrendQuery.rows.map(r => ({
            week: formatDate(r.week_start),
            score: Math.round(parseFloat(r.avg_score))
        }));

        res.json({
            courses: parseInt(enrolled.rows[0].count),
            quizzesDone: parseInt(quizzes.rows[0].count),
            avgScore: parseFloat(avgScore.rows[0].avg || 0).toFixed(1),
            xp: userData.xp || 0,
            streak: userData.streak || 0,
            level: userData.level || 1,
            quizTrend,
            studyHours,
            badges: (await db.query('SELECT badge_id, earned_at FROM user_badges WHERE user_id = $1', [studentId])).rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Record Activity (Time Spent)
exports.recordActivity = async (req, res) => {
    const studentId = req.user.id;
    const { minutes } = req.body; // e.g. 1 minute

    if (!minutes || minutes <= 0) return res.status(400).json({ message: 'Invalid duration' });

    try {
        const today = new Date().toISOString().split('T')[0];

        // Check if record exists for today (course_id null for general activity)
        const check = await db.query(
            'SELECT id, time_spent_minutes FROM student_activity WHERE student_id = $1 AND date = $2 AND course_id IS NULL',
            [studentId, today]
        );

        if (check.rows.length > 0) {
            // Update
            await db.query(
                'UPDATE student_activity SET time_spent_minutes = time_spent_minutes + $1 WHERE id = $2',
                [minutes, check.rows[0].id]
            );
        } else {
            // Insert
            await db.query(
                'INSERT INTO student_activity (student_id, course_id, date, time_spent_minutes) VALUES ($1, NULL, $2, $3)',
                [studentId, today, minutes]
            );
        }
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
// Profile
exports.getProfile = async (req, res) => {
    const studentId = req.user.id;
    try {
        const result = await db.query(
            'SELECT name, email, avatar, xp, streak, level, created_at FROM users WHERE id = $1',
            [studentId]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    const studentId = req.user.id;
    const { name, avatar } = req.body;
    try {
        const result = await db.query(
            'UPDATE users SET name = COALESCE($1, name), avatar = COALESCE($2, avatar) WHERE id = $3 RETURNING name, email, avatar, xp, streak, level, created_at',
            [name, avatar, studentId]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
