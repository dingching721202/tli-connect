import type { Referral, Agent, CommissionPayment } from '@/types/business';

// ========================================
// 推薦系統資料 - MECE架構
// 管理代理商、推薦和佣金資料
// ========================================

export const agents: Agent[] = [
  {
    id: 1,
    user_id: 8, // 假設的代理商用戶ID
    agent_code: 'AG001',
    level: 'GOLD',
    parent_agent_id: undefined,
    commission_rate: 15,
    total_referrals: 48,
    total_sales_amount: 480000,
    total_commission_earned: 72000,
    status: 'ACTIVE',
    contract_signed_at: '2023-01-01T00:00:00+00:00',
    created_at: '2023-01-01T00:00:00+00:00',
    updated_at: '2024-01-15T00:00:00+00:00'
  },
  {
    id: 2,
    user_id: 9, // 假設的代理商用戶ID
    agent_code: 'AG002',
    level: 'SILVER',
    parent_agent_id: 1, // 上級代理商
    commission_rate: 12,
    total_referrals: 28,
    total_sales_amount: 280000,
    total_commission_earned: 33600,
    status: 'ACTIVE',
    contract_signed_at: '2023-03-15T00:00:00+00:00',
    created_at: '2023-03-15T00:00:00+00:00',
    updated_at: '2024-01-15T00:00:00+00:00'
  },
  {
    id: 3,
    user_id: 10, // 假設的代理商用戶ID
    agent_code: 'AG003',
    level: 'BRONZE',
    parent_agent_id: 1,
    commission_rate: 10,
    total_referrals: 15,
    total_sales_amount: 150000,
    total_commission_earned: 15000,
    status: 'ACTIVE',
    contract_signed_at: '2023-06-01T00:00:00+00:00',
    created_at: '2023-06-01T00:00:00+00:00',
    updated_at: '2024-01-15T00:00:00+00:00'
  }
];

export const referrals: Referral[] = [
  {
    id: 1,
    agent_id: 1,
    referred_user_id: 101,
    referral_code: 'AG001-WINTER2024',
    order_id: 1001,
    commission_amount: 2400,
    commission_rate: 15,
    status: 'APPROVED',
    referred_at: '2024-01-10T10:00:00+00:00',
    converted_at: '2024-01-12T15:30:00+00:00',
    created_at: '2024-01-10T10:00:00+00:00',
    updated_at: '2024-01-12T15:30:00+00:00'
  },
  {
    id: 2,
    agent_id: 1,
    referred_user_id: 102,
    referral_code: 'AG001-SPRING2024',
    order_id: 1002,
    commission_amount: 1800,
    commission_rate: 15,
    status: 'PENDING',
    referred_at: '2024-01-14T14:20:00+00:00',
    converted_at: '2024-01-16T09:45:00+00:00',
    created_at: '2024-01-14T14:20:00+00:00',
    updated_at: '2024-01-16T09:45:00+00:00'
  },
  {
    id: 3,
    agent_id: 2,
    referred_user_id: 103,
    referral_code: 'AG002-NEW2024',
    order_id: 1003,
    commission_amount: 1440,
    commission_rate: 12,
    status: 'APPROVED',
    referred_at: '2024-01-08T11:30:00+00:00',
    converted_at: '2024-01-10T16:15:00+00:00',
    created_at: '2024-01-08T11:30:00+00:00',
    updated_at: '2024-01-10T16:15:00+00:00'
  },
  {
    id: 4,
    agent_id: 3,
    referred_user_id: 104,
    referral_code: 'AG003-PROMO2024',
    commission_amount: 600,
    commission_rate: 10,
    status: 'PENDING',
    referred_at: '2024-01-18T08:45:00+00:00',
    created_at: '2024-01-18T08:45:00+00:00',
    updated_at: '2024-01-18T08:45:00+00:00'
  }
];

export const commissionPayments: CommissionPayment[] = [
  {
    id: 1,
    agent_id: 1,
    period_start: '2024-01-01',
    period_end: '2024-01-31',
    total_amount: 15600,
    referral_ids: [1, 5, 8, 12, 15], // 假設的推薦ID
    payment_method: 'BANK_TRANSFER',
    payment_reference: 'PAY-2024-001-AG001',
    status: 'PAID',
    paid_at: '2024-02-05T10:00:00+00:00',
    created_at: '2024-02-01T00:00:00+00:00',
    updated_at: '2024-02-05T10:00:00+00:00'
  },
  {
    id: 2,
    agent_id: 2,
    period_start: '2024-01-01',
    period_end: '2024-01-31',
    total_amount: 8400,
    referral_ids: [3, 7, 11],
    payment_method: 'BANK_TRANSFER',
    payment_reference: 'PAY-2024-002-AG002',
    status: 'APPROVED',
    created_at: '2024-02-01T00:00:00+00:00',
    updated_at: '2024-02-03T14:30:00+00:00'
  },
  {
    id: 3,
    agent_id: 3,
    period_start: '2024-01-01',
    period_end: '2024-01-31',
    total_amount: 3200,
    referral_ids: [4, 9],
    payment_method: 'DIGITAL_WALLET',
    status: 'PENDING',
    created_at: '2024-02-01T00:00:00+00:00',
    updated_at: '2024-02-01T00:00:00+00:00'
  }
];

// ========================================
// 輔助函數
// ========================================

// 根據代理商編號獲取代理商
export const getAgentByCode = (agentCode: string): Agent | undefined => {
  return agents.find(agent => agent.agent_code === agentCode);
};

