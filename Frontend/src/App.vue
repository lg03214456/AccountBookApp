<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useLogto } from "@logto/vue";
import DevTestMenu from "./components/DevTestMenu.vue";
import { useTheme } from "./composables/useTheme";

// 1. 初始化主題
const { initTheme } = useTheme();
// 🟢 新增：Loading 狀態，防止登入時畫面閃爍
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

// 🟢 優化登入監控：加入 Loading 判斷
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
    // 給一點點緩衝時間讓畫面更平順
    setTimeout(() => {
      isLoading.value = false;
    }, 300);
  },
  { immediate: true },
);
</script>

<template>
  <div v-if="isLoading" class="loading-overlay">
    <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: var(--app-primary)"></i>
  </div>

  <div v-else class="app-layout page-wrapper">
    <header class="top-nav">
      <div class="logo-section">
        <i class="pi pi-wallet logo-icon"></i>
        <span class="logo-text hide-on-mobile">Bookkeeping</span>
      </div>

      <nav class="nav-links">
        <RouterLink to="/" class="nav-item">
          <i class="pi pi-home"></i>
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
        <span
          class="user-greeting hide-on-mobile"
          v-if="userData && isAuthenticated"
        >
          Hi, {{ userData.name || userData.username }}
        </span>

        <template v-if="!isAuthenticated">
          <button @click="handleLogin" class="auth-btn login-btn">登入</button>
        </template>
        <template v-else>
          <button @click="handleLogout" class="auth-btn logout-btn">
            <i class="pi pi-sign-out"></i>
            <span class="hide-on-mobile">登出</span>
          </button>
          <DevTestMenu />
        </template>
      </div>
    </header>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
/* 🟢 Loading 樣式 */
.loading-overlay {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f8faff; /* 建議與主題背景色一致 */
}

.app-layout {
  font-family: "Inter", sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 🟢 Logo 樣式 */
.logo-section {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.logo-icon {
  font-size: 1.5rem;
  color: var(--app-primary);
}
.logo-text {
  font-weight: 800;
  font-size: 1.2rem;
  letter-spacing: -0.5px;
  color: #1e293b;
}

/* 🔵 導覽列佈局 (鎖死寬度防溢出) */
.top-nav {
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  max-width: 100vw;
  box-sizing: border-box; /* ⭐ 關鍵：確保內邊距不撐爆寬度 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1.5rem;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 1; 
  min-width: 0;
}

.nav-item {
  text-decoration: none;
  color: #495057;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  white-space: nowrap; /* ⭐ 關鍵：文字不換行 */
}

.nav-item.router-link-exact-active {
  color: var(--app-primary);
  font-weight: bold;
}

.divider {
  color: #adb5bd;
}

/* 🟡 驗證區域 */
.auth-section {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-shrink: 0;
}

.user-greeting {
  font-size: 0.85rem;
  color: #64748b;
}

.auth-btn {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  border: none;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: opacity 0.2s;
}

.login-btn {
  background-color: var(--app-primary);
  color: white;
}

.logout-btn {
  background-color: transparent;
  color: #ef4444;
  border: 1px solid #fee2e2;
}

.main-content {
  padding: 1rem;
  flex-grow: 1;
  width: 100%;
  max-width: 100vw;
  box-sizing: border-box;
  overflow-x: hidden; /* ⭐ 核心：禁止主內容區左右滑動 */
}

/* ⭐⭐⭐ 響應式優化：手機版 ⭐⭐⭐ */
@media (max-width: 768px) {
  .nav-text, .hide-on-mobile {
    display: none;
  }

  .nav-links {
    gap: 0.8rem;
  }

  .top-nav {
    padding: 0.8rem 0.8rem; /* 手機版邊距縮小 */
  }

  .nav-item i {
    font-size: 1.2rem;
  }
}

/* 針對 400px 以下的超窄螢幕 */
@media (max-width: 400px) {
  .divider {
    display: none; 
  }
  .nav-links {
    gap: 1.2rem; /* 分隔線消失後，圖示間距加大方便點擊 */
  }
  .top-nav {
    padding: 0.8rem 0.5rem;
  }
}

/* 極端窄螢幕防護 */
@media (max-width: 320px) {
  .logo-section {
    display: none;
  }
}
</style>