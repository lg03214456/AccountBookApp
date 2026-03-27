<script setup lang="ts">
import { ref, computed } from 'vue';
import DatePicker from 'primevue/datepicker';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';

// --- 1. 狀態與資料定義 ---
const isAddDialogVisible = ref(false);
const isEditing = ref(false);
const editingId = ref<number | null>(null);
const selectedDate = ref(new Date());

// ⭐ 優化：將 id 從 null 改為 0，解決 TS 類型衝突與 Key 警告
const availablePlans = ref([
  { id: 0, name: '不關聯計畫' }, 
  { id: 101, name: '日本五天四夜遊' },
  { id: 102, name: '新家裝修計畫' }
]);

// 模擬交易紀錄 (確保預設 planId 為 0)
const transactions = ref([
  { id: 1, date: '2026-03-27', category: '飲食', type: 'Expense', amount: -150, note: '午餐便當', account: '錢包', planId: 0 },
  { id: 2, date: '2026-03-27', category: '交通', type: 'Expense', amount: -30, note: '公車', account: '錢包', planId: 0 },
  { id: 3, date: '2026-03-27', category: '購物', type: 'Expense', amount: -2500, note: 'UNIQLO 衣服', account: '信用卡', planId: 101 },
]);

const amount = ref<number | null>(0); 
const newEntry = ref({
  category: '飲食',
  note: '',
  type: 'Expense',
  account: '錢包',
  planId: 0 // ⭐ 預設改為 0
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

// --- 2. 核心邏輯函式 ---

// 取得計畫名稱 (排除 ID 為 0 的情況)
const getPlanName = (id: number) => {
  return availablePlans.value.find(p => p.id === id)?.name || '';
};

const prepareNewEntry = () => {
  isEditing.value = false;
  editingId.value = null;
  amount.value = 0;
  newEntry.value = { category: '飲食', note: '', type: 'Expense', account: '錢包', planId: 0 };
  activeAccountType.value = 'cash';
  isAddDialogVisible.value = true;
};

const openEditDialog = (item: any) => {
  isEditing.value = true;
  editingId.value = item.id;
  amount.value = Math.abs(item.amount);
  newEntry.value = { 
    category: item.category, 
    note: item.note, 
    type: item.type, 
    account: item.account,
    planId: item.planId || 0
  };
  
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
    account: newEntry.value.account,
    planId: newEntry.value.planId
  };

  if (isEditing.value) {
    const idx = transactions.value.findIndex(t => t.id === editingId.value);
    if (idx !== -1) transactions.value[idx] = transactionData as any;
  } else {
    transactions.value.push(transactionData as any);
  }
  isAddDialogVisible.value = false;
};

// --- 3. 計算屬性 ---
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
  <div class="view-wrapper">
    <header class="view-header">
      <h1 class="view-title">日常記帳</h1>
      <Tag :severity="dailyTotal >= 0 ? 'success' : 'danger'" class="p-2 px-3 border-round-xl shadow-1 font-black">
        今日損益: {{ dailyTotal.toLocaleString() }}
      </Tag>
    </header>

    <main class="accounting-grid">
      <section class="calendar-section">
        <Card class="theme-card calendar-card shadow-sm">
          <template #content>
            <div class="flex justify-content-center overflow-hidden p-2">
              <DatePicker v-model="selectedDate" inline class="custom-calendar-obj" />
            </div>
          </template>
        </Card>
      </section>
      
      <section class="details-section">
        <div class="section-label mb-3 px-1 flex align-items-center">
          <i class="pi pi-calendar-clock mr-2 opacity-50"></i>
          <span>{{ formattedDate }} 明細</span>
        </div>

        <div class="transaction-list-container">
          <div v-if="dailyTransactions.length === 0" class="empty-placeholder">
            <i class="pi pi-inbox mb-3 text-4xl opacity-10"></i>
            <p class="font-bold opacity-30">這天還沒有紀錄喔</p>
          </div>

          <Card v-for="item in dailyTransactions" :key="item.id" 
                class="theme-card item-card mb-3 cursor-pointer" @click="openEditDialog(item)">
            <template #content>
              <div class="flex justify-content-between align-items-center">
                <div class="flex align-items-center gap-4">
                  <div class="category-icon-bg">
                    {{ item.category[0] }}
                  </div>
                  <div class="flex flex-column gap-1">
                    <span class="font-black text-lg leading-none">{{ item.category }}</span>
                    <span class="text-xs font-bold opacity-40 uppercase tracking-wider">
                      {{ item.account }} 
                      <span v-if="item.planId !== 0" class="plan-tag">
                        | <i class="pi pi-flag-fill text-primary"></i> {{ getPlanName(item.planId) }}
                      </span>
                      | {{ item.note || 'No Note' }}
                    </span>
                  </div>
                </div>
                <div :class="['amount-display', item.amount >= 0 ? 'income' : 'expense']">
                  {{ item.amount >= 0 ? '+' : '' }}{{ item.amount.toLocaleString() }}
                </div>
              </div>
            </template>
          </Card>
        </div>
      </section>
    </main>

    <button class="fab-btn" @click="prepareNewEntry">
      <i class="pi pi-plus mr-2"></i>
      <span class="font-black">快速記帳</span>
    </button>

    <Dialog v-model:visible="isAddDialogVisible" modal :showHeader="false" :dismissableMask="true"
            :style="{ width: '92vw', maxWidth: '420px' }" class="modern-dialog">
      <div class="transaction-panel p-5">
        <p class="section-label text-center mb-4 uppercase tracking-widest">Quick Record</p>
        
        <div class="toggle-wrapper mb-5" :class="newEntry.type === 'Expense' ? 'is-expense' : 'is-income'">
          <button @click="newEntry.type = 'Expense'" class="type-tab" :class="{ 'active': newEntry.type === 'Expense' }">支出</button>
          <button @click="newEntry.type = 'Income'" class="type-tab" :class="{ 'active': newEntry.type === 'Income' }">收入</button>
        </div>

        <div class="amount-hero text-center mb-6">
          <div class="flex justify-content-center align-items-center gap-2">
            <span class="text-3xl font-black opacity-30">$</span>
            <InputNumber v-model="amount" mode="decimal" class="huge-amount-wrapper" inputClass="huge-amount-input" autofocus />
          </div>
        </div>

        <div class="form-group mb-5">
          <p class="section-label mb-3 px-1">Category</p>
          <div class="flex justify-content-between">
            <div v-for="cat in categories" :key="cat.name" class="cat-pill" 
                 :class="{ 'selected': newEntry.category === cat.name }" @click="newEntry.category = cat.name">
              <div class="cat-icon-box" :style="{ backgroundColor: cat.color }">
                <i :class="['pi', cat.icon]" :style="{ color: cat.iconColor }"></i>
              </div>
              <span class="text-xs font-black mt-2">{{ cat.name }}</span>
            </div>
          </div>
        </div>

        <div class="form-group mb-5">
          <p class="section-label mb-3 px-1">Payment Method</p>
          <div class="flex gap-2 mb-3">
            <div v-for="type in accountCategories" :key="type.id" 
                 class="acc-selector flex-1" :class="{ 'active': activeAccountType === type.id }"
                 @click="selectAccountType(type.id)">
              <i :class="['pi', type.icon]" :style="{ color: activeAccountType === type.id ? 'white' : type.color }"></i>
              <span class="text-xs font-bold mt-1">{{ type.name }}</span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <button v-for="sub in subAccountMap[activeAccountType]" :key="sub"
                    @click="newEntry.account = sub"
                    class="pill-btn" :class="{ 'active': newEntry.account === sub }">
              {{ sub }}
            </button>
          </div>
        </div>

        <div class="form-group mb-5">
          <p class="section-label mb-3 px-1">Relate to Plan</p>
          <div class="flex flex-wrap gap-2">
            <button v-for="plan in availablePlans" :key="plan.id"
                    @click="newEntry.planId = plan.id"
                    class="pill-btn plan-pill" :class="{ 'active': newEntry.planId === plan.id }">
              <i v-if="plan.id !== 0" class="pi pi-flag-fill mr-1"></i>
              {{ plan.name }}
            </button>
          </div>
        </div>

        <div class="form-group mb-6">
          <p class="section-label mb-2 px-1">Note</p>
          <div class="note-input-box p-3 border-round-2xl bg-black-alpha-5">
            <InputText v-model="newEntry.note" placeholder="記錄細節..." class="w-full border-none p-0 bg-transparent font-bold" />
          </div>
        </div>

        <div class="flex gap-2">
           <Button v-if="isEditing" icon="pi pi-trash" severity="danger" text class="flex-1" @click="isAddDialogVisible = false" />
           <Button :label="isEditing ? '更新這筆紀錄' : '確認儲存紀錄'" @click="saveTransaction" 
                   :class="newEntry.type === 'Expense' ? 'btn-save-expense' : 'btn-save-income'" 
                   class="flex-3 w-full p-3 font-black border-none shadow-lg border-round-2xl" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
/* ⚡ 佈局與對稱性修正 */
.accounting-grid { 
  display: grid; 
  grid-template-columns: 360px 1fr; 
  gap: 2.5rem; 
  width: 100%;
}

@media (max-width: 992px) { 
  .accounting-grid { grid-template-columns: 1fr; gap: 1.5rem; } 
}

/* 📅 日曆微調 */
.calendar-card { width: 100%; }
:deep(.custom-calendar-obj) { 
  width: 100% !important; border: none !important; 
  background: transparent !important; max-width: 320px;
}

/* 💰 金額 HERO 樣式 */
:deep(.huge-amount-input) {
  background: transparent !important; border: none !important;
  font-size: 3.5rem; font-weight: 900; letter-spacing: -3px;
  padding: 0; box-shadow: none !important; width: 100%; color: var(--app-text);
}

/* 🎨 明細列表樣式 */
.category-icon-bg { 
  width: 48px; height: 48px; 
  background: rgba(var(--app-primary-rgb), 0.1); 
  color: var(--app-primary); 
  border-radius: 14px; 
  display: flex; justify-content: center; align-items: center; 
  font-weight: 900; font-size: 1.2rem;
}

.plan-tag { color: var(--app-primary); margin: 0 4px; }
.amount-display { font-weight: 950; font-size: 1.4rem; }
.income { color: #10b981; }
.expense { color: #f43f5e; }

/* ➕ FAB 懸浮按鈕 */
.fab-btn { 
  position: fixed; bottom: 100px; right: 25px; 
  background: var(--app-primary); 
  border: none; padding: 1rem 1.8rem; border-radius: 20px; 
  color: white; z-index: 100; 
  box-shadow: 0 10px 25px rgba(var(--app-primary-rgb), 0.3);
  display: flex; align-items: center; transition: 0.2s;
}
.fab-btn:active { transform: scale(0.95); }

/* 彈窗內組件 */
.toggle-wrapper { display: flex; padding: 4px; border-radius: 18px; background: rgba(0,0,0,0.05); }
.type-tab { flex: 1; border: none; padding: 0.7rem; border-radius: 14px; font-weight: 900; cursor: pointer; background: transparent; color: #94a3b8; transition: 0.3s; }
.type-tab.active { color: white; }
.is-expense .active { background: #f43f5e; box-shadow: 0 4px 12px rgba(244, 63, 94, 0.3); }
.is-income .active { background: #10b981; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }

.cat-pill { display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: 0.2s; }
.cat-icon-box { width: 54px; height: 54px; border-radius: 18px; display: flex; justify-content: center; align-items: center; font-size: 1.4rem; opacity: 0.4; }
.cat-pill.selected .cat-icon-box { transform: scale(1.1); opacity: 1; box-shadow: 0 8px 20px rgba(0,0,0,0.1); }

.acc-selector { display: flex; flex-direction: column; align-items: center; padding: 12px; border-radius: 16px; background: rgba(0,0,0,0.03); border: 1.5px solid transparent; cursor: pointer; transition: 0.2s; }
.acc-selector.active { background: var(--app-primary); color: white; border-color: var(--app-primary); }

.pill-btn { padding: 8px 16px; border-radius: 14px; border: 1px solid var(--app-footer-border); background: var(--app-footer-bg); font-size: 0.75rem; font-weight: 800; color: var(--app-text); cursor: pointer; transition: 0.2s; }
.pill-btn.active { background: var(--app-text); color: var(--app-bg); border-color: var(--app-text); }
.plan-pill.active { background: var(--app-primary); color: white; border-color: var(--app-primary); }

.btn-save-expense { background: #f43f5e !important; color: white; }
.btn-save-income { background: #10b981 !important; color: white; }

.empty-placeholder { text-align: center; padding: 5rem 0; }
</style>