<script setup lang="ts">
import { ref } from 'vue';
import { useTheme } from '../composables/useTheme';
import type { ThemeConfig } from '../types/theme';

// PrimeVue 元件
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Divider from 'primevue/divider';
import FileUpload from 'primevue/fileupload';
import Message from 'primevue/message';

const { applyTheme, currentTheme } = useTheme();
const customBgUrl = ref('');
const uploadError = ref('');

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

// 通用的圖片套用邏輯
const handleImageApply = (url: string, sourceName: string) => {
  applyTheme({
    name: sourceName,
    primary: '#ffffff',
    bgType: 'image',
    background: url,
    textColor: '#ffffff',
    cardBg: 'rgba(0, 0, 0, 0.4)' // 圖片背景使用深色透明卡片，文字較清晰
  });
};

// --- 3. 處理本地檔案上傳 ---
const onFileUpload = (event: any) => {
  const file = event.files[0];
  if (file.size > 2 * 1024 * 1024) {
    uploadError.value = '圖片不能超過 2MB 喔！';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64String = e.target?.result as string;
    handleImageApply(base64String, '本地上傳');
    uploadError.value = '';
  };
  reader.readAsDataURL(file);
};
</script>

<template>
  <div class="page-wrapper p-4">
    <div class="settings-container">
      <h2 class="font-bold text-2xl mb-4">個性化設定</h2>

      <Card class="mb-4 theme-card">
        <template #title>選擇純色主題</template>
        <template #content>
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

      <Card class="mb-4 theme-card">
        <template #title>背景圖片設定</template>
        <template #content>
          <div class="image-grid mb-4">
            <div 
              v-for="img in presetImages" 
              :key="img.name"
              class="image-option"
              :style="{ backgroundImage: `url(${img.url}&w=200)` }"
              @click="handleImageApply(img.url, img.name)"
            >
              <span class="img-label">{{ img.name }}</span>
            </div>
          </div>

          <div class="flex flex-column gap-2 mt-4">
            <label class="text-sm font-bold">使用圖片網址</label>
            <div class="p-inputgroup flex-1">
                <InputText v-model="customBgUrl" placeholder="https://..." />
                <Button icon="pi pi-check" @click="handleImageApply(customBgUrl, '自訂網址')" />
            </div>
          </div>
        </template>
      </Card>

      <Card class="theme-card">
        <template #title>本地端上傳</template>
        <template #content>
          <div class="upload-section">
            <FileUpload 
              mode="basic" 
              accept="image/*" 
              :maxFileSize="2000000" 
              @select="onFileUpload" 
              chooseLabel="從電腦挑選圖片"
              class="p-button-outlined w-full"
            />
            <Message v-if="uploadError" severity="error" class="mt-2" size="small">{{ uploadError }}</Message>
            <p class="text-xs text-gray-500 mt-2">支援 JPG/PNG，建議大小 2MB 以內以確保載入速度。</p>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.settings-container { max-width: 600px; margin: 0 auto; }
.theme-card { border-radius: 20px; border: none; }

/* 顏色選擇 */
.color-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 12px; }
.color-option {
  height: 60px; border-radius: 15px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.2s;
}
.color-option:hover { transform: scale(1.05); }

/* 圖片預覽 */
.image-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.image-option {
  aspect-ratio: 16/9; background-size: cover; background-position: center;
  border-radius: 12px; cursor: pointer; position: relative;
  display: flex; align-items: flex-end; overflow: hidden;
}
.img-label {
  background: rgba(0,0,0,0.6); color: white; width: 100%;
  font-size: 11px; padding: 4px; text-align: center;
}
</style>