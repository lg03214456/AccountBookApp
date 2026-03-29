<script setup lang="ts">
import { ref, computed } from "vue";
import { useTransactionStore } from "../stores/transactionStore";
import Chart from "primevue/chart";
import Card from "primevue/card";
import Select from "primevue/select"; 
import SelectButton from "primevue/selectbutton";

const transactionStore = useTransactionStore();

// --- 1. 狀態控管 ---
const currentMonth = new Date().getMonth() + 1;
const analysisType = ref('Expense'); 
const chartType = ref("doughnut");

const analysisOptions = ref([
  { label: '支出分析', value: 'Expense' },
  { label: '收入分析', value: 'Income' },
  { label: '轉帳紀錄', value: 'Transfer' }
]);

const typeOptions = ref([
  { label: "環形圖", value: "doughnut", icon: "pi pi-circle" },
  { label: "圓餅圖", value: "pie", icon: "pi pi-chart-pie" },
  { label: "長條圖", value: "bar", icon: "pi pi-chart-bar" },
]);

// --- 2. 核心數據邏輯 ---
const categoryStats = computed(() => {
  const stats: Record<string, number> = {};
  
  const filtered = transactionStore.transactions.filter(tx => {
    const d = new Date(tx.date);
    const monthMatch = (d.getMonth() + 1) === currentMonth;
    
    if (analysisType.value === 'Transfer') {
      return monthMatch && tx.category === '轉帳';
    } else if (analysisType.value === 'Income') {
      return monthMatch && tx.amount > 0 && tx.category !== '轉帳';
    } else {
      return monthMatch && tx.amount < 0 && tx.category !== '轉帳';
    }
  });

  filtered.forEach(tx => {
    const absAmount = Math.abs(tx.amount);
    stats[tx.category] = (stats[tx.category] || 0) + absAmount;
  });

  return Object.entries(stats)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
});

const totalAmount = computed(() => categoryStats.value.reduce((a, b) => a + b.amount, 0));

// --- 3. 圖表樣式與配色 ---
const getThemeColor = () => {
  if (analysisType.value === 'Income') return ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"];
  if (analysisType.value === 'Transfer') return ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];
  return ["#003d4d", "#f43f5e", "#fb7185", "#fda4af"];
};

const chartData = computed(() => ({
  labels: categoryStats.value.map((i) => i.category),
  datasets: [
    {
      data: categoryStats.value.map((i) => i.amount),
      backgroundColor: getThemeColor(),
      hoverOffset: 15,
      borderRadius: chartType.value === "bar" ? 8 : 0,
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
        labels: { usePointStyle: true, padding: 20, color: '#64748b', font: { weight: "800", size: 12 } },
      },
    },
    scales: isBar ? {
      y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)", drawBorder: false }, ticks: { color: '#94a3b8', font: { weight: '600' } } },
      x: { grid: { display: false }, ticks: { color: '#64748b', font: { weight: '600' } } },
    } : {},
    maintainAspectRatio: false,
    responsive: true,
    cutout: chartType.value === "doughnut" ? "75%" : "0%",
  };
});
</script>

