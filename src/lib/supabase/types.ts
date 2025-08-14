// ===== 基礎型別 =====
export type Role = 'STUDENT' | 'TEACHER' | 'CORPORATE_CONTACT' | 'AGENT' | 'STAFF' | 'ADMIN';
export type Campus = 'TAIPEI' | 'TAICHUNG' | 'KAOHSIUNG';
export type MembershipStatus = 'PURCHASED' | 'ACTIVATED' | 'EXPIRED' | 'CANCELLED';
export type MembershipType = 'INDIVIDUAL' | 'CORPORATE';
export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'CANCELLED';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CASH' | 'LINE_PAY' | 'APPLE_PAY';
export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
export type SessionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ActivityType = 'LOGIN' | 'LOGOUT' | 'REGISTER' | 'PURCHASE' | 'BOOKING' | 'CANCELLATION' | 'MEMBERSHIP_ACTIVATE' | 'ROLE_CHANGE';

// ===== 核心資料表型別 =====
export interface CoreUser {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  avatar_url?: string | null;
  phone?: string | null;
  campus: Campus;
  is_active: boolean;
  email_verified: boolean;
  last_login?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  contact_email?: string | null;
  contact_phone?: string | null;
  address?: string | null;
  tax_id?: string | null;
  industry?: string | null;
  campus: Campus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  type: MembershipType;
  duration_months: number;
  price: number;
  currency: string;
  campus: Campus;
  features?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UnifiedMembership {
  id: string;
  user_id: string;
  organization_id?: string | null;
  plan_id: string;
  type: MembershipType;
  status: MembershipStatus;
  card_number?: string | null;
  purchased_at: string;
  activated_at?: string | null;
  expires_at?: string | null;
  auto_renew: boolean;
  campus: Campus;
  created_at: string;
  updated_at: string;
}

export interface CourseTemplate {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  level?: string | null;
  duration_minutes: number;
  max_capacity: number;
  campus: Campus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: Role;
  organization_id?: string | null;
  is_primary: boolean;
  is_locked: boolean;
  assigned_by?: string | null;
  assigned_at: string;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseSchedule {
  id: string;
  template_id: string;
  teacher_id: string;
  start_date: string;
  end_date: string;
  schedule_pattern?: any;
  max_capacity: number;
  campus: Campus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseSession {
  id: string;
  schedule_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: SessionStatus;
  actual_capacity: number;
  notes?: string | null;
  campus: Campus;
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  id: string;
  user_id: string;
  session_id: string;
  enrollment_date: string;
  status: BookingStatus;
  attended?: boolean | null;
  feedback?: string | null;
  rating?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  organization_id?: string | null;
  membership_id?: string | null;
  total_amount: number;
  currency: string;
  status: OrderStatus;
  payment_method?: PaymentMethod | null;
  payment_status: PaymentStatus;
  payment_reference?: string | null;
  items: any;
  notes?: string | null;
  processed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CorporateSubscription {
  id: string;
  organization_id: string;
  plan_name: string;
  total_seats: number;
  used_seats: number;
  price_per_seat: number;
  currency: string;
  status: SubscriptionStatus;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  campus: Campus;
  features?: any;
  created_at: string;
  updated_at: string;
}

export interface CorporateMember {
  id: string;
  subscription_id: string;
  user_id: string;
  membership_id: string;
  assigned_at: string;
  assigned_by?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  user_id: string;
  agent_code: string;
  commission_rate: number;
  total_referrals: number;
  total_commission: number;
  currency: string;
  campus: Campus;
  is_active: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: string;
  teacher_id: string;
  start_date: string;
  end_date: string;
  reason?: string | null;
  status: LeaveStatus;
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  campus: Campus;
  created_at: string;
  updated_at: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  description?: string | null;
  category?: string | null;
  campus?: Campus | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string | null;
  activity_type: ActivityType;
  resource_type?: string | null;
  resource_id?: string | null;
  description: string;
  metadata?: any;
  ip_address?: string | null;
  user_agent?: string | null;
  campus?: Campus | null;
  created_at: string;
}

// Supabase specific types
export interface SupabaseUser {
  id: string
  email: string
  email_confirmed_at?: string
  created_at: string
  updated_at: string
  user_metadata?: Record<string, any>
  app_metadata?: Record<string, any>
}

// Database definition for Supabase
export interface Database {
  public: {
    Tables: {
      core_users: {
        Row: CoreUser
        Insert: Omit<CoreUser, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CoreUser, 'id' | 'created_at'>>
      }
      organizations: {
        Row: Organization
        Insert: Omit<Organization, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Organization, 'id' | 'created_at'>>
      }
      membership_plans: {
        Row: MembershipPlan
        Insert: Omit<MembershipPlan, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<MembershipPlan, 'id' | 'created_at'>>
      }
      unified_memberships: {
        Row: UnifiedMembership
        Insert: Omit<UnifiedMembership, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UnifiedMembership, 'id' | 'created_at'>>
      }
      course_templates: {
        Row: CourseTemplate
        Insert: Omit<CourseTemplate, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CourseTemplate, 'id' | 'created_at'>>
      }
      user_roles: {
        Row: UserRole
        Insert: Omit<UserRole, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserRole, 'id' | 'created_at'>>
      }
      course_schedules: {
        Row: CourseSchedule
        Insert: Omit<CourseSchedule, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CourseSchedule, 'id' | 'created_at'>>
      }
      course_sessions: {
        Row: CourseSession
        Insert: Omit<CourseSession, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CourseSession, 'id' | 'created_at'>>
      }
      course_enrollments: {
        Row: CourseEnrollment
        Insert: Omit<CourseEnrollment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CourseEnrollment, 'id' | 'created_at'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Order, 'id' | 'created_at'>>
      }
      corporate_subscriptions: {
        Row: CorporateSubscription
        Insert: Omit<CorporateSubscription, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CorporateSubscription, 'id' | 'created_at'>>
      }
      corporate_members: {
        Row: CorporateMember
        Insert: Omit<CorporateMember, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CorporateMember, 'id' | 'created_at'>>
      }
      agents: {
        Row: Agent
        Insert: Omit<Agent, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Agent, 'id' | 'created_at'>>
      }
      leave_requests: {
        Row: LeaveRequest
        Insert: Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<LeaveRequest, 'id' | 'created_at'>>
      }
      system_settings: {
        Row: SystemSetting
        Insert: Omit<SystemSetting, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<SystemSetting, 'id' | 'created_at'>>
      }
      activity_logs: {
        Row: ActivityLog
        Insert: Omit<ActivityLog, 'id' | 'created_at'>
        Update: never
      }
    }
    Views: {
      users_with_primary_roles: {
        Row: CoreUser & {
          primary_role: Role | null
          organization_id: string | null
          organization_name: string | null
        }
      }
      active_memberships_with_plans: {
        Row: UnifiedMembership & {
          plan_name: string
          duration_months: number
          price: number
          user_name: string
          user_email: string
          organization_name: string | null
        }
      }
      course_sessions_with_enrollment: {
        Row: CourseSession & {
          course_name: string
          category: string | null
          teacher_name: string
          enrolled_count: number
          max_capacity: number
        }
      }
    }
    Enums: {
      role_type: Role
      campus_type: Campus
      membership_status: MembershipStatus
      membership_type: MembershipType
      subscription_status: SubscriptionStatus
      order_status: OrderStatus
      payment_status: PaymentStatus
      payment_method: PaymentMethod
      booking_status: BookingStatus
      session_status: SessionStatus
      leave_status: LeaveStatus
      activity_type: ActivityType
    }
  }
}

// Database helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Common query result types
export interface QueryResult<T> {
  data: T | null
  error: Error | null
}

export interface QueryListResult<T> {
  data: T[] | null
  error: Error | null
  count?: number | null
}

// Pagination helpers
export interface PaginationOptions {
  page: number
  limit: number
  orderBy?: string
  ascending?: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}