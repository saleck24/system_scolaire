<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Mot de passe oublié</h2>
      <p>Entrez votre email pour recevoir un lien de réinitialisation.</p>
      <form @submit.prevent="handleForgot">
        <div class="form-group">
          <label>Email</label>
          <input v-model="email" type="email" required placeholder="votre@email.com" />
        </div>
        <button type="submit" :disabled="loading" class="btn-primary">
          {{ loading ? 'Envoi...' : 'Envoyer le lien' }}
        </button>
      </form>
      <div v-if="message" class="alert success">{{ message }}</div>
      <div v-if="error" class="alert error">{{ error }}</div>
      <div class="auth-footer">
        <router-link to="/login">Retour à la connexion</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '../services/api';

const email = ref('');
const message = ref('');
const error = ref('');
const loading = ref(false);

const handleForgot = async () => {
  loading.value = true;
  message.value = '';
  error.value = '';
  try {
    const res = await api.post('/auth/forgot-password', { email: email.value });
    message.value = res.data.message;
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
.auth-footer { margin-top: 1.5rem; text-align: center; }
</style>
