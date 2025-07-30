import type { User } from '@/types/business';
import { users, getUserById } from '@/data/users';

// ========================================
// RBAC 系統服務 - Phase 2.3
// 實現角色基礎存取控制（Role-Based Access Control）
// ========================================

// 角色層級定義（數字越高權限越大）
export const ROLE_LEVELS = {
  STUDENT: 1,
  TEACHER: 2,
  AGENT: 3,
  CORPORATE_CONTACT: 4,
  STAFF: 5,
  ADMIN: 6
} as const;

// 權限定義
export enum Permission {
  // 課程相關
  VIEW_COURSES = 'view_courses',
  BOOK_COURSES = 'book_courses',
  CANCEL_BOOKINGS = 'cancel_bookings',
  
  // 教師相關
  MANAGE_OWN_SCHEDULE = 'manage_own_schedule',
  VIEW_OWN_STUDENTS = 'view_own_students',
  SUBMIT_LEAVE_REQUEST = 'submit_leave_request',
  
  // 學生相關
  VIEW_OWN_BOOKINGS = 'view_own_bookings',
  VIEW_OWN_MEMBERSHIP = 'view_own_membership',
  PURCHASE_MEMBERSHIP = 'purchase_membership',
  
  // 企業相關
  MANAGE_COMPANY_EMPLOYEES = 'manage_company_employees',
  VIEW_COMPANY_REPORTS = 'view_company_reports',
  MANAGE_CORPORATE_INQUIRIES = 'manage_corporate_inquiries',
  
  // 代理商相關
  VIEW_REFERRAL_STATS = 'view_referral_stats',
  MANAGE_REFERRAL_CODES = 'manage_referral_codes',
  
  // 員工相關
  VIEW_ALL_BOOKINGS = 'view_all_bookings',
  MANAGE_COURSES = 'manage_courses',
  PROCESS_INQUIRIES = 'process_inquiries',
  VIEW_REPORTS = 'view_reports',
  
  // 管理員相關
  MANAGE_USERS = 'manage_users',
  MANAGE_TEACHERS = 'manage_teachers',
  MANAGE_SYSTEM_SETTINGS = 'manage_system_settings',
  VIEW_SYSTEM_LOGS = 'view_system_logs',
  MANAGE_PERMISSIONS = 'manage_permissions'
}

// 角色權限對應表
export const ROLE_PERMISSIONS: Record<User['role'], Permission[]> = {
  STUDENT: [
    Permission.VIEW_COURSES,
    Permission.BOOK_COURSES,
    Permission.CANCEL_BOOKINGS,
    Permission.VIEW_OWN_BOOKINGS,
    Permission.VIEW_OWN_MEMBERSHIP,
    Permission.PURCHASE_MEMBERSHIP
  ],
  
  TEACHER: [
    Permission.VIEW_COURSES,
    Permission.MANAGE_OWN_SCHEDULE,
    Permission.VIEW_OWN_STUDENTS,
    Permission.SUBMIT_LEAVE_REQUEST
  ],
  
  AGENT: [
    Permission.VIEW_COURSES,
    Permission.VIEW_REFERRAL_STATS,
    Permission.MANAGE_REFERRAL_CODES
  ],
  
  CORPORATE_CONTACT: [
    Permission.VIEW_COURSES,
    Permission.MANAGE_COMPANY_EMPLOYEES,
    Permission.VIEW_COMPANY_REPORTS,
    Permission.MANAGE_CORPORATE_INQUIRIES
  ],
  
  STAFF: [
    Permission.VIEW_COURSES,
    Permission.VIEW_ALL_BOOKINGS,
    Permission.MANAGE_COURSES,
    Permission.PROCESS_INQUIRIES,
    Permission.VIEW_REPORTS,
    Permission.MANAGE_CORPORATE_INQUIRIES
  ],
  
  ADMIN: [
    Permission.VIEW_COURSES,
    Permission.BOOK_COURSES,
    Permission.CANCEL_BOOKINGS,
    Permission.VIEW_ALL_BOOKINGS,
    Permission.MANAGE_COURSES,
    Permission.PROCESS_INQUIRIES,
    Permission.VIEW_REPORTS,
    Permission.MANAGE_USERS,
    Permission.MANAGE_TEACHERS,
    Permission.MANAGE_SYSTEM_SETTINGS,
    Permission.VIEW_SYSTEM_LOGS,
    Permission.MANAGE_PERMISSIONS,
    Permission.MANAGE_CORPORATE_INQUIRIES
  ]
};

