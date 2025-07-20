// 推薦功能數據管理
export interface ReferralCode {
  id: string;
  userId: number;
  userName: string;
  membershipPlanId: string;
  membershipPlanName: string;
  code: string;
  referralLink: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // 統計數據
  totalReferrals: number;
  successfulReferrals: number;
  totalCommission: number;
  monthlyReferrals: number;
  monthlyCommission: number;
}

export interface ReferralRecord {
  id: string;
  referralCodeId: string;
  referrerUserId: number;
  referrerName: string;
  referredEmail: string;
  referredName?: string;
  membershipPlanId: string;
  membershipPlanName: string;
  status: 'pending' | 'completed' | 'cancelled';
  commissionAmount: number;
  createdAt: string;
  completedAt?: string;
}

// 模擬推薦代碼數據
const referralCodes: ReferralCode[] = [
  // 學生推薦代碼
  {
    id: 'ref_001',
    userId: 1,
    userName: '王小明',
    membershipPlanId: 'quarterly',
    membershipPlanName: '季方案',
    code: 'WANG-Q3-2024',
    referralLink: 'https://tli-connect.com/membership?ref=WANG-Q3-2024',
    isActive: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    totalReferrals: 3,
    successfulReferrals: 2,
    totalCommission: 2160,
    monthlyReferrals: 1,
    monthlyCommission: 1080
  },
  {
    id: 'ref_002',
    userId: 1,
    userName: '王小明',
    membershipPlanId: 'yearly',
    membershipPlanName: '年方案',
    code: 'WANG-Y1-2024',
    referralLink: 'https://tli-connect.com/membership?ref=WANG-Y1-2024',
    isActive: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    totalReferrals: 5,
    successfulReferrals: 4,
    totalCommission: 14400,
    monthlyReferrals: 2,
    monthlyCommission: 7200
  },
  // 教師推薦代碼
  {
    id: 'ref_003',
    userId: 2,
    userName: '張老師',
    membershipPlanId: 'quarterly',
    membershipPlanName: '季方案',
    code: 'ZHANG-Q3-2024',
    referralLink: 'https://tli-connect.com/membership?ref=ZHANG-Q3-2024',
    isActive: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10',
    totalReferrals: 8,
    successfulReferrals: 6,
    totalCommission: 6480,
    monthlyReferrals: 3,
    monthlyCommission: 3240
  },
  {
    id: 'ref_004',
    userId: 2,
    userName: '張老師',
    membershipPlanId: 'yearly',
    membershipPlanName: '年方案',
    code: 'ZHANG-Y1-2024',
    referralLink: 'https://tli-connect.com/membership?ref=ZHANG-Y1-2024',
    isActive: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10',
    totalReferrals: 12,
    successfulReferrals: 9,
    totalCommission: 32400,
    monthlyReferrals: 4,
    monthlyCommission: 14400
  },
  // 顧問推薦代碼
  {
    id: 'ref_005',
    userId: 5,
    userName: '李顧問',
    membershipPlanId: 'quarterly',
    membershipPlanName: '季方案',
    code: 'LI-Q3-2024',
    referralLink: 'https://tli-connect.com/membership?ref=LI-Q3-2024',
    isActive: true,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05',
    totalReferrals: 15,
    successfulReferrals: 12,
    totalCommission: 12960,
    monthlyReferrals: 5,
    monthlyCommission: 5400
  },
  {
    id: 'ref_006',
    userId: 5,
    userName: '李顧問',
    membershipPlanId: 'yearly',
    membershipPlanName: '年方案',
    code: 'LI-Y1-2024',
    referralLink: 'https://tli-connect.com/membership?ref=LI-Y1-2024',
    isActive: true,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05',
    totalReferrals: 20,
    successfulReferrals: 16,
    totalCommission: 57600,
    monthlyReferrals: 8,
    monthlyCommission: 28800
  },
  // 管理員推薦代碼
  {
    id: 'ref_007',
    userId: 3,
    userName: '系統管理員',
    membershipPlanId: 'quarterly',
    membershipPlanName: '季方案',
    code: 'ADMIN-Q3-2024',
    referralLink: 'https://tli-connect.com/membership?ref=ADMIN-Q3-2024',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    totalReferrals: 25,
    successfulReferrals: 20,
    totalCommission: 21600,
    monthlyReferrals: 8,
    monthlyCommission: 8640
  },
  {
    id: 'ref_008',
    userId: 3,
    userName: '系統管理員',
    membershipPlanId: 'yearly',
    membershipPlanName: '年方案',
    code: 'ADMIN-Y1-2024',
    referralLink: 'https://tli-connect.com/membership?ref=ADMIN-Y1-2024',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    totalReferrals: 35,
    successfulReferrals: 28,
    totalCommission: 100800,
    monthlyReferrals: 12,
    monthlyCommission: 43200
  }
];

