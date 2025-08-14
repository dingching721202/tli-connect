/**
 * 統一資料庫型別定義
 * 
 * 這個文件定義了所有 Supabase 資料表的完整型別
 * 遵循 MECE 原則：互斥且完全窮盡
 */

// ===== 基礎型別 =====

export type RoleType = 'STUDENT' | 'TEACHER' | 'CORPORATE_CONTACT' | 'AGENT' | 'STAFF' | 'ADMIN';

export type MembershipStatus = 'non_member' | 'inactive' | 'activated' | 'expired' | 'cancelled' | 'test';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';

export type Campus = '羅斯福校' | '士林校' | '台中校' | '高雄校' | '總部';

export type OrderStatus = 'CREATED' | 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';

export type PaymentMethod = 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CASH' | 'MEMBERSHIP_CREDITS';

// ===== 第一層：核心實體 =====

/**
 * 統一用戶系統
 * 整合了原本分散的用戶資料
 */
export interface CoreUser {
  id: number;
  email: string;
  name: string;
  phone: string;
  password_hash: string;
  account_status: AccountStatus;
  membership_status: MembershipStatus;
  campus: Campus;
  avatar_url?: string;
  corp_id?: string; // 企業窗口用戶的公司ID
  created_at: string;
  updated_at: string;
}

/**
 * 企業/機構管理
 * 統一企業客戶資料
 */
export interface Organization {
  id: string; // 使用字串ID以支援自定義格式
  name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  address?: string;
  industry: string;
  employee_count: string;
  status: MembershipStatus;
  created_at: string;
  updated_at: string;
}

/**
 * 統一會員資格
 * 支援個人和企業會員
 */
export interface UnifiedMembership {
  id: number;
  user_id: number; // -> CoreUser
  organization_id?: string; // -> Organization (企業會員時使用)
  plan_id: number; // -> MembershipPlan
  membership_type: 'individual' | 'corporate';
  status: 'inactive' | 'activated' | 'expired' | 'cancelled';
  
  // 時間管理
  purchase_date: string;
  activation_date?: string;
  expiry_date?: string;
  activation_deadline?: string;
  
  // 財務資訊
  amount_paid: number;
  auto_renewal: boolean;
  
  // 企業相關
  company_name?: string; // 冗餘字段，用於快速顯示
  
  created_at: string;
  updated_at: string;
}

/**
 * 會員方案定義
 * 統一個人和企業方案
 */
export interface MembershipPlan {
  id: number;
  title: string;
  user_type: 'individual' | 'corporate';
  duration_type: 'season' | 'annual';
  duration_days: number;
  original_price: number;
  sale_price: number;
  features: string[];
  status: 'DRAFT' | 'PUBLISHED';
  is_popular: boolean;
  description?: string;
  activate_deadline_days: number; // 開啟期限
  created_at: string;
  updated_at: string;
}

/**
 * 課程模板
 * 定義可重複使用的課程結構
 */
export interface CourseTemplate {
  id: string;
  title: string;
  description: string;
  category: 'BUSINESS_CHINESE' | 'CONVERSATIONAL' | 'HSK_PREPARATION' | 'CULTURE_WORKSHOP' | 'TEACHER_TRAINING' | 'CORPORATE_CUSTOM';
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | 'MIXED';
  format: 'ONLINE_LIVE' | 'ONLINE_RECORDED' | 'IN_PERSON' | 'HYBRID';
  
  // 課程結構
  total_sessions: number;
  session_duration_minutes: number;
  total_duration_hours: number;
  
  // 容量設定
  default_capacity: number;
  min_capacity: number;
  max_capacity: number;
  
  // 定價
  base_pricing: {
    individual_price: number;
    corporate_price?: number;
    currency: 'TWD' | 'USD';
    pricing_unit: 'PER_PERSON' | 'PER_SESSION' | 'TOTAL_COURSE';
  };
  
  // 內容和要求
  materials: CourseTemplateMaterial[];
  learning_objectives: string[];
  prerequisites: string[];
  target_audience: string[];
  
  // 狀態
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  tags: string[];
  
  created_at: string;
  updated_at: string;
  created_by: number; // -> CoreUser
}

export interface CourseTemplateMaterial {
  type: 'PDF' | 'VIDEO' | 'AUDIO' | 'INTERACTIVE' | 'LINK';
  title: string;
  url: string;
  description?: string;
  is_required: boolean;
}

