import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
    const notifications = ref([]);

    const notify = (message, type = 'info', timeout = 5000) => {
        const id = Date.now();
        notifications.value.push({ id, message, type });
        setTimeout(() => {
            remove(id);
        }, timeout);
    };

    const remove = (id) => {
        notifications.value = notifications.value.filter(n => n.id !== id);
    };

    const success = (msg) => notify(msg, 'success');
    const error = (msg) => notify(msg, 'danger');
    const info = (msg) => notify(msg, 'info');

    return { notifications, notify, success, error, info, remove };
});
