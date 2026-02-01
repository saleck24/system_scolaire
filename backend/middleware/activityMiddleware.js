const db = require('../config/db');

module.exports = async (req, res, next) => {
    if (req.user && req.user.id && req.user.role !== 'student') {
        try {
            await db.query('UPDATE users SET last_active = NOW() WHERE id = ?', [req.user.id]);
        } catch (error) {
            console.error('Erreur update last_active:', error);
        }
    }
    next();
};
