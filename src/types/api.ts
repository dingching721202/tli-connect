// ========================================
// API 型別定義 - 標準化響應格式
// ========================================

// ========================================
// 標準API響應格式
// ========================================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message: string;
  error_code?: ErrorCode;
  timestamp: string;
  request_id: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiErrorResponse extends ApiResponse<never> {
  success: false;
  validation_errors?: ValidationError[];
  debug_info?: unknown; // 僅開發環境提供
}

// ========================================
// 錯誤代碼系統 (100+ 錯誤代碼)
// ========================================
export type ErrorCode = 
  // 通用錯誤 (1000-1099)
  | 'INTERNAL_SERVER_ERROR'          // 1000
  | 'VALIDATION_ERROR'               // 1001
  | 'UNAUTHORIZED'                   // 1002
  | 'FORBIDDEN'                      // 1003
  | 'NOT_FOUND'                      // 1004
  | 'METHOD_NOT_ALLOWED'             // 1005
  | 'RATE_LIMITED'                   // 1006
  | 'SERVICE_UNAVAILABLE'            // 1007
  
  // 認證相關錯誤 (1100-1199)
  | 'INVALID_CREDENTIALS'            // 1100
  | 'EMAIL_ALREADY_EXISTS'           // 1101
  | 'PHONE_ALREADY_EXISTS'           // 1102
  | 'WEAK_PASSWORD'                  // 1103
  | 'EMAIL_NOT_VERIFIED'             // 1104
  | 'ACCOUNT_SUSPENDED'              // 1105
  | 'ACCOUNT_INACTIVE'               // 1106
  | 'TOKEN_EXPIRED'                  // 1107
  | 'REGISTRATION_FAILED'            // 1108
  | 'TOKEN_INVALID'                  // 1108
  | 'REFRESH_TOKEN_EXPIRED'          // 1109
  | 'PASSWORD_RESET_TOKEN_INVALID'   // 1110
  | 'PASSWORD_RESET_TOKEN_EXPIRED'   // 1111
  | 'VERIFICATION_CODE_INVALID'      // 1112
  | 'VERIFICATION_CODE_EXPIRED'      // 1113
  | 'TOO_MANY_LOGIN_ATTEMPTS'        // 1114
  | 'USER_NOT_FOUND'                 // 1115
  
  // 會員制度錯誤 (1200-1299)
  | 'MEMBERSHIP_NOT_FOUND'           // 1200
  | 'MEMBERSHIP_EXPIRED'             // 1201
  | 'MEMBERSHIP_NOT_ACTIVE'          // 1202
  | 'MEMBERSHIP_ALREADY_EXISTS'      // 1203
  | 'MEMBERSHIP_ACTIVATION_EXPIRED'  // 1204
  | 'INSUFFICIENT_SESSIONS'          // 1205
  | 'MEMBER_CARD_PLAN_NOT_FOUND'     // 1206
  | 'MEMBER_CARD_PLAN_INACTIVE'      // 1207
  | 'MEMBER_CARD_PLAN_EXPIRED'       // 1208
  | 'ACTIVATION_DEADLINE_PASSED'     // 1209
  | 'ALREADY_ACTIVATED'              // 1210
  | 'CANNOT_ACTIVATE_EXPIRED_CARD'   // 1211
  
  // 課程相關錯誤 (1300-1399)
  | 'COURSE_MODULE_NOT_FOUND'        // 1300
  | 'COURSE_SCHEDULE_NOT_FOUND'      // 1301
  | 'COURSE_SESSION_NOT_FOUND'       // 1302
  | 'COURSE_NOT_AVAILABLE'           // 1303
  | 'COURSE_FULL'                    // 1304
  | 'COURSE_CANCELED'                // 1305
  | 'COURSE_NOT_STARTED'             // 1306
  | 'COURSE_ALREADY_ENDED'           // 1307
  | 'ENROLLMENT_DEADLINE_PASSED'     // 1308
  | 'COURSE_PREREQUISITE_NOT_MET'    // 1309
  | 'COURSE_ACCESS_DENIED'           // 1310
  | 'INVALID_COURSE_LEVEL'           // 1311
  | 'TEACHER_NOT_AVAILABLE'          // 1312
  | 'COURSE_SCHEDULE_CONFLICT'       // 1313
  | 'SESSION_ALREADY_COMPLETED'      // 1314
  | 'SESSION_IN_PROGRESS'            // 1315
  
  // 預約相關錯誤 (1400-1499)
  | 'BOOKING_NOT_FOUND'              // 1400
  | 'BOOKING_ALREADY_EXISTS'         // 1401
  | 'BOOKING_CANCELED'               // 1402
  | 'CANNOT_CANCEL_WITHIN_24H'       // 1403
  | 'TIMESLOT_FULL'                  // 1404
  | 'TIMESLOT_NOT_AVAILABLE'         // 1405
  | 'BOOKING_LIMIT_EXCEEDED'         // 1406
  | 'INVALID_BOOKING_TIME'           // 1407
  | 'BATCH_BOOKING_FAILED'           // 1408
  | 'BOOKING_CONFLICT'               // 1409
  | 'CANNOT_BOOK_PAST_SESSION'       // 1410
  | 'BOOKING_WINDOW_CLOSED'          // 1411
  | 'WAITLIST_FULL'                  // 1412
  | 'ALREADY_ON_WAITLIST'            // 1413
  | 'NOT_ELIGIBLE_FOR_BOOKING'       // 1414
  | 'BOOKING_REQUIRES_MEMBERSHIP'    // 1415
  
  // 付款相關錯誤 (1500-1599)
  | 'PAYMENT_FAILED'                 // 1500
  | 'PAYMENT_DECLINED'               // 1501
  | 'PAYMENT_TIMEOUT'                // 1502
  | 'PAYMENT_CANCELED'               // 1503
  | 'INVALID_PAYMENT_METHOD'         // 1504
  | 'INSUFFICIENT_FUNDS'             // 1505
  | 'PAYMENT_ALREADY_PROCESSED'      // 1506
  | 'ORDER_NOT_FOUND'                // 1507
  | 'ORDER_ALREADY_PAID'             // 1508
  | 'ORDER_EXPIRED'                  // 1509
  | 'ORDER_CANCELED'                 // 1510
  | 'INVALID_ORDER_STATUS'           // 1511
  | 'REFUND_NOT_ALLOWED'             // 1512
  | 'REFUND_FAILED'                  // 1513
  | 'REFUND_ALREADY_PROCESSED'       // 1514
  | 'PAYMENT_GATEWAY_ERROR'          // 1515
  | 'INVALID_AMOUNT'                 // 1516
  | 'CURRENCY_NOT_SUPPORTED'         // 1517
  
  // 企業客戶錯誤 (1600-1699)
  | 'CORPORATE_CLIENT_NOT_FOUND'     // 1600
  | 'CORPORATE_SUBSCRIPTION_EXPIRED' // 1601
  | 'CORPORATE_EMPLOYEE_LIMIT_EXCEEDED' // 1602
  | 'CORPORATE_ACCESS_DENIED'        // 1603
  | 'CORPORATE_CONTRACT_EXPIRED'     // 1604
  | 'CORPORATE_PAYMENT_OVERDUE'      // 1605
  | 'CORPORATE_INQUIRY_NOT_FOUND'    // 1606
  | 'CORPORATE_EMPLOYEE_NOT_FOUND'   // 1607
  | 'CORPORATE_SUBSCRIPTION_NOT_FOUND' // 1608
  | 'CORPORATE_QUOTA_EXCEEDED'       // 1609
  
  // 代理商錯誤 (1700-1799)
  | 'AGENT_NOT_FOUND'                // 1700
  | 'AGENT_CODE_INVALID'             // 1701
  | 'AGENT_INACTIVE'                 // 1702
  | 'AGENT_SUSPENDED'                // 1703
  | 'REFERRAL_CODE_INVALID'          // 1704
  | 'REFERRAL_ALREADY_EXISTS'        // 1705
  | 'COMMISSION_NOT_FOUND'           // 1706
  | 'COMMISSION_ALREADY_PAID'        // 1707
  | 'INSUFFICIENT_COMMISSION'        // 1708
  | 'AGENT_LEVEL_REQUIREMENT_NOT_MET' // 1709
  | 'CIRCULAR_REFERRAL_DETECTED'     // 1710
  | 'SELF_REFERRAL_NOT_ALLOWED'      // 1711
  
  // 教師相關錯誤 (1800-1899)
  | 'TEACHER_NOT_FOUND'              // 1800
  | 'TEACHER_NOT_AVAILABLE'          // 1801
  | 'TEACHER_ON_LEAVE'               // 1802
  | 'TEACHER_SCHEDULE_CONFLICT'      // 1803
  | 'LEAVE_REQUEST_NOT_FOUND'        // 1804
  | 'LEAVE_REQUEST_ALREADY_APPROVED' // 1805
  | 'LEAVE_REQUEST_ALREADY_REJECTED' // 1806
  | 'INVALID_LEAVE_PERIOD'           // 1807
  | 'TEACHER_QUALIFICATION_EXPIRED'  // 1808
  | 'TEACHER_RATING_TOO_LOW'         // 1809
  
  // 客服相關錯誤 (1900-1999)
  | 'INQUIRY_NOT_FOUND'              // 1900
  | 'CASE_ALREADY_CLOSED'            // 1901
  | 'CASE_ASSIGNED_TO_OTHER'         // 1902
  | 'INVALID_CASE_STATUS'            // 1903
  | 'RESPONSE_NOT_FOUND'             // 1904
  | 'UNAUTHORIZED_CASE_ACCESS'       // 1905
  | 'CASE_PRIORITY_INVALID'          // 1906
  | 'INQUIRY_TYPE_INVALID'           // 1907;

