<template>
  <div class="login-container">
    <div class="card login-card">
      <h2 class="text-center">Connexion</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Email</label>
          <input v-model="email" type="email" placeholder="votre@email.com" required />
        </div>
        <div class="form-group">
          <label>Mot de passe</label>
          <input v-model="password" type="password" placeholder="••••••••" required />
        </div>
        <button type="submit" class="btn btn-primary w-100" :disabled="loading">
          {{ loading ? 'Connexion en cours...' : 'Se connecter' }}
        </button>
        <p v-if="error" class="error-text text-center mt-2">{{ error }}</p>
        
        <div class="auth-links mt-2">
            <p class="text-center small">
            Pas de compte ? <router-link to="/register">S'inscrire</router-link>
            </p>
            <p class="text-center small">
            <router-link to="/forgot-password" class="text-secondary">Mot de passe oublié ?</router-link>
            </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';
import authService from '../services/authService';

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const router = useRouter();
const authStore = useAuthStore();
const notification = useNotificationStore();

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  try {
    const response = await authService.login({ email: email.value, password: password.value });
    authStore.login(response.data.token, response.data.user);
    notification.success(`Bienvenue, ${response.data.user.nom}`);
    router.push('/');
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur de connexion';
    notification.error(error.value);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.login-card {
  width: 100%;
  max-width: 400px;
}
.w-100 { width: 100%; }
.small { font-size: 0.9rem; }
.text-secondary { color: #6c757d; text-decoration: none; }
.text-secondary:hover { text-decoration: underline; }
</style>
