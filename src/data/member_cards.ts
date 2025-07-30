import type { UserMembership } from '@/types/business';

// ========================================
// 會員卡資料 - MECE架構
// 管理用戶的會員卡實例資料
// ========================================

export const memberships: UserMembership[] = [
  {
    id: 1,
    user_id: 1,
    member_card_plan_id: 1,
    order_id: 1001,
    status: 'ACTIVE',
    purchase_date: '2024-01-01T00:00:00+00:00',
    activation_deadline: '2024-01-25T23:59:59+00:00', // 購買後24小時內需啟用
    activated_at: '2024-01-02T10:30:00+00:00',
    start_date: '2024-01-02',
    end_date: '2024-04-02', // 季卡3個月
    remaining_sessions: 15,
    created_at: '2024-01-01T00:00:00+00:00',
    updated_at: '2024-01-15T00:00:00+00:00'
  },
  {
    id: 2,
    user_id: 2,
    member_card_plan_id: 2,
    order_id: 1002,
    status: 'ACTIVE',
    purchase_date: '2023-12-15T00:00:00+00:00',
    activation_deadline: '2023-12-16T23:59:59+00:00',
    activated_at: '2023-12-16T09:15:00+00:00',
    start_date: '2023-12-16',
    end_date: '2024-12-16', // 年卡1年
    remaining_sessions: 28,
    created_at: '2023-12-15T00:00:00+00:00',
    updated_at: '2024-01-15T00:00:00+00:00'
  },
  {
    id: 3,
    user_id: 5, // 企業員工
    member_card_plan_id: 3,
    order_id: 1003,
    status: 'PURCHASED',
    purchase_date: '2024-01-10T00:00:00+00:00',
    activation_deadline: '2024-02-09T23:59:59+00:00', // 購買後30天內需啟用
    remaining_sessions: 50, // 尚未啟用，保持原始額度
    created_at: '2024-01-10T00:00:00+00:00',
    updated_at: '2024-01-10T00:00:00+00:00'
  },
  {
    id: 4,
    user_id: 3,
    member_card_plan_id: 1,
    order_id: 1004,
    status: 'EXPIRED',
    purchase_date: '2023-10-01T00:00:00+00:00',
    activation_deadline: '2023-10-02T23:59:59+00:00',
    activated_at: '2023-10-01T14:20:00+00:00',
    start_date: '2023-10-01',
    end_date: '2024-01-01', // 已過期
    remaining_sessions: 0,
    created_at: '2023-10-01T00:00:00+00:00',
    updated_at: '2024-01-01T00:00:00+00:00'
  }
];

// ========================================
// 輔助函數
// ========================================

// 根據用戶ID獲取會員卡
export const getMembershipsByUserId = (userId: number): UserMembership[] => {
  return memberships.filter(membership => membership.user_id === userId);
};

// 根據用戶ID獲取有效會員卡
export const getActiveMembershipByUserId = (userId: number): UserMembership | undefined => {
  return memberships.find(membership => 
    membership.user_id === userId && 
    membership.status === 'ACTIVE'
  );
};

// 根據狀態獲取會員卡
export const getMembershipsByStatus = (status: string): UserMembership[] => {
  return memberships.filter(membership => membership.status === status);
};

// 根據會員卡方案ID獲取會員卡
export const getMembershipsByPlanId = (planId: number): UserMembership[] => {
  return memberships.filter(membership => membership.member_card_plan_id === planId);
};

// 根據ID獲取會員卡
export const getMembershipById = (id: number): UserMembership | undefined => {
  return memberships.find(membership => membership.id === id);
};

// 檢查會員卡是否已過期
export const isMembershipExpired = (membership: UserMembership): boolean => {
  if (!membership.end_date) return false;
  return new Date() > new Date(membership.end_date);
};

// 檢查會員卡是否即將過期（7天內）
export const isMembershipExpiringSoon = (membership: UserMembership): boolean => {
  if (!membership.end_date) return false;
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  return new Date(membership.end_date) <= sevenDaysFromNow;
};

// 檢查會員卡是否超過啟用期限
export const isMembershipActivationExpired = (membership: UserMembership): boolean => {
  if (membership.status !== 'PURCHASED') return false;
  return new Date() > new Date(membership.activation_deadline);
};

// 啟用會員卡
export const activateMembership = (membershipId: number): boolean => {
  const membership = getMembershipById(membershipId);
  if (!membership || membership.status !== 'PURCHASED') return false;
  
  if (isMembershipActivationExpired(membership)) return false;
  
  const now = new Date();
  membership.status = 'ACTIVE';
  membership.activated_at = now.toISOString();
  membership.start_date = now.toISOString().split('T')[0];
  
  // 根據會員卡方案計算結束日期
  const endDate = new Date(now);
  // 這裡需要根據會員卡方案的 duration_days 來計算
  // 暫時使用預設值：季卡90天，年卡365天
  const durationDays = membership.member_card_plan_id === 1 ? 90 : 
                      membership.member_card_plan_id === 2 ? 365 : 180;
  endDate.setDate(endDate.getDate() + durationDays);
  membership.end_date = endDate.toISOString().split('T')[0];
  
  membership.updated_at = now.toISOString();
  return true;
};

// 使用會員卡課程
export const useMembershipSession = (membershipId: number): boolean => {
  const membership = getMembershipById(membershipId);
  if (!membership || membership.status !== 'ACTIVE' || membership.remaining_sessions <= 0) {
    return false;
  }
  
  membership.remaining_sessions -= 1;
  membership.updated_at = new Date().toISOString();
  
  // 如果沒有剩餘課程，檢查是否需要更新狀態
  if (membership.remaining_sessions === 0 && membership.end_date) {
    const now = new Date();
    const endDate = new Date(membership.end_date);
    if (now >= endDate) {
      membership.status = 'EXPIRED';
    }
  }
  
  return true;
};

// 新增會員卡
export const addMembership = (membership: Omit<UserMembership, 'id' | 'created_at' | 'updated_at'>): void => {
  const newMembership: UserMembership = {
    ...membership,
    id: Math.max(...memberships.map(m => m.id), 0) + 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  memberships.push(newMembership);
};

// 向下相容的別名導出
export const memberCards = memberships;

// 向下相容的預設匯出
export { memberships as default };