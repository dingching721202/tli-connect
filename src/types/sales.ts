// 銷售紀錄相關類型
export interface SalesRecord {
  id: number;
  agent_id: number;
  agent_code: string;
  customer_name: string;
  customer_email: string;
  product_type: 'individual' | 'corporate';
  plan_name: string;
  sale_amount: number;
  commission: number;
  commission_rate: number;
  sale_date: string;
  payment_status: 'paid' | 'pending' | 'failed';
  referral_method: 'link' | 'code';
  order_number: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}