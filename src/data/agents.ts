import type { Agent, Referral, CommissionPayment } from '@/types/business';

// ========================================
// 代理商資料 - MECE架構
// 獨立管理代理商系統，包含推薦與佣金資料
// ========================================

export const agents: Agent[] = [
  {
    id: 1,
    user_id: 9, // Sarah Agent
    agent_code: "AG001",
    level: "GOLD",
    parent_agent_id: undefined,
    commission_rate: 15,
    total_referrals: 24,
    total_sales_amount: 360000,
    total_commission_earned: 54000,
    status: "ACTIVE",
    contract_signed_at: "2024-01-01T00:00:00Z",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2025-07-25T00:00:00Z"
  },
  {
    id: 2,
    user_id: 10, // Mike Agent
    agent_code: "AG002",
    level: "SILVER",
    parent_agent_id: 1, // Sarah Agent 的下級
    commission_rate: 12,
    total_referrals: 15,
    total_sales_amount: 180000,
    total_commission_earned: 21600,
    status: "ACTIVE",
    contract_signed_at: "2024-03-15T00:00:00Z",
    created_at: "2024-03-15T00:00:00Z",
    updated_at: "2025-07-20T00:00:00Z"
  },
  {
    id: 3,
    user_id: 11, // 新增一個代理商用戶
    agent_code: "AG003",
    level: "BRONZE",
    parent_agent_id: 1, // Sarah Agent 的下級
    commission_rate: 10,
    total_referrals: 8,
    total_sales_amount: 96000,
    total_commission_earned: 9600,
    status: "ACTIVE",
    contract_signed_at: "2024-06-01T00:00:00Z",
    created_at: "2024-06-01T00:00:00Z",
    updated_at: "2025-07-15T00:00:00Z"
  },
  {
    id: 4,
    user_id: 12, // 新增一個白金代理商
    agent_code: "AG004",
    level: "PLATINUM",
    parent_agent_id: undefined,
    commission_rate: 18,
    total_referrals: 45,
    total_sales_amount: 675000,
    total_commission_earned: 121500,
    status: "ACTIVE",
    contract_signed_at: "2023-08-01T00:00:00Z",
    created_at: "2023-08-01T00:00:00Z",
    updated_at: "2025-07-28T00:00:00Z"
  },
  {
    id: 5,
    user_id: 13, // 暫停的代理商
    agent_code: "AG005",
    level: "SILVER",
    parent_agent_id: 4,
    commission_rate: 12,
    total_referrals: 12,
    total_sales_amount: 144000,
    total_commission_earned: 17280,
    status: "SUSPENDED",
    contract_signed_at: "2024-02-01T00:00:00Z",
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2025-06-15T00:00:00Z"
  }
];

// ========================================
// 推薦記錄資料
// ========================================

export const referrals: Referral[] = [
  {
    id: 1,
    agent_id: 1, // Sarah Agent
    referred_user_id: 101, // 被推薦的用戶ID (假設)
    referral_code: "AG001-WINTER",
    order_id: 1001,
    commission_amount: 2400,
    commission_rate: 15,
    status: "APPROVED",
    referred_at: "2025-01-10T10:00:00Z",
    converted_at: "2025-01-12T15:30:00Z",
    created_at: "2025-01-10T10:00:00Z",
    updated_at: "2025-01-12T15:30:00Z"
  },
  {
    id: 2,
    agent_id: 1, // Sarah Agent
    referred_user_id: 102,
    referral_code: "AG001-SPRING",
    commission_amount: 1800,
    commission_rate: 15,
    status: "PENDING",
    referred_at: "2025-01-14T14:20:00Z",
    created_at: "2025-01-14T14:20:00Z",
    updated_at: "2025-01-14T14:20:00Z"
  },
  {
    id: 3,
    agent_id: 2, // Mike Agent
    referred_user_id: 103,
    referral_code: "AG002-SUMMER",
    order_id: 1002,
    commission_amount: 1440,
    commission_rate: 12,
    status: "APPROVED",
    referred_at: "2025-02-05T09:15:00Z",
    converted_at: "2025-02-07T11:45:00Z",
    created_at: "2025-02-05T09:15:00Z",
    updated_at: "2025-02-07T11:45:00Z"
  },
  {
    id: 4,
    agent_id: 2, // Mike Agent
    referred_user_id: 104,
    referral_code: "AG002-AUTUMN",
    commission_amount: 1200,
    commission_rate: 12,
    status: "REJECTED",
    referred_at: "2025-03-01T16:30:00Z",
    created_at: "2025-03-01T16:30:00Z",
    updated_at: "2025-03-05T10:00:00Z"
  },
  {
    id: 5,
    agent_id: 4, // 白金代理商
    referred_user_id: 105,
    referral_code: "AG004-VIP01",
    order_id: 1003,
    commission_amount: 5400,
    commission_rate: 18,
    status: "APPROVED",
    referred_at: "2025-01-20T13:45:00Z",
    converted_at: "2025-01-22T09:30:00Z",
    created_at: "2025-01-20T13:45:00Z",
    updated_at: "2025-01-22T09:30:00Z"
  },
  {
    id: 6,
    agent_id: 3, // Bronze 代理商
    referred_user_id: 106,
    referral_code: "AG003-BASIC",
    order_id: 1004,
    commission_amount: 800,
    commission_rate: 10,
    status: "APPROVED",
    referred_at: "2025-06-15T11:20:00Z",
    converted_at: "2025-06-18T14:10:00Z",
    created_at: "2025-06-15T11:20:00Z",
    updated_at: "2025-06-18T14:10:00Z"
  }
];

