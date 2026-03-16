import { ref } from 'vue';
import type { ThemeConfig } from '../types/theme';

const currentTheme = ref<ThemeConfig>({
  name: '預設',
  primary: '#00668c',
  bgType: 'color',
  background: '#f8faff',
  textColor: '#0f172a',
  cardBg: 'rgba(255, 255, 255, 0.8)'
});

export function useTheme() {
  // 核心：套用主題到 CSS 變數
  const applyTheme = (theme: ThemeConfig) => {
    currentTheme.value = theme;
    const root = document.documentElement;
    root.style.setProperty('--app-primary', theme.primary);
    root.style.setProperty('--app-text', theme.textColor);
    root.style.setProperty('--app-card-bg', theme.cardBg);

    if (theme.bgType === 'image') {
      root.style.setProperty('--app-bg', `url('${theme.background}')`);
      root.style.setProperty('--bg-size', 'cover');
    } else {
      root.style.setProperty('--app-bg', theme.background);
      root.style.setProperty('--bg-size', 'auto');
    }
    // 儲存到本地，下次進來才不用重設
    localStorage.setItem('user-theme', JSON.stringify(theme));
  };

  // ⭐ 這就是你在 App.vue 呼叫的 initTheme
  const initTheme = () => {
    const saved = localStorage.getItem('user-theme');
    if (saved) {
      applyTheme(JSON.parse(saved));
    } else {
      applyTheme(currentTheme.value); // 沒設定過就用預設
    }
  };

  return { currentTheme, applyTheme, initTheme };
}