// ========================================
// 認證相關API型別
// ========================================
export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  role?: 'STUDENT' | 'TEACHER';
  referral_code?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirm_password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

// ========================================
// 課程相關API型別
// ========================================
export interface CourseSearchParams {
  keyword?: string;
  language?: string;
  level?: string;
  category?: string;
  teacher_id?: number;
  price_min?: number;
  price_max?: number;
  start_date?: string;
  end_date?: string;
  location_type?: 'ONLINE' | 'PHYSICAL' | 'HYBRID';
  available_only?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'price' | 'rating' | 'start_date' | 'popularity';
  sort_order?: 'asc' | 'desc';
}

export interface CourseScheduleResponse {
  id: number;
  course_module: {
    id: number;
    title: string;
    description: string;
    cover_image_url: string;
    language: string;
    level: string;
    categories: string[];
  };
  teacher: {
    id: number;
    name: string;
    rating: number;
    specializations: string[];
  };
  price: number;
  original_price: number;
  currency: string;
  max_students: number;
  current_students: number;
  available_spots: number;
  start_date: string;
  end_date: string;
  enrollment_deadline: string;
  sessions: Array<{
    id: number;
    session_number: number;
    start_time: string;
    end_time: string;
    available_spots: number;
  }>;
  location: {
    type: string;
    address?: string;
    online_link?: string;
  };
  status: string;
}