// 模擬推薦記錄數據
const referralRecords: ReferralRecord[] = [
  {
    id: 'record_001',
    referralCodeId: 'ref_002',
    referrerUserId: 1,
    referrerName: '王小明',
    referredEmail: 'customer1@example.com',
    referredName: '陳小華',
    membershipPlanId: 'yearly',
    membershipPlanName: '年方案',
    status: 'completed',
    commissionAmount: 3600,
    createdAt: '2024-12-01',
    completedAt: '2024-12-02'
  },
  {
    id: 'record_002',
    referralCodeId: 'ref_006',
    referrerUserId: 5,
    referrerName: '李顧問',
    referredEmail: 'customer2@example.com',
    referredName: '林小美',
    membershipPlanId: 'yearly',
    membershipPlanName: '年方案',
    status: 'completed',
    commissionAmount: 3600,
    createdAt: '2024-12-15',
    completedAt: '2024-12-16'
  },
  {
    id: 'record_003',
    referralCodeId: 'ref_008',
    referrerUserId: 3,
    referrerName: '系統管理員',
    referredEmail: 'customer3@example.com',
    referredName: '劉小強',
    membershipPlanId: 'yearly',
    membershipPlanName: '年方案',
    status: 'completed',
    commissionAmount: 3600,
    createdAt: '2024-12-20',
    completedAt: '2024-12-21'
  }
];

// API 函數
export const getReferralCodesByUser = (userId: number): ReferralCode[] => {
  return referralCodes.filter(code => code.userId === userId);
};

export const getAllReferralCodes = (): ReferralCode[] => {
  return referralCodes;
};

export const getReferralCode = (id: string): ReferralCode | undefined => {
  return referralCodes.find(code => code.id === id);
};

export const getReferralCodeByCode = (code: string): ReferralCode | undefined => {
  return referralCodes.find(referralCode => referralCode.code === code);
};

export const generateReferralCode = (userId: number, userName: string, membershipPlanId: string, membershipPlanName: string): ReferralCode => {
  // 生成推薦代碼格式：用戶名簡寫-方案簡寫-年份
  const userPrefix = userName.substring(0, 2).toUpperCase();
  const planPrefix = membershipPlanId === 'yearly' ? 'Y1' : 'Q3';
  const year = new Date().getFullYear();
  const code = `${userPrefix}-${planPrefix}-${year}`;
  
  const newReferralCode: ReferralCode = {
    id: `ref_${Date.now()}`,
    userId,
    userName,
    membershipPlanId,
    membershipPlanName,
    code,
    referralLink: `https://tli-connect.com/membership?ref=${code}`,
    isActive: true,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    totalReferrals: 0,
    successfulReferrals: 0,
    totalCommission: 0,
    monthlyReferrals: 0,
    monthlyCommission: 0
  };
  
  referralCodes.push(newReferralCode);
  return newReferralCode;
};

export const updateReferralCode = (id: string, updates: Partial<ReferralCode>): ReferralCode | null => {
  const index = referralCodes.findIndex(code => code.id === id);
  if (index === -1) return null;
  
  const updatedCode = {
    ...referralCodes[index],
    ...updates,
    updatedAt: new Date().toISOString().split('T')[0]
  };
  
  referralCodes[index] = updatedCode;
  return updatedCode;
};

export const getReferralRecordsByUser = (userId: number): ReferralRecord[] => {
  return referralRecords.filter(record => record.referrerUserId === userId);
};

export const getAllReferralRecords = (): ReferralRecord[] => {
  return referralRecords;
};

// 計算佣金比例（10%）
export const calculateCommission = (membershipPrice: number): number => {
  return Math.round(membershipPrice * 0.1);
};

// 記錄推薦購買
export const recordReferralPurchase = (
  referralCode: string,
  customerEmail: string,
  customerName: string,
  membershipPlanId: string,
  membershipPlanName: string,
  amount: number
): ReferralRecord => {
  const referralCodeData = getReferralCodeByCode(referralCode);
  if (!referralCodeData) {
    throw new Error('推薦代碼不存在');
  }

  const newRecord: ReferralRecord = {
    id: `record_${Date.now()}`,
    referralCodeId: referralCodeData.id,
    referrerUserId: referralCodeData.userId,
    referrerName: referralCodeData.userName,
    referredEmail: customerEmail,
    referredName: customerName,
    membershipPlanId,
    membershipPlanName,
    status: 'completed',
    commissionAmount: calculateCommission(amount),
    createdAt: new Date().toISOString().split('T')[0],
    completedAt: new Date().toISOString().split('T')[0]
  };

  referralRecords.push(newRecord);

  // 更新推薦代碼統計
  const codeIndex = referralCodes.findIndex(code => code.id === referralCodeData.id);
  if (codeIndex !== -1) {
    referralCodes[codeIndex].totalReferrals += 1;
    referralCodes[codeIndex].successfulReferrals += 1;
    referralCodes[codeIndex].totalCommission += newRecord.commissionAmount;
    referralCodes[codeIndex].monthlyReferrals += 1;
    referralCodes[codeIndex].monthlyCommission += newRecord.commissionAmount;
    referralCodes[codeIndex].updatedAt = new Date().toISOString().split('T')[0];
  }

  return newRecord;
};