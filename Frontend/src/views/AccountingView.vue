<script setup lang="ts">
import { ref, computed } from 'vue';
import DatePicker from 'primevue/datepicker';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';

// --- 1. 狀態控管 ---
const isAddDialogVisible = ref(false);
const isEditing = ref(false);
const editingId = ref<number | null>(null);
const selectedDate = ref(new Date());

// 模擬資料庫 (建議之後移到 Store 或 API)
const transactions = ref([
  { id: 1, date: '2026-03-19', category: '飲食', type: 'Expense', amount: -150, note: '午餐便當', account: '錢包' },
  { id: 2, date: '2026-03-19', category: '交通', type: 'Expense', amount: -30, note: '公車', account: '錢包' },
]);

// --- 2. 暫存資料與帳戶設定 ---
const amount = ref<number | null>(0); 
const newEntry = ref({
  category: '飲食',
  note: '',
  type: 'Expense',
  account: '錢包' 
});

const accountCategories = [
  { id: 'cash', name: '現金', icon: 'pi-wallet', color: '#f59e0b' },
  { id: 'card', name: '信用卡', icon: 'pi-credit-card', color: '#6366f1' },
  { id: 'bank', name: '銀行卡', icon: 'pi-building', color: '#10b981' }
];

const subAccountMap = {
  cash: ['錢包', '家中存錢筒', '緊急備用金'],
  card: ['國泰 CUBE', '台新 FlyGo', '中信全聯卡', 'Line Bank'],
  bank: ['玉山銀行', '國泰世華', '郵局', '富邦銀行']
};

type AccountType = keyof typeof subAccountMap;
const activeAccountType = ref<AccountType>('cash');

// --- 3. 核心功能函式 ---

const prepareNewEntry = () => {
  isEditing.value = false;
  editingId.value = null;
  amount.value = 0;
  newEntry.value = { category: '飲食', note: '', type: 'Expense', account: '錢包' };
  activeAccountType.value = 'cash';
  isAddDialogVisible.value = true;
};

const openEditDialog = (item: any) => {
  isEditing.value = true;
  editingId.value = item.id;
  amount.value = Math.abs(item.amount);
  newEntry.value = { category: item.category, note: item.note, type: item.type, account: item.account };
  
  for (const [key, list] of Object.entries(subAccountMap)) {
    if (list.includes(item.account)) {
      activeAccountType.value = key as AccountType;
      break;
    }
  }
  isAddDialogVisible.value = true;
};

const selectAccountType = (typeId: string) => {
  const id = typeId as AccountType;
  activeAccountType.value = id;
  newEntry.value.account = subAccountMap[id][0];
};

const saveTransaction = () => {
  if (!amount.value || amount.value === 0) return;

  const finalAmount = newEntry.value.type === 'Expense' ? -amount.value : amount.value;
  const transactionData = {
    id: isEditing.value ? editingId.value : Date.now(),
    date: formattedDate.value,
    category: newEntry.value.category,
    type: newEntry.value.type,
    amount: finalAmount,
    note: newEntry.value.note,
    account: newEntry.value.account
  };

  if (isEditing.value) {
    const idx = transactions.value.findIndex(t => t.id === editingId.value);
    if (idx !== -1) transactions.value[idx] = transactionData as any;
  } else {
    transactions.value.push(transactionData as any);
  }
  isAddDialogVisible.value = false;
};

const formattedDate = computed(() => {
  const d = selectedDate.value;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
});

const dailyTransactions = computed(() => transactions.value.filter(item => item.date === formattedDate.value));
const dailyTotal = computed(() => dailyTransactions.value.reduce((acc, cur) => acc + cur.amount, 0));

const categories = [
  { name: '飲食', icon: 'pi-utensils', color: '#dbeafe', iconColor: '#3b82f6' },
  { name: '購物', icon: 'pi-shopping-bag', color: '#f3f4f6', iconColor: '#4b5563' },
  { name: '交通', icon: 'pi-car', color: '#ecfdf5', iconColor: '#10b981' },
  { name: '其他', icon: 'pi-ellipsis-h', color: '#f5f3ff', iconColor: '#8b5cf6' },
];
</script>

