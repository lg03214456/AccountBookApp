<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePlanStore } from '../stores/planStore';
import { useTransactionStore } from '../stores/transactionStore';
import { useAccountStore } from '../stores/accountStore';
import { useToast } from 'primevue/usetoast';

import DatePicker from 'primevue/datepicker';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import SelectButton from 'primevue/selectbutton';
import Toast from 'primevue/toast';

// --- 1. 初始化 Store ---
const planStore = usePlanStore();
const transactionStore = useTransactionStore();
const accountStore = useAccountStore();
const toast = useToast();

const activeView = ref('Calendar');
const viewOptions = ref(['Calendar', 'List']);
const selectedDate = ref(new Date());

const isAddDialogVisible = ref(false);
const isEditing = ref(false);
const editingId = ref<number | null>(null);

// --- 2. 狀態控管 ---
const amount = ref<number | null>(0);
const newEntry = ref({
  date: new Date(),
  category: '飲食', note: '', type: 'Expense' as 'Expense' | 'Income' | 'Transfer',
  accountId: accountStore.accounts[0]?.id || 0,
  targetAccountId: accountStore.accounts[1]?.id || 0,
  planId: 0 
});

const activeAccountType = ref(accountStore.categories[0]?.value || 'cash');
const activeTargetAccountType = ref(accountStore.categories[0]?.value || 'cash');

// --- 3. 核心計算邏輯 ---
const filteredPlans = computed(() => {
  const allPlans = planStore.plans;
  return newEntry.value.type === 'Expense' 
    ? allPlans.filter(p => p.type === 'Expense') 
    : allPlans.filter(p => p.type === 'Saving');
});

const availablePlansForSelect = computed(() => [
  { id: 0, name: '不關聯計畫', color: '#94a3b8' },
  ...filteredPlans.value
]);

const formatDateString = (date: Date | string) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formattedDate = computed(() => formatDateString(selectedDate.value));

const dailyTransactions = computed(() => 
  transactionStore.transactions.filter(item => item.date === formattedDate.value)
);

const dailyTotal = computed(() => 
  dailyTransactions.value.reduce((acc, cur) => acc + cur.amount, 0)
);

const groupedTransactions = computed(() => {
  const sorted = [...transactionStore.transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime() || b.timestamp - a.timestamp
  );
  const groups: Record<string, any[]> = {};
  sorted.forEach(tx => {
    if (!groups[tx.date]) groups[tx.date] = [];
    groups[tx.date].push(tx);
  });
  return groups;
});

// --- 4. 動作函式 ---
const prepareNewEntry = () => {
  isEditing.value = false;
  editingId.value = null;
  amount.value = 0;
  newEntry.value = { 
    date: selectedDate.value,
    category: '飲食', note: '', type: 'Expense', 
    accountId: accountStore.accounts[0]?.id || 0, 
    targetAccountId: accountStore.accounts[1]?.id || 0, planId: 0 
  };
  isAddDialogVisible.value = true;
};

const prepareEditEntry = (item: any) => {
  isEditing.value = true;
  editingId.value = item.id;
  amount.value = Math.abs(item.amount);
  
  let type: 'Expense' | 'Income' | 'Transfer' = 'Expense';
  if (item.category === '轉帳') {
    type = 'Transfer';
  } else {
    type = item.amount < 0 ? 'Expense' : 'Income';
  }

  newEntry.value = { 
    date: new Date(item.date),
    category: item.category, note: item.note, type: type, 
    accountId: item.accountId, targetAccountId: item.targetAccountId || 0, planId: item.planId || 0 
  };
  
  const account = accountStore.accounts.find(a => a.id === item.accountId);
  if (account) activeAccountType.value = account.type;
  isAddDialogVisible.value = true;
};

const confirmDelete = () => {
  if (editingId.value !== null) {
    transactionStore.deleteTransaction(editingId.value);
    isAddDialogVisible.value = false;
    toast.add({ severity: 'info', summary: '紀錄已刪除', life: 2000 });
  }
};

