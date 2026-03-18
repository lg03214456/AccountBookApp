<script setup lang="ts">
import Card from 'primevue/card';
</script>

<template>
  <div class="stats-page fade-in">
    <h2 class="mb-6 font-bold">收支分析</h2>

    <div class="grid flex flex-column gap-4">
      <Card class="flex-1">
        <template #title>本月支出分類</template>
        <template #content>
          <div class="chart-placeholder flex flex-column align-items-center justify-content-center">
            <i class="pi pi-chart-pie text-6xl opacity-10 mb-3"></i>
            <p class="opacity-40">圖表載入中...</p>
          </div>
        </template>
      </Card>

      <Card class="flex-1">
        <template #title>最近七日趨勢</template>
        <template #content>
          <div class="chart-placeholder flex flex-column align-items-center justify-content-center">
            <i class="pi pi-chart-bar text-6xl opacity-10 mb-3"></i>
            <p class="opacity-40">數據計算中...</p>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.chart-placeholder {
  height: 200px;
  background: rgba(0,0,0,0.02);
  border-radius: 12px;
  border: 2px dashed rgba(0,0,0,0.05);
}
</style>