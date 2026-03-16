<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useLogto } from "@logto/vue";
import DevTestMenu from "./components/DevTestMenu.vue";
import { useTheme } from "./composables/useTheme";

// 1. 初始化主題
const { initTheme } = useTheme();
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
    if (newVal) {
      try {
        userData.value = await fetchUserInfo();
      } catch (error) {
        console.error("無法取得使用者資料", error);
      }
    } else {
      userData.value = null;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="app-layout page-wrapper">
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
.app-layout {
  font-family: "Inter", sans-serif;
}

/* 🟢 Logo 樣式 */
.logo-section {
  display: flex;
  align-items: center;
  gap: 10px;
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

/* 🔵 導覽列與連結 */
.top-nav {
  position: sticky;
  top: 0;
  z-index: 1000;
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
  flex-shrink: 1; /* ⭐ 允許在空間不足時縮小 */
  min-width: 0;   /* 解決 flex 子元素不縮小的問題 */
}

.nav-item {
  text-decoration: none;
  color: #495057;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
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
  gap: 1rem;
  flex-shrink: 0; /* 登入按鈕區域不縮小，保持完整 */
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
}

/* ⭐⭐⭐ 響應式關鍵：手機版調整 ⭐⭐⭐ */
@media (max-width: 768px) {
  /* 1. 隱藏導航列的文字，只留圖示 */
  .nav-text {
    display: none;
  }

  /* 2. 隱藏標記為 hide-on-mobile 的所有元素 (如問候語、登出文字、Logo文字) */
  .hide-on-mobile {
    display: none;
  }

  /* 3. 調整間距讓圖示在小畫面不擁擠 */
  .nav-links {
    gap: 0.8rem;
  }

  .nav-item i {
    font-size: 1.2rem; /* 手機版讓圖示稍微大一點好點擊 */
  }

  .auth-section {
    gap: 0.5rem;
  }

  .top-nav {
    padding: 0.8rem 0.5rem; /* 手機版內邊距縮小，留更多空間給內容 */
    width: 100%;
    max-width: 100vw; /* 鎖死寬度 */
    box-sizing: border-box; /* 確保 padding 不會往外撐 */
  }

  .divider {
    margin: 0 2px;
  }
}

/* 針對超小螢幕 (如 iPhone SE) 進一步壓縮 */
@media (max-width: 400px) {
  .divider {
    display: none; /* 隱藏分隔線，讓圖示更靠近 */
  }
  .nav-links {
    gap: 0.5rem; /* 連結間距縮小 */
  }
}

@media (max-width: 350px) {
  /* 針對極窄手機（如舊款 iPhone） */
  .logo-section {
    display: none; /* 甚至可以連 Logo 都藏起來，只留功能圖示 */
  }
}
</style>
