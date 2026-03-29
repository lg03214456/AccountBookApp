<script setup lang="ts">
import { ref, computed } from "vue";
import { useToast } from "primevue/usetoast";
import { usePlanStore } from "../stores/planStore";
import { useTransactionStore } from "../stores/transactionStore";

import Card from "primevue/card";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import ProgressBar from "primevue/progressbar";
import Toast from "primevue/toast";
import Tag from "primevue/tag";

// --- 1. 實例化服務 ---
const toast = useToast();
const planStore = usePlanStore();
const transactionStore = useTransactionStore();

const submitted = ref(false);

// --- 2. 靜態 UI 配置 ---
const presetIcons = [
  "pi-flag-fill",
  "pi-briefcase",
  "pi-home",
  "pi-car",
  "pi-shopping-bag",
  "pi-plane",
  "pi-palette",
  "pi-camera",
];
const presetColors = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#64748b",
];

// --- 3. 狀態控盤 ---
const isPlanDialogVisible = ref(false); // 通用計畫彈窗
const isEditMode = ref(false); // 是否為編輯模式
const isDetailVisible = ref(false);
const isEditTxVisible = ref(false);
const isDeleteVisible = ref(false);

const selectedPlan = ref<any>(null);
const editingTx = ref<any>(null);
const tempAmount = ref<number>(0);

// 彈窗內使用的暫存資料
const tempPlan = ref({
  id: null as number | null,
  name: "",
  budget: null as number | null,
  color: "#6366f1",
  icon: "pi-flag-fill",
  type: "Expense" as "Expense" | "Saving",
});

// --- 4. 計算屬性 ---
const planTransactions = computed(() => {
  if (!selectedPlan.value) return [];
  return transactionStore.transactions.filter(
    (t) => t.planId === selectedPlan.value?.id,
  );
});

const getPlanSpent = (id: number) => transactionStore.getSpentByPlan(id);
const getProgress = (id: number) => transactionStore.getProgressByPlan(id);
const isOverBudget = (id: number) => getProgress(id) > 100;

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(val);
};

// --- 5. 動作函式 ---

// 開啟「新增」彈窗
const openAddDialog = () => {
  isEditMode.value = false;
  submitted.value = false;
  tempPlan.value = {
    id: null,
    name: "",
    budget: null,
    color: "#6366f1",
    icon: "pi-flag-fill",
    type: "Expense",
  };
  isPlanDialogVisible.value = true;
};

// 開啟「編輯預算」彈窗
const openEditPlanDialog = (plan: any) => {
  isEditMode.value = true;
  submitted.value = false;
  tempPlan.value = { ...plan }; // 帶入舊資料
  isPlanDialogVisible.value = true;
};

const handleSavePlan = () => {
  submitted.value = true;
  if (
    !tempPlan.value.name.trim() ||
    tempPlan.value.budget === null ||
    tempPlan.value.budget <= 0
  ) {
    toast.add({
      severity: "warn",
      summary: "請填寫完整",
      detail: "名稱與預算為必填項目",
      life: 3000,
    });
    return;
  }

  if (isEditMode.value && tempPlan.value.id) {
    // 🟢 動作：更新計畫
    planStore.updatePlan(tempPlan.value.id, {
      name: tempPlan.value.name,
      budget: tempPlan.value.budget as number,
      color: tempPlan.value.color,
      icon: tempPlan.value.icon,
      type: tempPlan.value.type,
    });
    toast.add({
      severity: "success",
      summary: "已更新",
      detail: "計畫內容已修改",
      life: 2000,
    });
  } else {
    // 🟢 動作：新增計畫
    planStore.addPlan({
      name: tempPlan.value.name,
      budget: tempPlan.value.budget as number,
      color: tempPlan.value.color,
      icon: tempPlan.value.icon,
      type: tempPlan.value.type,
    });
    toast.add({
      severity: "success",
      summary: "成功",
      detail: "新計畫已啟動",
      life: 2000,
    });
  }

  isPlanDialogVisible.value = false;
};

const startEditTx = (tx: any) => {
  editingTx.value = { ...tx };
  tempAmount.value = Math.abs(tx.amount);
  isEditTxVisible.value = true;
};

const saveTxEdit = () => {
  if (!editingTx.value) return;
  transactionStore.updateTransaction(editingTx.value.id, {
    amount:
      editingTx.value.amount < 0
        ? -Math.abs(tempAmount.value)
        : Math.abs(tempAmount.value),
    note: editingTx.value.note,
  });
  isEditTxVisible.value = false;
  toast.add({ severity: "success", summary: "已更新交易", life: 2000 });
};

