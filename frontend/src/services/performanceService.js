
import { db } from '../db';
import syncService from './syncService';

export default {
    async add(data) {
        // Offline-first: Save to local DB
        await db.performances.add({ ...data, synced: 0, date_saisie: new Date() });

        // Trigger sync if online
        if (navigator.onLine) {
            syncService.splitQueue();
        }
        return Promise.resolve({ message: 'Saved locally' });
    },

    async getByStudent(studentId) {
        // Try local first
        const localGrades = await db.performances.where('student_id').equals(studentId).toArray();

        // Calculate local average
        let sum = 0;
        localGrades.forEach(g => sum += Number(g.note));
        const moyenne = localGrades.length ? (sum / localGrades.length).toFixed(2) : 0;

        return { data: { grades: localGrades, moyenne } };
    },

    async getAllLocal() {
        return db.performances.toArray();
    }
};
