
const express = require('express');
const router = express.Router();
const absenceController = require('../controllers/absenceController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, absenceController.addAbsence);
router.get('/:studentId', auth, absenceController.getStudentAbsences);

module.exports = router;
