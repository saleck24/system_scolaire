
import Dexie from 'dexie';

export class SchoolDatabase extends Dexie {
    constructor() {
        super('SchoolDB');
        this.version(1).stores({
            students: '++id, nom, enseignant_id, synced',
            performances: '++id, student_id, synced',
            absences: '++id, student_id, synced',
            alerts: '++id, student_id, synced',
            syncQueue: '++id, status, createdAt'
        });
    }
}

export const db = new SchoolDatabase();
