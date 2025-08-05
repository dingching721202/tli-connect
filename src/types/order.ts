// 統一的訂單相關類型定義

// 訂單狀態
export type OrderStatus = 'CREATED' | 'COMPLETED' | 'CANCELED' | 'EXPIRED';

// 支付方式
export type PaymentMethod = 'CREDIT_CARD' | 'BANK_TRANSFER' | 'PAYPAL' | 'LINE_PAY' | 'APPLE_PAY' | 'GOOGLE_PAY';

// 訂單基本定義
export interface Order {
  id: number;
  plan_id: number; // 會員卡方案ID
  user_id?: number; // 登入用戶ID (可選，支援訪客購買)
  user_email?: string; // 非登入用戶或確認信箱
  user_name?: string; // 非登入用戶或確認姓名
  
  // 金額相關
  amount: number; // 實際支付金額
  original_amount?: number; // 原價（如有折扣）
  discount_amount?: number; // 折扣金額
  
  // 狀態相關
  status: OrderStatus;
  
  // 支付相關
  payment_method?: PaymentMethod;
  payment_id?: string; // 第三方金流交易ID
  payment_url?: string; // 支付連結（如需要）
  
  // 時間相關
  created_at: string;
  updated_at: string;
  expires_at: string; // 訂單過期時間 (預設15分鐘)
  paid_at?: string; // 付款完成時間
  
  // 其他資訊
  notes?: string; // 備註
  coupon_code?: string; // 優惠券代碼
}

// 訂單創建請求
export interface CreateOrderRequest {
  plan_id: number;
  user_id?: number;
  user_email?: string;
  user_name?: string;
  coupon_code?: string;
  notes?: string;
}

// 訂單更新請求
export interface UpdateOrderRequest {
  status?: OrderStatus;
  payment_method?: PaymentMethod;
  payment_id?: string;
  paid_at?: string;
  notes?: string;
}

// 支付回調資料
export interface PaymentCallback {
  order_id: number;
  payment_id: string;
  payment_method: PaymentMethod;
  amount: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  transaction_id?: string;
  raw_data?: Record<string, unknown>; // 原始支付回調資料
}

// 訂單統計
export interface OrderStats {
  total_orders: number;
  completed_orders: number;
  canceled_orders: number;
  expired_orders: number;
  pending_orders: number;
  total_revenue: number;
  today_revenue: number;
  this_month_revenue: number;
  by_payment_method: Record<PaymentMethod, number>;
  by_plan: Record<number, {
    count: number;
    revenue: number;
    plan_title: string;
  }>;
}

// 訂單篩選器
export interface OrderFilter {
  search?: string; // 搜尋訂單ID、用戶名、郵箱
  status?: OrderStatus[];
  payment_method?: PaymentMethod[];
  plan_ids?: number[];
  date_range?: {
    start: string;
    end: string;
  };
  amount_range?: {
    min: number;
    max: number;
  };
}

// 訂單詳情（包含關聯資料）
export interface OrderWithDetails extends Order {
  plan: {
    id: number;
    title: string;
    member_card_name: string;
    user_type: string;
    duration_type: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

// 批量訂單操作
export interface BatchOrderOperation {
  order_ids: number[];
  action: 'cancel' | 'refund' | 'resend_confirmation';
  reason?: string;
}

// 訂單退款請求
export interface RefundRequest {
  order_id: number;
  amount?: number; // 如果不提供，則全額退款
  reason: string;
  refund_method?: 'ORIGINAL' | 'BANK_TRANSFER'; // 退款方式
}

// 訂單退款記錄
export interface RefundRecord {
  id: number;
  order_id: number;
  amount: number;
  reason: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  refund_method: string;
  refund_id?: string; // 第三方退款ID
  created_at: string;
  completed_at?: string;
  created_by: number; // 操作人員ID
}

export default Order;