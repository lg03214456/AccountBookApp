<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useLogto } from "@logto/vue";
import { useTheme } from '../composables/useTheme';
import type { ThemeConfig } from '../types/theme';

// 引入裁剪器組件與樣式
import { Cropper } from 'vue-advanced-cropper';
import "vue-advanced-cropper/dist/style.css";
// PrimeVue 元件
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import FileUpload from 'primevue/fileupload';
import Message from 'primevue/message';
import ToggleSwitch from 'primevue/toggleswitch';
import Dialog from 'primevue/dialog';

const { applyTheme, currentTheme, isDarkMode, toggleDarkMode } = useTheme();
const { fetchUserInfo, isAuthenticated } = useLogto();

const userData = ref<any>(null);
const customBgUrl = ref('');
const uploadError = ref('');

// --- 裁剪相關狀態 ---
const isCropDialogVisible = ref(false);
const imageToCrop = ref(''); // 準備被裁剪的原圖
const cropperRef = ref();    // 引用裁剪器實例

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

// --- 2. 預設背景圖片 (直接套用，不需裁剪) ---
const presetImages = [
  { name: '極簡森林', url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1000' },
  { name: '寧靜海洋', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000' },
  { name: '都會夜景', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1000' }
];

// ⭐ 套用背景邏輯
const handleImageApply = (url: string, sourceName: string) => {
  applyTheme({
    ...currentTheme.value,
    name: sourceName,
    bgType: 'image',
    background: url,
    textColor: '#ffffff', 
  });
};

// ⭐ 圖片上傳觸發：開啟裁剪視窗
const onFileUpload = (event: any) => {
  const file = event.files[0];
  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = '圖片太大囉！請選擇 5MB 以內的檔案。';
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    imageToCrop.value = e.target?.result as string;
    isCropDialogVisible.value = true; // 開啟裁剪視窗
    uploadError.value = '';
  };
  reader.readAsDataURL(file);
};

// ⭐ 外部網址觸發：開啟裁剪視窗
const applyExternalUrl = () => {
  if (!customBgUrl.value) return;
  imageToCrop.value = customBgUrl.value;
  isCropDialogVisible.value = true;
};

// ⭐ 執行裁剪並儲存
const cropAndSave = () => {
  const { canvas } = cropperRef.value.getResult();
  if (canvas) {
    // 轉為 Base64 並壓縮品質
    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.8); 
    handleImageApply(croppedBase64, '裁剪後的桌布');
    isCropDialogVisible.value = false;
  }
};
</script>

<template>
  <div class="view-wrapper fade-in">
    
    <header class="view-header">
      <h1 class="view-title">個性化設定</h1>
      <div class="header-tag opacity-50 text-xs font-bold uppercase tracking-widest">Preferences</div>
    </header>

    <main class="view-content settings-layout">
      <Card class="mb-4 theme-card shadow-sm border-none">
        <template #content>
          <div class="flex align-items-center gap-4">
            <div class="avatar-circle overflow-hidden shadow-2">
              <img v-if="userData?.picture" :src="userData.picture" alt="avatar" class="w-full h-full object-cover" />
              <i v-else class="pi pi-user text-2xl"></i>
            </div>
            <div v-if="userData">
              <h3 class="m-0 font-black text-xl">{{ userData.name || userData.username }}</h3>
              <p class="m-0 text-sm font-bold opacity-50">{{ userData.email }}</p>
            </div>
            <div v-else class="opacity-30 italic">載入帳戶資訊中...</div>
          </div>
        </template>
      </Card>

      <Card class="mb-4 theme-card shadow-sm border-none">
        <template #title>
          <div class="flex justify-content-between align-items-center">
            <span class="text-xl font-black">介面外觀</span>
            <div class="flex align-items-center gap-3">
              <i :class="['pi', isDarkMode ? 'pi-moon text-primary' : 'pi-sun text-yellow-500']"></i>
              <ToggleSwitch :modelValue="isDarkMode" @update:modelValue="toggleDarkMode" />
            </div>
          </div>
        </template>
        <template #content>
          <p class="text-xs font-black opacity-40 mb-3 uppercase tracking-widest">Color Themes</p>
          <div class="color-grid">
            <div 
              v-for="theme in colorThemes" 
              :key="theme.name"
              class="color-option"
              :class="{ 'active-selection': currentTheme.name === theme.name && currentTheme.bgType === 'color' }"
              :style="{ backgroundColor: theme.primary }"
              @click="applyTheme(theme)"
            >
              <i v-if="currentTheme.name === theme.name && currentTheme.bgType === 'color'" class="pi pi-check text-white"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="mb-4 theme-card shadow-sm border-none">
        <template #title><span class="text-xl font-black">桌布設定</span></template>
        <template #content>
          <p class="text-xs font-black opacity-40 mb-3 uppercase tracking-widest">Preset Wallpapers</p>
          <div class="image-grid mb-4">
            <div 
              v-for="img in presetImages" 
              :key="img.name"
              class="image-option shadow-sm"
              :class="{ 'active-img-selection': currentTheme.background === img.url }"
              :style="{ backgroundImage: `url(${img.url}&w=200)` }"
              @click="handleImageApply(img.url, img.name)"
            >
              <div v-if="currentTheme.background === img.url" class="img-check">
                <i class="pi pi-check-circle text-white text-xl"></i>
              </div>
              <span class="img-label">{{ img.name }}</span>
            </div>
          </div>

          <div class="flex flex-column gap-2 mt-4">
            <label class="text-xs font-black opacity-40 uppercase tracking-widest">Image URL (貼上後將進入裁剪)</label>
            <div class="p-inputgroup flex-1">
                <InputText v-model="customBgUrl" placeholder="https://..." class="p-inputtext-sm border-round-left-xl" />
                <Button icon="pi pi-scissors" @click="applyExternalUrl" class="border-round-right-xl" />
            </div>
          </div>
        </template>
      </Card>

      <Card class="theme-card shadow-sm border-none mb-6">
        <template #title><span class="text-xl font-black">自定義上傳</span></template>
        <template #content>
          <div class="upload-section">
            <FileUpload 
              mode="basic" 
              accept="image/*" 
              :maxFileSize="5000000" 
              @select="onFileUpload" 
              chooseLabel="挑選電腦中的圖片並裁剪"
              class="p-button-outlined p-button-sm w-full font-bold border-round-xl"
            />
            <Message v-if="uploadError" severity="error" class="mt-2" size="small">{{ uploadError }}</Message>
            <p class="text-xs font-bold opacity-30 mt-3 text-center">支援 JPG/PNG。裁剪後系統會自動優化檔案大小。</p>
          </div>
        </template>
      </Card>

      <div class="text-center py-4 opacity-20 text-xs font-bold">
        <p>BOOKKEEPING CLOUD CORE | v1.0.6</p>
      </div>
    </main>

    <Dialog 
      v-model:visible="isCropDialogVisible" 
      header="調整桌布顯示區域" 
      modal 
      class="crop-dialog"
      :style="{ width: '90vw', maxWidth: '650px' }"
      :breakpoints="{ '960px': '95vw' }"
    >
      <div class="cropper-container">
        <Cropper
          ref="cropperRef"
          class="cropper-box"
          :src="imageToCrop"
          :stencil-props="{
            aspectRatio: 16/9,
            movable: true,
            resizable: true
          }"
          image-class="cropper-image"
        />
      </div>

      <div class="flex justify-content-end gap-2 mt-4">
        <Button label="取消" severity="secondary" text @click="isCropDialogVisible = false" />
        <Button label="確認截圖並套用" icon="pi pi-check" @click="cropAndSave" class="font-bold border-round-xl" />
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.settings-layout { max-width: 650px; margin: 0 auto; }