/**
 * 課程排期
 * 基於模板的具體班次
 */
export interface CourseSchedule {
  id: string;
  template_id: string; // -> CourseTemplate
  instructor_id: number; // -> CoreUser
  title: string;
  code: string; // 班級代碼
  
  // 時間安排
  start_date: string;
  end_date: string;
  timezone: string;
  
  // 上課設定
  delivery_mode: 'ONLINE_LIVE' | 'ONLINE_RECORDED' | 'IN_PERSON' | 'HYBRID';
  classroom?: string;
  online_meeting_url?: string;
  
  // 容量管理
  capacity: number;
  current_enrollments: number;
  waitlist_limit: number;
  current_waitlist: number;
  
  // 狀態
  status: 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  
  // 報名設定
  enrollment_open_date?: string;
  enrollment_close_date?: string;
  auto_confirm_enrollment: boolean;
  
  created_at: string;
  updated_at: string;
  created_by: number; // -> CoreUser
}

/**
 * 課程時段
 * 每個排期下的具體上課時間
 */
export interface CourseSession {
  id: string;
  schedule_id: string; // -> CourseSchedule
  session_number: number;
  
  // 時間設定
  start_time: string; // ISO 8601
  end_time: string;
  actual_start_time?: string;
  actual_end_time?: string;
  
  // 會話資訊
  title: string;
  description?: string;
  learning_objectives?: string[];
  
  // 地點和設備
  classroom?: string;
  online_meeting_url?: string;
  required_materials?: string[];
  
  // 容量管理
  max_capacity: number;
  current_enrollments: number;
  waitlist_count: number;
  
  // 狀態
  status: 'SCHEDULED' | 'OPEN' | 'FULL' | 'CANCELLED' | 'COMPLETED';
  
  // 出席管理
  attendance_tracking: boolean;
  
  created_at: string;
  updated_at: string;
}

/**
 * 訂單系統
 * 統一所有交易記錄
 */
export interface Order {
  id: number;
  user_id?: number; // -> CoreUser (可選，支援訪客購買)
  organization_id?: string; // -> Organization (企業訂單)
  
  // 訂單內容
  plan_id: number; // -> MembershipPlan
  membership_type: 'individual' | 'corporate';
  seats_quantity?: number; // 企業訂單的席次數量
  
  // 財務資訊
  amount: number;
  currency: 'TWD' | 'USD';
  discount_amount?: number;
  final_amount: number;
  
  // 狀態管理
  status: OrderStatus;
  payment_method?: PaymentMethod;
  payment_id?: string; // 第三方金流交易ID
  payment_details?: Record<string, unknown>; // 付款詳細資訊
  
  // 時間管理
  expires_at: string; // 訂單過期時間
  paid_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  
  // 客戶資訊 (訪客購買時使用)
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
  
  created_at: string;
  updated_at: string;
}

// ===== 第二層：關聯實體 =====

/**
 * 用戶角色關聯
 * 支援多角色用戶
 */
export interface UserRole {
  id: number;
  user_id: number; // -> CoreUser
  role: RoleType;
  granted_by: number; // -> CoreUser (授權人)
  granted_at: string;
  is_active: boolean;
}

/**
 * 課程預約記錄
 * 學員與課程時段的關聯
 */
export interface CourseEnrollment {
  id: string;
  session_id: string; // -> CourseSession
  user_id: number; // -> CoreUser
  membership_id?: number; // -> UnifiedMembership
  
  // 預約來源和類型
  enrollment_source: 'SELF_BOOKING' | 'ADMIN_ASSIGN' | 'CORPORATE_ASSIGN' | 'WAITLIST_PROMOTE';
  credits_used: number; // 使用的學分/堂數
  
  // 狀態管理
  status: 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  
  // 時間記錄
  enrolled_at: string;
  confirmed_at?: string;
  cancelled_at?: string;
  completed_at?: string;
  
  // 候補管理
  waitlist_position?: number;
  waitlist_joined_at?: string;
  waitlist_promoted_at?: string;
  
  // 付款資訊
  payment_required: boolean;
  payment_amount?: number;
  payment_status?: 'PENDING' | 'PAID' | 'REFUNDED';
  order_id?: number; // -> Order
  
  // 出席記錄
  attendance_status?: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  check_in_time?: string;
  check_out_time?: string;
  
