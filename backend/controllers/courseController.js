const db = require('../config/db');

exports.getAllCourses = async (req, res) => {
    try {
        const [courses] = await db.query('SELECT * FROM courses');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

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

exports.deleteCourse = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM courses WHERE id = ?', [id]);
        res.json({ message: 'Cours supprimé' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};
