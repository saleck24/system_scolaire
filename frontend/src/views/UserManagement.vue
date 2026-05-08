<template>
  <MainLayout>
    <div class="user-management">
      <div class="header-actions mb-2">
          <h1>Gestion des Utilisateurs</h1>
          <button @click="openModal()" class="btn btn-success">Ajouter un utilisateur</button>
      </div>

      <div class="table-controls mb-2">
          <input v-model="searchQuery" placeholder="Rechercher par nom ou email..." class="search-input" />
      </div>

      <div class="card p-0">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>{{ user.nom }}</td>
                <td>{{ user.email }}</td>
                <td>
                   <span :class="['badge', user.role === 'admin' ? 'btn-secondary' : 'btn-info']">{{ user.role }}</span>
                </td>
                <td>
                  <button @click="confirmDelete(user)" class="btn btn-danger btn-sm" v-if="user.id !== currentUserId">Supprimer</button>
                </td>
              </tr>
              <tr v-if="filteredUsers.length === 0">
                  <td colspan="4" class="text-center">Aucun utilisateur trouvé</td>
              </tr>
            </tbody>
          </table>
      </div>

      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <h2>{{ editingUser ? 'Modifier' : 'Ajouter' }} un utilisateur</h2>
          <form @submit.prevent="saveUser">
            <div class="form-group">
              <label>Nom complet</label>
              <input v-model="form.nom" placeholder="Jean Dupont" required />
            </div>
             <div class="form-group">
              <label>Email</label>
              <input v-model="form.email" type="email" placeholder="jean.dupont@exemple.com" required />
            </div>
             <div class="form-group">
              <label>Mot de passe</label>
              <input v-model="form.password" type="password" placeholder="••••••••" :required="!editingUser" />
              <small v-if="editingUser" class="help-text">Laisser vide pour ne pas modifier</small>
            </div>
            <div class="form-group">
              <label>Rôle</label>
              <select v-model="form.role">
                  <option value="enseignant">Enseignant</option>
                  <option value="admin">Administrateur</option>
              </select>
            </div>
            <div class="modal-actions mt-2">
              <button type="button" @click="closeModal" class="btn btn-secondary">Annuler</button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                  {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';
import MainLayout from '../components/MainLayout.vue';

const users = ref([]);
const showModal = ref(false);
const loading = ref(false);
const searchQuery = ref('');
const editingUser = ref(null);
const authStore = useAuthStore();
const notification = useNotificationStore();
const currentUserId = computed(() => authStore.user?.id);

const form = ref({
  nom: '',
  email: '',
  password: '',
  role: 'enseignant'
});

const filteredUsers = computed(() => {
    return users.value.filter(u => 
        u.nom.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

const loadUsers = async () => {
  try {
    const res = await api.get('/users');
    users.value = res.data;
  } catch (error) {
    notification.error('Erreur chargement utilisateurs');
  }
};

const openModal = (user = null) => {
    if (user) {
        editingUser.value = user;
        form.value = { ...user, password: '' };
    } else {
        editingUser.value = null;
        form.value = { nom: '', email: '', password: '', role: 'enseignant' };
    }
    showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveUser = async () => {
  loading.value = true;
  try {
    if (editingUser.value) {
        await api.put(`/users/${editingUser.value.id}`, form.value);
        notification.success('Utilisateur mis à jour');
    } else {
        await api.post('/users', form.value);
        notification.success('Utilisateur créé');
    }
    await loadUsers();
    closeModal();
  } catch (error) {
    notification.error(error.response?.data?.message || 'Erreur sauvegarde');
  } finally {
    loading.value = false;
  }
};

const confirmDelete = async (user) => {
  // Replacement for browser confirm (simplified for this step, could be a custom modal)
  if (confirm(`Voulez-vous vraiment supprimer l'utilisateur ${user.nom} ?`)) {
    try {
      await api.delete(`/users/${user.id}`);
      notification.success('Utilisateur supprimé');
      await loadUsers();
    } catch (error) {
      notification.error('Erreur suppression');
    }
  }
};

onMounted(loadUsers);
</script>

<style scoped>
.header-actions { display: flex; justify-content: space-between; align-items: center; }
.search-input { max-width: 300px; }
.help-text { font-size: 0.75rem; color: #6c757d; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
.btn-sm { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
.p-0 { padding: 0; }
</style>
