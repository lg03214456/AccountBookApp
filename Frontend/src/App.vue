<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router"; // ⭐ 引入 useRoute
import { useLogto } from "@logto/vue";
import Popover from 'primevue/popover'; 
import PanelMenu from 'primevue/panelmenu'; 
import { useTheme } from "./composables/useTheme";
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const { initTheme, isDarkMode, toggleDarkMode } = useTheme();
const router = useRouter();
const route = useRoute(); // ⭐ 獲取目前路由實例
const toast = useToast();
const isLoading = ref(true);

onMounted(() => initTheme());

// --- Logto 配置 ---
const { signIn, signOut, isAuthenticated, fetchUserInfo, getAccessToken } = useLogto();
const userData = ref<any>(null);
const baseUrl = import.meta.env.VITE_APP_URL || "http://localhost:5173";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://localhost:5001";

const handleLogin = async () => await signIn(`${baseUrl}/callback`);
const handleLogout = () => signOut(baseUrl);

// --- 🟢 核心功能：判斷是否顯示 Footer ---
const showFooter = computed(() => {
  // 條件：必須已登入 + 不是在 Loading 狀態 + 目前路徑「不是」首頁 (/)
  return isAuthenticated.value && !isLoading.value && route.path !== '/';
});

// --- 🛠️ 測試函式 ---
const testPublicApi = async () => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/auth/public`);
    const data = await response.json();
    toast.add({ severity: 'success', summary: '公開連線成功', detail: data.message, life: 3000 });
  } catch (e) {
    toast.add({ severity: 'error', summary: '連線失敗', detail: '後端未啟動', life: 4000 });
  }
};

const testPrivateApi = async () => {
  try {
    const token = await getAccessToken('https://accountbook.api');
    const response = await fetch(`${apiBaseUrl}/api/auth/private`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    toast.add({ severity: 'info', summary: '私密連線成功', detail: `ID: ${data.yourLogtoId.substring(0, 8)}...`, life: 5000 });
  } catch (e) {
    toast.add({ severity: 'error', summary: '驗證失敗', detail: 'Token 異常', life: 4000 });
  }
};

// --- 選單邏輯 ---
const op = ref();
const expandedKeys = ref({ '0': true, '1': true, '1_0': true, '1_0_0': true }); 
let hideTimer: any = null;

const onUserHover = (event: Event) => {
  if (window.matchMedia("(min-width: 1024px)").matches) {
    if (hideTimer) clearTimeout(hideTimer);
    op.value.show(event);
  }
};
const onUserLeave = () => {
  hideTimer = setTimeout(() => op.value.hide(), 300);
};
const onMenuHover = () => {
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
};

const displayName = computed(() => userData.value?.name || userData.value?.username || '管理員');

const menuItems = computed(() => [
  {
    key: '0',
    label: '個人工具',
    icon: 'pi pi-user',
    items: [
      { label: 'AI 助理', icon: 'pi pi-comments', command: () => router.push('/chat') },
      { label: isDarkMode.value ? '日間' : '深夜', icon: isDarkMode.value ? 'pi pi-sun' : 'pi pi-moon', command: () => toggleDarkMode() }
    ]
  },
  ...(isAuthenticated.value ? [{
    key: '1',
    label: '開發管理',
    icon: 'pi pi-cog',
    items: [
      { 
        key: '1_0',
        label: '連線診斷', 
        icon: 'pi pi-server',
        items: [
          {
            key: '1_0_0',
            label: '身分驗證測試',
            icon: 'pi pi-shield',
            items: [
              { label: '公開測試', icon: 'pi pi-unlock', command: testPublicApi },
              { label: '私密測試', icon: 'pi pi-lock', command: testPrivateApi }
            ]
          }
        ]
      }
    ]
  }] : []),
  {
    key: '2',
    label: '系統帳戶',
    icon: 'pi pi-info-circle',
    items: [
      { label: '帳號設定', icon: 'pi pi-user-edit', command: () => router.push('/settings') },
      { label: '登出', icon: 'pi pi-sign-out', class: 'text-red-500', command: () => handleLogout() }
    ]
  }
]);

watch(isAuthenticated, async (newVal) => {
  isLoading.value = true;
  if (newVal) {
    try { userData.value = await fetchUserInfo(); } catch (e) { console.error(e); }
  } else { userData.value = null; }
  setTimeout(() => { isLoading.value = false; }, 600);
}, { immediate: true });
</script>

<template>
  <Toast />

  <div class="app-layout">
    <header v-if="isAuthenticated" class="top-nav">
      <div class="nav-container">
        <RouterLink to="/" class="logo-link">
          <div class="logo-section">
            <div class="logo-icon-bg"><i class="pi pi-wallet"></i></div>
            <span class="logo-text hide-on-mobile">Cloud Bookkeeping</span>
          </div>
        </RouterLink>

        <div class="top-right-actions">
          <div class="user-chip shadow-sm" @click="op.toggle($event)" @mouseenter="onUserHover" @mouseleave="onUserLeave">
            <i class="pi pi-th-large chip-side-icon"></i>
            <div class="user-info-text hide-on-mobile">
              <span class="user-name">{{ displayName }}</span>
              <i class="pi pi-chevron-down ml-1 opacity-20" style="font-size: 0.7rem;"></i>
            </div>
            <div class="mini-avatar">
              <img :src="userData?.picture || 'https://ui-avatars.com/api/?background=random&name=' + displayName" />
            </div>
          </div>

          <Popover ref="op" class="custom-popover" @mouseenter="onMenuHover" @mouseleave="onUserLeave">
            <PanelMenu v-model:expandedKeys="expandedKeys" :model="menuItems" class="w-full border-none" />
          </Popover>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div v-if="isLoading" class="loading-container">
        <i class="pi pi-spin pi-spinner" style="font-size: 2.5rem; color: var(--app-primary)"></i>
        <p class="mt-4 font-black opacity-40 text-xs uppercase tracking-widest">Initializing Cloud...</p>
      </div>

      <div v-else class="content-container">
        <router-view v-slot="{ Component }">
          <transition name="fade-up" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>

        <div v-if="!isAuthenticated" class="guest-gate">
          <div class="lock-icon-bg mb-6"><i class="pi pi-lock" style="font-size: 2rem;"></i></div>
          <h2 class="font-black text-2xl mb-2">Cloud Access</h2>
          <button @click="handleLogin" class="auth-btn login-btn shadow-4">立即登入</button>
        </div>
      </div>
    </main>

    <footer v-if="showFooter" class="app-bottom-nav">
      <div class="footer-grid">
        <RouterLink to="/book" class="footer-item"><i class="pi pi-book"></i><span>帳本</span></RouterLink>
        <RouterLink to="/accounts" class="footer-item"><i class="pi pi-briefcase"></i><span>帳戶</span></RouterLink>
        <RouterLink to="/plans" class="footer-item"><i class="pi pi-flag"></i><span>計畫</span></RouterLink>
        <RouterLink to="/stats" class="footer-item"><i class="pi pi-chart-pie"></i><span>分析</span></RouterLink>
        <RouterLink to="/settings" class="footer-item"><i class="pi pi-cog"></i><span>設定</span></RouterLink>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* 佈局與 Logo 排版修正 */
.app-layout { height: 100vh; display: flex; flex-direction: column; overflow: hidden; background-color: var(--app-bg); }
.top-nav { flex-shrink: 0; z-index: 1000; background: var(--app-header-bg); border-bottom: 1px solid var(--app-footer-border); }
.nav-container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0.6rem 1.5rem; display: flex; justify-content: space-between; align-items: center; }

.logo-link { text-decoration: none; display: flex; align-items: center; }
.logo-section { display: flex !important; flex-direction: row !important; align-items: center !important; gap: 12px; }
.logo-icon-bg { width: 32px; height: 32px; background: var(--app-primary); color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.logo-text { font-weight: 900; font-size: 1.1rem; color: var(--app-text); white-space: nowrap; line-height: 1; }

.main-content { flex: 1; overflow-y: auto; display: flex; flex-direction: column; position: relative; }
.content-container { flex: 1; width: 100%; max-width: 1200px; margin: 0 auto; padding: 1rem; position: relative; }

.app-bottom-nav { flex-shrink: 0; background-color: var(--app-footer-bg); border-top: 1px solid var(--app-footer-border); height: 80px; display: flex; justify-content: center; padding-bottom: env(safe-area-inset-bottom); }
.footer-grid { display: grid; grid-template-columns: repeat(5, 1fr); width: 100%; max-width: 650px; }
.footer-item { display: flex; flex-direction: column; align-items: center; justify-content: center; text-decoration: none; color: var(--app-footer-text); opacity: 0.5; transition: 0.4s; gap: 4px; }
.footer-item.router-link-active { opacity: 1; color: var(--app-primary) !important; font-weight: 900; }

.user-chip { display: flex; align-items: center; gap: 12px; padding: 4px 4px 4px 14px; background: rgba(var(--app-primary-rgb), 0.05); border-radius: 40px; cursor: pointer; }
.mini-avatar { width: 32px; height: 32px; border-radius: 50%; overflow: hidden; border: 2px solid white; flex-shrink: 0; }
.custom-popover { padding: 0; width: 280px; background: var(--app-header-bg); border-radius: 16px; border: 1px solid var(--app-footer-border); overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }

@media (max-width: 768px) {
  .hide-on-mobile { display: none; }
  .footer-grid { max-width: 100%; }
}
</style>