// 資源類型定義
export enum ResourceType {
  USER = 'user',
  BOOKING = 'booking',
  COURSE = 'course',
  MEMBERSHIP = 'membership',
  INQUIRY = 'inquiry',
  TEACHER_SCHEDULE = 'teacher_schedule',
  COMPANY = 'company',
  REFERRAL = 'referral'
}

// ========================================
// 權限檢查函數
// ========================================

/**
 * 檢查用戶是否具有特定權限
 * @param userId 用戶ID
 * @param permission 權限
 * @returns 是否具有權限
 */
export const hasPermission = (userId: number, permission: Permission): boolean => {
  const user = getUserById(userId);
  if (!user || user.status !== 'ACTIVE') {
    return false;
  }
  
  const rolePermissions = ROLE_PERMISSIONS[user.role];
  return rolePermissions.includes(permission);
};

/**
 * 檢查用戶是否具有多個權限中的任一個
 * @param userId 用戶ID
 * @param permissions 權限列表
 * @returns 是否具有其中任一權限
 */
export const hasAnyPermission = (userId: number, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(userId, permission));
};

/**
 * 檢查用戶是否具有所有指定權限
 * @param userId 用戶ID
 * @param permissions 權限列表
 * @returns 是否具有所有權限
 */
export const hasAllPermissions = (userId: number, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(userId, permission));
};

/**
 * 獲取用戶的所有權限
 * @param userId 用戶ID
 * @returns 權限列表
 */
export const getUserPermissions = (userId: number): Permission[] => {
  const user = getUserById(userId);
  if (!user || user.status !== 'ACTIVE') {
    return [];
  }
  
  return ROLE_PERMISSIONS[user.role];
};

// ========================================
// 角色檢查函數
// ========================================

/**
 * 檢查用戶是否具有特定角色
 * @param userId 用戶ID
 * @param role 角色
 * @returns 是否具有角色
 */
export const hasRole = (userId: number, role: User['role']): boolean => {
  const user = getUserById(userId);
  return user?.role === role && user.status === 'ACTIVE';
};

/**
 * 檢查用戶是否具有等於或高於指定角色的權限等級
 * @param userId 用戶ID
 * @param minimumRole 最低角色要求
 * @returns 是否滿足角色等級要求
 */
export const hasRoleLevel = (userId: number, minimumRole: User['role']): boolean => {
  const user = getUserById(userId);
  if (!user || user.status !== 'ACTIVE') {
    return false;
  }
  
  const userLevel = ROLE_LEVELS[user.role];
  const minimumLevel = ROLE_LEVELS[minimumRole];
  
  return userLevel >= minimumLevel;
};

/**
 * 檢查用戶是否具有多個角色中的任一個
 * @param userId 用戶ID
 * @param roles 角色列表
 * @returns 是否具有其中任一角色
 */
export const hasAnyRole = (userId: number, roles: User['role'][]): boolean => {
  const user = getUserById(userId);
  if (!user || user.status !== 'ACTIVE') {
    return false;
  }
  
  return roles.includes(user.role);
};

// ========================================
// 資源存取控制
// ========================================

/**
 * 檢查用戶是否可以存取特定資源
 * @param userId 用戶ID
 * @param resourceType 資源類型
 * @param resourceId 資源ID
 * @param action 動作（view, edit, delete等）
 * @returns 是否可以存取
 */
export const canAccessResource = (
  userId: number,
  resourceType: ResourceType,
  resourceId: number,
  action: 'view' | 'edit' | 'delete' | 'create' = 'view'
): boolean => {
  const user = getUserById(userId);
  if (!user || user.status !== 'ACTIVE') {
    return false;
  }
  
  // 管理員可以存取所有資源
  if (user.role === 'ADMIN') {
    return true;
  }
  
  switch (resourceType) {
    case ResourceType.USER:
      return canAccessUser(userId, resourceId, action);
    case ResourceType.BOOKING:
      return canAccessBooking(userId, resourceId, action);
    case ResourceType.COURSE:
      return canAccessCourse(userId, resourceId, action);
    case ResourceType.MEMBERSHIP:
      return canAccessMembership(userId, resourceId, action);
    case ResourceType.INQUIRY:
      return canAccessInquiry(userId, resourceId, action);
    case ResourceType.TEACHER_SCHEDULE:
      return canAccessTeacherSchedule(userId, resourceId, action);
    case ResourceType.COMPANY:
      return canAccessCompany(userId, resourceId, action);
    case ResourceType.REFERRAL:
      return canAccessReferral(userId, resourceId, action);
    default:
      return false;
  }
};

