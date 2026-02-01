
<template>
  <div class="details-container" v-if="student">
    <div class="header">
      <button @click="$router.push('/students')" class="back-btn">Retour</button>
      <h1>Détails de {{ student.nom }}</h1>
    </div>
    <p>Niveau: {{ student.niveau }} | Établissement: {{ student.etablissement }}</p>

    <div v-if="alerts.length" class="alerts-section">
      <div v-for="(alert, idx) in alerts" :key="idx" :class="['alert', alert.severity]">
        {{ alert.message }}
      </div>
    </div>

    <div class="sections">
      <div class="section">
        <h2>Notes (Moyenne: {{ moyenne }})</h2>
        <form @submit.prevent="addNote" class="inline-form">
          <input v-model="newNote.matiere" placeholder="Matière" required />
          <input v-model="newNote.note" type="number" step="0.5" placeholder="Note" required />
          <input v-model="newNote.periode" placeholder="Période" required />
          <button type="submit">Ajouter</button>
        </form>
        <ul>
          <li v-for="grade in grades" :key="grade.id">
            {{ grade.matiere }}: {{ grade.note }} ({{ grade.periode }})
          </li>
        </ul>
      </div>

      <div class="section">
        <h2>Absences</h2>
        <form @submit.prevent="addAbsence" class="inline-form">
          <input v-model="newAbsence.date_absence" type="date" required />
          <input v-model="newAbsence.justification" placeholder="Justification" />
          <button type="submit">Noter Absence</button>
        </form>
        <ul>
          <li v-for="absence in absences" :key="absence.id">
            {{ new Date(absence.date_absence).toLocaleDateString() }} - {{ absence.justification || 'Non justifiée' }}
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div v-else>Chargement...</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import studentService from '../services/studentService';
import performanceService from '../services/performanceService';
import absenceService from '../services/absenceService';
import ruleEngine from '../services/ruleEngine';

const route = useRoute();
const studentId = Number(route.params.id);
const student = ref(null);
const grades = ref([]);
const moyenne = ref(0);
const absences = ref([]);
const alerts = ref([]);

const newNote = ref({ matiere: '', note: '', periode: '' });
const newAbsence = ref({ date_absence: '', justification: '' });

const loadData = async () => {
  try {
    // Load Student
    const sRes = await studentService.getById(studentId);
    student.value = sRes.data;

    // Load Grades
    const pRes = await performanceService.getByStudent(studentId);
    grades.value = pRes.data.grades;
    moyenne.value = pRes.data.moyenne;

    // Load Absences
    const aRes = await absenceService.getByStudent(studentId);
    absences.value = aRes.data; 

    // Run Rules
    alerts.value = await ruleEngine.analyze(studentId);
  } catch (error) {
    console.error('Erreur chargement données:', error);
  }
};

const addNote = async () => {
  try {
    await performanceService.add({ ...newNote.value, student_id: studentId });
    newNote.value = { matiere: '', note: '', periode: '' };
    loadData();
  } catch (error) {
    alert('Erreur ajout note');
  }
};

const addAbsence = async () => {
  try {
    await absenceService.add({ ...newAbsence.value, student_id: studentId });
    newAbsence.value = { date_absence: '', justification: '' };
    loadData();
  } catch (error) {
    alert('Erreur ajout absence');
  }
};

onMounted(loadData);
</script>

<style scoped>
.details-container { padding: 1rem; }
.header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
.back-btn { background: #6c757d; color: white; padding: 0.5rem 1rem; text-decoration: none; border-radius: 4px; cursor: pointer; border: none; }
.back-btn:hover { background: #5a6268; }
.sections { display: flex; gap: 2rem; }
.section { flex: 1; background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.inline-form { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
input { padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
button { background: #007bff; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
ul { list-style: none; padding: 0; }
li { padding: 0.5rem 0; border-bottom: 1px solid #eee; }
.alerts-section { margin-bottom: 1rem; }
.alert { padding: 1rem; margin-bottom: 0.5rem; border-radius: 4px; }
.alert.critical { background-color: #f8d7da; color: #721c24; }
.alert.warning { background-color: #fff3cd; color: #856404; }
.alert.info { background-color: #d1ecf1; color: #0c5460; }
</style>
