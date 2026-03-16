import axios from 'axios';
import { useLogto } from '@logto/vue';

// 1. 建立一個專屬的 axios 實體，設定您的 .NET 後端網址
const apiClient = axios.create({
  baseURL: 'http://localhost:5050', // 這是您 .NET API 的位址
  timeout: 10000,
});

// 2. 建立 Request 攔截器 (出發前攔截)
apiClient.interceptors.request.use(
  async (config) => {
    // 這裡會有一個小挑戰：在 Vue 3 裡，useLogto() 必須在 setup 裡面呼叫
    // 但我們可以把它封裝成一個方法傳進來，或者在呼叫 API 前處理。
    // 為了讓您最快上手，我們在元件裡面這樣用 (見下一步)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;