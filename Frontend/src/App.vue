<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useLogto } from "@logto/vue";
import DevTestMenu from "./components/DevTestMenu.vue";
import { useTheme } from "./composables/useTheme";

// 1. 初始化主題與狀態
// 🟢 這裡要解構出 isDarkMode 和 toggleDarkMode 供畫面上使用
const { initTheme, isDarkMode, toggleDarkMode } = useTheme();
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
            <span class="logo-text">Cloud Bookkeeping</span>
          </div>
        </RouterLink>

        <div class="top-right-actions">
          <button @click="toggleDarkMode" class="icon-btn theme-btn" :title="isDarkMode ? '切換日間' : '切換深夜'">
            <i :class="['pi', isDarkMode ? 'pi-sun' : 'pi-moon']"></i>
          </button>
          
          <RouterLink to="/chat" class="ai-assistant-btn">
            <i class="pi pi-comments"></i>
            <span class="hide-on-mobile">AI 助理</span>
          </RouterLink>

          <div class="user-profile hide-on-mobile" v-if="userData">
            <span class="user-name">Hi, {{ userData.name || 'User' }}</span>
          </div>

          <button @click="handleLogout" class="icon-btn logout-btn" title="登出">
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
          <span class="link-text">帳本</span>
        </RouterLink>

        <RouterLink to="/accounts" class="footer-item">
          <i class="pi pi-briefcase"></i>
          <span class="link-text">帳戶</span>
        </RouterLink>

        <RouterLink to="/stats" class="footer-item">
          <i class="pi pi-chart-pie"></i>
          <span class="link-text">分析</span>
        </RouterLink>

        <RouterLink to="/settings" class="footer-item">
          <i class="pi pi-cog"></i>
          <span class="link-text">設定</span>
        </RouterLink>
      </div>
    </footer>
  </div>
</template>

<style>
/* ... :root 和 .dark-mode 維持不變 ... */
:root {
  --app-bg: #f8faff;
  --app-header-bg: rgba(255, 255, 255, 0.85);
  --app-footer-bg: #ffffff;
  --app-footer-text: #64748b;
  --app-footer-border: rgba(0, 0, 0, 0.05);
}

.dark-mode {
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
  height: 100vh;          /* 強制等於螢幕高度 */
  display: flex; 
  flex-direction: column; /* 垂直排列：Header -> Main -> Footer */
  overflow: hidden;       /* 防止整個網頁出現雙滾輪 */
  background-color: var(--app-bg);
}

/* 🟢 頂部 Navbar：固定不縮放 */
.top-nav {
  flex-shrink: 0;         /* 確保 Header 不會因為內容多而被壓縮 */
  position: relative;     /* 不再需要 sticky，因為父層已經 flex 鎖定了 */
  z-index: 1000;
  background: var(--app-header-bg);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--app-footer-border);
}

.nav-container {
  width: 100%;
  max-width: 1200px; /* 電腦版限制最大寬度 */
  padding: 0.6rem 1.2rem;
  display: flex; justify-content: space-between; align-items: center;
}

.top-right-actions {
  display: flex; align-items: center; gap: 1rem;
}

/* 🟠 底部 Footer：固定在最下方 */
.app-bottom-nav {
  flex-shrink: 0;         /* 確保 Footer 不會被擠壓 */
  background-color: var(--app-footer-bg);
  border-top: 1px solid var(--app-footer-border);
  width: 100%;
  transition: all 0.3s ease;
}

.footer-grid {
  width: 100%;
  max-width: 1200px;
}

.footer-item {
  display: flex;
  align-items: center;
  text-decoration: none; 
  color: var(--app-footer-text);
  transition: 0.2s;
}

.footer-item.router-link-exact-active {
  color: var(--app-primary);
  font-weight: bold;
}

/* ⭐ 響應式佈局 (RWD) 核心 */


/* ⭐ 響應式佈局補充 (RWD) */

@media (min-width: 769px) {
  /* 電腦版：Footer 內容橫向分佈 */
  .app-bottom-nav {
    padding: 1rem 0;
  }
  .footer-grid {
    display: flex;
    justify-content: space-around;
    max-width: 1200px;
  }
  .footer-item { flex-direction: row; gap: 10px; font-size: 1rem; }
}

@media (max-width: 768px) {
  /* 手機版：Footer 固定高度 */
  .app-bottom-nav {
    height: 65px;
    padding-bottom: env(safe-area-inset-bottom); /* 避開 iPhone 底部白條 */
  }
  .footer-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }
  /* ⚡ 手機版不再需要 has-footer 的 padding，因為 flex 佈局已經自動避開了 */
}
/* 其他通用樣式 */
/* 🔵 中間主內容區：關鍵滾動設定 */
.main-content { 
  flex: 1;                /* 自動撐開，佔據 Header 與 Footer 之間的所有空間 */
  overflow-y: auto;       /* ⚡ 當內容太長時，自動出現垂直滾輪 */
  -webkit-overflow-scrolling: touch; /* 讓手機版滑動更順暢 (滑動慣性) */
  display: flex;
  justify-content: center;
}

.content-container { width: 100%; max-width: 1200px; padding: 1.5rem; }

.icon-btn { 
  background: transparent; border: none; cursor: pointer; 
  font-size: 1.2rem; color: var(--app-footer-text); 
  display: flex; align-items: center; justify-content: center;
  padding: 8px; border-radius: 50%;
}
.theme-btn:hover { background: rgba(var(--app-primary-rgb), 0.1); }
.pi-sun { color: #f59e0b; }
.pi-moon { color: #818cf8; }

.logo-link { text-decoration: none; color: inherit; }
.logo-section { display: flex; align-items: center; gap: 8px; }
.logo-icon { color: var(--app-primary); font-size: 1.5rem; }
.logo-text { font-weight: 800; transition: font-size 0.3s; }

.ai-assistant-btn {
  display: flex; align-items: center; gap: 8px; text-decoration: none;
  background: rgba(var(--app-primary-rgb), 0.1);
  color: var(--app-primary); padding: 0.5rem 1.2rem; border-radius: 20px; font-weight: 700;
}

.logout-btn { color: #ef4444; }
.login-btn { background: var(--app-primary); color: white; padding: 0.7rem 2rem; border-radius: 12px; font-weight: bold; }
.loading-overlay { height: 100vh; display: flex; justify-content: center; align-items: center; background: var(--app-bg); }
.guest-gate { text-align: center; padding-top: 20vh; }
</style>