  // 評分和回饋
  student_rating?: number;
  student_feedback?: string;
  instructor_notes?: string;
  
  created_at: string;
  updated_at: string;
}

/**
 * 企業訂閱管理
 * 企業購買的席次池
 */
export interface CorporateSubscription {
  id: number;
  organization_id: string; // -> Organization
  plan_id: number; // -> MembershipPlan
  order_id: number; // -> Order
  
  // 席次管理
  seats_total: number;
  seats_used: number;
  seats_available: number; // 計算字段
  
  // 狀態和時間
  status: 'inactive' | 'activated' | 'expired' | 'cancelled';
  purchase_date: string;
  activation_deadline?: string;
  activated_at?: string;
  expires_at?: string;
  
  // 財務
  amount_paid: number;
  auto_renewal: boolean;
  
  created_at: string;
  updated_at: string;
}

/**
 * 企業會員發放記錄
 * 從企業席次分配給個別員工
 */
export interface CorporateMember {
  id: number;
  subscription_id: number; // -> CorporateSubscription
  user_id?: number; // -> CoreUser (可選，未註冊用戶為空)
  
  // 用戶資訊
  user_name: string;
  user_email: string;
  
  // 會員卡狀態
  card_status: 'inactive' | 'activated' | 'expired' | 'cancelled' | 'test';
  issued_date: string;
  activation_deadline: string;
  activation_date?: string;
  start_date?: string;
  end_date?: string;
  
  created_at: string;
  updated_at: string;
}

/**
 * 代理系統
 * 推薦和銷售代理
 */
export interface Agent {
  id: number;
  user_id: number; // -> CoreUser
  agent_code: string; // 唯一代理碼
  agent_type: 'INDIVIDUAL' | 'CORPORATE' | 'TEACHER';
  
  // 佣金設定
  commission_rate: number; // 佣金比例 (0-1)
  bonus_rate?: number; // 獎金比例
  
  // 狀態和層級
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  level: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  
  // 銷售記錄
  total_sales: number;
  total_commission: number;
  monthly_target?: number;
  
  created_at: string;
  updated_at: string;
}

/**
 * 請假管理
 * 教師請假申請和審核
 */
export interface LeaveRequest {
  id: string;
  teacher_id: number; // -> CoreUser
  session_id: string; // -> CourseSession
  
  // 請假內容
  reason: string;
  note?: string;
  leave_type: 'SICK' | 'PERSONAL' | 'EMERGENCY' | 'VACATION' | 'OTHER';
  
  // 審核狀態
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reviewed_by?: number; // -> CoreUser
  reviewed_at?: string;
  admin_note?: string;
  
  // 代課安排
  substitute_teacher_id?: number; // -> CoreUser
  substitute_notes?: string;
  
  created_at: string;
  updated_at: string;
}

/**
 * 系統設定
 * 全域配置管理
 */
export interface SystemSetting {
  id: number;
  key: string; // 設定鍵值
  value: Record<string, unknown>; // JSON 格式的設定值
  category: 'GENERAL' | 'PAYMENT' | 'NOTIFICATION' | 'SECURITY' | 'FEATURE';
  description?: string;
  is_public: boolean; // 是否為公開設定
  updated_by: number; // -> CoreUser
  updated_at: string;
}

/**
 * 活動日誌
 * 系統操作記錄
 */
export interface ActivityLog {
  id: number;
  user_id?: number; // -> CoreUser (可選，系統操作為空)
  entity_type: string; // 操作的實體類型
  entity_id: string; // 操作的實體ID
  action: string; // 操作類型
  details?: Record<string, unknown>; // 操作詳細資訊
  
  // 請求資訊
  ip_address?: string;
  user_agent?: string;
  request_method?: string;
  request_url?: string;
  
  created_at: string;
}

// ===== 統一的 API 回應格式 =====

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    pagination?: PaginationMeta;
    timestamp: string;
    request_id?: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ListQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  filter?: Record<string, unknown>;
  search?: string;
}

// ===== 統計和報表相關 =====

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    new_this_month: number;
  };
  memberships: {
    total: number;
    active: number;
    expiring_soon: number;
  };
  courses: {
    total_schedules: number;
    active_schedules: number;
    total_enrollments: number;
  };
  revenue: {
    this_month: number;
    last_month: number;
    growth_rate: number;
  };
}