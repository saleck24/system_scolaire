
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * Routes pour l'authentification et la gestion du compte
 */

router.post('/register', authController.register); // Inscription
router.post('/login', authController.login);       // Connexion
router.post('/forgot-password', authController.forgotPassword); // Mot de passe oublié
router.post('/reset-password', authController.resetPassword);   // Réinitialisation

module.exports = router;
