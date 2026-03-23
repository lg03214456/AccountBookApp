<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useLogto } from "@logto/vue";
import Menu from 'primevue/menu';
import DevTestMenu from "./components/DevTestMenu.vue";
import { useTheme } from "./composables/useTheme";

// 1. 初始化與狀態
const { initTheme, isDarkMode, toggleDarkMode } = useTheme();
const router = useRouter();
const isLoading = ref(true);

onMounted(() => {
  initTheme();
});

// 2. Logto 認證
const { signIn, signOut, isAuthenticated, fetchUserInfo } = useLogto();
const userData = ref<any>(null);
const baseUrl = import.meta.env.VITE_APP_URL || "http://localhost:5173";

const handleLogin = async () => await signIn(`${baseUrl}/callback`);
const handleLogout = () => signOut(baseUrl);

// 3. 使用者選單控制
const userMenu = ref(); 
const toggleUserMenu = (event: Event) => userMenu.value.toggle(event);

const displayName = computed(() => {
  if (!userData.value) return '使用者';
  return userData.value.name || userData.value.username || userData.value.email?.split('@')[0] || '記帳高手';
});

const menuItems = computed(() => [
  {
    label: '個人工具',
    items: [
      { label: 'AI 助理', icon: 'pi pi-comments', command: () => router.push('/chat') },
      { label: isDarkMode.value ? '日間模式' : '深夜模式', icon: isDarkMode.value ? 'pi pi-sun' : 'pi-moon', command: () => toggleDarkMode() }
    ]
  },
  {
    label: '系統帳戶',
    items: [
      { label: '帳號設定', icon: 'pi pi-user-edit', command: () => router.push('/settings') },
      { label: '登出系統', icon: 'pi pi-sign-out', class: 'text-red-500', command: () => handleLogout() }
    ]
  }
]);

// 4. 監聽登入
watch(isAuthenticated, async (newVal) => {
  isLoading.value = true;
  if (newVal) {
    try { userData.value = await fetchUserInfo(); } catch (e) { console.error(e); }
  } else { userData.value = null; }
  setTimeout(() => { isLoading.value = false; }, 600);
}, { immediate: true });
</script>

<template>
  <div v-if="isLoading" class="loading-overlay">
    <div class="loader-content">
      <i class="pi pi-spin pi-spinner" style="font-size: 2.5rem; color: var(--app-primary)"></i>
      <p class="mt-3 font-bold opacity-70">同步雲端資料...</p>
    </div>
  </div>

  <div v-else class="app-layout">
    <header v-if="isAuthenticated" class="top-nav">
      <div class="nav-container">
        <RouterLink to="/" class="logo-link">
          <div class="logo-section">
            <i class="pi pi-wallet logo-icon"></i>
            <span class="logo-text">Cloud Bookkeeping</span>
          </div>
        </RouterLink>

        <div class="top-right-actions">
          <DevTestMenu v-if="userData" />
          <div class="user-chip" @click="toggleUserMenu">
            <div class="user-info hide-on-mobile" v-if="userData">
              <span class="user-name">{{ displayName }}</span>
              <i class="pi pi-chevron-down ml-2 text-xs opacity-50"></i>
            </div>
            <div class="mini-avatar">
              <img :src="userData?.picture || 'https://ui-avatars.com/api/?background=random&name=' + displayName" />
            </div>
          </div>
          <Menu ref="userMenu" id="user_overlay_menu" :model="menuItems" :popup="true" class="custom-dropdown" />
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="content-container">
        <RouterView />
        <div v-if="!isAuthenticated" class="guest-gate fade-in">
          <div class="lock-circle mb-6"><i class="pi pi-lock" style="font-size: 2.5rem;"></i></div>
          <h2 class="font-bold text-2xl">歡迎使用雲端記帳本</h2>
          <button @click="handleLogin" class="auth-btn login-btn mt-6 shadow-4">登入系統</button>
        </div>
      </div>
    </main>

    <footer v-if="isAuthenticated" class="app-bottom-nav">
      <div class="footer-grid">
        <RouterLink to="/book" class="footer-item">
          <div class="icon-wrapper"><i class="pi pi-book"></i></div>
          <span class="link-text">帳本</span>
        </RouterLink>

        <RouterLink to="/accounts" class="footer-item">
          <div class="icon-wrapper"><i class="pi pi-briefcase"></i></div>
          <span class="link-text">帳戶</span>
        </RouterLink>

        <RouterLink to="/stats" class="footer-item">
          <div class="icon-wrapper"><i class="pi pi-chart-pie"></i></div>
          <span class="link-text">分析</span>
        </RouterLink>

        <RouterLink to="/settings" class="footer-item">
          <div class="icon-wrapper"><i class="pi pi-cog"></i></div>
          <span class="link-text">設定</span>
        </RouterLink>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* 佈局基礎 */
