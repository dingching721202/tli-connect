// ========================================
// 主要型別匯出檔案
// ========================================

// 匯出業務型別
export * from './business';

// 匯出API型別
export * from './api';

// 匯出推薦系統型別
export * from './referral';

// ========================================
// 向後相容的型別別名 (逐步棄用)
// ========================================

// 重新匯出主要業務型別以維持向後相容性
export type {
  User,
  UserRole,
  UserStatus,
  CourseModule as Course,
  CourseSchedule as Class,
  CourseSession as Lesson,
  CourseMaterial as LessonAttachment,
  SessionAttendance as LessonAttachmentRecord,
  MemberCardPlan,
  UserMembership as Membership,
  Order,
  CourseSession as ClassTimeslot,
  Booking as ClassAppointment,
  TeacherLeaveRequest as TeacherLeaveRecord,
  PaymentTransaction,
  BatchBookingResult,
  BatchBookingRequest,
} from './business';

// 重新匯出API型別
export type {
  ApiResponse,
  LoginResponse as NewLoginResponse,
  ErrorCode,
} from './api';

// 向後相容的LoginResponse型別
export interface LoginResponse {
  success: boolean;
  user_id?: number;
  jwt?: string;
  error?: string;
}

// 向後相容的PaymentRequest和PaymentResponse型別
export interface PaymentRequest {
  order_id: string;
  amount: number;
  description: string;
  return_url: string;
}

export interface PaymentResponse {
  payment_id: string;
  status: 'successful' | 'failed';
}

// 向後相容的BatchBookingResponse別名
export type BatchBookingResponse = BatchBookingResult;

// ========================================
// 待棄用的型別 (維持向後相容性)
// @deprecated 請使用新的型別定義
// ========================================

export interface Todo {
  id: number;
  name: string;
  due_date: string;
  is_completed: boolean;
  created_at: string;
}

export interface PaymentResult {
  success: boolean;
  data?: {
    payment_id: string;
    status: 'successful' | 'failed';
  };
  error?: string;
}

// ========================================
// 實用型別工具
// ========================================

// 建立部分更新型別
export type PartialUpdate<T> = Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>;

// 建立建立請求型別  
export type CreateRequest<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;

// 分頁參數型別
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// 日期範圍型別
export interface DateRange {
  start_date: string;
  end_date: string;
}

// 搜尋參數基礎型別
export interface BaseSearchParams extends PaginationParams {
  keyword?: string;
  filters?: Record<string, unknown>;
}

// 時間戳型別
export interface Timestamps {
  created_at: string;
  updated_at: string;
}

// ID型別
export type ID = number;

// 狀態變更歷史型別
export interface StatusHistory<T extends string> {
  id: number;
  resource_type: string;
  resource_id: number;
  from_status: T;
  to_status: T;
  changed_by: number;
  reason?: string;
  changed_at: string;
}

// 多語言內容型別
export interface LocalizedContent {
  'zh-TW': string;
  'en-US': string;
  'ja-JP'?: string;
}

// 檔案上傳型別
export interface FileInfo {
  filename: string;
  url: string;
  size: number;
  mime_type: string;
  uploaded_at: string;
}

// 地理位置型別
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
}

// 聯絡資訊型別
export interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  social_media?: Record<string, string>;
}

// 價格資訊型別
export interface PriceInfo {
  amount: number;
  currency: string;
  tax_included: boolean;
  discount_amount?: number;
  original_amount?: number;
}