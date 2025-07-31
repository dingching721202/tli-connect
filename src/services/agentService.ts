import type { User, ReferralCode, Commission } from '@/types/business';
import { 
  referralCodes, 
  commissions,
  getReferralCodesByUser,
  getReferralCodeByCode,
  getCommissionsByAgent,
  addReferralCode,
  updateReferralCodeStatus,
  addCommission
} from '@/data/referralData';
import { users, getUserById, getUsersByRole } from '@/data/users';
import { getOrderById } from '@/data/orders';

// ========================================
// 代理商系統服務 - Phase 2.5
// 實現完整的代理商推薦與佣金系統
// ========================================

export interface AgentResult {
  success: boolean;
  message: string;
  agent?: User;
}

export interface ReferralResult {
  success: boolean;
  message: string;
  referralCode?: ReferralCode;
}

export interface CommissionResult {
  success: boolean;
  message: string;
  commission?: Commission;
}

export interface AgentStats {
  total_agents: number;
  active_agents: number;
  inactive_agents: number;
  total_referrals: number;
  total_commissions: number;
  monthly_commissions: number;
  top_agents: {
    agent_id: number;
    agent_name: string;
    total_referrals: number;
    total_commission: number;
  }[];
}

export interface AgentPerformance {
  agent_id: number;
  agent_name: string;
  total_referrals: number;
  successful_referrals: number;
  pending_referrals: number;
  total_commission_earned: number;
  monthly_commission: number;
  conversion_rate: number;
  active_referral_codes: number;
}

export interface CommissionCalculation {
  base_amount: number;
  commission_rate: number;
  commission_amount: number;
  bonus_amount: number;
  total_commission: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
}

// ========================================
// 代理商管理
// ========================================

/**
 * 註冊新代理商
 * @param userData 用戶資料
 * @param agentCode 代理商代碼
 * @returns 註冊結果
 */
export const registerAgent = (
  userData: Omit<User, 'id' | 'role' | 'created_at' | 'updated_at'>,
  agentCode?: string
): AgentResult => {
  try {
    // 檢查代理商代碼是否已存在
    if (agentCode) {
      const existingAgent = users.find(
        user => user.role === 'AGENT' && 
        user.profile?.agent_info?.agent_code === agentCode
      );
      
      if (existingAgent) {
        return {
          success: false,
          message: '代理商代碼已存在'
        };
      }
    }
    
    // 生成代理商代碼（如果未提供）
    const finalAgentCode = agentCode || generateAgentCode();
    
    const now = new Date();
    const newAgent: User = {
      ...userData,
      id: Math.max(...users.map(u => u.id), 0) + 1,
      role: 'AGENT',
      status: 'ACTIVE',
      profile: {
        ...userData.profile,
        agent_info: {
          agent_code: finalAgentCode,
          level: 'BRONZE',
          commission_rate: 10, // 預設10%佣金率
          total_referrals: 0,
          total_commission_earned: 0
        }
      },
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };
    
    users.push(newAgent);
    
    return {
      success: true,
      message: '代理商註冊成功',
      agent: newAgent
    };
  } catch {
    return {
      success: false,
      message: '代理商註冊失敗'
    };
  }
};

/**
 * 更新代理商等級
 * @param agentId 代理商ID
 * @param newLevel 新等級
 * @returns 更新結果
 */
export const updateAgentLevel = (
  agentId: number,
  newLevel: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
): AgentResult => {
  try {
    const agent = getUserById(agentId);
    
    if (!agent || agent.role !== 'AGENT') {
      return {
        success: false,
        message: '代理商不存在'
      };
    }
    
    if (!agent.profile?.agent_info) {
      return {
        success: false,
        message: '代理商資料不完整'
      };
    }
    
    // 更新等級和佣金率
    const commissionRates = {
      BRONZE: 10,
      SILVER: 12,
      GOLD: 15,
      PLATINUM: 18
    };
    
    agent.profile.agent_info.level = newLevel;
    agent.profile.agent_info.commission_rate = commissionRates[newLevel];
    agent.updated_at = new Date().toISOString();
    
    return {
      success: true,
      message: `代理商等級已更新為 ${newLevel}`,
      agent
    };
  } catch {
    return {
      success: false,
      message: '代理商等級更新失敗'
    };
  }
};

