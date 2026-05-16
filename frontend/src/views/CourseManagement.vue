<template>
  <!-- MainLayout assure la persistance de la barre latérale -->
  <MainLayout>
    <div class="course-management">
      <div class="header-actions mb-2">
          <h1>Gestion des Cours</h1>
          <button @click="openModal()" class="btn btn-success">Ajouter un cours</button>
      </div>

      <!-- Barre de recherche pour filtrer les cours par titre -->
      <div class="table-controls mb-2">
          <input v-model="searchQuery" placeholder="Rechercher par titre..." class="search-input" />
      </div>

      <!-- Tableau des cours disponibles -->
      <div class="card p-0">
          <table class="data-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Type</th>
                <th>Fichier</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="course in filteredCourses" :key="course.id">
                <td>{{ course.titre }}</td>
                <td>
                   <span :class="['badge', getTypeBadgeClass(course.type)]">{{ course.type }}</span>
                </td>
                <td>
                  <!-- Lien pour ouvrir/télécharger le fichier associé -->
                  <a :href="getFileUrl(course.file_url)" target="_blank" class="btn btn-secondary btn-sm">Ouvrir</a>
                </td>
                <td>
                  <button @click="confirmDelete(course)" class="btn btn-danger btn-sm">Supprimer</button>
                </td>
              </tr>
              <tr v-if="filteredCourses.length === 0">
                  <td colspan="4" class="text-center">Aucun cours trouvé</td>
              </tr>
            </tbody>
          </table>
      </div>

      <!-- Modale de téléversement d'un nouveau cours -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <h2>Ajouter un cours</h2>
          <form @submit.prevent="saveCourse">
            <div class="form-group">
              <label>Titre du cours</label>
              <input v-model="form.titre" placeholder="Introduction à l'Algèbre" required />
            </div>
             <div class="form-group">
              <label>Type de contenu</label>
               <select v-model="form.type">
                  <option value="pdf">Document PDF</option>
                  <option value="video">Vidéo (MP4)</option>
                  <option value="audio">Audio (MP3)</option>
              </select>
            </div>
             <div class="form-group">
              <label>Fichier</label>
              <input type="file" @change="handleFileChange" accept=".pdf, .mp4, .mp3, .mpeg" required />
              <small class="help-text">Formats supportés : PDF, MP4, MP3</small>
            </div>
            <div class="modal-actions mt-2">
              <button type="button" @click="closeModal" class="btn btn-secondary">Annuler</button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                  {{ loading ? 'Téléversement...' : 'Enregistrer' }}
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
import courseService from '../services/courseService';
import { useNotificationStore } from '../stores/notification';
import MainLayout from '../components/MainLayout.vue';

// États réactifs
const courses = ref([]);
const showModal = ref(false);
const loading = ref(false);
const searchQuery = ref('');
const notification = useNotificationStore();

const form = ref({
  titre: '',
  type: 'pdf'
});
const selectedFile = ref(null);

/**
 * Filtrage dynamique des cours
 */
const filteredCourses = computed(() => {
    return courses.value.filter(c => 
        c.titre.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

/**
 * Gère la sélection de fichier
 */
const handleFileChange = (e) => {
    selectedFile.value = e.target.files[0];
};

/**
 * Construit l'URL complète pour accéder au fichier sur le backend
 */
const getFileUrl = (url) => {
    if (!url) return '#';
    const backendUrl = 'http://localhost:3000';
    return url.startsWith('/uploads') ? `${backendUrl}${url}` : url;
};

/**
 * Retourne la classe CSS du badge selon le type de cours
 */
const getTypeBadgeClass = (type) => {
    switch(type) {
        case 'pdf': return 'btn-warning';
        case 'video': return 'btn-success';
        case 'audio': return 'btn-info';
        default: return 'btn-secondary';
    }
};

/**
 * Charge les cours depuis l'API
 */
const loadCourses = async () => {
  try {
    const res = await courseService.getAll();
    courses.value = res.data;
  } catch (error) {
    notification.error('Erreur chargement cours');
  }
};

/**
 * Initialise et ouvre la modale
 */
const openModal = () => {
    form.value = { titre: '', type: 'pdf' };
    selectedFile.value = null;
    showModal.value = true;
};

/**
 * Ferme la modale
 */
const closeModal = () => {
  showModal.value = false;
};

/**
 * Enregistre le cours (envoi en multipart/form-data)
 */
const saveCourse = async () => {
  if (!selectedFile.value) {
      notification.info('Veuillez sélectionner un fichier');
      return;
  }
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append('titre', form.value.titre);
    formData.append('type', form.value.type);
    formData.append('file', selectedFile.value);

    await courseService.create(formData);
    notification.success('Cours ajouté avec succès');
    await loadCourses();
    closeModal();
  } catch (error) {
    notification.error(error.response?.data?.message || 'Erreur création');
  } finally {
    loading.value = false;
  }
};

/**
 * Supprime un cours après confirmation
 */
const confirmDelete = async (course) => {
  if (confirm(`Voulez-vous supprimer le cours "${course.titre}" ?`)) {
    try {
      await courseService.delete(course.id);
      notification.success('Cours supprimé');
      await loadCourses();
    } catch (error) {
       notification.error('Erreur suppression');
    }
  }
};

// Cycle de vie
onMounted(loadCourses);
</script>

<style scoped>
.header-actions { display: flex; justify-content: space-between; align-items: center; }
.search-input { max-width: 300px; }
.help-text { font-size: 0.75rem; color: #6c757d; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
.btn-sm { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
.p-0 { padding: 0; }
</style>
