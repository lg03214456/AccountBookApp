<script setup lang="ts">
import { ref, computed } from 'vue';
import Chart from 'primevue/chart';
import Card from 'primevue/card';

// ⭐ 正規化的模擬資料 (未來由 API 提供)
const transactions = ref([
  { id: 1, date: '2026-03-18', category: '飲食', type: 'Expense', amount: -150 },
  { id: 2, date: '2026-03-18', category: '交通', type: 'Expense', amount: -60 },
  { id: 3, date: '2026-03-19', category: '飲食', amount: -500, type: 'Expense' },
  { id: 4, date: '2026-03-19', category: '購物', amount: -1200, type: 'Expense' },
  { id: 5, date: '2026-03-19', category: '薪資', amount: 50000, type: 'Income' },
]);

// 💡 計算邏輯：將明細按類別加總 (模擬後端 Group By)
const categoryStats = computed(() => {
  const expensesOnly = transactions.value.filter(t => t.type === 'Expense');
  const groups: Record<string, number> = {};
  
  expensesOnly.forEach(t => {
    groups[t.category] = (groups[t.category] || 0) + Math.abs(t.amount);
  });

  return Object.keys(groups).map(name => ({
    name,
    value: groups[name]
  })).sort((a, b) => b.value - a.value); // 按金額排序
});

// 圖表設定
const chartData = computed(() => ({
  labels: categoryStats.value.map(i => i.name),
  datasets: [{
    data: categoryStats.value.map(i => i.value),
    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
    borderWidth: 0
  }]
}));

const chartOptions = ref({
  plugins: { legend: { position: 'bottom' } },
  cutout: '65%'
});
</script>

<template>
  <div class="stats-page fade-in">
    <header class="mb-4">
      <h2 class="font-bold">支出分析</h2>
    </header>

    <div class="grid flex flex-column md:flex-row gap-4">
      <Card class="flex-1 border-round-xl shadow-1">
        <template #content>
          <div class="flex flex-column align-items-center">
            <Chart type="doughnut" :data="chartData" :options="chartOptions" class="w-full md:w-20rem" />
            <div class="total-label mt-4">
              <p class="opacity-50 text-sm">本月總支出</p>
              <h1 class="text-3xl font-bold">$ {{ categoryStats.reduce((a, b) => a + b.value, 0).toLocaleString() }}</h1>
            </div>
          </div>
        </template>
      </Card>

      <Card class="flex-1 border-round-xl shadow-1">
        <template #title>支出排行</template>
        <template #content>
          <div v-for="(item, index) in categoryStats" :key="item.name" class="flex align-items-center justify-content-between p-3 border-bottom-1 border-50">
            <div class="flex align-items-center gap-3">
              <span class="rank-num">{{ index + 1 }}</span>
              <span class="font-bold">{{ item.name }}</span>
            </div>
            <span class="text-red-500 font-bold">$ {{ item.value.toLocaleString() }}</span>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.rank-num {
  background: #f1f5f9;
  width: 24px; height: 24px;
  display: flex; justify-content: center; align-items: center;
  border-radius: 50%; font-size: 0.8rem; font-weight: bold;
}
</style>