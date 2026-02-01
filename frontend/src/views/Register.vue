<template>
  <div class="register-container">
    <div class="register-card">
      <h2>Inscription</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label>Nom complet</label>
          <input v-model="name" type="text" required />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="email" type="email" required />
        </div>
        <div class="form-group">
          <label>Mot de passe</label>
          <input v-model="password" type="password" required />
        </div>
        <!-- Role selection removed for security, forced to 'enseignant' -->
        <button type="submit" :disabled="loading">
          {{ loading ? 'Inscription...' : "S'inscrire" }}
        </button>
        <p v-if="error" class="error">{{ error }}</p>
        <p class="login-link">
          Déjà un compte ? <router-link to="/login">Se connecter</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../services/authService';

const name = ref('');
const email = ref('');
const password = ref('');
const role = ref('enseignant');
const loading = ref(false);
const error = ref('');
const router = useRouter();

const handleRegister = async () => {
  loading.value = true;
  error.value = '';
  try {
    await authService.register({
      nom: name.value,
      email: email.value,
      password: password.value,
      role: role.value
    });
    // Redirect to login after successful registration
    router.push('/login');
  } catch (err) {
    error.value = err.response?.data?.message || "Erreur lors de l'inscription";
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
  background-color: #f5f5f5;
}
.register-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}
.form-group {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
}
input, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  width: 100%;
  padding: 0.75rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
}
button:disabled {
  background-color: #ccc;
}
.error {
  color: red;
  margin-top: 1rem;
  text-align: center;
}
.login-link {
  text-align: center;
  font-size: 0.9rem;
}
</style>
