<template>
  <div class="student-dashboard">
    <div class="header-section">
        <h2>Mon Espace Élève</h2>
        <button @click="showPasswordModal = true" class="change-pass-btn">Changer mot de passe</button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <h3>Ma Moyenne</h3>
        <p class="stat-value">{{ moyenne }}</p>
      </div>
       <div class="stat-card">
        <h3>Mes Absences</h3>
        <p class="stat-value">{{ absencesCount }}</p>
      </div>
    </div>
    
    <div class="content-grid">
        <div class="section-card">
            <h3>Mes Cours</h3>
            <ul v-if="courses.length">
                <li v-for="course in courses" :key="course.id" class="course-item">
                    <strong>{{ course.titre }}</strong> 
                    <span :class="['type-badge', course.type]">{{ course.type }}</span>
                    <a :href="getFileUrl(course.file_url)" target="_blank" class="view-link">Voir</a>
                </li>
            </ul>
            <p v-else>Aucun cours disponible.</p>
        </div>

        <div class="section-card">
            <h3>Dernières Notes</h3>
            <ul v-if="grades.length">
                <li v-for="grade in grades" :key="grade.id">
                    {{ grade.matiere }}: <strong>{{ grade.note }} / 20</strong> ({{ grade.periode }})
                </li>
            </ul>
             <p v-else>Aucune note disponible.</p>
        </div>
    </div>

    <!-- Password Change Modal -->
    <div v-if="showPasswordModal" class="modal-overlay">
        <div class="modal-content">
            <h3>Changer le mot de passe</h3>
            <form @submit.prevent="handleChangePassword">
                <div class="form-group">
                    <label>Mot de passe actuel</label>
                    <input v-model="passForm.currentPassword" type="password" required />
                </div>
                <div class="form-group">
                    <label>Nouveau mot de passe</label>
                    <input v-model="passForm.newPassword" type="password" required />
                </div>
                <div class="form-group">
                    <label>Confirmer nouveau mot de passe</label>
                    <input v-model="passForm.confirmPassword" type="password" required />
                </div>
                <div class="modal-actions">
                    <button type="button" @click="showPasswordModal = false" class="btn-secondary">Annuler</button>
                    <button type="submit" class="btn-primary" :disabled="submitting">Enregistrer</button>
                </div>
            </form>
            <p v-if="passError" class="error-text">{{ passError }}</p>
            <p v-if="passSuccess" class="success-text">{{ passSuccess }}</p>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { useAuthStore } from '../stores/auth';
import performanceService from '../services/performanceService';
import absenceService from '../services/absenceService';
import courseService from '../services/courseService';
import api from '../services/api';

const authStore = useAuthStore();
const grades = ref([]);
const absences = ref([]);
const courses = ref([]);
const moyenne = ref(0);

// Password Change State
const showPasswordModal = ref(false);
const submitting = ref(false);
const passError = ref('');
const passSuccess = ref('');
const passForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});

const absencesCount = computed(() => absences.value.length);

const getFileUrl = (url) => {
    if (!url) return '#';
    const backendUrl = 'http://localhost:3000';
    return url.startsWith('/uploads') ? `${backendUrl}${url}` : url;
};

const loadData = async () => {
    try {
        const studentId = authStore.user.id;
        const pRes = await performanceService.getByStudent(studentId);
        grades.value = pRes.data.grades;
        moyenne.value = pRes.data.moyenne;

        const aRes = await absenceService.getByStudent(studentId);
        absences.value = aRes.data;

        const cRes = await courseService.getAll();
        courses.value = cRes.data;
    } catch (error) {
        console.error('Erreur chargement données étudiant:', error);
    }
};

const handleChangePassword = async () => {
    if (passForm.newPassword !== passForm.confirmPassword) {
        passError.value = "Les nouveaux mots de passe ne correspondent pas.";
        return;
    }
    
    submitting.value = true;
    passError.value = '';
    passSuccess.value = '';
    
    try {
        await api.post('/students/change-password', {
            currentPassword: passForm.currentPassword,
            newPassword: passForm.newPassword
        });
        passSuccess.value = "Mot de passe modifié avec succès.";
        setTimeout(() => {
            showPasswordModal.value = false;
            Object.assign(passForm, { currentPassword: '', newPassword: '', confirmPassword: '' });
            passSuccess.value = '';
        }, 2000);
    } catch (err) {
        passError.value = err.response?.data?.message || "Erreur lors du changement de mot de passe.";
    } finally {
        submitting.value = false;
    }
};

onMounted(loadData);
</script>

<style scoped>
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.change-pass-btn { background: #6c757d; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
.stats-grid { display: flex; gap: 1rem; margin-bottom: 2rem; }
.stat-card { flex: 1; background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
.stat-value { font-size: 2rem; font-weight: bold; color: #007bff; }
.content-grid { display: flex; gap: 2rem; flex-wrap: wrap; }
.section-card { flex: 1; min-width: 300px; background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
ul { list-style: none; padding: 0; }
li { padding: 0.5rem 0; border-bottom: 1px solid #eee; }
.course-item { display: flex; justify-content: space-between; align-items: center; }
.type-badge { font-size: 0.8rem; padding: 2px 6px; border-radius: 4px; background: #eee; text-transform: uppercase; }
.type-badge.pdf { background: #ffeeba; color: #856404; }
.type-badge.video { background: #d4edda; color: #155724; }
.view-link { color: #007bff; text-decoration: none; font-weight: bold; }

/* Modal Styles */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; padding: 2rem; border-radius: 8px; width: 100%; max-width: 500px; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; }
.form-group input { width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
.btn-primary { background: #007bff; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
.btn-secondary { background: #6c757d; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
.error-text { color: #dc3545; margin-top: 1rem; }
.success-text { color: #28a745; margin-top: 1rem; }
</style>
