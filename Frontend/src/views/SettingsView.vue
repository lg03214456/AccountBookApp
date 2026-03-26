<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useLogto } from "@logto/vue";
import { useTheme } from '../composables/useTheme';
import type { ThemeConfig } from '../types/theme';

// 引入裁剪器
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
import SelectButton from 'primevue/selectbutton';

const { applyTheme, currentTheme, isDarkMode, toggleDarkMode } = useTheme();
const { fetchUserInfo, isAuthenticated } = useLogto();

const userData = ref<any>(null);
const customBgUrl = ref('');
const uploadError = ref('');

// --- 裁剪相關狀態 ---
const isCropDialogVisible = ref(false);
const imageToCrop = ref('');
const cropperRef = ref(); 

const aspectOptions = ref([
  { label: '橫向 16:9', value: 16/9 },
  { label: '直向 9:16', value: 9/16 },
  { label: '自由比例', value: 0 }
]);
const selectedAspect = ref(16/9);

onMounted(async () => {
  if (isAuthenticated.value) {
    try {
      userData.value = await fetchUserInfo();
    } catch (e) {
      console.error("無法取得使用者資訊", e);
    }
  }
});

// --- 1. 主題配色 ---
const colorThemes: ThemeConfig[] = [
  { name: '翡翠綠', primary: '#10b981', bgType: 'color', background: '#f0fdf4', textColor: '#064e3b', cardBg: 'rgba(255, 255, 255, 0.8)' },
  { name: '日落橘', primary: '#f59e0b', bgType: 'color', background: '#fffbeb', textColor: '#78350f', cardBg: 'rgba(255, 255, 255, 0.8)' },
  { name: '薰衣草', primary: '#8b5cf6', bgType: 'color', background: '#f5f3ff', textColor: '#4c1d95', cardBg: 'rgba(255, 255, 255, 0.8)' },
  { name: '天空藍', primary: '#0ea5e9', bgType: 'color', background: '#f0f9ff', textColor: '#0c4a6e', cardBg: 'rgba(255, 255, 255, 0.8)' },
  { name: '玫瑰粉', primary: '#f43f5e', bgType: 'color', background: '#fff1f2', textColor: '#881337', cardBg: 'rgba(255, 255, 255, 0.8)' },
  { name: '石板灰', primary: '#64748b', bgType: 'color', background: '#f8fafc', textColor: '#1e293b', cardBg: 'rgba(255, 255, 255, 0.8)' },
  { name: '琥珀金', primary: '#d97706', bgType: 'color', background: '#fffcf0', textColor: '#713f12', cardBg: 'rgba(255, 255, 255, 0.8)' },
];

