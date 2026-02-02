const db = require('../config/db');

module.exports = async (req, res, next) => {
    if (req.user && req.user.id) {
        try {
            const table = req.user.role === 'student' ? 'students' : 'users';
            await db.query(`UPDATE ${table} SET last_active = NOW() WHERE id = ?`, [req.user.id]);
        } catch (error) {
            console.error('Erreur update last_active:', error);
        }
    }
    next();
};
