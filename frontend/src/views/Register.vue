<template>
  <div class="register-container">
    <div class="card register-card">
      <h2 class="text-center">Inscription</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label>Nom complet</label>
          <input v-model="name" type="text" placeholder="Prénom Nom" required />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="email" type="email" placeholder="votre@email.com" required />
        </div>
        <div class="form-group">
          <label>Mot de passe</label>
          <input v-model="password" type="password" placeholder="••••••••" required />
          <small class="help-text">Minimum 6 caractères</small>
        </div>
        <button type="submit" class="btn btn-success w-100" :disabled="loading">
          {{ loading ? 'Inscription en cours...' : "S'inscrire" }}
        </button>
        <p v-if="error" class="error-text text-center mt-2">{{ error }}</p>
        <p class="text-center small mt-2">
          Déjà un compte ? <router-link to="/login">Se connecter</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '../stores/notification';
import authService from '../services/authService';

const name = ref('');
const email = ref('');
const password = ref('');
const role = ref('enseignant');
const loading = ref(false);
const error = ref('');
const router = useRouter();
const notification = useNotificationStore();

const handleRegister = async () => {
  if (password.value.length < 6) {
    error.value = "Le mot de passe doit faire au moins 6 caractères";
    notification.error(error.value);
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    await authService.register({
      nom: name.value,
      email: email.value,
      password: password.value,
      role: role.value
    });
    notification.success("Compte créé avec succès ! Connectez-vous.");
    router.push('/login');
  } catch (err) {
    error.value = err.response?.data?.message || "Erreur lors de l'inscription";
    notification.error(error.value);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.register-card {
  width: 100%;
  max-width: 400px;
}
.w-100 { width: 100%; }
.small { font-size: 0.9rem; }
.help-text { color: #6c757d; font-size: 0.75rem; }
</style>
