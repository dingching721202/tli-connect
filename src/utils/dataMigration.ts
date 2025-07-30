// ========================================
// 數據遷移工具 - Phase 3.1
// 將現有數據遷移到新的 MECE 架構
// ========================================

import type { 
  User, 
  CourseModule, 
  UserMembership,
  Booking
} from '@/types/business';

export interface MigrationResult {
  success: boolean;
  message: string;
  migrated_records: number;
  errors: string[];
  warnings: string[];
}

export interface MigrationSummary {
  users: MigrationResult;
  courses: MigrationResult;
  memberships: MigrationResult;
  bookings: MigrationResult;
  corporate: MigrationResult;
  referrals: MigrationResult;
  total_records: number;
  total_errors: number;
  migration_time: string;
}

// ========================================
// 數據驗證工具
// ========================================

/**
 * 驗證用戶數據完整性
 * @param users 用戶數據陣列
 * @returns 驗證結果
 */
export const validateUserData = (users: Partial<User>[]): MigrationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let validRecords = 0;

  users.forEach((user, index) => {
    // 必填欄位檢查
    if (!user.name) {
      errors.push(`用戶 ${index + 1}: 缺少姓名`);
      return;
    }
    
    if (!user.email) {
      errors.push(`用戶 ${index + 1}: 缺少電子郵件`);
      return;
    }
    
    // 電子郵件格式檢查
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      errors.push(`用戶 ${index + 1}: 電子郵件格式不正確 - ${user.email}`);
      return;
    }
    
    // 角色檢查
    const validRoles = ['STUDENT', 'TEACHER', 'ADMIN', 'STAFF', 'CORPORATE_CONTACT', 'AGENT'];
    if (user.role && !validRoles.includes(user.role)) {
      warnings.push(`用戶 ${index + 1}: 未知角色 ${user.role}，將設為 STUDENT`);
    }
    
    // 手機號碼格式檢查
    if (user.phone && !/^09\d{8}$/.test(user.phone)) {
      warnings.push(`用戶 ${index + 1}: 手機號碼格式可能不正確 - ${user.phone}`);
    }
    
    validRecords++;
  });

  return {
    success: errors.length === 0,
    message: errors.length === 0 ? `${validRecords} 筆用戶數據驗證通過` : `發現 ${errors.length} 個錯誤`,
    migrated_records: validRecords,
    errors,
    warnings
  };
};

/**
 * 驗證課程數據完整性
 * @param courses 課程數據陣列
 * @returns 驗證結果
 */
export const validateCourseData = (courses: Partial<CourseModule>[]): MigrationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let validRecords = 0;

  courses.forEach((course, index) => {
    // 必填欄位檢查
    if (!course.title) {
      errors.push(`課程 ${index + 1}: 缺少課程標題`);
      return;
    }
    
    if (!course.description) {
      warnings.push(`課程 ${index + 1}: 缺少課程描述`);
    }
    
    // 語言檢查
    const validLanguages = ['Chinese', 'English', 'Japanese', 'Korean', 'Spanish', 'French'];
    if (course.language && !validLanguages.includes(course.language)) {
      warnings.push(`課程 ${index + 1}: 未知語言 ${course.language}`);
    }
    
    // 難度檢查
    const validLevels = ['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'UPPER_INTERMEDIATE', 'ADVANCED'];
    if (course.level && !validLevels.includes(course.level)) {
      warnings.push(`課程 ${index + 1}: 未知難度 ${course.level}`);
    }
    
    validRecords++;
  });

  return {
    success: errors.length === 0,
    message: errors.length === 0 ? `${validRecords} 筆課程數據驗證通過` : `發現 ${errors.length} 個錯誤`,
    migrated_records: validRecords,
    errors,
    warnings
  };
};

/**
 * 驗證會員卡數據完整性
 * @param memberships 會員卡數據陣列
 * @returns 驗證結果
 */
