import { ref } from "vue";
import type { ThemeConfig } from "../types/theme";

// 1. 初始化狀態 (移到外面確保全域唯一)
const savedTheme = localStorage.getItem("user-theme");
const currentTheme = ref<ThemeConfig>(
  savedTheme
    ? JSON.parse(savedTheme)
    : {
        name: "預設",
        primary: "#00668c",
        bgType: "color",
        background: "#f8faff",
        textColor: "#0f172a",
        cardBg: "rgba(255, 255, 255, 0.8)",
      },
);

const isDarkMode = ref(localStorage.getItem("is-dark-mode") === "true");

export function useTheme() {
  const applyTheme = (theme: ThemeConfig) => {
    currentTheme.value = theme;
    const root = document.documentElement;

    if (isDarkMode.value) {
      root.classList.add("dark-mode");
      // 🌙 深夜模式：強制高對比
      root.style.setProperty("--app-bg", "#0f172a"); // 深藍黑底
      root.style.setProperty("--app-text", "#f8fafc"); // 極致白字
      root.style.setProperty("--app-card-bg", "rgba(30, 41, 59, 0.7)"); // 深色半透卡片
      root.style.setProperty("--app-bg-image", "none");
    } else {
      root.classList.remove("dark-mode");
      // ☀️ 日間模式：套用主題設定
      root.style.setProperty("--app-text", theme.textColor); // 使用主題定義的文字顏色

      if (theme.bgType === "image") {
        root.style.setProperty("--app-bg", "transparent");
        root.style.setProperty("--app-bg-image", `url("${theme.background}")`);
        // 如果背景是圖片，建議強制文字為白色或加上文字陰影來增加對比
        root.style.setProperty(
          "--app-text-shadow",
          "0 2px 4px rgba(0,0,0,0.5)",
        );
      } else {
        root.style.setProperty("--app-bg", theme.background);
        root.style.setProperty("--app-bg-image", "none");
        root.style.setProperty("--app-text-shadow", "none");
      }
      root.style.setProperty(
        "--app-card-bg",
        theme.cardBg || "rgba(255, 255, 255, 0.8)",
      );
    }
    root.style.setProperty("--app-primary", theme.primary);
  };

  // ⭐ 關鍵修正：這裡必須要有 ! 號，狀態才會翻轉
  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
    applyTheme(currentTheme.value);
  };

  const initTheme = () => {
    applyTheme(currentTheme.value);
  };

  return { currentTheme, isDarkMode, toggleDarkMode, applyTheme, initTheme };
}
