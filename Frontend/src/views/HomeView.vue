<script setup lang="ts">
import { useLogto } from "@logto/vue";
import { ref, watch, onMounted } from "vue";
import Card from 'primevue/card';
import Skeleton from 'primevue/skeleton';

const { isAuthenticated, fetchUserInfo } = useLogto();
const userData = ref<any>(null);
const isLocalLoading = ref(true);

const loadUserData = async () => {
  if (isAuthenticated.value) {
    isLocalLoading.value = true;
    try {
      userData.value = await fetchUserInfo();
    } catch (error) {
      console.error("HomeView 數據抓取失敗", error);
    } finally {
      // 人工延遲以提供平滑的骨架屏轉場
      setTimeout(() => {
        isLocalLoading.value = false;
      }, 500);
    }
  }
};

onMounted(loadUserData);

watch(isAuthenticated, (newVal) => {
  if (newVal) loadUserData();
}, { immediate: true });
</script>

<template>
  <div class="view-wrapper" v-if="isAuthenticated">
    
    <div v-if="isLocalLoading" class="full-page-skeleton">
      <div class="text-center mb-8">
        <Skeleton shape="circle" size="90px" class="mx-auto mb-4" />
        <Skeleton width="12rem" height="2.5rem" class="mx-auto mb-3" />
        <Skeleton width="18rem" height="1.2rem" class="mx-auto" />
      </div>
      <div class="flex flex-column md:flex-row gap-4">
        <Skeleton width="100%" height="120px" class="flex-1 border-round-3xl" />
        <Skeleton width="100%" height="120px" class="flex-1 border-round-3xl" />
      </div>
    </div>

    <Transition name="fade-up">
      <div v-if="!isLocalLoading">
        
        <header class="welcome-section text-center mb-10 mt-4">
          <div v-if="userData?.picture" class="avatar-container mb-4">
            <img :src="userData.picture" alt="avatar" class="user-avatar shadow-lg" />
          </div>
          <h1 class="text-4xl font-black tracking-tight">
            Hi, {{ userData?.name || userData?.username || '記帳高手' }}!
          </h1>
          <p class="text-lg opacity-50 mt-2 font-medium">歡迎回來，今天想處理哪部分的帳目？</p>
        </header>

        <div class="home-grid">
          
          <Card class="theme-card hover-card cursor-pointer" @click="$router.push('/book')">
            <template #content>
              <div class="flex align-items-center gap-4">
                <div class="icon-box bg-emerald-500/10">
                  <i class="pi pi-pencil text-emerald-500"></i>
                </div>
                <div class="flex-1">
                  <div class="font-black text-xl">前往記帳本</div>
                  <div class="text-xs font-bold opacity-40 uppercase tracking-widest mt-1">Daily Journal</div>
                </div>
                <i class="pi pi-chevron-right opacity-20"></i>
              </div>
            </template>
          </Card>

          <Card class="theme-card hover-card cursor-pointer" @click="$router.push('/chat')">
            <template #content>
              <div class="flex align-items-center gap-4">
                <div class="icon-box bg-blue-500/10">
                  <i class="pi pi-comments text-blue-500"></i>
                </div>
                <div class="flex-1">
                  <div class="font-black text-xl">AI 財務助理</div>
                  <div class="text-xs font-bold opacity-40 uppercase tracking-widest mt-1">AI Assistant</div>
                </div>
                <i class="pi pi-chevron-right opacity-20"></i>
              </div>
            </template>
          </Card>

        </div>

        <div class="mt-8 text-center opacity-20">
          <i class="pi pi-cloud text-2xl"></i>
          <p class="text-xs font-bold mt-2">您的資料已與雲端同步</p>
        </div>
      </div>
    </Transition>
  </div>

  <div v-else class="view-wrapper align-items-center justify-content-center opacity-20">
    <i class="pi pi-lock text-4xl mb-4"></i>
    <h2 class="font-bold">請先登入系統</h2>
  </div>
</template>

<style scoped>
/* 佈局架構 */
.home-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  width: 100%;
}

@media (max-width: 768px) {
  .home-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

/* 頭像與裝飾 */
.avatar-container {
  display: flex;
  justify-content: center;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 35px; /* 呼應 theme-card 的大圓角 */
  border: 4px solid var(--app-card-bg);
  object-fit: cover;
  transition: transform 0.4s ease;
}

.welcome-section:hover .user-avatar {
  transform: scale(1.05) rotate(3deg);
}

/* 捷徑卡片增強 */
.hover-card {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid var(--app-footer-border) !important;
}

.hover-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1) !important;
  border-color: var(--app-primary) !important;
}

.icon-box {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
}

/* 骨架屏修飾 */
.full-page-skeleton {
  padding-top: 3rem;
  width: 100%;
}
</style>