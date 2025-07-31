import type { CorporateClient } from '@/types/business';

// ========================================
// corporateClients 資料 - 已清空
// ========================================

export const corporateClients: undefined[] = [];

// ========================================
// 輔助函數
// ========================================

// 根據ID獲取項目
export const getundefinedById = (id: number): undefined | undefined => {
  return corporateClients.find(item => item.id === id);
};

// 獲取統計
export const getundefinedStatistics = () => {
  return {
    total: corporateClients.length
  };
};

// 向下相容的預設匯出
export default corporateClients;