const db = require('../config/db');

// Public / General Course Methods
exports.getAllCourses = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM courses');
        // Add student count to each course
        const courses = await Promise.all(result.rows.map(async (course) => {
            const count = await db.query('SELECT COUNT(*) FROM enrollments WHERE course_id = $1', [course.id]);
            return { ...course, students_count: parseInt(count.rows[0].count) };
        }));
        res.json(courses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCourseById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM courses WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCourseLessons = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM lessons WHERE course_id = $1 ORDER BY "order" ASC', [id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
