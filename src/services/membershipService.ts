import type { UserMembership, MemberCardPlan, User } from '@/types/business';
import { memberships, getMembershipById, getMembershipsByUserId, getActiveMembershipByUserId } from '@/data/member_cards';
import { memberCardPlans, getMemberCardPlanById } from '@/data/memberCardPlans';
import { users, getUserById } from '@/data/users';

// ========================================
// 會員制度服務 - Phase 2.1
// 實現完整的會員卡生命週期管理
// ========================================

export interface MembershipValidationResult {
  isValid: boolean;
  reason?: string;
  membership?: UserMembership;
}

export interface MembershipActivationResult {
  success: boolean;
  message: string;
  membership?: UserMembership;
}

export interface MembershipStats {
  total: number;
  active: number;
  expired: number;
  purchased: number;
  suspended: number;
  pending_activation: number;
}

// ========================================
// 會員卡24小時啟用規則
// ========================================

/**
 * 檢查會員卡是否可以啟用
 * @param membershipId 會員卡ID
 * @returns 驗證結果
 */
export const validateMembershipActivation = (membershipId: number): MembershipValidationResult => {
  const membership = getMembershipById(membershipId);
  
  if (!membership) {
    return { isValid: false, reason: '會員卡不存在' };
  }
  
  if (membership.status !== 'PURCHASED') {
    return { isValid: false, reason: '會員卡狀態不正確，無法啟用' };
  }
  
  // 檢查24小時啟用期限
  const now = new Date();
  const activationDeadline = new Date(membership.activation_deadline);
  
  if (now > activationDeadline) {
    return { isValid: false, reason: '已超過24小時啟用期限' };
  }
  
  // 檢查用戶是否已有有效會員卡
  const existingActiveMembership = getActiveMembershipByUserId(membership.user_id);
  if (existingActiveMembership && existingActiveMembership.id !== membershipId) {
    return { isValid: false, reason: '用戶已有有效會員卡，無法啟用新會員卡' };
  }
  
  return { isValid: true, membership };
};

/**
 * 啟用會員卡
 * @param membershipId 會員卡ID
 * @returns 啟用結果
 */
export const activateMembership = (membershipId: number): MembershipActivationResult => {
  const validation = validateMembershipActivation(membershipId);
  
  if (!validation.isValid) {
    return {
      success: false,
      message: validation.reason || '啟用失敗'
    };
  }
  
  const membership = validation.membership!;
  const plan = getMemberCardPlanById(membership.member_card_plan_id);
  
  if (!plan) {
    return {
      success: false,
      message: '找不到對應的會員卡方案'
    };
  }
  
  const now = new Date();
  
  // 更新會員卡狀態
  membership.status = 'ACTIVE';
  membership.activated_at = now.toISOString();
  membership.start_date = now.toISOString().split('T')[0];
  
  // 計算結束日期
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + plan.duration_days);
  membership.end_date = endDate.toISOString().split('T')[0];
  
  membership.updated_at = now.toISOString();
  
  return {
    success: true,
    message: '會員卡啟用成功',
    membership
  };
};

/**
 * 檢查並自動過期會員卡
 */
export const checkAndExpireMemberships = (): void => {
  const now = new Date();
  const activeMemberships = memberships.filter(m => m.status === 'ACTIVE');
  
  activeMemberships.forEach(membership => {
    if (membership.end_date) {
      const endDate = new Date(membership.end_date);
      if (now > endDate) {
        membership.status = 'EXPIRED';
        membership.updated_at = now.toISOString();
      }
    }
  });
};

/**
 * 檢查會員卡是否即將過期（7天內）
 * @param membershipId 會員卡ID
 * @returns 是否即將過期
 */
export const isMembershipExpiringSoon = (membershipId: number): boolean => {
  const membership = getMembershipById(membershipId);
  if (!membership || membership.status !== 'ACTIVE' || !membership.end_date) {
    return false;
  }
  
  const now = new Date();
  const endDate = new Date(membership.end_date);
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  
  return endDate <= sevenDaysFromNow;
};

