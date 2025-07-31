// ========================================
// 業務實體型別定義 - 符合MECE原則
// ========================================

// ========================================
// 使用者管理 (User Management)
// ========================================
export type UserRole = 
  | 'STUDENT'           // 學生
  | 'TEACHER'           // 教師
  | 'ADMIN'             // 管理員
  | 'STAFF'             // 員工
  | 'CORPORATE_CONTACT' // 企業聯絡人
  | 'AGENT';            // 代理商

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  profile: UserProfile;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  avatar_url?: string;
  date_of_birth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  nationality?: string;
  language_preference: 'zh-TW' | 'en-US' | 'ja-JP';
  timezone: string;
  emergency_contact?: EmergencyContact;
  learning_goals?: string[]
  teaching_experience?: TeachingExperience; // 僅教師使用
  corporate_info?: CorporateContactInfo;    // 僅企業聯絡人使用
  agent_info?: AgentInfo;                   // 僅代理商使用
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface TeachingExperience {
  years_of_experience: number;
  specializations: string[];
  certifications: string[];
  languages_taught: string[];
  bio: string;
}

export interface CorporateContactInfo {
  company_id: number;
  position: string;
  department?: string;
}

export interface AgentInfo {
  agent_code: string;
  level: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  commission_rate: number;
  parent_agent_id?: number;
  total_referrals: number;
  total_commission_earned: number;
}

// ========================================
// 課程系統 (Course System) - 三層架構
// ========================================

