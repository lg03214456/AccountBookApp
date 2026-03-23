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
      console.error("HomeView 抓取失敗", error);
    } finally {
      // 增加一點點人工延遲（約 400ms），確保動畫不會閃爍太快
      setTimeout(() => {
        isLocalLoading.value = false;
      }, 400);
    }
  }
};

onMounted(loadUserData);

watch(isAuthenticated, (newVal) => {
  if (newVal) loadUserData();
}, { immediate: true });
</script>

<template>
  <div class="home-container" v-if="isAuthenticated">
    
    <div v-if="isLocalLoading" class="full-page-skeleton">
      <div class="text-center mb-10">
        <Skeleton shape="circle" size="90px" class="mx-auto mb-4" />
        <Skeleton width="12rem" height="2.5rem" class="mx-auto mb-3" />
        <Skeleton width="18rem" height="1.2rem" class="mx-auto" />
      </div>
      <div class="grid flex flex-column md:flex-row gap-4">
        <Skeleton width="100%" height="100px" border-radius="20px" class="flex-1" />
        <Skeleton width="100%" height="100px" border-radius="20px" class="flex-1" />
      </div>
    </div>

    <Transition name="page-fade" mode="out-in">
      <div v-if="!isLocalLoading" class="welcome-section">
        <section class="text-center mb-10">
          <div v-if="userData?.picture" class="avatar-wrapper mb-4">
            <img :src="userData.picture" alt="avatar" class="user-avatar shadow-4" />
          </div>
          <h1 class="text-4xl font-bold">
            Hi, {{ userData?.name || userData?.username || '記帳高手' }}!
          </h1>
          <p class="text-lg opacity-60 mt-2">歡迎回來，準備好管理今天的帳單了嗎？</p>
        </section>

        <div class="grid flex flex-column md:flex-row gap-4">
          <Card class="flex-1 cursor-pointer hover-card" @click="$router.push('/book')">
            <template #content>
              <div class="flex align-items-center gap-4">
                <div class="icon-circle bg-green-100 dark:bg-green-900/30">
                  <i class="pi pi-pencil text-green-600"></i>
                </div>
                <div class="flex-1">
                  <div class="font-bold text-xl">前往記帳本</div>
                  <div class="text-sm opacity-50">查看與記錄您的日常收支</div>
                </div>
                <i class="pi pi-chevron-right opacity-30"></i>
              </div>
            </template>
          </Card>

          <Card class="flex-1 cursor-pointer hover-card" @click="$router.push('/chat')">
            <template #content>
              <div class="flex align-items-center gap-4">
                <div class="icon-circle bg-blue-100 dark:bg-blue-900/30">
                  <i class="pi pi-comments text-blue-600"></i>
                </div>
                <div class="flex-1">
                  <div class="font-bold text-xl">AI 財務助理</div>
                  <div class="text-sm opacity-50">詢問您的消費趨勢與建議</div>
                </div>
                <i class="pi pi-chevron-right opacity-30"></i>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </Transition>
  </div>

  <div v-else class="text-center py-20 opacity-20">
    <h2>請登入以查看儀表板</h2>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 900px;
  margin: 0 auto;
  min-height: 400px; /* 固定高度防止容器縮放 */
}

/* 骨架屏配置 */
.full-page-skeleton {
    padding-top: 2rem;
}

/* 頭像與內容樣式 */
.user-avatar {
  width: 95px; height: 95px;
  border-radius: 50%;
  border: 4px solid var(--app-footer-bg);
  object-fit: cover;
}
.avatar-wrapper { display: flex; justify-content: center; }

/* 卡片與細節 */
.hover-card {
  border-radius: 24px;
  border: 1px solid var(--app-footer-border);
  background: var(--app-footer-bg);
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}
.hover-card:hover { transform: translateY(-8px); box-shadow: 0 15px 30px rgba(0,0,0,0.08); }

.icon-circle { width: 56px; height: 56px; border-radius: 16px; display: flex; justify-content: center; align-items: center; font-size: 1.6rem; }

/* ⭐ 全頁面淡入動畫 (Transition) */
.page-fade-enter-active {
  transition: all 0.6s ease-out;
}
.page-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.page-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>