import type { UserMembership } from '@/types/business';

// ========================================
// 會員資料 - 已清空
// ========================================

export const userMemberships: UserMembership[] = [];

// ========================================
// 輔助函數
// ========================================

// 根據ID獲取會員
export const getMembershipById = (id: number): UserMembership | undefined => {
  return userMemberships.find(membership => membership.id === id);
};

// 獲取統計
export const getMembershipStatistics = () => {
  return {
    total: userMemberships.length
  };
};

// 向下相容的預設匯出
export default userMemberships;