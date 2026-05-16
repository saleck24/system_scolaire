const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

/**
 * Routes pour la gestion des élèves
 * Note : Les middlewares auth et activity sont appliqués au niveau global dans index.js
 */

router.get('/', studentController.getAllStudents);      // Liste des élèves
router.post('/', studentController.createStudent);      // Création
router.get('/:id', studentController.getStudentById);   // Détails d'un élève
router.put('/:id', studentController.updateStudent);    // Modification
router.delete('/:id', studentController.deleteStudent); // Suppression
router.post('/change-password', studentController.changePassword); // Changement de mot de passe par l'élève

module.exports = router;
