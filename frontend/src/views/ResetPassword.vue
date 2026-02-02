<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Réinitialiser le mot de passe</h2>
      <form @submit.prevent="handleReset">
        <div class="form-group">
          <label>Nouveau mot de passe</label>
          <input v-model="newPassword" type="password" required placeholder="********" />
        </div>
        <div class="form-group">
          <label>Confirmer le mot de passe</label>
          <input v-model="confirmPassword" type="password" required placeholder="********" />
        </div>
        <button type="submit" :disabled="loading" class="btn-primary">
          {{ loading ? 'Réinitialisation...' : 'Réinitialiser' }}
        </button>
      </form>
      <div v-if="message" class="alert success">{{ message }}</div>
      <div v-if="error" class="alert error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';

const route = useRoute();
const router = useRouter();
const newPassword = ref('');
const confirmPassword = ref('');
const message = ref('');
const error = ref('');
const loading = ref(false);

const handleReset = async () => {
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Les mots de passe ne correspondent pas.';
    return;
  }
  
  loading.value = true;
  message.value = '';
  error.value = '';
  try {
    await api.post('/auth/reset-password', {
      email: route.query.email,
      token: route.query.token,
      newPassword: newPassword.value
    });
    message.value = 'Mot de passe réinitialisé. Redirection...';
    setTimeout(() => router.push('/login'), 2000);
  } catch (err) {
    error.value = err.response?.data?.message || 'Une erreur est survenue.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-container { display: flex; justify-content: center; align-items: center; min-height: 80vh; }
.auth-card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
.form-group { margin-bottom: 1.5rem; }
label { display: block; margin-bottom: 0.5rem; }
input { width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.btn-primary { width: 100%; padding: 0.8rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
.btn-primary:disabled { background: #ccc; }
.alert { margin-top: 1rem; padding: 0.8rem; border-radius: 4px; font-size: 0.9rem; }
.alert.success { background: #d4edda; color: #155724; }
.alert.error { background: #f8d7da; color: #721c24; }
</style>
