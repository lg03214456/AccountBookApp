<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAccountStore } from '../stores/accountStore';
import { useTransactionStore } from '../stores/transactionStore';
import { useToast } from 'primevue/usetoast';

import Card from 'primevue/card';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import Toast from 'primevue/toast';

// --- 1. 初始化 Store 與 工具 ---
const accountStore = useAccountStore();
const transactionStore = useTransactionStore();
const toast = useToast();

// --- 2. 狀態控管 ---
const isValueVisible = ref(true); 
const isDialogVisible = ref(false);     // 帳戶編輯/新增彈窗
const isHistoryVisible = ref(false);     // 歷史明細彈窗
const isCatMgrVisible = ref(false);      // 分類管理彈窗
const isEditMode = ref(false);           
const submitted = ref(false);            

// 暫存資料
const currentAccount = ref({ id: null as any, name: '', balance: 0, type: 'cash' });
const selectedAccountForHistory = ref<any>(null);
const newCat = ref({ label: '', icon: 'pi-wallet', color: '#f59e0b' });

// --- 3. 計算屬性 ---

// 依照分類對帳戶進行分組
const groupedAccounts = computed(() => {
  return accountStore.categories.map(cat => ({
    ...cat,
    items: accountStore.accounts.filter(acc => acc.type === cat.value)
  })).filter(group => group.items.length > 0);
});

// 提取選定帳戶的歷史帳目 (由新到舊)
const selectedHistory = computed(() => {
  if (!selectedAccountForHistory.value) return [];
  return transactionStore.transactions
    .filter(t => t.accountId === selectedAccountForHistory.value.id)
    .sort((a, b) => b.timestamp - a.timestamp);
});

// 彈窗頂部 Hero 區域的動態顏色
const activeColor = computed(() => {
  return accountStore.categories.find(c => c.value === currentAccount.value.type)?.color || 'var(--app-primary)';
});

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(val);
};

// --- 4. 核心動作函式 ---

const openAddDialog = () => {
  isEditMode.value = false;
  submitted.value = false;
  // ⭐ 初始化給予 0 而非 null，增加輸入框穩定性
  currentAccount.value = { 
    id: null, 
    name: '', 
    balance: 0, 
    type: accountStore.categories[0]?.value || 'cash' 
  };
  isDialogVisible.value = true;
};

const openEditDialog = (acc: any) => {
  isEditMode.value = true;
  submitted.value = false;
  currentAccount.value = { ...acc };
  isDialogVisible.value = true;
};

const showHistory = (acc: any) => {
  selectedAccountForHistory.value = acc;
  isHistoryVisible.value = true;
};

const saveAccount = () => {
  submitted.value = true;

  // 🔴 防呆校驗
  if (!currentAccount.value.name.trim() || currentAccount.value.balance === null) {
    toast.add({ severity: 'warn', summary: '資訊不完整', detail: '請填寫名稱與初始餘額', life: 3000 });
    return;
  }

  if (isEditMode.value) {
    accountStore.updateAccount(currentAccount.value.id, currentAccount.value);
    toast.add({ severity: 'success', summary: '已更新', life: 2000 });
  } else {
    accountStore.addAccount({ ...currentAccount.value });
    toast.add({ severity: 'success', summary: '帳戶已建立', life: 2000 });
  }
  isDialogVisible.value = false;
};

const handleDeleteAccount = () => {
  accountStore.deleteAccount(currentAccount.value.id);
  isDialogVisible.value = false;
  toast.add({ severity: 'error', summary: '已移除', detail: '帳戶已刪除', life: 2000 });
};

const handleAddCategory = () => {
  if (!newCat.value.label) return;
  const val = newCat.value.label.toLowerCase().trim().replace(/\s+/g, '-');
  accountStore.addCategory({ ...newCat.value, value: val });
  newCat.value = { label: '', icon: 'pi-wallet', color: '#f59e0b' };
};
</script>

