import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 自動根據環境切換網址
  headers: { 'Content-Type': 'application/json' }
});

export default api;