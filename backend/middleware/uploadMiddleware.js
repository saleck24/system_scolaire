const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Middleware de gestion des téléversements (uploads) via Multer.
 */

// Vérification et création du répertoire de stockage si inexistant
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage sur le disque
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Génération d'un nom de fichier unique pour éviter les collisions
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtre de sécurité sur les types de fichiers autorisés
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'video/mp4',
        'audio/mpeg',
        'audio/mp3',
        'audio/x-mpeg',
        'audio/x-mp3',
        'video/mpeg'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format de fichier non supporté. (PDF, MP4, MP3 uniquement)'), false);
    }
};

// Initialisation de l'instance Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 150 * 1024 * 1024 } // Limite à 150 Mo
});

module.exports = upload;