export const validateMembershipData = (memberships: Partial<UserMembership>[]): MigrationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let validRecords = 0;

  memberships.forEach((membership, index) => {
    // 必填欄位檢查
    if (!membership.user_id) {
      errors.push(`會員卡 ${index + 1}: 缺少用戶ID`);
      return;
    }
    
    if (!membership.member_card_plan_id) {
      errors.push(`會員卡 ${index + 1}: 缺少會員卡方案ID`);
      return;
    }
    
    // 狀態檢查
    const validStatuses = ['PURCHASED', 'ACTIVE', 'EXPIRED', 'SUSPENDED'];
    if (membership.status && !validStatuses.includes(membership.status)) {
      warnings.push(`會員卡 ${index + 1}: 未知狀態 ${membership.status}，將設為 PURCHASED`);
    }
    
    // 日期格式檢查
    if (membership.purchase_date && isNaN(new Date(membership.purchase_date).getTime())) {
      errors.push(`會員卡 ${index + 1}: 購買日期格式不正確`);
      return;
    }
    
    // 剩餘課程數檢查
    if (membership.remaining_sessions !== undefined && membership.remaining_sessions < 0) {
      warnings.push(`會員卡 ${index + 1}: 剩餘課程數不能為負數`);
    }
    
    validRecords++;
  });

  return {
    success: errors.length === 0,
    message: errors.length === 0 ? `${validRecords} 筆會員卡數據驗證通過` : `發現 ${errors.length} 個錯誤`,
    migrated_records: validRecords,
    errors,
    warnings
  };
};

// ========================================
// 數據轉換工具
// ========================================

/**
 * 轉換舊用戶數據格式到新格式
 * @param oldUsers 舊格式用戶數據
 * @returns 新格式用戶數據
 */
export const transformUserData = (oldUsers: Record<string, unknown>[]): User[] => {
  return oldUsers.map((oldUser, index) => {
    const now = new Date().toISOString();
    
    return {
      id: oldUser.id || index + 1,
      name: oldUser.name || oldUser.full_name || `用戶${index + 1}`,
      email: oldUser.email || `user${index + 1}@example.com`,
      phone: oldUser.phone || oldUser.mobile || '',
      password: oldUser.password || 'hashed_password',
      role: normalizeRole(oldUser.role || oldUser.user_type),
      status: normalizeStatus(oldUser.status || oldUser.active),
      profile: {
        language_preference: oldUser.language || 'zh-TW',
        timezone: oldUser.timezone || 'Asia/Taipei',
        ...(oldUser.avatar && { avatar_url: oldUser.avatar }),
        ...(oldUser.birth_date && { date_of_birth: oldUser.birth_date }),
        ...(oldUser.gender && { gender: oldUser.gender.toUpperCase() }),
        ...(oldUser.nationality && { nationality: oldUser.nationality })
      },
      created_at: oldUser.created_at || oldUser.registration_date || now,
      updated_at: oldUser.updated_at || oldUser.last_modified || now
    };
  });
};

/**
 * 轉換舊課程數據格式到新格式
 * @param oldCourses 舊格式課程數據
 * @returns 新格式課程模組數據
 */
export const transformCourseData = (oldCourses: Record<string, unknown>[]): CourseModule[] => {
  return oldCourses.map((oldCourse, index) => {
    const now = new Date().toISOString();
    
    return {
      id: oldCourse.id || index + 1,
      title: oldCourse.title || oldCourse.name || `課程${index + 1}`,
      description: oldCourse.description || oldCourse.summary || '課程描述',
      language: normalizeLanguage(oldCourse.language),
      level: normalizeLevel(oldCourse.level || oldCourse.difficulty),
      category: oldCourse.category || 'GENERAL',
      tags: oldCourse.tags || [],
      objectives: oldCourse.objectives || oldCourse.learning_goals || [],
      materials: oldCourse.materials || [],
      prerequisites: oldCourse.prerequisites || [],
      estimated_duration_hours: oldCourse.duration || oldCourse.hours || 20,
      max_students: oldCourse.max_students || oldCourse.capacity || 15,
      min_students: oldCourse.min_students || 1,
      status: oldCourse.active === false ? 'INACTIVE' : 'ACTIVE',
      created_at: oldCourse.created_at || now,
      updated_at: oldCourse.updated_at || now
    };
  });
};

/**
 * 轉換舊會員卡數據格式到新格式
 * @param oldMemberships 舊格式會員卡數據
 * @returns 新格式會員卡數據
 */
