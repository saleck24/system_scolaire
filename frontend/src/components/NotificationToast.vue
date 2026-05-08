<template>
  <div class="notification-container">
    <TransitionGroup name="list">
      <div v-for="note in store.notifications" :key="note.id" :class="['notification', note.type]">
        <div class="content">{{ note.message }}</div>
        <button @click="store.remove(note.id)" class="close-btn">&times;</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useNotificationStore } from '../stores/notification';
const store = useNotificationStore();
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification {
  min-width: 250px;
  padding: 1rem;
  border-radius: 4px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.notification.success { background-color: var(--success-color); }
.notification.danger { background-color: var(--danger-color); }
.notification.info { background-color: var(--info-color); }

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0 0 0 10px;
}

.list-enter-active, .list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
