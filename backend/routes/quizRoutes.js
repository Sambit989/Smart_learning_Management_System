const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, authorizeRole('instructor'), quizController.createQuiz);
// Protected routes
router.get('/available', authenticateToken, quizController.getAvailableQuizzes);
router.get('/course/:courseId', authenticateToken, quizController.getQuizzesByCourse);
router.get('/:quizId/questions', authenticateToken, quizController.getQuizQuestions);
router.post('/submit', authenticateToken, quizController.submitQuiz);

module.exports = router;
