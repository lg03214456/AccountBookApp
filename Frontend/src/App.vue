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

const handleLogin = () => {
  signIn(`${baseUrl}/callback`);
};

const handleLogout = () => {
  signOut(`${baseUrl}/`);
};

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

  <div v-else class="app-layout">
    <header v-if="isAuthenticated" class="top-nav">
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
        </nav>

        <div class="auth-section">
          <span class="user-greeting hide-on-mobile" v-if="userData">
            Hi, {{ userData.name || userData.username }}
          </span>
          <button @click="handleLogout" class="auth-btn logout-btn">
            <i class="pi pi-sign-out"></i>
            <span class="hide-on-mobile">登出</span>
          </button>
          <DevTestMenu />
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="content-container">
        <template v-if="isAuthenticated">
          <RouterView />
        </template>

        <div v-else class="guest-container">
          <div class="welcome-card">
            <div class="icon-circle">
              <i class="pi pi-wallet"></i>
            </div>
            <h1>雲端智慧記帳本</h1>
            <p>隨時隨地記錄您的每一筆開支，掌握財務自由</p>
            <button @click="handleLogin" class="landing-login-btn">
              立即開始使用
              <i class="pi pi-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* 🟢 基礎佈局 */
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8faff; /* 確保背景色填滿 */
}

/* 🔵 Top Nav 佈局：背景橫跨 100%，內容置中 */
.top-nav {
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: center; /* ⭐ 關鍵：讓內部的容器水平置中 */
}

.nav-container {
  width: 100%;
  max-width: 1200px; /* ⭐ 設定電腦版最大寬度 */
  padding: 0.8rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 🔵 主內容區佈局 */
.main-content {
  flex-grow: 1;
  width: 100%;
  display: flex;
  justify-content: center; /* ⭐ 讓內容容器置中 */
}

.content-container {
  width: 100%;
  max-width: 1200px; /* ⭐ 與導覽列對齊 */
  padding: 1.5rem;
  box-sizing: border-box;
}

/* 🟢 Logo & 導航項 */
.logo-section {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.logo-icon { font-size: 1.5rem; color: var(--app-primary); }
.logo-text { font-weight: 800; font-size: 1.2rem; color: #1e293b; }

.nav-links { display: flex; align-items: center; gap: 1rem; }
.nav-item { 
  text-decoration: none; color: #495057; font-weight: 500;
  display: flex; align-items: center; gap: 6px; white-space: nowrap;
}
.nav-item.router-link-exact-active { color: var(--app-primary); font-weight: bold; }
.divider { color: #adb5bd; }

/* 🟡 驗證按鈕 */
.auth-section { display: flex; align-items: center; gap: 0.8rem; flex-shrink: 0; }
.auth-btn { padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; border: none; display: flex; align-items: center; gap: 5px; }
.login-btn { background-color: var(--app-primary); color: white; }
.logout-btn { background-color: transparent; color: #ef4444; border: 1px solid #fee2e2; }

/* 🔴 未登入引導頁樣式 */
.guest-container {
  height: 70vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.welcome-card {
  background: white;
  padding: 3rem 2rem;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  max-width: 450px;
  width: 100%;
}
.icon-circle {
  width: 80px; height: 80px; background: var(--app-primary); color: white;
  border-radius: 50%; display: flex; justify-content: center; align-items: center;
  font-size: 2.5rem; margin: 0 auto 1.5rem;
}
.landing-login-btn {
  margin-top: 2rem; background: var(--app-primary); color: white; border: none;
  padding: 1rem 2rem; border-radius: 12px; font-weight: bold; cursor: pointer;
  display: flex; align-items: center; gap: 10px; width: 100%; justify-content: center;
}

/* 🟢 Loading 樣式 */
.loading-overlay {
  height: 100vh; width: 100vw; display: flex; justify-content: center; align-items: center; background: #f8faff;
}

/* ⭐⭐⭐ 響應式優化 ⭐⭐⭐ */
@media (max-width: 768px) {
  .nav-text, .hide-on-mobile { display: none; }
  .nav-container, .content-container { padding: 0.8rem 1rem; }
  .nav-links { gap: 0.8rem; }
}

@media (max-width: 400px) {
  .divider { display: none; }
  .nav-links { gap: 1.2rem; }
}
</style>