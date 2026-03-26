<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Chart from "primevue/chart";
import Card from "primevue/card";
import SelectButton from "primevue/selectbutton";

// --- 1. 資料處理 (Mock API) ---
const transactions = ref<any[]>([]);
const isLoading = ref(true);

const loadStatsData = async () => {
  isLoading.value = true;
  try {
    // 模擬 API 延遲
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const mockData = [
      { id: 1, category: "飲食", amount: 5200 },
      { id: 2, category: "交通", amount: 1200 },
      { id: 3, category: "購物", amount: 3500 },
      { id: 4, category: "娛樂", amount: 2000 },
      { id: 5, category: "醫療", amount: 800 },
    ];
    transactions.value = mockData;
  } catch (error) {
    console.error("Fetch Error:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadStatsData();
});

// --- 2. 圖表配置 ---
const chartType = ref("doughnut");
const typeOptions = ref([
  { label: "圓餅", value: "pie", icon: "pi pi-chart-pie" },
  { label: "環形", value: "doughnut", icon: "pi pi-circle" },
  { label: "長條", value: "bar", icon: "pi pi-chart-bar" },
]);

const chartData = computed(() => ({
  labels: transactions.value.map((i) => i.category),
  datasets: [
    {
      data: transactions.value.map((i) => i.amount),
      // 使用更符合 App 調性的配色
      backgroundColor: ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6"],
      hoverOffset: 15,
      borderRadius: chartType.value === "bar" ? 12 : 0,
      borderWidth: 0,
    },
  ],
}));

const chartOptions = computed(() => {
  const isBar = chartType.value === "bar";
  return {
    plugins: {
      legend: {
        display: !isBar,
        position: "bottom",
        labels: { 
          usePointStyle: true, 
          padding: 20, 
          color: 'gray',
          font: { weight: "700", size: 12 } 
        },
      },
    },
    scales: isBar ? {
      y: { 
        beginAtZero: true, 
        grid: { color: "rgba(120,120,120,0.1)", drawBorder: false },
        ticks: { color: 'gray', font: { weight: '600' } }
      },
      x: { 
        grid: { display: false },
        ticks: { color: 'gray', font: { weight: '600' } }
      },
    } : {},
    maintainAspectRatio: false,
    responsive: true,
    cutout: chartType.value === "doughnut" ? "75%" : "0%",
  };
});

const totalExpense = computed(() => transactions.value.reduce((a, b) => a + b.amount, 0));
</script>

<template>
  <div class="view-wrapper fade-in">
    
    <header class="view-header flex-column md:flex-row align-items-start md:align-items-center gap-4">
      <div class="title-group">
        <h1 class="view-title">數據分析</h1>
        <p class="text-xs font-bold opacity-30 tracking-widest mt-1 uppercase">Financial Analytics</p>
      </div>
      
      <SelectButton
        v-model="chartType"
        :options="typeOptions"
        optionLabel="label"
        optionValue="value"
        :unselectable="false" 
        class="custom-select-btn shadow-sm"
      >
        <template #option="slotProps">
          <div class="flex align-items-center gap-2 px-2">
            <i :class="slotProps.option.icon" class="text-xs"></i>
            <span class="font-bold text-xs uppercase">{{ slotProps.option.label }}</span>
          </div>
        </template>
      </SelectButton>
    </header>

    <main class="view-content stats-grid">
      <section class="chart-section">
        <Card class="theme-card chart-main-card">
          <template #content>
            <div class="chart-inner-layout p-2">
              <div class="chart-stage">
                <div v-if="isLoading" class="loader-overlay">
                  <i class="pi pi-spin pi-spinner text-3xl opacity-20"></i>
                </div>

                <template v-else>
                  <Chart
                    v-if="transactions.length > 0"
                    :key="chartType" 
                    :type="chartType"
                    :data="chartData"
                    :options="chartOptions"
                    class="main-chart-obj"
                  />
                  
                  <div v-if="chartType === 'doughnut'" class="chart-center-info">
                    <span class="text-xs font-black opacity-30 uppercase tracking-widest">Spent</span>
                    <span class="text-2xl font-black mt-1">${{ (totalExpense / 1000).toFixed(1) }}k</span>
                  </div>
                </template>
              </div>

              <div class="total-summary-card mt-5">
                <div class="flex flex-column">
                  <span class="text-xs font-black opacity-40 uppercase tracking-widest">Total Monthly Expense</span>
                  <div class="flex align-items-baseline gap-2 mt-1">
                    <span class="text-4xl font-black tracking-tighter">$ {{ totalExpense.toLocaleString() }}</span>
                    <span class="text-sm font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 border-round-lg">TWD</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </section>

      <section class="ranking-section">
        <div class="section-label mb-3 px-2">Category Ranking</div>
        
        <Card class="theme-card">
          <template #content>
            <div class="ranking-container">
              <div v-if="isLoading" class="flex flex-column gap-4 p-3">
                <div v-for="i in 5" :key="i" class="flex justify-content-between">
                  <div class="flex gap-3"><div class="w-2rem h-2rem bg-black-alpha-5 border-round-lg"></div><div class="w-5rem h-1rem bg-black-alpha-5 border-round-sm mt-2"></div></div>
                  <div class="w-4rem h-1rem bg-black-alpha-5 border-round-sm mt-2"></div>
                </div>
              </div>

              <template v-else>
                <div v-for="(item, index) in transactions" :key="item.category"
                     class="ranking-row flex align-items-center justify-content-between"
                     :class="{ 'last-row': index === transactions.length - 1 }">
                  
                  <div class="flex align-items-center gap-3">
                    <div class="rank-number" :class="'top-' + (index + 1)">
                      {{ index + 1 }}
                    </div>
                    <span class="font-black text-base">{{ item.category }}</span>
                  </div>

                  <div class="text-right">
                    <div class="font-black text-lg text-rose-500">$ {{ item.amount.toLocaleString() }}</div>
                    <div class="text-xs font-bold opacity-30 tracking-wide">{{ ((item.amount / totalExpense) * 100).toFixed(1) }}%</div>
                  </div>
                </div>
              </template>
            </div>
          </template>
        </Card>

        <div class="tip-card mt-4 p-4 border-round-3xl bg-primary-reverse opacity-80 flex align-items-center gap-4">
          <i class="pi pi-lightbulb text-2xl text-amber-500"></i>
          <p class="m-0 text-xs font-bold">比起上個月，您的「飲食」支出增加了 12%，建議可以多嘗試在家下廚喔！</p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* ⚡ 佈局與對稱性修正 */
.stats-grid { 
  display: grid; 
  grid-template-columns: 1fr 380px; 
  gap: 2.5rem; 
  width: 100%;
}

@media (max-width: 1100px) {
  .stats-grid { grid-template-columns: 1fr; gap: 2rem; }
}

/* 📈 圖表區塊 */
.chart-stage { height: 350px; position: relative; width: 100%; display: flex; justify-content: center; }
.main-chart-obj { width: 100% !important; height: 100% !important; }

.chart-center-info {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -60%);
  display: flex; flex-direction: column; align-items: center;
  pointer-events: none;
}