const saveTransaction = () => {
  if (amount.value === null || amount.value === 0) return;
  if (isEditing.value && editingId.value !== null) {
    transactionStore.deleteTransaction(editingId.value);
  }

  const dateToSave = formatDateString(newEntry.value.date);

  if (newEntry.value.type === 'Transfer') {
    transactionStore.addTransaction({
      date: dateToSave, category: '轉帳', amount: -Math.abs(amount.value),
      note: `➜ ${getAccountName(newEntry.value.targetAccountId)} ${newEntry.value.note}`,
      accountId: newEntry.value.accountId, planId: newEntry.value.planId || null
    });
    transactionStore.addTransaction({
      date: dateToSave, category: '轉帳', amount: Math.abs(amount.value),
      note: `來自 ${getAccountName(newEntry.value.accountId)} ${newEntry.value.note}`,
      accountId: newEntry.value.targetAccountId, planId: newEntry.value.planId || null
    });
  } else {
    const finalAmount = newEntry.value.type === 'Expense' ? -Math.abs(amount.value) : Math.abs(amount.value);
    transactionStore.addTransaction({
      date: dateToSave, category: newEntry.value.category, amount: finalAmount,
      note: newEntry.value.note, accountId: newEntry.value.accountId, 
      planId: newEntry.value.planId === 0 ? null : newEntry.value.planId
    });
  }
  isAddDialogVisible.value = false;
  toast.add({ severity: 'success', summary: '儲存完成', life: 2000 });
};

const getAccountName = (id: number) => accountStore.accounts.find(a => a.id === id)?.name || '未指定';
const formatTime = (ts: number) => new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(ts));
</script>