export const transformMembershipData = (oldMemberships: Record<string, unknown>[]): UserMembership[] => {
  return oldMemberships.map((oldMembership, index) => {
    const now = new Date().toISOString();
    const purchaseDate = oldMembership.purchase_date || oldMembership.created_at || now;
    
    return {
      id: oldMembership.id || index + 1,
      user_id: oldMembership.user_id || oldMembership.member_id,
      member_card_plan_id: oldMembership.plan_id || oldMembership.membership_type || 1,
      order_id: oldMembership.order_id || oldMembership.transaction_id,
      status: normalizeMembershipStatus(oldMembership.status),
      purchase_date: purchaseDate,
      activation_deadline: calculateActivationDeadline(purchaseDate),
      activated_at: oldMembership.activated_at || oldMembership.active_date,
      start_date: oldMembership.start_date || (oldMembership.activated_at ? oldMembership.activated_at.split('T')[0] : undefined),
      end_date: oldMembership.end_date || oldMembership.expiry_date,
      remaining_sessions: oldMembership.remaining_sessions || oldMembership.sessions_left || 0,
      created_at: oldMembership.created_at || now,
      updated_at: oldMembership.updated_at || now
    };
  });
};

// ========================================
// 數據清理工具
// ========================================

/**
 * 清理重複的用戶記錄
 * @param users 用戶數據陣列
 * @returns 清理後的用戶數據
 */
export const deduplicateUsers = (users: User[]): { cleanUsers: User[]; duplicates: User[] } => {
  const emailMap = new Map<string, User>();
  const duplicates: User[] = [];
  
  users.forEach(user => {
    const existingUser = emailMap.get(user.email);
    if (existingUser) {
      // 保留較新的記錄
      const currentTime = new Date(user.updated_at).getTime();
      const existingTime = new Date(existingUser.updated_at).getTime();
      
      if (currentTime > existingTime) {
        duplicates.push(existingUser);
        emailMap.set(user.email, user);
      } else {
        duplicates.push(user);
      }
    } else {
      emailMap.set(user.email, user);
    }
  });
  
  return {
    cleanUsers: Array.from(emailMap.values()),
    duplicates
  };
};

/**
 * 清理無效的預約記錄
 * @param bookings 預約數據陣列
 * @param validUserIds 有效的用戶ID陣列
 * @param validSessionIds 有效的課程節ID陣列
 * @returns 清理後的預約數據
 */
export const cleanInvalidBookings = (
  bookings: Booking[], 
  validUserIds: number[], 
  validSessionIds: number[]
): { validBookings: Booking[]; invalidBookings: Booking[] } => {
  const validBookings: Booking[] = [];
  const invalidBookings: Booking[] = [];
  
  bookings.forEach(booking => {
    if (validUserIds.includes(booking.user_id) && validSessionIds.includes(booking.course_session_id)) {
      validBookings.push(booking);
    } else {
      invalidBookings.push(booking);
    }
  });
  
  return { validBookings, invalidBookings };
};

// ========================================
// 完整遷移流程
// ========================================

/**
 * 執行完整的數據遷移
 * @param oldData 舊格式數據
 * @returns 遷移結果摘要
 */
export const performFullMigration = async (oldData: {
  users?: Record<string, unknown>[];
  courses?: Record<string, unknown>[];
  memberships?: Record<string, unknown>[];
  bookings?: Record<string, unknown>[];
  corporate?: Record<string, unknown>[];
  referrals?: Record<string, unknown>[];
}): Promise<MigrationSummary> => {
  const startTime = new Date();
  
  // 初始化結果
  const summary: MigrationSummary = {
    users: { success: true, message: '', migrated_records: 0, errors: [], warnings: [] },
    courses: { success: true, message: '', migrated_records: 0, errors: [], warnings: [] },
    memberships: { success: true, message: '', migrated_records: 0, errors: [], warnings: [] },
    bookings: { success: true, message: '', migrated_records: 0, errors: [], warnings: [] },
    corporate: { success: true, message: '', migrated_records: 0, errors: [], warnings: [] },
    referrals: { success: true, message: '', migrated_records: 0, errors: [], warnings: [] },
    total_records: 0,
    total_errors: 0,
    migration_time: ''
  };
  
  try {
    // 遷移用戶數據
    if (oldData.users && oldData.users.length > 0) {
      console.log('開始遷移用戶數據...');
      summary.users = validateUserData(oldData.users);
      
      if (summary.users.success) {
        const transformedUsers = transformUserData(oldData.users);
        const { cleanUsers, duplicates } = deduplicateUsers(transformedUsers);
        
        // 這裡應該將清理後的數據寫入新系統
        // 因為使用 localStorage，所以直接更新記憶體中的數據
        
        summary.users.migrated_records = cleanUsers.length;
        if (duplicates.length > 0) {
          summary.users.warnings.push(`移除了 ${duplicates.length} 筆重複記錄`);
        }
      }
    }
    
    // 遷移課程數據
    if (oldData.courses && oldData.courses.length > 0) {
      console.log('開始遷移課程數據...');
      summary.courses = validateCourseData(oldData.courses);
      
      if (summary.courses.success) {
        const transformedCourses = transformCourseData(oldData.courses);
        summary.courses.migrated_records = transformedCourses.length;
      }
    }
    
    // 遷移會員卡數據
    if (oldData.memberships && oldData.memberships.length > 0) {
      console.log('開始遷移會員卡數據...');
      summary.memberships = validateMembershipData(oldData.memberships);
      
      if (summary.memberships.success) {
        const transformedMemberships = transformMembershipData(oldData.memberships);
        summary.memberships.migrated_records = transformedMemberships.length;
      }
    }
    
    // 計算總計
    summary.total_records = 
      summary.users.migrated_records +
      summary.courses.migrated_records +
      summary.memberships.migrated_records +
      summary.bookings.migrated_records +
      summary.corporate.migrated_records +
      summary.referrals.migrated_records;
    
    summary.total_errors = 
      summary.users.errors.length +
      summary.courses.errors.length +
      summary.memberships.errors.length +
      summary.bookings.errors.length +
      summary.corporate.errors.length +
      summary.referrals.errors.length;
    
  } catch (error) {
    console.error('遷移過程中發生錯誤:', error);
    summary.users.errors.push('遷移過程中發生未預期錯誤');
  }
  
  const endTime = new Date();
  summary.migration_time = `${endTime.getTime() - startTime.getTime()}ms`;
  
  return summary;
};

