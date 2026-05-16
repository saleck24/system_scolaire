const db = require('../config/db');

/**
 * Récupère la liste de tous les cours et supports disponibles.
 */
exports.getAllCourses = async (req, res) => {
    try {
        const [courses] = await db.query('SELECT * FROM courses');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

/**
 * Récupère les détails d'un cours par son identifiant.
 */
exports.getCourseById = async (req, res) => {
    const { id } = req.params;
    try {
        const [courses] = await db.query('SELECT * FROM courses WHERE id = ?', [id]);
        if (courses.length === 0) return res.status(404).json({ message: 'Cours non trouvé' });
        res.json(courses[0]);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

/**
 * Crée un nouveau cours et enregistre le fichier téléversé.
 */
exports.createCourse = async (req, res) => {
    const { titre, type } = req.body;
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Fichier manquant.' });
        }
        const enseignant_id = req.user.id;
        const file_url = `/uploads/${req.file.filename}`;

        await db.query('INSERT INTO courses (titre, type, file_url, enseignant_id) VALUES (?, ?, ?, ?)',
            [titre, type, file_url, enseignant_id]);
        res.status(201).json({ message: 'Cours créé et fichier téléversé.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

/**
 * Supprime un cours de la base de données.
 */
exports.deleteCourse = async (req, res) => {
    const { id } = req.params;
    try {
        // Note : En production, il faudrait aussi supprimer le fichier physique sur le disque
        await db.query('DELETE FROM courses WHERE id = ?', [id]);
        res.json({ message: 'Cours supprimé' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};
