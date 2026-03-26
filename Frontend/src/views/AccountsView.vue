<script setup lang="ts">
import { ref, computed } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';

// --- 1. 資源定義 ---
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
  displayCount.value = DEFAULT_COUNT;
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
  <div class="view-wrapper">
    <header class="view-header">
      <h1 class="view-title">我的資產</h1>
      <div class="flex gap-2">
        <Button icon="pi pi-sliders-h" variant="text" @click="isCatMgrVisible = true" class="opacity-40 hover:opacity-100" />
        <Button :icon="isValueVisible ? 'pi pi-eye' : 'pi pi-eye-slash'" variant="text" @click="isValueVisible = !isValueVisible" class="opacity-40 hover:opacity-100" />
      </div>
    </header>

    <main class="view-content">
      <section class="summary-section mb-6">
        <div class="net-worth-card shadow-lg">
          <div class="card-glass-overlay"></div>
          <div class="relative z-1">
            <p class="text-xs font-black tracking-widest uppercase opacity-50 mb-2">Net Worth</p>
            <h1 v-if="isValueVisible" class="text-5xl font-black m-0 tracking-tighter">{{ formatCurrency(netWorth) }}</h1>
            <h1 v-else class="text-5xl font-black m-0 tracking-tighter">******</h1>
            
            <div class="flex gap-8 mt-6 pt-5 border-top-1 border-white-alpha-10">
              <div class="stat-box">
                <p class="text-xs opacity-50 mb-1 font-bold uppercase tracking-wider">Assets</p>
                <p class="font-black text-emerald-300 text-xl m-0">{{ isValueVisible ? formatCurrency(totalAssets) : '****' }}</p>
              </div>
              <div class="stat-box">
                <p class="text-xs opacity-50 mb-1 font-bold uppercase tracking-wider">Liabilities</p>
                <p class="font-black text-rose-300 text-xl m-0">{{ isValueVisible ? formatCurrency(totalLiabilities) : '****' }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="list-section">
        <div v-for="group in groupedAccounts" :key="group.value" class="mb-6">
          <div class="section-label mb-3 px-1 flex align-items-center gap-2">
            <i :class="['pi', group.icon]" :style="{ color: group.color }"></i>
            <span>{{ group.label }}</span>
          </div>
          
          <div class="accounts-grid">
            <Card v-for="acc in group.items" :key="acc.id" 
                  class="theme-card account-item-card mb-3 cursor-pointer" 
                  @click="openEditDialog(acc)">
              <template #content>
                <div class="flex justify-content-between align-items-center">
                  <div class="flex align-items-center gap-4">
                    <div class="acc-icon-box" :style="{ backgroundColor: group.color + '15', color: group.color }">
                      <i :class="['pi', group.icon]"></i>
                    </div>
                    <span class="font-black text-lg">{{ acc.name }}</span>
                  </div>
                  <div class="text-right">
                    <div v-if="isValueVisible" :class="['text-xl font-black', acc.balance! >= 0 ? '' : 'text-rose-500']">
                      {{ formatCurrency(acc.balance!) }}
                    </div>
                    <div v-else class="text-xl font-black opacity-20">****</div>
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </div>
      </section>
    </main>

    <button class="fab-btn" @click="openAddDialog">
      <i class="pi pi-plus"></i>
    </button>

    <Dialog v-model:visible="isCatMgrVisible" modal header="管理帳戶分類" :style="{ width: '92vw', maxWidth: '450px' }" class="modern-dialog">
      <div class="p-3">
        <div class="add-cat-form mb-5 p-4 border-round-3xl bg-black-alpha-5 border-1 border-white-alpha-10">
          <label class="section-label mb-3 block">New Category</label>
          <InputText v-model="newCat.label" placeholder="分類名稱 (如：虛擬貨幣)" class="w-full modern-input mb-4" />
          
          <div class="icon-grid mb-4">
            <div v-for="icon in visibleIcons" :key="icon" class="icon-option" :class="{ 'active': newCat.icon === icon }" @click="newCat.icon = icon">
              <i :class="['pi', icon]"></i>
            </div>
            <div v-if="hasMoreIcons" class="icon-option more-btn" @click="showMoreIcons">
              <i class="pi pi-ellipsis-h"></i>
            </div>
          </div>

          <div class="flex gap-2 mb-5 overflow-x-auto py-1 custom-scrollbar">
            <div v-for="color in presetColors" :key="color" class="color-dot" :class="{ 'active': newCat.color === color }" :style="{ backgroundColor: color }" @click="newCat.color = color"></div>
          </div>

          <Button label="建立分類" icon="pi pi-check" class="w-full p-3 font-black border-round-2xl" @click="addCategory" />
        </div>

        <label class="section-label mb-3 block px-1">Current Categories</label>
        <div class="cat-list custom-scrollbar pr-2">
          <div v-for="(cat, index) in categories" :key="cat.value" class="flex align-items-center justify-content-between p-3 border-round-2xl mb-2 bg-black-alpha-5 border-1 border-white-alpha-5">
            <div class="flex align-items-center gap-3">
              <div class="mini-icon" :style="{ backgroundColor: cat.color + '20', color: cat.color }">
                <i :class="['pi', cat.icon]"></i>
              </div>
              <span class="font-bold">{{ cat.label }}</span>
            </div>
            <Button icon="pi pi-times" severity="danger" text @click="removeCategory(index)" />
          </div>
        </div>
      </div>
    </Dialog>

    <Dialog v-model:visible="isDialogVisible" modal :showHeader="false" :dismissableMask="true" :style="{ width: '92vw', maxWidth: '420px' }" class="modern-dialog">
      <div class="dialog-content">
        <div class="dialog-hero" :style="{ background: `linear-gradient(135deg, ${activeColor} 0%, #1e293b 100%)` }">
          <p class="m-0 text-xs font-black opacity-50 uppercase tracking-widest">Balance Amount</p>
          <div class="flex align-items-center justify-content-center gap-2 mt-2">
            <span class="text-2xl font-black opacity-40">$</span>
            <InputNumber v-with-input-mask v-model="currentAccount.balance" mode="decimal" class="huge-input" inputClass="huge-input-el" autofocus />
          </div>
        </div>
        
        <div class="p-5">
          <div class="form-field mb-4">
            <label class="section-label mb-2 block">Account Name</label>
            <InputText v-model="currentAccount.name" class="modern-input w-full" placeholder="例如：台新 Richart" />
          </div>
          <div class="form-field mb-6">
            <label class="section-label mb-2 block">Account Type</label>
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
            <Button :label="isEditMode ? '更新帳戶資訊' : '建立新帳戶'" class="save-btn p-3 font-black border-none shadow-lg" :style="{ backgroundColor: activeColor }" @click="saveAccount" />
            <div class="flex gap-2">
              <Button v-if="isEditMode" icon="pi pi-trash" severity="danger" text class="flex-1 opacity-60" @click="deleteAccount" />
              <Button label="取消返回" severity="secondary" text class="flex-2 font-bold opacity-50" @click="isDialogVisible = false" />
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
/* ✨ 質感增強樣式 */
.net-worth-card { 
  background: linear-gradient(135deg, var(--app-primary) 0%, #1e293b 100%); 
  color: white; 
  padding: 2.5rem; 
  border-radius: 32px; 
  position: relative; 
  overflow: hidden; 
  border: 1px solid rgba(255,255,255,0.1);
}

.card-glass-overlay {
  position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
  background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%);
  transform: rotate(30deg);
}

.acc-icon-box { width: 48px; height: 48px; border-radius: 14px; display: flex; justify-content: center; align-items: center; font-size: 1.2rem; }
.account-item-card { transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1); }
.account-item-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important; }

