const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Protect all routes
router.use(authenticateToken);
router.use(authorizeRole('admin'));

router.get('/users', adminController.getAllUsers);
router.post('/users/status', adminController.toggleUserStatus);
router.post('/users/role', adminController.updateUserRole);

// Cleaned up routes
router.get('/courses', adminController.getAllCourses);
router.get('/courses/:courseId/students', adminController.getCourseStudents);
router.delete('/courses/:courseId', adminController.deleteCourse);
router.get('/reports', adminController.getSystemReports);
router.get('/stats', adminController.getAdminStats);

module.exports = router;