/**
 * 停用代理商
 * @param agentId 代理商ID
 * @param reason 停用原因
 * @returns 停用結果
 */
export const deactivateAgent = (agentId: number, reason?: string): AgentResult => {
  try {
    const agent = getUserById(agentId);
    
    if (!agent || agent.role !== 'AGENT') {
      return {
        success: false,
        message: '代理商不存在'
      };
    }
    
    agent.status = 'SUSPENDED';
    agent.updated_at = new Date().toISOString();
    
    // 停用所有相關的推薦代碼
    const agentReferralCodes = getReferralCodesByUser(agentId);
    agentReferralCodes.forEach(code => {
      updateReferralCodeStatus(code.id, 'INACTIVE');
    });
    
    return {
      success: true,
      message: `代理商已停用${reason ? `，原因：${reason}` : ''}`,
      agent
    };
  } catch {
    return {
      success: false,
      message: '代理商停用失敗'
    };
  }
};

// ========================================
// 推薦代碼管理
// ========================================

/**
 * 創建推薦代碼
 * @param agentId 代理商ID
 * @param codeData 推薦代碼資料
 * @returns 創建結果
 */
export const createReferralCode = (
  agentId: number,
  codeData: {
    code?: string;
    discount_percentage?: number;
    max_uses?: number;
    valid_until?: string;
    description?: string;
  }
): ReferralResult => {
  try {
    const agent = getUserById(agentId);
    
    if (!agent || agent.role !== 'AGENT' || agent.status !== 'ACTIVE') {
      return {
        success: false,
        message: '代理商不存在或未啟用'
      };
    }
    
    // 生成推薦代碼（如果未提供）
    const code = codeData.code || generateReferralCode(agent.profile?.agent_info?.agent_code || 'AG');
    
    // 檢查代碼是否已存在
    const existingCode = getReferralCodeByCode(code);
    if (existingCode) {
      return {
        success: false,
        message: '推薦代碼已存在'
      };
    }
    
    const validUntil = codeData.valid_until || (() => {
      const date = new Date();
      date.setMonth(date.getMonth() + 6); // 預設6個月有效
      return date.toISOString().split('T')[0];
    })();
    
    const newReferralCodeId = addReferralCode({
      agent_id: agentId,
      code,
      discount_percentage: codeData.discount_percentage || 5,
      max_uses: codeData.max_uses || 100,
      current_uses: 0,
      valid_until: validUntil,
      status: 'ACTIVE',
      description: codeData.description || '代理商推薦優惠'
    });
    
    const newReferralCode = referralCodes.find(rc => rc.id === newReferralCodeId);
    
    return {
      success: true,
      message: '推薦代碼創建成功',
      referralCode: newReferralCode
    };
  } catch {
    return {
      success: false,
      message: '推薦代碼創建失敗'
    };
  }
};

/**
 * 使用推薦代碼
 * @param code 推薦代碼
 * @param orderId 訂單ID
 * @returns 使用結果
 */
export const useReferralCode = (code: string, orderId: number): ReferralResult => {
  try {
    const referralCode = getReferralCodeByCode(code);
    
    if (!referralCode) {
      return {
        success: false,
        message: '推薦代碼不存在'
      };
    }
    
    if (referralCode.status !== 'ACTIVE') {
      return {
        success: false,
        message: '推薦代碼已失效'
      };
    }
    
    // 檢查使用次數限制
    if (referralCode.current_uses >= referralCode.max_uses) {
      return {
        success: false,
        message: '推薦代碼已達使用上限'
      };
    }
    
    // 檢查有效期限
    const now = new Date();
    const validUntil = new Date(referralCode.valid_until);
    if (now > validUntil) {
      updateReferralCodeStatus(referralCode.id, 'EXPIRED');
      return {
        success: false,
        message: '推薦代碼已過期'
      };
    }
    
    // 更新使用次數
    referralCode.current_uses += 1;
    referralCode.updated_at = now.toISOString();
    
    // 計算並創建佣金記錄
    const order = getOrderById(orderId);
    if (order) {
      const commissionCalc = calculateCommission(referralCode.agent_id, order.total_amount);
      
      addCommission({
        agent_id: referralCode.agent_id,
        referral_code_id: referralCode.id,
        order_id: orderId,
        commission_amount: commissionCalc.total_commission,
        commission_rate: commissionCalc.commission_rate,
        status: 'PENDING'
      });
      
      // 更新代理商統計
      const agent = getUserById(referralCode.agent_id);
      if (agent?.profile?.agent_info) {
        agent.profile.agent_info.total_referrals += 1;
        agent.updated_at = now.toISOString();
      }
    }
    
    return {
      success: true,
      message: '推薦代碼使用成功',
      referralCode
    };
  } catch {
    return {
      success: false,
      message: '推薦代碼使用失敗'
    };
  }
};

