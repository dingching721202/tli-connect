// 統一的類型定義匯出

// 用戶相關類型
export * from './user';
export type { 
  User, 
  UserWithPassword, 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserRoleAssignment,
  UserStats,
  UserFilter,
  UserRole,
  MembershipStatus,
  AccountStatus,
  Campus
} from './user';

// 會員相關類型
export * from './membership';
export type {
  Membership,
  MemberCard,
  MemberCardPlan,
  CreateMembershipRequest,
  UpdateMembershipRequest,
  MembershipStats,
  MembershipFilter,
  CreateMemberCardPlanRequest,
  UpdateMemberCardPlanRequest,
  CreateMemberCardRequest,
  MembershipWithDetails,
  MemberCardStatus,
  UserType,
  DurationType,
  MembershipStatus
} from './membership';

// 支付相關類型（向後相容）
export interface PaymentRequest {
  order_id: number | string;
  amount: number;
  payment_method?: PaymentMethod;
  description?: string;
  return_url?: string;
  cancel_url?: string;
}

export interface PaymentResponse {
  payment_id: string;
  payment_url?: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
}

export interface PaymentResult {
  success: boolean;
  payment: PaymentResponse;
  error?: string;
}

// 認證相關類型（向後相容）
export interface LoginResponse {
  success: boolean;
  user?: User;
  user_id?: number;
  jwt?: string;
  error?: string;
}

// 批量預約回應（向後相容）
export interface BatchBookingResponse {
  success: boolean;
  bookings?: ClassAppointment[];
  failed_bookings?: number[];
  failed?: number[];
  error?: string;
}

// 訂單相關類型
export * from './order';
export type {
  Order,
  CreateOrderRequest,
  UpdateOrderRequest,
  PaymentCallback,
  OrderStats,
  OrderFilter,
  OrderWithDetails,
  BatchOrderOperation,
  RefundRequest,
  RefundRecord,
  OrderStatus,
  PaymentMethod
} from './order';

// 課程相關類型（保留現有定義）
export interface Course {
  id: number;
  title: string;
  description: string;
  cover_image_url: string;
  categories: string[];
  language: string;
  created_at: string;
}

export interface Class {
  id: number;
  course_id: number;
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface Lesson {
  id: number;
  course_id: number;
  order: number;
  created_at: string;
}

// 排課系統相關類型
export interface ClassTimeslot {
  id: number;
  class_id: number;
  start_time: string;
  end_time: string;
  max_capacity: number;
  current_bookings: number;
  status: 'OPEN' | 'FULL' | 'CANCELED';
  teacher_id?: number;
  created_at: string;
}

export interface ClassAppointment {
  id: number;
  class_timeslot_id: number;
  user_id: number;
  status: 'BOOKED' | 'CONFIRMED' | 'CANCELED' | 'COMPLETED';
  booking_time: string;
  notes?: string;
}

// 通用響應類型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 分頁相關類型
export interface PaginationParams {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// 預設匯出主要類型
export { User as default } from './user';