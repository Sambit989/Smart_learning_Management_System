const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/courses', studentController.getEnrolledCourses);
router.get('/recommendations', studentController.getRecommendations);
router.post('/enroll', studentController.enrollCourse);
router.get('/stats', studentController.getStudentStats);
router.post('/activity', studentController.recordActivity);
router.get('/leaderboard', studentController.getLeaderboard);
router.get('/badges', studentController.getBadges);
router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateProfile);

module.exports = router;
