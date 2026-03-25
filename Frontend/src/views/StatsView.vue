<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Chart from "primevue/chart";
import Card from "primevue/card";
import SelectButton from "primevue/selectbutton";

// --- 1. 資料接口 (API Interface) ---
const transactions = ref<any[]>([]);
const isLoading = ref(true);

const loadStatsData = async () => {
  isLoading.value = true;
  try {
    // 模擬 API 延遲
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // 未來將這裡替換為實際 API 呼叫
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

// --- 2. 圖表種類控管 ---
const chartType = ref("doughnut");
const typeOptions = ref([
  { label: "圓餅", value: "pie", icon: "pi pi-chart-pie" },
  { label: "環形", value: "doughnut", icon: "pi pi-circle" },
  { label: "長條", value: "bar", icon: "pi pi-chart-bar" },
]);

// --- 3. 圖表渲染邏輯 ---
const chartData = computed(() => ({
  labels: transactions.value.map((i) => i.category),
  datasets: [
    {
      data: transactions.value.map((i) => i.amount),
      backgroundColor: ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
      hoverOffset: 20,
      borderRadius: chartType.value === "bar" ? 8 : 0,
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
        labels: { usePointStyle: true, padding: 15, font: { weight: "700", size: 11 } },
      },
    },
    scales: isBar ? {
      y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
      x: { grid: { display: false } },
    } : {},
    maintainAspectRatio: false,
    responsive: true,
    cutout: chartType.value === "doughnut" ? "70%" : "0%",
  };
});

const totalExpense = computed(() => transactions.value.reduce((a, b) => a + b.amount, 0));
</script>

<template>
  <div class="view-wrapper fade-in">
    <header class="view-header mobile-stack">
      <h1 class="view-title">數據分析</h1>
      
      <SelectButton
        v-model="chartType"
        :options="typeOptions"
        optionLabel="label"
        optionValue="value"
        :unselectable="false" 
        class="custom-select-btn"
      >
        <template #option="slotProps">
          <i :class="slotProps.option.icon" class="mr-1"></i>
          <span class="font-bold text-xs">{{ slotProps.option.label }}</span>
        </template>
      </SelectButton>
    </header>

    <main class="view-content stats-grid">
      <section class="chart-section">
        <Card class="theme-card chart-main-card shadow-sm">
          <template #content>
            <div class="stats-main-layout">
              
              <div class="chart-container-inner">
                <Chart
                  v-if="!isLoading && transactions.length > 0"
                  :key="chartType" 
                  :type="chartType"
                  :data="chartData"
                  :options="chartOptions"
                  class="chart-element"
                />
                
                <div v-if="isLoading" class="flex justify-content-center align-items-center h-full">
                  <i class="pi pi-spin pi-spinner text-2xl opacity-20"></i>
                </div>

                <div v-if="chartType === 'doughnut' && !isLoading" class="doughnut-center-text">
                  <p class="m-0 opacity-40 text-xs font-bold uppercase tracking-tighter">TOTAL</p>
                  <p class="m-0 font-black text-xl">${{ (totalExpense / 1000).toFixed(1) }}k</p>
                </div>
              </div>

              <div class="total-display-box mt-3">
                <p class="text-xs font-bold opacity-50 m-0 uppercase tracking-widest">Monthly Total</p>
                <h1 class="total-amount">$ {{ totalExpense.toLocaleString() }}</h1>
              </div>

            </div>
          </template>
        </Card>
      </section>

      <section class="detail-section">
        <div class="section-label mb-2 px-1">
          <span class="text-xs font-black opacity-40 tracking-widest uppercase">Category Ranking</span>
        </div>
        <Card class="theme-card border-none shadow-sm">
          <template #content>
            <div v-for="(item, index) in transactions" :key="item.category"
                 class="ranking-item flex align-items-center justify-content-between py-3"
                 :class="{ 'border-bottom-1 border-white-alpha-10': index !== transactions.length - 1 }">
              <div class="flex align-items-center gap-3">
                <span class="rank-badge" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
                <span class="font-black text-base">{{ item.category }}</span>
              </div>
              <div class="text-right">
                <div class="font-black text-lg text-red-500">$ {{ item.amount.toLocaleString() }}</div>
                <div class="text-xs font-bold opacity-30">{{ ((item.amount / totalExpense) * 100).toFixed(1) }}%</div>
              </div>
            </div>
          </template>
        </Card>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* 基礎樣式與手機版溢出修正 */
.view-wrapper { width: 100%; max-width: 1000px; margin: 0 auto; overflow-x: hidden; }
.stats-grid { display: grid; grid-template-columns: 1fr 400px; gap: 2rem; width: 100%; }
.stats-main-layout { display: flex; flex-direction: column; width: 100%; }
.chart-main-card { border-radius: 28px !important; width: 100%; overflow: hidden; }
.chart-container-inner { height: 350px; position: relative; width: 100%; }
.chart-element { width: 100% !important; height: 100% !important; }

.doughnut-center-text {
  position: absolute;
  top: 45%; left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.total-display-box {
  background: rgba(var(--app-primary-rgb), 0.05);
  text-align: center;
  padding: 1.5rem;
  border-radius: 20px;
}

.total-amount { font-size: 2.5rem; font-weight: 900; margin: 5px 0 0 0; letter-spacing: -1px; }

.rank-badge {
  width: 24px; height: 24px;
  background: rgba(var(--app-primary-rgb), 0.1);
  border-radius: 6px;
  display: flex; justify-content: center; align-items: center;
  font-size: 0.7rem; font-weight: 900;
}
.rank-1 { background: #f59e0b; color: white; }

@media (max-width: 1100px) {
  .stats-grid { grid-template-columns: 1fr; gap: 1.5rem; }
}

@media (max-width: 768px) {
  .view-wrapper { padding: 0.75rem; }
  .mobile-stack { flex-direction: column !important; align-items: flex-start !important; gap: 1rem !important; }
  .chart-container-inner { height: 300px; }
  :deep(.p-card-body) { padding: 1rem !important; }
  :deep(.p-card-content) { padding: 0 !important; }
  .total-amount { font-size: 1.8rem; }
  .custom-select-btn { width: 100%; display: flex; }
  :deep(.custom-select-btn .p-button) { flex: 1; padding: 0.5rem 0.2rem; font-size: 0.75rem; }
}

:deep(.custom-select-btn .p-button) { background: var(--app-footer-bg); border-color: var(--app-footer-border); color: var(--app-text); }
:deep(.custom-select-btn .p-highlight) { background: var(--app-primary) !important; color: white !important; }
</style>