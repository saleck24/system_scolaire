<template>
  <div class="main-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>Système Scolaire</h2>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item">Tableau de bord</router-link>
        <template v-if="isAdmin">
            <router-link to="/users" class="nav-item">Utilisateurs</router-link>
        </template>
        <template v-if="isAdmin || isTeacher">
            <router-link to="/students" class="nav-item">Élèves</router-link>
            <router-link to="/courses" class="nav-item">Cours</router-link>
        </template>
      </nav>
      <div class="sidebar-footer">
        <p class="user-info">{{ authStore.user?.nom }}</p>
        <button @click="logout" class="btn btn-danger btn-sm">Déconnexion</button>
      </div>
    </aside>
    <main class="content">
      <slot></slot>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const isAdmin = computed(() => authStore.user?.role === 'admin');
const isTeacher = computed(() => authStore.user?.role === 'enseignant');

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: var(--gray-dark);
  color: white;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-item {
  display: block;
  padding: 0.75rem 1.5rem;
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover, .nav-item.router-link-active {
  background-color: rgba(255,255,255,0.1);
  color: white;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.user-info {
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.content {
  flex: 1;
  padding: 2rem;
  background-color: var(--bg-main);
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
</style>
