
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: Login,
            meta: { guest: true }
        },
        {
            path: '/forgot-password',
            name: 'ForgotPassword',
            component: () => import('../views/ForgotPassword.vue'),
            meta: { guest: true }
        },
        {
            path: '/reset-password',
            name: 'ResetPassword',
            component: () => import('../views/ResetPassword.vue'),
            meta: { guest: true }
        },
        {
            path: '/courses',
            name: 'CourseManagement',
            component: () => import('../views/CourseManagement.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/admin/users',
            name: 'UserManagement',
            component: () => import('../views/UserManagement.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/register',
            name: 'Register',
            component: Register,
            meta: { guest: true }
        },
        {
            path: '/',
            name: 'Dashboard',
            component: () => import('../views/Dashboard.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/students',
            name: 'Students',
            component: () => import('../views/Students.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/students/:id',
            name: 'StudentDetails',
            component: () => import('../views/StudentDetails.vue'),
            meta: { requiresAuth: true }
        }
    ]
});

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/login');
    } else if (to.meta.guest && authStore.isAuthenticated) {
        next('/');
    } else {
        next();
    }
});

export default router;
