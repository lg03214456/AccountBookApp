<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useLogto } from "@logto/vue";
import Popover from 'primevue/popover'; 
import PanelMenu from 'primevue/panelmenu'; 
import { useTheme } from "./composables/useTheme";
import Toast from 'primevue/toast';

const { initTheme, isDarkMode, toggleDarkMode } = useTheme();
const router = useRouter();
const isLoading = ref(true);

onMounted(() => initTheme());

// Logto 認證邏輯
const { signIn, signOut, isAuthenticated, fetchUserInfo } = useLogto();
const userData = ref<any>(null);
const baseUrl = import.meta.env.VITE_APP_URL || "http://localhost:5173";

const handleLogin = async () => await signIn(`${baseUrl}/callback`);
const handleLogout = () => signOut(baseUrl);

// 🟢 選單控制邏輯 (解決 PC 版移動消失問題)
const op = ref();
const expandedKeys = ref({ '0': true, '1': true, '2': true });
let hideTimer: any = null;

const isPC = () => window.matchMedia("(min-width: 1024px)").matches;

// 滑鼠移入：顯示並清除隱藏計時
const onUserHover = (event: Event) => {
  if (isPC()) {
    clearTimeout(hideTimer);
    op.value.show(event);
  }
};

// 滑鼠離開：設定緩衝時間後隱藏
const onUserLeave = () => {
  if (isPC()) {
    hideTimer = setTimeout(() => {
      op.value.hide();
    }, 300); // 300ms 緩衝，讓滑鼠有時間移入選單
  }
};

// 選單內部的 Hover 監聽：避免選單消失
const onMenuHover = () => clearTimeout(hideTimer);

// 點擊觸發 (主要供手機版或 PC 強制點擊)
const onUserClick = (event: Event) => op.value.toggle(event);

const displayName = computed(() => {
  if (!userData.value) return '使用者';
  return userData.value.name || userData.value.username || userData.value.email?.split('@')[0] || '管理員';
});

