
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const compression = require('compression');
const path = require('path');

app.use(compression());
app.use(cors());
app.use(express.json());
// Serve the uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const auth = require('./middleware/authMiddleware');
const activity = require('./middleware/activityMiddleware');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const absenceRoutes = require('./routes/absenceRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/students', auth, activity, studentRoutes);
app.use('/api/performances', auth, activity, performanceRoutes);
app.use('/api/absences', auth, activity, absenceRoutes);
app.use('/api/users', auth, activity, require('./routes/userRoutes'));
app.use('/api/courses', auth, activity, require('./routes/courseRoutes'));



app.get('/', (req, res) => {
    res.send('API Système Scolaire Offline-First Running');
});

// Error handling middleware
app.use((err, req, res, next) => {
    if (err) {
        console.error('Error:', err.message);
        return res.status(400).json({ message: err.message });
    }
    next();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