// ========================================
// 特定資源存取檢查函數
// ========================================

/**
 * 檢查用戶是否可以存取其他用戶資料
 */
const canAccessUser = (userId: number, targetUserId: number, action: string): boolean => {
  // 用戶可以查看自己的資料
  if (userId === targetUserId && action === 'view') {
    return true;
  }
  
  // 員工和管理員可以查看所有用戶
  if (hasAnyRole(userId, ['STAFF', 'ADMIN']) && action === 'view') {
    return true;
  }
  
  // 只有管理員可以編輯/刪除用戶
  if (hasRole(userId, 'ADMIN') && (action === 'edit' || action === 'delete')) {
    return true;
  }
  
  return false;
};

/**
 * 檢查用戶是否可以存取預約記錄
 */
const canAccessBooking = (userId: number, bookingId: number, action: string): boolean => {
  // 這裡需要根據實際的預約資料來檢查
  // 暫時返回基本權限檢查
  if (action === 'view') {
    return hasAnyPermission(userId, [Permission.VIEW_OWN_BOOKINGS, Permission.VIEW_ALL_BOOKINGS]);
  }
  
  if (action === 'edit' || action === 'delete') {
    return hasPermission(userId, Permission.CANCEL_BOOKINGS);
  }
  
  return false;
};

/**
 * 檢查用戶是否可以存取課程
 */
const canAccessCourse = (userId: number, courseId: number, action: string): boolean => {
  if (action === 'view') {
    return hasPermission(userId, Permission.VIEW_COURSES);
  }
  
  if (action === 'edit' || action === 'delete' || action === 'create') {
    return hasPermission(userId, Permission.MANAGE_COURSES);
  }
  
  return false;
};

/**
 * 檢查用戶是否可以存取會員卡
 */
const canAccessMembership = (userId: number, membershipId: number, action: string): boolean => {
  // 用戶可以查看自己的會員卡
  if (action === 'view') {
    return hasPermission(userId, Permission.VIEW_OWN_MEMBERSHIP);
  }
  
  return false;
};

/**
 * 檢查用戶是否可以存取詢問記錄
 */
const canAccessInquiry = (userId: number, inquiryId: number, action: string): boolean => {
  return hasPermission(userId, Permission.MANAGE_CORPORATE_INQUIRIES);
};

/**
 * 檢查用戶是否可以存取教師排程
 */
const canAccessTeacherSchedule = (userId: number, scheduleId: number, action: string): boolean => {
  // 教師可以管理自己的排程
  // 員工和管理員可以管理所有教師排程
  return hasAnyPermission(userId, [Permission.MANAGE_OWN_SCHEDULE, Permission.MANAGE_TEACHERS]);
};

/**
 * 檢查用戶是否可以存取公司資料
 */
const canAccessCompany = (userId: number, companyId: number, action: string): boolean => {
  return hasPermission(userId, Permission.MANAGE_COMPANY_EMPLOYEES);
};

/**
 * 檢查用戶是否可以存取推薦資料
 */
const canAccessReferral = (userId: number, referralId: number, action: string): boolean => {
  return hasPermission(userId, Permission.MANAGE_REFERRAL_CODES);
};

// ========================================
// 權限裝飾器函數
// ========================================

/**
 * 權限檢查裝飾器類型
 */
export interface AuthorizationResult {
  authorized: boolean;
  message?: string;
  redirectTo?: string;
}

/**
 * 檢查頁面存取權限
 * @param userId 用戶ID
 * @param requiredRole 必要角色
 * @param requiredPermissions 必要權限
 * @returns 授權結果
 */
