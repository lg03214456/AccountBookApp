<script setup lang="ts">
import Card from 'primevue/card';
import Button from 'primevue/button';
import { ref } from 'vue';

// 模擬一些資料讓畫面不空
const balance = ref({ total: 12480.50, income: 4250, expense: 1840 });
</script>

<template>
  <div class="home-container">
    <section class="balance-card mb-4">
      <div class="text-sm opacity-70">TOTAL BALANCE</div>
      <div class="text-5xl font-bold mt-2">$ {{ balance.total.toLocaleString() }}</div>
    </section>

    <div class="grid flex gap-4 mb-4">
      <Card class="flex-1 income-card">
        <template #content>
          <div class="text-green-600 font-bold">Income</div>
          <div class="text-xl">$ {{ balance.income }}</div>
        </template>
      </Card>
      <Card class="flex-1 expense-card">
        <template #content>
          <div class="text-red-500 font-bold">Expense</div>
          <div class="text-xl">$ {{ balance.expense }}</div>
        </template>
      </Card>
    </div>

    <Card>
      <template #title>最近紀錄</template>
      <template #content>
        <p class="text-gray-500 italic">這裡將顯示您的收支清單...</p>
        <div class="mt-4 flex justify-content-center">
             <Button label="新增一筆" icon="pi pi-plus" rounded />
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 600px;
  margin: 0 auto;
}
.balance-card {
  padding: 2rem 0;
  text-align: center;
}
.income-card { border-left: 5px solid #22c55e; }
.expense-card { border-left: 5px solid #ef4444; }
</style>