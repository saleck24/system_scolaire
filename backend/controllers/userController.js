const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, nom, email, role, created_at FROM users');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'Utilisateur supprimé.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

exports.createUser = async (req, res) => {
    const { nom, email, password, role } = req.body;
    try {
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email déjà utilisé.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (nom, email, password_hash, role) VALUES (?, ?, ?, ?)', [nom, email, hashedPassword, role]);
        res.status(201).json({ message: 'Utilisateur créé.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

exports.getOnlineUsers = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, nom, email, role, last_active FROM users WHERE last_active > NOW() - INTERVAL 15 MINUTE');
        res.json(users);
    } catch (error) {
        console.error('Error fetching online users:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};
