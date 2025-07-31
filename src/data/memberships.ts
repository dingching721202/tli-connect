import type { UserMembership } from '@/types/business';

// ========================================
// 用戶會員卡實例資料 - MECE架構  
// 記錄用戶購買和使用會員卡的具體情況
// ========================================

export const userMemberships: UserMembership[] = [
  {
    id: 1,
    user_id: 1,
    member_card_plan_id: 2, // 標準方案
    purchase_date: "2025-07-14T12:00:00+00:00",
    activation_date: "2025-07-14T12:00:00+00:00",
    start_date: "2025-07-14T12:00:00+00:00",
    end_date: "2025-10-12T12:00:00+00:00",
    activation_deadline: "2025-08-13T12:00:00+00:00",
    status: "ACTIVE",
    sessions_total: 30,
    sessions_used: 8,
    sessions_remaining: 22,
    purchase_price: 5999,
    currency: "TWD",
    payment_method: "CREDIT_CARD",
    payment_reference: "PAY-2025-001",
    notes: "用戶首次購買會員卡",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },
  {
    id: 2,
    user_id: 2,
    member_card_plan_id: 1, // 基礎方案
    purchase_date: "2025-07-14T12:00:00+00:00",
    activation_date: undefined,
    start_date: undefined,
    end_date: undefined,
    activation_deadline: "2025-08-13T12:00:00+00:00",
    status: "PURCHASED",
    sessions_total: 12,
    sessions_used: 0,
    sessions_remaining: 12,
    purchase_price: 2999,
    currency: "TWD",
    payment_method: "BANK_TRANSFER",
    payment_reference: "PAY-2025-002",
    notes: "等待用戶啟用",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-14T12:00:00+00:00"
  },
  {
    id: 3,
    user_id: 3,
    member_card_plan_id: 2, // 標準方案
    purchase_date: "2025-07-11T12:00:00+00:00",
    activation_date: "2025-07-11T12:00:00+00:00",
    start_date: "2025-07-11T12:00:00+00:00",
    end_date: "2025-10-09T12:00:00+00:00",
    activation_deadline: "2025-08-10T12:00:00+00:00",
    status: "ACTIVE",
    sessions_total: 30,
    sessions_used: 15,
    sessions_remaining: 15,
    purchase_price: 5999,
    currency: "TWD",
    payment_method: "CREDIT_CARD",
    payment_reference: "PAY-2025-003",
    notes: "使用狀況良好",
    created_at: "2025-07-11T12:00:00+00:00",
    updated_at: "2025-07-25T00:00:00+00:00"
  },
  {
    id: 4,
    user_id: 1, // 用戶1的第二張會員卡
    member_card_plan_id: 3, // 高級方案
    purchase_date: "2025-07-25T12:00:00+00:00",
    activation_date: undefined,
    start_date: undefined,
    end_date: undefined,
    activation_deadline: "2025-09-23T12:00:00+00:00", // 60天內需啟用
    status: "PURCHASED",
    sessions_total: 80,
    sessions_used: 0,
    sessions_remaining: 80,
    purchase_price: 11999,
    currency: "TWD",
    payment_method: "CREDIT_CARD",
    payment_reference: "PAY-2025-004",
    notes: "高級方案待啟用",
    created_at: "2025-07-25T12:00:00+00:00",
    updated_at: "2025-07-25T12:00:00+00:00"
  },
  {
    id: 5,
    user_id: 8, // David Wilson - 外國學生
    member_card_plan_id: 5, // 試用方案
    purchase_date: "2025-07-20T12:00:00+00:00",
    activation_date: "2025-07-20T12:00:00+00:00",
    start_date: "2025-07-20T12:00:00+00:00",
    end_date: "2025-08-19T12:00:00+00:00",
    activation_deadline: "2025-08-03T12:00:00+00:00",
    status: "ACTIVE",
    sessions_total: 3,
    sessions_used: 1,
    sessions_remaining: 2,
    purchase_price: 399,
    currency: "TWD",
    payment_method: "CREDIT_CARD",
    payment_reference: "PAY-2025-005",
    notes: "新用戶試用方案",
    created_at: "2025-07-20T12:00:00+00:00",
    updated_at: "2025-07-22T00:00:00+00:00"
  },
  {
    id: 6,
    user_id: 7, // Frank Liu - 企業聯絡人
    member_card_plan_id: 4, // 企業方案
    purchase_date: "2025-07-10T12:00:00+00:00",
    activation_date: "2025-07-15T12:00:00+00:00",
    start_date: "2025-07-15T12:00:00+00:00",
    end_date: "2026-07-15T12:00:00+00:00",
    activation_deadline: "2025-10-08T12:00:00+00:00",
    status: "ACTIVE",
    sessions_total: 500,
    sessions_used: 45,
    sessions_remaining: 455,
    purchase_price: 99999,
    currency: "TWD",
    payment_method: "CORPORATE_INVOICE",
    payment_reference: "CORP-2025-001",
    notes: "台灣科技公司企業方案",
    created_at: "2025-07-10T12:00:00+00:00",
    updated_at: "2025-07-29T00:00:00+00:00"
  }
  // 注意：用戶4沒有會員卡，用於測試「尚未購買會員方案」的情況
];

