<template>
  <div class="admin-dashboard">
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Utilisateurs</h3>
        <p class="stat-value">{{ totalUsers }}</p>
      </div>
      <div class="stat-card">
        <h3>Total Élèves</h3>
        <p class="stat-value">{{ totalStudents }}</p>
      </div>
      <div class="stat-card">
        <h3>Total Cours</h3>
        <p class="stat-value">{{ totalCourses }}</p>
      </div>
      <div class="stat-card" :class="{'info': systemStatus === 'Actif', 'error': systemStatus === 'Erreur', 'unknown': systemStatus === 'Unknown'}">
        <h3>Système</h3>
        <p class="stat-value">{{ systemStatus }}</p>
      </div>
    </div>

    <div class="grid-container">
      <div class="actions-container">
        <h3>Administration</h3>
        <div class="action-links">
            <router-link to="/admin/users" class="action-btn">Gérer les Utilisateurs</router-link>
            <button @click="showPasswordModal = true" class="action-btn secondary">Changer mot de passe</button>
        </div>
      </div>
      
      <div class="chart-container">
          <h3>Activités Système</h3>
          
          <div class="activity-section">
            <h4>Utilisateurs en ligne</h4>
            <ul v-if="onlineUsers && onlineUsers.length" class="online-list">
                <li v-for="user in onlineUsers" :key="user.id">
                    <span class="status-dot"></span>
                    <strong>{{ user.nom }}</strong> ({{ user.role }}) - {{ formatLastActive(user.last_active) }}
                </li>
            </ul>
            <p v-else class="empty-msg">Aucun utilisateur actif.</p>
          </div>

          <div class="activity-section">
            <h4>Élèves en ligne</h4>
            <ul v-if="onlineStudents && onlineStudents.length" class="online-list">
                <li v-for="student in onlineStudents" :key="student.id">
                    <span class="status-dot student"></span>
                    <strong>{{ student.nom }}</strong> - {{ formatLastActive(student.last_active) }}
                </li>
            </ul>
            <p v-else class="empty-msg">Aucun élève actif.</p>
          </div>
      </div>
    </div>
    
    <!-- Password Change Modal -->
    <div v-if="showPasswordModal" class="modal-overlay">
        <div class="modal-content">
            <h3>Changer mon mot de passe</h3>
            <form @submit.prevent="handleChangePassword">
                <div class="form-group">
                    <label>Mot de passe actuel</label>
                    <input v-model="passForm.currentPassword" type="password" required />
                </div>
                <div class="form-group">
                    <label>Nouveau mot de passe</label>
                    <input v-model="passForm.newPassword" type="password" required />
                </div>
                <div class="form-group">
                    <label>Confirmer nouveau mot de passe</label>
                    <input v-model="passForm.confirmPassword" type="password" required />
                </div>
                <div class="modal-actions">
                    <button type="button" @click="showPasswordModal = false" class="btn-secondary">Annuler</button>
                    <button type="submit" class="btn-primary" :disabled="submitting">Enregistrer</button>
                </div>
            </form>
            <p v-if="passError" class="error-text">{{ passError }}</p>
            <p v-if="passSuccess" class="success-text">{{ passSuccess }}</p>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import api from '../services/api';

const showPasswordModal = ref(false);
const submitting = ref(false);
const passError = ref('');
const passSuccess = ref('');
const passForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});

const totalUsers = ref(0);
const totalStudents = ref(0);
const totalCourses = ref(0);
const onlineUsers = ref([]);
const onlineStudents = ref([]);
const systemStatus = ref('Unknown');

const loadStats = async () => {
  try {
    const sRes = await api.get('/users/stats');
    totalUsers.value = sRes.data.totalUsers;
    totalStudents.value = sRes.data.totalStudents;
    onlineUsers.value = sRes.data.onlineUsers;
    onlineStudents.value = sRes.data.onlineStudents;
    
    const cRes = await api.get('/courses');
    totalCourses.value = cRes.data.length;
    
    systemStatus.value = 'Actif';
  } catch (error) {
    console.error('Erreur chargement stats admin:', error);
    systemStatus.value = 'Erreur';
  }
};

const formatLastActive = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const handleChangePassword = async () => {
    if (passForm.newPassword !== passForm.confirmPassword) {
        passError.value = "Les nouveaux mots de passe ne correspondent pas.";
        return;
    }
    
    submitting.value = true;
    passError.value = '';
    passSuccess.value = '';
    
    try {
        await api.post('/users/change-password', {
            currentPassword: passForm.currentPassword,
            newPassword: passForm.newPassword
        });
        passSuccess.value = "Mot de passe modifié avec succès.";
        setTimeout(() => {
            showPasswordModal.value = false;
            Object.assign(passForm, { currentPassword: '', newPassword: '', confirmPassword: '' });
            passSuccess.value = '';
        }, 2000);
    } catch (err) {
        passError.value = err.response?.data?.message || "Erreur lors du changement de mot de passe.";
    } finally {
        submitting.value = false;
    }
};

onMounted(loadStats);
</script>

<style scoped>
.stats-grid { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
.stat-card { flex: 1; min-width: 180px; background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
.stat-card.info { border-left: 5px solid #17a2b8; }
.stat-card.error { border-left: 5px solid #dc3545; }
.stat-card.unknown { border-left: 5px solid #ffc107; }
.stat-value { font-size: 2.5rem; font-weight: bold; margin: 0.5rem 0 0; color: #333; }
.grid-container { display: flex; gap: 2rem; flex-wrap: wrap; }
.chart-container { flex: 2; min-width: 300px; background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.actions-container { flex: 1; min-width: 200px; }
.action-links { display: flex; flex-direction: column; gap: 1rem; }
.action-btn { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  background: #6f42c1; 
  color: white; 
  padding: 1rem; 
  border-radius: 8px; 
  text-decoration: none; 
  font-weight: bold; 
  border: none; 
  cursor: pointer; 
  width: 100%; 
  box-sizing: border-box; 
  font-size: 1rem; 
  line-height: normal; 
}
.action-btn.secondary { background: #6c757d; }

.activity-section { margin-bottom: 2rem; }
.activity-section h4 { margin-bottom: 1rem; color: #666; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
.online-list { list-style: none; padding: 0; }
.online-list li { padding: 0.5rem 0; border-bottom: 1px solid #f9f9f9; display: flex; align-items: center; gap: 0.5rem; }
.status-dot { width: 10px; height: 10px; background: #28a745; border-radius: 50%; }
.status-dot.student { background: #007bff; }
.empty-msg { font-size: 0.9rem; color: #999; font-style: italic; }

/* Modal Styles */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; padding: 2rem; border-radius: 8px; width: 100%; max-width: 500px; text-align: left; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; text-align: left; }
.form-group input { width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
.btn-primary { background: #007bff; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
.btn-secondary { background: #6c757d; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
.error-text { color: #dc3545; margin-top: 1rem; font-size: 0.9rem; }
.success-text { color: #28a745; margin-top: 1rem; font-size: 0.9rem; }
</style>
