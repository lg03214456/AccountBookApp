<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useLogto } from "@logto/vue"; // 引入 Logto
import { useTheme } from '../composables/useTheme';
import type { ThemeConfig } from '../types/theme';

// PrimeVue 元件
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Divider from 'primevue/divider';
import FileUpload from 'primevue/fileupload';
import Message from 'primevue/message';
import ToggleSwitch from 'primevue/toggleswitch'; // 新增開關組件

// 從你的 useTheme 取得需要的狀態
const { applyTheme, currentTheme, isDarkMode, toggleDarkMode } = useTheme();
const { fetchUserInfo, isAuthenticated } = useLogto();

const userData = ref<any>(null);
const customBgUrl = ref('');
const uploadError = ref('');

// 載入個人資訊
onMounted(async () => {
  if (isAuthenticated.value) {
    try {
      userData.value = await fetchUserInfo();
    } catch (e) {
      console.error("無法取得使用者資訊", e);
    }
  }
});

// --- 1. 七種預設顏色主題 ---
const colorThemes: ThemeConfig[] = [
  { name: '翡翠綠', primary: '#10b981', bgType: 'color', background: '#f0fdf4', textColor: '#064e3b', cardBg: 'rgba(255, 255, 255, 0.8)' },
  { name: '日落橘', primary: '#f59e0b', bgType: 'color', background: '#fffbeb', textColor: '#78350f', cardBg: 'rgba(255, 255, 255, 0.8)' },
  { name: '薰衣草', primary: '#8b5cf6', bgType: 'color', background: '#f5f3ff', textColor: '#4c1d95', cardBg: 'rgba(255, 255, 255, 0.8)' },
  { name: '天空藍', primary: '#0ea5e9', bgType: 'color', background: '#f0f9ff', textColor: '#0c4a6e', cardBg: 'rgba(255, 255, 255, 0.8)' },
  { name: '玫瑰粉', primary: '#f43f5e', bgType: 'color', background: '#fff1f2', textColor: '#881337', cardBg: 'rgba(255, 255, 255, 0.8)' },
  { name: '石板灰', primary: '#64748b', bgType: 'color', background: '#f8fafc', textColor: '#1e293b', cardBg: 'rgba(255, 255, 255, 0.8)' },
  { name: '琥珀金', primary: '#d97706', bgType: 'color', background: '#fffcf0', textColor: '#713f12', cardBg: 'rgba(255, 255, 255, 0.8)' },
];

// --- 2. 預設背景圖片 ---
const presetImages = [
  { name: '極簡森林', url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1000' },
  { name: '寧靜海洋', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000' },
  { name: '都會夜景', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1000' }
];

const handleImageApply = (url: string, sourceName: string) => {
  applyTheme({
    name: sourceName,
    primary: '#ffffff',
    bgType: 'image',
    background: url,
    textColor: '#ffffff',
    cardBg: 'rgba(0, 0, 0, 0.4)'
  });
};

const onFileUpload = (event: any) => {
  const file = event.files[0];
  if (file.size > 2 * 1024 * 1024) {
    uploadError.value = '圖片不能超過 2MB 喔！';
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    handleImageApply(e.target?.result as string, '本地上傳');
    uploadError.value = '';
  };
  reader.readAsDataURL(file);
};
</script>

<template>
  <div class="page-wrapper p-4 fade-in">
    <div class="settings-container">
      <h2 class="font-bold text-2xl mb-4">設定與個性化</h2>

      <Card class="mb-4 theme-card shadow-sm">
        <template #content>
          <div class="flex align-items-center gap-4">
            <div class="avatar-circle">
              <i class="pi pi-user text-2xl"></i>
            </div>
            <div v-if="userData">
              <h3 class="m-0 font-bold text-xl">{{ userData.name || userData.username }}</h3>
              <p class="m-0 text-sm opacity-60">{{ userData.email }}</p>
            </div>
            <div v-else class="opacity-30">載入帳戶資訊中...</div>
          </div>
        </template>
      </Card>

      <Card class="mb-4 theme-card shadow-sm">
        <template #title>
          <div class="flex justify-content-between align-items-center">
            <span>主題與深夜模式</span>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-moon text-sm"></i>
              <ToggleSwitch v-model="isDarkMode" @change="toggleDarkMode" />
            </div>
          </div>
        </template>
        <template #content>
          <p class="text-xs opacity-50 mb-3 uppercase font-bold tracking-wider">選擇純色主題</p>
          <div class="color-grid">
            <div 
              v-for="theme in colorThemes" 
              :key="theme.name"
              class="color-option"
              :style="{ backgroundColor: theme.primary }"
              @click="applyTheme(theme)"
            >
              <i v-if="currentTheme.name === theme.name" class="pi pi-check text-white"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="mb-4 theme-card shadow-sm">
        <template #title>背景圖片設定</template>
        <template #content>
          <div class="image-grid mb-4">
            <div 
              v-for="img in presetImages" 
              :key="img.name"
              class="image-option shadow-sm"
              :style="{ backgroundImage: `url(${img.url}&w=200)` }"
              @click="handleImageApply(img.url, img.name)"
            >
              <span class="img-label">{{ img.name }}</span>
            </div>
          </div>

          <div class="flex flex-column gap-2 mt-4">
            <label class="text-sm font-bold opacity-70">使用圖片網址</label>
            <div class="p-inputgroup flex-1">
                <InputText v-model="customBgUrl" placeholder="https://..." class="p-inputtext-sm" />
                <Button icon="pi pi-check" size="small" @click="handleImageApply(customBgUrl, '自訂網址')" />
            </div>
          </div>
        </template>
      </Card>

      <Card class="theme-card shadow-sm">
        <template #title>本地端上傳</template>
        <template #content>
          <div class="upload-section">
            <FileUpload 
              mode="basic" 
              accept="image/*" 
              :maxFileSize="2000000" 
              @select="onFileUpload" 
              chooseLabel="從電腦挑選圖片"
              class="p-button-outlined p-button-sm w-full"
            />
            <Message v-if="uploadError" severity="error" class="mt-2" size="small">{{ uploadError }}</Message>
            <p class="text-xs text-gray-500 mt-2">支援 JPG/PNG，建議 2MB 以內。</p>
          </div>
        </template>
      </Card>

      <div class="text-center py-6 opacity-20 text-xs">
        <p>Bookkeeping v1.0.6 | 2026</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-container { max-width: 600px; margin: 0 auto; padding-bottom: 80px; }
.theme-card { border-radius: 24px; border: none; background: var(--app-footer-bg); transition: background-color 0.3s; }

/* 個人資訊頭像 */
.avatar-circle {
  width: 60px; height: 60px;
  background: var(--app-primary-faded, #f0f7ff);
  color: var(--app-primary);
  border-radius: 20px;
  display: flex; justify-content: center; align-items: center;
}

/* 顏色選擇 */
.color-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 12px; }
.color-option {
  height: 60px; border-radius: 15px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s ease;
}
.color-option:hover { transform: translateY(-3px) scale(1.05); }

/* 圖片預覽 */
.image-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.image-option {
  aspect-ratio: 1/1; background-size: cover; background-position: center;
  border-radius: 16px; cursor: pointer; position: relative;
  display: flex; align-items: flex-end; overflow: hidden;
  transition: 0.3s;
}
.image-option:hover { filter: brightness(1.1); }
.img-label {
  background: rgba(0,0,0,0.5); color: white; width: 100%;
  font-size: 11px; padding: 5px; text-align: center;
  backdrop-filter: blur(4px);
}
</style>