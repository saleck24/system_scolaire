# Système de Gestion Scolaire (Offline-First)

Un système de gestion scolaire moderne et robuste conçu avec une architecture **Offline-First**, permettant une utilisation fluide même en cas d'instabilité réseau.

## 🚀 Fonctionnalités Clés

### 🔒 Sécurité et Accès
- **Gestion des Rôles** : Accès différencié pour les Administrateurs et les Enseignants.
- **Inscription Contrôlée** : Inscription restreinte au rôle 'enseignant' pour un contrôle optimal des accès.
- **Authentification JWT** : Sécurisation des routes API par jetons JSON Web.

### 📊 Tableaux de Bord Dynamiques
- **Dashboard Enseignant** : 
  - Statistiques globales (moyenne, nombre d'élèves).
  - Graphiques de répartition des notes (Chart.js).
  - **Système d'Alertes Généralisées** : Suivi automatique des difficultés (notes faibles, absences) et des succès (mentions excellentes).
- **Dashboard Admin** :
  - Statistiques système en temps réel.
  - **Suivi d'Activité** : Visualisation des utilisateurs actuellement en ligne (`last_active`).

### 📡 Architecture Offline-First & Sync
- **Continuité de Service** : Saisie des notes et absences possible sans connexion internet.
- **Stockage Local** : Utilisation d'IndexedDB via Dexie.js pour une persistance locale sécurisée.
- **Synchronisation Automatique** : Les données sont automatiquement envoyées au serveur MySQL dès que la connexion est rétablie.

### 📚 Gestion des Cours
- **Téléversement de Fichiers** : Support des formats PDF, Vidéos (MP4) et Audios (MP3).
- **Stockage backend** : Gestion robuste des uploads via Multer.

## 🛠️ Stack Technique

**Frontend :**
- [Vue.js 3](https://vuejs.org/) (Composition API)
- [Vite](https://vitejs.dev/)
- [Pinia](https://pinia.vuejs.org/) (Gestion d'état)
- [Dexie.js](https://dexie.org/) (IndexedDB)
- [Chart.js](https://www.chartjs.org/)

**Backend :**
- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- [MySQL](https://www.mysql.com/)
- [JWT](https://jwt.io/) & [Bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- [Multer](https://github.com/expressjs/multer)

## ⚙️ Installation

### Prérequis
- Node.js (v16+)
- MySQL

### 1. Configuration de la Base de Données
Importez le fichier `backend/database.sql` dans votre instance MySQL.

### 2. Backend
```bash
cd backend
npm install
# Créez un fichier .env basé sur les variables suivantes :
# PORT=3000
# DB_HOST=localhost
# DB_USER=votre_utilisateur
# DB_PASSWORD=votre_mot_de_passe
# DB_NAME=school_system
# JWT_SECRET=votre_secret
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Comment tester le mode Offline ?
1. Connectez-vous en tant qu'enseignant.
2. Éteignez votre serveur backend (**Ctrl+C** dans le terminal).
3. Ajoutez une note ou une absence dans l'interface.
4. Constatez que l'interface se met à jour instantanément (calcul des moyennes, alertes).
5. Relancez le serveur backend.
6. Les données se synchroniseront automatiquement après quelques secondes.

---
Développé avec ❤️ pour la gestion des établissements scolaires.