<template>
  <div class="view-wrapper fade-in">
    <Toast />

    <header class="view-header">
       <div>
         <h1 class="view-title">我的資產</h1>
         <p class="section-label mt-1 font-bold opacity-30 tracking-widest">Fiscal Atelier Ledger</p>
       </div>
       <div class="flex gap-2">
         <Button icon="pi pi-sliders-h" variant="text" @click="isCatMgrVisible = true" class="opacity-40 hover:opacity-100" />
         <Button :icon="isValueVisible ? 'pi pi-eye' : 'pi pi-eye-slash'" variant="text" @click="isValueVisible = !isValueVisible" class="opacity-40 hover:opacity-100" />
       </div>
    </header>

    <main class="view-content">
      <section class="summary-section mb-6">
        <div class="net-worth-card shadow-lg">
          <div class="card-glass-overlay decoration-only"></div>
          <div class="relative z-1 text-center py-2">
            <p class="text-xs font-black tracking-widest uppercase opacity-40 mb-3">Total Net Worth</p>
            <h1 v-if="isValueVisible" class="text-6xl font-black m-0 tracking-tighter">{{ formatCurrency(accountStore.netWorth) }}</h1>
            <h1 v-else class="text-6xl font-black m-0 tracking-tighter">******</h1>
            
            <div class="flex justify-content-center gap-8 mt-6 pt-5 border-top-1 border-white-alpha-10">
              <div class="stat-box">
                <p class="text-xs opacity-40 mb-1 font-bold">ASSETS</p>
                <p class="font-black text-emerald-300 text-xl m-0">{{ isValueVisible ? formatCurrency(accountStore.totalAssets) : '****' }}</p>
              </div>
              <div class="stat-box">
                <p class="text-xs opacity-40 mb-1 font-bold">LIABILITIES</p>
                <p class="font-black text-rose-300 text-xl m-0">{{ isValueVisible ? formatCurrency(accountStore.totalLiabilities) : '****' }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="list-section">
        <div v-for="group in groupedAccounts" :key="group.value" class="mb-6">
          <div class="group-label mb-3 px-1 flex align-items-center gap-2">
            <div class="label-dot" :style="{ backgroundColor: group.color }"></div>
            <span>{{ group.label }}</span>
          </div>
          
          <div class="accounts-grid">
            <Card v-for="acc in group.items" :key="acc.id" 
                  class="theme-card account-item-card mb-3 cursor-pointer" 
                  @click="showHistory(acc)">
              <template #content>
                <div class="flex justify-content-between align-items-center">
                  <div class="flex align-items-center gap-4 flex-1">
                    <div class="acc-icon-box" :style="{ backgroundColor: group.color + '15', color: group.color }">
                      <i :class="['pi', group.icon]"></i>
                    </div>
                    <div class="flex align-items-center justify-content-between flex-1 pr-2">
                        <span class="font-black text-xl leading-none">{{ acc.name }}</span>
                        <i class="pi pi-pencil edit-trigger-btn" @click.stop="openEditDialog(acc)"></i>
                    </div>
                  </div>
                  <div class="text-right ml-4">
                    <div :class="['text-xl font-black', acc.balance >= 0 ? '' : 'text-rose-500']">
                      {{ isValueVisible ? formatCurrency(acc.balance) : '****' }}
                    </div>
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </div>
      </section>
    </main>

    <button class="fab-btn-atelier shadow-lg" @click="openAddDialog">
      <i class="pi pi-plus"></i>
    </button>

    <Dialog v-model:visible="isDialogVisible" modal :showHeader="false" :dismissableMask="true"
            :style="{ width: '92vw', maxWidth: '420px' }" class="modern-dialog">
      <div class="dialog-content">
        <div class="dialog-hero" :style="{ background: `linear-gradient(135deg, ${activeColor} 0%, #1e293b 100%)` }">
          <div class="card-glass-overlay decoration-only"></div> <p class="m-0 text-xs font-black opacity-50 uppercase tracking-widest z-1 relative">Initial Balance</p>
          <div class="flex align-items-center justify-content-center gap-2 mt-2 z-2 relative">
            <span class="text-2xl font-black opacity-40">$</span>
            <InputNumber v-model="currentAccount.balance" mode="decimal" 
                         class="huge-input" inputClass="huge-input-el" 
                         :class="{ 'p-invalid': submitted && currentAccount.balance === null }"
                         placeholder="0" autofocus />
          </div>
          <small v-if="submitted && currentAccount.balance === null" class="error-text-white z-1 relative">請輸入正確金額</small>
        </div>
        
        <div class="p-5">
          <div class="form-field mb-5">
            <label class="field-label">帳戶名稱 <span class="text-rose-500">*</span></label>
            <InputText v-model="currentAccount.name" 
                       class="modern-input w-full" 
                       :class="{ 'p-invalid': submitted && !currentAccount.name.trim() }"
                       placeholder="如：台新 Richart" />
            <small v-if="submitted && !currentAccount.name.trim()" class="error-msg">此欄位不可為空</small>
          </div>

          <div class="form-field mb-6">
            <label class="field-label">帳戶分類</label>
            <Select v-model="currentAccount.type" :options="accountStore.categories" 
                    optionLabel="label" optionValue="value" class="modern-select w-full" />
          </div>
          
          <div class="flex flex-column gap-3">
            <Button :label="isEditMode ? '更新帳戶資訊' : '啟動新帳戶'" 
                    class="save-btn p-3 font-black shadow-lg" 
                    :style="{ backgroundColor: activeColor }" 
                    @click="saveAccount" />
            
            <div class="flex gap-2">
              <Button v-if="isEditMode" label="刪除帳戶" severity="danger" text class="flex-1 opacity-60" @click="handleDeleteAccount" />
              <Button label="取消" severity="secondary" text class="flex-2 font-bold opacity-40" @click="isDialogVisible = false" />
            </div>
          </div>
        </div>
      </div>
    </Dialog>

    <Dialog v-model:visible="isHistoryVisible" modal header="帳戶往來明細" 
            :dismissableMask="true" :style="{ width: '95vw', maxWidth: '450px' }" class="modern-dialog">
      <div v-if="selectedAccountForHistory" class="p-2">
        <div class="history-summary mb-5 p-4 border-round-3xl bg-black-alpha-5 flex justify-content-between align-items-center">
            <div>
                <p class="m-0 text-xs font-black opacity-40">ACCOUNT</p>
                <h2 class="m-0 font-black">{{ selectedAccountForHistory.name }}</h2>
            </div>
            <div class="text-right">
                <p class="m-0 text-xs font-black opacity-40">CURRENT BALANCE</p>
                <h2 class="m-0 font-black text-primary">{{ formatCurrency(selectedAccountForHistory.balance) }}</h2>
            </div>
        </div>
        
        <div class="history-list custom-scrollbar">
            <div v-if="selectedHistory.length === 0" class="text-center py-8 opacity-20 font-black italic">No records found.</div>
            <div v-for="tx in selectedHistory" :key="tx.id" class="history-item flex justify-content-between align-items-center p-3 mb-2">
                <div class="flex align-items-center gap-3">
                    <div class="tx-indicator" :class="tx.amount >= 0 ? 'is-income' : 'is-expense'"></div>
                    <div>
                        <div class="font-black text-sm">{{ tx.note || tx.category }}</div>
                        <div class="text-xs opacity-40 font-bold">{{ tx.date }}</div>
                    </div>
                </div>
                <div class="font-black text-lg" :class="tx.amount >= 0 ? 'text-emerald-500' : 'text-rose-500'">
                    {{ tx.amount >= 0 ? '+' : '' }}{{ tx.amount.toLocaleString() }}
                </div>
            </div>
        </div>
      </div>
    </Dialog>

    <Dialog v-model:visible="isCatMgrVisible" modal header="管理分類標籤" 
            :dismissableMask="true" :style="{ width: '92vw', maxWidth: '450px' }" class="modern-dialog">
        <div class="p-3">
            <div class="form-field mb-4">
                <InputText v-model="newCat.label" placeholder="新分類名稱" class="w-full modern-input" />
                <Button label="建立分類" @click="handleAddCategory" class="w-full mt-3 p-3 font-black border-round-2xl" />
            </div>
            <div class="cat-list custom-scrollbar pr-1">
                <div v-for="cat in accountStore.categories" :key="cat.value" class="p-3 mb-2 bg-black-alpha-5 border-round-xl flex justify-content-between">
                    <span class="font-bold">{{ cat.label }}</span>
                    <i :class="cat.icon" :style="{ color: cat.color }"></i>
                </div>
            </div>
        </div>
    </Dialog>
  </div>
</template>

<style scoped>
/* 🎨 Fiscal Atelier 核心樣式 */
.view-wrapper { background: var(--app-bg); min-height: 100vh; padding: 1.5rem; }

.net-worth-card { 
  background: linear-gradient(135deg, var(--app-primary) 0%, #1e293b 100%); 
  padding: 3.5rem 2.5rem; border-radius: 40px; position: relative; overflow: hidden;
}

/* ⭐ 關鍵修正：確保裝飾層不會攔截點擊 */
.decoration-only {
  pointer-events: none !important;
  user-select: none !important;
}

.card-glass-overlay {
  position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
  background: radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, transparent 70%);
  transform: rotate(30deg);
  z-index: 1;
}

/* 帳戶項目 */
.account-item-card { 
  border-radius: 28px !important; border: none !important;
  background: rgba(var(--app-primary-rgb), 0.04) !important;
  transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.account-item-card:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,0.05) !important; }