// ========================================
// 佣金支付記錄
// ========================================

export const commissionPayments: CommissionPayment[] = [
  {
    id: 1,
    agent_id: 1, // Sarah Agent
    period_start: "2025-01-01",
    period_end: "2025-01-31",
    total_amount: 15600,
    referral_ids: [1, 2, 3, 4, 5],
    payment_method: "BANK_TRANSFER",
    payment_reference: "PAY-2025-001",
    status: "PAID",
    paid_at: "2025-02-05T10:00:00Z",
    created_at: "2025-02-01T00:00:00Z",
    updated_at: "2025-02-05T10:00:00Z"
  },
  {
    id: 2,
    agent_id: 2, // Mike Agent
    period_start: "2025-01-01",
    period_end: "2025-01-31",
    total_amount: 8400,
    referral_ids: [3, 4],
    payment_method: "BANK_TRANSFER",
    payment_reference: "PAY-2025-002",
    status: "PAID",
    paid_at: "2025-02-05T10:00:00Z",
    created_at: "2025-02-01T00:00:00Z",
    updated_at: "2025-02-05T10:00:00Z"
  },
  {
    id: 3,
    agent_id: 4, // 白金代理商
    period_start: "2025-02-01",
    period_end: "2025-02-28",
    total_amount: 21600,
    referral_ids: [5, 6, 7, 8],
    payment_method: "DIGITAL_WALLET",
    payment_reference: "PAY-2025-003",
    status: "PENDING",
    created_at: "2025-03-01T00:00:00Z",
    updated_at: "2025-03-01T00:00:00Z"
  },
  {
    id: 4,
    agent_id: 1, // Sarah Agent
    period_start: "2025-06-01",
    period_end: "2025-06-30",
    total_amount: 12000,
    referral_ids: [9, 10, 11],
    payment_method: "BANK_TRANSFER",
    payment_reference: "PAY-2025-004",
    status: "PROCESSING",
    created_at: "2025-07-01T00:00:00Z",
    updated_at: "2025-07-15T00:00:00Z"
  }
];

// ========================================
// 輔助函數 - 代理商管理
// ========================================

// 根據用戶ID獲取代理商
export const getAgentByUserId = (userId: number): Agent | undefined => {
  return agents.find(agent => agent.user_id === userId);
};

// 根據代理商編號獲取代理商
export const getAgentByCode = (agentCode: string): Agent | undefined => {
  return agents.find(agent => agent.agent_code === agentCode);
};

// 根據等級獲取代理商
export const getAgentsByLevel = (level: string): Agent[] => {
  return agents.filter(agent => agent.level === level);
};

// 根據狀態獲取代理商
export const getAgentsByStatus = (status: string): Agent[] => {
  return agents.filter(agent => agent.status === status);
};

// 根據上級代理商獲取下級代理商
export const getSubAgents = (parentAgentId: number): Agent[] => {
  return agents.filter(agent => agent.parent_agent_id === parentAgentId);
};