.total-summary-card {
  padding: 1.5rem;
  background: rgba(var(--app-primary-rgb), 0.05);
  border-radius: 22px;
  border: 1px solid rgba(var(--app-primary-rgb), 0.1);
}

/* 🏆 排行榜 */
.ranking-row { padding: 1.25rem 0.5rem; border-bottom: 1px solid var(--app-footer-border); }
.ranking-row.last-row { border-bottom: none; }

.rank-number {
  width: 28px; height: 28px;
  border-radius: 8px;
  background: rgba(var(--app-primary-rgb), 0.1);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 900; color: var(--app-primary);
}
.top-1 { background: #f59e0b !important; color: white !important; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3); }
.top-2 { background: #94a3b8 !important; color: white !important; }
.top-3 { background: #b45309 !important; color: white !important; }

/* 介面細節 */
.loader-overlay { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }

:deep(.custom-select-btn .p-button) {
  background: var(--app-card-bg) !important;
  border: 1px solid var(--app-footer-border) !important;
  color: var(--app-text) !important;
  border-radius: 12px;
}
:deep(.custom-select-btn .p-highlight) {
  background: var(--app-primary) !important;
  color: white !important;
  border-color: var(--app-primary) !important;
}

@media (max-width: 768px) {
  .chart-stage { height: 300px; }
  .view-header { align-items: stretch !important; }
  .custom-select-btn { width: 100%; }
  :deep(.custom-select-btn .p-button) { flex: 1; }
}

.tip-card { border: 1px solid var(--app-footer-border); }
</style>