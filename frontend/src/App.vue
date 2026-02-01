
<template>
  <div v-if="!isOnline" class="offline-banner">
    Mode Hors Ligne - Vos modifications seront synchronisées dès le retour de la connexion.
  </div>
  <router-view />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isOnline = ref(navigator.onLine);

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine;
};

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
});

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
});
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f5f5;
}
.offline-banner {
  background-color: #ff9800;
  color: white;
  text-align: center;
  padding: 0.5rem;
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 1000;
}
</style>