<template>
  <div class="view-wrapper fade-in">
    <Toast />

    <nav class="top-nav flex align-items-center mb-4">
      <div class="flex align-items-center gap-3">
        <div class="user-avatar shadow-sm"><i class="pi pi-user text-xl"></i></div>
        <span class="brand-text font-black text-xl">Fiscal Atelier</span>
      </div>
    </nav>

    <header class="page-header flex justify-content-between align-items-center mb-5 px-2">
      <div class="title-group">
        <h1 class="main-title">日常記帳</h1>
        <p class="sub-title font-bold opacity-30 uppercase tracking-widest">ATELIER LEDGER</p>
      </div>
      <div class="switcher-wrapper">
        <SelectButton v-model="activeView" :options="viewOptions" class="modern-switcher" />
      </div>
    </header>

    <main class="view-content">
      <div v-if="activeView === 'Calendar'" class="calendar-view">
        <Card class="calendar-card mb-5 shadow-sm border-none">
          <template #content>
            <DatePicker v-model="selectedDate" inline class="styled-datepicker" />
          </template>
        </Card>

        <div class="daily-detail-section">
          <div class="section-header-row flex justify-content-between align-items-end mb-5 px-2">
            <div class="flex flex-column gap-1">
              <span class="detail-date font-black text-xl">{{ formattedDate }}</span>
              <div class="flex align-items-center gap-2">
                <span class="detail-count opacity-30 font-bold text-xs uppercase">{{ dailyTransactions.length }} Records</span>
                <div class="h-px w-1rem bg-slate-200"></div>
              </div>
            </div>

            <div class="daily-total-group text-right">
              <span class="text-xs opacity-40 font-black uppercase block mb-1">Daily Total</span>
              <span :class="dailyTotal >= 0 ? 'is-profit-text' : 'is-loss-text'" class="text-2xl font-black">
                {{ dailyTotal > 0 ? '+' : '' }}{{ dailyTotal.toLocaleString() }}
              </span>
            </div>
          </div>

          <template v-if="dailyTransactions.length > 0">
            <div v-for="item in dailyTransactions" :key="item.id" class="tx-white-card shadow-sm mb-3 clickable" @click="prepareEditEntry(item)">
               <div class="flex justify-content-between align-items-center w-full">
                  <div class="flex align-items-center gap-4">
                    <div class="icon-box-circle"><i :class="item.amount < 0 ? 'pi pi-shopping-bag' : 'pi pi-wallet'"></i></div>
                    <div class="text-group">
                      <div class="text-main font-black">{{ item.note || item.category }}</div>
                      <div class="text-sub font-bold opacity-30">{{ getAccountName(item.accountId) }}</div>
                    </div>
                  </div>
                  <div class="value-amount font-black" :class="{ 'is-profit-text': item.amount >= 0, 'is-loss-text': item.amount < 0 }">
                    {{ item.amount >= 0 ? '+' : '' }}{{ item.amount.toLocaleString() }}
                  </div>
               </div>
            </div>
          </template>
          <div v-else class="empty-placeholder flex flex-column align-items-center justify-content-center p-6 opacity-20">
             <i class="pi pi-receipt text-6xl mb-3"></i>
             <span class="font-black">今日尚無記帳紀錄</span>
          </div>
        </div>
      </div>

      <div v-else class="list-view px-1">
        <template v-if="Object.keys(groupedTransactions).length > 0">
          <div v-for="(txs, date) in groupedTransactions" :key="date" class="list-group mb-6">
            <div class="list-date-header mb-4 px-2"><span class="font-black text-lg text-slate-400">{{ date }}</span></div>
            <div v-for="item in txs" :key="item.id" class="tx-white-card shadow-sm mb-3 clickable" @click="prepareEditEntry(item)">
                 <div class="flex justify-content-between align-items-center w-full">
                  <div class="flex align-items-center gap-4">
                    <div class="icon-box-circle small"><i :class="item.amount < 0 ? 'pi pi-shopping-bag' : 'pi pi-wallet'"></i></div>
                    <div class="text-main font-black">{{ item.note || item.category }}</div>
                  </div>
                  <div class="value-amount font-black" :class="{ 'is-profit-text': item.amount >= 0, 'is-loss-text': item.amount < 0 }">
                    {{ item.amount.toLocaleString() }}
                  </div>
               </div>
            </div>
          </div>
        </template>
        <div v-else class="empty-placeholder flex flex-column align-items-center justify-content-center p-8 opacity-20">
             <i class="pi pi-inbox text-6xl mb-3"></i>
             <span class="font-black">目前沒有任何紀錄</span>
        </div>
      </div>
    </main>

    <button class="fab-atelier-modern" @click="prepareNewEntry">
      <i class="pi pi-plus mr-3"></i><span class="font-black">快速記帳</span>
    </button>

    <Dialog v-model:visible="isAddDialogVisible" modal :showHeader="false" :dismissableMask="true"
            :style="{ width: '92vw', maxWidth: '420px' }" class="modern-dialog">
      <div class="transaction-panel p-5">
        <div class="dialog-header-group mb-5">
          <h2 class="m-0 text-2xl font-black mb-1">{{ isEditing ? '編輯紀錄' : '快速記帳' }}</h2>
          <DatePicker v-model="newEntry.date" dateFormat="yy/mm/dd" class="inline-date-picker" :showIcon="true" />
        </div>

        <div class="type-toggle mb-5" :class="`is-${newEntry.type.toLowerCase()}`">
          <button @click="newEntry.type = 'Expense'" :class="{ active: newEntry.type === 'Expense' }">支出</button>
          <button @click="newEntry.type = 'Income'" :class="{ active: newEntry.type === 'Income' }">收入</button>
          <button @click="newEntry.type = 'Transfer'" :class="{ active: newEntry.type === 'Transfer' }">轉帳</button>
        </div>

        <div class="amount-hero mb-6">
          <InputNumber v-model="amount" mode="decimal" inputClass="huge-input-el-dark" class="w-full" autofocus />
        </div>

        <div class="ux-account-flow mb-6">
          <div class="ux-step-section">
            <p class="ux-label mb-3">{{ newEntry.type === 'Transfer' ? '從哪個帳戶轉出？' : '帳戶型態' }}</p>
            <div class="flex flex-wrap gap-2">
              <button v-for="cat in accountStore.categories" :key="cat.value" 
                      @click="activeAccountType = cat.value" 
                      class="pill-button" :class="{ active: activeAccountType === cat.value }">
                {{ cat.label }}
              </button>
            </div>
          </div>

          <div class="ux-connector-line">
            <i class="pi pi-arrow-down-right"></i>
          </div>

          <div class="ux-step-section ml-4">
            <p class="ux-label mb-3">帳戶名稱</p>
            <div class="flex flex-wrap gap-2">
              <button v-for="acc in accountStore.accounts.filter(a => a.type === activeAccountType)" 
                      :key="acc.id" @click="newEntry.accountId = acc.id" 
                      class="pill-button child" :class="{ active: newEntry.accountId === acc.id }">
                {{ acc.name }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="newEntry.type === 'Transfer'" class="ux-account-flow mb-6 border-top-1 border-slate-100 pt-5 mt-2 fade-in">
          <div class="ux-step-section">
            <p class="ux-label mb-3">要轉入到？</p>
            <div class="flex flex-wrap gap-2">
              <button v-for="cat in accountStore.categories" :key="cat.value" 
                      @click="activeTargetAccountType = cat.value" 
                      class="pill-button" :class="{ active: activeTargetAccountType === cat.value }">
                {{ cat.label }}
              </button>
            </div>
          </div>
          <div class="ux-connector-line"><i class="pi pi-arrow-down-right"></i></div>
          <div class="ux-step-section ml-4">
            <p class="ux-label mb-3">目標帳戶</p>
            <div class="flex flex-wrap gap-2">
              <button v-for="acc in accountStore.accounts.filter(a => a.type === activeTargetAccountType)" 
                      :key="acc.id" @click="newEntry.targetAccountId = acc.id" 
                      class="pill-button child" :class="{ active: newEntry.targetAccountId === acc.id }">
                {{ acc.name }}
              </button>
            </div>
          </div>
        </div>

        <div class="ux-step-section mb-6">
          <p class="ux-label mb-3">關聯計畫</p>
          <div class="flex flex-wrap gap-2">
            <button v-for="plan in availablePlansForSelect" :key="plan.id" 
                    @click="newEntry.planId = plan.id" 
                    class="pill-button plan-type" 
                    :style="{ '--p-color': plan.color }"
                    :class="{ active: newEntry.planId === plan.id }">{{ plan.name }}</button>
          </div>
        </div>

        <InputText v-model="newEntry.note" placeholder="備註..." class="atelier-input w-full mb-6" />
        
        <div class="action-footer flex flex-column gap-3">
            <div class="flex gap-3">
                <Button v-if="isEditing" icon="pi pi-trash" severity="danger" class="del-btn-circle" @click="confirmDelete" />
                <Button :label="isEditing ? '儲存修改' : '確認儲存'" class="flex-1 p-3 atelier-save-btn" @click="saveTransaction" />
            </div>
            <Button label="取消" class="p-button-text p-button-secondary font-bold opacity-40" @click="isAddDialogVisible = false" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.view-wrapper { background: #f8fafc; min-height: 100vh; padding: 1.2rem; }
.main-title { font-size: 1.8rem; font-weight: 950; color: #1e293b; letter-spacing: -1px; line-height: 1.1; margin: 0; }
.sub-title { font-size: 0.75rem; color: #94a3b8; letter-spacing: 1.2px; margin-top: 2px; }

.page-header { display: flex; justify-content: space-between; align-items: center; }

.section-header-row { border-left: 4px solid #1e293b; padding-left: 0.8rem; }
.detail-date { color: #1e293b; line-height: 1; white-space: nowrap; }

.is-profit-text { color: #10b981 !important; }
.is-loss-text { color: #f43f5e !important; }

.tx-white-card { background: white; padding: 1rem 1.2rem; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); display: flex; }
.clickable { cursor: pointer; transition: 0.2s; }
.clickable:active { transform: scale(0.98); }

.modern-switcher :deep(.p-button) { border-radius: 14px; border: none; background: #f1f5f9; color: #94a3b8; font-weight: 900; padding: 0.5rem 1rem; font-size: 0.85rem; }
.modern-switcher :deep(.p-highlight) { background: white !important; color: #1e293b !important; }

/* 🌟 修正：提高按鈕位址 */
.fab-atelier-modern { position: fixed; bottom: 100px; right: 20px; background: #003d4d; color: white; border: none; padding: 1rem 1.8rem; border-radius: 35px; z-index: 1000; box-shadow: 0 8px 25px rgba(0,61,77,0.3); cursor: pointer; }

.atelier-save-btn { background: #003d4d !important; color: white; border-radius: 18px !important; font-weight: 950; }
.del-btn-circle { background: #fee2e2 !important; border-radius: 18px !important; color: #ef4444 !important; width: 54px; height: 54px; }

.type-toggle { display: flex; padding: 4px; border-radius: 15px; background: rgba(0,0,0,0.05); }
.type-toggle button { flex: 1; border: none; padding: 0.7rem; border-radius: 12px; font-weight: 900; cursor: pointer; transition: 0.3s; color: #94a3b8; }
.type-toggle .active { background: white; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }

.is-expense .active { color: #f43f5e !important; }
.is-income .active { color: #10b981 !important; }
.is-transfer .active { color: #3b82f6 !important; }

.ux-connector-line { padding: 0.5rem 0 0.5rem 1.2rem; color: #e2e8f0; font-size: 0.7rem; }
.pill-button { padding: 8px 15px; border-radius: 14px; border: 1.5px solid rgba(0,0,0,0.03); background: white; font-weight: 800; font-size: 0.8rem; cursor: pointer; }
.pill-button.active { background: #0f172a; color: white; }
.pill-button.child.active { background: #003d4d !important; }

.atelier-input { background: rgba(0,0,0,0.04) !important; border: none !important; border-radius: 14px !important; padding: 0.8rem !important; }
:deep(.huge-input-el-dark) { width: 100% !important; border: none !important; font-size: 3.5rem !important; font-weight: 950 !important; text-align: center !important; background: transparent !important; color: #1e293b !important; }

.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>