
import { db } from '../db';
import api from './api';

export default {
    async splitQueue() {
        // Sync Performances
        const unsyncedGrades = await db.performances.where('synced').equals(0).toArray();
        for (const grade of unsyncedGrades) {
            try {
                await api.post('/performances', {
                    student_id: grade.student_id,
                    matiere: grade.matiere,
                    note: grade.note,
                    periode: grade.periode
                });
                await db.performances.update(grade.id, { synced: 1 });
            } catch (error) {
                console.error('Sync error (performance):', error);
            }
        }

        // Sync Absences
        const unsyncedAbsences = await db.absences.where('synced').equals(0).toArray();
        for (const absence of unsyncedAbsences) {
            try {
                await api.post('/absences', {
                    student_id: absence.student_id,
                    date_absence: absence.date_absence,
                    justification: absence.justification
                });
                await db.absences.update(absence.id, { synced: 1 });
            } catch (error) {
                console.error('Sync error (absence):', error);
            }
        }
    },

    async syncDown() {
        try {
            // Fetch students
            const studentsRes = await api.get('/students');
            await db.students.bulkPut(studentsRes.data);
        } catch (e) {
            console.error('Sync Down error', e);
        }
    },

    startSyncLoop(intervalMs = 15000) {
        const runSync = () => {
            if (localStorage.getItem('token')) {
                this.splitQueue();
                this.syncDown();
            }
        };

        runSync();

        setInterval(() => {
            if (navigator.onLine) {
                runSync();
            }
        }, intervalMs);

        window.addEventListener('online', () => {
            runSync();
        });
    }
};
