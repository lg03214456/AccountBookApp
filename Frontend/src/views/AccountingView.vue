<script setup lang="ts">
import { ref, computed } from 'vue';
import DatePicker from 'primevue/datepicker';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog'; // 引入對話框

// 1. 狀態控管
const selectedDate = ref(new Date());
const isAddDialogVisible = ref(false); // 控制彈窗顯示

// 2. 模擬資料
const transactions = ref([
  { id: 1, date: '2026/03/18', category: '餐飲', amount: -150, note: '午餐便當' },
  { id: 2, date: '2026/03/18', category: '交通', amount: -30, note: '公車' },
  { id: 3, date: '2026/03/17', category: '薪資', amount: 50000, note: '3月薪水' },
]);

// 3. 格式化日期
const formattedDate = computed(() => {
  return selectedDate.value.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
});

// 4. 過濾當天帳目
const dailyTransactions = computed(() => {
  return transactions.value.filter(item => item.date === formattedDate.value);
});

// 5. 計算當天總計
const dailyTotal = computed(() => {
  return dailyTransactions.value.reduce((acc, cur) => acc + cur.amount, 0);
});

// 打開新增彈窗
const openAddDialog = () => {
  isAddDialogVisible.value = true;
};
</script>

<template>
  <div class="accounting-container fade-in">
    <section class="calendar-section">
      <DatePicker 
        v-model="selectedDate" 
        inline 
        class="custom-calendar"
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

    <button class="fab-btn" @click="openAddDialog">
      <i class="pi pi-plus"></i>
      <span class="fab-text">記一筆</span>
    </button>

    <Dialog 
      v-model:visible="isAddDialogVisible" 
      modal 
      header="新增帳目" 
      :style="{ width: '90vw', maxWidth: '450px' }"
      class="add-transaction-dialog"
    >
      <div class="p-4 text-center">
        <p>正在為 {{ formattedDate }} 建立新紀錄...</p>
        <div class="py-6 opacity-30">
           <i class="pi pi-pencil" style="font-size: 3rem"></i>
           <p>表單開發中</p>
        </div>
      </div>
      <template #footer>
        <Button label="取消" icon="pi pi-times" text @click="isAddDialogVisible = false" />
        <Button label="儲存" icon="pi pi-check" @click="isAddDialogVisible = false" autofocus />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.accounting-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative; /* 讓 FAB 可以相對於此定位 */
}

/* 🟢 行事曆樣式 */
:deep(.custom-calendar) {
  width: 100% !important;
  border: none;
  background: var(--app-card-bg, #fff);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

/* 🔵 明細清單樣式 */
.details-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.item-card { margin-bottom: 0.8rem; border-radius: 12px; }
.category-icon { 
  width: 40px; height: 40px; background: #f0f4ff; color: #3b82f6; 
  border-radius: 10px; display: flex; justify-content: center; align-items: center; font-weight: bold;
}
.amount { font-weight: 800; font-size: 1.1rem; }
.income { color: #22c55e; }
.expense { color: #ef4444; }

/* 🟠 懸浮按鈕 (FAB) 樣式 */
.fab-btn {
  position: fixed;
  bottom: 100px; /* 避開底部導航列 */
  right: 30px;
  background: #ff9f0a; /* 橘色 */
  color: black;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  box-shadow: 0 8px 25px rgba(255, 159, 10, 0.4);
  cursor: pointer;
  z-index: 100;
  transition: transform 0.2s, background 0.2s;
}

.fab-btn:hover {
  transform: scale(1.05);
  background: #ffb340;
}

.fab-btn i { font-size: 1.2rem; }

/* 響應式：手機版 */
@media (max-width: 992px) {
  .accounting-container { grid-template-columns: 1fr; gap: 1.5rem; }
  .fab-btn { bottom: 90px; right: 20px; }
  .fab-text { display: none; } /* 手機版只留圖示，更簡潔 */
  .fab-btn { padding: 1.2rem; border-radius: 50%; }
}

.empty-state { text-align: center; padding: 4rem 0; opacity: 0.3; }
</style>