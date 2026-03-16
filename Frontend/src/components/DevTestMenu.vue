<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useLogto } from '@logto/vue';
import axios from 'axios';
import Button from 'primevue/button';

// 從 Logto 取得獲取 Token 的方法
const { getAccessToken } = useLogto();

// 控制選單開關
const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// 點擊外面自動關閉選單
const closeMenu = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.dev-dropdown')) {
    isMenuOpen.value = false;
  }
};

onMounted(() => window.addEventListener('click', closeMenu));
onUnmounted(() => window.removeEventListener('click', closeMenu));

// ==========================================
// 🟢 測試 1：呼叫 .NET 公開 API (還原原始描述)
// ==========================================
const testPublicApi = async () => {
  isMenuOpen.value = false; // 點擊後收起選單
  try {
    const response = await axios.get('http://localhost:5050/api/auth/public');
    alert('🟢 公開 API 呼叫成功！\n後端回應：' + response.data.message);
  } catch (error) {
    console.error('公開 API 呼叫失敗:', error);
    alert('🔴 公開 API 失敗！請按 F12 打開 Console 查看是否為 CORS 錯誤。');
  }
};

// ==========================================
// 🔒 測試 2：呼叫 .NET 私密 API (還原原始描述)
// ==========================================
const testBackendApi = async () => {
  isMenuOpen.value = false; // 點擊後收起選單
  try {
    // 1. 向 Logto 索取要去打 .NET 的 Token
    const token = await getAccessToken('https://accountbook.api'); 
    
    // ⭐ 保留原始的攔截 Log
    console.log("🎟️ 攔截到的 Token 是：", token);
    
    // 2. 用 Axios 呼叫 .NET，並把 Token 塞進 Headers
    const response = await axios.get('http://localhost:5050/api/auth/private', {
      headers: {
        Authorization: `Bearer ${token}` 
      }
    });

    alert('🟢 私密 API 呼叫成功！\n後端回應：' + response.data.message);
    
  } catch (error) {
    console.error('私密 API 呼叫失敗:', error);
    alert('🔴 私密 API 失敗！請按 F12 檢查是 401 授權失敗還是 CORS 錯誤。');
  }
};
</script>

<template>
  <div class="dev-dropdown">
    <Button 
      icon="pi pi-cog" 
      label="開發測試" 
      severity="secondary" 
      class="p-button-sm" 
      @click.stop="toggleMenu" 
    />
    
    <div v-show="isMenuOpen" class="dev-menu-content">
      <div class="menu-header">API 快速測試 (5050)</div>
      
      <button @click="testPublicApi" class="test-item">
        <i class="pi pi-unlock text-green-500"></i>
        <span>測試公開 API (無鎖)</span>
      </button>
      
      <button @click="testBackendApi" class="test-item">
        <i class="pi pi-lock text-yellow-500"></i>
        <span>測試私密 API (有鎖)</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.dev-dropdown {
  position: relative;
  display: inline-block;
}

.dev-menu-content {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: white;
  min-width: 240px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  border-radius: 8px;
  padding: 8px 0;
  z-index: 9999;
  border: 1px solid #e2e8f0;
  margin-top: 8px;
}

.menu-header {
  padding: 10px 16px;
  font-size: 11px;
  font-weight: bold;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #f1f5f9;
}

.test-item {
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #1e293b;
  transition: background 0.2s;
}

.test-item:hover {
  background-color: #f8fafc;
  color: #3b82f6;
}

.text-green-500 { color: #22c55e; }
.text-yellow-500 { color: #eab308; }
</style>