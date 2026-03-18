<script setup lang="ts">
import { ref, computed } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';

// 1. 標準化帳戶資料 (與資料庫欄位對應)
const accounts = ref([
  { id: 1, name: '現金錢包', balance: 5200 },
  { id: 2, name: '台新銀行', balance: 125000 },
  { id: 3, name: '中信信用卡', balance: -8500 }, // 負債以負數儲存
]);

const isValueVisible = ref(true); // 全域隱私開關
const isAddDialogVisible = ref(false);

// 2. ⭐ 自動計算各項數據
// 總資產：只加正數
const totalAssets = computed(() => {
  return accounts.value
    .filter(acc => acc.balance > 0)
    .reduce((sum, acc) => sum + acc.balance, 0);
});

// 總負債：只加負數並取絕對值
const totalLiabilities = computed(() => {
  return accounts.value
    .filter(acc => acc.balance < 0)
    .reduce((sum, acc) => sum + Math.abs(acc.balance), 0);
});

// 淨資產：全部加總
const netWorth = computed(() => totalAssets.value - totalLiabilities.value);

// 3. 金額格式化工具
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0
  }).format(val);
};

// 4. 新增帳戶邏輯 (維持正規化格式)
const newAccount = ref({ name: '', balance: null });
const saveAccount = () => {
  if (!newAccount.value.name) return;
  accounts.value.push({
    id: Date.now(),
    name: newAccount.value.name,
    balance: newAccount.value.balance || 0
  });
  newAccount.value = { name: '', balance: null };
  isAddDialogVisible.value = false;
};
</script>

<template>
  <div class="accounts-page fade-in">
    <section class="summary-section mb-6">
      <div class="net-worth-card shadow-lg">
        <div class="flex align-items-center justify-content-between mb-3 opacity-80">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-shield"></i>
            <span class="text-sm font-bold tracking-widest">淨資產總額</span>
          </div>
          <i :class="['pi', isValueVisible ? 'pi-eye' : 'pi-eye-slash', 'cursor-pointer text-xl']" 
             @click="isValueVisible = !isValueVisible"></i>
        </div>
        
        <div class="price-display">
          <h1 v-if="isValueVisible" class="text-4xl font-black">{{ formatCurrency(netWorth) }}</h1>
          <h1 v-else class="text-4xl font-black">******</h1>
        </div>

        <div class="flex gap-5 mt-4 border-top-1 border-white-alpha-20 pt-4">
          <div class="stat-item">
            <p class="text-xs opacity-60 mb-1">總資產</p>
            <p v-if="isValueVisible" class="font-bold text-green-300 text-lg">
              {{ formatCurrency(totalAssets) }}
            </p>
            <p v-else class="font-bold text-green-300 text-lg">****</p>
          </div>
          <div class="stat-item">
            <p class="text-xs opacity-60 mb-1">總負債</p>
            <p v-if="isValueVisible" class="font-bold text-red-300 text-lg">
              {{ formatCurrency(totalLiabilities) }}
            </p>
            <p v-else class="font-bold text-red-300 text-lg">****</p>
          </div>
        </div>
      </div>
    </section>

    <div class="list-section">
      <div class="flex justify-content-between align-items-center mb-4">
        <h3 class="font-bold m-0">資產帳戶</h3>
        <Button icon="pi pi-plus" label="新增" size="small" text @click="isAddDialogVisible = true" />
      </div>

      <Card v-for="acc in accounts" :key="acc.id" class="mb-3 border-round-xl border-none shadow-1">
        <template #content>
          <div class="flex justify-content-between align-items-center p-1">
            <div class="flex align-items-center gap-3">
              <div :class="['icon-box', acc.balance >= 0 ? 'bg-blue-50' : 'bg-red-50']">
                <i :class="['pi', acc.balance >= 0 ? 'pi-wallet text-blue-500' : 'pi-credit-card text-red-500']"></i>
              </div>
              <span class="font-bold text-700">{{ acc.name }}</span>
            </div>
            <span v-if="isValueVisible" :class="['text-lg font-bold', acc.balance >= 0 ? 'text-900' : 'text-red-500']">
              {{ formatCurrency(acc.balance) }}
            </span>
            <span v-else class="text-lg font-bold opacity-30">****</span>
          </div>
        </template>
      </Card>
    </div>

    <Dialog v-model:visible="isAddDialogVisible" modal header="新增帳戶" :style="{ width: '350px' }">
      <div class="flex flex-column gap-4 py-2">
        <div class="field">
          <label class="block font-bold mb-2">帳戶名稱</label>
          <InputText v-model="newAccount.name" class="w-full" placeholder="例如：中信銀行、現金" />
        </div>
        <div class="field">
          <label class="block font-bold mb-2">初始餘額</label>
          <InputNumber v-model="newAccount.balance" class="w-full" mode="decimal" placeholder="0" />
        </div>
        <Button label="確認建立" @click="saveAccount" class="w-full p-3 mt-2" />
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
/* 💎 淨資產卡片：深色背景以突顯資產感 */
.net-worth-card {
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  color: white;
  padding: 1.8rem 2.2rem;
  border-radius: 28px;
  position: relative;
}

.price-display h1 {
  letter-spacing: -1.5px;
}

.icon-box {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.list-section {
  padding-bottom: 2rem;
}
</style>