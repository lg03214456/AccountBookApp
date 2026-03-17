<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useLogto } from "@logto/vue";
import DevTestMenu from "./components/DevTestMenu.vue";
import { useTheme } from "./composables/useTheme";

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

watch(
  isAuthenticated,
  async (newVal) => {
    isLoading.value = true;
    if (newVal) {
      try { userData.value = await fetchUserInfo(); } 
      catch (error) { console.error(error); }
    } else {
      userData.value = null;
    }
    setTimeout(() => { isLoading.value = false; }, 500);
  },
  { immediate: true },
);

const handleQuickAdd = () => {
  console.log("開啟快速記帳表單");
};
</script>

<template>
  <div v-if="isLoading" class="loading-overlay">
    <div class="loader-content">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: var(--app-primary)"></i>
      <p>資料讀取中...</p>
    </div>
  </div>

  <div v-else class="app-layout">
    <header v-if="isAuthenticated" class="top-nav">
      <div class="nav-container">
        <RouterLink to="/" class="logo-section">
          <i class="pi pi-wallet logo-icon"></i>
          <span class="logo-text">Bookkeeping</span>
        </RouterLink>

        <div class="auth-section">
          <RouterLink to="/chat" class="top-chat-btn">
            <i class="pi pi-comments"></i>
            <span class="hide-on-mobile">AI 助理</span>
          </RouterLink>
          
          <button type="button" @click="handleLogout" class="auth-btn logout-btn">
            <i class="pi pi-sign-out"></i>
          </button>
          <DevTestMenu />
        </div>
      </div>
    </header>

    <main class="main-content" :class="{ 'with-footer': isAuthenticated }">
      <div class="content-container">
        <RouterView />
        <div v-if="!isAuthenticated" class="guest-screen">
          <i class="pi pi-lock-open mb-4" style="font-size: 3rem; opacity: 0.2"></i>
          <h2>歡迎使用雲端記帳</h2>
          <button @click="handleLogin" class="auth-btn login-btn mt-4">登入系統</button>
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

        <div class="footer-item center-btn" @click="handleQuickAdd">
          <div class="add-icon-box">
            <i class="pi pi-plus"></i>
          </div>
          <span class="add-text">記一筆</span>
        </div>

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

<style scoped>
.app-layout { min-height: 100vh; display: flex; flex-direction: column; }

/* 🟢 頂部導航 (維持淺色/毛玻璃) */
.top-nav {
  position: sticky; top: 0; z-index: 1000;
  background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(0,0,0,0.05);
  display: flex; justify-content: center;
}
.nav-container { width: 100%; max-width: 1200px; padding: 0.6rem 1.5rem; display: flex; justify-content: space-between; align-items: center; }

/* 🟠 底部導航 (關鍵：移除 Media Query 隱藏，改用變數) */
.app-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 70px;
  /* ⭐ 這裡改用變數，會跟隨主題改變 */
  background-color: var(--app-footer-bg, #121212); 
  border-top: 1px solid var(--app-border, #2c2c2e);
  display: flex;
  justify-content: center;
  z-index: 2000;
  padding-bottom: env(safe-area-inset-bottom);
}

.footer-grid {
  width: 100%;
  max-width: 600px; /* 在電腦上限制寬度，避免太散 */
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: center;
}

.footer-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  /* ⭐ 文字顏色也跟隨主題 */
  color: var(--app-text-secondary, #8e8e93); 
  font-size: 0.7rem;
  gap: 4px;
}

/* 啟動狀態：使用你的主題主色 */
.footer-item.router-link-exact-active {
  color: var(--app-primary, #ff9f0a);
}

.footer-item i { font-size: 1.3rem; }

/* 🟡 橘色加號按鈕樣式 */
.add-icon-box {
  width: 48px; height: 48px;
  background: var(--app-primary, #ff9f0a);
  border-radius: 14px;
  display: flex; justify-content: center; align-items: center;
  margin-top: -18px; /* 向上突出的靈魂 */
  box-shadow: 0 4px 15px rgba(255, 159, 10, 0.3);
  transition: transform 0.2s;
}
.add-icon-box:active { transform: scale(0.9); }
.add-icon-box i { color: #000; font-size: 1.5rem !important; font-weight: bold; }
.add-text { color: var(--app-primary, #ff9f0a); font-weight: bold; }

/* 🔵 主內容區間距 */
.main-content { display: flex; justify-content: center; flex-grow: 1; }
.content-container { width: 100%; max-width: 1200px; padding: 1.5rem; }

/* 確保不被底部遮擋 */
.with-footer {
  padding-bottom: 90px;
}

/* UI 組件樣式 */
.logo-section { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.logo-icon { color: var(--app-primary); font-size: 1.5rem; }
.logo-text { font-weight: 800; font-size: 1.2rem; color: #1e293b; }

.top-chat-btn {
  display: flex; align-items: center; gap: 6px; text-decoration: none;
  background: rgba(var(--app-primary-rgb), 0.1); color: var(--app-primary);
  padding: 0.4rem 0.8rem; border-radius: 12px; font-weight: 600;
}

.auth-section { display: flex; align-items: center; gap: 0.8rem; }
.auth-btn { cursor: pointer; border: none; background: transparent; }
.logout-btn { color: #ef4444; }
.login-btn { background: var(--app-primary); color: white; padding: 0.6rem 1.5rem; border-radius: 8px; }

@media (max-width: 768px) {
  .hide-on-mobile { display: none; }
}
</style>