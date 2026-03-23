<script setup>
import { useLogto } from '@logto/vue';
import { ref, watchEffect, computed } from 'vue';
import { useTheme } from '../composables/useTheme'; 

// 1. 初始化 Logto 方法
const { isAuthenticated, fetchUserInfo, signIn, signOut } = useLogto();
const { isDarkMode, toggleDarkMode } = useTheme();

const userInfo = ref(null);
const baseUrl = import.meta.env.VITE_APP_URL || "http://localhost:5173";

const handleLogin = () => signIn(`${baseUrl}/callback`);
const handleLogout = () => signOut(baseUrl);

// 2. 監聽登入狀態並抓取資料
watchEffect(async () => {
  if (isAuthenticated.value) {
    try {
      const data = await fetchUserInfo();
      userInfo.value = data;
      // 🟢 這裡非常重要：請打開瀏覽器 F12 檢查 Console，看這裡有沒有 name 欄位
      console.log("Logto 使用者詳細資料:", data); 
    } catch (error) {
      console.error("抓取使用者資料失敗:", error);
    }
  } else {
    // ⭐ 登出時務必清空資料，避免畫面殘留
    userInfo.value = null;
  }
});

// ⭐ 顯示名稱邏輯：層層保險
const displayName = computed(() => {
  if (!userInfo.value) return '載入中...';
  
  // 優先順序：全名 (name) -> 帳號 (username) -> Email 前綴 -> 記帳高手
  return userInfo.value.name || 
         userInfo.value.username || 
         (userInfo.value.email ? userInfo.value.email.split('@')[0] : '記帳高手');
});
</script>

<template>
  <nav class="top-nav">
    <div class="nav-container">
      <div class="nav-left">
        <router-link to="/" class="logo-link">
          <i class="pi pi-wallet logo-icon"></i>
          <span class="logo-text">Cloud Bookkeeping</span>
        </router-link>
      </div>

      <div class="nav-right">
        <button @click="toggleDarkMode" class="icon-btn theme-btn" :title="isDarkMode ? '日間模式' : '深夜模式'">
          <i :class="['pi', isDarkMode ? 'pi-sun' : 'pi-moon']" class="theme-icon-animation"></i>
        </button>

        <template v-if="isAuthenticated && userInfo">
          <div class="user-profile hide-on-mobile">
            <span class="user-greeting">Hi, {{ displayName }}</span>
          </div>
          
          <div class="avatar-wrapper">
            <img 
              :src="userInfo.picture || 'https://ui-avatars.com/api/?background=random&name=' + displayName" 
              class="nav-avatar" 
              alt="Avatar"
            />
          </div>

          <button @click="handleLogout" class="logout-btn" title="登出系統">
            <i class="pi pi-sign-out"></i>
          </button>
        </template>

        <button v-else @click="handleLogin" class="login-pill">
          <i class="pi pi-user mr-2"></i>登入
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.top-nav {
  height: 65px;
  background: var(--app-header-bg, rgba(255, 255, 255, 0.8));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--app-footer-border, #eee);
  display: flex;
  justify-content: center;
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  transition: background 0.3s ease;
}

.nav-container {
  width: 100%;
  max-width: 1200px;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Logo 樣式 */
.logo-link {
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--app-text);
}
.logo-icon { color: var(--app-primary, #42b883); font-size: 1.6rem; }
.logo-text { font-weight: 800; font-size: 1.25rem; letter-spacing: -0.5px; }

.nav-right {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.user-greeting {
  font-weight: 700;
  color: var(--app-text);
  font-size: 0.95rem;
  opacity: 0.9;
}

.nav-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--app-primary, #42b883);
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.theme-icon-animation {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.icon-btn:active .theme-icon-animation { transform: rotate(45deg) scale(0.9); }

.login-pill {
  background: var(--app-primary, #42b883);
  color: white;
  border: none;
  padding: 0.6rem 1.4rem;
  border-radius: 25px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: transform 0.2s, box-shadow 0.2s;
}
.login-pill:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3); }

.logout-btn {
  background: transparent;
  border: none;
  color: #ff4d4f;
  font-size: 1.3rem;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  transition: opacity 0.2s;
}
.logout-btn:hover { opacity: 0.7; }

@media (max-width: 768px) {
  .hide-on-mobile { display: none; }
  .logo-text { font-size: 1.1rem; }
}
</style>