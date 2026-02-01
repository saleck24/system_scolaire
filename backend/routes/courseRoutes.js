const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

router.get('/', auth, courseController.getAllCourses);
router.get('/:id', auth, courseController.getCourseById);
router.post('/', auth, upload.single('file'), courseController.createCourse);
router.delete('/:id', auth, courseController.deleteCourse);

module.exports = router;
