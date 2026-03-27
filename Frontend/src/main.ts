import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Logto 相關
import { createLogto, type LogtoConfig, UserScope } from '@logto/vue';

// PrimeVue 相關
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice'; // 吐司服務
import Aura from '@primevue/themes/aura';
import 'primeicons/primeicons.css';

// 全域樣式
import './style.css'
import './assets/main.css'; 

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

// 1. 先註冊核心外掛
app.use(router)
app.use(createLogto, logtoConfig)

// 2. 註冊 PrimeVue 核心
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.dark-mode',
    }
  }
});

// 3. ⭐ 務必在 PrimeVue 之後註冊 Service
app.use(ToastService)

app.mount('#app')