// ========================================
// 輔助函數
// ========================================

/**
 * 標準化角色名稱
 */
const normalizeRole = (role: unknown): User['role'] => {
  if (!role) return 'STUDENT';
  
  const roleMap: Record<string, User['role']> = {
    'student': 'STUDENT',
    'teacher': 'TEACHER',
    'admin': 'ADMIN',
    'staff': 'STAFF',
    'corporate': 'CORPORATE_CONTACT',
    'agent': 'AGENT'
  };
  
  return roleMap[role.toLowerCase()] || 'STUDENT';
};

/**
 * 標準化狀態
 */
const normalizeStatus = (status: unknown): User['status'] => {
  if (status === false || status === 'inactive' || status === 'disabled') return 'INACTIVE';
  if (status === 'suspended' || status === 'banned') return 'SUSPENDED';
  return 'ACTIVE';
};

/**
 * 標準化語言
 */
const normalizeLanguage = (language: unknown): string => {
  if (!language) return 'Chinese';
  
  const languageMap: Record<string, string> = {
    'zh': 'Chinese',
    'en': 'English',
    'ja': 'Japanese',
    'ko': 'Korean',
    'es': 'Spanish',
    'fr': 'French'
  };
  
  return languageMap[language.toLowerCase()] || language;
};

/**
 * 標準化難度等級
 */
const normalizeLevel = (level: unknown): CourseModule['level'] => {
  if (!level) return 'BEGINNER';
  
  const levelMap: Record<string, CourseModule['level']> = {
    'beginner': 'BEGINNER',
    'elementary': 'ELEMENTARY',
    'intermediate': 'INTERMEDIATE',
    'upper-intermediate': 'UPPER_INTERMEDIATE',
    'advanced': 'ADVANCED'
  };
  
  return levelMap[level.toLowerCase()] || 'BEGINNER';
};

/**
 * 標準化會員卡狀態
 */
const normalizeMembershipStatus = (status: unknown): UserMembership['status'] => {
  if (!status) return 'PURCHASED';
  
  const statusMap: Record<string, UserMembership['status']> = {
    'purchased': 'PURCHASED',
    'active': 'ACTIVE',
    'expired': 'EXPIRED',
    'suspended': 'SUSPENDED'
  };
  
  return statusMap[status.toLowerCase()] || 'PURCHASED';
};

/**
 * 計算啟用期限（購買後24小時）
 */
const calculateActivationDeadline = (purchaseDate: string): string => {
  const date = new Date(purchaseDate);
  date.setHours(date.getHours() + 24);
  return date.toISOString();
};

// ========================================
// 預設匯出
// ========================================

const dataMigrationUtils = {
  validateUserData,
  validateCourseData,
  validateMembershipData,
  transformUserData,
  transformCourseData,
  transformMembershipData,
  deduplicateUsers,
  cleanInvalidBookings,
  performFullMigration
};

export default dataMigrationUtils;