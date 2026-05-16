const jwt = require('jsonwebtoken');

/**
 * Middleware d'authentification par JWT.
 * Vérifie la présence et la validité du token dans l'en-tête Authorization.
 */
module.exports = (req, res, next) => {
    // Extraction du token (format: "Bearer <token>")
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
    }

    try {
        // Vérification du token avec la clé secrète
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
        
        // On attache les informations de l'utilisateur décodées à l'objet req
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token invalide.' });
    }
};
