<script setup lang="ts">
import { ref, computed } from 'vue';
import DatePicker from 'primevue/datepicker';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';

// 1. 狀態控管
const isAddDialogVisible = ref(false);
const selectedDate = ref(new Date());

const transactions = ref([
  { id: 1, date: '2026-03-19', category: '飲食', type: 'Expense', amount: -150, note: '午餐便當', account: '錢包' },
]);

// 2. 暫存資料
const amountStr = ref('0.00');
const newEntry = ref({
  category: '飲食',
  note: '',
  type: 'Expense',
  account: '錢包' 
});

// ⭐ 帳戶二級連動資料
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

// 2. ⭐ 定義型別：這會從 subAccountMap 的 key 自動推導出 'cash' | 'card' | 'bank'
type AccountType = keyof typeof subAccountMap;

// 3. 宣告變數時指定型別
const activeAccountType = ref<AccountType>('cash');

// 處理總類切換
// 4. 處理切換函式
const selectAccountType = (typeId: string) => {
  // 這裡使用類型斷言 (Type Assertion) 告訴 TS：這個字串就是 AccountType 之一
  const id = typeId as AccountType;
  activeAccountType.value = id;
  
  // 這樣就不會報錯了，因為 TS 知道 subAccountMap[id] 一定存在
  newEntry.value.account = subAccountMap[id][0];
};

const categories = [
  { name: '飲食', icon: 'pi-utensils', color: '#dbeafe', iconColor: '#3b82f6' },
  { name: '購物', icon: 'pi-shopping-bag', color: '#f3f4f6', iconColor: '#4b5563' },
  { name: '交通', icon: 'pi-car', color: '#ecfdf5', iconColor: '#10b981' },
  { name: '其他', icon: 'pi-ellipsis-h', color: '#f5f3ff', iconColor: '#8b5cf6' },
];

// 3. 數字鍵盤
const appendNum = (n: string) => {
  if (amountStr.value === '0.00') amountStr.value = n;
  else if (n === '.' && amountStr.value.includes('.')) return;
  else amountStr.value += n;
};
const deleteNum = () => {
  if (amountStr.value.length > 1) amountStr.value = amountStr.value.slice(0, -1);
  else amountStr.value = '0.00';
};

// 4. 儲存與格式化
const formattedDate = computed(() => {
  const d = selectedDate.value;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
});

const saveTransaction = () => {
  const finalAmt = parseFloat(amountStr.value);
  if (finalAmt === 0) return;

  transactions.value.push({
    id: Date.now(),
    date: formattedDate.value,
    category: newEntry.value.category,
    type: newEntry.value.type,
    amount: newEntry.value.type === 'Expense' ? -finalAmt : finalAmt,
    note: newEntry.value.note,
    account: newEntry.value.account
  });

  amountStr.value = '0.00';
  newEntry.value.note = '';
  isAddDialogVisible.value = false;
};

const dailyTransactions = computed(() => transactions.value.filter(item => item.date === formattedDate.value));
const dailyTotal = computed(() => dailyTransactions.value.reduce((acc, cur) => acc + cur.amount, 0));
</script>