// ========================================
// 會員卡權限檢查
// ========================================

/**
 * 檢查用戶是否有有效會員卡
 * @param userId 用戶ID
 * @returns 是否有有效會員卡
 */
export const hasValidMembership = (userId: number): boolean => {
  const membership = getActiveMembershipByUserId(userId);
  return membership !== undefined;
};

/**
 * 檢查用戶是否可以預約課程
 * @param userId 用戶ID
 * @param courseSessionId 課程節ID
 * @returns 是否可以預約
 */
export const canBookCourse = (userId: number, courseSessionId: number): MembershipValidationResult => {
  const membership = getActiveMembershipByUserId(userId);
  
  if (!membership) {
    return { isValid: false, reason: '用戶沒有有效的會員卡' };
  }
  
  if (membership.remaining_sessions <= 0) {
    return { isValid: false, reason: '會員卡剩餘課程數不足' };
  }
  
  // 檢查會員卡是否過期
  if (membership.end_date) {
    const now = new Date();
    const endDate = new Date(membership.end_date);
    if (now > endDate) {
      membership.status = 'EXPIRED';
      membership.updated_at = now.toISOString();
      return { isValid: false, reason: '會員卡已過期' };
    }
  }
  
  return { isValid: true, membership };
};

/**
 * 使用會員卡課程
 * @param userId 用戶ID
 * @param courseSessionId 課程節ID
 * @returns 是否成功使用
 */
export const useMembershipSession = (userId: number, courseSessionId: number): MembershipValidationResult => {
  const validation = canBookCourse(userId, courseSessionId);
  
  if (!validation.isValid) {
    return validation;
  }
  
  const membership = validation.membership!;
  membership.remaining_sessions -= 1;
  membership.updated_at = new Date().toISOString();
  
  // 如果沒有剩餘課程且已過期，更新狀態
  if (membership.remaining_sessions === 0 && membership.end_date) {
    const now = new Date();
    const endDate = new Date(membership.end_date);
    if (now >= endDate) {
      membership.status = 'EXPIRED';
    }
  }
  
  return { isValid: true, membership };
};

// ========================================
// 會員卡續費邏輯
// ========================================

/**
 * 檢查會員卡是否可以續費
 * @param membershipId 會員卡ID
 * @returns 是否可以續費
 */
export const canRenewMembership = (membershipId: number): MembershipValidationResult => {
  const membership = getMembershipById(membershipId);
  
  if (!membership) {
    return { isValid: false, reason: '會員卡不存在' };
  }
  
  if (membership.status === 'PURCHASED') {
    return { isValid: false, reason: '會員卡尚未啟用，無法續費' };
  }
  
  if (membership.status === 'SUSPENDED') {
    return { isValid: false, reason: '會員卡已被停用，無法續費' };
  }
  
  return { isValid: true, membership };
};

/**
 * 續費會員卡
 * @param membershipId 原會員卡ID
 * @param newPlanId 新方案ID
 * @returns 續費結果
 */
