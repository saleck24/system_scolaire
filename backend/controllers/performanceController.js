const db = require('../config/db');

/**
 * Ajoute une note de performance (évaluation) pour un élève.
 */
exports.addPerformance = async (req, res) => {
    const { student_id, matiere, note, periode } = req.body;
    try {
        await db.query(
            'INSERT INTO performances (student_id, matiere, note, periode, date_saisie, synced) VALUES (?, ?, ?, ?, NOW(), ?)',
            [student_id, matiere, note, periode, true] // Enregistré directement en ligne = marqué comme synchronisé
        );
        res.status(201).json({ message: 'Note ajoutée.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

/**
 * Récupère toutes les notes d'un élève et calcule sa moyenne générale.
 */
exports.getStudentPerformances = async (req, res) => {
    const { studentId } = req.params;
    try {
        const [grades] = await db.query('SELECT * FROM performances WHERE student_id = ? ORDER BY date_saisie DESC', [studentId]);

        // Calcul de la moyenne via SQL
        const [avgResult] = await db.query('SELECT AVG(note) as moyenne FROM performances WHERE student_id = ?', [studentId]);
        const moyenne = avgResult[0].moyenne || 0;

        res.json({ grades, moyenne: parseFloat(moyenne).toFixed(2) });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};
