const express = require('express');
const router = express.Router();
const { getStudyPlan, toggleTask, createTask } = require('../controllers/studyPlanController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getStudyPlan);
router.post('/', authenticateToken, createTask);
router.patch('/:id/toggle', authenticateToken, toggleTask);

module.exports = router;
