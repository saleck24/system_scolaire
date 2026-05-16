// Importation des modules nécessaires
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const path = require('path');

// Chargement des variables d'environnement
dotenv.config();

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de base
app.use(compression()); // Compression des réponses HTTP
app.use(cookieParser()); // Analyse des cookies
app.use(cors({
    origin: 'http://localhost:5173', // Autorisation du frontend Vite
    credentials: true
}));
app.use(express.json()); // Analyse du corps des requêtes en JSON

// Configuration des sessions
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Passer à true en production avec HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 jour
    }
}));

// Servir les fichiers téléversés de manière statique
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Importation des middlewares personnalisés
const auth = require('./middleware/authMiddleware');
const activity = require('./middleware/activityMiddleware');

// Importation des routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const absenceRoutes = require('./routes/absenceRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');

// Définition des points de terminaison (endpoints) de l'API
app.use('/api/auth', authRoutes);
app.use('/api/students', auth, activity, studentRoutes);
app.use('/api/performances', auth, activity, performanceRoutes);
app.use('/api/absences', auth, activity, absenceRoutes);
app.use('/api/users', auth, activity, userRoutes);
app.use('/api/courses', auth, activity, courseRoutes);

// Route de base pour vérifier le statut de l'API
app.get('/', (req, res) => {
    res.send('API Système Scolaire Offline-First Running');
});

// Middleware global de gestion des erreurs
app.use((err, req, res, next) => {
    if (err) {
        console.error('Erreur Serveur:', err.message);
        return res.status(400).json({ message: err.message });
    }
    next();
});

// Lancement du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
