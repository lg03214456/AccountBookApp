<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useLogto } from "@logto/vue";
import DevTestMenu from "./components/DevTestMenu.vue";
import { useTheme } from "./composables/useTheme";

// 1. 初始化主題與狀態
const { initTheme } = useTheme();
const isLoading = ref(true);

onMounted(() => {
  initTheme();
});

const { signIn, signOut, isAuthenticated, fetchUserInfo } = useLogto();
const userData = ref<any>(null);
const baseUrl = import.meta.env.VITE_APP_URL || "http://localhost:5173";

const handleLogin = async () => {
  await signIn(`${baseUrl}/callback`);
};

const handleLogout = () => {
  signOut(baseUrl);
};

// 2. 監控登入與資料抓取
watch(
  isAuthenticated,
  async (newVal) => {
    isLoading.value = true;
    if (newVal) {
      try {
        userData.value = await fetchUserInfo();
      } catch (error) {
        console.error("User Info Fetch Error", error);
      }
    } else {
      userData.value = null;
    }
    setTimeout(() => {
      isLoading.value = false;
    }, 500);
  },
  { immediate: true },
);
</script>

<template>
  <div v-if="isLoading" class="loading-overlay">
    <div class="loader-content">
      <i class="pi pi-spin pi-spinner" style="font-size: 2.5rem; color: var(--app-primary)"></i>
      <p>資料同步中...</p>
    </div>
  </div>

  <div v-else class="app-layout">
    <header v-if="isAuthenticated" class="top-nav">
      <div class="nav-container">
        <RouterLink to="/" class="logo-link">
          <div class="logo-section">
            <i class="pi pi-wallet logo-icon"></i>
            <span class="logo-text">Bookkeeping</span>
          </div>
        </RouterLink>

        <div class="top-center-area">
          <RouterLink to="/chat" class="ai-assistant-btn">
            <i class="pi pi-comments"></i>
            <span class="hide-on-mobile">AI 助理</span>
          </RouterLink>
        </div>

        <div class="auth-section">
          <span class="user-greeting hide-on-mobile" v-if="userData">
            Hi, {{ userData.name || userData.username }}
          </span>
          <button type="button" @click="handleLogout" class="auth-btn logout-btn" title="登出">
            <i class="pi pi-sign-out"></i>
          </button>
          <DevTestMenu />
        </div>
      </div>
    </header>

    <main class="main-content" :class="{ 'has-footer': isAuthenticated }">
      <div class="content-container">
        <RouterView />
        
        <div v-if="!isAuthenticated" class="guest-gate">
          <i class="pi pi-lock mb-4" style="font-size: 4rem; opacity: 0.1"></i>
          <h2>歡迎使用雲端記帳本</h2>
          <p class="opacity-60">請先登入以開啟完整功能</p>
          <button @click="handleLogin" class="auth-btn login-btn mt-6">登入系統</button>
        </div>
      </div>
    </main>

    <footer v-if="isAuthenticated" class="app-bottom-nav">
      <div class="footer-grid">
        <RouterLink to="/" class="footer-item">
          <i class="pi pi-book"></i>
          <span>帳本</span>
        </RouterLink>

        <RouterLink to="/accounts" class="footer-item">
          <i class="pi pi-briefcase"></i>
          <span>帳戶</span>
        </RouterLink>

        <RouterLink to="/stats" class="footer-item">
          <i class="pi pi-chart-pie"></i>
          <span>分析</span>
        </RouterLink>

        <RouterLink to="/settings" class="footer-item">
          <i class="pi pi-cog"></i>
          <span>設定</span>
        </RouterLink>
      </div>
    </footer>
  </div>
</template>

<style>
:root {
  /* ☀️ 預設淺色模式變數 */
  --app-bg: #f8faff;
  --app-header-bg: rgba(255, 255, 255, 0.85);
  --app-footer-bg: #ffffff;
  --app-footer-text: #64748b;
  --app-footer-border: rgba(0, 0, 0, 0.05);
}

.dark-mode {
  /* 🌙 深色模式變數 (當您的 useTheme 觸發時切換) */
  --app-bg: #0f172a;
  --app-header-bg: rgba(30, 41, 59, 0.8);
  --app-footer-bg: #1e293b;
  --app-footer-text: #94a3b8;
  --app-footer-border: rgba(255, 255, 255, 0.1);
  --app-text: #f1f5f9;
}
</style>

<style scoped>
.app-layout { 
  min-height: 100vh; 
  display: flex; 
  flex-direction: column; 
  background-color: var(--app-bg);
  transition: background-color 0.3s ease;
}

/* 🟢 頂部樣式 */
.top-nav {
  position: sticky; top: 0; z-index: 1000;
  background: var(--app-header-bg);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--app-footer-border);
  display: flex; justify-content: center;
  transition: background-color 0.3s;
}
.nav-container {
  width: 100%; max-width: 1200px; padding: 0.6rem 1.2rem;
  display: flex; justify-content: space-between; align-items: center;
}

.logo-link { text-decoration: none; color: inherit; }
.logo-section { display: flex; align-items: center; gap: 8px; }
.logo-icon { color: var(--app-primary); font-size: 1.5rem; }
.logo-text { font-weight: 800; font-size: 1.2rem; }

/* AI 助理 */
.ai-assistant-btn {
  display: flex; align-items: center; gap: 8px; text-decoration: none;
  background: rgba(var(--app-primary-rgb), 0.1);
  color: var(--app-primary); padding: 0.5rem 1.2rem; border-radius: 20px; font-weight: 700;
}

/* 🟠 底部導覽列 (關鍵：主題連動) */
.app-bottom-nav {
  position: fixed; bottom: 0; left: 0; width: 100%; height: 65px;
  background-color: var(--app-footer-bg);
  border-top: 1px solid var(--app-footer-border);
  display: flex; justify-content: center; z-index: 2000;
  padding-bottom: env(safe-area-inset-bottom);
  transition: all 0.3s ease;
}

.footer-grid {
  width: 100%; max-width: 600px;
  display: grid; grid-template-columns: repeat(4, 1fr);
  align-items: center;
}

.footer-item {
  display: flex; flex-direction: column; align-items: center;
  text-decoration: none; 
  color: var(--app-footer-text);
  font-size: 0.75rem; gap: 4px; transition: 0.2s;
}

.footer-item.router-link-exact-active {
  color: var(--app-primary);
  font-weight: bold;
}

.footer-item i { font-size: 1.4rem; }

/* 🔵 內容區間距 */
.main-content { display: flex; justify-content: center; flex-grow: 1; }
.content-container { width: 100%; max-width: 1200px; padding: 1.5rem; }

.has-footer { padding-bottom: 90px; } /* 預留足夠空間給底部導航 */

/* 其他 UI */
.auth-section { display: flex; align-items: center; gap: 1rem; }
.auth-btn { cursor: pointer; border: none; background: transparent; padding: 0.4rem; font-size: 1.2rem; }
.logout-btn { color: #ef4444; }
.login-btn { background: var(--app-primary); color: white; padding: 0.7rem 2rem; border-radius: 12px; font-weight: bold; }
.loading-overlay { height: 100vh; display: flex; justify-content: center; align-items: center; text-align: center; background: var(--app-bg); }
.guest-gate { text-align: center; padding-top: 20vh; }

@media (max-width: 768px) {
  .hide-on-mobile { display: none; }
}
</style>