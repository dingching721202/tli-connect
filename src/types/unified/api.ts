/**
 * 統一 API 型別定義
 * 
 * 定義所有 API 端點的請求和回應型別
 * 遵循 RESTful 設計原則
 */

import { 
  CoreUser, 
  Organization, 
  UnifiedMembership, 
  MembershipPlan, 
  CourseTemplate, 
  CourseSchedule, 
  CourseSession, 
  CourseEnrollment, 
  Order, 
  UserRole, 
  CorporateSubscription, 
  CorporateMember, 
  Agent, 
  LeaveRequest, 
  SystemSetting, 
  ActivityLog,
  ApiResponse,
  ListQueryParams,
  RoleType,
  MembershipStatus,
  AccountStatus,
  Campus,
  OrderStatus,
  PaymentMethod
} from './database';

// ===== 認證相關 API =====

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: CoreUser;
  token: string;
  expires_at: string;
  roles: RoleType[];
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  campus?: Campus;
}

export interface RegisterResponse {
  user: CoreUser;
  token: string;
  expires_at: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordUpdateRequest {
  current_password: string;
  new_password: string;
}

// ===== 用戶管理 API =====

export interface CreateUserRequest {
  email: string;
  name: string;
  phone: string;
  campus: Campus;
  roles: RoleType[];
  membership_status?: MembershipStatus;
  corp_id?: string;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  campus?: Campus;
  account_status?: AccountStatus;
  membership_status?: MembershipStatus;
  corp_id?: string;
}

export interface UserListResponse {
  users: (CoreUser & {
    roles: RoleType[];
    organization?: Pick<Organization, 'id' | 'name'>;
  })[];
}

export interface UserDetailResponse {
  user: CoreUser & {
    roles: RoleType[];
    organization?: Organization;
    memberships?: UnifiedMembership[];
    agent_data?: Agent;
  };
}

export interface UpdateUserRolesRequest {
  roles: RoleType[];
}

// ===== 會員管理 API =====

export interface CreateMembershipRequest {
  user_id: number;
  plan_id: number;
  membership_type: 'individual' | 'corporate';
  organization_id?: string;
  amount_paid: number;
  auto_renewal?: boolean;
  activation_date?: string; // 立即啟用時使用
}

export interface UpdateMembershipRequest {
  status?: 'inactive' | 'activated' | 'expired' | 'cancelled';
  expiry_date?: string;
  auto_renewal?: boolean;
}

export interface MembershipListQuery extends ListQueryParams {
  filter?: {
    user_id?: number;
    organization_id?: string;
    status?: string[];
    membership_type?: 'individual' | 'corporate';
    expiring_within_days?: number;
  };
}

export interface MembershipListResponse {
  memberships: (UnifiedMembership & {
    user: Pick<CoreUser, 'id' | 'name' | 'email'>;
    plan: Pick<MembershipPlan, 'id' | 'title' | 'duration_type'>;
    organization?: Pick<Organization, 'id' | 'name'>;
  })[];
}

export interface ActivateMembershipResponse {
  membership: UnifiedMembership;
  activation_date: string;
  expiry_date: string;
}

// ===== 企業管理 API =====

export interface CreateOrganizationRequest {
  name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  address?: string;
  industry: string;
  employee_count: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  industry?: string;
  employee_count?: string;
  status?: MembershipStatus;
}

export interface OrganizationListQuery extends ListQueryParams {
  filter?: {
    status?: MembershipStatus[];
    industry?: string[];
  };
}

export interface OrganizationDetailResponse {
  organization: Organization;
  subscriptions: CorporateSubscription[];
  members: CorporateMember[];
  contact_user?: CoreUser;
}

// ===== 企業訂閱 API =====

export interface CreateCorporateSubscriptionRequest {
  organization_id: string;
  plan_id: number;
  seats_total: number;
  amount_paid: number;
  auto_renewal?: boolean;
}

export interface UpdateCorporateSubscriptionRequest {
  status?: 'inactive' | 'activated' | 'expired' | 'cancelled';
  seats_total?: number;
  auto_renewal?: boolean;
}

export interface IssueCorporateMemberRequest {
  subscription_id: number;
  user_name: string;
  user_email: string;
  auto_activate?: boolean;
}

export interface CorporateSubscriptionDetailResponse {
  subscription: CorporateSubscription & {
    organization: Pick<Organization, 'id' | 'name'>;
    plan: Pick<MembershipPlan, 'id' | 'title' | 'duration_type'>;
  };
  members: (CorporateMember & {
    user?: Pick<CoreUser, 'id' | 'name' | 'email'>;
  })[];
}

// ===== 課程管理 API =====

export interface CreateCourseTemplateRequest {
  title: string;
  description: string;
  category: CourseTemplate['category'];
  level: CourseTemplate['level'];
  format: CourseTemplate['format'];
  total_sessions: number;
  session_duration_minutes: number;
  default_capacity: number;
  min_capacity: number;
  max_capacity: number;
  base_pricing: CourseTemplate['base_pricing'];
  materials?: CourseTemplate['materials'];
  learning_objectives: string[];
  prerequisites?: string[];
  target_audience?: string[];
  tags?: string[];
}

export interface UpdateCourseTemplateRequest {
  title?: string;
  description?: string;
  category?: CourseTemplate['category'];
  level?: CourseTemplate['level'];
  format?: CourseTemplate['format'];
  is_active?: boolean;
  is_featured?: boolean;
  display_order?: number;
  tags?: string[];
}

export interface CreateCourseScheduleRequest {
  template_id: string;
  instructor_id: number;
  title: string;
  code: string;
  start_date: string;
  end_date: string;
  timezone: string;
  delivery_mode: CourseSchedule['delivery_mode'];
  classroom?: string;
  online_meeting_url?: string;
  capacity?: number;
  enrollment_open_date?: string;
  enrollment_close_date?: string;
  session_schedule: {
    session_number: number;
    start_time: string;
    end_time: string;
    title?: string;
    classroom?: string;
  }[];
}

export interface UpdateCourseScheduleRequest {
  title?: string;
  instructor_id?: number;
  capacity?: number;
  status?: CourseSchedule['status'];
  enrollment_open_date?: string;
  enrollment_close_date?: string;
}

export interface CourseListQuery extends ListQueryParams {
  filter?: {
    category?: string[];
    level?: string[];
    format?: string[];
    instructor_id?: number;
    status?: string[];
    has_available_spots?: boolean;
  };
}

export interface CourseScheduleDetailResponse {
  schedule: CourseSchedule & {
    template: CourseTemplate;
    instructor: Pick<CoreUser, 'id' | 'name' | 'email'>;
  };
  sessions: (CourseSession & {
    enrollments: number;
    waitlist: number;
  })[];
}

// ===== 預約管理 API =====

export interface CreateEnrollmentRequest {
  session_id: string;
  user_id: number;
  membership_id?: number;
  join_waitlist_if_full?: boolean;
  payment_method?: PaymentMethod;
  notes?: string;
}

export interface BatchEnrollmentRequest {
  user_id: number;
  session_ids: string[];
  membership_id?: number;
  join_waitlist_if_full?: boolean;
  payment_method?: PaymentMethod;
}

export interface UpdateEnrollmentRequest {
  status?: CourseEnrollment['status'];
  attendance_status?: CourseEnrollment['attendance_status'];
  student_rating?: number;
  student_feedback?: string;
  instructor_notes?: string;
}

export interface EnrollmentListQuery extends ListQueryParams {
  filter?: {
    user_id?: number;
    session_id?: string;
    schedule_id?: string;
    status?: string[];
    attendance_status?: string[];
    date_from?: string;
    date_to?: string;
  };
}

export interface BatchEnrollmentResponse {
  successful: {
    session_id: string;
    enrollment_id: string;
    status: CourseEnrollment['status'];
  }[];
  failed: {
    session_id: string;
    reason: string;
    error_code: string;
  }[];
}

// ===== 訂單管理 API =====

export interface CreateOrderRequest {
  user_id?: number; // 可選，支援訪客購買
  organization_id?: string; // 企業訂單
  plan_id: number;
  membership_type: 'individual' | 'corporate';
  seats_quantity?: number; // 企業訂單必填
  discount_code?: string;
  // 訪客購買資訊
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  payment_method?: PaymentMethod;
  payment_id?: string;
  payment_details?: Record<string, unknown>;
}

export interface OrderListQuery extends ListQueryParams {
  filter?: {
    user_id?: number;
    organization_id?: string;
    status?: OrderStatus[];
    membership_type?: 'individual' | 'corporate';
    date_from?: string;
    date_to?: string;
    amount_min?: number;
    amount_max?: number;
  };
}

export interface OrderDetailResponse {
  order: Order & {
    user?: Pick<CoreUser, 'id' | 'name' | 'email'>;
    organization?: Pick<Organization, 'id' | 'name'>;
    plan: Pick<MembershipPlan, 'id' | 'title' | 'duration_type' | 'sale_price'>;
  };
  related_memberships?: UnifiedMembership[];
}

// ===== 代理管理 API =====

export interface CreateAgentRequest {
  user_id: number;
  agent_code: string;
  agent_type: Agent['agent_type'];
  commission_rate: number;
  bonus_rate?: number;
  level?: Agent['level'];
  monthly_target?: number;
}

export interface UpdateAgentRequest {
  agent_type?: Agent['agent_type'];
  commission_rate?: number;
  bonus_rate?: number;
  status?: Agent['status'];
  level?: Agent['level'];
  monthly_target?: number;
}

export interface AgentListQuery extends ListQueryParams {
  filter?: {
    agent_type?: Agent['agent_type'][];
    status?: Agent['status'][];
    level?: Agent['level'][];
  };
}

export interface AgentPerformanceResponse {
  agent: Agent & {
    user: Pick<CoreUser, 'id' | 'name' | 'email'>;
  };
  performance: {
    current_month: {
      sales: number;
      commission: number;
      target_progress: number;
    };
    last_month: {
      sales: number;
      commission: number;
    };
    total: {
      sales: number;
      commission: number;
    };
  };
  recent_sales: {
    order_id: number;
    customer_name: string;
    amount: number;
    commission: number;
    date: string;
  }[];
}

// ===== 請假管理 API =====

export interface CreateLeaveRequestRequest {
  session_id: string;
  reason: string;
  note?: string;
  leave_type: LeaveRequest['leave_type'];
}

export interface ReviewLeaveRequestRequest {
  status: 'APPROVED' | 'REJECTED';
  admin_note?: string;
  substitute_teacher_id?: number;
  substitute_notes?: string;
}

export interface LeaveRequestListQuery extends ListQueryParams {
  filter?: {
    teacher_id?: number;
    status?: LeaveRequest['status'][];
    leave_type?: LeaveRequest['leave_type'][];
    date_from?: string;
    date_to?: string;
  };
}

// ===== 系統管理 API =====

export interface UpdateSystemSettingRequest {
  value: Record<string, unknown>;
  description?: string;
}

export interface SystemSettingListQuery extends ListQueryParams {
  filter?: {
    category?: SystemSetting['category'][];
    is_public?: boolean;
  };
}

// ===== 分析和報表 API =====

export interface AnalyticsQuery {
  date_from: string;
  date_to: string;
  group_by?: 'day' | 'week' | 'month';
  metrics?: string[];
}

export interface RevenueAnalyticsResponse {
  total_revenue: number;
  revenue_by_period: {
    period: string;
    revenue: number;
    orders: number;
  }[];
  revenue_by_plan: {
    plan_id: number;
    plan_title: string;
    revenue: number;
    count: number;
  }[];
  revenue_by_type: {
    individual: number;
    corporate: number;
  };
}

export interface UserAnalyticsResponse {
  total_users: number;
  new_users: number;
  active_users: number;
  users_by_role: Record<RoleType, number>;
  users_by_campus: Record<Campus, number>;
  user_growth: {
    period: string;
    new_users: number;
    total_users: number;
  }[];
}

export interface CourseAnalyticsResponse {
  total_schedules: number;
  total_sessions: number;
  total_enrollments: number;
  average_attendance_rate: number;
  popular_courses: {
    template_id: string;
    title: string;
    enrollments: number;
    rating: number;
  }[];
  enrollment_trends: {
    period: string;
    enrollments: number;
    cancellations: number;
  }[];
}

// ===== 錯誤代碼定義 =====

export const API_ERROR_CODES = {
  // 認證錯誤
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // 驗證錯誤
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // 資源錯誤
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // 業務邏輯錯誤
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  MEMBERSHIP_EXPIRED: 'MEMBERSHIP_EXPIRED',
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
  SESSION_FULL: 'SESSION_FULL',
  ENROLLMENT_CLOSED: 'ENROLLMENT_CLOSED',
  CANNOT_CANCEL_WITHIN_24H: 'CANNOT_CANCEL_WITHIN_24H',
  
  // 系統錯誤
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  
  // 付款錯誤
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_TIMEOUT: 'PAYMENT_TIMEOUT',
  INVALID_PAYMENT_METHOD: 'INVALID_PAYMENT_METHOD'
} as const;

export type ApiErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES];