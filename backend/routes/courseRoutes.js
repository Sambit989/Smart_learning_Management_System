const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); // Need to fix export in middleware

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.get('/:id/lessons', authenticateToken, courseController.getCourseLessons); // New route

module.exports = router;
