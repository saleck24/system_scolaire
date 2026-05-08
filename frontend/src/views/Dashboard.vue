<template>
  <MainLayout>
    <div class="dashboard-content">
        <h1 class="mb-2">Bienvenue, {{ authStore.user?.nom }}</h1>
        <p class="mb-2 text-muted">Tableau de bord : {{ userRoleDisplay }}</p>
        
        <div class="dashboard-component mt-2">
            <component :is="currentDashboardComponent" />
        </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import TeacherDashboard from '../components/TeacherDashboard.vue';
import AdminDashboard from '../components/AdminDashboard.vue';
import StudentDashboard from '../components/StudentDashboard.vue';
import MainLayout from '../components/MainLayout.vue';

const authStore = useAuthStore();

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
</script>

<style scoped>
.text-muted { color: #6c757d; }
h1 { font-size: 2rem; margin: 0; }
</style>
