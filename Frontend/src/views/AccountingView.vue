<script setup lang="ts">
import { ref, computed } from 'vue';
import DatePicker from 'primevue/datepicker'; // PrimeVue v4 命名為 DatePicker
import Card from 'primevue/card';
import Tag from 'primevue/tag';

// 1. 選取的日期，預設為今天
const selectedDate = ref(new Date());

// 2. 模擬的記帳資料 (之後你會從 .NET API 抓取)
const transactions = ref([
  { id: 1, date: '2026/03/18', category: '餐飲', amount: -150, note: '午餐便當' },
  { id: 2, date: '2026/03/18', category: '交通', amount: -30, note: '公車' },
  { id: 3, date: '2026/03/17', category: '薪資', amount: 50000, note: '3月薪水' },
]);

// 3. 格式化選取日期為字串 (YYYY/MM/DD)
const formattedDate = computed(() => {
  return selectedDate.value.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
});

// 4. 根據選取的日期過濾出當天的帳目
const dailyTransactions = computed(() => {
  return transactions.value.filter(item => item.date === formattedDate.value);
});

// 5. 計算當天總計
const dailyTotal = computed(() => {
  return dailyTransactions.value.reduce((acc, cur) => acc + cur.amount, 0);
});
</script>

<template>
  <div class="accounting-container fade-in">
    <section class="calendar-section">
      <DatePicker 
        v-model="selectedDate" 
        inline 
        class="custom-calendar"
        showWeek
      />
    </section>

    <section class="details-section">
      <div class="details-header">
        <h2 class="date-title">{{ formattedDate }}</h2>
        <Tag :severity="dailyTotal >= 0 ? 'success' : 'danger'" class="total-tag">
          今日損益: {{ dailyTotal }}
        </Tag>
      </div>

      <div class="transaction-list">
        <template v-if="dailyTransactions.length > 0">
          <Card v-for="item in dailyTransactions" :key="item.id" class="item-card">
            <template #content>
              <div class="flex justify-content-between align-items-center">
                <div class="flex align-items-center gap-3">
                  <div class="category-icon">{{ item.category[0] }}</div>
                  <div>
                    <div class="font-bold">{{ item.category }}</div>
                    <div class="text-sm opacity-60">{{ item.note }}</div>
                  </div>
                </div>
                <div :class="['amount', item.amount >= 0 ? 'income' : 'expense']">
                  {{ item.amount >= 0 ? '+' : '' }}{{ item.amount }}
                </div>
              </div>
            </template>
          </Card>
        </template>

        <div v-else class="empty-state">
          <i class="pi pi-inbox"></i>
          <p>當天沒有任何記錄</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.accounting-container {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 電腦版左右平分 */
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* 🟢 行事曆樣式調整 */
.calendar-section {
  display: flex;
  justify-content: center;
}

:deep(.custom-calendar) {
  width: 100% !important;
  border: none;
  background: var(--app-card-bg);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  padding: 1rem;
}

/* 🔵 詳情清單樣式 */
.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.date-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.item-card {
  margin-bottom: 0.8rem;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.03);
}

.category-icon {
  width: 40px; height: 40px;
  background: var(--app-primary-faded);
  color: var(--app-primary);
  border-radius: 10px;
  display: flex; justify-content: center; align-items: center;
  font-weight: bold;
}

.amount { font-weight: 800; font-size: 1.1rem; }
.income { color: #22c55e; }
.expense { color: #ef4444; }

.empty-state {
  text-align: center;
  padding: 4rem 0;
  opacity: 0.3;
}
.empty-state i { font-size: 3rem; margin-bottom: 1rem; }

/* ⭐ 響應式：手機版變上下排列 */
@media (max-width: 992px) {
  .accounting-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>