export const checkPageAccess = (
  userId: number,
  requiredRole?: User['role'],
  requiredPermissions?: Permission[]
): AuthorizationResult => {
  const user = getUserById(userId);
  
  if (!user) {
    return {
      authorized: false,
      message: '用戶不存在',
      redirectTo: '/login'
    };
  }
  
  if (user.status !== 'ACTIVE') {
    return {
      authorized: false,
      message: '帳號已被停用',
      redirectTo: '/login'
    };
  }
  
  if (requiredRole && !hasRoleLevel(userId, requiredRole)) {
    return {
      authorized: false,
      message: '權限不足',
      redirectTo: '/unauthorized'
    };
  }
  
  if (requiredPermissions && !hasAllPermissions(userId, requiredPermissions)) {
    return {
      authorized: false,
      message: '權限不足',
      redirectTo: '/unauthorized'
    };
  }
  
  return { authorized: true };
};

/**
 * API 權限檢查
 * @param userId 用戶ID
 * @param requiredPermissions 必要權限
 * @returns 授權結果
 */
export const checkApiAccess = (
  userId: number,
  requiredPermissions: Permission[]
): AuthorizationResult => {
  const user = getUserById(userId);
  
  if (!user || user.status !== 'ACTIVE') {
    return {
      authorized: false,
      message: '未授權的存取'
    };
  }
  
  if (!hasAllPermissions(userId, requiredPermissions)) {
    return {
      authorized: false,
      message: '權限不足'
    };
  }
  
  return { authorized: true };
};

// ========================================
// 工具函數
// ========================================

/**
 * 獲取角色的顯示名稱
 * @param role 角色
 * @returns 顯示名稱
 */
export const getRoleDisplayName = (role: User['role']): string => {
  const roleNames = {
    STUDENT: '學生',
    TEACHER: '教師',
    AGENT: '代理商',
    CORPORATE_CONTACT: '企業聯絡人',
    STAFF: '員工',
    ADMIN: '管理員'
  };
  
  return roleNames[role];
};

/**
 * 獲取權限的顯示名稱
 * @param permission 權限
 * @returns 顯示名稱
 */
export const getPermissionDisplayName = (permission: Permission): string => {
  const permissionNames = {
    [Permission.VIEW_COURSES]: '查看課程',
    [Permission.BOOK_COURSES]: '預約課程',
    [Permission.CANCEL_BOOKINGS]: '取消預約',
    [Permission.MANAGE_OWN_SCHEDULE]: '管理個人排程',
    [Permission.VIEW_OWN_STUDENTS]: '查看學生名單',
    [Permission.SUBMIT_LEAVE_REQUEST]: '提交請假申請',
    [Permission.VIEW_OWN_BOOKINGS]: '查看個人預約',
    [Permission.VIEW_OWN_MEMBERSHIP]: '查看個人會員卡',
    [Permission.PURCHASE_MEMBERSHIP]: '購買會員卡',
    [Permission.MANAGE_COMPANY_EMPLOYEES]: '管理公司員工',
    [Permission.VIEW_COMPANY_REPORTS]: '查看公司報表',
    [Permission.MANAGE_CORPORATE_INQUIRIES]: '管理企業詢問',
    [Permission.VIEW_REFERRAL_STATS]: '查看推薦統計',
    [Permission.MANAGE_REFERRAL_CODES]: '管理推薦代碼',
    [Permission.VIEW_ALL_BOOKINGS]: '查看所有預約',
    [Permission.MANAGE_COURSES]: '管理課程',
    [Permission.PROCESS_INQUIRIES]: '處理詢問',
    [Permission.VIEW_REPORTS]: '查看報表',
    [Permission.MANAGE_USERS]: '管理用戶',
    [Permission.MANAGE_TEACHERS]: '管理教師',
    [Permission.MANAGE_SYSTEM_SETTINGS]: '管理系統設定',
    [Permission.VIEW_SYSTEM_LOGS]: '查看系統日誌',
    [Permission.MANAGE_PERMISSIONS]: '管理權限'
  };
  
  return permissionNames[permission] || permission;
};

// ========================================
// 預設匯出
// ========================================

export default {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getUserPermissions,
  hasRole,
  hasRoleLevel,
  hasAnyRole,
  canAccessResource,
  checkPageAccess,
  checkApiAccess,
  getRoleDisplayName,
  getPermissionDisplayName,
  ROLE_LEVELS,
  ROLE_PERMISSIONS,
  Permission,
  ResourceType
};