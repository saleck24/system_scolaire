const db = require('../config/db');

/**
 * Middleware de suivi d'activité.
 * Met à jour la colonne `last_active` de l'utilisateur à chaque requête authentifiée.
 */
module.exports = async (req, res, next) => {
    if (req.user && req.user.id) {
        try {
            // Détermination de la table cible selon le rôle
            const table = req.user.role === 'student' ? 'students' : 'users';
            
            // Mise à jour asynchrone (on n'attend pas forcément le résultat pour continuer)
            db.query(`UPDATE ${table} SET last_active = NOW() WHERE id = ?`, [req.user.id])
              .catch(err => console.error('Erreur update last_active:', err));
        } catch (error) {
            console.error('Erreur middleware activité:', error);
        }
    }
    next();
};
