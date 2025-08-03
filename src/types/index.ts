// 使用者相關類型
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'STUDENT' | 'TEACHER' | 'OPS' | 'CORPORATE_CONTACT' | 'ADMIN' | 'AGENT';
  created_at: string;
}

// 課程相關類型
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

export interface LessonAttachment {
  id: number;
  lesson_id: number;
  video_duration_in_seconds: number;
  video_url: string;
  created_at: string;
}

export interface LessonAttachmentRecord {
  id: number;
  lesson_attachment_id: number;
  progress: number;
  user_id: number;
  created_at: string;
}

// 會員制度相關類型
export interface MemberCard {
  id: number;
  name: string;
  available_course_ids: number[];
  created_at: string;
}

export interface MemberCardPlan {
  id: number;
  member_card_id: number;
  title?: string;
  type: 'SEASON' | 'YEAR';
  duration_days?: number;
  price: number | string;
  status?: 'DRAFT' | 'PUBLISHED';
  created_at: string;
}

export interface Membership {
  id: number;
  member_card_id: number;
  user_id: number;
  duration_in_days: number;
  start_time: string | null;
  expire_time: string | null;
  status: 'PURCHASED' | 'ACTIVE' | 'EXPIRED';
  activated: boolean;
  activate_expire_time: string;
  created_at: string;
  plan_id?: number;
  user_email?: string;
  user_name?: string;
  order_id?: number;
  start_date?: string;
  end_date?: string;
}

export interface Order {
  id: number;
  member_card_plan_id: number;
  user_id: number;
  price: number | string;
  status: 'CREATED' | 'COMPLETED' | 'CANCELED';
  created_at: string;
}

// 排課系統相關類型
export interface ClassTimeslot {
  id: number;
  class_id: number;
  start_time: string;
  end_time: string;
  capacity?: number;
  reserved_count?: number;
  status: 'CREATED' | 'CANCELED' | 'AVAILABLE';
  created_at: string;
}

export interface ClassAppointment {
  id: number;
  class_timeslot_id: number;
  user_id: number;
  status: 'CONFIRMED' | 'CANCELED';
  created_at: string;
}

export interface TeacherLeaveRecord {
  id: number;
  class_timeslot_id: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

export interface Todo {
  id: number;
  name: string;
  due_date: string;
  is_completed: boolean;
  created_at: string;
}

// 付款相關類型
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

export interface PaymentResult {
  success: boolean;
  data?: PaymentResponse;
  error?: string;
}

// API 響應類型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginResponse {
  success: boolean;
  user_id?: number;
  jwt?: string;
  error?: string;
}

export interface BatchBookingResponse {
  success: Array<{
    timeslot_id: number;
    booking_id: number;
  }>;
  failed: Array<{
    timeslot_id: number;
    reason: 'FULL' | 'WITHIN_24H' | 'MEMBERSHIP_EXPIRED';
  }>;
}

// 錯誤代碼類型
export type ErrorCode = 
  | 'EMAIL_ALREADY_EXISTS'
  | 'INVALID_CREDENTIALS'
  | 'ACTIVE_CARD_EXISTS'
  | 'CANNOT_CANCEL_WITHIN_24H'
  | 'MEMBERSHIP_EXPIRED'
  | 'TIMESLOT_FULL'
  | 'TIMESLOT_WITHIN_24H';