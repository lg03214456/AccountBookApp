<script setup lang="ts">
import { ref, computed } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';

// 1. 帳戶分類定義
const categories = [
  { label: '現金', value: 'cash', icon: 'pi-wallet', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  { label: '銀行', value: 'bank', icon: 'pi-building', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
  { label: '信用卡', value: 'card', icon: 'pi-credit-card', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' }
];

// 2. 帳戶資料
const accounts = ref([
  { id: 1, name: '現金錢包', balance: 5200, type: 'cash' },
  { id: 2, name: '台新銀行', balance: 125000, type: 'bank' },
  { id: 3, name: '中信信用卡', balance: -8500, type: 'card' },
]);

const isValueVisible = ref(true); 
const isDialogVisible = ref(false);
const isEditMode = ref(false);

const currentAccount = ref({
  id: null as number | null,
  name: '',
  balance: null as number | null,
  type: 'bank'
});

// 3. 分組邏輯
const groupedAccounts = computed(() => {
  return categories.map(cat => ({
    ...cat,
    items: accounts.value.filter(acc => acc.type === cat.value)
  })).filter(group => group.items.length > 0);
});

// 計算數據
const totalAssets = computed(() => accounts.value.filter(acc => acc.balance! > 0).reduce((sum, acc) => sum + acc.balance!, 0));
const totalLiabilities = computed(() => accounts.value.filter(acc => acc.balance! < 0).reduce((sum, acc) => sum + Math.abs(acc.balance!), 0));
const netWorth = computed(() => totalAssets.value - totalLiabilities.value);

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(val);
};

// 4. 功能函式
const openAddDialog = () => {
  isEditMode.value = false;
  currentAccount.value = { id: null, name: '', balance: null, type: 'bank' };
  isDialogVisible.value = true;
};

const openEditDialog = (acc: any) => {
  isEditMode.value = true;
  currentAccount.value = { ...acc };
  isDialogVisible.value = true;
};

const saveAccount = () => {
  if (!currentAccount.value.name) return;
  if (isEditMode.value) {
    const idx = accounts.value.findIndex(a => a.id === currentAccount.value.id);
    if (idx !== -1) accounts.value[idx] = { ...currentAccount.value } as any;
  } else {
    accounts.value.push({ ...currentAccount.value, id: Date.now(), balance: currentAccount.value.balance || 0 } as any);
  }
  isDialogVisible.value = false;
};

const deleteAccount = () => {
  accounts.value = accounts.value.filter(a => a.id !== currentAccount.value.id);
  isDialogVisible.value = false;
};

// 根據目前選擇的類別獲取顏色
const activeColor = computed(() => {
  return categories.find(c => c.value === currentAccount.value.type)?.color || 'var(--app-primary)';
});
</script>

<template>
  <div class="view-wrapper fade-in">
    <header class="view-header">
      <h1 class="view-title">我的資產</h1>
      <Button 
        :icon="isValueVisible ? 'pi pi-eye' : 'pi pi-eye-slash'" 
        variant="text" size="small" class="opacity-70"
        @click="isValueVisible = !isValueVisible" 
      />
    </header>

    <main class="view-content">
      <section class="summary-section">
        <div class="net-worth-card shadow-lg">
          <div class="relative z-1">
            <p class="text-xs font-bold tracking-widest uppercase opacity-60 mb-2">Net Worth</p>
            <h1 v-if="isValueVisible" class="text-4xl md:text-5xl font-black m-0">{{ formatCurrency(netWorth) }}</h1>
            <h1 v-else class="text-4xl md:text-5xl font-black m-0">******</h1>

            <div class="flex gap-6 mt-4 pt-4 border-top-1 border-white-alpha-10">
              <div>
                <p class="text-xs opacity-60 mb-1 font-bold">總資產</p>
                <p class="font-bold text-green-300 text-xl m-0">{{ isValueVisible ? formatCurrency(totalAssets) : '****' }}</p>
              </div>
              <div>
                <p class="text-xs opacity-60 mb-1 font-bold">總負債</p>
                <p class="font-bold text-red-300 text-xl m-0">{{ isValueVisible ? formatCurrency(totalLiabilities) : '****' }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="list-section mt-5">
        <div v-for="group in groupedAccounts" :key="group.value" class="mb-5">
          <div class="flex align-items-center gap-2 mb-3 px-1 opacity-50">
            <i :class="['pi', group.icon, 'text-sm']"></i>
            <span class="text-xs font-black uppercase tracking-widest">{{ group.label }}</span>
          </div>

          <div class="accounts-grid">
            <Card v-for="acc in group.items" :key="acc.id" 
                  class="mb-3 theme-card account-item-card shadow-sm" 
                  @click="openEditDialog(acc)">
              <template #content>
                <div class="flex justify-content-between align-items-center">
                  <div class="flex align-items-center gap-4">
                    <div :class="['acc-icon-box', acc.balance! >= 0 ? 'box-safe' : 'box-debt']">
                      <i :class="['pi', acc.balance! >= 0 ? 'pi-wallet' : 'pi-credit-card']"></i>
                    </div>
                    <span class="font-black text-lg">{{ acc.name }}</span>
                  </div>
                  <div class="text-right">
                    <div v-if="isValueVisible" :class="['text-xl font-black', acc.balance! >= 0 ? '' : 'text-red-500']">
                      {{ formatCurrency(acc.balance!) }}
                    </div>
                    <div v-else class="text-xl font-black opacity-20">****</div>
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </div>
      </section>
    </main>

    <button class="fab-btn" @click="openAddDialog">
      <i class="pi pi-plus"></i>
    </button>

    <Dialog v-model:visible="isDialogVisible" modal :showHeader="false" :dismissableMask="true" 
            :style="{ width: '92vw', maxWidth: '420px' }" class="modern-dialog">
      <div class="dialog-content">
        <div class="dialog-hero" :style="{ background: `linear-gradient(135deg, ${activeColor} 0%, #1e293b 100%)` }">
          <p class="m-0 text-xs font-bold opacity-60 uppercase tracking-widest">Balance Amount</p>
          <div class="flex align-items-center justify-content-center gap-2 mt-2">
            <span class="text-2xl font-black opacity-50">$</span>
            <InputNumber v-model="currentAccount.balance" mode="decimal" placeholder="0" 
                         class="huge-input" inputClass="huge-input-el" autofocus />
          </div>
          <div class="hero-decoration"></div>
        </div>

        <div class="p-4 pt-5">
          <div class="form-field mb-5">
            <label class="block text-xs font-black opacity-40 mb-2 uppercase tracking-widest">Account Name</label>
            <InputText v-model="currentAccount.name" class="modern-input w-full" placeholder="例如：台新 Richart" />
          </div>

          <div class="form-field mb-6">
            <label class="block text-xs font-black opacity-40 mb-3 uppercase tracking-widest">Account Type</label>
            <div class="type-grid">
              <div v-for="cat in categories" :key="cat.value" 
                   class="type-card" 
                   :class="{ 'active': currentAccount.type === cat.value }"
                   @click="currentAccount.type = cat.value">
                <div class="type-icon" :style="{ color: cat.color, backgroundColor: cat.bg }">
                  <i :class="['pi', cat.icon]"></i>
                </div>
                <span class="type-label">{{ cat.label }}</span>
                <i v-if="currentAccount.type === cat.value" class="pi pi-check-circle active-dot"></i>
              </div>
            </div>
          </div>

          <div class="flex flex-column gap-3">
            <Button :label="isEditMode ? '更新帳戶資訊' : '建立帳戶'" 
                    class="save-btn p-3 font-black border-none" 
                    :style="{ backgroundColor: activeColor }"
                    @click="saveAccount" />
            
            <div class="flex gap-2">
              <Button v-if="isEditMode" icon="pi pi-trash" severity="danger" text class="delete-btn flex-1" @click="deleteAccount" />
              <Button label="取消返回" severity="secondary" text class="flex-2 font-bold opacity-60" @click="isDialogVisible = false" />
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
/* 頁面基礎樣式 (維持之前的一致性) */
.net-worth-card { background: linear-gradient(135deg, var(--app-primary) 0%, #1e293b 100%); color: white; padding: 2.2rem; border-radius: 30px; position: relative; overflow: hidden; }
.acc-icon-box { width: 48px; height: 48px; border-radius: 16px; display: flex; justify-content: center; align-items: center; }
.box-safe { background: rgba(var(--app-primary-rgb), 0.1); color: var(--app-primary); }
.box-debt { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.account-item-card { transition: all 0.2s; cursor: pointer; }
.account-item-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
.fab-btn { position: fixed; bottom: 100px; right: 25px; width: 56px; height: 56px; border-radius: 18px; background: var(--app-primary); color: white; border: none; cursor: pointer; z-index: 100; box-shadow: 0 8px 16px rgba(var(--app-primary-rgb), 0.4); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }

/* ⭐ 彈窗高級感設計 */
:deep(.modern-dialog) { border-radius: 24px; overflow: hidden; border: none; background: var(--app-footer-bg); }

.dialog-content { background: var(--app-footer-bg); }

/* 頂部 Hero 區域 */
.dialog-hero {
  padding: 3rem 2rem; text-align: center; color: white; position: relative; overflow: hidden;
  transition: background 0.5s ease;
}

.hero-decoration {
  position: absolute; top: -50px; right: -50px; width: 150px; height: 150px;
  background: white; opacity: 0.1; border-radius: 50%;
}

:deep(.huge-input-el) {
  background: transparent !important; border: none !important; color: white !important;
  font-size: 3rem !important; font-weight: 900 !important; text-align: center !important;
  padding: 0 !important; width: 100% !important; box-shadow: none !important;
}

/* 現代化輸入框 */
.modern-input {
  background: rgba(var(--app-primary-rgb), 0.05) !important; border: 1.5px solid transparent !important;
  border-radius: 14px !important; padding: 12px 16px !important; font-weight: 700 !important;
  transition: 0.3s;
}
.modern-input:focus { border-color: var(--app-primary) !important; background: transparent !important; }

/* 類型選擇卡片 */
.type-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.type-card {
  background: rgba(var(--app-primary-rgb), 0.03); border: 2px solid transparent;
  padding: 16px 8px; border-radius: 18px; cursor: pointer; text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative;
}
.type-card:hover { transform: translateY(-2px); background: rgba(var(--app-primary-rgb), 0.06); }
.type-card.active { border-color: currentColor; background: white; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }

.type-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-size: 1.2rem; }
.type-label { font-size: 0.8rem; font-weight: 800; opacity: 0.8; }
.active-dot { position: absolute; top: 8px; right: 8px; font-size: 0.9rem; color: var(--app-primary); }

/* 按鈕動畫 */
.save-btn { border-radius: 16px; color: white; box-shadow: 0 8px 20px rgba(0,0,0,0.1); transition: 0.3s; }
.save-btn:hover { transform: translateY(-2px); filter: brightness(1.1); box-shadow: 0 12px 25px rgba(0,0,0,0.15); }
.delete-btn { color: #ef4444 !important; }

/* 深色模式修正 */
:global(.dark-mode) .type-card.active { background: #1e293b; border-color: white; }
:global(.dark-mode) .modern-input { background: rgba(255, 255, 255, 0.05) !important; }
</style>