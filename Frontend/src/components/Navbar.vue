<script setup>
import { useLogto } from '@logto/vue';
import { ref, watchEffect } from 'vue';

// 1. 從 Logto SDK 取出需要的方法和狀態
const { isAuthenticated, fetchUserInfo, signIn, signOut } = useLogto();

// 2. 準備一個變數來裝使用者資料
const userInfo = ref(null);

// 3. 監聽登入狀態，一旦登入成功就去抓資料
watchEffect(async () => {
  if (isAuthenticated.value) {
    // 抓取包含 email、大頭貼、名稱的詳細資料
    userInfo.value = await fetchUserInfo();
  } else {
    userInfo.value = null;
  }
});
</script>
<template>
  <div>
    <div v-if="!isAuthenticated">
      <h2>您尚未登入記帳系統</h2>
      <button @click="signIn('http://localhost:5173/callback')">點我登入</button>
    </div>

    <div v-else-if="userInfo">
      <img :src="userInfo.picture" alt="User Avatar" width="50" style="border-radius: 50%;" />
      
      <h2>歡迎回來，{{ userInfo.name || userInfo.username }}！</h2>
      <p>您的綁定信箱：{{ userInfo.email }}</p>
      
      <button @click="signOut('http://localhost:5173')">登出</button>
    </div>
  </div>
</template>