// 選單內容配置
const menuItems = computed(() => [
  {
    key: '0',
    label: '個人工具',
    icon: 'pi pi-user',
    items: [
      { label: 'AI 助理', icon: 'pi pi-comments', command: () => router.push('/chat') },
      { label: isDarkMode.value ? '日間模式' : '深夜模式', icon: isDarkMode.value ? 'pi pi-sun' : 'pi pi-moon', command: () => toggleDarkMode() }
    ]
  },
  ...(userData.value ? [{
    key: '1',
    label: '開發管理',
    icon: 'pi pi-cog',
    items: [
      {
        label: '開發測試工具',
        icon: 'pi pi-code',
        items: [
          { label: '模擬數據', icon: 'pi pi-database', command: () => console.log('模擬數據') },
          { label: '清理快取', icon: 'pi pi-refresh', command: () => { localStorage.clear(); location.reload(); } },
          { label: '路由檢查', icon: 'pi pi-map', command: () => console.table(router.getRoutes()) }
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
      { label: '登出系統', icon: 'pi pi-sign-out', class: 'text-red-500', command: () => handleLogout() }
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

  <div v-if="isLoading" class="loading-overlay">
    <div class="loader-content">
      <i class="pi pi-spin pi-spinner" style="font-size: 2.5rem; color: var(--app-primary)"></i>
      <p class="mt-4 font-black opacity-50 text-xs">Cloud Syncing...</p>
    </div>
  </div>

  <div v-else class="app-layout">
    <header v-if="isAuthenticated" class="top-nav">
      <div class="nav-container">
        <RouterLink to="/" class="logo-link">
          <div class="logo-section">
            <div class="logo-icon-bg"><i class="pi pi-wallet"></i></div>
            <span class="logo-text hide-on-mobile">Cloud Bookkeeping</span>
          </div>
        </RouterLink>

        <div class="top-right-actions">
          <div 
            class="user-chip shadow-sm" 
            @click="onUserClick" 
            @mouseenter="onUserHover"
            @mouseleave="onUserLeave"
          >
            <i class="pi pi-th-large chip-side-icon"></i>
            <div class="user-info-text" v-if="userData">
              <span class="user-name">{{ displayName }}</span>
              <i class="pi pi-chevron-down text-[10px] opacity-20 ml-1"></i>
            </div>
            <div class="mini-avatar">
              <img :src="userData?.picture || 'https://ui-avatars.com/api/?background=random&name=' + displayName" />
            </div>
          </div>

          <Popover 
            ref="op" 
            class="custom-popover"
            @mouseenter="onMenuHover"
            @mouseleave="onUserLeave"
          >
            <PanelMenu 
              v-model:expandedKeys="expandedKeys"
              :model="menuItems" 
              class="w-full border-none" 
            />
          </Popover>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="content-container">
        <router-view v-slot="{ Component }">
          <transition name="fade-up" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>

        <div v-if="!isAuthenticated" class="guest-gate">
          <button @click="handleLogin" class="auth-btn login-btn">立即登入</button>
        </div>
      </div>
    </main>

    <footer v-if="isAuthenticated" class="app-bottom-nav">
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
.app-layout { height: 100vh; display: flex; flex-direction: column; overflow: hidden; background-color: var(--app-bg); }

/* 🟢 Logo 與 Header 對齊修復 */
.top-nav { flex-shrink: 0; z-index: 1000; background: var(--app-header-bg); backdrop-filter: blur(20px); border-bottom: 1px solid var(--app-footer-border); }
.nav-container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0.6rem 1.5rem; display: flex; justify-content: space-between; align-items: center; }

.logo-section { display: flex; align-items: center; gap: 12px; }
.logo-icon-bg { width: 32px; height: 32px; background: var(--app-primary); color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.logo-text { font-weight: 900; letter-spacing: -0.5px; font-size: 1.1rem; line-height: 1; }

/* 🟢 User Chip 並排樣式修復 */
.user-chip { 
  display: flex !important; 
  flex-direction: row !important; 
  align-items: center !important; 
  gap: 12px; 
  padding: 4px 4px 4px 14px; 
  background: rgba(var(--app-primary-rgb), 0.05); 
  border: 1px solid rgba(var(--app-primary-rgb), 0.1); 
  border-radius: 40px; 
  cursor: pointer;
  white-space: nowrap;
}

.chip-side-icon { font-size: 0.9rem; opacity: 0.4; }
.user-info-text { display: flex; align-items: center; }
.user-name { font-size: 0.9rem; font-weight: 800; color: var(--app-text); }

.mini-avatar { width: 32px; height: 32px; border-radius: 50%; overflow: hidden; border: 2px solid white; flex-shrink: 0; }
.mini-avatar img { width: 100%; height: 100%; object-fit: cover; }

/* 🟢 Footer 樣式 */
.app-bottom-nav { flex-shrink: 0; background-color: var(--app-footer-bg); backdrop-filter: blur(15px); border-top: 1px solid var(--app-footer-border); height: 80px; display: flex; justify-content: center; padding-bottom: env(safe-area-inset-bottom); }
.footer-grid { display: grid; grid-template-columns: repeat(5, 1fr); width: 100%; max-width: 650px; }
.footer-item { display: flex; flex-direction: column; align-items: center; justify-content: center; text-decoration: none; color: var(--app-footer-text); opacity: 0.5; transition: 0.4s; gap: 4px; }
.footer-item.router-link-active { opacity: 1; color: var(--app-primary) !important; }
.footer-item i { font-size: 1.3rem; }
.footer-item span { font-size: 0.7rem; font-weight: 900; }

/* 🟢 Popover 內容修正 */
.custom-popover { padding: 0; width: 260px; background: var(--app-header-bg); border-radius: 16px; overflow: hidden; border: 1px solid var(--app-footer-border); }
:deep(.p-panelmenu-header-content) { background: transparent !important; border: none !important; padding: 12px 16px; }
:deep(.p-panelmenu-content) { background: rgba(var(--app-primary-rgb), 0.04) !important; border: none !important; padding-left: 12px; }

@media (max-width: 768px) {
  .user-info-text, .chip-side-icon { display: none; }
  .user-chip { padding: 4px; }
  .logo-text { display: none; }
  .footer-grid { max-width: 100%; }
}
</style>