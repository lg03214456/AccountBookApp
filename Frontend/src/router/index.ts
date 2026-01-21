// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
// 預先引入你的元件 (等等我們會建立這些檔案)
import AccountingView from '../views/AccountingView.vue'
import ChatView from '../views/ChatView.vue'
import CallbackView from '../views/CallbackView.vue'

const router = createRouter({
  // 使用 HTML5 的歷史模式 (網址不會有 # 符號)
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: AccountingView // 首頁顯示記帳
    },
    {
      path: '/chat',
      name: 'chat',
      component: ChatView // /chat 顯示 AI 對話
    },
    // 2. 加入這條路徑
    {
      path: '/callback',
      name: 'callback',
      component: CallbackView
    }
  ]
})

export default router