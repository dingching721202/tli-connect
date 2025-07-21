export interface ReferralCode {
  id: string;
  code: string;
  referrerId: string;  // User ID who created the referral
  referrerName: string;
  referrerEmail: string;
  discountPercentage: number;  // e.g., 10 for 10% discount
  maxUses: number;  // -1 for unlimited
  currentUses: number;
  expiryDate: string | null;  // null for no expiry
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralUsage {
  id: string;
  referralCodeId: string;
  referralCode: string;
  referrerId: string;
  referredUserId: string;
  referredUserName: string;
  referredUserEmail: string;
  orderId: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  commission: number;  // Amount earned by referrer
  status: 'pending' | 'completed' | 'cancelled';
  usedAt: string;
  completedAt: string | null;
}

export interface ReferralReward {
  id: string;
  referrerId: string;
  referralUsageId: string;
  rewardType: 'commission' | 'bonus' | 'discount';
  amount: number;
  currency: 'TWD';
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  description: string;
  earnedAt: string;
  paidAt: string | null;
}

// Mock referral codes data
const referralCodes: ReferralCode[] = [
  {
    id: 'ref_001',
    code: 'JOHN2024',
    referrerId: '1',
    referrerName: 'John Smith',
    referrerEmail: 'john@example.com',
    discountPercentage: 10,
    maxUses: 50,
    currentUses: 5,
    expiryDate: '2024-12-31T23:59:59Z',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-07-20T00:00:00Z'
  },
  {
    id: 'ref_002',
    code: 'MARY15OFF',
    referrerId: '2',
    referrerName: 'Mary Johnson',
    referrerEmail: 'mary@example.com',
    discountPercentage: 15,
    maxUses: 20,
    currentUses: 12,
    expiryDate: '2024-10-31T23:59:59Z',
    isActive: true,
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-07-20T00:00:00Z'
  }
];

// Mock referral usage data
const referralUsages: ReferralUsage[] = [
  {
    id: 'usage_001',
    referralCodeId: 'ref_001',
    referralCode: 'JOHN2024',
    referrerId: '1',
    referredUserId: '5',
    referredUserName: 'Alice Chen',
    referredUserEmail: 'alice@example.com',
    orderId: 'ord_001',
    originalAmount: 10000,
    discountAmount: 1000,
    finalAmount: 9000,
    commission: 500,
    status: 'completed',
    usedAt: '2024-07-15T10:30:00Z',
    completedAt: '2024-07-15T10:35:00Z'
  },
  {
    id: 'usage_002',
    referralCodeId: 'ref_002',
    referralCode: 'MARY15OFF',
    referrerId: '2',
    referredUserId: '6',
    referredUserName: 'Bob Wang',
    referredUserEmail: 'bob@example.com',
    orderId: 'ord_002',
    originalAmount: 3000,
    discountAmount: 450,
    finalAmount: 2550,
    commission: 150,
    status: 'completed',
    usedAt: '2024-07-18T14:20:00Z',
    completedAt: '2024-07-18T14:25:00Z'
  }
];

// Mock referral rewards data
const referralRewards: ReferralReward[] = [
  {
    id: 'reward_001',
    referrerId: '1',
    referralUsageId: 'usage_001',
    rewardType: 'commission',
    amount: 500,
    currency: 'TWD',
    status: 'paid',
    description: '推薦獎金 - Alice Chen 購買年度方案',
    earnedAt: '2024-07-15T10:35:00Z',
    paidAt: '2024-07-20T00:00:00Z'
  },
  {
    id: 'reward_002',
    referrerId: '2',
    referralUsageId: 'usage_002',
    rewardType: 'commission',
    amount: 150,
    currency: 'TWD',
    status: 'approved',
    description: '推薦獎金 - Bob Wang 購買季度方案',
    earnedAt: '2024-07-18T14:25:00Z',
    paidAt: null
  }
];

// Referral code functions
export function getAllReferralCodes(): ReferralCode[] {
  return referralCodes;
}

export function getReferralCodeById(id: string): ReferralCode | null {
  return referralCodes.find(code => code.id === id) || null;
}

export function getReferralCodeByCode(code: string): ReferralCode | null {
  return referralCodes.find(ref => ref.code.toLowerCase() === code.toLowerCase()) || null;
}

export function getReferralCodesByReferrer(referrerId: string): ReferralCode[] {
  return referralCodes.filter(code => code.referrerId === referrerId);
}

export function getActiveReferralCodes(): ReferralCode[] {
  const now = new Date();
  return referralCodes.filter(code => {
    if (!code.isActive) return false;
    if (code.expiryDate && new Date(code.expiryDate) < now) return false;
    if (code.maxUses > 0 && code.currentUses >= code.maxUses) return false;
    return true;
  });
}

export function createReferralCode(codeData: Omit<ReferralCode, 'id' | 'currentUses' | 'createdAt' | 'updatedAt'>): ReferralCode {
  const newCode: ReferralCode = {
    ...codeData,
    id: `ref_${Date.now()}`,
    currentUses: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  referralCodes.push(newCode);
  return newCode;
}

export function validateReferralCode(code: string): { isValid: boolean; referralCode?: ReferralCode; message: string } {
  const referralCode = getReferralCodeByCode(code);
  
  if (!referralCode) {
    return { isValid: false, message: '推薦碼不存在' };
  }
  
  if (!referralCode.isActive) {
    return { isValid: false, message: '推薦碼已停用' };
  }
  
  if (referralCode.expiryDate && new Date(referralCode.expiryDate) < new Date()) {
    return { isValid: false, message: '推薦碼已過期' };
  }
  
  if (referralCode.maxUses > 0 && referralCode.currentUses >= referralCode.maxUses) {
    return { isValid: false, message: '推薦碼使用次數已達上限' };
  }
  
  return { 
    isValid: true, 
    referralCode, 
    message: `可享 ${referralCode.discountPercentage}% 折扣` 
  };
}

// Referral usage functions
export function getReferralUsagesByReferrer(referrerId: string): ReferralUsage[] {
  return referralUsages.filter(usage => usage.referrerId === referrerId);
}

export function getReferralUsagesByReferred(referredUserId: string): ReferralUsage[] {
  return referralUsages.filter(usage => usage.referredUserId === referredUserId);
}

export function createReferralUsage(usageData: Omit<ReferralUsage, 'id' | 'usedAt' | 'completedAt'>): ReferralUsage {
  const newUsage: ReferralUsage = {
    ...usageData,
    id: `usage_${Date.now()}`,
    usedAt: new Date().toISOString(),
    completedAt: usageData.status === 'completed' ? new Date().toISOString() : null
  };
  
  referralUsages.push(newUsage);
  
  // Update referral code usage count
  const referralCode = getReferralCodeById(usageData.referralCodeId);
  if (referralCode) {
    referralCode.currentUses++;
    referralCode.updatedAt = new Date().toISOString();
  }
  
  return newUsage;
}

// Referral rewards functions
export function getReferralRewardsByReferrer(referrerId: string): ReferralReward[] {
  return referralRewards.filter(reward => reward.referrerId === referrerId);
}

export function getTotalEarnings(referrerId: string): { total: number; pending: number; paid: number } {
  const rewards = getReferralRewardsByReferrer(referrerId);
  
  return {
    total: rewards.reduce((sum, reward) => sum + reward.amount, 0),
    pending: rewards.filter(r => r.status === 'pending' || r.status === 'approved').reduce((sum, reward) => sum + reward.amount, 0),
    paid: rewards.filter(r => r.status === 'paid').reduce((sum, reward) => sum + reward.amount, 0)
  };
}

export function createReferralReward(rewardData: Omit<ReferralReward, 'id' | 'earnedAt' | 'paidAt'>): ReferralReward {
  const newReward: ReferralReward = {
    ...rewardData,
    id: `reward_${Date.now()}`,
    earnedAt: new Date().toISOString(),
    paidAt: null
  };
  
  referralRewards.push(newReward);
  return newReward;
}

// Statistics functions
export function getReferralStatistics(referrerId?: string) {
  let usages = referralUsages;
  let codes = referralCodes;
  let rewards = referralRewards;
  
  if (referrerId) {
    usages = usages.filter(u => u.referrerId === referrerId);
    codes = codes.filter(c => c.referrerId === referrerId);
    rewards = rewards.filter(r => r.referrerId === referrerId);
  }
  
  const totalReferrals = usages.length;
  const completedReferrals = usages.filter(u => u.status === 'completed').length;
  const totalSales = usages.reduce((sum, usage) => sum + usage.finalAmount, 0);
  const totalCommission = rewards.reduce((sum, reward) => sum + reward.amount, 0);
  
  return {
    totalReferrals,
    completedReferrals,
    conversionRate: totalReferrals > 0 ? (completedReferrals / totalReferrals) * 100 : 0,
    totalSales,
    totalCommission,
    activeCodes: codes.filter(c => c.isActive).length
  };
}

// Generate a new referral code
export function generateReferralCode(prefix: string = 'TLI'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`.toUpperCase();
}

// Additional function required by components
export function getReferralCodesByUser(userId: string): ReferralCode[] {
  return getReferralCodesByReferrer(userId);
}