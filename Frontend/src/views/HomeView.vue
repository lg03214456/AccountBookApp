<script setup lang="ts">
import { useLogto } from "@logto/vue";
import { ref, watch, onMounted } from "vue";
import Card from 'primevue/card';
import Button from 'primevue/button';

const { isAuthenticated, fetchUserInfo } = useLogto();
const userData = ref<any>(null);
const isLocalLoading = ref(true); // 元件內部的讀取狀態

// 封裝抓取資料的邏輯
const loadUserData = async () => {
  if (isAuthenticated.value) {
    try {
      userData.value = await fetchUserInfo();
    } catch (error) {
      console.error("HomeView 抓取資料失敗", error);
    } finally {
      isLocalLoading.value = false;
    }
  }
};

// 1. 初始掛載時執行一次
onMounted(loadUserData);

// 2. ⭐ 核心修復：監控登入狀態變化
// 只要 isAuthenticated 變成 true，就立刻去抓資料
watch(
  isAuthenticated,
  (newVal) => {
    if (newVal) {
      loadUserData();
    }
  },
  { immediate: true } // 立即執行一次，確保狀態同步
);
</script>

<template>
  <div class="page-wrapper flex align-items-center justify-content-center p-4">
    <div v-if="!isLocalLoading" class="welcome-container fade-in">
      
      <section class="text-center mb-8">
        <div v-if="userData?.picture" class="avatar-wrapper mb-4">
          <img :src="userData.picture" alt="avatar" class="user-avatar" />
        </div>
        <div v-else class="avatar-placeholder mb-4">
          <i class="pi pi-user text-4xl text-300"></i>
        </div>
        
        <h1 class="text-4xl font-bold mb-2">
          Hi, {{ userData?.name || userData?.username || '使用者' }}
        </h1>
        <p class="text-lg opacity-80">歡迎回來！今天想記錄點什麼嗎？</p>
      </section>

      <div class="grid flex flex-column md:flex-row gap-4">
        <Card class="flex-1 cursor-pointer hover-scale custom-card" @click="$router.push('/book')">
          <template #content>
            <div class="flex align-items-center gap-4">
              <div class="icon-box bg-primary-faded">
                <i class="pi pi-pencil text-2xl text-primary"></i>
              </div>
              <div>
                <div class="font-bold text-xl">開始記帳</div>
                <div class="text-sm opacity-60">記錄您的日常收支</div>
              </div>
            </div>
          </template>
        </Card>

        <Card class="flex-1 cursor-pointer hover-scale custom-card" @click="$router.push('/chat')">
          <template #content>
            <div class="flex align-items-center gap-4">
              <div class="icon-box bg-blue-faded">
                <i class="pi pi-comments text-2xl text-blue-500"></i>
              </div>
              <div>
                <div class="font-bold text-xl">AI 助理</div>
                <div class="text-sm opacity-60">分析您的消費習慣</div>
              </div>
            </div>
          </template>
        </Card>
      </div>

    </div>

    <div v-else class="text-center">
      <i class="pi pi-spin pi-spinner text-3xl opacity-50"></i>
    </div>
  </div>
</template>

<style scoped>
.welcome-container {
  max-width: 800px;
  width: 100%;
}

/* 🟢 頭像優化 */
.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  object-fit: cover;
}

.avatar-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
}

.avatar-wrapper {
  display: flex;
  justify-content: center;
}

/* 🔵 卡片質感提升 */
.custom-card {
  background: var(--app-card-bg);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-box {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.bg-primary-faded { background: rgba(var(--app-primary-rgb), 0.1); }
.bg-blue-faded { background: rgba(59, 130, 246, 0.1); }

.hover-scale:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

h1, p {
  color: var(--app-text);
}
</style>