/// <reference types="vite/client" />

// ⭐ 加入這段，讓 TS 認得 .vue 檔案
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}