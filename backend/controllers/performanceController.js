
const db = require('../config/db');

exports.addPerformance = async (req, res) => {
    const { student_id, matiere, note, periode } = req.body;
    try {
        await db.query(
            'INSERT INTO performances (student_id, matiere, note, periode, date_saisie, synced) VALUES (?, ?, ?, ?, NOW(), ?)',
            [student_id, matiere, note, periode, true] // Directly online = synced true
        );
        res.status(201).json({ message: 'Note ajoutée.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

exports.getStudentPerformances = async (req, res) => {
    const { studentId } = req.params;
    try {
        const [grades] = await db.query('SELECT * FROM performances WHERE student_id = ? ORDER BY date_saisie DESC', [studentId]);

        // Calculate average
        const [avgResult] = await db.query('SELECT AVG(note) as moyenne FROM performances WHERE student_id = ?', [studentId]);
        const moyenne = avgResult[0].moyenne || 0;

        res.json({ grades, moyenne });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};