// 獲取有效的代理商
export const getActiveAgents = (): Agent[] => {
  return agents.filter(agent => agent.status === 'ACTIVE');
};

// 根據ID獲取代理商
export const getAgentById = (id: number): Agent | undefined => {
  return agents.find(agent => agent.id === id);
};

// ========================================
// 輔助函數 - 推薦管理
// ========================================

// 根據代理商ID獲取推薦記錄
export const getReferralsByAgentId = (agentId: number): Referral[] => {
  return referrals.filter(referral => referral.agent_id === agentId);
};

// 根據狀態獲取推薦記錄
export const getReferralsByStatus = (status: string): Referral[] => {
  return referrals.filter(referral => referral.status === status);
};

// 根據推薦碼獲取推薦記錄
export const getReferralByCode = (referralCode: string): Referral | undefined => {
  return referrals.find(referral => referral.referral_code === referralCode);
};

// 根據ID獲取推薦記錄
export const getReferralById = (id: number): Referral | undefined => {
  return referrals.find(referral => referral.id === id);
};

// 獲取待審核的推薦
export const getPendingReferrals = (): Referral[] => {
  return referrals.filter(referral => referral.status === 'PENDING');
};

// ========================================
// 輔助函數 - 佣金管理
// ========================================

// 根據代理商ID獲取佣金支付記錄
export const getCommissionPaymentsByAgentId = (agentId: number): CommissionPayment[] => {
  return commissionPayments.filter(payment => payment.agent_id === agentId);
};

// 根據狀態獲取佣金支付記錄
export const getCommissionPaymentsByStatus = (status: string): CommissionPayment[] => {
  return commissionPayments.filter(payment => payment.status === status);
};

// 根據ID獲取佣金支付記錄
export const getCommissionPaymentById = (id: number): CommissionPayment | undefined => {
  return commissionPayments.find(payment => payment.id === id);
};

// 獲取待處理的佣金支付
export const getPendingCommissionPayments = (): CommissionPayment[] => {
  return commissionPayments.filter(payment => 
    payment.status === 'PENDING' || payment.status === 'PROCESSING'
  );
};

// ========================================
// 統計與分析函數
// ========================================

// 計算代理商績效統計
export const getAgentPerformanceStats = (agentId: number) => {
  const agent = getAgentById(agentId);
  if (!agent) return null;

  const agentReferrals = getReferralsByAgentId(agentId);
  const approvedReferrals = agentReferrals.filter(r => r.status === 'APPROVED');
  const pendingReferrals = agentReferrals.filter(r => r.status === 'PENDING');
  
  const conversionRate = agentReferrals.length > 0 
    ? Math.round((approvedReferrals.length / agentReferrals.length) * 100) 
    : 0;

  const totalCommissionPending = pendingReferrals.reduce((sum, r) => sum + r.commission_amount, 0);

  return {
    totalReferrals: agent.total_referrals,
    approvedReferrals: approvedReferrals.length,
    pendingReferrals: pendingReferrals.length,
    conversionRate,
    totalSales: agent.total_sales_amount,
    totalCommissionEarned: agent.total_commission_earned,
    totalCommissionPending,
    commissionRate: agent.commission_rate,
    level: agent.level
  };
};

// 獲取代理商等級分布統計
export const getAgentLevelStats = () => {
  const stats = { BRONZE: 0, SILVER: 0, GOLD: 0, PLATINUM: 0 };
  agents.forEach(agent => {
    if (stats.hasOwnProperty(agent.level)) {
      stats[agent.level as keyof typeof stats]++;
    }
  });
  return stats;
};

// 計算總代理商收入
export const getTotalAgentCommissions = (): number => {
  return agents.reduce((total, agent) => total + agent.total_commission_earned, 0);
};

// 獲取本月排行榜
export const getMonthlyLeaderboard = (limit: number = 10) => {
  return agents
    .filter(agent => agent.status === 'ACTIVE')
    .sort((a, b) => b.total_commission_earned - a.total_commission_earned)
    .slice(0, limit)
    .map((agent, index) => ({
      rank: index + 1,
      agent_id: agent.id,
      user_id: agent.user_id,
      agent_code: agent.agent_code,
      level: agent.level,
      commission_earned: agent.total_commission_earned,
      referrals: agent.total_referrals,
      sales_amount: agent.total_sales_amount
    }));
};

// 向下相容的預設匯出
export default agents;