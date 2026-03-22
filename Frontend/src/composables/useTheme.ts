import { ref } from 'vue';
import type { ThemeConfig } from '../types/theme';

const currentTheme = ref<ThemeConfig>({
  name: '預設', primary: '#00668c', bgType: 'color', background: '#f8faff', textColor: '#0f172a', cardBg: 'rgba(255, 255, 255, 0.8)'
});

const isDarkMode = ref(localStorage.getItem('is-dark-mode') === 'true');

export function useTheme() {
  const applyTheme = (theme: ThemeConfig) => {
    currentTheme.value = theme;
    const root = document.documentElement;

    if (isDarkMode.value) {
      root.classList.add('dark-mode');
      root.style.setProperty('--app-bg', '#0f172a');
      root.style.setProperty('--app-footer-bg', '#1e293b');
      root.style.setProperty('--app-text', '#f1f5f9');
    } else {
      root.classList.remove('dark-mode');
      root.style.setProperty('--app-footer-bg', '#ffffff');
      root.style.setProperty('--app-text', theme.textColor);
      
      if (theme.bgType === 'image') {
        root.style.setProperty('--app-bg', `url('${theme.background}')`);
      } else {
        root.style.setProperty('--app-bg', theme.background);
      }
    }
    root.style.setProperty('--app-primary', theme.primary);
    
    localStorage.setItem('user-theme', JSON.stringify(theme));
    localStorage.setItem('is-dark-mode', isDarkMode.value.toString());
  };

  // ⚡ 修正：不再執行 !isDarkMode.value，直接套用目前的狀態
  const toggleDarkMode = () => {
    applyTheme(currentTheme.value);
  };

  const initTheme = () => {
    const saved = localStorage.getItem('user-theme');
    const theme = saved ? JSON.parse(saved) : currentTheme.value;
    applyTheme(theme);
  };

  return { currentTheme, isDarkMode, toggleDarkMode, applyTheme, initTheme };
}