.app-layout { height: 100vh; display: flex; flex-direction: column; overflow: hidden; background-color: var(--app-bg); }
.top-nav { flex-shrink: 0; z-index: 1000; background: var(--app-header-bg); backdrop-filter: blur(15px); border-bottom: 1px solid var(--app-footer-border); }
.nav-container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0.7rem 1.2rem; display: flex; justify-content: space-between; align-items: center; }
.main-content { flex: 1; overflow-y: auto; display: flex; justify-content: center; }
.content-container { width: 100%; max-width: 1200px; padding: 1.5rem; padding-bottom: 90px; }

/* 🟠 底部導覽列核心 CSS */
.app-bottom-nav {
  flex-shrink: 0;
  background-color: var(--app-footer-bg);
  border-top: 1px solid var(--app-footer-border);
  height: 75px;
  display: flex;
  justify-content: center;
  z-index: 2000;
  box-shadow: 0 -5px 20px rgba(0,0,0,0.03);
}

.footer-grid { display: grid; grid-template-columns: repeat(4, 1fr); width: 100%; max-width: 600px; }

.footer-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: var(--app-footer-text);
  opacity: 0.5;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* 彈跳效果 */
  position: relative;
  gap: 2px;
}

/* 圖標容器：位移的目標 */
.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 32px;
  transition: all 0.4s ease;
}

.footer-item i { font-size: 1.4rem; transition: transform 0.3s ease; }
.link-text { font-size: 0.75rem; font-weight: 800; transition: all 0.3s ease; }

/* ⭐ 關鍵狀態：被點擊 (Active) 時往上抬 */
.footer-item.router-link-active {
  opacity: 1;
  color: var(--app-primary) !important;
}

.footer-item.router-link-active .icon-wrapper {
  transform: translateY(-12px); /* 🟢 這裡控制上抬的高度 */
}

.footer-item.router-link-active i {
  transform: scale(1.15); /* 輕微放大 */
}

/* 底部裝飾條 */
.footer-item.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 8px;
  width: 5px;
  height: 5px;
  background: var(--app-primary);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--app-primary);
  animation: popIn 0.3s ease-out;
}

@keyframes popIn {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* 右側 Actions */
.top-right-actions { display: flex; align-items: center; gap: 12px; }
.user-chip { display: flex; align-items: center; gap: 10px; padding: 4px 4px 4px 12px; background: rgba(var(--app-primary-rgb), 0.08); border-radius: 40px; cursor: pointer; }
.mini-avatar { width: 32px; height: 32px; border-radius: 50%; overflow: hidden; border: 2px solid white; }
.mini-avatar img { width: 100%; height: 100%; object-fit: cover; }
.user-name { font-weight: 800; font-size: 0.85rem; color: var(--app-text); }

@media (max-width: 768px) {
  .hide-on-mobile { display: none; }
  .app-bottom-nav { height: 85px; padding-bottom: env(safe-area-inset-bottom); }
}
</style>