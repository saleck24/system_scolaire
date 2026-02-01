
const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getAllStudents = async (req, res) => {
    try {
        // Filter by teacher if role is 'enseignant', else admin sees all? 
        // For simplicity, let's say teacher sees their own students.
        let query = 'SELECT * FROM students';
        const params = [];

        if (req.user.role === 'enseignant') {
            query += ' WHERE enseignant_id = ?';
            params.push(req.user.id);
        }

        const [students] = await db.query(query, params);
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

exports.createStudent = async (req, res) => {
    const { nom, niveau, etablissement, email, password } = req.body;
    try {
        const enseignant_id = req.user.id;

        let passwordHash = null;
        if (password) {
            passwordHash = await bcrypt.hash(password, 10);
        }

        await db.query(
            'INSERT INTO students (nom, niveau, etablissement, enseignant_id, email, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
            [nom, niveau, etablissement, enseignant_id, email, passwordHash]
        );
        res.status(201).json({ message: 'Élève créé avec succès.' });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Cet email est déjà utilisé par un autre élève.' });
        }
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

exports.updateStudent = async (req, res) => {
    const { id } = req.params;
    const { nom, niveau, etablissement } = req.body;
    try {
        await db.query(
            'UPDATE students SET nom = ?, niveau = ?, etablissement = ? WHERE id = ? AND enseignant_id = ?',
            [nom, niveau, etablissement, id, req.user.id]
        );
        res.json({ message: 'Élève mis à jour.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

exports.getStudentById = async (req, res) => {
    const { id } = req.params;
    try {
        const [students] = await db.query('SELECT * FROM students WHERE id = ? AND enseignant_id = ?', [id, req.user.id]);
        if (students.length === 0) {
            return res.status(404).json({ message: 'Élève non trouvé.' });
        }
        res.json(students[0]);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

exports.deleteStudent = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM students WHERE id = ? AND enseignant_id = ?', [id, req.user.id]);
        res.json({ message: 'Élève supprimé.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};
