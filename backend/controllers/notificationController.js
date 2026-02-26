const db = require('../config/db');

exports.getNotifications = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await db.query(`
            SELECT * FROM notifications 
            WHERE user_id = $1 
              AND (is_read = FALSE OR (is_read = TRUE AND read_at > NOW() - INTERVAL '24 hours'))
            ORDER BY created_at DESC
        `, [userId]);
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
            'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = $1 AND user_id = $2 AND is_read = FALSE',
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
            'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = $1 AND is_read = FALSE',
            [userId]
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
