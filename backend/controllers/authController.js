const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const mailer = require('../utils/mailer');

/**
 * Inscription d'un nouvel utilisateur (enseignant par défaut).
 */
exports.register = async (req, res) => {
    const { nom, email, password } = req.body;
    try {
        // Vérification si l'utilisateur existe déjà
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
        }

        // Hachage du mot de passe et insertion
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (nom, email, password_hash, role) VALUES (?, ?, ?, ?)', [nom, email, hashedPassword, 'enseignant']);

        res.status(201).json({ message: 'Utilisateur créé avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

/**
 * Connexion de l'utilisateur (Gestion multi-tables : users et students).
 */
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        let userFound = null;
        let role = '';

        // Recherche dans la table des utilisateurs (Admins/Enseignants)
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length > 0) {
            userFound = users[0];
            role = userFound.role;
        } else {
            // Recherche dans la table des élèves
            const [students] = await db.query('SELECT * FROM students WHERE email = ?', [email]);
            if (students.length > 0) {
                userFound = students[0];
                role = 'student';
            }
        }

        // Validation de l'existence et du mot de passe
        if (!userFound || !userFound.password_hash) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
        }

        const isMatch = await bcrypt.compare(password, userFound.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
        }

        // Mise à jour de la dernière activité
        const table = role === 'student' ? 'students' : 'users';
        await db.query(`UPDATE ${table} SET last_active = NOW() WHERE id = ?`, [userFound.id]);

        // Génération du token JWT
        const token = jwt.sign({ id: userFound.id, role: role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1d' });

        // Sauvegarde dans la session Express (si utilisée)
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

/**
 * Demande de réinitialisation de mot de passe (envoi d'email).
 */
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        let userFound = null;
        let table = '';

        // Identification de l'utilisateur
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

        // Création d'un token sécurisé
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 3600000); // Expiration dans 1 heure

        await db.query(`UPDATE ${table} SET reset_token = ?, reset_token_expiry = ? WHERE id = ?`, [resetToken, expiry, userFound.id]);

        // Construction du lien de réinitialisation pour le frontend Vite
        const resetLink = `http://localhost:5173/reset-password?token=${resetToken}&email=${email}`;

        // Envoi de l'email via le service mailer
        await mailer.sendResetEmail(email, resetLink);

        res.json({ message: 'Un lien de réinitialisation a été envoyé à votre adresse email.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email.' });
    }
};

/**
 * Validation du token et mise à jour du mot de passe.
 */
exports.resetPassword = async (req, res) => {
    const { email, token, newPassword } = req.body;
    try {
        let userFound = null;
        let table = '';

        // Vérification du token pour users
        const [users] = await db.query('SELECT * FROM users WHERE email = ? AND reset_token = ?', [email, token]);
        if (users.length > 0) {
            userFound = users[0];
            table = 'users';
        } else {
            // Vérification du token pour students
            const [students] = await db.query('SELECT * FROM students WHERE email = ? AND reset_token = ?', [email, token]);
            if (students.length > 0) {
                userFound = students[0];
                table = 'students';
            }
        }

        // Validation de l'expiration
        if (!userFound || new Date(userFound.reset_token_expiry) < new Date()) {
            return res.status(400).json({ message: 'Token invalide ou expiré.' });
        }

        // Mise à jour du mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query(`UPDATE ${table} SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?`, [hashedPassword, userFound.id]);

        res.json({ message: 'Mot de passe réinitialisé avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};