// ========================================
// 輔助函數
// ========================================

// 根據用戶ID獲取會員卡
export const getUserMembershipsByUserId = (userId: number): UserMembership[] => {
  return userMemberships.filter(membership => membership.user_id === userId);
};

// 根據狀態獲取會員卡
export const getUserMembershipsByStatus = (status: string): UserMembership[] => {
  return userMemberships.filter(membership => membership.status === status);
};

// 根據方案ID獲取會員卡
export const getUserMembershipsByPlanId = (planId: number): UserMembership[] => {
  return userMemberships.filter(membership => membership.member_card_plan_id === planId);
};

// 根據ID獲取會員卡
export const getUserMembershipById = (id: number): UserMembership | undefined => {
  return userMemberships.find(membership => membership.id === id);
};

// 獲取用戶的有效會員卡
export const getActiveUserMembership = (userId: number): UserMembership | undefined => {
  return userMemberships.find(membership => 
    membership.user_id === userId && membership.status === 'ACTIVE'
  );
};

// 檢查會員卡是否有效
export const isActiveMembership = (membership: UserMembership): boolean => {
  if (membership.status !== 'ACTIVE') return false;
  if (!membership.end_date) return false;
  
  const now = new Date();
  const endDate = new Date(membership.end_date);
  return now <= endDate;
};

// 檢查會員卡是否即將到期 (7天內)
export const isMembershipExpiringSoon = (membership: UserMembership): boolean => {
  if (!membership.end_date || membership.status !== 'ACTIVE') return false;
  
  const now = new Date();
  const endDate = new Date(membership.end_date);
  const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
};

// 檢查啟用期限是否即將到期
export const isActivationDeadlineExpiringSoon = (membership: UserMembership): boolean => {
  if (membership.status !== 'PURCHASED' || !membership.activation_deadline) return false;
  
  const now = new Date();
  const deadline = new Date(membership.activation_deadline);
  const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysUntilDeadline <= 3 && daysUntilDeadline > 0;
};

// 計算會員卡使用率
export const getMembershipUsageRate = (membership: UserMembership): number => {
  if (membership.sessions_total <= 0) return 0;
  return Math.round((membership.sessions_used / membership.sessions_total) * 100);
};

// 獲取即將到期的會員卡
export const getExpiringSoonMemberships = (): UserMembership[] => {
  return userMemberships.filter(isMembershipExpiringSoon);
};

// 獲取需要啟用的會員卡
export const getPendingActivationMemberships = (): UserMembership[] => {
  return userMemberships.filter(membership => membership.status === 'PURCHASED');
};

// 獲取啟用期限即將到期的會員卡
export const getActivationDeadlineExpiring = (): UserMembership[] => {
  return userMemberships.filter(isActivationDeadlineExpiringSoon);
};

// 向下相容的舊接口
export const memberships = userMemberships.map(membership => ({
  id: membership.id,
  created_at: membership.created_at,
  updated_at: membership.updated_at,
  member_card_id: membership.member_card_plan_id, // 映射到方案ID
  duration_in_days: membership.end_date && membership.start_date 
    ? Math.ceil((new Date(membership.end_date).getTime() - new Date(membership.start_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0,
  start_time: membership.start_date,
  expire_time: membership.end_date,
  activated: membership.status === 'ACTIVE',
  activate_expire_time: membership.activation_deadline,
  user_id: membership.user_id,
  status: membership.status,
  remaining_sessions: membership.sessions_remaining
}));

// 向下相容的預設匯出
export default userMemberships;