// ========================================
// 佣金計算與管理
// ========================================

/**
 * 計算佣金
 * @param agentId 代理商ID
 * @param baseAmount 基礎金額
 * @returns 佣金計算結果
 */
export const calculateCommission = (agentId: number, baseAmount: number): CommissionCalculation => {
  const agent = getUserById(agentId);
  const agentInfo = agent?.profile?.agent_info;
  
  if (!agentInfo) {
    return {
      base_amount: baseAmount,
      commission_rate: 0,
      commission_amount: 0,
      bonus_amount: 0,
      total_commission: 0,
      tier: 'BRONZE'
    };
  }
  
  const commissionRate = agentInfo.commission_rate;
  const tier = agentInfo.level;
  const commissionAmount = baseAmount * (commissionRate / 100);
  
  // 計算獎金（基於推薦數量）
  let bonusAmount = 0;
  const totalReferrals = agentInfo.total_referrals;
  
  if (totalReferrals >= 100) {
    bonusAmount = commissionAmount * 0.2; // 20% 獎金
  } else if (totalReferrals >= 50) {
    bonusAmount = commissionAmount * 0.15; // 15% 獎金
  } else if (totalReferrals >= 25) {
    bonusAmount = commissionAmount * 0.1; // 10% 獎金
  }
  
  return {
    base_amount: baseAmount,
    commission_rate: commissionRate,
    commission_amount: commissionAmount,
    bonus_amount: bonusAmount,
    total_commission: commissionAmount + bonusAmount,
    tier
  };
};

/**
 * 核准佣金
 * @param commissionId 佣金ID
 * @returns 核准結果
 */
export const approveCommission = (commissionId: number): CommissionResult => {
  try {
    const commissionIndex = commissions.findIndex(c => c.id === commissionId);
    
    if (commissionIndex === -1) {
      return {
        success: false,
        message: '佣金記錄不存在'
      };
    }
    
    const commission = commissions[commissionIndex];
    
    if (commission.status !== 'PENDING') {
      return {
        success: false,
        message: '只有待審核的佣金可以核准'
      };
    }
    
    commission.status = 'APPROVED';
    commission.approved_at = new Date().toISOString();
    commission.updated_at = new Date().toISOString();
    
    // 更新代理商總佣金
    const agent = getUserById(commission.agent_id);
    if (agent?.profile?.agent_info) {
      agent.profile.agent_info.total_commission_earned += commission.commission_amount;
      agent.updated_at = new Date().toISOString();
    }
    
    return {
      success: true,
      message: '佣金已核准',
      commission
    };
  } catch {
    return {
      success: false,
      message: '佣金核准失敗'
    };
  }
};

/**
 * 批次核准佣金
 * @param commissionIds 佣金ID列表
 * @returns 批次核准結果
 */
export const batchApproveCommissions = (commissionIds: number[]): {
  successful_approvals: Commission[];
  failed_approvals: { commission_id: number; reason: string; }[];
  message: string;
} => {
  const results = {
    successful_approvals: [] as Commission[],
    failed_approvals: [] as { commission_id: number; reason: string; }[],
    message: ''
  };
  
  for (const commissionId of commissionIds) {
    const result = approveCommission(commissionId);
    
    if (result.success && result.commission) {
      results.successful_approvals.push(result.commission);
    } else {
      results.failed_approvals.push({
        commission_id: commissionId,
        reason: result.message
      });
    }
  }
  
  if (results.successful_approvals.length === commissionIds.length) {
    results.message = '所有佣金已核准';
  } else if (results.successful_approvals.length > 0) {
    results.message = `部分佣金核准成功：${results.successful_approvals.length}/${commissionIds.length}`;
  } else {
    results.message = '所有佣金核准失敗';
  }
  
  return results;
};