<template>
  <div class="view-wrapper fade-in">
    
    <header class="view-header">
      <h1 class="view-title">日常記帳</h1>
      <Tag :severity="dailyTotal >= 0 ? 'success' : 'danger'" class="p-2 px-3 border-round-xl shadow-1">
        今日損益: {{ dailyTotal.toLocaleString() }}
      </Tag>
    </header>

    <main class="view-content accounting-grid">
      
      <section class="calendar-section">
        <Card class="theme-card calendar-card shadow-sm">
          <template #content>
            <DatePicker v-model="selectedDate" inline class="custom-calendar" />
          </template>
        </Card>
      </section>
      
      <section class="details-section">
        <div class="section-label mb-3">
          <i class="pi pi-calendar-plus mr-2"></i>
          <span>{{ formattedDate }} 明細</span>
        </div>

        <div class="transaction-list-wrapper">
          <div v-if="dailyTransactions.length === 0" class="empty-state">
            <i class="pi pi-inbox mb-3 text-4xl opacity-20"></i>
            <p>這天還沒有紀錄喔</p>
          </div>

          <Card v-for="item in dailyTransactions" :key="item.id" 
                class="item-card shadow-1 mb-3 theme-card" @click="openEditDialog(item)">
            <template #content>
              <div class="flex justify-content-between align-items-center">
                <div class="flex align-items-center gap-3">
                  <div class="category-icon-box">
                    {{ item.category[0] }}
                  </div>
                  <div>
                    <div class="font-bold text-lg">{{ item.category }}</div>
                    <div class="text-xs opacity-60 font-medium">{{ item.account }} | {{ item.note || '無備註' }}</div>
                  </div>
                </div>
                <div :class="['amount-text', item.amount >= 0 ? 'income' : 'expense']">
                  {{ item.amount >= 0 ? '+' : '' }}{{ item.amount.toLocaleString() }}
                </div>
              </div>
            </template>
          </Card>
        </div>
      </section>
    </main>

    <button class="fab-btn" @click="prepareNewEntry">
      <i class="pi pi-plus"></i>
      <span class="fab-text">快速記帳</span>
    </button>

    <Dialog 
      v-model:visible="isAddDialogVisible" 
      modal 
      :showHeader="false" 
      :dismissableMask="true"
      :style="{ width: '92vw', maxWidth: '420px' }"
      class="custom-dialog"
    >
      <div class="transaction-panel p-4">
        <p class="text-center font-bold opacity-30 text-xs mb-3 uppercase tracking-tighter">
          {{ isEditing ? 'Edit Transaction' : 'New Transaction' }}
        </p>
        
        <div class="toggle-container mb-5" :class="newEntry.type === 'Expense' ? 'border-expense' : 'border-income'">
          <button @click="newEntry.type = 'Expense'" class="type-btn" :class="{ 'btn-expense-active': newEntry.type === 'Expense' }">支出</button>
          <button @click="newEntry.type = 'Income'" class="type-btn" :class="{ 'btn-income-active': newEntry.type === 'Income' }">收入</button>
        </div>

        <div class="amount-area text-center mb-5">
          <div class="flex justify-content-center align-items-center gap-2">
            <span class="text-3xl font-black" :class="newEntry.type === 'Expense' ? 'text-red-500' : 'text-green-500'">$</span>
            <InputNumber 
              v-model="amount" 
              mode="decimal" 
              :useGrouping="true" 
              placeholder="0"
              class="huge-amount-wrapper"
              inputClass="huge-amount-input"
              autofocus
            />
          </div>
        </div>

        <div class="form-card mb-4">
          <p class="text-xs font-bold opacity-40 mb-3 tracking-widest">CATEGORY</p>
          <div class="flex justify-content-between">
            <div v-for="cat in categories" :key="cat.name" class="cat-item" 
                 :class="{ 'active': newEntry.category === cat.name }" @click="newEntry.category = cat.name">
              <div class="cat-circle" :style="{ backgroundColor: cat.color }">
                <i :class="['pi', cat.icon]" :style="{ color: cat.iconColor }"></i>
              </div>
              <span class="text-xs mt-2 font-bold">{{ cat.name }}</span>
            </div>
          </div>
        </div>

        <div class="form-card mb-4">
          <p class="text-xs font-bold opacity-40 mb-3 tracking-widest">PAYMENT ACCOUNT</p>
          <div class="account-grid mb-3">
            <div v-for="type in accountCategories" :key="type.id" 
                 class="acc-type-box" :class="{ 'type-active': activeAccountType === type.id }"
                 @click="selectAccountType(type.id)">
              <i :class="['pi', type.icon]" :style="{ color: activeAccountType === type.id ? 'white' : type.color }"></i>
              <span>{{ type.name }}</span>
            </div>
          </div>
          <div class="sub-account-list flex flex-wrap gap-2">
            <button v-for="sub in subAccountMap[activeAccountType]" :key="sub"
                    @click="newEntry.account = sub"
                    class="sub-acc-pill" :class="{ 'sub-active': newEntry.account === sub }">
              {{ sub }}
            </button>
          </div>
        </div>

        <div class="form-card mb-5 note-card">
          <p class="text-xs font-bold opacity-40 mb-2 tracking-widest">NOTE / DESCRIPTION</p>
          <InputText v-model="newEntry.note" placeholder="記錄一點細節吧..." class="w-full border-none p-0 bg-transparent font-bold text-base note-input" />
        </div>

        <div class="flex gap-2">
           <Button v-if="isEditing" label="刪除" severity="danger" outlined class="flex-1 p-3 font-bold border-round-xl" @click="isAddDialogVisible = false" />
           <Button 
            :label="isEditing ? '更新紀錄' : '儲存紀錄'" 
            @click="saveTransaction" 
            :class="newEntry.type === 'Expense' ? 'save-expense' : 'save-income'" 
            class="flex-2 w-full p-3 font-bold border-none shadow-2 border-round-xl" 
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
/* ⚡ 佈局二欄位：左日曆右清單 */
.accounting-grid { 
  display: grid; 
  grid-template-columns: 420px 1fr; 
  gap: 2rem; 
  align-items: start;
}

