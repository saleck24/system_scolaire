
<template>
  <div class="students-container">
    <div class="header">
      <button @click="$router.push('/')" class="back-btn">← Retour au Tableau de bord</button>
      <h1>Gestion des Élèves</h1>
    </div>
    
    <div class="actions">
      <button @click="openModal()" class="add-btn">Ajouter un élève</button>
    </div>

    <table class="student-table">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Niveau</th>
          <th>Établissement</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="student in students" :key="student.id">
          <td>{{ student.nom }}</td>
          <td>{{ student.niveau }}</td>
          <td>{{ student.etablissement }}</td>
          <td>
            <button @click="$router.push(`/students/${student.id}`)" class="details-btn">Détails</button>
            <button @click="openModal(student)" class="modify-btn">Modifier</button>
            <button @click="deleteStudent(student.id)" class="delete-btn">Supprimer</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h2>{{ isEditing ? 'Modifier' : 'Ajouter' }} un élève</h2>
        <form @submit.prevent="saveStudent">
          <div class="form-group">
            <label>Nom</label>
            <input v-model="form.nom" required />
          </div>
          <div class="form-group">
            <label>Niveau</label>
            <input v-model="form.niveau" required />
          </div>
          <div class="form-group">
            <label>Établissement</label>
            <input v-model="form.etablissement" required />
          </div>
          <div class="form-group">
            <label>Email (pour connexion)</label>
            <input v-model="form.email" type="email" placeholder="email@exemple.com" />
          </div>
          <div class="form-group">
            <label>Mot de passe {{ isEditing ? '(laisser vide pour ne pas changer)' : '' }}</label>
            <input v-model="form.password" type="password" />
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
import { ref, onMounted } from 'vue';
import studentService from '../services/studentService';

const students = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const loading = ref(false);

const form = ref({
  nom: '',
  niveau: '',
  etablissement: ''
});

const loadStudents = async () => {
  try {
    const response = await studentService.getAll();
    students.value = response.data;
  } catch (error) {
    console.error('Erreur chargement élèves:', error);
  }
};

const openModal = (student) => {
  if (student) {
    isEditing.value = true;
    form.value = { ...student, password: '' }; // Don't show hash, allow reset
  } else {
    isEditing.value = false;
    form.value = { nom: '', niveau: '', etablissement: '', email: '', password: '' };
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveStudent = async () => {
  loading.value = true;
  try {
    if (isEditing.value && form.value.id) {
      await studentService.update(form.value.id, form.value);
    } else {
      await studentService.create(form.value);
    }
    await loadStudents();
    closeModal();
  } catch (error) {
    console.error('Erreur sauvegarde:', error);
  } finally {
    loading.value = false;
  }
};

const deleteStudent = async (id) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet élève ?')) {
    try {
      await studentService.delete(id);
      await loadStudents();
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  }
};

onMounted(loadStudents);
</script>

<style scoped>
.students-container {
  padding: 1rem;
}
.header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
.back-btn { background: #6c757d; color: white; padding: 0.5rem 1rem; text-decoration: none; border-radius: 4px; cursor: pointer; border: none; }
.back-btn:hover { background: #5a6268; }
.actions {
  margin-bottom: 1rem;
}
.add-btn {
  background-color: #28a745;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  cursor: pointer;
}
.student-table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
th {
  background-color: #f2f2f2;
}
.delete-btn {
  background-color: #dc3545;
  color: white;
  margin-left: 0.5rem;
}
.details-btn {
  background-color: #007bff;
  color: white;
  margin-right: 0.5rem;
  border: none;
  cursor: pointer;
}
.modify-btn {
  background-color: #ffc107;
  color: #212529;
  margin-right: 0.5rem;
  border: none;
  cursor: pointer;
}
.modify-btn:hover {
  background-color: #e0a800;
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}
.modal-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.form-group {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
}
input {
  width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
}
</style>
