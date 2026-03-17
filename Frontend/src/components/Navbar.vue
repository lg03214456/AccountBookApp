<script setup>
import { useLogto } from '@logto/vue';
import { ref, watchEffect } from 'vue';

// 1. 初始化 Logto 方法
const { isAuthenticated, fetchUserInfo, signIn, signOut } = useLogto();

// 2. 準備變數與環境變數網址
const userInfo = ref(null);

// ⭐ 自動抓取環境變數 VITE_APP_URL，若沒設定則預設為 localhost
const baseUrl = import.meta.env.VITE_APP_URL || "http://localhost:5173";

// 3. 封裝處理方法
const handleLogin = () => {
  // 自動拼接 /callback
  signIn(`${baseUrl}/callback`);
};

const handleLogout = () => {
  // 登出後回到首頁
  signOut(baseUrl);
};

// 4. 監聽登入狀態
watchEffect(async () => {
  if (isAuthenticated.value) {
    try {
      userInfo.value = await fetchUserInfo();
    } catch (error) {
      console.error("抓取使用者資料失敗:", error);
    }
  } else {
    userInfo.value = null;
  }
});
</script>

<template>
  <div class="auth-container">
    <div v-if="!isAuthenticated" class="login-box">
      <h2>您尚未登入記帳系統</h2>
      <button type="button" @click.prevent="handleLogin" class="btn-primary">
        點我登入
      </button>
    </div>

    <div v-else-if="userInfo" class="user-card">
      <div class="user-header">
        <img :src="userInfo.picture" alt="User Avatar" class="avatar" />
        <div class="user-text">
          <h2>歡迎回來，{{ userInfo.name || userInfo.username }}！</h2>
          <p class="email">綁定信箱：{{ userInfo.email }}</p>
        </div>
      </div>
      
      <button type="button" @click.prevent="handleLogout" class="btn-danger">
        登出系統
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 簡單調整樣式讓它更有質感 */
.auth-container {
  padding: 2rem;
  text-align: center;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid var(--app-primary, #4CAF50);
  margin-bottom: 1rem;
}

.user-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}

.email {
  opacity: 0.6;
  font-size: 0.9rem;
}

button {
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary { background-color: #4CAF50; color: white; }
.btn-danger { background-color: transparent; color: #ff4d4f; border: 1px solid #ff4d4f; }

button:hover { opacity: 0.8; }
</style>