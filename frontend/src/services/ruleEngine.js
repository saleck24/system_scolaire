
import performanceService from './performanceService';
import absenceService from './absenceService';

export default {
    async analyze(studentId) {
        const alerts = [];

        // Check Grades
        const pRes = await performanceService.getByStudent(studentId);
        const grades = pRes.data.grades || [];
        const moyenne = Number(pRes.data.moyenne);

        // 1. Individual low grades
        grades.forEach(g => {
            const note = Number(g.note);
            if (note < 8) {
                alerts.push({
                    type: 'grade',
                    message: `Note critique en ${g.matiere}: ${note}/20.`,
                    severity: 'critical'
                });
            } else if (note < 10) {
                alerts.push({
                    type: 'grade',
                    message: `Note insuffisante en ${g.matiere}: ${note}/20.`,
                    severity: 'warning'
                });
            } else if (note > 16) {
                alerts.push({
                    type: 'grade',
                    message: `Excellent résultat en ${g.matiere}: ${note}/20 !`,
                    severity: 'info'
                });
            }
        });

        // 2. Global Average (if not already covered by critical grades)
        if (moyenne < 8) {
            alerts.push({
                type: 'grade',
                message: `Moyenne globale faible (${moyenne}/20). Risque d'échec scolaire.`,
                severity: 'critical'
            });
        } else if (moyenne < 10) {
            alerts.push({
                type: 'grade',
                message: `Moyenne fragile (${moyenne}/20). À surveiller.`,
                severity: 'warning'
            });
        } else if (moyenne > 16) {
            alerts.push({
                type: 'grade',
                message: `Excellent résultats globaux (${moyenne}/20) !`,
                severity: 'info'
            });
        }

        // Check Absences
        const aRes = await absenceService.getByStudent(studentId);
        const absences = aRes.data;
        const count = absences.length;

        if (count >= 10) {
            alerts.push({
                type: 'absence',
                message: `Volume critique d'absences (${count}). Risque de décrochage immédiat.`,
                severity: 'critical'
            });
        } else if (count >= 5) {
            alerts.push({
                type: 'absence',
                message: `Absences très fréquentes (${count}).`,
                severity: 'critical'
            });
        } else if (count >= 3) {
            alerts.push({
                type: 'absence',
                message: `Absences à surveiller (${count}).`,
                severity: 'warning'
            });
        }

        return alerts;
    }
};
