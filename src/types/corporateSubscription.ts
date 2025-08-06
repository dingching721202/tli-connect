// 企業訂閱相關類型定義

export type CorporateSubscriptionStatus = 'purchased' | 'activated' | 'expired' | 'cancelled';

export interface CorporateSubscription {
  id: number;
  company_id: string | number;
  plan_id: number;
  order_id?: number;
  
  // 席次管理
  seats_total: number;        // 總席次
  seats_used: number;         // 已使用席次
  seats_available: number;    // 可用席次 (計算得出)
  
  // 時間管理 (企業方案沒有開始結束日期，只有購買和兌換期限)
  purchase_date: string;      // 購買日期
  activation_deadline: string; // 兌換期限 (過期後無法再分配席次)
  
  // 狀態和金額
  status: CorporateSubscriptionStatus;
  amount_paid: number;
  auto_renewal: boolean;
  
  // 系統字段
  created_at: string;
  updated_at: string;
  
  // 快取字段 (避免頻繁 join)
  company_name?: string;
  plan_title?: string;
  plan_type?: 'corporate';
  duration_type?: 'season' | 'annual';
  duration_days?: number;
}

// 企業會員記錄 (席次分配後創建的會員)
export interface CorporateMember {
  id: number;
  subscription_id: number;        // 關聯的企業訂閱
  user_id: number;
  user_name: string;
  user_email: string;
  
  // 時間管理
  issued_date: string;            // 發放日期 (企業窗口分配席次的日期)
  activation_deadline: string;    // 啟用期限 (基於系統設定，預設30天)
  purchase_date: string;          // 購買日期 (跟隨企業訂閱)
  redemption_deadline: string;    // 兌換期限 (跟隨企業訂閱)
  
  // 會員卡狀態
  card_status: 'purchased' | 'issued' | 'activated' | 'expired' | 'cancelled' | 'test'; // purchased=已購買未開啟, issued=已發放未啟用
  activation_date?: string;       // 啟用日期 (會員自己啟用會員卡的日期)
  start_date?: string;           // 開始日期 (啟用後的開始日期)
  end_date?: string;             // 結束日期 (基於方案duration計算)
  
  // 系統字段
  created_at: string;
  updated_at: string;
  
  // 快取字段
  company_id?: string | number;
  company_name?: string;
  plan_title?: string;
  duration_type?: 'season' | 'annual';
  duration_days?: number;
}

// 會員學習記錄
export interface LearningRecord {
  id: number;
  member_id: number;
  course_id?: number;
  course_title?: string;
  activity_type: 'course_view' | 'course_complete' | 'reservation' | 'attendance';
  activity_date: string;
  duration_minutes?: number;
  completion_rate?: number;
  notes?: string;
  created_at: string;
}

// 預約記錄
export interface ReservationRecord {
  id: number;
  member_id: number;
  event_id?: number;
  event_title: string;
  event_date: string;
  reservation_date: string;
  status: 'reserved' | 'attended' | 'cancelled' | 'no_show';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// 創建企業訂閱請求
export interface CreateCorporateSubscriptionRequest {
  company_id: string | number;
  plan_id: number;
  seats_total: number;
  amount_paid: number;
  auto_renewal?: boolean;
}

export default CorporateSubscription;