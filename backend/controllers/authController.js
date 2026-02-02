const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');

exports.register = async (req, res) => {
    const { nom, email, password } = req.body;
    try {
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (nom, email, password_hash, role) VALUES (?, ?, ?, ?)', [nom, email, hashedPassword, 'enseignant']);

        res.status(201).json({ message: 'Utilisateur créé avec succès.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        let userFound = null;
        let role = '';

        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length > 0) {
            userFound = users[0];
            role = userFound.role;
        } else {
            const [students] = await db.query('SELECT * FROM students WHERE email = ?', [email]);
            if (students.length > 0) {
                userFound = students[0];
                role = 'student';
            }
        }

        if (!userFound || !userFound.password_hash) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
        }

        const isMatch = await bcrypt.compare(password, userFound.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
        }

        const table = role === 'student' ? 'students' : 'users';
        await db.query(`UPDATE ${table} SET last_active = NOW() WHERE id = ?`, [userFound.id]);

        const token = jwt.sign({ id: userFound.id, role: role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Save to session
        req.session.userId = userFound.id;
        req.session.role = role;

        res.json({
            token,
            user: { id: userFound.id, nom: userFound.nom, email: userFound.email, role: role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

const mailer = require('../utils/mailer');

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        let userFound = null;
        let table = '';

        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length > 0) {
            userFound = users[0];
            table = 'users';
        } else {
            const [students] = await db.query('SELECT * FROM students WHERE email = ?', [email]);
            if (students.length > 0) {
                userFound = students[0];
                table = 'students';
            }
        }

        if (!userFound) {
            return res.status(404).json({ message: 'Aucun compte associé à cet email.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 3600000); // 1 hour

        await db.query(`UPDATE ${table} SET reset_token = ?, reset_token_expiry = ? WHERE id = ?`, [resetToken, expiry, userFound.id]);

        const resetLink = `http://localhost:5173/reset-password?token=${resetToken}&email=${email}`;

        // Send actual email
        await mailer.sendResetEmail(email, resetLink);

        res.json({ message: 'Un lien de réinitialisation a été envoyé à votre adresse email.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email.' });
    }
};

exports.resetPassword = async (req, res) => {
    const { email, token, newPassword } = req.body;
    try {
        let userFound = null;
        let table = '';

        const [users] = await db.query('SELECT * FROM users WHERE email = ? AND reset_token = ?', [email, token]);
        if (users.length > 0) {
            userFound = users[0];
            table = 'users';
        } else {
            const [students] = await db.query('SELECT * FROM students WHERE email = ? AND reset_token = ?', [email, token]);
            if (students.length > 0) {
                userFound = students[0];
                table = 'students';
            }
        }

        if (!userFound || new Date(userFound.reset_token_expiry) < new Date()) {
            return res.status(400).json({ message: 'Token invalide ou expiré.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query(`UPDATE ${table} SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?`, [hashedPassword, userFound.id]);

        res.json({ message: 'Mot de passe réinitialisé avec succès.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};