// ========================================
// 統計報表功能
// ========================================

/**
 * 獲取代理商統計資料
 * @returns 統計資料
 */
export const getAgentStatistics = (): AgentStats => {
  const agents = getUsersByRole('AGENT');
  const totalCommissions = commissions.reduce((sum, c) => sum + c.commission_amount, 0);
  
  // 計算本月佣金
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const monthlyCommissions = commissions
    .filter(c => {
      const commissionDate = new Date(c.created_at);
      return commissionDate.getMonth() === currentMonth && 
             commissionDate.getFullYear() === currentYear &&
             c.status === 'APPROVED';
    })
    .reduce((sum, c) => sum + c.commission_amount, 0);
  
  // 計算頂級代理商
  const topAgents = agents
    .map(agent => ({
      agent_id: agent.id,
      agent_name: agent.name,
      total_referrals: agent.profile?.agent_info?.total_referrals || 0,
      total_commission: agent.profile?.agent_info?.total_commission_earned || 0
    }))
    .sort((a, b) => b.total_commission - a.total_commission)
    .slice(0, 5);
  
  return {
    total_agents: agents.length,
    active_agents: agents.filter(a => a.status === 'ACTIVE').length,
    inactive_agents: agents.filter(a => a.status !== 'ACTIVE').length,
    total_referrals: agents.reduce((sum, a) => sum + (a.profile?.agent_info?.total_referrals || 0), 0),
    total_commissions: totalCommissions,
    monthly_commissions: monthlyCommissions,
    top_agents: topAgents
  };
};

/**
 * 獲取代理商績效報表
 * @param agentId 代理商ID
 * @returns 績效報表
 */
export const getAgentPerformance = (agentId: number): AgentPerformance | null => {
  const agent = getUserById(agentId);
  
  if (!agent || agent.role !== 'AGENT') {
    return null;
  }
  
  const agentReferralCodes = getReferralCodesByUser(agentId);
  const agentCommissions = getCommissionsByAgent(agentId);
  
  // 計算本月佣金
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const monthlyCommission = agentCommissions
    .filter(c => {
      const commissionDate = new Date(c.created_at);
      return commissionDate.getMonth() === currentMonth && 
             commissionDate.getFullYear() === currentYear &&
             c.status === 'APPROVED';
    })
    .reduce((sum, c) => sum + c.commission_amount, 0);
  
  const totalReferrals = agent.profile?.agent_info?.total_referrals || 0;
  const successfulReferrals = agentCommissions.filter(c => c.status === 'APPROVED').length;
  
  return {
    agent_id: agentId,
    agent_name: agent.name,
    total_referrals: totalReferrals,
    successful_referrals: successfulReferrals,
    pending_referrals: totalReferrals - successfulReferrals,
    total_commission_earned: agent.profile?.agent_info?.total_commission_earned || 0,
    monthly_commission: monthlyCommission,
    conversion_rate: totalReferrals > 0 ? (successfulReferrals / totalReferrals) * 100 : 0,
    active_referral_codes: agentReferralCodes.filter(rc => rc.status === 'ACTIVE').length
  };
};

// ========================================
// 工具函數
// ========================================

/**
 * 生成代理商代碼
 * @returns 代理商代碼
 */
const generateAgentCode = (): string => {
  const prefix = 'AG';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

/**
 * 生成推薦代碼
 * @param agentCode 代理商代碼
 * @returns 推薦代碼
 */
const generateReferralCode = (agentCode: string): string => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `${agentCode}${timestamp}${random}`;
};

// ========================================
// 預設匯出
// ========================================

const agentServiceModule = {
  registerAgent,
  updateAgentLevel,
  deactivateAgent,
  createReferralCode,
  useReferralCode,
  calculateCommission,
  approveCommission,
  batchApproveCommissions,
  getAgentStatistics,
  getAgentPerformance
};

export default agentServiceModule;