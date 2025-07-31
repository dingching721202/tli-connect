import type { Order } from '@/types/business';

// ========================================
// 訂單資料 - 已清空
// ========================================

export const orders: Order[] = [];

// ========================================
// 輔助函數
// ========================================

// 根據ID獲取訂單
export const getOrderById = (id: number): Order | undefined => {
  return orders.find(order => order.id === id);
};

// 獲取統計
export const getOrderStatistics = () => {
  return {
    total: orders.length
  };
};

// 向下相容的預設匯出
export default orders;