/* 個人資訊 */
.avatar-circle { width: 70px; height: 70px; background: rgba(var(--app-primary-rgb), 0.1); color: var(--app-primary); border-radius: 22px; display: flex; justify-content: center; align-items: center; }

/* 顏色選擇 */
.color-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(65px, 1fr)); gap: 14px; }
.color-option { height: 60px; border-radius: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); border: 4px solid transparent; }
.color-option:hover { transform: translateY(-4px); }
.active-selection { border-color: rgba(255,255,255,0.3); box-shadow: 0 0 0 3px var(--app-primary); }

/* 圖片預覽 */
.image-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.image-option { aspect-ratio: 16/10; background-size: cover; background-position: center; border-radius: 20px; cursor: pointer; position: relative; display: flex; align-items: flex-end; overflow: hidden; transition: 0.3s cubic-bezier(0.165, 0.84, 0.44, 1); }
.image-option:hover { transform: scale(1.05); }
.active-img-selection { outline: 3px solid var(--app-primary); outline-offset: 3px; }
.img-check { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(var(--app-primary-rgb), 0.3); display: flex; justify-content: center; align-items: center; }
.img-label { background: rgba(0,0,0,0.6); color: white; width: 100%; font-size: 11px; padding: 7px; text-align: center; backdrop-filter: blur(10px); font-weight: 800; }

/* 🎨 裁剪器專屬樣式 */
.cropper-container {
  width: 100%;
  height: 450px;
  background: #111;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cropper-box {
  width: 100%;
  height: 100%;
}

@media (max-width: 768px) {
  .cropper-container { height: 300px; }
}
</style>