// 根據用戶ID獲取代理商
export const getAgentByUserId = (userId: number): Agent | undefined => {
  return agents.find(agent => agent.user_id === userId);
};

// 根據代理商ID獲取推薦記錄
export const getReferralsByAgentId = (agentId: number): Referral[] => {
  return referrals.filter(referral => referral.agent_id === agentId);
};

// 根據狀態獲取推薦記錄
export const getReferralsByStatus = (status: Referral['status']): Referral[] => {
  return referrals.filter(referral => referral.status === status);
};

// 根據代理商ID獲取佣金記錄
export const getCommissionPaymentsByAgentId = (agentId: number): CommissionPayment[] => {
  return commissionPayments.filter(payment => payment.agent_id === agentId);
};

// 計算代理商本月績效
export const calculateAgentMonthlyPerformance = (agentId: number, year: number, month: number) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  const monthlyReferrals = referrals.filter(referral => {
    const referralDate = new Date(referral.referred_at);
    return referral.agent_id === agentId &&
           referralDate >= startDate &&
           referralDate <= endDate;
  });

  const approvedReferrals = monthlyReferrals.filter(r => r.status === 'APPROVED');
  const totalCommission = approvedReferrals.reduce((sum, r) => sum + r.commission_amount, 0);
  const conversionRate = monthlyReferrals.length > 0 ? 
    (approvedReferrals.length / monthlyReferrals.length) * 100 : 0;

  return {
    agent_id: agentId,
    period: `${year}-${month.toString().padStart(2, '0')}`,
    total_referrals: monthlyReferrals.length,
    approved_referrals: approvedReferrals.length,
    pending_referrals: monthlyReferrals.filter(r => r.status === 'PENDING').length,
    total_commission: totalCommission,
    conversion_rate: conversionRate
  };
};

// 獲取代理商排行榜
export const getAgentLeaderboard = (period: 'month' | 'quarter' | 'year' = 'month') => {
  const now = new Date();
  let startDate: Date;
  const endDate = new Date(now);

  switch (period) {
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
  }

  const agentStats = agents.map(agent => {
    const periodReferrals = referrals.filter(referral => {
      const referralDate = new Date(referral.referred_at);
      return referral.agent_id === agent.id &&
             referralDate >= startDate &&
             referralDate <= endDate &&
             referral.status === 'APPROVED';
    });

    const totalCommission = periodReferrals.reduce((sum, r) => sum + r.commission_amount, 0);

    return {
      agent,
      period_referrals: periodReferrals.length,
      period_commission: totalCommission,
      conversion_rate: agent.total_referrals > 0 ? 
        (periodReferrals.length / agent.total_referrals) * 100 : 0
    };
  });

  return agentStats
    .sort((a, b) => b.period_commission - a.period_commission)
    .map((stat, index) => ({
      rank: index + 1,
      ...stat
    }));
};

// 生成推薦碼
export const generateReferralCode = (agentCode: string, campaign?: string): string => {
  const suffix = campaign || new Date().getFullYear().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${agentCode}-${suffix}-${random}`;
};

// 驗證推薦碼
export const validateReferralCode = (code: string): { valid: boolean; agent?: Agent; message: string } => {
  const parts = code.split('-');
  if (parts.length < 2) {
    return { valid: false, message: '推薦碼格式無效' };
  }

  const agentCode = parts[0];
  const agent = getAgentByCode(agentCode);
  
  if (!agent) {
    return { valid: false, message: '找不到對應的代理商' };
  }

  if (agent.status !== 'ACTIVE') {
    return { valid: false, message: '代理商帳戶未啟用' };
  }

  return { valid: true, agent, message: '推薦碼有效' };
};

// 記錄新推薦
export const recordReferral = (
  agentId: number,
  referredUserId: number,
  referralCode: string,
  orderId?: number
): Referral => {
  const agent = agents.find(a => a.id === agentId);
  if (!agent) throw new Error('找不到代理商');

  const newReferral: Referral = {
    id: Math.max(...referrals.map(r => r.id), 0) + 1,
    agent_id: agentId,
    referred_user_id: referredUserId,
    referral_code: referralCode,
    order_id: orderId,
    commission_amount: 0, // 待計算
    commission_rate: agent.commission_rate,
    status: 'PENDING',
    referred_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  referrals.push(newReferral);
  
  // 更新代理商統計
  agent.total_referrals += 1;
  agent.updated_at = new Date().toISOString();

  return newReferral;
};

// 根據用戶ID獲取推薦碼
export const getReferralCodesByUser = (userId: number): string[] => {
  const agent = getAgentByUserId(userId);
  if (!agent) return [];

  const userReferrals = referrals.filter(r => r.agent_id === agent.id);
  return userReferrals.map(r => r.referral_code);
};

// 處理推薦轉換（購買完成）
export const processReferralConversion = (referralId: number, orderValue: number): boolean => {
  const referral = referrals.find(r => r.id === referralId);
  if (!referral || referral.status !== 'PENDING') return false;

  const agent = agents.find(a => a.id === referral.agent_id);
  if (!agent) return false;

  // 計算佣金
  referral.commission_amount = orderValue * (referral.commission_rate / 100);
  referral.status = 'APPROVED';
  referral.converted_at = new Date().toISOString();
  referral.updated_at = new Date().toISOString();

  // 更新代理商統計
  agent.total_sales_amount += orderValue;
  agent.total_commission_earned += referral.commission_amount;
  agent.updated_at = new Date().toISOString();

  return true;
};

// 向下相容的預設匯出
export { agents as default };