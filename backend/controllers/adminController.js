const db = require('../config/db');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await db.query('SELECT id, name, email, role, status, xp, streak, level, last_login, created_at FROM users ORDER BY created_at DESC');
        res.json(users.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.toggleUserStatus = async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await db.query('SELECT status FROM users WHERE id = $1', [userId]);
        if (user.rows.length === 0) return res.status(404).json({ message: 'User not found' });

        const newStatus = user.rows[0].status === 'banned' ? 'active' : 'banned';
        await db.query('UPDATE users SET status = $1 WHERE id = $2', [newStatus, userId]);

        res.json({ message: `User ${newStatus}`, status: newStatus });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        if (role === 'admin') {
            return res.status(403).json({ message: 'Cannot create additional admin accounts.' });
        }

        // Plain text or standard hash as per the current auth setup (using plain text for simplicity per your setup earlier)
        const check = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (check.rows.length > 0) return res.status(400).json({ message: 'User already exists' });

        const result = await db.query(
            "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, status, xp, streak, level, avatar, created_at",
            [name, email, password || '123456', role || 'student']
        );

        const newUser = result.rows[0];

        // 1. Push notification to the new Student/User separately
        await db.query(`
            INSERT INTO notifications (user_id, title, message, type)
            VALUES ($1, $2, $3, $4)
        `, [newUser.id, 'Welcome Aboard!', `Welcome ${name}, your admin has successfully set up your ${role} account.`, 'success']);

        // 2. Push notification to the Instructors separately
        if (newUser.role === 'student') {
            const instructors = await db.query("SELECT id FROM users WHERE role = 'instructor'");
            const instructorValues = instructors.rows.map(inst => `(${inst.id}, 'New Student Joined', 'Admin added a new student: ${name}.', 'info')`).join(',');

            if (instructorValues) {
                await db.query(`
                    INSERT INTO notifications (user_id, title, message, type)
                    VALUES ${instructorValues}
                `);
            }
        }

        res.status(201).json(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateUserRole = async (req, res) => {
    const { userId, role } = req.body;
    const validRoles = ['student', 'instructor', 'admin'];

    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    try {
        await db.query('UPDATE users SET role = $1 WHERE id = $2', [role, userId]);
        res.json({ message: `User role updated to ${role}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllCourses = async (req, res) => {
    try {
        const courses = await db.query(`
            SELECT c.id, c.title, c.description, c.created_at, u.name as instructor_name, 
            (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as students_count
            FROM courses c
            JOIN users u ON c.instructor_id = u.id
            ORDER BY c.created_at DESC
        `);
        res.json(courses.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteCourse = async (req, res) => {
    const { courseId } = req.params;
    try {
        await db.query('DELETE FROM courses WHERE id = $1', [courseId]); // Cascades via FK ideally, or need to delete related
        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getSystemReports = async (req, res) => {
    try {
        // Fetch recent student activity (Dynamic)
        // LEFT JOIN courses ensures that even general platform activity (where course_id is NULL) is returned.
        const recentActivityQuery = await db.query(`
            SELECT sa.id, u.name as user, COALESCE(c.title, 'General Platform Learning') as course, COALESCE(sa.updated_at, sa.date) as date, sa.time_spent_minutes
            FROM student_activity sa
            JOIN users u ON sa.student_id = u.id
            LEFT JOIN courses c ON sa.course_id = c.id
            ORDER BY sa.updated_at DESC NULLS LAST, sa.date DESC LIMIT 50
        `);

        // Fetch recent dynamic system logs/notifications
        const systemLogsQuery = await db.query(`
            SELECT id, title, message, type, created_at
            FROM notifications
            ORDER BY created_at DESC LIMIT 20
        `);

        // Calculate pending issues (warnings/alerts in the last 24 hours)
        const pendingIssuesQuery = await db.query(`
            SELECT COUNT(*) as count
            FROM notifications 
            WHERE (type = 'warning' OR type = 'alert') 
              AND created_at > NOW() - INTERVAL '24 hours'
        `);

        res.json({
            recentActivity: recentActivityQuery.rows,
            systemLogs: systemLogsQuery.rows,
            pendingIssues: parseInt(pendingIssuesQuery.rows[0].count)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCourseStudents = async (req, res) => {
    const { courseId } = req.params;
    try {
        const students = await db.query(`
            SELECT u.id, u.name, u.email, u.avatar, e.progress, e.enrolled_at, e.last_accessed
            FROM enrollments e
            JOIN users u ON e.student_id = u.id
            WHERE e.course_id = $1
            ORDER BY e.progress DESC
        `, [courseId]);
        res.json(students.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAdminStats = async (req, res) => {
    try {
        const users = await db.query('SELECT COUNT(*) FROM users');
        const courses = await db.query('SELECT COUNT(*) FROM courses');

        // Real User Growth
        const userGrowthQuery = await db.query(`
            WITH months AS (
                SELECT generate_series(
                    date_trunc('month', CURRENT_DATE - INTERVAL '5 months'),
                    date_trunc('month', CURRENT_DATE),
                    '1 month'::interval
                ) as month_start
            )
            SELECT 
                to_char(m.month_start, 'Mon') as month_name,
                COUNT(u.id) as new_users
            FROM months m
            LEFT JOIN users u ON date_trunc('month', u.created_at) = m.month_start
            GROUP BY m.month_start
            ORDER BY m.month_start
        `);

        let cumulative = 0;
        const userGrowth = userGrowthQuery.rows.map(r => {
            cumulative += parseInt(r.new_users);
            return { month: r.month_name, users: cumulative };
        });

        // Compute Monthly Growth (comparing new users this month vs last month)
        let monthlyGrowth = 0;
        if (userGrowthQuery.rows.length >= 6) {
            const thisMonth = parseInt(userGrowthQuery.rows[5].new_users);
            const lastMonth = parseInt(userGrowthQuery.rows[4].new_users);
            if (lastMonth > 0) {
                monthlyGrowth = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
            } else if (thisMonth > 0) {
                monthlyGrowth = 100;
            }
        }

        // Real Course Distribution
        const courseDistributionQuery = await db.query(`
            WITH categorized_courses AS (
                SELECT 
                    CASE 
                        WHEN title ILIKE '%React%' OR title ILIKE '%Web%' OR title ILIKE '%Frontend%' THEN 'Web Dev'
                        WHEN title ILIKE '%Data%' OR title ILIKE '%Python%' THEN 'Data Science'
                        WHEN title ILIKE '%Machine%' OR title ILIKE '%AI%' THEN 'AI/ML'
                        ELSE 'General'
                    END as category
                FROM courses
            )
            SELECT category, COUNT(*) as count
            FROM categorized_courses
            GROUP BY category
        `);

        const colors = {
            'Web Dev': "hsl(142, 76%, 36%)",
            'Data Science': "hsl(239, 84%, 67%)",
            'AI/ML': "hsl(24, 95%, 53%)",
            'General': "hsl(199, 89%, 48%)"
        };

        const courseDistribution = courseDistributionQuery.rows.map(r => ({
            name: r.category,
            value: parseInt(r.count),
            color: colors[r.category] || colors['General']
        }));

        // Real Average Completion Rate
        const progressRes = await db.query('SELECT AVG(progress) as avg FROM enrollments');
        const completionRate = progressRes.rows[0].avg ? Math.round(parseFloat(progressRes.rows[0].avg)) : 0;

        // Real Dropout Rate (no access in last 30 days)
        const dropoutRes = await db.query(`
            SELECT 
                (COUNT(*) FILTER (WHERE last_accessed < NOW() - INTERVAL '30 days') * 100.0 / NULLIF(COUNT(*), 0)) as rate
            FROM enrollments
        `);
        const dropoutRate = dropoutRes.rows[0]?.rate ? Math.round(parseFloat(dropoutRes.rows[0].rate)) : 0;

        res.json({
            totalUsers: parseInt(users.rows[0].count),
            activeCourses: parseInt(courses.rows[0].count),
            completionRate,
            dropoutRate,
            monthlyGrowth,
            userGrowth,
            courseDistribution
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.broadcastNotification = async (req, res) => {
    const { title, message, type, audience } = req.body;
    try {
        let audienceFilter = "";
        const queryParams = [];

        if (audience === 'student') {
            audienceFilter = "WHERE role = 'student'";
        } else if (audience === 'instructor') {
            audienceFilter = "WHERE role = 'instructor'";
        }

        const usersQuery = await db.query(`SELECT id FROM users ${audienceFilter}`);
        const userIds = usersQuery.rows.map(row => row.id);

        if (userIds.length > 0) {
            // Build bulk insert string
            // Limit chunking if too large, but for typical simple size this works dynamically
            const valuesString = userIds.map((id, index) => {
                const baseIdx = index * 4;
                return `($${baseIdx + 1}, $${baseIdx + 2}, $${baseIdx + 3}, $${baseIdx + 4})`;
            }).join(', ');

            const flatValues = [];
            userIds.forEach(id => {
                flatValues.push(id, title, message, type || 'info');
            });

            await db.query(`
                INSERT INTO notifications (user_id, title, message, type)
                VALUES ${valuesString}
            `, flatValues);

            res.json({ message: 'Notifications sent successfully', count: userIds.length });
        } else {
            res.status(404).json({ message: 'No users found for this audience' });
        }

    } catch (err) {
        console.error("Broadcast err", err);
        res.status(500).json({ message: 'Server error' });
    }
};