<template>
  <div class="accounting-container fade-in">
    <section class="calendar-section"><DatePicker v-model="selectedDate" inline class="custom-calendar" /></section>
    
    <section class="details-section">
      <div class="details-header mb-4 flex justify-content-between align-items-center">
        <h2 class="date-title m-0">{{ formattedDate }}</h2>
        <Tag :severity="dailyTotal >= 0 ? 'success' : 'danger'" class="p-2 px-3 border-round-xl">
          今日損益: {{ dailyTotal.toLocaleString() }}
        </Tag>
      </div>

      <div class="transaction-list-wrapper">
        <Card v-for="item in dailyTransactions" :key="item.id" class="item-card shadow-1 mb-3">
          <template #content>
            <div class="flex justify-content-between align-items-center">
              <div class="flex align-items-center gap-3">
                <div class="category-icon">{{ item.category[0] }}</div>
                <div>
                  <div class="font-bold">{{ item.category }}</div>
                  <div class="text-xs opacity-60">{{ item.account }} | {{ item.note || '無備註' }}</div>
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

    <button class="fab-btn" @click="isAddDialogVisible = true"><i class="pi pi-plus"></i><span class="fab-text">快速記帳</span></button>

    <Dialog v-model:visible="isAddDialogVisible" modal :showHeader="false" :style="{ width: '100vw', maxWidth: '420px' }" class="custom-dialog">
      <div class="transaction-panel p-4">
        
        <div class="toggle-container mb-5" :class="newEntry.type === 'Expense' ? 'border-expense' : 'border-income'">
          <button @click="newEntry.type = 'Expense'" class="type-btn" :class="{ 'btn-expense-active': newEntry.type === 'Expense' }">支出</button>
          <button @click="newEntry.type = 'Income'" class="type-btn" :class="{ 'btn-income-active': newEntry.type === 'Income' }">收入</button>
        </div>

        <div class="amount-area text-center mb-5">
          <div class="flex justify-content-center align-items-baseline gap-2">
            <span class="text-3xl font-bold" :class="newEntry.type === 'Expense' ? 'text-red-500' : 'text-green-500'">$</span>
            <span class="text-6xl font-black tracking-tighter">{{ amountStr }}</span>
          </div>
        </div>

        <div class="form-card mb-4">
          <p class="text-xs font-bold opacity-40 mb-3 tracking-widest">CATEGORY</p>
          <div class="flex justify-content-between">
            <div v-for="cat in categories" :key="cat.name" class="cat-item" 
                 :class="{ 'active': newEntry.category === cat.name }" @click="newEntry.category = cat.name">
              <div class="cat-circle" :style="{ backgroundColor: cat.color }"><i :class="['pi', cat.icon]" :style="{ color: cat.iconColor }"></i></div>
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

        <div class="form-card mb-5">
          <InputText v-model="newEntry.note" placeholder="在這裡輸入備註..." class="w-full border-none p-0 bg-transparent font-bold text-sm" />
        </div>

        <div class="keypad mb-5">
          <div v-for="k in ['1','2','3','4','5','6','7','8','9','.', '0']" :key="k" class="key" @click="appendNum(k)">{{ k }}</div>
          <div class="key text-red-500" @click="deleteNum"><i class="pi pi-backspace"></i></div>
        </div>

        <Button label="確認儲存" @click="saveTransaction" 
                :class="newEntry.type === 'Expense' ? 'save-expense' : 'save-income'" class="w-full p-3 font-bold border-none" />
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.accounting-container { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; max-width: 1200px; margin: 0 auto; }
@media (max-width: 992px) { .accounting-container { grid-template-columns: 1fr; } }

/* 🔴🟢 模式切換 */
.toggle-container { display: flex; padding: 6px; border-radius: 20px; background: var(--app-bg); border: 3px solid transparent; transition: 0.3s; }
.border-expense { border-color: #fee2e2; }
.border-income { border-color: #dcfce7; }
.type-btn { flex: 1; border: none; padding: 0.8rem; border-radius: 15px; font-weight: 800; cursor: pointer; background: transparent; color: #94a3b8; transition: 0.3s; }
.btn-expense-active { background: #ef4444 !important; color: white !important; }
.btn-income-active { background: #22c55e !important; color: white !important; }

/* 💳 帳戶總類 (第一層) */
.account-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.acc-type-box {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 10px; border-radius: 14px; border: 1px solid var(--app-footer-border);
  background: var(--app-bg); cursor: pointer; transition: 0.2s; font-size: 0.8rem; font-weight: 700;
}
.type-active { background: var(--app-primary) !important; color: white !important; border-color: var(--app-primary); }

/* 💳 子帳戶 Pills (第二層) */
.sub-account-list {
  background: rgba(0,0,0,0.02); padding: 8px; border-radius: 12px;
}
.sub-acc-pill {
  border: 1px solid rgba(0,0,0,0.05); background: white; padding: 5px 12px;
  border-radius: 20px; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: 0.2s;
}
.sub-active { background: #334155 !important; color: white !important; border-color: #334155; }

/* 鍵盤與內容 */
.form-card { background: rgba(0,0,0,0.03); padding: 1.2rem; border-radius: 22px; }
.keypad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.key { height: 58px; display: flex; justify-content: center; align-items: center; font-size: 1.6rem; font-weight: 900; cursor: pointer; border-radius: 12px; }
.save-expense { background: #ef4444; color: white; border-radius: 18px; }
.save-income { background: #22c55e; color: white; border-radius: 18px; }

/* 其他 */
.cat-item { display: flex; flex-direction: column; align-items: center; opacity: 0.3; transition: 0.3s; cursor: pointer; }
.cat-item.active { opacity: 1; transform: scale(1.1); }
.cat-circle { width: 52px; height: 52px; border-radius: 50%; display: flex; justify-content: center; align-items: center; }
.fab-btn { position: fixed; bottom: 95px; right: 25px; background: #ff9f0a; border: none; padding: 1rem 1.8rem; border-radius: 50px; font-weight: 800; cursor: pointer; z-index: 100; }

/* 深色模式修正 */
:global(.dark-mode) .sub-acc-pill { background: #1e293b; color: #94a3b8; border-color: #334155; }
:global(.dark-mode) .sub-active { background: var(--app-primary) !important; color: white !important; }
</style>