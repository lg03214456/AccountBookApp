<script setup lang="ts">
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import ProgressBar from 'primevue/progressbar';
import Toast from 'primevue/toast';

// --- 1. 基礎類型與初始資料 ---
const toast = useToast();
const submitted = ref(false);

interface Plan {
  id: number;
  name: string;
  budget: number;
  color: string;
  icon: string;
}

interface Transaction {
  id: number;
  planId: number;
  category: string;
  amount: number;
  note: string;
  date: string;
  account: string;
}

const presetIcons = ['pi-flag-fill', 'pi-briefcase', 'pi-home', 'pi-car', 'pi-shopping-bag', 'pi-plane', 'pi-palette', 'pi-camera'];
const presetColors = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];

const plans = ref<Plan[]>([
  { id: 101, name: '日本五天四夜遊', budget: 50000, color: '#6366f1', icon: 'pi-plane' },
  { id: 102, name: '新家裝修計畫', budget: 200000, color: '#10b981', icon: 'pi-home' }
]);

const transactions = ref<Transaction[]>([
  { id: 1, planId: 101, category: '交通', amount: -15000, note: '機票', date: '2026-03-20', account: '信用卡' },
  { id: 2, planId: 101, category: '飲食', amount: -2500, note: '拉麵', date: '2026-03-25', account: '現金' },
  { id: 3, planId: 102, category: '購物', amount: -32000, note: '沙發訂金', date: '2026-03-26', account: '轉帳' }
]);

// --- 2. 狀態控管 ---
const isAddVisible = ref(false);
const isDetailVisible = ref(false);
const isEditTxVisible = ref(false);
const isDeleteVisible = ref(false);

const selectedPlan = ref<Plan | null>(null);
const editingTx = ref<Transaction | null>(null);
const tempAmount = ref<number>(0);
const newPlan = ref({ name: '', budget: null as number | null, color: '#6366f1', icon: 'pi-flag-fill' });

// --- 3. 計算邏輯 ---
const planTransactions = computed(() => {
  if (!selectedPlan.value) return [];
  return transactions.value.filter(t => t.planId === selectedPlan.value?.id);
});

const getPlanSpent = (planId: number) => {
  return transactions.value.filter(t => t.planId === planId).reduce((sum, t) => sum + Math.abs(t.amount), 0);
};

const getProgress = (plan: Plan) => {
  const spent = getPlanSpent(plan.id);
  return Math.round((spent / plan.budget) * 100);
};

const isOverBudget = (plan: Plan) => getProgress(plan) > 100;

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(val);
};

// --- 4. 動作函式 ---

// 開啟新增計畫
const openAddDialog = () => {
  submitted.value = false;
  newPlan.value = { name: '', budget: null, color: '#6366f1', icon: 'pi-flag-fill' };
  isAddVisible.value = true;
};

// 執行新增計畫
const addPlan = () => {
  submitted.value = true;
  if (!newPlan.value.name.trim() || newPlan.value.budget === null || newPlan.value.budget <= 0) {
    toast.add({ severity: 'warn', summary: '請填寫完整', detail: '名稱與預算為必填項目', life: 3000 });
    return;
  }
  plans.value.push({
    id: Date.now(),
    name: newPlan.value.name,
    budget: newPlan.value.budget ?? 0,
    color: newPlan.value.color,
    icon: newPlan.value.icon
  });
  isAddVisible.value = false;
  toast.add({ severity: 'success', summary: '成功', detail: '計畫已啟動', life: 2000 });
};

// 開啟明細編輯
const startEditTx = (tx: Transaction) => {
  editingTx.value = { ...tx };
  tempAmount.value = Math.abs(tx.amount);
  isEditTxVisible.value = true;
};

