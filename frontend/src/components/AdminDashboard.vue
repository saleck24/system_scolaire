<template>
  <div class="admin-dashboard">
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Utilisateurs</h3>
        <p class="stat-value">{{ totalUsers }}</p>
      </div>
      <div class="stat-card">
        <h3>Total Cours</h3>
        <p class="stat-value">{{ totalCourses }}</p>
      </div>
      <div class="stat-card info">
        <h3>Système</h3>
        <p class="stat-value">Actif</p>
      </div>
    </div>

    <div class="grid-container">
      <div class="actions-container">
        <h3>Administration</h3>
        <div class="action-links">
            <router-link to="/admin/users" class="action-btn">Gérer les Utilisateurs</router-link>
        </div>
      </div>
      <div class="chart-container">
          <h3>Activité Système (Utilisateurs en ligne)</h3>
          <ul v-if="onlineUsers && onlineUsers.length" class="online-list">
            <li v-for="user in onlineUsers" :key="user.id">
                <span class="status-dot"></span>
                <strong>{{ user.nom }}</strong> ({{ user.role }}) - {{ formatLastActive(user.last_active) }}
            </li>
          </ul>
          <p v-else>Aucun utilisateur actif ces 15 dernières minutes.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const totalUsers = ref(0);
const totalCourses = ref(0);
const onlineUsers = ref([]);

const loadStats = async () => {
  try {
    const res = await api.get('/users');
    totalUsers.value = res.data.length;
    
    const cRes = await api.get('/courses');
    totalCourses.value = cRes.data.length;

    const oRes = await api.get('/users/online');
    onlineUsers.value = oRes.data;
  } catch (error) {
    console.error('Erreur chargement stats admin:', error);
  }
};

const formatLastActive = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

onMounted(loadStats);
</script>

<style scoped>
.stats-grid { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
.stat-card { flex: 1; min-width: 200px; background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
.stat-card.info { border-left: 5px solid #17a2b8; }
.stat-value { font-size: 2.5rem; font-weight: bold; margin: 0.5rem 0 0; color: #333; }
.grid-container { display: flex; gap: 2rem; flex-wrap: wrap; }
.chart-container { flex: 2; min-width: 300px; background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.actions-container { flex: 1; min-width: 200px; }
.action-links { display: flex; flex-direction: column; gap: 1rem; }
.action-btn { display: block; text-align: center; background: #6f42c1; color: white; padding: 1rem; border-radius: 8px; text-decoration: none; font-weight: bold; }

.online-list { list-style: none; padding: 0; }
.online-list li { padding: 0.5rem 0; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 0.5rem; }
.status-dot { width: 10px; height: 10px; background: #28a745; border-radius: 50%; }
</style>
