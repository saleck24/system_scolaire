import api from './api';

export default {
    getAll() {
        return api.get('/courses');
    },
    getById(id) {
        return api.get(`/courses/${id}`);
    },
    create(data, config = {}) {
        return api.post('/courses', data, config);
    },
    delete(id) {
        return api.delete(`/courses/${id}`);
    }
};
