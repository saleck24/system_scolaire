const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const upload = require('../middleware/uploadMiddleware');

/**
 * Routes pour la gestion des cours et supports pédagogiques
 */

router.get('/', courseController.getAllCourses);        // Liste des cours
router.get('/:id', courseController.getCourseById);     // Détails d'un cours
router.post('/', upload.single('file'), courseController.createCourse); // Téléversement d'un cours
router.delete('/:id', courseController.deleteCourse);   // Suppression d'un cours

module.exports = router;
