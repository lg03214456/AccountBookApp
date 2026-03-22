import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Logto 相關
import { createLogto, type LogtoConfig, UserScope } from '@logto/vue';

// PrimeVue 相關
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import 'primeicons/primeicons.css';

// 全域樣式
import './style.css'
import './assets/main.css'; 

// 1. 統一 Logto 設定
const logtoConfig: LogtoConfig = {
  endpoint: 'https://y4spdd.logto.app/',
  appId: '9xw4sbd3iorkwgkzr4pxi',
  resources: ['https://accountbook.api'], 
  scopes: [
    UserScope.Email,
    UserScope.Profile
  ],
};

const app = createApp(App)

// 2. 註冊外掛程式 (注意順序)
app.use(createLogto, logtoConfig);
app.use(router)

// 3. 註冊 PrimeVue
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      // 🟢 修改這裡，確保與 CSS 類別一致
      darkModeSelector: '.dark-mode',
    }
  }
});

// 印出目前的模式與變數 (除錯用)
console.log('🚀 目前模式:', import.meta.env.MODE);
console.log('🌐 目前 API 網址:', import.meta.env.VITE_API_BASE_URL);

app.mount('#app')