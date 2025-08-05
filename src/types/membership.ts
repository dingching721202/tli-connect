// 統一的會員相關類型定義

// 會員卡狀態
export type MemberCardStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

// 用戶類型
export type UserType = 'individual' | 'corporate';

// 方案期間類型
export type DurationType = 'season' | 'annual';

// 會員狀態
export type MembershipStatus = 'purchased' | 'activated' | 'expired' | 'cancelled';

// 會員卡基本定義（會員卡種類）
export interface MemberCard {
  id: number;
  name: string;
  description?: string;
  available_course_ids: (number | string)[]; // 支援混合類型
  created_at: string;
  updated_at?: string;
}

// 會員卡方案定義（每張會員卡可以有多個方案）
export interface MemberCardPlan {
  id: number;
  member_card_id: number;
  title: string;
  description?: string;
  user_type: UserType;
  duration_type: DurationType;
  duration_days: number;
  original_price: string;
  sale_price: string;
  features: string[];
  status: MemberCardStatus;
  popular?: boolean;
  hide_price?: boolean;
  activate_deadline_days: number; // 開啟期限天數，預設30天
  cta_options: {
    show_payment: boolean;
    show_contact: boolean;
  };
  created_at: string;
  updated_at?: string;
}

// 會員資格（用戶實際擁有的會員實例）
export interface Membership {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  member_card_id: number;
  plan_id: number;
  order_id?: number;
  status: MembershipStatus;
  
  // 時間相關
  purchase_date: string;
  activation_date?: string;
  expiry_date?: string;
  activation_deadline: string;
  
  // 金額相關
  amount_paid: number;
  original_amount?: number;
  auto_renewal: boolean;
  
  // 系統時間戳
  created_at: string;
  updated_at: string;
  
  // 快取的方案資料（避免頻繁關聯查詢）
  plan_title?: string;
  plan_type?: UserType;
  duration_type?: DurationType;
  duration_days?: number;
  member_card_name?: string;
}

// 會員資格創建請求
export interface CreateMembershipRequest {
  user_id: number;
  user_name: string;
  user_email: string;
  plan_id: number;
  order_id?: number;
  amount_paid: number;
  auto_renewal?: boolean;
}

// 會員資格更新請求
export interface UpdateMembershipRequest {
  status?: MembershipStatus;
  activation_date?: string;
  expiry_date?: string;
  auto_renewal?: boolean;
}

// 會員統計
export interface MembershipStats {
  total: number;
  purchased: number;
  activated: number;
  expired: number;
  cancelled: number;
  by_plan_type: Record<UserType, number>;
  by_duration_type: Record<DurationType, number>;
  revenue_total: number;
  revenue_this_month: number;
}

// 會員篩選器
export interface MembershipFilter {
  search?: string;
  status?: MembershipStatus[];
  plan_type?: UserType[];
  duration_type?: DurationType[];
  date_range?: {
    start: string;
    end: string;
  };
}

// 會員卡方案創建請求
export interface CreateMemberCardPlanRequest {
  member_card_id: number;
  title: string;
  description?: string;
  user_type: UserType;
  duration_type: DurationType;
  duration_days: number;
  original_price: string;
  sale_price: string;
  features: string[];
  popular?: boolean;
  hide_price?: boolean;
  activate_deadline_days?: number;
  cta_options: {
    show_payment: boolean;
    show_contact: boolean;
  };
}

// 會員卡方案更新請求
export interface UpdateMemberCardPlanRequest {
  title?: string;
  description?: string;
  duration_days?: number;
  original_price?: string;
  sale_price?: string;
  features?: string[];
  status?: MemberCardStatus;
  popular?: boolean;
  hide_price?: boolean;
  activate_deadline_days?: number;
  cta_options?: {
    show_payment: boolean;
    show_contact: boolean;
  };
}

// 會員卡創建請求
export interface CreateMemberCardRequest {
  name: string;
  description?: string;
  available_course_ids: (number | string)[];
}

// With関聯資料的完整會員資格
export interface MembershipWithDetails extends Membership {
  member_card: MemberCard;
  plan: MemberCardPlan;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export default Membership;