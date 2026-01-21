<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

// ⚠️ 關鍵：你的後端網址
// 請確認 Port 號 (5050) 跟你的 dotnet watch run 顯示的一樣
// 假設你的 Controller 路由是 [HttpPost("chat")]，網址就要長這樣：
const baseUrl = import.meta.env.VITE_APP_URL;
const backendUrl = `${baseUrl}/api/gemini/chat`; 

const userMessage = ref('');       // 使用者輸入
const chatHistory = ref<{ role: string, text: string }[]>([]);     // 聊天紀錄
const isLoading = ref(false);      // 載入狀態

const sendMessage = async () => {
  if (!userMessage.value.trim()) return;

  // 1. 紀錄使用者訊息
  const messageToSend = userMessage.value;
  chatHistory.value.push({ role: 'user', text: messageToSend });
  
  // 清空輸入框並顯示載入中
  userMessage.value = '';
  isLoading.value = true;

  try 
  {
    // 2. 呼叫後端 API
    const response = await axios.post(backendUrl, {
      message: messageToSend
    });

    // 3. 接收後端 (Gemini) 的回應
    chatHistory.value.push({ role: 'ai', text: response.data.reply });

  } catch (error) {
    console.error(error);
    chatHistory.value.push({ 
      role: 'error', 
      text: '發生錯誤：無法連線到後端，請檢查 Port 號是否正確，或是 API Key 是否有效。' 
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
    <h1 class="text-3xl font-bold mb-6 text-blue-400">Gemini 測試聊天室</h1>

    <div class="w-full max-w-2xl bg-gray-800 rounded-lg p-6 mb-4 overflow-y-auto border border-gray-700 space-y-4 h-[500px]">
      
      <div v-if="chatHistory.length === 0" class="text-center text-gray-500 mt-20">
        <p>請輸入文字開始測試...</p>
      </div>

      <div v-for="(msg, index) in chatHistory" :key="index" 
           :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">
        
        <div :class="[
          'max-w-[80%] rounded-lg px-4 py-2',
          msg.role === 'user' ? 'bg-blue-600' : 
          msg.role === 'error' ? 'bg-red-600' : 'bg-gray-700'
        ]">
          <span class="font-bold block mb-1 text-xs opacity-70">
            {{ msg.role === 'user' ? 'Me' : msg.role === 'error' ? 'Error' : 'Gemini' }}
          </span>
          {{ msg.text }}
        </div>
      </div>

      <div v-if="isLoading" class="text-gray-400 text-sm animate-pulse">
        Gemini 正在思考中...
      </div>
    </div>

    <div class="w-full max-w-2xl flex gap-2 px-4">
      <input 
        v-model="userMessage" 
        @keyup.enter="sendMessage"
        :disabled="isLoading"
        type="text" 
        placeholder="輸入問題..." 
        class="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
      />
      <button 
        @click="sendMessage" 
        :disabled="isLoading"
        class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-bold disabled:opacity-50"
      >
        發送
      </button>
    </div>
  </div>
</template>