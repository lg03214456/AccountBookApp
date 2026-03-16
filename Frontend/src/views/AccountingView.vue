<script setup lang="ts">
import { ref } from 'vue';
import { useLogto } from '@logto/vue';

// PrimeVue 元件
import Button from 'primevue/button';
import Card from 'primevue/card';
import MeterGroup from 'primevue/metergroup'; // 用於比例條
import SelectButton from 'primevue/selectbutton'; // 用於切換 Daily/Weekly/Monthly

const { isAuthenticated } = useLogto();

// --- 狀態控制 ---
const period = ref('Daily');
const periodOptions = ref(['Daily', 'Weekly', 'Monthly']);

// --- 比例條資料 (Spending Breakdown) ---
const chartData = ref([
    { label: 'Food', color: '#00668c', value: 45, icon: 'pi pi-shopping-cart' },
    { label: 'Trans', color: '#33b5ff', value: 25, icon: 'pi pi-car' },
    { label: 'Other', color: '#7a8c7a', value: 30, icon: 'pi pi-box' }
]);

// --- 歷史紀錄資料 ---
const history = ref([
    { id: 1, title: 'Whole Foods Market', category: 'Food', date: 'Oct 24, 2023', amount: -84.20, icon: 'pi-shopping-bag', iconBg: '#eef2ff' },
    { id: 2, title: 'Uber Trip', category: 'Transport', date: 'Oct 23, 2023', amount: -24.50, icon: 'pi-car', iconBg: '#f0f9ff' },
    { id: 3, title: 'Monthly Salary', category: 'Work', date: 'Oct 22, 2023', amount: 3200.00, icon: 'pi-briefcase', iconBg: '#f0fdf4' },
    { id: 4, title: 'Apple Store', category: 'Others', date: 'Oct 21, 2023', amount: -129.00, icon: 'pi-box', iconBg: '#f8fafc' }
]);
</script>

<template>
  <div class="page-wrapper">
    <div v-if="!isAuthenticated" class="login-container">
      <Card class="welcome-card">
        <template #content>
          <i class="pi pi-wallet text-6xl text-primary mb-4"></i>
          <h2 class="font-bold text-2xl mb-2">Bookkeeping</h2>
          <p class="text-gray-500">Please login to manage your balance.</p>
        </template>
      </Card>
    </div>

    <div v-else class="app-container">
      
      <section class="balance-section">
        <label>TOTAL BALANCE</label>
        <div class="balance-value">
          <span class="currency">$</span>12,480<span class="decimal">.50</span>
        </div>
      </section>

      <section class="summary-cards">
        <div class="stat-card income">
          <div class="icon-circle"><i class="pi pi-arrow-down"></i></div>
          <div class="content">
            <span class="label">Income</span>
            <span class="amount">$4,250</span>
          </div>
          <span class="percent text-green-500">+12%</span>
        </div>
        <div class="stat-card expenses">
          <div class="icon-circle"><i class="pi pi-arrow-up"></i></div>
          <div class="content">
            <span class="label">Expenses</span>
            <span class="amount">$1,840</span>
          </div>
          <span class="percent text-red-500">-5%</span>
        </div>
      </section>

      <section class="period-switcher">
        <SelectButton v-model="period" :options="periodOptions" aria-labelledby="basic" />
      </section>

      <Card class="breakdown-card">
        <template #content>
          <h3 class="font-bold mb-4">Spending Breakdown</h3>
          <MeterGroup :value="chartData" labelPosition="end" />
        </template>
      </Card>

      <section class="history-section">
        <div class="flex justify-between items-center mb-4 px-2">
          <h3 class="font-bold text-lg">Recent History</h3>
          <a href="#" class="text-green-600 font-bold text-sm">View All</a>
        </div>

        <div class="history-list">
          <div v-for="item in history" :key="item.id" class="history-item">
            <div class="item-left">
              <div class="item-icon" :style="{ backgroundColor: item.iconBg }">
                <i :class="'pi ' + item.icon"></i>
              </div>
              <div class="item-info">
                <span class="item-title">{{ item.title }}</span>
                <span class="item-subtitle">{{ item.category }} • {{ item.date }}</span>
              </div>
            </div>
            <div class="item-right">
              <span :class="['item-amount', item.amount > 0 ? 'text-green-600' : 'text-red-500']">
                {{ item.amount > 0 ? '+' : '' }}{{ item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div class="fab-container">
        <Button icon="pi pi-plus" rounded class="fab-btn" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 全域版面與背景 */
.page-wrapper {
  background-color: #f8faff;
  min-height: 100vh;
  padding-bottom: 100px; /* 為底部按鈕留空間 */
}

.app-container {
  max-width: 500px; /* 在 PC 上限制寬度，模擬手機感 */
  margin: 0 auto;
  padding: 20px;
}

/* 總餘額設計 */
.balance-section {
  text-align: left;
  padding: 20px 0;
}
.balance-section label {
  color: #64748b;
  letter-spacing: 1.5px;
  font-size: 0.8rem;
  font-weight: bold;
}
.balance-value {
  font-size: 3.5rem;
  font-weight: 800;
  color: #0f172a;
  display: flex;
  align-items: baseline;
}
.currency { font-size: 2rem; margin-right: 5px; }
.decimal { font-size: 2rem; color: #94a3b8; }

/* 收支卡片：Responsive Grid */
.summary-cards {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 手機版兩列 */
  gap: 15px;
  margin-bottom: 25px;
}
@media (max-width: 400px) {
  .summary-cards { grid-template-columns: 1fr; } /* 極窄螢幕改一列 */
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
}
.stat-card .icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}
.income .icon-circle { background-color: #dcfce7; color: #166534; }
.expenses .icon-circle { background-color: #fee2e2; color: #991b1b; }
.stat-card .label { color: #64748b; font-size: 0.9rem; }
.stat-card .amount { font-size: 1.4rem; font-weight: bold; color: #0f172a; }
.stat-card .percent { position: absolute; top: 20px; right: 20px; font-size: 0.8rem; font-weight: bold; }

/* 時間切換器樣式 */
.period-switcher {
  display: flex;
  justify-content: center;
  margin-bottom: 25px;
}
:deep(.p-selectbutton) {
  background: #f1f5f9;
  border-radius: 15px;
  padding: 4px;
}
:deep(.p-selectbutton .p-button) {
  border: none;
  background: transparent;
  border-radius: 12px;
  color: #64748b;
}
:deep(.p-selectbutton .p-button.p-highlight) {
  background: white;
  color: #0f172a;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* 分析比例卡片 */
.breakdown-card {
  border-radius: 20px;
  border: none;
  background-color: #edf5ff;
  margin-bottom: 30px;
}

/* 歷史列表樣式 */
.history-item {
  background: white;
  margin-bottom: 12px;
  padding: 15px;
  border-radius: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.01);
}
.item-left { display: flex; align-items: center; gap: 15px; }
.item-icon {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #475569;
}
.item-info { display: flex; flex-direction: column; }
.item-title { font-weight: bold; color: #0f172a; }
.item-subtitle { font-size: 0.8rem; color: #94a3b8; }
.item-amount { font-weight: bold; font-size: 1.1rem; }

/* 懸浮按鈕 FAB */
.fab-container {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}
.fab-btn {
  width: 70px !important;
  height: 70px !important;
  background-color: #065f46 !important;
  border: 4px solid white !important;
  box-shadow: 0 8px 20px rgba(6, 95, 70, 0.3) !important;
}
:deep(.fab-btn .p-button-icon) {
  font-size: 1.5rem;
}
</style>