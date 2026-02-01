<template>
  <div class="student-dashboard">
    <h2>Mon Espace Élève</h2>
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import performanceService from '../services/performanceService';
import absenceService from '../services/absenceService';
import courseService from '../services/courseService';

const authStore = useAuthStore();
const grades = ref([]);
const absences = ref([]);
const courses = ref([]);
const moyenne = ref(0);

const absencesCount = computed(() => absences.value.length);

const getFileUrl = (url) => {
    if (!url) return '#';
    const backendUrl = 'http://localhost:3000';
    return url.startsWith('/uploads') ? `${backendUrl}${url}` : url;
};

const loadData = async () => {
    try {
        const studentId = authStore.user.id;
        
        // Load Grades
        // Assuming getByStudent works for the student role (might need backend adjustment if strictly for teachers)
        // Adjusting backend might be needed if it blocks students.
        // For now, let's try calling it.
        const pRes = await performanceService.getByStudent(studentId);
        grades.value = pRes.data.grades;
        moyenne.value = pRes.data.moyenne;

        // Load Absences
        const aRes = await absenceService.getByStudent(studentId);
        absences.value = aRes.data;

        // Load Courses
        const cRes = await courseService.getAll();
        courses.value = cRes.data;

    } catch (error) {
        console.error('Erreur chargement données étudiant:', error);
    }
};

onMounted(loadData);
</script>

<style scoped>
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
</style>
