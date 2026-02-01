
<template>
  <div class="dashboard">
    <div class="header">
        <h1>Tableau de Bord - {{ userRoleDisplay }}</h1>
        <button @click="logout" class="logout-btn">Déconnexion</button>
    </div>
    
    <component :is="currentDashboardComponent" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import TeacherDashboard from '../components/TeacherDashboard.vue';
import AdminDashboard from '../components/AdminDashboard.vue';
import StudentDashboard from '../components/StudentDashboard.vue';

const authStore = useAuthStore();
const router = useRouter();

const userRoleDisplay = computed(() => {
    switch(authStore.user?.role) {
        case 'admin': return 'Administrateur';
        case 'enseignant': return 'Enseignant';
        case 'student': return 'Élève';
        default: return 'Utilisateur';
    }
});

const currentDashboardComponent = computed(() => {
    switch(authStore.user?.role) {
        case 'admin': return AdminDashboard;
        case 'student': return StudentDashboard;
        default: return TeacherDashboard;
    }
});

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.dashboard { padding: 2rem; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.logout-btn { background: #dc3545; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
</style>
