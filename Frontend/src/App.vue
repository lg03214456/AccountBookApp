<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useLogto } from "@logto/vue";
import Menu from 'primevue/menu';
import DevTestMenu from "./components/DevTestMenu.vue";
import { useTheme } from "./composables/useTheme";
import Toast from 'primevue/toast'; // ⭐ 記得引入元件

// 1. 初始化與主題狀態
const { initTheme, isDarkMode, toggleDarkMode } = useTheme();
const router = useRouter();
const isLoading = ref(true);

onMounted(() => {
  initTheme();
});

// 2. Logto 認證邏輯
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
      { label: isDarkMode.value ? '日間模式' : '深夜模式', icon: isDarkMode.value ? 'pi pi-sun' : 'pi pi-moon', command: () => toggleDarkMode() }
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

// 4. 監聽登入狀態並更新資料
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
      <div class="pulse-icon">
        <i class="pi pi-spin pi-spinner" style="font-size: 2.5rem; color: var(--app-primary)"></i>
      </div>
      <p class="mt-4 font-black opacity-50 tracking-widest uppercase text-xs">Cloud Syncing...</p>
    </div>
  </div>

  <div v-else class="app-layout">
    <header v-if="isAuthenticated" class="top-nav">
      <div class="nav-container">
        <RouterLink to="/" class="logo-link">
          <div class="logo-section">
            <div class="logo-icon-bg">
              <i class="pi pi-wallet logo-icon"></i>
            </div>
            <span class="logo-text">Cloud Bookkeeping</span>
          </div>
        </RouterLink>

        <div class="top-right-actions">
          <DevTestMenu v-if="userData" />
          <div class="user-chip shadow-sm" @click="toggleUserMenu">
            <div class="user-info hide-on-mobile" v-if="userData">
              <span class="user-name">{{ displayName }}</span>
              <i class="pi pi-chevron-down ml-2 text-xs opacity-30"></i>
            </div>
            <div class="mini-avatar">
              <img :src="userData?.picture || 'https://ui-avatars.com/api/?background=random&name=' + displayName" />
            </div>
          </div>
          <Menu ref="userMenu" id="user_overlay_menu" :model="menuItems" :popup="true" class="custom-dropdown shadow-lg" />
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

        <div v-if="!isAuthenticated" class="guest-gate fade-in">
          <div class="lock-circle mb-6 shadow-lg"><i class="pi pi-lock" style="font-size: 2.5rem;"></i></div>
          <h2 class="font-black text-3xl tracking-tight">歡迎回歸</h2>
          <p class="opacity-50 mt-2 font-medium">請登入以開始您的雲端記帳旅程</p>
          <button @click="handleLogin" class="auth-btn login-btn mt-8 shadow-4">立即登入</button>
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

        <RouterLink to="/plans" class="footer-item">
          <div class="icon-wrapper"><i class="pi pi-flag"></i></div>
          <span class="link-text">計畫</span>
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
.app-layout { height: 100vh; display: flex; flex-direction: column; overflow: hidden; background-color: var(--app-bg); }

/* 頂部導航 */
.top-nav { flex-shrink: 0; z-index: 1000; background: var(--app-header-bg); backdrop-filter: blur(20px); border-bottom: 1px solid var(--app-footer-border); }
.nav-container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0.8rem 1.5rem; display: flex; justify-content: space-between; align-items: center; }
.logo-icon-bg { width: 32px; height: 32px; background: var(--app-primary); color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 12px; }
.logo-text { font-weight: 900; letter-spacing: -0.5px; font-size: 1.1rem; }

/* 內容區 */
.main-content { flex: 1; overflow-y: auto; display: flex; justify-content: center; scroll-behavior: smooth; }
.content-container { width: 100%; max-width: 1200px; position: relative; }

/* 🟠 底部導覽列核心樣式 */
.app-bottom-nav {
  flex-shrink: 0;
  background-color: var(--app-footer-bg);
  backdrop-filter: blur(15px);
  border-top: 1px solid var(--app-footer-border);
  height: 80px;
  display: flex;
  justify-content: center;
  z-index: 2000;
  padding-bottom: env(safe-area-inset-bottom);
}

/* ⭐ 修改：由 repeat(4, 1fr) 變更為 repeat(5, 1fr) */
.footer-grid { 
  display: grid; 
  grid-template-columns: repeat(5, 1fr); 
  width: 100%; 
  max-width: 650px; /* 稍微增加寬度以平衡 5 個項目 */
}

.footer-item {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-decoration: none; color: var(--app-footer-text);
  opacity: 0.5; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative; gap: 4px;
}

.icon-wrapper {
  display: flex; align-items: center; justify-content: center;
  width: 44px; height: 36px; transition: all 0.3s ease;
}

/* 為了 5 個項目不擁擠，圖標大小微調為 1.3rem */
.footer-item i { font-size: 1.3rem; transition: transform 0.3s ease; }
.link-text { font-size: 0.7rem; font-weight: 900; transition: all 0.3s ease; }

/* Active 狀態：上浮感與圓點裝飾 */
.footer-item.router-link-active { opacity: 1; color: var(--app-primary) !important; }
.footer-item.router-link-active .icon-wrapper { transform: translateY(-14px); }
.footer-item.router-link-active i { transform: scale(1.15); }

.footer-item.router-link-active::after {
  content: ''; position: absolute; bottom: 12px;
  width: 6px; height: 6px; background: var(--app-primary);
  border-radius: 50%; box-shadow: 0 0 12px var(--app-primary);
  animation: popIn 0.3s ease-out;
}

@keyframes popIn { from { transform: scale(0); } to { transform: scale(1); } }

/* 使用者資訊晶片 */
.user-chip { 
  display: flex; align-items: center; gap: 10px; padding: 5px 5px 5px 14px; 
  background: rgba(var(--app-primary-rgb), 0.05); border: 1px solid rgba(var(--app-primary-rgb), 0.1);
  border-radius: 40px; cursor: pointer; transition: 0.2s;
}
.user-chip:hover { background: rgba(var(--app-primary-rgb), 0.1); }
.mini-avatar { width: 30px; height: 30px; border-radius: 50%; overflow: hidden; }
.mini-avatar img { width: 100%; height: 100%; object-fit: cover; }

@media (max-width: 768px) {
  .hide-on-mobile { display: none; }
  .nav-container { padding: 0.8rem 1rem; }
  .content-container { padding-bottom: 100px; }
  .footer-grid { max-width: 100%; } /* 手機版撐滿 */
}
</style>