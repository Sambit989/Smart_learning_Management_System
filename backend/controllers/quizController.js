const db = require('../config/db');
const axios = require('axios');

exports.createQuiz = async (req, res) => {
    const { courseId, title, totalScore } = req.body;

    try {
        const newQuiz = await db.query(
            'INSERT INTO quizzes (course_id, title, total_score) VALUES ($1, $2, $3) RETURNING *',
            [courseId, title, totalScore]
        );
        res.status(201).json(newQuiz.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.submitQuiz = async (req, res) => {
    const { quizId, score } = req.body;
    const studentId = req.user.id;

    try {
        // 1. Store Quiz Score
        const scoreRecord = await db.query(
            'INSERT INTO quiz_scores (student_id, quiz_id, score) VALUES ($1, $2, $3) RETURNING *',
            [studentId, quizId, score]
        );

        // 2. XP Calculation
        // The system calculates your Experience Points (XP) immediately:
        // Base XP: +50 XP just for completing the quiz.
        // Performance Bonus: +1 XP for every percentage point of your score.
        const xpEarned = 50 + Math.round((score / 100) * 100);

        // 3. Streak Update 🌟
        // The system checks your last_login date:
        const userRes = await db.query('SELECT xp, streak, last_login FROM users WHERE id = $1', [studentId]);
        let { xp, streak, last_login } = userRes.rows[0];

        const now = new Date();
        const lastDate = new Date(last_login).toDateString();
        const todayDate = now.toDateString();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDate = yesterday.toDateString();

        // If you were active yesterday: Your Streak increases by 1
        if (lastDate === yesterdayDate) {
            streak += 1;
        }
        // If you missed a day: Your Streak resets to 1
        else if (lastDate !== todayDate) {
            streak = 1;
        }
        // If you already played today: Your Streak stays the same.

        // Finally, your last_login timestamp is updated to right now (in update query).

        // 4. Level Up 🆙
        // Your new Total XP is checked against the level threshold (500 XP per level).
        // Formula: Level = floor(Total XP / 500) + 1
        const newXp = (xp || 0) + xpEarned;
        const newLevel = Math.floor(newXp / 500) + 1;

        await db.query(
            'UPDATE users SET xp = $1, level = $2, streak = $3, last_login = NOW() WHERE id = $4',
            [newXp, newLevel, streak, studentId]
        );

        // 5. Badge Verification 🏆
        const newBadges = [];

        // "First Steps": Awarded if this is your 1st quiz submission.
        const quizCount = await db.query('SELECT COUNT(*) FROM quiz_scores WHERE student_id = $1', [studentId]);
        if (parseInt(quizCount.rows[0].count) === 1) {
            await awardBadge(studentId, 1, newBadges);
        }

        // "Quiz Master": Awarded if you've scored ≥90% on 5 quizzes.
        const highScores = await db.query('SELECT COUNT(*) FROM quiz_scores WHERE student_id = $1 AND score >= 90', [studentId]);
        if (parseInt(highScores.rows[0].count) >= 5) {
            await awardBadge(studentId, 2, newBadges);
        }

        // "Streak Hunter": Awarded if your streak reaches 7 days.
        if (streak >= 7) {
            await awardBadge(studentId, 3, newBadges);
        }

        // "Night Owl": Awarded if you submitted between 12 AM - 4 AM.
        const hour = now.getHours();
        if (hour >= 0 && hour < 4) {
            await awardBadge(studentId, 6, newBadges);
        }

        // Call ML Service (Fire and Forget)
        try {
            axios.post(`${process.env.ML_SERVICE_URL}/predict-performance`, {
                quiz_score: score,
                time_spent: 60, // Mock
                login_freq: streak
            }).catch(err => console.error("ML Service Error (Async):", err.message));
        } catch (e) { }

        // 6. Instant Feedback
        res.status(201).json({
            ...scoreRecord.rows[0],
            xpEarned,
            newLevel,
            newBadges,
            streak
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

async function awardBadge(userId, badgeId, newBadgesList) {
    try {
        await db.query('INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2)', [userId, badgeId]);
        newBadgesList.push(badgeId);
    } catch (err) {
        // Ignore duplicate key error (already has badge)
    }
}

exports.getQuizzesByCourse = async (req, res) => {
    const { courseId } = req.params;
    try {
        const quizzes = await db.query('SELECT * FROM quizzes WHERE course_id = $1', [courseId]);
        res.json(quizzes.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getQuizQuestions = async (req, res) => {
    const { quizId } = req.params;
    try {
        // Fetch questions for the quiz
        // Assuming we have a 'questions' table. If not, I'll need to create it or mock it if strictly requested dynamic from DB.
        // Let's assume for now we might need to fallback to dummy if table doesn't exist, but the goal is "all dynamic".
        // I will check schema first.
        const questions = await db.query('SELECT * FROM questions WHERE quiz_id = $1', [quizId]);

        // Transform options if stored as JSON or string
        const formattedQuestions = questions.rows.map(q => ({
            ...q,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
        }));

        res.json(formattedQuestions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAvailableQuizzes = async (req, res) => {
    const studentId = req.user.id;
    try {
        const quizzes = await db.query(`
            SELECT q.*, c.title as course_title 
            FROM quizzes q
            JOIN enrollments e ON q.course_id = e.course_id
            JOIN courses c ON c.id = e.course_id
            WHERE e.student_id = $1
        `, [studentId]);
        res.json(quizzes.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
