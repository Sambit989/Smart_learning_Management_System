const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.use(authorizeRole('instructor'));

router.get('/courses', instructorController.getInstructorCourses);
router.post('/courses', instructorController.createCourse);
router.put('/courses/:id', instructorController.updateCourse);
router.delete('/courses/:id', instructorController.deleteCourse);

// Lesson Management
router.get('/courses/:courseId/lessons', instructorController.getLessons);
router.post('/courses/:courseId/lessons', instructorController.addLesson);
router.delete('/lessons/:id', instructorController.deleteLesson);

router.get('/students', instructorController.getInstructorStudents);
router.get('/stats', instructorController.getInstructorStats);

module.exports = router;
