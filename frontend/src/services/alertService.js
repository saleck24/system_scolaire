
import { db } from '../db';
import syncService from './syncService';

export default {
    async add(alert) {
        await db.table('alerts').add({ ...alert, synced: 0 });
        if (navigator.onLine) syncService.splitQueue();
    },
    async getByStudent(_studentId) {
        // Placeholder
        return [];
    }
};
