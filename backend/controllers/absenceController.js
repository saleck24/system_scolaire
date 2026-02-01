
const db = require('../config/db');

exports.addAbsence = async (req, res) => {
    const { student_id, date_absence, justification } = req.body;
    try {
        await db.query(
            'INSERT INTO absences (student_id, date_absence, justification, synced) VALUES (?, ?, ?, ?)',
            [student_id, date_absence, justification, true]
        );
        res.status(201).json({ message: 'Absence notée.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

exports.getStudentAbsences = async (req, res) => {
    const { studentId } = req.params;
    try {
        const [absences] = await db.query('SELECT * FROM absences WHERE student_id = ? ORDER BY date_absence DESC', [studentId]);
        res.json(absences);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};
