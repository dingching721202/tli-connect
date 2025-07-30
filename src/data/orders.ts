import type { Order } from '@/types/business';

// ========================================
// 訂單資料 - MECE架構
// 管理系統中的所有訂單記錄
// ========================================

export const orders: Order[] = [
  {
    id: 1,
    user_id: 1,
    order_number: 'ORD-2024-001',
    items: [
      {
        id: 1,
        type: 'MEMBERSHIP_PLAN',
        item_id: 1,
        item_name: '季卡方案',
        quantity: 1,
        unit_price: 3200,
        total_price: 3200
      }
    ],
    subtotal: 3200,
    discount_amount: 0,
    tax_amount: 0,
    total_amount: 3200,
    currency: 'TWD',
    status: 'COMPLETED',
    payment_method: 'CREDIT_CARD',
    notes: '首次購買季卡',
    created_at: '2024-01-01T00:00:00+00:00',
    updated_at: '2024-01-01T10:30:00+00:00'
  },
  {
    id: 2,
    user_id: 2,
    order_number: 'ORD-2024-002',
    items: [
      {
        id: 2,
        type: 'MEMBERSHIP_PLAN',
        item_id: 2,
        item_name: '年卡方案',
        quantity: 1,
        unit_price: 12000,
        total_price: 12000
      }
    ],
    subtotal: 12000,
    discount_amount: 1200, // 10% 折扣
    tax_amount: 0,
    total_amount: 10800,
    currency: 'TWD',
    status: 'COMPLETED',
    payment_method: 'BANK_TRANSFER',
    notes: '年卡促銷活動',
    created_at: '2023-12-15T00:00:00+00:00',
    updated_at: '2023-12-16T09:15:00+00:00'
  },
  {
    id: 3,
    user_id: 5, // 企業員工
    order_number: 'ORD-2024-003',
    items: [
      {
        id: 3,
        type: 'MEMBERSHIP_PLAN',
        item_id: 3,
        item_name: '企業員工方案',
        quantity: 1,
        unit_price: 8000,
        total_price: 8000
      }
    ],
    subtotal: 8000,
    discount_amount: 800, // 企業客戶折扣
    tax_amount: 0,
    total_amount: 7200,
    currency: 'TWD',
    status: 'PAID',
    payment_method: 'CREDIT_CARD',
    notes: '企業客戶ABC科技員工',
    created_at: '2024-01-10T00:00:00+00:00',
    updated_at: '2024-01-10T15:20:00+00:00'
  },
  {
    id: 4,
    user_id: 1,
    order_number: 'ORD-2024-004',
    items: [
      {
        id: 4,
        type: 'COURSE_SCHEDULE',
        item_id: 4,
        item_name: '商務英語進階 - 8月班',
        quantity: 1,
        unit_price: 5800,
        total_price: 5800
      }
    ],
    subtotal: 5800,
    discount_amount: 0,
    tax_amount: 0,
    total_amount: 5800,
    currency: 'TWD',
    status: 'PENDING_PAYMENT',
    notes: '單堂課程購買',
    created_at: '2024-01-15T00:00:00+00:00',
    updated_at: '2024-01-15T00:00:00+00:00'
  },
  {
    id: 5,
    user_id: 3,
    order_number: 'ORD-2024-005',
    items: [
      {
        id: 5,
        type: 'MEMBERSHIP_PLAN',
        item_id: 1,
        item_name: '季卡方案',
        quantity: 1,
        unit_price: 3200,
        total_price: 3200
      }
    ],
    subtotal: 3200,
    discount_amount: 0,
    tax_amount: 0,
    total_amount: 3200,
    currency: 'TWD',
    status: 'CANCELED',
    notes: '用戶取消訂單',
    created_at: '2024-01-12T00:00:00+00:00',
    updated_at: '2024-01-13T08:30:00+00:00'
  }
];

// ========================================
// 輔助函數
// ========================================

// 根據ID獲取訂單
export const getOrderById = (id: number): Order | undefined => {
  return orders.find(order => order.id === id);
};

// 根據訂單號獲取訂單
export const getOrderByNumber = (orderNumber: string): Order | undefined => {
  return orders.find(order => order.order_number === orderNumber);
};

// 根據用戶ID獲取訂單
export const getOrdersByUserId = (userId: number): Order[] => {
  return orders.filter(order => order.user_id === userId);
};

// 根據狀態獲取訂單
export const getOrdersByStatus = (status: Order['status']): Order[] => {
  return orders.filter(order => order.status === status);
};

// 計算用戶總消費
export const calculateUserTotalSpent = (userId: number): number => {
  const userOrders = getOrdersByUserId(userId);
  return userOrders
    .filter(order => order.status === 'COMPLETED' || order.status === 'PAID')
    .reduce((total, order) => total + order.total_amount, 0);
};

// 生成新訂單號
export const generateOrderNumber = (): string => {
  const year = new Date().getFullYear();
  const sequence = (Math.max(...orders.map(o => parseInt(o.order_number.split('-')[2]) || 0), 0) + 1)
    .toString().padStart(3, '0');
  return `ORD-${year}-${sequence}`;
};

// 創建新訂單
export const createOrder = (orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>): Order => {
  const newOrder: Order = {
    ...orderData,
    id: Math.max(...orders.map(o => o.id), 0) + 1,
    order_number: generateOrderNumber(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  orders.push(newOrder);
  return newOrder;
};

// 更新訂單狀態
export const updateOrderStatus = (orderId: number, status: Order['status'], notes?: string): boolean => {
  const order = getOrderById(orderId);
  if (!order) return false;
  
  order.status = status;
  if (notes) order.notes = notes;
  order.updated_at = new Date().toISOString();
  
  return true;
};

// 計算訂單總計
export const calculateOrderTotal = (items: Order['items'], discountAmount: number = 0): {
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
} => {
  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
  const tax_amount = 0; // 目前不收稅
  const total_amount = subtotal - discountAmount + tax_amount;
  
  return {
    subtotal,
    discount_amount: discountAmount,
    tax_amount,
    total_amount
  };
};

// 獲取訂單統計
export const getOrderStatistics = (startDate?: string, endDate?: string) => {
  let filteredOrders = orders;
  
  if (startDate || endDate) {
    filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      
      return orderDate >= start && orderDate <= end;
    });
  }
  
  const total = filteredOrders.length;
  const completed = filteredOrders.filter(o => o.status === 'COMPLETED').length;
  const paid = filteredOrders.filter(o => o.status === 'PAID').length;
  const pending = filteredOrders.filter(o => o.status === 'PENDING_PAYMENT').length;
  const canceled = filteredOrders.filter(o => o.status === 'CANCELED').length;
  
  const totalRevenue = filteredOrders
    .filter(o => o.status === 'COMPLETED' || o.status === 'PAID')
    .reduce((sum, o) => sum + o.total_amount, 0);
  
  const averageOrderValue = (completed + paid) > 0 ? totalRevenue / (completed + paid) : 0;
  
  return {
    total,
    completed,
    paid,
    pending,
    canceled,
    total_revenue: totalRevenue,
    average_order_value: averageOrderValue,
    completion_rate: total > 0 ? ((completed + paid) / total) * 100 : 0
  };
};

// 向下相容的預設匯出
export default orders;