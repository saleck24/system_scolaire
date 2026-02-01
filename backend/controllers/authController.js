
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
    const { nom, email, password } = req.body;
    try {
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // Force role to 'enseignant'
        await db.query('INSERT INTO users (nom, email, password_hash, role) VALUES (?, ?, ?, ?)', [nom, email, hashedPassword, 'enseignant']);

        res.status(201).json({ message: 'Utilisateur créé avec succès.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // 1. Check in 'users' (Admin/Enseignant)
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length > 0) {
            const user = users[0];
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
            }

            // Update last_active
            await db.query('UPDATE users SET last_active = NOW() WHERE id = ?', [user.id]);

            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1d' });
            return res.json({ token, user: { id: user.id, nom: user.nom, email: user.email, role: user.role } });
        }

        // 2. Check in 'students'
        const [students] = await db.query('SELECT * FROM students WHERE email = ?', [email]);

        if (students.length > 0) {
            const student = students[0];
            // If password_hash is NULL (not set yet), deny or handle first login? 
            // Assuming set.
            if (!student.password_hash) {
                return res.status(401).json({ message: 'Compte étudiant non activé (pas de mot de passe).' });
            }

            const isMatch = await bcrypt.compare(password, student.password_hash);
            if (!isMatch) {
                return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
            }

            const token = jwt.sign({ id: student.id, role: 'student' }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1d' });
            return res.json({ token, user: { id: student.id, nom: student.nom, email: student.email, role: 'student' } });
        }

        return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};
