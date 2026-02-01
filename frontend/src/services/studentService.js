
import api from './api';

export default {
    getAll() {
        return api.get('/students');
    },
    getById(id) {
        return api.get(`/students/${id}`);
    },
    create(student) {
        return api.post('/students', student);
    },
    update(id, student) {
        return api.put(`/students/${id}`, student);
    },
    delete(id) {
        return api.delete(`/students/${id}`);
    }
};
