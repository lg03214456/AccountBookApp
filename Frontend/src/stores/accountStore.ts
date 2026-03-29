import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Account, AccountCategory } from '../types';

export const useAccountStore = defineStore('accounts', () => {
  // 1. 帳戶分類 (支援動態管理)
  const categories = ref<AccountCategory[]>([
    { label: '現金資產', value: 'cash', icon: 'pi-wallet', color: '#f59e0b' },
    { label: '銀行存款', value: 'bank', icon: 'pi-building', color: '#10b981' },
    { label: '信用卡/負債', value: 'card', icon: 'pi-credit-card', color: '#6366f1' }
  ]);

  // 2. 帳戶列表
  const accounts = ref<Account[]>([
    { id: 1, name: '現金錢包', balance: 0, type: 'cash' },
    { id: 2, name: '台新銀行', balance: 0, type: 'bank' },
    { id: 3, name: '中信信用卡', balance: 0, type: 'card' }
  ]);

  // 3. 計算屬性 (資產、負債、淨資產)
  const totalAssets = computed(() => accounts.value.filter(a => a.balance > 0).reduce((s, a) => s + a.balance, 0));
  const totalLiabilities = computed(() => accounts.value.filter(a => a.balance < 0).reduce((s, a) => s + Math.abs(a.balance), 0));
  const netWorth = computed(() => totalAssets.value - totalLiabilities.value);

  // 4. 操作動作
  const addAccount = (acc: Omit<Account, 'id'>) => {
    accounts.value.push({ ...acc, id: Date.now() });
  };

  const updateAccount = (id: number, data: Partial<Account>) => {
    const idx = accounts.value.findIndex(a => a.id === id);
    if (idx !== -1) accounts.value[idx] = { ...accounts.value[idx], ...data };
  };

  const deleteAccount = (id: number) => {
    accounts.value = accounts.value.filter(a => a.id !== id);
  };

  const addCategory = (cat: AccountCategory) => {
    if (!categories.value.some(c => c.value === cat.value)) categories.value.push(cat);
  };

  // ⭐ 新增：專門用來增減餘額的方法
  const updateBalance = (accountId: number, amount: number) => {
    const acc = accounts.value.find(a => a.id === accountId);
    if (acc) {
      // 使用 LaTeX 公式理解：$$NewBalance = CurrentBalance + Amount$$
      acc.balance += amount;
    }
  };
  return { 
    categories, accounts, 
    totalAssets, totalLiabilities, netWorth, 
    addAccount, updateAccount, deleteAccount, addCategory,
    updateBalance 
  };
});