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
      // 提供平滑的骨架屏轉場
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

// 導覽配置表：方便管理顏色與圖標
const navLinks = [
  { label: '前往記帳本', sub: 'Daily Journal', icon: 'pi-pencil', color: 'bg-emerald-500', path: '/book' },
  { label: 'AI 財務助理', sub: 'AI Assistant', icon: 'pi-comments', color: 'bg-blue-500', path: '/chat' },
  { label: '資產帳戶', sub: 'Accounts', icon: 'pi-briefcase', color: 'bg-purple-500', path: '/accounts' },
  { label: '支出計畫', sub: 'Plans', icon: 'pi-flag', color: 'bg-orange-500', path: '/plans' },
  { label: '統計分析', sub: 'Statistics', icon: 'pi-chart-pie', color: 'bg-rose-500', path: '/stats' },
  { label: '系統設定', sub: 'Settings', icon: 'pi-cog', color: 'bg-slate-500', path: '/settings' },
];
</script>

<template>
  <div class="view-wrapper" v-if="isAuthenticated">
    
    <div v-if="isLocalLoading" class="full-page-skeleton">
      <div class="text-center mb-8">
        <Skeleton shape="circle" size="90px" class="mx-auto mb-4" />
        <Skeleton width="12rem" height="2.5rem" class="mx-auto mb-3" />
        <Skeleton width="18rem" height="1.2rem" class="mx-auto" />
      </div>
      <div class="home-grid">
        <Skeleton v-for="i in 6" :key="i" width="100%" height="110px" class="border-round-3xl" />
      </div>
    </div>

    <Transition name="fade-up">
      <div v-if="!isLocalLoading">
        
        <header class="welcome-section text-center mb-10 mt-4">
          <div class="avatar-container mb-4">
            <img :src="userData?.picture || 'https://ui-avatars.com/api/?background=random&name=' + (userData?.name || 'User')" 
                 alt="avatar" class="user-avatar shadow-lg" />
          </div>
          <h1 class="text-4xl font-black tracking-tight">
            Hi, {{ userData?.name || userData?.username || '記帳高手' }}!
          </h1>
          <p class="text-lg opacity-50 mt-2 font-medium">今天想處理哪部分的帳目？</p>
        </header>

        <div class="home-grid">
          <Card v-for="link in navLinks" 
                :key="link.path" 
                class="theme-card hover-card cursor-pointer" 
                @click="$router.push(link.path)">
            <template #content>
              <div class="flex align-items-center gap-4">
                <div :class="['icon-box', link.color + '10']">
                  <i :class="['pi', link.icon, link.color.replace('bg-', 'text-')]"></i>
                </div>
                <div class="flex-1">
                  <div class="font-black text-xl">{{ link.label }}</div>
                  <div class="text-xs font-bold opacity-40 uppercase tracking-widest mt-1">{{ link.sub }}</div>
                </div>
                <i class="pi pi-chevron-right opacity-20"></i>
              </div>
            </template>
          </Card>
        </div>

        <div class="mt-12 text-center opacity-20">
          <i class="pi pi-cloud text-2xl"></i>
          <p class="text-xs font-bold mt-2 tracking-widest uppercase">Cloud Sync Active</p>
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
/* 佈局架構：改為網格佈局 */
.home-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .home-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0 0.5rem;
  }
}

/* 頭像裝飾 */
.avatar-container {
  display: flex;
  justify-content: center;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 32px;
  border: 4px solid var(--app-card-bg);
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.welcome-section:hover .user-avatar {
  transform: scale(1.1) rotate(5deg);
}

/* 卡片互動增強 */
.hover-card {
  transition: all 0.3s ease;
  border: 1px solid var(--app-footer-border) !important;
  border-radius: 24px !important;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.1) !important;
  border-color: var(--app-primary) !important;
  background-color: var(--app-header-bg);
}

/* 圖標容器細節 */
.icon-box {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.4rem;
}

/* 各色背景透明度處理 (Tailwind 類比) */
.bg-emerald-50010 { background: rgba(16, 185, 129, 0.1); }
.bg-blue-50010 { background: rgba(59, 130, 246, 0.1); }
.bg-purple-50010 { background: rgba(168, 85, 247, 0.1); }
.bg-orange-50010 { background: rgba(249, 115, 22, 0.1); }
.bg-rose-50010 { background: rgba(244, 63, 94, 0.1); }
.bg-slate-50010 { background: rgba(100, 116, 139, 0.1); }

/* 骨架屏 */
.full-page-skeleton {
  padding-top: 2rem;
  width: 100%;
}
</style>