// --- 2. 預設圖片 ---
const presetImages = [
  { name: '極簡森林', url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1000' },
  { name: '寧靜海洋', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000' },
  { name: '都會夜景', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1000' }
];

const handleImageApply = (url: string, sourceName: string) => {
  applyTheme({
    ...currentTheme.value,
    name: sourceName,
    bgType: 'image',
    background: url,
    textColor: '#ffffff', 
  });
};

const onFileUpload = (event: any) => {
  const file = event.files[0];
  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = '檔案太大了（上限 5MB）';
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    imageToCrop.value = e.target?.result as string;
    isCropDialogVisible.value = true;
    uploadError.value = '';
  };
  reader.readAsDataURL(file);
};

const applyExternalUrl = () => {
  if (!customBgUrl.value) return;
  imageToCrop.value = customBgUrl.value;
  isCropDialogVisible.value = true;
};

const rotateLeft = () => cropperRef.value.rotate(-90);
const rotateRight = () => cropperRef.value.rotate(90);

const cropAndSave = () => {
  const { canvas } = cropperRef.value.getResult();
  if (canvas) {
    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.8); 
    handleImageApply(croppedBase64, '裁剪後的桌布');
    isCropDialogVisible.value = false;
  }
};
</script>

<template>
  <div class="view-wrapper">
    
    <header class="view-header">
      <h1 class="view-title">個性化設定</h1>
      <span class="section-label px-1">PREFERENCES</span>
    </header>

    <main class="settings-layout">
      <Card class="theme-card mb-5 border-none">
        <template #content>
          <div class="flex align-items-center gap-5">
            <div class="avatar-container shadow-lg">
              <img v-if="userData?.picture" :src="userData.picture" alt="avatar" class="w-full h-full object-cover" />
              <div v-else class="flex align-items-center justify-content-center h-full w-full">
                <i class="pi pi-user text-3xl opacity-30"></i>
              </div>
            </div>
            <div v-if="userData" class="flex-1">
              <h3 class="m-0 font-black text-2xl tracking-tight">{{ userData.name || userData.username }}</h3>
              <p class="m-0 text-sm font-bold opacity-40 mt-1">{{ userData.email }}</p>
            </div>
            <div v-else class="opacity-20 italic">Loading Profile...</div>
          </div>
        </template>
      </Card>

      <Card class="theme-card mb-5 border-none">
        <template #title>
          <div class="flex justify-content-between align-items-center w-full">
            <span class="text-xl font-black">介面外觀</span>
            <div class="flex align-items-center gap-3 bg-black-alpha-5 p-2 px-3 border-round-2xl">
              <i :class="['pi', isDarkMode ? 'pi-moon text-indigo-400' : 'pi-sun text-amber-500']"></i>
              <ToggleSwitch :modelValue="isDarkMode" @update:modelValue="toggleDarkMode" />
            </div>
          </div>
        </template>
        <template #content>
          <p class="section-label mb-4 px-1">Color Palette</p>
          <div class="color-grid">
            <div 
              v-for="theme in colorThemes" :key="theme.name"
              class="color-option-box"
              :class="{ 'active': currentTheme.name === theme.name && currentTheme.bgType === 'color' }"
              :style="{ backgroundColor: theme.primary }"
              @click="applyTheme(theme)"
            >
              <i v-if="currentTheme.name === theme.name && currentTheme.bgType === 'color'" class="pi pi-check text-white text-xs"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="theme-card mb-8 border-none">
        <template #title><span class="text-xl font-black">桌布設定</span></template>
        <template #content>
          <p class="section-label mb-4 px-1">Preset Wallpapers</p>
          <div class="image-grid mb-5">
            <div 
              v-for="img in presetImages" :key="img.name"
              class="wallpaper-item shadow-sm"
              :class="{ 'active': currentTheme.background === img.url }"
              :style="{ backgroundImage: `url(${img.url}&w=300)` }"
              @click="handleImageApply(img.url, img.name)"
            >
              <div class="wallpaper-overlay">
                <span class="text-xs font-black">{{ img.name }}</span>
                <i v-if="currentTheme.background === img.url" class="pi pi-check-circle ml-2"></i>
              </div>
            </div>
          </div>

          <p class="section-label mb-3 px-1">Custom Upload & URL</p>
          <div class="flex flex-column gap-3">
            <FileUpload 
              mode="basic" accept="image/*" :maxFileSize="5000000" @select="onFileUpload" 
              chooseLabel="挑選圖片並裁剪" class="p-button-outlined p-button-sm w-full font-black border-round-2xl"
            />
            
            <div class="p-inputgroup">
              <span class="p-inputgroup-addon bg-black-alpha-5 border-none border-round-left-2xl">
                <i class="pi pi-link opacity-40"></i>
              </span>
              <InputText v-model="customBgUrl" placeholder="貼上圖片網址..." class="p-inputtext-sm modern-input" />
              <Button icon="pi pi-scissors" @click="applyExternalUrl" class="border-round-right-2xl" />
            </div>
            <Message v-if="uploadError" severity="error" variant="simple" size="small">{{ uploadError }}</Message>
          </div>
        </template>
      </Card>

      <div class="text-center py-6 opacity-20">
        <p class="text-xs font-black tracking-widest">SYSTEM CORE v1.0.6</p>
      </div>
    </main>

    <Dialog 
      v-model:visible="isCropDialogVisible" 
      header="調整桌布比例" 
      modal 
      class="modern-dialog"
      :style="{ width: '92vw', maxWidth: '700px' }"
    >
      <div class="p-2">
        <div class="flex flex-column align-items-center mb-4 gap-3">
          <SelectButton 
            v-model="selectedAspect" 
            :options="aspectOptions" 
            optionLabel="label" 
            optionValue="value" 
            class="compact-aspect-selector"
          />
        </div>

        <div class="cropper-wrapper shadow-2">
          <Cropper
            ref="cropperRef"
            class="cropper-box"
            :src="imageToCrop"
            :stencil-props="{
              aspectRatio: selectedAspect || null,
              movable: true, resizable: true
            }"
          />
        </div>

        <div class="flex justify-content-center gap-5 mt-4">
          <Button icon="pi pi-replay" label="向左旋轉" variant="text" severity="secondary" @click="rotateLeft" class="font-bold" />
          <Button icon="pi pi-refresh" label="向右旋轉" variant="text" severity="secondary" @click="rotateRight" class="font-bold" />
        </div>

        <div class="flex justify-content-end gap-3 mt-6 pt-4 border-top-1 border-white-alpha-10">
          <Button label="取消" variant="text" severity="secondary" @click="isCropDialogVisible = false" />
          <Button label="套用裁剪" icon="pi pi-check" @click="cropAndSave" class="font-black border-round-xl px-5 shadow-2" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.settings-layout { max-width: 700px; margin: 0 auto; width: 100%; }

/* 頭像裝飾 */
.avatar-container {
  width: 85px; height: 85px;
  border-radius: 28px;
  background: var(--app-bg);
  border: 4px solid var(--app-card-bg);
  overflow: hidden;
  transition: transform 0.3s ease;
}
.avatar-container:hover { transform: scale(1.05) rotate(-3deg); }

/* 配色網格 */
.color-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 12px; }
.color-option-box { 
  height: 54px; border-radius: 16px; cursor: pointer; 
  display: flex; align-items: center; justify-content: center;
  border: 3px solid transparent; transition: 0.2s;
}
.color-option-box.active { border-color: white; box-shadow: 0 0 0 3px var(--app-primary); transform: translateY(-2px); }

/* 桌布選項 */
.image-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.wallpaper-item {
  aspect-ratio: 16/10; background-size: cover; background-position: center;
  border-radius: 18px; cursor: pointer; position: relative; overflow: hidden;
  border: 3px solid transparent; transition: 0.3s;
}
.wallpaper-item.active { border-color: var(--app-primary); transform: scale(1.02); }
.wallpaper-overlay {
  position: absolute; bottom: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%);
  display: flex; align-items: flex-end; justify-content: center; padding: 8px;
  color: white; opacity: 0.8;
}

/* 裁剪區域 */
.cropper-wrapper { width: 100%; height: 420px; border-radius: 20px; overflow: hidden; background: #000; }
.cropper-box { width: 100%; height: 100%; }

/* 下拉與輸入 */
.modern-input { background: rgba(var(--app-primary-rgb), 0.05) !important; border: none !important; border-radius: 14px !important; font-weight: 700 !important; }
:deep(.compact-aspect-selector .p-button) { font-size: 0.75rem; font-weight: 800; padding: 0.5rem 1rem; }

@media (max-width: 768px) {
  .image-grid { grid-template-columns: repeat(2, 1fr); }
  .cropper-wrapper { height: 320px; }
}
</style>