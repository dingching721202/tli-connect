import type { MemberCardPlan } from '@/types/business';

// ========================================
// 會員卡方案資料 - 已清空
// ========================================

export const memberCardPlans: MemberCardPlan[] = [];

// ========================================
// 輔助函數
// ========================================

// 根據ID獲取會員卡方案
export const getMemberCardPlanById = (id: number): MemberCardPlan | undefined => {
  return memberCardPlans.find(plan => plan.id === id);
};

// 獲取統計
export const getMemberCardPlanStatistics = () => {
  return {
    total: memberCardPlans.length
  };
};

// 向下相容的預設匯出
export default memberCardPlans;