const handleDeletePlan = () => {
  if (selectedPlan.value) {
    planStore.deletePlan(selectedPlan.value.id);
    isDeleteVisible.value = false;
    isDetailVisible.value = false;
    toast.add({ severity: "error", summary: "計畫已刪除", life: 2000 });
  }
};
</script>

<template>
  <div class="view-wrapper fade-in">
    <Toast />

    <header
      class="view-header flex justify-content-between align-items-center mb-6"
    >
      <div>
        <h1 class="view-title">計畫管理</h1>
        <p class="section-label mt-1 opacity-40 font-bold">
          Manage Budgets & Savings
        </p>
      </div>
      <Button
        icon="pi pi-plus"
        label="新增計畫"
        class="atelier-btn shadow-2"
        @click="openAddDialog"
      />
    </header>

    <main class="view-content plans-grid">
      <Card
        v-for="plan in planStore.plans"
        :key="plan.id"
        class="theme-card plan-card mb-4"
        @click="
          selectedPlan = plan;
          isDetailVisible = true;
        "
      >
        <template #content>
          <div class="flex justify-content-between align-items-start mb-4">
            <div class="flex align-items-center gap-4 flex-1">
              <div
                class="plan-icon-box shadow-sm"
                :style="{
                  backgroundColor: plan.color + '20',
                  color: plan.color,
                }"
              >
                <i :class="['pi', plan.icon]"></i>
              </div>
              <div class="flex-1">
                <div class="flex align-items-center justify-content-between">
                  <div class="flex align-items-center gap-2">
                    <h3 class="m-0 font-black text-xl leading-none">
                      {{ plan.name }}
                    </h3>
                    <Tag
                      :value="plan.type === 'Expense' ? '支出' : '儲蓄'"
                      :severity="plan.type === 'Expense' ? 'danger' : 'success'"
                    />
                  </div>
                  <i
                    class="pi pi-pencil edit-plan-icon"
                    @click.stop="openEditPlanDialog(plan)"
                  ></i>
                </div>
                <div class="mt-1">
                  <span
                    v-if="plan.type === 'Expense' && isOverBudget(plan.id)"
                    class="warning-tag"
                    >超預算</span
                  >
                  <span
                    v-else
                    class="text-xs font-black opacity-20 uppercase tracking-tighter"
                    >View Details</span
                  >
                </div>
              </div>
            </div>
            <Button
              icon="pi pi-trash"
              variant="text"
              severity="secondary"
              rounded
              @click.stop="
                selectedPlan = plan;
                isDeleteVisible = true;
              "
              class="opacity-20 ml-2"
            />
          </div>

          <div class="plan-stats-panel p-4 border-round-3xl">
            <div class="flex justify-content-between align-items-end mb-2">
              <span class="text-xs font-black opacity-40 uppercase">{{
                plan.type === "Expense" ? "Spent" : "Saved"
              }}</span>
              <span class="font-black" :style="{ color: plan.color }">
                {{ formatCurrency(getPlanSpent(plan.id)) }} /
                {{ formatCurrency(plan.budget) }}
              </span>
            </div>
            <ProgressBar
              :value="Math.min(100, getProgress(plan.id))"
              :showValue="false"
              class="custom-bar"
              :style="{ '--bar-color': plan.color }"
            />
          </div>
        </template>
      </Card>
    </main>

    <Dialog
      v-model:visible="isPlanDialogVisible"
      modal
      :showHeader="false"
      :dismissableMask="true"
      :style="{ width: '92vw', maxWidth: '420px' }"
      class="modern-dialog"
    >
      <div class="dialog-content">
        <div
          class="dialog-hero"
          :style="{
            background: `linear-gradient(135deg, ${tempPlan.color} 0%, #1e293b 100%)`,
          }"
        >
          <div class="hero-icon-preview shadow-lg">
            <i
              :class="['pi', tempPlan.icon]"
              :style="{ color: tempPlan.color }"
            ></i>
          </div>
          <div class="mt-4 text-center">
            <p
              class="m-0 text-xs font-black opacity-50 uppercase tracking-widest text-white"
            >
              Target Amount
            </p>
            <InputNumber
              v-model="tempPlan.budget"
              mode="decimal"
              class="huge-input"
              inputClass="huge-input-el"
              placeholder="0"
              autofocus
            />
          </div>
        </div>
        <div class="p-5">
          <div class="form-group mb-5">
            <label class="section-label mb-2 block px-1">計畫名稱</label>
            <InputText
              v-model="tempPlan.name"
              placeholder="例如：日本旅遊"
              class="atelier-input w-full"
              :class="{ 'p-invalid': submitted && !tempPlan.name }"
            />
          </div>
          <div class="form-group mb-5">
            <label class="section-label mb-2 block px-1">計畫性質</label>
            <div class="flex gap-2">
              <button
                type="button"
                class="type-pill flex-1"
                :class="{ 'active-exp': tempPlan.type === 'Expense' }"
                @click="tempPlan.type = 'Expense'"
              >
                支出型
              </button>
              <button
                type="button"
                class="type-pill flex-1"
                :class="{ 'active-sav': tempPlan.type === 'Saving' }"
                @click="tempPlan.type = 'Saving'"
              >
                儲蓄型
              </button>
            </div>
          </div>
          <div class="form-group mb-5">
            <label class="section-label mb-3 block px-1">風格自定義</label>
            <div class="flex justify-content-between mb-4">
              <div
                v-for="color in presetColors"
                :key="color"
                class="color-dot"
                :class="{ active: tempPlan.color === color }"
                :style="{ backgroundColor: color }"
                @click="tempPlan.color = color"
              ></div>
            </div>
            <div class="icon-grid">
              <div
                v-for="icon in presetIcons"
                :key="icon"
                class="icon-option"
                :class="{ active: tempPlan.icon === icon }"
                @click="tempPlan.icon = icon"
              >
                <i :class="['pi', icon]"></i>
              </div>
            </div>
          </div>
          <Button
            :label="isEditMode ? '更新計畫預算' : '啟動新計畫'"
            class="w-full p-3 font-black atelier-save-btn"
            :style="{ backgroundColor: tempPlan.color }"
            @click="handleSavePlan"
          />
        </div>
      </div>
    </Dialog>

    <Dialog
      v-model:visible="isDetailVisible"
      modal
      header="計畫細節"
      :dismissableMask="true"
      :style="{ width: '95vw', maxWidth: '500px' }"
      class="modern-dialog"
    >
      <div v-if="selectedPlan" class="p-2">
        <div
          class="flex align-items-center gap-4 mb-5 p-4 border-round-3xl bg-black-alpha-5"
        >
          <div
            class="plan-icon-box shadow-sm"
            :style="{ backgroundColor: selectedPlan.color, color: 'white' }"
          >
            <i :class="['pi', selectedPlan.icon]"></i>
          </div>
          <div>
            <h2 class="m-0 font-black">{{ selectedPlan.name }}</h2>
            <p class="m-0 text-sm font-bold opacity-40">
              剩餘預算：{{
                formatCurrency(
                  selectedPlan.budget - getPlanSpent(selectedPlan.id),
                )
              }}
            </p>
          </div>
        </div>
        <div class="detail-tx-list custom-scrollbar">
          <div
            v-if="planTransactions.length === 0"
            class="text-center py-5 opacity-20 italic"
          >
            目前尚無關聯紀錄
          </div>
          <div
            v-for="tx in planTransactions"
            :key="tx.id"
            class="tx-row flex justify-content-between p-3 mb-2 border-round-xl bg-black-alpha-5"
            @click="startEditTx(tx)"
          >
            <div class="flex flex-column">
              <span class="font-black">{{ tx.note || tx.category }}</span>
              <span class="text-xs opacity-40">{{ tx.date }}</span>
            </div>
            <div class="flex align-items-center gap-2">
              <span
                class="font-black"
                :class="tx.amount < 0 ? 'text-rose-500' : 'text-emerald-500'"
                >{{ formatCurrency(tx.amount) }}</span
              >
              <i class="pi pi-pencil opacity-20 text-xs"></i>
            </div>
          </div>
        </div>
      </div>
    </Dialog>

    <Dialog
      v-model:visible="isDeleteVisible"
      modal
      :showHeader="false"
      :dismissableMask="true"
      :style="{ width: '85vw', maxWidth: '350px' }"
    >
      <div class="p-5 text-center">
        <div class="delete-icon-box mb-4"><i class="pi pi-trash"></i></div>
        <h3 class="font-black text-xl mb-4">確定刪除此計畫？</h3>
        <div class="flex gap-2">
          <Button
            label="刪除"
            severity="danger"
            class="flex-1 font-black p-3"
            @click="handleDeletePlan"
          />
          <Button
            label="取消"
            severity="secondary"
            text
            class="flex-1 font-bold"
            @click="isDeleteVisible = false"
          />
        </div>
      </div>
    </Dialog>

    <Dialog
      v-model:visible="isEditTxVisible"
      modal
      :showHeader="false"
      :dismissableMask="true"
      :style="{ width: '85vw', maxWidth: '380px' }"
    >
      <div v-if="editingTx" class="p-5">
        <p class="section-label text-center mb-4">修改金額</p>
        <InputNumber
          v-model="tempAmount"
          mode="decimal"
          inputClass="huge-input-el-dark"
          class="w-full mb-6"
          autofocus
        />
        <InputText
          v-model="editingTx.note"
          placeholder="備註"
          class="w-full atelier-input mb-5"
        />
        <div class="flex gap-2">
          <Button
            label="取消"
            text
            class="flex-1"
            @click="isEditTxVisible = false"
          />
          <Button
            label="儲存修改"
            @click="saveTxEdit"
            class="flex-2 p-3 bg-primary text-white border-none font-black"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.view-wrapper {
  background: var(--app-bg);
  min-height: 100vh;
  padding: 1.5rem;
}
.view-title {
  font-size: 2.2rem;
  font-weight: 950;
  letter-spacing: -1.5px;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
}
.plan-card {
  border-radius: 32px !important;
  border: none !important;
  transition: 0.3s;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.02) !important;
}
.plan-card:hover {
  transform: translateY(-5px);
  background: white !important;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.05) !important;
}