export const renewMembership = (membershipId: number, newPlanId: number): MembershipActivationResult => {
  const validation = canRenewMembership(membershipId);
  
  if (!validation.isValid) {
    return {
      success: false,
      message: validation.reason || '續費失敗'
    };
  }
  
  const oldMembership = validation.membership!;
  const newPlan = getMemberCardPlanById(newPlanId);
  
  if (!newPlan) {
    return {
      success: false,
      message: '找不到指定的會員卡方案'
    };
  }
  
  const now = new Date();
  
  // 創建新的會員卡
  const newMembership: UserMembership = {
    id: Math.max(...memberships.map(m => m.id), 0) + 1,
    user_id: oldMembership.user_id,
    member_card_plan_id: newPlanId,
    order_id: Math.max(...memberships.map(m => m.order_id || 0), 0) + 1, // 假設訂單ID
    status: 'ACTIVE', // 續費直接啟用
    purchase_date: now.toISOString(),
    activation_deadline: now.toISOString(), // 續費不需要啟用期限
    activated_at: now.toISOString(),
    start_date: now.toISOString().split('T')[0],
    end_date: (() => {
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + newPlan.duration_days);
      return endDate.toISOString().split('T')[0];
    })(),
    remaining_sessions: newPlan.total_sessions,
    created_at: now.toISOString(),
    updated_at: now.toISOString()
  };
  
  // 停用舊會員卡
  oldMembership.status = 'EXPIRED';
  oldMembership.updated_at = now.toISOString();
  
  // 新增新會員卡
  memberships.push(newMembership);
  
  return {
    success: true,
    message: '會員卡續費成功',
    membership: newMembership
  };
};

// ========================================
// 會員卡統計功能
// ========================================

/**
 * 獲取會員卡統計資料
 * @returns 統計資料
 */
export const getMembershipStatistics = (): MembershipStats => {
  const now = new Date();
  
  // 先檢查並更新過期會員卡
  checkAndExpireMemberships();
  
  const stats: MembershipStats = {
    total: memberships.length,
    active: 0,
    expired: 0,
    purchased: 0,
    suspended: 0,
    pending_activation: 0
  };
  
  memberships.forEach(membership => {
    switch (membership.status) {
      case 'ACTIVE':
        stats.active++;
        break;
      case 'EXPIRED':
        stats.expired++;
        break;
      case 'PURCHASED':
        stats.purchased++;
        // 檢查是否超過啟用期限
        const activationDeadline = new Date(membership.activation_deadline);
        if (now > activationDeadline) {
          stats.pending_activation++;
        }
        break;
      case 'SUSPENDED':
        stats.suspended++;
        break;
    }
  });
  
  return stats;
};

/**
 * 獲取用戶的會員卡詳情
 * @param userId 用戶ID
 * @returns 會員卡詳情
 */
export const getUserMembershipDetails = (userId: number) => {
  const userMemberships = getMembershipsByUserId(userId);
  const activeMembership = getActiveMembershipByUserId(userId);
  
  return {
    user_id: userId,
    all_memberships: userMemberships,
    active_membership: activeMembership,
    has_valid_membership: activeMembership !== undefined,
    membership_count: userMemberships.length,
    expiring_soon: activeMembership ? isMembershipExpiringSoon(activeMembership.id) : false
  };
};

// ========================================
// 會員卡24小時啟用期限檢查
// ========================================

/**
 * 獲取所有超過啟用期限的會員卡
 * @returns 超過期限的會員卡列表
 */
export const getExpiredActivationMemberships = (): UserMembership[] => {
  const now = new Date();
  
  return memberships.filter(membership => {
    if (membership.status !== 'PURCHASED') return false;
    const activationDeadline = new Date(membership.activation_deadline);
    return now > activationDeadline;
  });
};

/**
 * 自動處理超過啟用期限的會員卡
 * @returns 處理的會員卡數量
 */
export const processExpiredActivationMemberships = (): number => {
  const expiredMemberships = getExpiredActivationMemberships();
  const now = new Date();
  
  expiredMemberships.forEach(membership => {
    membership.status = 'EXPIRED';
    membership.updated_at = now.toISOString();
  });
  
  return expiredMemberships.length;
};

// ========================================
// 預設匯出
// ========================================

export default {
  validateMembershipActivation,
  activateMembership,
  checkAndExpireMemberships,
  isMembershipExpiringSoon,
  hasValidMembership,
  canBookCourse,
  useMembershipSession,
  canRenewMembership,
  renewMembership,
  getMembershipStatistics,
  getUserMembershipDetails,
  getExpiredActivationMemberships,
  processExpiredActivationMemberships
};