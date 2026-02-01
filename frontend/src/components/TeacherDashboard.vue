<template>
  <div class="teacher-dashboard">
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Élèves</h3>
        <p class="stat-value">{{ totalStudents }}</p>
      </div>
      <div class="stat-card">
        <h3>Moyenne Globale</h3>
        <p class="stat-value">{{ globalAverage }}</p>
      </div>
      <div class="stat-card">
        <h3>Alertes</h3>
        <p class="stat-value">{{ allAlertsCount }}</p>
      </div>
    </div>

    <div class="grid-container">
      <div class="chart-container">
        <h3>Répartition des Notes</h3>
        <Bar v-if="chartData.labels" :data="chartData" :options="chartOptions" />
        <p v-else>Chargement des données...</p>
      </div>

      <div class="section-card">
        <h3>Alertes Récentes</h3>
        <div v-if="alerts.length" class="alert-list">
          <div v-for="(alert, index) in alerts" :key="index" :class="['alert-item', alert.severity]">
            <strong>{{ alert.studentName }}</strong>: {{ alert.message }}
          </div>
        </div>
        <p v-else>Aucune alerte à signaler.</p>
      </div>
    </div>

    <div class="actions-bar">
      <router-link to="/students" class="action-btn">Gérer les Élèves</router-link>
      <router-link to="/courses" class="action-btn secondary">Gérer les Cours</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import studentService from '../services/studentService';
import performanceService from '../services/performanceService';
import absenceService from '../services/absenceService';
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import ruleEngine from '../services/ruleEngine';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const totalStudents = ref(0);
const globalAverage = ref(0);
const alerts = ref([]);
const allAlertsCount = computed(() => alerts.value.length);
const chartData = ref({});
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: true
});

const loadStats = async () => {
  try {
    const sRes = await studentService.getAll();
    const students = sRes.data;
    totalStudents.value = students.length;

    const allGrades = await performanceService.getAllLocal();
    const allAbsences = await absenceService.getAllLocal();

    let sum = 0;
    allGrades.forEach(g => sum += Number(g.note));
    globalAverage.value = allGrades.length ? (sum / allGrades.length).toFixed(2) : 0;

    const allCollectedAlerts = [];
    for (const student of students) {
        const studentAlerts = await ruleEngine.analyze(student.id);
        studentAlerts.forEach(a => {
            allCollectedAlerts.push({
                ...a,
                studentName: student.nom
            });
        });
    }
    alerts.value = allCollectedAlerts;

    const distribution = [0, 0, 0, 0, 0];
    allGrades.forEach(g => {
        const n = Number(g.note);
        if (n < 5) distribution[0]++;
        else if (n < 8) distribution[1]++;
        else if (n < 10) distribution[2]++;
        else if (n < 15) distribution[3]++;
        else distribution[4]++;
    });

    chartData.value = {
        labels: ['0-5', '5-8', '8-10', '10-15', '15-20'],
        datasets: [{
            label: 'Nombre de notes',
            backgroundColor: '#007bff',
            data: distribution
        }]
    };

  } catch (error) {
    console.error('Erreur chargement stats:', error);
  }
};

onMounted(loadStats);
</script>

<style scoped>
.stats-grid { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
.stat-card { flex: 1; min-width: 200px; background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
.stat-card.warning { border-left: 5px solid #dc3545; }
.stat-value { font-size: 2.5rem; font-weight: bold; margin: 0.5rem 0 0; color: #333; }
.grid-container { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
.chart-container, .section-card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.actions-container { grid-column: span 2; display: flex; gap: 1rem; margin-top: 1rem; }
.action-links { display: flex; gap: 1rem; width: 100%; }
.action-btn { flex: 1; text-align: center; background: #007bff; color: white; padding: 1rem; border-radius: 8px; text-decoration: none; font-weight: bold; }

.alert-list { display: flex; flex-direction: column; gap: 0.75rem; max-height: 400px; overflow-y: auto; }
.alert-item { padding: 0.75rem; border-radius: 6px; border-left: 4px solid #ccc; font-size: 0.9rem; }
.alert-item.critical { background: #f8d7da; border-left-color: #dc3545; color: #721c24; }
.alert-item.warning { background: #fff3cd; border-left-color: #ffc107; color: #856404; }
.alert-item.info { background: #d1ecf1; border-left-color: #17a2b8; color: #0c5460; }

.actions-bar { display: flex; gap: 1rem; margin-top: 2rem; }
.actions-bar .action-btn { flex: 1; text-align: center; padding: 1rem; border-radius: 8px; color: white; background: #007bff; text-decoration: none; font-weight: bold; }
.actions-bar .action-btn.secondary { background: #28a745; }
</style>
