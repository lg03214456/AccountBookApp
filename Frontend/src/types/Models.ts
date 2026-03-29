// 業務資料的核心定義
export interface Plan {
  id: number;
  name: string;
  budget: number;
  color: string;
  icon: string;
  createdAt: number;
  type: 'Expense' | 'Saving'; // ⭐ 區分：支出計畫 或 儲蓄計畫
}

export interface Transaction {
  id: number;
  planId: number | null;
  accountId: number;   // ⭐ 關鍵：把原本的 account 改成 accountId
  category: string;
  amount: number;
  note: string;
  date: string;
  timestamp: number;
}

export interface AccountCategory {
  value: string;   // 唯一識別碼，如 'cash', 'bank'
  label: string;   // 顯示名稱，如 '現金資產'
  icon: string;    // PrimeIcons 代碼
  color: string;   // 代表顏色
}

export interface Account {
  id: number;
  name: string;
  balance: number; // 帳戶餘額
  type: string;    // 對應 AccountCategory.value
}