// 第一層：課程模組 (Course Module) - 可重複使用的課程範本
export interface CourseModule {
  id: number;
  title: string;
  description: string;
  cover_image_url: string;
  language: 'english' | 'chinese' | 'japanese';
  level: 'beginner' | 'intermediate' | 'advanced';
  categories: string[];
  tags: string[];
  total_sessions: number;
  session_duration_minutes: number;
  materials: CourseMaterial[];
  prerequisites: string[];
  learning_objectives: string[];
  refund_policy: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseMaterial {
  id: number;
  type: 'VIDEO' | 'DOCUMENT' | 'AUDIO' | 'LINK' | 'QUIZ';
  title: string;
  url?: string;
  content?: string;
  order: number;
  is_required: boolean;
}

// 第二層：課程排程 (Course Schedule) - 具體的課程實例
export interface CourseSchedule {
  id: number;
  course_module_id: number;
  title: string; // 可自訂標題，預設使用CourseModule的title
  teacher_id: number;
  teacher_name: string;
  location: CourseLocation;
  price: number;
  original_price: number;
  currency: string;
  max_students: number;
  current_students: number;
  start_date: string;
  end_date: string;
  enrollment_deadline: string;
  status: 'DRAFT' | 'PUBLISHED' | 'FULL' | 'ONGOING' | 'COMPLETED' | 'CANCELED';
  recurring_pattern?: RecurringPattern;
  waitlist_enabled: boolean;
  special_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseLocation {
  type: 'ONLINE' | 'PHYSICAL' | 'HYBRID';
  address?: string;
  room?: string;
  online_link?: string;
  platform?: 'ZOOM' | 'TEAMS' | 'MEET' | 'OTHER';
}

export interface RecurringPattern {
  type: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  days_of_week: number[]; // 0=Sunday, 1=Monday, etc.
  exceptions: string[];    // 例外日期
}

// 第三層：課程時段 (Course Session) - 具體可預約的時間段
export interface CourseSession {
  id: number;
  course_schedule_id: number;
  session_number: number;
  start_time: string;
  end_time: string;
  capacity: number;
  reserved_count: number;
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELED';
  topic?: string;
  materials_url?: string[];
  homework_assigned?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// 會員制度 (Membership System)
// ========================================

// 會員卡計劃 (產品定義)
export interface MemberCardPlan {
  id: number;
  name: string;
  description: string;
  type: 'SEASON' | 'YEAR' | 'UNLIMITED';
  duration_days: number;
  price: number;
  original_price: number;
  currency: string;
  available_course_modules: number[]; // 可使用的課程模組ID
  max_bookings_per_month: number;
  benefits: string[];
  terms_and_conditions: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  valid_from: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
}

// 使用者會員卡 (使用者實例)
export interface UserMembership {
  id: number;
  user_id: number;
  member_card_plan_id: number;
  order_id?: number;
  status: 'PURCHASED' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'REFUNDED';
  purchase_date: string;
  activation_deadline: string; // 購買後24小時內需啟用
  activation_date?: string;
  activated_at?: string;
  start_date?: string;
  end_date?: string;
  sessions_total: number;
  sessions_used: number;
  sessions_remaining: number;
  remaining_sessions?: number; // 向下相容
  purchase_price: number;
  currency: string;
  payment_method: string;
  payment_reference: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// 預約系統 (Booking System)
// ========================================
export type BookingStatus = 'CONFIRMED' | 'CANCELED' | 'ATTENDED' | 'NO_SHOW' | 'RESCHEDULED';

export interface Booking {
  id: number;
  user_id: number;
  course_session_id: number;
  membership_id: number;
  status: BookingStatus;
  booking_time: string;
  cancellation_time?: string;
  cancellation_reason?: string;
  attendance_checked_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BatchBookingRequest {
  user_id: number;
  membership_id: number;
  session_ids: number[];
  notes?: string;
}

export interface BatchBookingResult {
  successful_bookings: Array<{
    session_id: number;
    booking_id: number;
  }>;
  failed_bookings: Array<{
    session_id: number;
    reason: 'FULL' | 'WITHIN_24H' | 'MEMBERSHIP_EXPIRED' | 'ALREADY_BOOKED' | 'SESSION_CANCELED';
  }>;
}

// ========================================
// 訂單與付款系統 (Order & Payment System)
// ========================================
export type OrderStatus = 'CREATED' | 'PENDING_PAYMENT' | 'PAID' | 'COMPLETED' | 'CANCELED' | 'REFUNDED';
export type PaymentMethod = 'CREDIT_CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET' | 'CASH';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCESSFUL' | 'FAILED' | 'REFUNDED';

export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  items: OrderItem[];
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: OrderStatus;
  payment_method?: PaymentMethod;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  type: 'MEMBERSHIP_PLAN' | 'COURSE_SCHEDULE' | 'PRIVATE_LESSON';
  item_id: number; // 對應的商品ID
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface PaymentTransaction {
  id: number;
  order_id: number;
  transaction_id: string; // 第三方支付交易ID
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  gateway_response?: unknown; // 第三方回應
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// 企業客戶管理 (Corporate Management)
// ========================================
export type CorporateInquiryStatus = 'NEW' | 'CONTACTED' | 'QUOTED' | 'NEGOTIATING' | 'CLOSED_WON' | 'CLOSED_LOST';
export type CorporateSubscriptionStatus = 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'CANCELED';

export interface CorporateInquiry {
  id: number;
  company_name: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  company_size: string;
  industry: string;
  training_needs: string[];
  preferred_languages: string[];
  budget_range?: string;
  timeline: string;
  status: CorporateInquiryStatus;
  assigned_to?: number; // 負責的員工ID
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CorporateClient {
  id: number;
  company_name: string;
  registration_number?: string;
  industry: string;
  company_size: string;
  address: string;
  primary_contact: CorporateContact;
  billing_contact?: CorporateContact;
  contract_terms: ContractTerms;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  created_at: string;
  updated_at: string;
}

export interface CorporateContact {
  name: string;
  position: string;
  email: string;
  phone: string;
  department?: string;
}

export interface ContractTerms {
  start_date: string;
  end_date: string;
  auto_renewal: boolean;
  payment_terms: 'NET_30' | 'NET_60' | 'PREPAID';
  discount_rate: number;
  minimum_commitment?: number;
}

export interface CorporateSubscription {
  id: number;
  corporate_client_id: number;
  plan_name: string;
  employee_limit: number;
  course_access: number[]; // 可使用的課程模組ID
  monthly_fee: number;
  setup_fee: number;
  status: CorporateSubscriptionStatus;
  billing_cycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  next_billing_date: string;
  created_at: string;
  updated_at: string;
}

export interface CorporateEmployee {
  id: number;
  user_id: number;
  corporate_client_id: number;
  employee_id: string; // 企業內部員工編號
  department?: string;
  position?: string;
  manager_email?: string;
  enrollment_date: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

// ========================================
// 代理商系統 (Agent System)
// ========================================
export type AgentLevel = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
export type CommissionStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';

export interface Agent {
  id: number;
  user_id: number;
  agent_code: string;
  level: AgentLevel;
  parent_agent_id?: number;
  commission_rate: number;
  total_referrals: number;
  total_sales_amount: number;
  total_commission_earned: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  contract_signed_at: string;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: number;
  agent_id: number;
  referred_user_id: number;
  referral_code: string;
  order_id?: number;
  commission_amount: number;
  commission_rate: number;
  status: CommissionStatus;
  referred_at: string;
  converted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CommissionPayment {
  id: number;
  agent_id: number;
  period_start: string;
  period_end: string;
  total_amount: number;
  referral_ids: number[];
  payment_method: PaymentMethod;
  payment_reference?: string;
  status: CommissionStatus;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// 學習進度追蹤 (Learning Progress)
// ========================================
export interface StudentProgress {
  id: number;
  user_id: number;
  course_schedule_id: number;
  total_sessions: number;
  attended_sessions: number;
  completion_rate: number;
  average_score?: number;
  current_level: string;
  achievements: string[];
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface SessionAttendance {
  id: number;
  user_id: number;
  course_session_id: number;
  booking_id: number;
  attendance_status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  check_in_time?: string;
  check_out_time?: string;
  teacher_notes?: string;
  homework_submitted?: boolean;
  quiz_score?: number;
  created_at: string;
  updated_at: string;
}

export interface CourseReview {
  id: number;
  user_id: number;
  course_schedule_id: number;
  teacher_id: number;
  rating: number; // 1-5
  content_rating: number; // 1-5
  teacher_rating: number; // 1-5
  difficulty_rating: number; // 1-5
  comment?: string;
  is_anonymous: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// ========================================
// 教師管理 (Teacher Management)
// ========================================
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'LEAVE' | 'SICK';

export interface Teacher {
  id: number;
  user_id: number;
  employee_id?: string;
  specializations: string[];
  languages: string[];
  certifications: TeacherCertification[];
  hourly_rate: number;
  currency: string;
  max_students_per_class: number;
  bio: string;
  years_of_experience: number;
  rating: number;
  total_reviews: number;
  is_available: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  hired_at: string;
  created_at: string;
  updated_at: string;
}

export interface TeacherCertification {
  name: string;
  issuer: string;
  issued_date: string;
  expiry_date?: string;
  certificate_url?: string;
}

export interface TeacherSchedule {
  id: number;
  teacher_id: number;
  day_of_week: number; // 0=Sunday, 1=Monday, etc.
  start_time: string;   // HH:mm format
  end_time: string;     // HH:mm format
  availability_status: AvailabilityStatus;
  max_bookings: number;
  notes?: string;
  effective_from: string;
  effective_until?: string;
  created_at: string;
  updated_at: string;
}

export interface TeacherLeaveRequest {
  id: number;
  teacher_id: number;
  leave_type: 'VACATION' | 'SICK' | 'PERSONAL' | 'EMERGENCY';
  start_date: string;
  end_date: string;
  reason?: string;
  status: LeaveStatus;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// 客服系統 (Customer Service)
// ========================================
export type InquiryType = 'GENERAL' | 'TECHNICAL' | 'BILLING' | 'COURSE' | 'COMPLAINT';
export type CaseStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ContactInquiry {
  id: number;
  user_id?: number; // null if guest inquiry
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  inquiry_type: InquiryType;
  subject: string;
  message: string;
  priority: CasePriority;
  status: CaseStatus;
  assigned_to?: number; // 負責的員工ID
  created_at: string;
  updated_at: string;
}

export interface CaseResponse {
  id: number;
  contact_inquiry_id: number;
  responder_id: number; // 回覆者ID
  responder_type: 'STAFF' | 'ADMIN' | 'SYSTEM';
  message: string;
  is_internal_note: boolean;
  created_at: string;
}

export interface CaseWorklog {
  id: number;
  contact_inquiry_id: number;
  staff_id: number;
  action: string;
  description?: string;
  time_spent_minutes?: number;
  created_at: string;
}

// ========================================
// 系統通知 (Notifications)
// ========================================
export type NotificationType = 
  | 'BOOKING_CONFIRMED' 
  | 'BOOKING_CANCELED'
  | 'BOOKING_REMINDER'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'MEMBERSHIP_EXPIRING'
  | 'COURSE_UPDATE'
  | 'SYSTEM_MAINTENANCE';

export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: unknown; // 額外的結構化資料
  channels: NotificationChannel[];
  is_read: boolean;
  sent_at?: string;
  read_at?: string;
  created_at: string;
}

export interface NotificationTemplate {
  id: number;
  type: NotificationType;
  channel: NotificationChannel;
  language: string;
  subject_template: string;
  body_template: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ========================================
// 系統設定 (System Settings)
// ========================================
export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  category: string;
  description?: string;
  is_public: boolean; // 是否可對前端公開
  updated_by: number;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  resource_type: string;
  resource_id: string;
  old_values?: unknown;
  new_values?: unknown;
  ip_address: string;
  user_agent: string;
  created_at: string;
}