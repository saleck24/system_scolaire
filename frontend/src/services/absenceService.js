
import { db } from '../db';
import syncService from './syncService';

export default {
    async add(data) {
        await db.absences.add({ ...data, synced: 0 });
        if (navigator.onLine) {
            syncService.splitQueue();
        }
        return Promise.resolve({ message: 'Saved locally' });
    },

    async getByStudent(studentId) {
        const localAbsences = await db.absences.where('student_id').equals(studentId).toArray();
        return { data: localAbsences };
    },

    async getAllLocal() {
        return db.absences.toArray();
    }
};
