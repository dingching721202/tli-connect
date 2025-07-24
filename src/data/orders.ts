export interface Order {
  id: number;
  plan_id: number; // 會員方案ID
  user_email?: string; // 非登入用戶需提供email
  user_name?: string;
  user_id?: number; // 登入用戶ID (可選)
  status: 'CREATED' | 'COMPLETED' | 'CANCELED';
  payment_method?: string;
  payment_id?: string; // 第三方金流交易ID
  amount: number;
  created_at: string;
  updated_at: string;
  expires_at: string; // 訂單過期時間 (15分鐘)
}

export const orders: Order[] = [];

export default orders;