<script setup lang="ts">
import { ref, computed } from 'vue';
import Chart from 'primevue/chart';
import Card from 'primevue/card';
import SelectButton from 'primevue/selectbutton'; // 引入切換按鈕

// 1. 正規化模擬資料 (未來由 DB 抓取)
const transactions = ref([
  { id: 1, category: '飲食', amount: 5200, type: 'Expense' },
  { id: 2, category: '交通', amount: 1200, type: 'Expense' },
  { id: 3, category: '購物', amount: 3500, type: 'Expense' },
  { id: 4, category: '娛樂', amount: 2000, type: 'Expense' },
  { id: 5, category: '醫療', amount: 800, type: 'Expense' },
]);

// 2. 圖表種類選取狀態
const chartType = ref('doughnut'); // 預設環形圖
const typeOptions = ref([
    { label: '圓餅', value: 'pie', icon: 'pi pi-chart-pie' },
    { label: '環形', value: 'doughnut', icon: 'pi pi-circle' },
    { label: '長條', value: 'bar', icon: 'pi pi-chart-bar' }
]);

// 3. 動態計算圖表資料
const chartData = computed(() => ({
    labels: transactions.value.map(i => i.category),
    datasets: [{
        label: '支出金額',
        data: transactions.value.map(i => i.amount),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        hoverOffset: 20,
        borderRadius: chartType.value === 'bar' ? 8 : 0
    }]
}));

// 4. 動態調整圖表設定 (長條圖與圓餅圖的設定邏輯不同)
const chartOptions = computed(() => {
    const isBar = chartType.value === 'bar';
    return {
        plugins: {
            legend: { display: !isBar, position: 'bottom' } // 長條圖通常不顯示下方圖例
        },
        scales: isBar ? {
            y: { beginAtZero: true, grid: { display: false } },
            x: { grid: { display: false } }
        } : {},
        maintainAspectRatio: false,
        cutout: chartType.value === 'doughnut' ? '65%' : '0%' // 環形圖的中間挖空比例
    };
});
</script>

<template>
  <div class="stats-container fade-in">
    <div class="flex flex-column md:flex-row justify-content-between align-items-center mb-6 gap-4">
      <h2 class="font-bold m-0"><i class="pi pi-chart-line mr-2"></i>支出分析報告</h2>
      
      <SelectButton v-model="chartType" :options="typeOptions" optionLabel="label" optionValue="value">
          <template #option="slotProps">
              <i :class="slotProps.option.icon" class="mr-2"></i>
              <span>{{ slotProps.option.label }}</span>
          </template>
      </SelectButton>
    </div>

    <div class="grid flex flex-column lg:flex-row gap-4">
      <Card class="flex-1 border-round-2xl shadow-1">
        <template #content>
          <div class="chart-wrapper">
            <Chart :type="chartType" :data="chartData" :options="chartOptions" class="h-full" />
          </div>
          <div class="text-center mt-4">
            <p class="text-sm opacity-50">本月總支出</p>
            <h1 class="text-4xl font-black">$ {{ transactions.reduce((a, b) => a + b.amount, 0).toLocaleString() }}</h1>
          </div>
        </template>
      </Card>

      <Card class="flex-1 border-round-2xl shadow-1">
        <template #title>類別明細排行</template>
        <template #content>
          <div v-for="(item, index) in transactions" :key="item.category" class="flex align-items-center justify-content-between p-3 border-bottom-1 border-50">
            <div class="flex align-items-center gap-3">
              <span class="text-sm opacity-30">{{ index + 1 }}</span>
              <span class="font-bold">{{ item.category }}</span>
            </div>
            <div class="text-right">
              <div class="font-bold text-red-500">$ {{ item.amount.toLocaleString() }}</div>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.stats-container { max-width: 1100px; margin: 0 auto; padding-bottom: 2rem; }
.chart-wrapper { height: 320px; position: relative; }
</style>