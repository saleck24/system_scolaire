const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/**
 * Routes pour la gestion des utilisateurs (Admins et Enseignants)
 */

router.get('/', userController.getAllUsers);           // Liste des utilisateurs
router.get('/online', userController.getOnlineUsers);  // Utilisateurs actuellement en ligne
router.get('/stats', userController.getOnlineStats);   // Statistiques d'activité
router.post('/change-password', userController.changePassword); // Changement de mot de passe
router.delete('/:id', userController.deleteUser);      // Suppression (Admin uniquement géré dans le contrôleur)

module.exports = router;