// 儲存明細修改 (修正金額同步問題)
const saveTxEdit = () => {
  if (!editingTx.value || tempAmount.value === null) return;
  const idx = transactions.value.findIndex(t => t.id === editingTx.value?.id);
  if (idx !== -1) {
    const originalSign = transactions.value[idx].amount >= 0 ? 1 : -1;
    transactions.value[idx] = {
      ...transactions.value[idx],
      amount: originalSign * Math.abs(tempAmount.value),
      note: editingTx.value.note
    };
    transactions.value = [...transactions.value]; // 強制觸發響應
    isEditTxVisible.value = false;
    toast.add({ severity: 'success', summary: '已更新', life: 2000 });
  }
};

// 刪除計畫
const deletePlan = () => {
  if (!selectedPlan.value) return;
  plans.value = plans.value.filter(p => p.id !== selectedPlan.value?.id);
  isDeleteVisible.value = false;
  isDetailVisible.value = false;
  toast.add({ severity: 'error', summary: '計畫已刪除', life: 2000 });
};
</script>

<template>
  <div class="view-wrapper fade-in">
    <Toast />

    <header class="view-header">
      <div>
        <h1 class="view-title">支出計畫</h1>
        <p class="section-label mt-1 px-1">Expense Projects Control</p>
      </div>
      <Button icon="pi pi-plus" label="新增計畫" class="border-round-2xl font-black shadow-2" @click="openAddDialog" />
    </header>

    <main class="view-content plans-grid">
      <Card v-for="plan in plans" :key="plan.id" class="theme-card plan-card mb-4" 
            :class="{ 'over-budget-card': isOverBudget(plan) }" @click="selectedPlan = plan; isDetailVisible = true;">
        <template #content>
          <div class="flex justify-content-between align-items-start mb-4">
            <div class="flex align-items-center gap-4">
              <div class="plan-icon-box shadow-sm" :style="{ backgroundColor: plan.color + '20', color: plan.color }">
                <i :class="['pi', plan.icon]"></i>
              </div>
              <div>
                <h3 class="m-0 font-black text-xl">{{ plan.name }}</h3>
                <span v-if="isOverBudget(plan)" class="warning-tag">超預算警告</span>
                <span v-else class="text-xs font-black opacity-30 uppercase tracking-widest">點擊查看明細</span>
              </div>
            </div>
            <Button icon="pi pi-trash" variant="text" severity="danger" rounded @click.stop="selectedPlan = plan; isDeleteVisible = true;" />
          </div>

          <div class="plan-stats-panel p-4 border-round-3xl">
            <div class="flex justify-content-between align-items-end mb-2">
              <span class="text-xs font-black opacity-40 uppercase">Spent / Budget</span>
              <span class="font-black" :class="isOverBudget(plan) ? 'text-red-500' : 'text-primary'">
                {{ formatCurrency(getPlanSpent(plan.id)) }} / {{ formatCurrency(plan.budget) }}
              </span>
            </div>
            <ProgressBar :value="Math.min(100, getProgress(plan))" :showValue="false" 
                         class="custom-bar" :class="{ 'bar-danger': isOverBudget(plan) }" />
          </div>
        </template>
      </Card>
    </main>

    <Dialog v-model:visible="isDetailVisible" modal header="計畫明細紀錄" :style="{ width: '92vw', maxWidth: '500px' }" class="modern-dialog">
      <div v-if="selectedPlan" class="p-2">
        <div class="flex align-items-center gap-4 mb-5 p-3 border-round-2xl" :style="{ backgroundColor: selectedPlan.color + '10' }">
          <div class="plan-icon-box shadow-sm" :style="{ backgroundColor: selectedPlan.color, color: 'white' }">
            <i :class="['pi', selectedPlan.icon]"></i>
          </div>
          <div>
            <h2 class="m-0 font-black">{{ selectedPlan.name }}</h2>
            <p class="m-0 text-sm font-bold opacity-50">剩餘預算：{{ formatCurrency(selectedPlan.budget - getPlanSpent(selectedPlan.id)) }}</p>
          </div>
        </div>

        <div class="detail-tx-list custom-scrollbar">
          <div v-if="planTransactions.length === 0" class="text-center py-5 opacity-30 italic font-bold">目前尚無支出紀錄</div>
          <div v-for="tx in planTransactions" :key="tx.id" class="tx-item-row flex justify-content-between align-items-center p-3 mb-2 border-round-xl cursor-pointer"
               @click.stop="startEditTx(tx)">
            <div class="flex align-items-center gap-3">
              <div class="tx-cat-badge">{{ tx.category[0] }}</div>
              <div>
                <div class="font-black">{{ tx.note || tx.category }}</div>
                <div class="text-xs opacity-40 font-bold">{{ tx.date }}</div>
              </div>
            </div>
            <div class="font-black text-rose-500">{{ formatCurrency(tx.amount) }} <i class="pi pi-pencil ml-1 opacity-20 text-xs"></i></div>
          </div>
        </div>
      </div>
    </Dialog>

    <Dialog v-model:visible="isEditTxVisible" modal :showHeader="false" :dismissableMask="true" :style="{ width: '85vw', maxWidth: '380px' }" class="modern-dialog">
      <div v-if="editingTx" class="p-5">
        <p class="section-label text-center mb-4">編輯支出金額</p>
        <div class="amount-hero text-center mb-6">
          <span class="text-2xl font-black opacity-30 mr-2">$</span>
          <InputNumber v-model="tempAmount" mode="decimal" class="huge-input" inputClass="huge-input-el-dark" autofocus />
        </div>
        <div class="form-group mb-5">
          <label class="section-label mb-2 block">備註修改</label>
          <InputText v-model="editingTx.note" class="w-full modern-input" />
        </div>
        <div class="flex gap-2">
          <Button label="取消" severity="secondary" text class="flex-1 font-bold" @click="isEditTxVisible = false" />
          <Button label="更新儲存" @click="saveTxEdit" class="flex-2 p-3 font-black border-none shadow-lg border-round-xl bg-primary text-white" />
        </div>
      </div>
    </Dialog>

    <Dialog v-model:visible="isAddVisible" modal :showHeader="false" :dismissableMask="true" 
            :style="{ width: '92vw', maxWidth: '420px' }" class="modern-dialog">
      <div class="dialog-content">
        <div class="dialog-hero-section" :style="{ background: `linear-gradient(135deg, ${newPlan.color} 0%, #1e293b 100%)` }">
          <div class="hero-preview-icon shadow-lg">
            <i :class="['pi', newPlan.icon]" :style="{ color: newPlan.color }"></i>
          </div>
          <div class="mt-4 text-center">
            <p class="m-0 text-xs font-black opacity-50 uppercase tracking-widest">Setup Plan Budget</p>
            <div class="flex align-items-center justify-content-center gap-2 mt-2">
              <span class="text-2xl font-black opacity-40">$</span>
              <InputNumber v-model="newPlan.budget" mode="decimal" class="huge-input" 
                           :class="{ 'p-invalid': submitted && (newPlan.budget === null || newPlan.budget <= 0) }"
                           inputClass="huge-input-el" placeholder="0" autofocus />
            </div>
          </div>
        </div>

        <div class="p-5">
          <div class="form-group mb-5">
            <label class="section-label mb-2 block px-1">Plan Name</label>
            <InputText v-model="newPlan.name" placeholder="例如：新電腦基金" class="w-full modern-input" 
                       :class="{ 'p-invalid': submitted && !newPlan.name.trim() }" />
          </div>

          <div class="form-group mb-5">
            <label class="section-label mb-3 block px-1">Theme Color</label>
            <div class="flex justify-content-between px-1">
              <div v-for="color in presetColors" :key="color" class="color-dot" :class="{ 'active': newPlan.color === color }"
                   :style="{ backgroundColor: color }" @click="newPlan.color = color"></div>
            </div>
          </div>

          <div class="form-group mb-6">
            <label class="section-label mb-3 block px-1">Identity Icon</label>
            <div class="icon-grid">
              <div v-for="icon in presetIcons" :key="icon" class="icon-option" :class="{ 'active': newPlan.icon === icon }" @click="newPlan.icon = icon">
                <i :class="['pi', icon]"></i>
              </div>
            </div>
          </div>

          <div class="flex flex-column gap-3">
            <Button label="啟動支出計畫" @click="addPlan" class="save-btn p-3 font-black border-none shadow-lg" :style="{ backgroundColor: newPlan.color }" />
            <Button label="取消" variant="text" severity="secondary" class="font-bold opacity-50" @click="isAddVisible = false" />
          </div>
        </div>
      </div>
    </Dialog>

    <Dialog v-model:visible="isDeleteVisible" modal :showHeader="false" :style="{ width: '85vw', maxWidth: '350px' }">
      <div class="p-5 text-center">
        <div class="delete-icon-box mb-4"><i class="pi pi-trash"></i></div>
        <h3 class="font-black text-xl mb-2">確定刪除計畫？</h3>
        <p class="opacity-50 text-sm mb-6">這將解除該計畫與支出的關聯。</p>
        <div class="flex gap-2">
          <Button label="取消" severity="secondary" text class="flex-1 font-bold" @click="isDeleteVisible = false" />
          <Button label="刪除" severity="danger" class="flex-1 p-3 font-black border-round-xl" @click="deletePlan" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.plans-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; }
