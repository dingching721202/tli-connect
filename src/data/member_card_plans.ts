import { memberCardPlans } from './memberCardPlans';

// ========================================
// member_card_plans 資料 - 已清空
// ========================================

export const member_card_plans: undefined[] = [];

// ========================================
// 輔助函數
// ========================================

// 根據ID獲取項目
export const getundefinedById = (id: number): undefined | undefined => {
  return member_card_plans.find(item => item.id === id);
};

// 獲取統計
export const getundefinedStatistics = () => {
  return {
    total: member_card_plans.length
  };
};

// 向下相容的預設匯出
export default member_card_plans;