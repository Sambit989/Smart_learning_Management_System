const db = require('../config/db');

exports.getStudyPlan = async (req, res) => {
    const studentId = req.user.id;
    const { date } = req.query; // Expecting YYYY-MM-DD
    try {
        let query = 'SELECT * FROM study_plans WHERE student_id = $1';
        const params = [studentId];

        if (date) {
            query += ' AND date = $2';
            params.push(date);
        } else {
            query += ' AND date = CURRENT_DATE';
        }

        query += ' ORDER BY id ASC';

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.toggleTask = async (req, res) => {
    // ... (keeps same)
    const { id } = req.params;
    const studentId = req.user.id;
    try {
        const result = await db.query(
            'UPDATE study_plans SET completed = NOT completed WHERE id = $1 AND student_id = $2 RETURNING *',
            [id, studentId]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Task not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createTask = async (req, res) => {
    const studentId = req.user.id;
    const { title, time, category, date } = req.body;

    if (!title) return res.status(400).json({ message: 'Title is required' });

    try {
        const insertDate = date || new Date().toISOString().split('T')[0];
        const result = await db.query(
            'INSERT INTO study_plans (student_id, title, time, category, completed, date) VALUES ($1, $2, $3, $4, false, $5) RETURNING *',
            [studentId, title, time || 'Flexible', category || 'General', insertDate]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
