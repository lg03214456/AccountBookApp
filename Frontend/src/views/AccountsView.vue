<script setup lang="ts">
import { ref, computed } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';

// --- 1. 50 個精選圖標與配色 ---
const presetIcons = [
  'pi-wallet', 'pi-building', 'pi-credit-card', 'pi-money-bill', 'pi-chart-line', 'pi-bitcoin', 'pi-percentage', 'pi-tags',
  'pi-shopping-cart', 'pi-shopping-bag', 'pi-shop', 'pi-briefcase', 'pi-home', 'pi-car', 'pi-truck', 'pi-send',
  'pi-bolt', 'pi-map-marker', 'pi-phone', 'pi-envelope', 'pi-calendar', 'pi-clock', 'pi-bell', 'pi-camera',
  'pi-video', 'pi-image', 'pi-print', 'pi-ticket', 'pi-gift', 'pi-heart', 'pi-star', 'pi-sun',
  'pi-moon', 'pi-cloud', 'pi-apple', 'pi-android', 'pi-facebook', 'pi-twitter', 'pi-instagram', 'pi-github',
  'pi-discord', 'pi-slack', 'pi-database', 'pi-server', 'pi-desktop', 'pi-mobile', 'pi-tablet', 'pi-shield',
  'pi-lock', 'pi-key'
];

const presetColors = ['#f59e0b', '#10b981', '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#06b6d4', '#64748b'];

// --- 2. 狀態控管 ---
const categories = ref([
  { label: '現金資產', value: 'cash', icon: 'pi-wallet', color: '#f59e0b' },
  { label: '銀行存款', value: 'bank', icon: 'pi-building', color: '#10b981' },
  { label: '信用卡/負債', value: 'card', icon: 'pi-credit-card', color: '#6366f1' }
]);

const accounts = ref([
  { id: 1, name: '現金錢包', balance: 5200, type: 'cash' },
  { id: 2, name: '台新銀行', balance: 125000, type: 'bank' },
  { id: 3, name: '中信信用卡', balance: -8500, type: 'card' },
]);

const isValueVisible = ref(true); 
const isDialogVisible = ref(false);
const isCatMgrVisible = ref(false);
const isEditMode = ref(false);

// ⭐ 圖標分段顯示邏輯
const DEFAULT_COUNT = 17; 
const displayCount = ref(DEFAULT_COUNT);

const visibleIcons = computed(() => presetIcons.slice(0, displayCount.value));
const hasMoreIcons = computed(() => displayCount.value < presetIcons.length);

const currentAccount = ref({ id: null as any, name: '', balance: null as any, type: 'cash' });
const newCat = ref({ label: '', icon: 'pi-wallet', color: '#f59e0b' });

// --- 3. 計算屬性 ---
const groupedAccounts = computed(() => {
  return categories.value.map(cat => ({
    ...cat,
    items: accounts.value.filter(acc => acc.type === cat.value)
  })).filter(group => group.items.length > 0);
});

const totalAssets = computed(() => accounts.value.filter(acc => acc.balance! > 0).reduce((sum, acc) => sum + acc.balance!, 0));
const totalLiabilities = computed(() => accounts.value.filter(acc => acc.balance! < 0).reduce((sum, acc) => sum + Math.abs(acc.balance!), 0));
const netWorth = computed(() => totalAssets.value - totalLiabilities.value);

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(val);
};

const activeColor = computed(() => {
  return categories.value.find(c => c.value === currentAccount.value.type)?.color || 'var(--app-primary)';
});

// --- 4. 功能函式 ---
const showMoreIcons = () => { displayCount.value += 20; };

const addCategory = () => {
  if (!newCat.value.label) return;
  const val = newCat.value.label.toLowerCase().trim().replace(/\s+/g, '-');
  if (categories.value.some(c => c.value === val)) return;
  categories.value.push({ ...newCat.value, value: val });
  newCat.value = { label: '', icon: 'pi-wallet', color: '#f59e0b' };
  displayCount.value = DEFAULT_COUNT; // 重置顯示數量
};

const removeCategory = (index: number) => {
  const cat = categories.value[index];
  if (accounts.value.some(acc => acc.type === cat.value)) {
    alert('此分類尚有帳戶在使用中，無法刪除！');
    return;
  }
  categories.value.splice(index, 1);
};

const openAddDialog = () => {
  isEditMode.value = false;
  currentAccount.value = { id: null, name: '', balance: null, type: categories.value[0]?.value || 'cash' };
  isDialogVisible.value = true;
};

const openEditDialog = (acc: any) => {
  isEditMode.value = true;
  currentAccount.value = { ...acc };
  isDialogVisible.value = true;
};

const saveAccount = () => {
  if (!currentAccount.value.name) return;
  if (isEditMode.value) {
    const idx = accounts.value.findIndex(a => a.id === currentAccount.value.id);
    if (idx !== -1) accounts.value[idx] = { ...currentAccount.value } as any;
  } else {
    accounts.value.push({ ...currentAccount.value, id: Date.now(), balance: currentAccount.value.balance || 0 } as any);
  }
  isDialogVisible.value = false;
};