/* 🟢 編輯計畫圖示 */
.edit-plan-icon {
  opacity: 0.1;
  font-size: 0.85rem;
  padding: 8px;
  cursor: pointer;
  transition: 0.2s;
}
.edit-plan-icon:hover {
  opacity: 1;
  color: var(--app-primary);
  transform: scale(1.2);
}

.plan-icon-box {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}
.plan-stats-panel {
  background: rgba(0, 0, 0, 0.03);
}
.custom-bar {
  height: 10px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.05);
  border: none;
}
:deep(.p-progressbar-value) {
  background: var(--bar-color, var(--app-primary));
  border-radius: 10px;
  transition: 0.5s;
}

.warning-tag {
  background: #f43f5e;
  color: white;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 950;
}

.type-pill {
  padding: 12px;
  border-radius: 16px;
  border: 1.5px solid rgba(0, 0, 0, 0.05);
  background: transparent;
  color: #94a3b8;
  font-weight: 800;
  cursor: pointer;
  transition: 0.3s;
}
.active-exp {
  background: #fff1f2;
  border-color: #f43f5e;
  color: #f43f5e;
}
.active-sav {
  background: #f0fdf4;
  border-color: #10b981;
  color: #10b981;
}

.dialog-hero {
  padding: 4rem 2rem;
  border-radius: 0 0 40px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.hero-icon-preview {
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
}

:deep(.huge-input-el) {
  border: none !important;
  font-size: 3.2rem !important;
  font-weight: 950 !important;
  text-align: center !important;
  width: 100% !important;
  background: transparent !important;
  color: white !important;
}
:deep(.huge-input-el-dark) {
  border: none !important;
  font-size: 3.2rem !important;
  font-weight: 950 !important;
  text-align: center !important;
  width: 100% !important;
  background: transparent !important;
  color: var(--app-text) !important;
}

.atelier-input {
  background: rgba(0, 0, 0, 0.05) !important;
  border-radius: 16px !important;
  border: none !important;
  padding: 1rem !important;
  font-weight: 800;
}
.atelier-btn {
  background: #004d61;
  color: white;
  border: none;
  border-radius: 18px;
  padding: 0.8rem 1.5rem;
  font-weight: 900;
}
.atelier-save-btn {
  border-radius: 20px !important;
  border: none;
}

.color-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid transparent;
  transition: 0.2s;
}
.color-dot.active {
  border-color: white;
  transform: scale(1.2);
}
.icon-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.icon-option {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.04);
  cursor: pointer;
  color: #94a3b8;
}
.icon-option.active {
  background: var(--app-text);
  color: var(--app-bg);
}

.delete-icon-box {
  width: 60px;
  height: 60px;
  background: #fff1f2;
  color: #f43f5e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin: 0 auto;
}
.tx-row {
  cursor: pointer;
  transition: 0.2s;
}
.tx-row:hover {
  background: rgba(0, 0, 0, 0.08);
}
</style>
