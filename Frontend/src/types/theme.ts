export interface ThemeConfig {
  name: string;
  primary: string;    // 主色調
  bgType: 'color' | 'image';
  background: string; // 顏色代碼或圖片 URL
  textColor: string;  // 文字顏色
  cardBg: string;     // 卡片透明度 (例如 rgba(255,255,255,0.8))
}