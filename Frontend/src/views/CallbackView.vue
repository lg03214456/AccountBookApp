<script setup lang="ts">
import { useHandleSignInCallback } from '@logto/vue';
import router from '../router';

const { isLoading } = useHandleSignInCallback(() => {
  // 登入成功後，跳轉回首頁
  router.push('/');
});
</script>

<template>
  <div class="callback-container">
    <p v-if="isLoading">正在驗證身分，請稍候...</p>
  </div>
</template>

<style scoped>
.callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.2rem;
}
</style>