const deleteAccount = () => {
  accounts.value = accounts.value.filter(a => a.id !== currentAccount.value.id);
  isDialogVisible.value = false;
};
</script>

<template>
  <div class="view-wrapper fade-in">
    <header class="view-header">
      <h1 class="view-title">我的資產</h1>
      <div class="flex gap-2">
        <Button icon="pi pi-sliders-h" variant="text" size="small" @click="isCatMgrVisible = true" class="opacity-60" />
        <Button :icon="isValueVisible ? 'pi pi-eye' : 'pi pi-eye-slash'" variant="text" size="small" @click="isValueVisible = !isValueVisible" class="opacity-60" />
      </div>
    </header>

    <main class="view-content">
      <section class="summary-section">
        <div class="net-worth-card shadow-lg">
          <div class="relative z-1">
            <p class="text-xs font-bold tracking-widest uppercase opacity-60 mb-2">Net Worth</p>
            <h1 v-if="isValueVisible" class="text-4xl md:text-5xl font-black m-0">{{ formatCurrency(netWorth) }}</h1>
            <h1 v-else class="text-4xl md:text-5xl font-black m-0">******</h1>
            <div class="flex gap-6 mt-4 pt-4 border-top-1 border-white-alpha-10">
              <div class="stat-box">
                <p class="text-xs opacity-60 mb-1 font-bold">總資產</p>
                <p class="font-bold text-green-300 text-xl m-0">{{ isValueVisible ? formatCurrency(totalAssets) : '****' }}</p>
              </div>
              <div class="stat-box">
                <p class="text-xs opacity-60 mb-1 font-bold">總負債</p>
                <p class="font-bold text-red-300 text-xl m-0">{{ isValueVisible ? formatCurrency(totalLiabilities) : '****' }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="list-section mt-5 pb-8">
        <div v-for="group in groupedAccounts" :key="group.value" class="mb-5">
          <div class="flex align-items-center gap-2 mb-3 px-1 opacity-50">
            <i :class="['pi', group.icon, 'text-xs']" :style="{ color: group.color }"></i>
            <span class="text-xs font-black uppercase tracking-widest">{{ group.label }}</span>
          </div>
          <div class="accounts-grid">
            <Card v-for="acc in group.items" :key="acc.id" class="mb-3 theme-card account-item-card shadow-sm" @click="openEditDialog(acc)">
              <template #content>
                <div class="flex justify-content-between align-items-center">
                  <div class="flex align-items-center gap-4">
                    <div class="acc-icon-box" :style="{ backgroundColor: group.color + '20', color: group.color }">
                      <i :class="['pi', group.icon]"></i>
                    </div>
                    <span class="font-black text-lg">{{ acc.name }}</span>
                  </div>
                  <div class="text-right">
                    <div v-if="isValueVisible" :class="['text-xl font-black', acc.balance! >= 0 ? '' : 'text-red-500']">{{ formatCurrency(acc.balance!) }}</div>
                    <div v-else class="text-xl font-black opacity-20">****</div>
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </div>
      </section>
    </main>

    <button class="fab-btn" @click="openAddDialog"><i class="pi pi-plus"></i></button>

    <Dialog v-model:visible="isCatMgrVisible" modal header="管理帳戶分類" :style="{ width: '92vw', maxWidth: '420px' }" class="modern-dialog">
      <div class="p-3">
        <div class="add-cat-form mb-4 p-3 border-round-xl bg-black-alpha-5 border-1 border-white-alpha-10">
          <label class="block text-xs font-bold opacity-40 mb-3 uppercase">New Category</label>
          <InputText v-model="newCat.label" placeholder="分類名稱 (如：虛擬貨幣)" class="w-full modern-input mb-3" />
          
          <div class="icon-grid mb-3">
            <div v-for="icon in visibleIcons" :key="icon" class="icon-option" :class="{ 'active': newCat.icon === icon }" @click="newCat.icon = icon">
              <i :class="['pi', icon]"></i>
            </div>
            <div v-if="hasMoreIcons" class="icon-option more-btn" @click="showMoreIcons">
              <i class="pi pi-ellipsis-h"></i>
            </div>
          </div>

          <div class="flex gap-2 mb-4 overflow-x-auto py-1 custom-scrollbar">
            <div v-for="color in presetColors" :key="color" class="color-dot" :class="{ 'active': newCat.color === color }" :style="{ backgroundColor: color }" @click="newCat.color = color"></div>
          </div>

          <Button label="建立分類" icon="pi pi-check" class="w-full p-3 font-bold border-round-xl" @click="addCategory" />
        </div>

        <label class="block text-xs font-bold opacity-40 mb-2 uppercase px-1">Current</label>
        <div class="cat-list custom-scrollbar">
          <div v-for="(cat, index) in categories" :key="cat.value" class="flex align-items-center justify-content-between p-2 pl-3 border-round-xl mb-2 bg-black-alpha-5">
            <div class="flex align-items-center gap-3">
              <div class="mini-icon" :style="{ backgroundColor: cat.color + '20', color: cat.color }">
                <i :class="['pi', cat.icon]"></i>
              </div>
              <span class="font-bold text-sm">{{ cat.label }}</span>
            </div>
            <Button icon="pi pi-times" severity="danger" text size="small" @click="removeCategory(index)" />
          </div>
        </div>
      </div>
    </Dialog>

    <Dialog v-model:visible="isDialogVisible" modal :showHeader="false" :dismissableMask="true" :style="{ width: '92vw', maxWidth: '420px' }" class="modern-dialog">
      <div class="dialog-content">
        <div class="dialog-hero" :style="{ background: `linear-gradient(135deg, ${activeColor} 0%, #1e293b 100%)` }">
          <p class="m-0 text-xs font-bold opacity-60 uppercase tracking-widest">Balance</p>
          <div class="flex align-items-center justify-content-center gap-2 mt-2">
            <span class="text-2xl font-black opacity-50">$</span>
            <InputNumber v-model="currentAccount.balance" mode="decimal" class="huge-input" inputClass="huge-input-el" autofocus />
          </div>
        </div>
        <div class="p-4 pt-5">
          <div class="form-field mb-4">
            <label class="block text-xs font-black opacity-40 mb-2 uppercase">Account Name</label>
            <InputText v-model="currentAccount.name" class="modern-input w-full" placeholder="例如：台新 Richart" />
          </div>
          <div class="form-field mb-5">
            <label class="block text-xs font-black opacity-40 mb-2 uppercase">Account Type</label>
            <Select v-model="currentAccount.type" :options="categories" optionLabel="label" optionValue="value" class="modern-select w-full">
              <template #option="slotProps">
                <div class="flex align-items-center gap-3">
                  <i :class="['pi', slotProps.option.icon]" :style="{ color: slotProps.option.color }"></i>
                  <span class="font-bold">{{ slotProps.option.label }}</span>
                </div>
              </template>
            </Select>
          </div>
          <div class="flex flex-column gap-3">
            <Button :label="isEditMode ? '更新帳戶' : '建立帳戶'" class="save-btn p-3 font-black border-none" :style="{ backgroundColor: activeColor }" @click="saveAccount" />
            <div class="flex gap-2">
              <Button v-if="isEditMode" icon="pi pi-trash" severity="danger" text class="delete-btn flex-1" @click="deleteAccount" />
              <Button label="取消" severity="secondary" text class="flex-2 font-bold opacity-60" @click="isDialogVisible = false" />
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
/* 基礎佈局 */
.view-wrapper { width: 100%; max-width: 1000px; margin: 0 auto; overflow-x: hidden; }
.net-worth-card { background: linear-gradient(135deg, var(--app-primary) 0%, #1e293b 100%); color: white; padding: 2.2rem; border-radius: 30px; position: relative; overflow: hidden; }

/* 項目卡片 */
.acc-icon-box { width: 44px; height: 44px; border-radius: 12px; display: flex; justify-content: center; align-items: center; font-size: 1.1rem; }
.account-item-card { transition: all 0.2s; cursor: pointer; border-radius: 20px !important; }
.account-item-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }

/* FAB */
.fab-btn { position: fixed; bottom: 100px; right: 25px; width: 58px; height: 58px; border-radius: 20px; background: var(--app-primary); color: white; border: none; cursor: pointer; z-index: 100; box-shadow: 0 8px 20px rgba(var(--app-primary-rgb), 0.4); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }

/* ⭐ 圖標網格系統 (6欄) */
.icon-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
.icon-option { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: rgba(255, 255, 255, 0.05); cursor: pointer; color: #64748b; transition: 0.2s; }
.icon-option.active { background: var(--app-primary); color: white; transform: scale(1.1); }
.more-btn { background: rgba(var(--app-primary-rgb), 0.15); color: var(--app-primary); border: 1px dashed var(--app-primary); }

/* 色票 */
.color-dot { width: 26px; height: 26px; border-radius: 50%; cursor: pointer; flex-shrink: 0; border: 2px solid transparent; transition: 0.2s; }
.color-dot.active { border-color: white; transform: scale(1.1); }

/* 下拉選單與輸入 */
.modern-input, .modern-select { background: rgba(var(--app-primary-rgb), 0.05) !important; border: 1.5px solid transparent !important; border-radius: 14px !important; font-weight: 700 !important; }
:deep(.p-select-label) { padding: 10px 12px !important; font-weight: 800; }

/* 彈窗 Hero */
:deep(.modern-dialog) { border-radius: 26px; overflow: hidden; border: none; }
.dialog-hero { padding: 2.8rem 2rem; text-align: center; color: white; transition: 0.5s; position: relative; overflow: hidden; }
:deep(.huge-input-el) { background: transparent !important; border: none !important; color: white !important; font-size: 2.8rem !important; font-weight: 900 !important; text-align: center !important; width: 100% !important; }

/* 列表容器 */
.cat-list { max-height: 200px; overflow-y: auto; }
.custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

.save-btn { border-radius: 16px; color: white; }
.delete-btn { color: #ef4444 !important; }
.mini-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
</style>