@media (max-width: 992px) { 
  .accounting-grid { grid-template-columns: 1fr; } 
}

/* 📅 日曆卡片 */
.calendar-card { border-radius: 28px !important; overflow: hidden; padding: 0.5rem; }
:deep(.custom-calendar) { width: 100% !important; border: none !important; background: transparent !important; }

/* 💰 金額輸入樣式 */
:deep(.huge-amount-input) {
  background: transparent !important; border: none !important; text-align: left;
  font-size: 3.5rem; font-weight: 900; letter-spacing: -2px; color: var(--app-text);
  padding: 0; box-shadow: none !important; width: 100%;
}

/* 📝 備註與表單 */
.form-card { background: rgba(var(--app-primary-rgb), 0.04); padding: 1.2rem; border-radius: 22px; }
.note-card { background: rgba(var(--app-primary-rgb), 0.08); }
.note-input { color: var(--app-text); outline: none; }

/* 模式切換器 */
.toggle-container { display: flex; padding: 5px; border-radius: 20px; background: var(--app-bg); border: 2px solid transparent; }
.border-expense { border-color: rgba(239, 68, 68, 0.1); }
.border-income { border-color: rgba(34, 197, 94, 0.1); }
.type-btn { flex: 1; border: none; padding: 0.8rem; border-radius: 16px; font-weight: 800; cursor: pointer; background: transparent; color: #94a3b8; transition: 0.3s; }
.btn-expense-active { background: #ef4444 !important; color: white !important; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }
.btn-income-active { background: #22c55e !important; color: white !important; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3); }

/* 帳戶選擇 */
.acc-type-box { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 12px; border-radius: 18px; border: 1px solid var(--app-footer-border); background: var(--app-footer-bg); cursor: pointer; transition: 0.2s; font-size: 0.8rem; font-weight: 700; }
.type-active { background: var(--app-primary) !important; color: white !important; transform: scale(1.05); }
.sub-acc-pill { border: 1px solid var(--app-footer-border); background: var(--app-footer-bg); padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; cursor: pointer; color: var(--app-text); }
.sub-active { background: var(--app-text) !important; color: var(--app-bg) !important; border-color: var(--app-text); }

/* 列表樣式 */
.section-label { font-weight: 800; opacity: 0.6; font-size: 0.9rem; color: var(--app-text); }
.category-icon-box { width: 48px; height: 48px; background: rgba(var(--app-primary-rgb), 0.1); color: var(--app-primary); border-radius: 15px; display: flex; justify-content: center; align-items: center; font-weight: 900; font-size: 1.3rem; }
.amount-text { font-weight: 900; font-size: 1.3rem; }
.income { color: #22c55e; }
.expense { color: #ef4444; }

/* 快速記帳 FAB */
.fab-btn { 
  position: fixed; bottom: 100px; right: 30px; 
  background: linear-gradient(135deg, #ff9f0a, #ff7b00); 
  border: none; padding: 1rem 1.8rem; border-radius: 50px; 
  color: white; font-weight: 800; cursor: pointer; z-index: 100; 
  box-shadow: 0 10px 25px rgba(255,159,10,0.4);
  display: flex; align-items: center; gap: 8px;
  transition: transform 0.2s;
}
.fab-btn:active { transform: scale(0.9); }

/* 空狀態 */
.empty-state { text-align: center; padding: 4rem 0; opacity: 0.5; font-weight: 700; }

/* 深色模式修正 */
:global(.dark-mode) .theme-card { background: rgba(30, 41, 59, 0.7) !important; }
</style>