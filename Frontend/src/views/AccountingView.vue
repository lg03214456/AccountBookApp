<script setup lang="ts">
import { ref, computed } from 'vue';
import DatePicker from 'primevue/datepicker';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';

// 1. 狀態控管
const isAddDialogVisible = ref(false);
const selectedDate = ref(new Date());

// 2. 標準化初始資料 (符合資料庫格式：YYYY-MM-DD)
const transactions = ref([
  { id: 1, date: '2026-03-19', category: '飲食', type: 'Expense', amount: -150, note: '午餐便當', accountId: 1 },
  { id: 2, date: '2026-03-19', category: '交通', type: 'Expense', amount: -30, note: '公車', accountId: 1 },
]);

// 3. 新增表單的暫存資料
const newEntry = ref({
  category: '飲食',
  amount: null,
  note: '',
  type: 'Expense' // 'Expense' 或 'Income'
});

const categories = ref(['飲食', '交通', '娛樂', '購物', '醫療', '薪資', '其他']);

// 4. ⭐ 強化的日期格式化 (確保產出 YYYY-MM-DD 格式，不受瀏覽器語系影響)
const formattedDate = computed(() => {
  const d = selectedDate.value;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});

// 5. 儲存邏輯
const saveTransaction = () => {
  if (!newEntry.value.amount) return;

  // 根據類型決定正負號
  const finalAmount = newEntry.value.type === 'Expense' 
    ? -Math.abs(newEntry.value.amount) 
    : Math.abs(newEntry.value.amount);

  transactions.value.push({
    id: Date.now(),
    date: formattedDate.value, // 儲存為 YYYY-MM-DD
    category: newEntry.value.category,
    type: newEntry.value.type,
    amount: finalAmount,
    note: newEntry.value.note,
    accountId: 1 // 預設帳戶 ID
  });

  // 重置表單
  newEntry.value = { category: '飲食', amount: null, note: '', type: 'Expense' };
  isAddDialogVisible.value = false;
};

// 6. 計算邏輯
const dailyTransactions = computed(() => {
  return transactions.value.filter(item => item.date === formattedDate.value);
});

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
          <Card v-for="item in dailyTransactions" :key="item.id" class="item-card shadow-1">
            <template #content>
              <div class="flex justify-content-between align-items-center">
                <div class="flex align-items-center gap-3">
                  <div class="category-icon shadow-sm">{{ item.category[0] }}</div>
                  <div>
                    <div class="font-bold text-lg">{{ item.category }}</div>
                    <div class="text-sm opacity-60">{{ item.note || '無備註' }}</div>
                  </div>
                </div>
                <div :class="['amount-text', item.amount >= 0 ? 'income' : 'expense']">
                  {{ item.amount >= 0 ? '+' : '' }}{{ item.amount.toLocaleString() }}
                </div>
              </div>
            </template>
          </Card>
        </template>

        <div v-else class="empty-state">
          <i class="pi pi-inbox text-4xl mb-3"></i>
          <p>當天沒有任何記錄</p>
        </div>
      </div>
    </section>

    <button class="fab-btn" @click="isAddDialogVisible = true">
      <i class="pi pi-plus"></i>
      <span class="fab-text">記一筆</span>
    </button>

    <Dialog v-model:visible="isAddDialogVisible" modal header="快速記帳" :style="{ width: '90vw', maxWidth: '380px' }" class="add-dialog">
      <div class="flex flex-column gap-4 py-2">
        <div class="flex p-1 bg-gray-100 border-round-xl">
          <button 
            @click="newEntry.type = 'Expense'"
            class="type-toggle-btn" 
            :class="{ active: newEntry.type === 'Expense', 'bg-red-500 text-white': newEntry.type === 'Expense' }"
          >支出</button>
          <button 
            @click="newEntry.type = 'Income'"
            class="type-toggle-btn" 
            :class="{ active: newEntry.type === 'Income', 'bg-green-500 text-white': newEntry.type === 'Income' }"
          >收入</button>
        </div>
        
        <div class="field">
          <label class="block font-bold mb-2 text-sm">分類</label>
          <Select v-model="newEntry.category" :options="categories" class="w-full custom-select" placeholder="選擇分類" />
        </div>

        <div class="field">
          <label class="block font-bold mb-2 text-sm">金額</label>
          <InputNumber v-model="newEntry.amount" mode="decimal" class="w-full custom-input" placeholder="0" autofocus />
        </div>

        <div class="field">
          <label class="block font-bold mb-2 text-sm">備註</label>
          <InputText v-model="newEntry.note" class="w-full custom-input" placeholder="備註內容..." />
        </div>
      </div>
      <template #footer>
        <Button label="儲存紀錄" icon="pi pi-check" @click="saveTransaction" class="w-full p-3 border-round-xl" severity="primary" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
/* 佈局控制 */
.accounting-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
  max-width: 1100px;
  margin: 0 auto;
  position: relative;
}

/* 🟢 行事曆與卡片樣式 */
:deep(.custom-calendar) {
  width: 100% !important;
  border: none;
  background: var(--app-card-bg, #ffffff);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  padding: 1.2rem;
}

.item-card {
  border-radius: 16px;
  margin-bottom: 1rem;
  transition: transform 0.2s;
}
.item-card:hover { transform: translateY(-2px); }

.category-icon {
  width: 44px; height: 44px;
  background: var(--app-primary-faded, #f0f7ff);
  color: var(--app-primary, #3b82f6);
  border-radius: 12px;
  display: flex; justify-content: center; align-items: center;
  font-weight: bold; font-size: 1.2rem;
}

.amount-text { font-weight: 800; font-size: 1.25rem; }
.income { color: #22c55e; }
.expense { color: #ef4444; }

/* 🟠 橘色 FAB 按鈕 */
.fab-btn {
  position: fixed;
  bottom: 95px; /* 避開底部 4 鍵導航 */
  right: 25px;
  background: #ff9f0a;
  color: #000;
  border: none;
  padding: 1rem 1.8rem;
  border-radius: 50px;
  display: flex; align-items: center; gap: 8px;
  font-weight: 800;
  box-shadow: 0 10px 25px rgba(255, 159, 10, 0.4);
  cursor: pointer;
  z-index: 100;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.fab-btn:hover { transform: scale(1.1) translateY(-5px); }

/* ⚪ 彈窗內部切換按鈕 */
.type-toggle-btn {
  flex: 1; border: none; padding: 0.6rem; border-radius: 10px;
  font-weight: bold; cursor: pointer; background: transparent; transition: 0.2s;
}

/* 響應式：手機版 */
@media (max-width: 992px) {
  .accounting-container { grid-template-columns: 1fr; gap: 1.5rem; }
  .fab-text { display: none; }
  .fab-btn { padding: 1.2rem; border-radius: 50%; bottom: 85px; right: 20px; }
  .date-title { font-size: 1.2rem; }
}

.empty-state { text-align: center; padding: 5rem 0; opacity: 0.25; }
</style>