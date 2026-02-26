const db = require('../config/db');

exports.getNotifications = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await db.query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.markAsRead = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    try {
        await db.query(
            'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
            [id, userId]
        );
        res.json({ message: 'Notification marked as read' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.markAllAsRead = async (req, res) => {
    const userId = req.user.id;
    try {
        await db.query(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
            [userId]
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