// ========================================
// 預約相關API型別
// ========================================
export interface BookingRequest {
  course_session_id: number;
  membership_id: number;
  notes?: string;
}

export interface BatchBookingRequest {
  session_ids: number[];
  membership_id: number;
  notes?: string;
}

export interface BookingResponse {
  id: number;
  course_session: {
    id: number;
    course_schedule: {
      id: number;
      title: string;
      teacher_name: string;
    };
    start_time: string;
    end_time: string;
    topic?: string;
  };
  status: string;
  booking_time: string;
  can_cancel: boolean;
  cancellation_deadline?: string;
}

export interface CancelBookingRequest {
  reason?: string;
}

// ========================================
// 會員制度API型別
// ========================================
export interface MemberCardPlanResponse {
  id: number;
  name: string;
  description: string;
  type: string;
  duration_days: number;
  price: number;
  original_price: number;
  currency: string;
  benefits: string[];
  available_courses: Array<{
    id: number;
    title: string;
    language: string;
    level: string;
  }>;
  terms_and_conditions: string;
  is_popular?: boolean;
  discount_percentage?: number;
}

export interface PurchaseMembershipRequest {
  member_card_plan_id: number;
  payment_method: string;
  return_url?: string;
}

export interface ActivateMembershipRequest {
  membership_id: number;
}

