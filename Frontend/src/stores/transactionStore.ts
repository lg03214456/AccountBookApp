import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Transaction } from '../types';
import { usePlanStore } from './planStore';
import { useAccountStore } from './accountStore'; // ⭐ 引入帳戶 Store

export const useTransactionStore = defineStore('transactions', () => {
  const transactions = ref<Transaction[]>([]);
  const planStore = usePlanStore();
  const accountStore = useAccountStore(); // 實例化帳戶大腦

  // --- 1. 新增帳目 ---
  const addTransaction = (data: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTx: Transaction = {
      ...data,
      id: Date.now(),
      timestamp: Date.now()
    };
    transactions.value.push(newTx);

    // ⭐ 連動更新帳戶餘額
    accountStore.updateBalance(data.accountId, data.amount);
  };

  // --- 2. 修改帳目 ---
  const updateTransaction = (id: number, updatedData: Partial<Transaction>) => {
    const idx = transactions.value.findIndex(t => t.id === id);
    if (idx !== -1) {
      const oldTx = transactions.value[idx];

      // ⭐ 處理餘額連動邏輯
      if (updatedData.amount !== undefined) {
        // 計算差額 = 新金額 - 舊金額
        // 例如：原本支出 -100 (tx.amount)，改為支出 -150 (updatedData.amount)
        // 差額 = -150 - (-100) = -50 -> 帳戶會再扣 50，正確！
        const diff = updatedData.amount - oldTx.amount;
        accountStore.updateBalance(oldTx.accountId, diff);
      }

      // 更新資料
      transactions.value[idx] = { ...oldTx, ...updatedData };
      transactions.value = [...transactions.value]; 
    }
  };

  // --- 3. 刪除帳目 ---
  const deleteTransaction = (id: number) => {
    const idx = transactions.value.findIndex(t => t.id === id);
    if (idx !== -1) {
      const tx = transactions.value[idx];
      // ⭐ 連動更新：將金額「吐回」帳戶
      // 刪除支出(-100) -> 傳入 -(-100) = +100 到帳戶，正確！
      accountStore.updateBalance(tx.accountId, -tx.amount);
      
      transactions.value.splice(idx, 1);
    }
  };

  // --- 4. 計算屬性：計畫相關 ---

  // 取得該計畫已使用的金額 (取絕對值加總)
  const getSpentByPlan = computed(() => (planId: number) => {
    return transactions.value
      .filter(t => t.planId === planId)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  });

  // 取得該計畫的執行進度 (%)
  const getProgressByPlan = computed(() => (planId: number) => {
    const plan = planStore.plans.find(p => p.id === planId);
    if (!plan || plan.budget === 0) return 0;
    const spent = getSpentByPlan.value(planId);
    return Math.round((spent / plan.budget) * 100);
  });

  // --- 5. 核心 Return ---
  return { 
    transactions, 
    addTransaction, 
    updateTransaction,
    deleteTransaction, // 👈 確保刪除功能也暴露出去
    getSpentByPlan, 
    getProgressByPlan 
  };
});