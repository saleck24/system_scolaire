const db = require('../config/db');
const bcrypt = require('bcryptjs');

/**
 * Récupère la liste de tous les élèves.
 * Les enseignants ne voient que leurs propres élèves.
 * Les administrateurs voient tout le monde.
 */
exports.getAllStudents = async (req, res) => {
    try {
        let query = 'SELECT * FROM students';
        const params = [];

        // Restriction pour les enseignants
        if (req.user.role === 'enseignant') {
            query += ' WHERE enseignant_id = ?';
            params.push(req.user.id);
        }

        const [students] = await db.query(query, params);
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

/**
 * Crée un nouvel élève lié à l'enseignant connecté (ou admin).
 */
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

/**
 * Met à jour les informations d'un élève.
 * Vérifie que l'enseignant est bien le propriétaire ou que l'utilisateur est admin.
 */
exports.updateStudent = async (req, res) => {
    const { id } = req.params;
    const { nom, niveau, etablissement } = req.body;
    try {
        let query = 'UPDATE students SET nom = ?, niveau = ?, etablissement = ? WHERE id = ?';
        const params = [nom, niveau, etablissement, id];

        // Si ce n'est pas un admin, on restreint à l'enseignant propriétaire
        if (req.user.role !== 'admin') {
            query += ' AND enseignant_id = ?';
            params.push(req.user.id);
        }

        const [result] = await db.query(query, params);
        
        if (result.affectedRows === 0) {
            return res.status(403).json({ message: 'Non autorisé ou élève inexistant.' });
        }

        res.json({ message: 'Élève mis à jour.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

/**
 * Récupère les détails d'un élève spécifique.
 */
exports.getStudentById = async (req, res) => {
    const { id } = req.params;
    try {
        let query = 'SELECT * FROM students WHERE id = ?';
        const params = [id];

        if (req.user.role !== 'admin') {
            query += ' AND enseignant_id = ?';
            params.push(req.user.id);
        }

        const [students] = await db.query(query, params);
        if (students.length === 0) {
            return res.status(404).json({ message: 'Élève non trouvé.' });
        }
        res.json(students[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

/**
 * Supprime un élève.
 */
exports.deleteStudent = async (req, res) => {
    const { id } = req.params;
    try {
        let query = 'DELETE FROM students WHERE id = ?';
        const params = [id];

        if (req.user.role !== 'admin') {
            query += ' AND enseignant_id = ?';
            params.push(req.user.id);
        }

        const [result] = await db.query(query, params);
        if (result.affectedRows === 0) {
            return res.status(403).json({ message: 'Non autorisé ou élève inexistant.' });
        }

        res.json({ message: 'Élève supprimé.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

/**
 * Permet à un élève de changer son propre mot de passe.
 */
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const studentId = req.user.id;
        const [students] = await db.query('SELECT * FROM students WHERE id = ?', [studentId]);

        if (students.length === 0) {
            return res.status(404).json({ message: 'Élève non trouvé.' });
        }

        const student = students[0];
        const isMatch = await bcrypt.compare(currentPassword, student.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mot de passe actuel incorrect.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE students SET password_hash = ? WHERE id = ?', [hashedPassword, studentId]);

        res.json({ message: 'Mot de passe modifié avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};
