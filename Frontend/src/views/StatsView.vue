<script setup lang="ts">
import { ref, computed } from "vue";
import Chart from "primevue/chart";
import Card from "primevue/card";
import SelectButton from "primevue/selectbutton";

// 1. 模擬資料
const transactions = ref([
  { id: 1, category: "飲食", amount: 5200, type: "Expense" },
  { id: 2, category: "交通", amount: 1200, type: "Expense" },
  { id: 3, category: "購物", amount: 3500, type: "Expense" },
  { id: 4, category: "娛樂", amount: 2000, type: "Expense" },
  { id: 5, category: "醫療", amount: 800, type: "Expense" },
]);

// 2. 圖表種類選取
const chartType = ref("doughnut");
const typeOptions = ref([
  { label: "圓餅", value: "pie", icon: "pi pi-chart-pie" },
  { label: "環形", value: "doughnut", icon: "pi pi-circle" },
  { label: "長條", value: "bar", icon: "pi pi-chart-bar" },
]);

// 3. 圖表資料
const chartData = computed(() => ({
  labels: transactions.value.map((i) => i.category),
  datasets: [
    {
      label: "支出金額",
      data: transactions.value.map((i) => i.amount),
      backgroundColor: ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
      hoverOffset: 25,
      borderRadius: chartType.value === "bar" ? 10 : 0,
    },
  ],
}));

// 4. 圖表設定
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
          font: { weight: "700", size: 12 },
        },
      },
    },
    scales: isBar
      ? {
          y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
          x: { grid: { display: false } },
        }
      : {},
    maintainAspectRatio: false,
    cutout: chartType.value === "doughnut" ? "70%" : "0%",
  };
});

const totalExpense = computed(() =>
  transactions.value.reduce((a, b) => a + b.amount, 0),
);
</script>

<template>
  <div class="view-wrapper fade-in">
    <header class="view-header sm:flex-row flex-column gap-3 sm:align-items-end">
      <h1 class="view-title">數據分析</h1>

      <SelectButton
        v-model="chartType"
        :options="typeOptions"
        optionLabel="label"
        optionValue="value"
        class="custom-select-btn"
      >
        <template #option="slotProps">
          <i :class="slotProps.option.icon" class="mr-2"></i>
          <span class="font-bold text-xs">{{ slotProps.option.label }}</span>
        </template>
      </SelectButton>
    </header>

    <main class="view-content stats-grid">
      <section class="chart-section">
        <Card class="theme-card chart-main-card shadow-sm h-full">
          <template #content> <div class="flex flex-column h-full">
              <div class="chart-container-inner">
                <Chart
                  :key="chartType" 
                  :type="chartType"
                  :data="chartData"
                  :options="chartOptions"
                  class="h-full"
                />

                <div v-if="chartType === 'doughnut'" class="doughnut-center-text">
                  <p class="m-0 opacity-50 text-xs font-bold uppercase">Total</p>
                  <p class="m-0 font-black text-xl">
                    ${{ (totalExpense / 1000).toFixed(1) }}k
                  </p>
                </div>
              </div>

              <div class="total-display-box mt-4 p-4 border-round-xl">
                <p class="text-sm font-bold opacity-50 m-0">本月支出總計</p>
                <h1 class="text-4xl font-black m-0 mt-1">
                  $ {{ totalExpense.toLocaleString() }}
                </h1>
              </div>
            </div>
          </template>
        </Card>
      </section>

      <section class="detail-section">
        <div class="section-label mb-3 px-1">
          <span class="text-xs font-black opacity-40 tracking-widest uppercase">Category Ranking</span>
        </div>

        <div class="ranking-list">
          <Card class="theme-card border-none mb-3">
            <template #content>
              <div
                v-for="(item, index) in transactions"
                :key="item.category"
                class="ranking-item flex align-items-center justify-content-between py-3"
                :class="{
                  'border-bottom-1 border-white-alpha-10':
                    index !== transactions.length - 1,
                }"
              >
                <div class="flex align-items-center gap-3">
                  <span class="rank-badge" :class="'rank-' + (index + 1)">{{
                    index + 1
                  }}</span>
                  <span class="font-black text-lg">{{ item.category }}</span>
                </div>
                <div class="text-right">
                  <div class="font-black text-xl text-red-500">
                    $ {{ item.amount.toLocaleString() }}
                  </div>
                  <div class="text-xs font-bold opacity-30">
                    {{ ((item.amount / totalExpense) * 100).toFixed(1) }}%
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <div class="p-3 text-center opacity-40 italic text-sm">
            <i class="pi pi-info-circle mr-1"></i>
            數據每 5 分鐘自動從雲端同步
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* 二欄位佈局 */
.stats-grid { 
  display: grid; 
  grid-template-columns: 1fr 400px; 
  gap: 2rem; 
  align-items: start;
}

@media (max-width: 1100px) { 
  .stats-grid { grid-template-columns: 1fr; } 
}

/* 圖表容器 */
.chart-main-card { border-radius: 30px !important; }
.chart-container-inner { height: 350px; position: relative; }

.doughnut-center-text {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.total-display-box {
  background: rgba(var(--app-primary-rgb), 0.05);
  text-align: center;
}

/* 排行榜樣式 */
.rank-badge {
  width: 24px; height: 24px;
  background: rgba(var(--app-primary-rgb), 0.1);
  border-radius: 6px;
  display: flex; justify-content: center; align-items: center;
  font-size: 0.7rem; font-weight: 900;
}
.rank-1 { background: #f59e0b; color: white; }

/* 客製化 SelectButton */
:deep(.custom-select-btn .p-button) {
  background: var(--app-footer-bg);
  border-color: var(--app-footer-border);
  color: var(--app-text);
  font-weight: 700;
}
:deep(.custom-select-btn .p-highlight) {
  background: var(--app-primary) !important;
  color: white !important;
}

.section-label { color: var(--app-text); }
</style>