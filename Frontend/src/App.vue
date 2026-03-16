<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useLogto } from "@logto/vue";
import DevTestMenu from "./components/DevTestMenu.vue";
import { useTheme } from "./composables/useTheme";

// 1. 初始化主題設定
const { initTheme } = useTheme();
const isLoading = ref(true);

onMounted(() => {
  initTheme();
});

const { signIn, signOut, isAuthenticated, fetchUserInfo } = useLogto();
const userData = ref<any>(null);


// ⭐ 正確抓取環境變數：請確保 .env 檔案中有 VITE_APP_URL

const baseUrl = import.meta.env.VITE_APP_URL || "http://localhost:5173";
const handleLogin = async () => {
  console.log("🚀 準備執行登入跳轉...");
  try {
    // 使用 .prevent 加上這裡的 await，雙重確保不重載
    await signIn(`${baseUrl}/callback`);
  } catch (error) {
    console.error("❌ 登入失敗：", error);
    alert("跳轉失敗，請檢查 F12 控制台錯誤訊息");
  }
};

const handleLogout = () => {
  signOut(baseUrl);
};

// 2. 監控登入狀態並處理 Loading 體驗
watch(
  isAuthenticated,
  async (newVal) => {
    isLoading.value = true;
    if (newVal) {
      try {
        userData.value = await fetchUserInfo();
      } catch (error) {
        console.error("無法取得使用者資料", error);
      }
    } else {
      userData.value = null;
    }
    // 增加緩衝時間，讓畫面轉換更平順
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
      <p>正在同步雲端資料...</p>
    </div>
  </div>

  <div v-else class="app-layout page-wrapper">
    <header class="top-nav">
      <div class="nav-container">
        <div class="logo-section">
          <i class="pi pi-wallet logo-icon"></i>
          <span class="logo-text hide-on-mobile">Bookkeeping</span>
        </div>

        <nav class="nav-links">
          <RouterLink to="/" class="nav-item">
            <i class="pi pi-home"></i>
            <span class="nav-text">首頁</span>
          </RouterLink>

          <template v-if="isAuthenticated">
            <RouterLink to="/book" class="nav-item">
              <i class="pi pi-list"></i>
              <span class="nav-text">記帳本</span>
            </RouterLink>
            <span class="divider">|</span>
            <RouterLink to="/chat" class="nav-item">
              <i class="pi pi-comments"></i>
              <span class="nav-text">AI 助理</span>
            </RouterLink>
            <span class="divider">|</span>
            <RouterLink to="/settings" class="nav-item">
              <i class="pi pi-cog"></i>
              <span class="nav-text">設定</span>
            </RouterLink>
          </template>
        </nav>

        <div class="auth-section">
          <template v-if="!isAuthenticated">
            <button 
              type="button" 
              @click.stop.prevent="handleLogin" 
              class="auth-btn login-btn"
            >
              登入
            </button>
          </template>

          <template v-else>
            <span class="user-greeting hide-on-mobile" v-if="userData">
              Hi, {{ userData.name || userData.username }}
            </span>
            <button type="button" @click.prevent="handleLogout" class="auth-btn logout-btn">
              <i class="pi pi-sign-out"></i>
              <span class="hide-on-mobile">登出</span>
            </button>
            <DevTestMenu />
          </template>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="content-container">
        <RouterView />
        
        <div v-if="!isAuthenticated && $route.path === '/'" class="guest-hint">
          <i class="pi pi-lock"></i>
          <p>請先登入以使用雲端記帳功能</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* 基礎排版 */
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-nav {
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: center;
}

.nav-container {
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1.5rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.nav-item {
  text-decoration: none;
  color: #495057;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: 0.2s;
}

.nav-item.router-link-exact-active {
  color: var(--app-primary);
  font-weight: bold;
}

/* Logo 樣式 */
.logo-section { display: flex; align-items: center; gap: 10px; }
.logo-icon { font-size: 1.5rem; color: var(--app-primary); }
.logo-text { font-weight: 800; font-size: 1.2rem; color: #1e293b; }

/* 驗證區域 */
.auth-section { display: flex; align-items: center; gap: 1rem; }
.auth-btn { padding: 0.5rem 1.2rem; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; }
.login-btn { background: var(--app-primary); color: white; }
.logout-btn { background: transparent; color: #ef4444; border: 1px solid #fee2e2; }

/* 內容區 */
.main-content { display: flex; justify-content: center; flex-grow: 1; }
.content-container { width: 100%; max-width: 1200px; padding: 2rem 1.5rem; }

.guest-hint { text-align: center; margin-top: 5rem; opacity: 0.3; }
.guest-hint i { font-size: 3rem; margin-bottom: 1rem; }

.loading-overlay {
  height: 100vh; width: 100vw; display: flex; justify-content: center; align-items: center; background: #f8faff;
}

/* 響應式 */
@media (max-width: 768px) {
  .nav-text, .hide-on-mobile { display: none; }
  .nav-container { padding: 0.8rem 1rem; }
}
</style>