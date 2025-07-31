import type { Referral, Agent, CommissionPayment } from '@/types/business';

// ========================================
// 推薦資料 - 已清空
// ========================================

export const referralData: Referral[] = [];
export const referralCodes: unknown[] = [];

// ========================================
// 輔助函數
// ========================================

// 根據用戶獲取推薦碼
export const getReferralCodesByUser = (userId: number) => {
  return referralCodes.filter(code => code.user_id === userId);
};

// 根據ID獲取推薦
export const getReferralById = (id: number): Referral | undefined => {
  return referralData.find(referral => referral.id === id);
};

// 獲取統計
export const getReferralStatistics = () => {
  return {
    total: referralData.length,
    codes: referralCodes.length
  };
};

// 向下相容的預設匯出
export default referralData;