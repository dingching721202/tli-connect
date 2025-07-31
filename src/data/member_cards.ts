import type { UserMembership } from '@/types/business';

// ========================================
// 會員卡資料 - 已清空
// ========================================

export const memberCards: UserMembership[] = [];

// ========================================
// 輔助函數
// ========================================

// 根據ID獲取會員卡
export const getMemberCardById = (id: number): UserMembership | undefined => {
  return memberCards.find(card => card.id === id);
};

// 獲取統計
export const getMemberCardStatistics = () => {
  return {
    total: memberCards.length
  };
};

// 向下相容的預設匯出
export default memberCards;