import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Plan } from '../types';

export const usePlanStore = defineStore('plans', () => {
  // --- 1. 狀態定義 (State) ---
  const plans = ref<Plan[]>([
    { 
      id: 101, 
      name: '日本旅遊', 
      budget: 50000, 
      color: '#6366f1', 
      icon: 'pi-plane', 
      createdAt: Date.now(), 
      type: 'Expense' 
    },
    { 
      id: 102, 
      name: '新家裝修', 
      budget: 200000, 
      color: '#10b981', 
      icon: 'pi-home', 
      createdAt: Date.now(), 
      type: 'Expense' 
    },
    { 
      id: 103, 
      name: '緊急備用金', 
      budget: 100000, 
      color: '#f59e0b', 
      icon: 'pi-shield', 
      createdAt: Date.now(), 
      type: 'Saving' // ⭐ 測試用：儲蓄型計畫
    }
  ]);

  // --- 2. 動作函式 (Actions) ---

  // 新增計畫
  const addPlan = (newPlan: Omit<Plan, 'id' | 'createdAt'>) => {
    const plan: Plan = {
      ...newPlan,
      id: Date.now(),
      createdAt: Date.now()
    };
    plans.value.push(plan);
  };

  // 更新計畫
  const updatePlan = (id: number, updatedData: Partial<Plan>) => {
    const idx = plans.value.findIndex(p => p.id === id);
    if (idx !== -1) {
      plans.value[idx] = { ...plans.value[idx], ...updatedData };
      // 確保響應式更新
      plans.value = [...plans.value];
    }
  };

  // 刪除計畫
  const deletePlan = (id: number) => {
    plans.value = plans.value.filter(p => p.id !== id);
  };

  // 取得單一計畫
  const getPlanById = (id: number) => {
    return plans.value.find(p => p.id === id);
  };

  // ✅ 2. 核心重點：一定要在這裡 Return 出去
  // --- 3. 暴露屬性 ---
  return { 
    plans, 
    addPlan, 
    updatePlan, 
    deletePlan,
    getPlanById
  };
});