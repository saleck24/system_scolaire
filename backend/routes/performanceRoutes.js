
const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, performanceController.addPerformance);
router.get('/:studentId', auth, performanceController.getStudentPerformances);

module.exports = router;