export interface MembershipResponse {
  id: number;
  plan: {
    id: number;
    name: string;
    type: string;
    duration_days: number;
  };
  status: string;
  purchase_date: string;
  activation_deadline: string;
  activated_at?: string;
  start_date?: string;
  end_date?: string;
  remaining_sessions: number;
  days_until_expiry?: number;
  can_activate: boolean;
}

// ========================================
// 用戶資料API型別
// ========================================
export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  profile?: {
    avatar_url?: string;
    date_of_birth?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    nationality?: string;
    language_preference?: 'zh-TW' | 'en-US' | 'ja-JP';
    learning_goals?: string[];
  };
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UserProfileResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  profile: {
    avatar_url?: string;
    date_of_birth?: string;
    gender?: string;
    nationality?: string;
    language_preference: string;
    timezone: string;
    learning_goals?: string[];
  };
  created_at: string;
  updated_at: string;
}

// ========================================
// 企業客戶API型別
// ========================================
export interface CorporateInquiryRequest {
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
  message?: string;
}

export interface CorporateClientRequest {
  company_name: string;
  registration_number?: string;
  industry: string;
  company_size: string;
  address: string;
  primary_contact: {
    name: string;
    position: string;
    email: string;
    phone: string;
    department?: string;
  };
  billing_contact?: {
    name: string;
    position: string;
    email: string;
    phone: string;
    department?: string;
  };
  contract_terms: {
    start_date: string;
    end_date: string;
    auto_renewal: boolean;
    payment_terms: 'NET_30' | 'NET_60' | 'PREPAID';
    discount_rate: number;
    minimum_commitment?: number;
  };
}

// ========================================
// 客服API型別
// ========================================
export interface ContactInquiryRequest {
  inquiry_type: 'GENERAL' | 'TECHNICAL' | 'BILLING' | 'COURSE' | 'COMPLAINT';
  subject: string;
  message: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
}

export interface CaseResponseRequest {
  message: string;
  is_internal_note?: boolean;
}

// ========================================
// 報表與分析API型別
// ========================================
export interface AnalyticsParams {
  start_date: string;
  end_date: string;
  granularity?: 'day' | 'week' | 'month';
  filters?: Record<string, unknown>;
}

export interface BookingAnalytics {
  total_bookings: number;
  confirmed_bookings: number;
  canceled_bookings: number;
  no_show_bookings: number;
  booking_rate: number;
  cancellation_rate: number;
  popular_courses: Array<{
    course_id: number;
    course_title: string;
    booking_count: number;
  }>;
  booking_trends: Array<{
    date: string;
    count: number;
  }>;
}

export interface RevenueAnalytics {
  total_revenue: number;
  membership_revenue: number;
  course_revenue: number;
  refunded_amount: number;
  net_revenue: number;
  revenue_trends: Array<{
    date: string;
    amount: number;
  }>;
  top_products: Array<{
    product_type: string;
    product_id: number;
    product_name: string;
    revenue: number;
  }>;
}

// ========================================
// 檔案上傳API型別
// ========================================
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mime_type: string;
  upload_id: string;
}

export interface BulkUploadResponse {
  successful_uploads: FileUploadResponse[];
  failed_uploads: Array<{
    filename: string;
    error: string;
  }>;
}

// ========================================
// 通知API型別
// ========================================
export interface NotificationResponse {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  sent_at: string;
  read_at?: string;
  data?: unknown;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  notification_types: {
    booking_confirmations: boolean;
    payment_updates: boolean;
    course_updates: boolean;
    promotional: boolean;
  };
}

// ========================================
// 系統健康檢查API型別
// ========================================
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: {
      status: 'healthy' | 'unhealthy';
      response_time_ms: number;
    };
    storage: {
      status: 'healthy' | 'unhealthy';
      available_space_gb: number;
    };
    external_services: Array<{
      name: string;
      status: 'healthy' | 'unhealthy';
      response_time_ms?: number;
    }>;
  };
  version: string;
  uptime_seconds: number;
}