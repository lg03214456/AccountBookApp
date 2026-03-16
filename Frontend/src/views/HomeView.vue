<script setup lang="ts">
import { useLogto } from "@logto/vue";
import { ref, watch, onMounted } from "vue";
import Card from 'primevue/card';

const { isAuthenticated, fetchUserInfo } = useLogto();
const userData = ref<any>(null);

const loadUserData = async () => {
  if (isAuthenticated.value) {
    try {
      userData.value = await fetchUserInfo();
    } catch (error) {
      console.error("HomeView 抓取失敗", error);
    }
  }
};

onMounted(loadUserData);

// ⭐ 關鍵：監控登入狀態，確保從 Google 回來後名字能立刻顯示
watch(isAuthenticated, (newVal) => {
  if (newVal) loadUserData();
}, { immediate: true });
</script>

<template>
  <div class="welcome-section" v-if="isAuthenticated">
    <section class="text-center mb-10 fade-in">
      <div v-if="userData?.picture" class="avatar-wrapper mb-4">
        <img :src="userData.picture" alt="avatar" class="user-avatar" />
      </div>
      <h1 class="text-4xl font-bold">
        Hi, {{ userData?.name || userData?.username || '使用者' }}!
      </h1>
      <p class="text-lg opacity-60 mt-2">歡迎回來，準備好管理今天的帳單了嗎？</p>
    </section>

    <div class="grid flex flex-column md:flex-row gap-4">
      <Card class="flex-1 cursor-pointer hover-card" @click="$router.push('/book')">
        <template #content>
          <div class="flex align-items-center gap-4">
            <div class="icon-circle bg-green-100">
              <i class="pi pi-pencil text-green-600"></i>
            </div>
            <div>
              <div class="font-bold text-xl">前往記帳本</div>
              <div class="text-sm opacity-50">查看與記錄您的日常收支</div>
            </div>
          </div>
        </template>
      </Card>

      <Card class="flex-1 cursor-pointer hover-card" @click="$router.push('/chat')">
        <template #content>
          <div class="flex align-items-center gap-4">
            <div class="icon-circle bg-blue-100">
              <i class="pi pi-comments text-blue-600"></i>
            </div>
            <div>
              <div class="font-bold text-xl">AI 財務助理</div>
              <div class="text-sm opacity-50">詢問您的消費趨勢與建議</div>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>

  <div v-else class="text-center py-20 opacity-20">
    <h2>請登入以查看儀表板</h2>
  </div>
</template>

<style scoped>
.welcome-section {
  max-width: 900px;
  margin: 0 auto;
}

/* 頭像樣式 */
.user-avatar {
  width: 90px; height: 90px;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  object-fit: cover;
}
.avatar-wrapper { display: flex; justify-content: center; }

/* 卡片樣式 */
.hover-card {
  border-radius: 16px;
  border: 1px solid rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}
.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
}

.icon-circle {
  width: 50px; height: 50px;
  border-radius: 12px;
  display: flex; justify-content: center; align-items: center;
  font-size: 1.5rem;
}

.fade-in {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>