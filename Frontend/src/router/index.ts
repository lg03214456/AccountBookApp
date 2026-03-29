// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
// 預先引入你的元件 (等等我們會建立這些檔案)
import AccountingView from "../views/AccountingView.vue";
import ChatView from "../views/ChatView.vue";
import CallbackView from "../views/CallbackView.vue";
import SettingsView from "../views/SettingsView.vue";
import HomeView from "../views/HomeView.vue";
import AccountsView from "../views/AccountsView.vue";
import StatsView from "../views/StatsView.vue";
import PlansView from "../views/PlansView.vue";

const router = createRouter({
  // 使用 HTML5 的歷史模式 (網址不會有 # 符號)
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView, // 首頁顯示記帳
    },
    { path: "/book", name: "accounting", component: AccountingView }, // ⭐ 這裡才是功能頁
    {
      path: "/accounts",
      name: "accounts",
      // 建議使用懶加載
      component: AccountsView,
    },
    {
      path: "/stats",
      name: "stats",
      component: StatsView,
    },
    {
      path: "/chat",
      name: "chat",
      component: ChatView, // /chat 顯示 AI 對話
    },
    // 2. 加入這條路徑
    {
      path: "/callback",
      name: "callback",
      component: CallbackView,
    },
    {
      path: "/settings",
      name: "settings",
      component: SettingsView,
    },
    {
      path: "/plans",
      name: "plans",
      component: PlansView
    },
  ],
});

export default router;
