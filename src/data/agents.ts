import type { Agent, Referral, CommissionPayment } from '@/types/business';

// ========================================
// 代理商資料 - 已清空
// ========================================

export const agents: Agent[] = [];
export const referrals: Referral[] = [];
export const commissionPayments: CommissionPayment[] = [];

// ========================================
// 輔助函數
// ========================================

// 根據ID獲取代理商
export const getAgentById = (id: number): Agent | undefined => {
  return agents.find(agent => agent.id === id);
};

// 獲取統計
export const getAgentStatistics = () => {
  return {
    total: agents.length,
    referrals: referrals.length,
    commissions: commissionPayments.length
  };
};

// 向下相容的預設匯出
export default agents;