/* 編輯筆按鈕 */
.edit-trigger-btn {
  padding: 10px; font-size: 0.95rem; color: var(--app-text); opacity: 0.2; cursor: pointer; transition: 0.2s;
}
.edit-trigger-btn:hover {
  opacity: 1; transform: scale(1.2); color: var(--app-primary);
}

.acc-icon-box { width: 54px; height: 54px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }

/* FAB */
.fab-btn-atelier { 
  position: fixed; bottom: 120px; right: 25px; width: 64px; height: 64px; 
  border-radius: 24px; background: #004d61; color: white; border: none; 
  font-size: 1.8rem; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 12px 30px rgba(0,77,97,0.4); cursor: pointer;
}

/* 彈窗細節 */
.dialog-hero { padding: 4rem 2rem; border-radius: 0 0 40px 40px; text-align: center; color: white; position: relative; overflow: hidden; }

/* ⭐ 關鍵修正：確保數字輸入框在最前層且可點擊 */
:deep(.huge-input-el) { 
  background: transparent !important; 
  border: none !important; 
  font-size: 3.5rem !important; 
  font-weight: 950 !important; 
  text-align: center !important; 
  color: white !important; 
  width: 100% !important;
  position: relative;
  z-index: 10;
  cursor: text;
}

.modern-input, .modern-select { background: rgba(0,0,0,0.05) !important; border-radius: 16px !important; border: none !important; padding: 1rem !important; font-weight: 800; }
.field-label { display: block; font-size: 0.7rem; font-weight: 900; opacity: 0.4; margin-bottom: 0.5rem; text-transform: uppercase; }
.error-msg { color: #f43f5e; font-size: 0.7rem; font-weight: 800; margin-top: 4px; display: block; }
.error-text-white { color: rgba(255,255,255,0.8); font-size: 0.7rem; font-weight: 800; margin-top: 8px; display: block; }

:deep(.p-invalid) { border: 1.5px solid #f43f5e !important; }

.save-btn { border-radius: 20px; color: white; transition: 0.3s; }
.save-btn:active { transform: scale(0.96); }

/* 📋 歷史明細 */
.history-list { max-height: 400px; overflow-y: auto; padding-right: 8px; }
.tx-indicator { width: 6px; height: 6px; border-radius: 50%; }
.is-income { background: #10b981; }
.is-expense { background: #f43f5e; }

.group-label { font-size: 0.75rem; font-weight: 950; opacity: 0.4; text-transform: uppercase; letter-spacing: 1.5px; }
.label-dot { width: 8px; height: 8px; border-radius: 50%; }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
</style>