<template>
  <div class="view-wrapper fade-in">
    
    <header class="view-header flex justify-content-between align-items-center mb-6 px-1">
      <div class="title-group">
        <h1 class="view-title">數據分析</h1>
        <p class="text-xs font-bold opacity-30 tracking-widest mt-1 uppercase">Financial Analytics</p>
      </div>
      
      <Select
        v-model="chartType"
        :options="typeOptions"
        optionLabel="label"
        optionValue="value"
        class="atelier-chart-select shadow-sm"
      >
        <template #value="slotProps">
          <div v-if="slotProps.value" class="flex align-items-center gap-2">
            <i :class="typeOptions.find(o => o.value === slotProps.value)?.icon" class="text-xs"></i>
            <span class="font-black text-xs uppercase">{{ typeOptions.find(o => o.value === slotProps.value)?.label }}</span>
          </div>
        </template>
        <template #option="slotProps">
          <div class="flex align-items-center gap-3 py-1">
            <i :class="slotProps.option.icon" class="text-sm opacity-60"></i>
            <span class="font-bold text-sm">{{ slotProps.option.label }}</span>
          </div>
        </template>
      </Select>
    </header>

    <div class="type-filter-bar mb-6">
      <SelectButton v-model="analysisType" :options="analysisOptions" 
                    optionLabel="label" optionValue="value" class="atelier-type-switcher" />
    </div>

    <main class="view-content stats-grid">
      <section class="chart-section">
        <Card class="theme-card chart-main-card border-none shadow-sm">
          <template #content>
            <div class="chart-inner-layout">
              
              <div class="chart-stage">
                <Chart
                  v-if="categoryStats.length > 0"
                  :key="chartType + analysisType" 
                  :type="chartType"
                  :data="chartData"
                  :options="chartOptions"
                  class="main-chart-obj"
                />
                
                <div v-if="chartType === 'doughnut' && categoryStats.length > 0" class="chart-center-info">
                  <span class="text-3xl font-black" style="color: #003d4d;">{{ Math.round((categoryStats[0].amount / totalAmount) * 100) }}%</span>
                  <span class="text-xs font-black opacity-30 uppercase">{{ categoryStats[0].category }}</span>
                </div>
                
                <div v-if="categoryStats.length === 0" class="no-data-msg flex flex-column align-items-center opacity-20 h-full justify-content-center">
                  <i class="pi pi-chart-bar text-6xl mb-3"></i>
                  <span class="font-black">本月尚無紀錄</span>
                </div>
              </div>

              <div class="hero-amount-display flex justify-content-center align-items-center gap-5 mt-6 py-4 border-top-1 border-slate-100">
                <div class="text-right">
                  <span class="amount-label text-xs font-black opacity-30 uppercase tracking-widest block leading-tight">
                    Total Monthly<br>{{ analysisType }}
                  </span>
                </div>
                <div class="flex align-items-start">
                  <span class="currency-symbol text-2xl font-black mr-1" 
                        :class="{'expense-text': analysisType === 'Expense', 'income-text': analysisType === 'Income', 'transfer-text': analysisType === 'Transfer'}">$</span>
                  <span class="amount-value text-5xl font-black tracking-tighter" 
                        :class="{'expense-text': analysisType === 'Expense', 'income-text': analysisType === 'Income', 'transfer-text': analysisType === 'Transfer'}">
                    {{ totalAmount.toLocaleString() }}
                  </span>
                </div>
              </div>

            </div>
          </template>
        </Card>
      </section>

      <section class="ranking-section">
        <div class="section-label mb-3 px-2 font-black opacity-40 uppercase tracking-widest text-xs">Category Ranking</div>
        
        <Card class="theme-card border-none shadow-sm">
          <template #content>
            <div class="ranking-container">
              <div v-for="(item, index) in categoryStats" :key="item.category"
                   class="ranking-row flex align-items-center justify-content-between"
                   :class="{ 'last-row': index === categoryStats.length - 1 }">
                
                <div class="flex align-items-center gap-3">
                  <div class="rank-number" :class="`is-${analysisType.toLowerCase()}`">{{ index + 1 }}</div>
                  <span class="font-black text-base text-slate-700">{{ item.category }}</span>
                </div>

                <div class="text-right">
                  <div class="font-black text-lg" :class="{'expense-text': analysisType === 'Expense', 'income-text': analysisType === 'Income', 'transfer-text': analysisType === 'Transfer'}">
                    $ {{ item.amount.toLocaleString() }}
                  </div>
                  <div class="text-xs font-bold opacity-30 tracking-wide">{{ ((item.amount / totalAmount) * 100).toFixed(1) }}%</div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </section>
    </main>
  </div>
</template>

<style scoped>
.view-wrapper { background: #f8fafc; min-height: 100vh; padding: 1.2rem; }
.view-title { font-size: 1.8rem; font-weight: 950; color: #1e293b; letter-spacing: -1px; margin: 0; }

/* 🌟 金額英雄區塊 (Hero Display) 下方佈局 */
.hero-amount-display { 
  border-top: 1px solid rgba(0,0,0,0.05);
}
.amount-label { letter-spacing: 2px; }
.currency-symbol { margin-top: 6px; }
.amount-value { line-height: 1; }

.expense-text { color: #f43f5e !important; }
.income-text { color: #10b981 !important; }
.transfer-text { color: #3b82f6 !important; }

/* 🧠 佈局 */
.stats-grid { display: grid; grid-template-columns: 1fr 380px; gap: 2rem; width: 100%; }
@media (max-width: 1100px) { .stats-grid { grid-template-columns: 1fr; } }

.chart-stage { height: 320px; position: relative; width: 100%; display: flex; justify-content: center; align-items: center; }
.main-chart-obj { width: 100% !important; height: 100% !important; }

.chart-center-info { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; pointer-events: none; }

/* 排行榜 */
.ranking-row { padding: 1.2rem 0.5rem; border-bottom: 1px solid rgba(0,0,0,0.05); }
.ranking-row.last-row { border-bottom: none; }
.rank-number { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 950; color: white; }
.rank-number.is-expense { background: #f43f5e; }
.rank-number.is-income { background: #10b981; }
.rank-number.is-transfer { background: #3b82f6; }

/* UI 元件美化 */
.atelier-chart-select { background: white !important; border: 1px solid #e2e8f0 !important; border-radius: 12px !important; padding: 0.4rem 0.8rem; min-width: 140px; }
.atelier-type-switcher :deep(.p-button) { border: none; background: #f1f5f9; color: #94a3b8; font-weight: 900; border-radius: 14px; padding: 0.6rem 1.5rem; font-size: 0.85rem; }
.atelier-type-switcher :deep(.p-highlight) { background: #003d4d !important; color: white !important; }

.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>