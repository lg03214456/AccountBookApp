<script setup lang="ts">
import { ref, computed } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';

// 1. 標準化帳戶資料
const accounts = ref([
  { id: 1, name: '現金錢包', balance: 5200, type: 'cash' },
  { id: 2, name: '台新銀行', balance: 125000, type: 'bank' },
  { id: 3, name: '中信信用卡', balance: -8500, type: 'card' },
]);

const isValueVisible = ref(true); 
const isAddDialogVisible = ref(false);

// 2. ⭐ 數據計算邏輯
const totalAssets = computed(() => {
  return accounts.value
    .filter(acc => acc.balance > 0)
    .reduce((sum, acc) => sum + acc.balance, 0);
});

const totalLiabilities = computed(() => {
  return accounts.value
    .filter(acc => acc.balance < 0)
    .reduce((sum, acc) => sum + Math.abs(acc.balance), 0);
});

const netWorth = computed(() => totalAssets.value - totalLiabilities.value);

// 3. 金額格式化
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0
  }).format(val);
};

// 4. 新增帳戶邏輯
const newAccount = ref({ name: '', balance: null });
const saveAccount = () => {
  if (!newAccount.value.name) return;
  accounts.value.push({
    id: Date.now(),
    name: newAccount.value.name,
    balance: newAccount.value.balance || 0,
    type: (newAccount.value.balance || 0) >= 0 ? 'bank' : 'card'
  });
  newAccount.value = { name: '', balance: null };
  isAddDialogVisible.value = false;
};
</script>

<template>
  <div class="view-wrapper fade-in">
    
    <header class="view-header">
      <h1 class="view-title">我的資產</h1>
      <div class="header-actions">
        <Button 
          :icon="isValueVisible ? 'pi pi-eye' : 'pi pi-eye-slash'" 
          :label="isValueVisible ? '隱藏金額' : '顯示金額'"
          variant="text" 
          size="small" 
          class="opacity-70"
          @click="isValueVisible = !isValueVisible" 
        />
      </div>
    </header>

    <main class="view-content">
      <section class="summary-section">
        <div class="net-worth-card shadow-lg">
          <div class="card-bg-decoration"></div>
          <div class="relative z-1">
            <div class="flex align-items-center gap-2 mb-2 opacity-80">
              <i class="pi pi-shield text-xs"></i>
              <span class="text-xs font-bold tracking-widest uppercase">Net Worth Estimation</span>
            </div>
            
            <div class="price-display py-2">
              <h1 v-if="isValueVisible" class="text-4xl md:text-5xl font-black m-0">
                {{ formatCurrency(netWorth) }}
              </h1>
              <h1 v-else class="text-4xl md:text-5xl font-black m-0 tracking-tighter">******</h1>
            </div>

            <div class="flex gap-6 mt-4 pt-4 border-top-1 border-white-alpha-10">
              <div class="stat-item">
                <p class="text-xs opacity-60 mb-1 font-bold">總資產</p>
                <p v-if="isValueVisible" class="font-bold text-green-300 text-xl m-0">
                  {{ formatCurrency(totalAssets) }}
                </p>
                <p v-else class="font-bold text-green-300 text-xl m-0">****</p>
              </div>
              <div class="stat-item">
                <p class="text-xs opacity-60 mb-1 font-bold">總負債</p>
                <p v-if="isValueVisible" class="font-bold text-red-300 text-xl m-0">
                  {{ formatCurrency(totalLiabilities) }}
                </p>
                <p v-else class="font-bold text-red-300 text-xl m-0">****</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="list-section mt-4">
        <div class="flex justify-content-between align-items-center mb-3 px-1">
          <span class="text-sm font-black opacity-40 tracking-widest uppercase">Accounts List</span>
          <Button icon="pi pi-plus" label="新增帳戶" size="small" rounded severity="secondary" @click="isAddDialogVisible = true" />
        </div>

        <div class="accounts-grid">
          <Card v-for="acc in accounts" :key="acc.id" class="mb-3 theme-card account-item-card shadow-sm">
            <template #content>
              <div class="flex justify-content-between align-items-center">
                <div class="flex align-items-center gap-4">
                  <div :class="['acc-icon-box', acc.balance >= 0 ? 'box-safe' : 'box-debt']">
                    <i :class="['pi', acc.balance >= 0 ? 'pi-wallet' : 'pi-credit-card']"></i>
                  </div>
                  <div>
                    <div class="font-black text-lg">{{ acc.name }}</div>
                    <div class="text-xs opacity-50 font-bold uppercase tracking-tight">
                      {{ acc.balance >= 0 ? 'Asset Account' : 'Debt / Liability' }}
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <div v-if="isValueVisible" :class="['text-xl font-black', acc.balance >= 0 ? '' : 'text-red-500']">
                    {{ formatCurrency(acc.balance) }}
                  </div>
                  <div v-else class="text-xl font-black opacity-20">****</div>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </section>
    </main>

    <Dialog v-model:visible="isAddDialogVisible" modal :showHeader="false" :dismissableMask="true" :style="{ width: '90vw', maxWidth: '380px' }" class="custom-dialog">
      <div class="p-4">
        <h3 class="mt-0 mb-4 font-black text-xl">建立新帳戶</h3>
        <div class="flex flex-column gap-4">
          <div class="field">
            <label class="block text-xs font-bold opacity-50 mb-2 uppercase tracking-widest">Account Name</label>
            <InputText v-model="newAccount.name" class="w-full p-3 border-round-xl" placeholder="例如：國泰世華、現金錢包" autofocus />
          </div>
          <div class="field">
            <label class="block text-xs font-bold opacity-50 mb-2 uppercase tracking-widest">Initial Balance</label>
            <InputNumber v-model="newAccount.balance" class="w-full" inputClass="p-3 border-round-xl" mode="decimal" placeholder="0" />
          </div>
          <div class="flex gap-2 mt-2">
            <Button label="取消" severity="secondary" text class="flex-1 font-bold" @click="isAddDialogVisible = false" />
            <Button label="確認建立" class="flex-2 font-bold p-3 border-round-xl" @click="saveAccount" />
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
/* 💎 淨資產卡片樣式優化 */
.net-worth-card {
  background: linear-gradient(135deg, var(--app-primary) 0%, #1e293b 100%);
  color: white;
  padding: 2rem;
  border-radius: 30px;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.card-bg-decoration {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 120px;
  height: 120px;
  background: white;
  opacity: 0.05;
  border-radius: 50%;
}

.price-display h1 {
  letter-spacing: -2px;
}

/* 帳戶項目圖標 */
.acc-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
}

.box-safe { background: rgba(var(--app-primary-rgb), 0.1); color: var(--app-primary); }
.box-debt { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.account-item-card {
  transition: transform 0.2s ease;
  cursor: pointer;
}

.account-item-card:hover {
  transform: scale(1.01) translateY(-2px);
}

/* 深色模式適應 */
:global(.dark-mode) .net-worth-card {
  background: linear-gradient(135deg, #0f172a 0%, var(--app-primary) 100%);
  border-color: rgba(255, 255, 255, 0.05);
}
</style>