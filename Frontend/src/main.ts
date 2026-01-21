import App from './App.vue'
import router from './router'


import { createLogto, type LogtoConfig } from '@logto/vue';
import { createApp } from 'vue'
import './style.css'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import 'primeicons/primeicons.css';

const config: LogtoConfig = {
  endpoint: 'https://y4spdd.logto.app/',
  appId: '9xw4sbd3iorkwgkzr4pxi',
  // ⚠️ 關鍵：告訴 Logto 我們要呼叫這支 API
  resources: ['https://accountbook.api'], 
  
  // 這是之前設定的 scopes，保持預設即可
  scopes: ['email', 'profile'],
};

const app = createApp(App)
app.use(createLogto, config);
app.use(router)

// 2. 註冊 PrimeVue
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.my-app-dark',
        }
    }
});
// 印出目前的模式與變數
console.log('目前模式:', import.meta.env.MODE);
console.log('目前 API 網址:', import.meta.env.VITE_API_BASE_URL);
app.mount('#app')