.fab-btn { 
  position: fixed; bottom: 100px; right: 25px; width: 60px; height: 60px; 
  border-radius: 22px; background: var(--app-primary); color: white; border: none; 
  cursor: pointer; z-index: 100; box-shadow: 0 10px 25px rgba(var(--app-primary-rgb), 0.4); 
  display: flex; align-items: center; justify-content: center; font-size: 1.6rem;
  transition: transform 0.2s;
}
.fab-btn:active { transform: scale(0.9); }

/* 下拉與輸入優化 */
.modern-input, .modern-select { 
  background: rgba(var(--app-primary-rgb), 0.05) !important; 
  border: 1.5px solid transparent !important; 
  border-radius: 16px !important; 
  font-weight: 700 !important; 
}
:deep(.p-select-label) { padding: 12px 15px !important; font-weight: 800; font-size: 0.9rem; }

/* 彈窗細節 */
.dialog-hero { padding: 3rem 2rem; text-align: center; color: white; position: relative; overflow: hidden; }
:deep(.huge-input-el) { 
  background: transparent !important; border: none !important; color: white !important; 
  font-size: 3.2rem !important; font-weight: 900 !important; text-align: center !important; 
  width: 100% !important; letter-spacing: -2px;
}

/* 圖標網格與色票 */
.icon-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }
.icon-option { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-radius: 12px; background: rgba(255, 255, 255, 0.05); cursor: pointer; color: #64748b; transition: 0.2s; }
.icon-option.active { background: var(--app-primary); color: white; transform: scale(1.1); }
.more-btn { border: 1px dashed var(--app-primary); color: var(--app-primary); }

.color-dot { width: 28px; height: 28px; border-radius: 50%; cursor: pointer; border: 3px solid transparent; transition: 0.2s; }
.color-dot.active { border-color: white; transform: scale(1.1); }

.cat-list { max-height: 250px; overflow-y: auto; }
.mini-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }
.save-btn { border-radius: 18px; color: white; }
</style>