.plan-card { border-radius: 28px !important; cursor: pointer; border: 1.5px solid transparent !important; transition: 0.3s; }
.plan-card:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important; }
.over-budget-card { border-color: #f43f5e !important; background: rgba(244, 63, 94, 0.02) !important; }

.warning-tag { background: #f43f5e; color: white; padding: 2px 8px; border-radius: 6px; font-size: 0.65rem; font-weight: 950; }
.bar-danger :deep(.p-progressbar-value) { background: #f43f5e !important; animation: pulse 2s infinite; }
@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }

.detail-tx-list { max-height: 380px; overflow-y: auto; padding-right: 4px; }
.tx-item-row { background: rgba(0,0,0,0.04); transition: 0.2s; margin-bottom: 0.5rem; }
.tx-item-row:hover { background: rgba(0,0,0,0.08); }
.tx-cat-badge { width: 34px; height: 34px; background: rgba(var(--app-primary-rgb), 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: var(--app-primary); }

.dialog-hero-section { padding: 3.5rem 2rem; display: flex; flex-direction: column; align-items: center; transition: 0.5s ease; }
.hero-preview-icon { width: 80px; height: 80px; background: white; border-radius: 26px; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; }

:deep(.huge-input-el) { background: transparent !important; border: none !important; color: white !important; font-size: 3.2rem !important; font-weight: 950 !important; text-align: center !important; }
:deep(.huge-input-el-dark) { background: transparent !important; border: none !important; color: var(--app-text) !important; font-size: 3.2rem !important; font-weight: 950 !important; text-align: center !important; width: 100% !important; }

.modern-input { background: rgba(var(--app-primary-rgb), 0.05) !important; border-radius: 16px !important; font-weight: 800 !important; padding: 12px 16px !important; }
:deep(.p-invalid) { border-color: #f43f5e !important; }

.color-dot { width: 28px; height: 28px; border-radius: 50%; cursor: pointer; border: 3px solid transparent; }
.color-dot.active { border-color: white; transform: scale(1.1); }
.icon-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.icon-option { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-radius: 16px; background: rgba(0,0,0,0.04); cursor: pointer; color: #94a3b8; }
.icon-option.active { background: var(--app-text); color: var(--app-bg); transform: scale(1.1); }

.plan-icon-box { width: 56px; height: 56px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
.plan-stats-panel { background: rgba(var(--app-primary-rgb), 0.05); }
.custom-bar { height: 10px; border-radius: 10px; border: none; }
:deep(.p-progressbar-value) { background: var(--app-primary); border-radius: 10px; }

.delete-icon-box { width: 60px; height: 60px; background: #fff1f2; color: #f43f5e; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto; }
.save-btn { border-radius: 18px; color: white; }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
</style>