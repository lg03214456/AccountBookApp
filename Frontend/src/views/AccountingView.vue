<script setup lang="ts">
import { ref, watchEffect } from 'vue'; // 1. 記得引入 watchEffect
import { useLogto } from '@logto/vue';

// PrimeVue 元件
import Button from 'primevue/button';
import Card from 'primevue/card';

// 2. 這裡拿掉 'user'，改成加入 'fetchUserInfo'
const { signIn, signOut, isAuthenticated, fetchUserInfo } = useLogto();

// 3. 定義一個變數來存使用者資料
const userData = ref<any>(null);

// 4. 自動監聽：一旦登入成功 (isAuthenticated 變 true)，就去抓使用者資料
watchEffect(async () => {
  if (isAuthenticated.value) {
    try {
      // 這裡會去 Logto 伺服器拿 email, sub, name 等資料
      const info = await fetchUserInfo();
      userData.value = info;
    } catch (error) {
      console.error('無法取得使用者資料', error);
    }
  }
});
const baseUrl = import.meta.env.VITE_APP_URL;


// 網址設定
const handleLogin = () => {
  signIn(`${baseUrl}/callback`);
};

const handleLogout = () => {
  signOut(`${baseUrl}/`);
};
</script>

<template>
  <div class="page-container">
    
    <div v-if="!isAuthenticated" class="login-container">
      <Card class="welcome-card">
        <template #title>歡迎來到記帳本</template>
        <template #content>
          <p class="mb-4">請先登入以開始管理您的財務。</p>
          <Button label="登入 / 註冊" icon="pi pi-user" size="large" @click="handleLogin" />
        </template>
      </Card>
    </div>

    <div v-else class="app-container">
      <Card>
        <template #title>
          <div class="flex justify-between items-center">
            <span>我的記帳本</span>
            <span class="text-sm text-gray-500" v-if="userData">
              Hi, {{ userData.email }}
            </span>
          </div>
        </template>
        
        <template #content>
          <div class="action-bar mb-4">
            <Button label="新增一筆" icon="pi pi-plus" class="mr-2" />
            <Button label="報表分析" icon="pi pi-chart-bar" severity="info" class="mr-2" />
            <Button label="登出" icon="pi pi-sign-out" severity="secondary" outlined @click="handleLogout" />
          </div>
          <p>這裡之後會顯示記帳列表...</p>
        </template>
      </Card>
    </div>

  </div>
</template>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}
.login-container {
  display: flex;
  justify-content: center;
  margin-top: 50px;
}
.welcome-card {
  width: 100%;
  max-width: 400px;
  text-align: center;
}
.action-bar {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>