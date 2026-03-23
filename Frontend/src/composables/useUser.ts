import { ref } from 'vue';
import { useLogto } from '@logto/vue';

const userInfo = ref<any>(null); // 全域狀態：使用者資料

export function useUser() {
  const { fetchUserInfo, isAuthenticated } = useLogto();

  const updateUserInfo = async () => {
    if (isAuthenticated.value) {
      try {
        const data = await fetchUserInfo();
        userInfo.value = data;
      } catch (e) {
        console.error("抓取使用者名稱失敗", e);
      }
    }
  };

  return { userInfo, updateUserInfo };
}