<template>
  <div style="text-align: center; margin-top: 50px;">
    <h2>登入處理中，請稍候...</h2>
  </div>
</template>

<script setup lang="ts">
import { useHandleSignInCallback } from '@logto/vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Logto 會自動處理網址上的授權碼
const { isLoading } = useHandleSignInCallback(() => {
  // 處理成功後，自動跳轉回首頁 '/'
  router.push('/');
});
</script>