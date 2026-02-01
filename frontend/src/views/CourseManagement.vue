<template>
  <div class="course-management">
    <div class="header">
        <button @click="$router.push('/')" class="back-btn">← Retour</button>
        <h1>Gestion des Cours</h1>
    </div>

    <div class="actions">
      <button @click="openModal()" class="add-btn">Ajouter un cours</button>
    </div>

    <table class="course-table">
      <thead>
        <tr>
          <th>Titre</th>
          <th>Type</th>
          <th>Lien</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="course in courses" :key="course.id">
          <td>{{ course.titre }}</td>
          <td>
             <span :class="['type-badge', course.type]">{{ course.type }}</span>
          </td>
          <td>
            <a :href="getFileUrl(course.file_url)" target="_blank">Voir</a>
          </td>
          <td>
            <button @click="deleteCourse(course.id)" class="delete-btn">Supprimer</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h2>Ajouter un cours</h2>
        <form @submit.prevent="saveCourse">
          <div class="form-group">
            <label>Titre</label>
            <input v-model="form.titre" required />
          </div>
           <div class="form-group">
            <label>Type</label>
             <select v-model="form.type">
                <option value="pdf">PDF</option>
                <option value="video">Vidéo</option>
                <option value="audio">Audio</option>
            </select>
          </div>
           <div class="form-group">
            <label>Fichier (PDF, MP4, MP3)</label>
            <input type="file" @change="handleFileChange" accept=".pdf, .mp4, .mp3, .mpeg" required />
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
import courseService from '../services/courseService';

const courses = ref([]);
const showModal = ref(false);
const loading = ref(false);

const form = ref({
  titre: '',
  type: 'pdf'
});
const selectedFile = ref(null);

const handleFileChange = (e) => {
    selectedFile.value = e.target.files[0];
};

const getFileUrl = (url) => {
    if (!url) return '#';
    // If it's a relative path starting with /uploads, point to backend
    // Assuming backend runs on the same host or we have its URL
    const backendUrl = 'http://localhost:3000'; // Should ideally come from config
    return url.startsWith('/uploads') ? `${backendUrl}${url}` : url;
};

const loadCourses = async () => {
  try {
    const res = await courseService.getAll();
    courses.value = res.data;
  } catch (error) {
    console.error('Erreur chargement cours:', error);
  }
};

const openModal = () => {
    form.value = { titre: '', type: 'pdf' };
    selectedFile.value = null;
    showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveCourse = async () => {
  if (!selectedFile.value) {
      alert('Veuillez sélectionner un fichier.');
      return;
  }
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append('titre', form.value.titre);
    formData.append('type', form.value.type);
    formData.append('file', selectedFile.value);

    // Using generic api instance for FormData or updating service
    await courseService.create(formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    await loadCourses();
    closeModal();
  } catch (error) {
    alert(error.response?.data?.message || 'Erreur création');
  } finally {
    loading.value = false;
  }
};

const deleteCourse = async (id) => {
  if (confirm('Êtes-vous sûr ?')) {
    try {
      await courseService.delete(id);
      await loadCourses();
    } catch (error) {
       console.error('Erreur suppression:', error);
    }
  }
};

onMounted(loadCourses);
</script>

<style scoped>
.course-management { padding: 1rem; }
.header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
.back-btn { background: #6c757d; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }
.add-btn { background: #28a745; color: white; padding: 0.5rem 1rem; border: none; cursor: pointer; margin-bottom: 1rem; }
.course-table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
th { background-color: #f2f2f2; }
.delete-btn { background: #dc3545; color: white; border: none; padding: 0.25rem 0.5rem; cursor: pointer; }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; }
.modal { background: white; padding: 2rem; border-radius: 8px; width: 400px; }
.type-badge { padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; text-transform: uppercase; }
.type-badge.pdf { background: #ffeeba; color: #856404; }
.type-badge.video { background: #d4edda; color: #155724; }
.form-group { margin-bottom: 1rem; }
input, select { width: 100%; padding: 0.5rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
</style>
