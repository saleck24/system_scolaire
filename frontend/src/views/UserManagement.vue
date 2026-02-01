<template>
  <div class="user-management">
    <div class="header">
        <button @click="$router.push('/')" class="back-btn">← Retour</button>
        <h1>Gestion des Utilisateurs</h1>
    </div>

    <div class="actions">
      <button @click="openModal()" class="add-btn">Ajouter un utilisateur</button>
    </div>

    <table class="user-table">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Email</th>
          <th>Rôle</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.nom }}</td>
          <td>{{ user.email }}</td>
          <td>
             <span :class="['role-badge', user.role]">{{ user.role }}</span>
          </td>
          <td>
            <button @click="deleteUser(user.id)" class="delete-btn" v-if="user.id !== currentUserId">Supprimer</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h2>Ajouter un utilisateur</h2>
        <form @submit.prevent="saveUser">
          <div class="form-group">
            <label>Nom</label>
            <input v-model="form.nom" required />
          </div>
           <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" type="email" required />
          </div>
           <div class="form-group">
            <label>Mot de passe</label>
            <input v-model="form.password" type="password" required />
          </div>
          <div class="form-group">
            <label>Rôle</label>
            <select v-model="form.role">
                <option value="enseignant">Enseignant</option>
                <option value="admin">Administrateur</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal">Annuler</button>
            <button type="submit" :disabled="loading">{{ loading ? 'Sauvegarde...' : 'Enregistrer' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../services/api'; // Use generic api instance
import { useAuthStore } from '../stores/auth';

const users = ref([]);
const showModal = ref(false);
const loading = ref(false);
const authStore = useAuthStore();
const currentUserId = computed(() => authStore.user?.id);

const form = ref({
  nom: '',
  email: '',
  password: '',
  role: 'enseignant'
});

const loadUsers = async () => {
  try {
    const res = await api.get('/users');
    users.value = res.data;
  } catch (error) {
    console.error('Erreur chargement utilisateurs:', error);
  }
};

const openModal = () => {
    form.value = { nom: '', email: '', password: '', role: 'enseignant' };
    showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveUser = async () => {
  loading.value = true;
  try {
    await api.post('/users', form.value);
    await loadUsers();
    closeModal();
  } catch (error) {
    alert(error.response?.data?.message || 'Erreur création');
  } finally {
    loading.value = false;
  }
};

const deleteUser = async (id) => {
  if (confirm('Êtes-vous sûr ?Ce compte sera supprimé.')) {
    try {
      await api.delete(`/users/${id}`);
      await loadUsers();
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  }
};

onMounted(loadUsers);
</script>

<style scoped>
.user-management { padding: 1rem; }
.header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
.back-btn { background: #6c757d; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }
.add-btn { background: #28a745; color: white; padding: 0.5rem 1rem; border: none; cursor: pointer; margin-bottom: 1rem; }
.user-table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
th { background-color: #f2f2f2; }
.delete-btn { background: #dc3545; color: white; border: none; padding: 0.25rem 0.5rem; cursor: pointer; }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; }
.modal { background: white; padding: 2rem; border-radius: 8px; width: 400px; }
.role-badge { padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; }
.role-badge.admin { background: #6f42c1; color: white; }
.role-badge.enseignant { background: #17a2b8; color: white; }
.form-group { margin-bottom: 1rem; }
input, select { width: 100%; padding: 0.5rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
</style>
