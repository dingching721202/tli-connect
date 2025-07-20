// 企業管理相關數據

export interface Company {
  id: number;
  name: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  industry: string;
  employeeCount: number;
  membershipPlan: string;
  totalSlots: number;
  usedSlots: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'expired';
  createdAt: string;
  membershipPlans: MembershipPlan[];
}

export interface MembershipPlan {
  id: number;
  name: string;
  type: 'primary' | 'addon' | 'trial';
  duration: number; // 月數
  durationType: 'quarterly' | 'annual'; // 方案類型：季方案、年方案
  purchaseDate: string;
  startDate: string;
  endDate: string;
  slots?: number;
  usedSlots?: number;
  status: 'active' | 'expired' | 'expiring_soon';
  features: string[];
  basePrice?: number; // 基礎價格
  discountRate?: number; // 折扣率
}

export interface CorporateUser {
  id: number;
  companyId: number;
  planId?: number; // 關聯的方案ID
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  joinDate: string; // 加入企業方案的時間
  membershipStartDate: string; // 個人會員開始時間（根據方案類型調整）
  membershipEndDate: string; // 個人會員結束時間（根據方案類型計算）
  planType: 'quarterly' | 'yearly'; // 季方案或年方案
  status: 'active' | 'inactive' | 'expired';
  isAccountHolder: boolean; // 是否為當前使用該會員帳號的人
  membershipStatus: {
    isActive: boolean;
    daysRemaining: number;
    willExpireWithPlan: boolean; // 是否會隨企業方案到期而到期
  };
  learningProgress: {
    coursesEnrolled: number;
    coursesCompleted: number;
    totalHours: number;
    lastActivity: string;
    completionRate: number;
  };
}

export interface AccountTransfer {
  id: string;
  companyId: number;
  fromUserId: number;
  toUserId: number;
  fromUserName: string;
  toUserName: string;
  transferDate: string;
  reason: string;
  approvedBy: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Mock 企業數據
const companies: Company[] = [
  {
    id: 1,
    name: '台灣科技股份有限公司',
    contactPerson: '王企業窗口',
    contactEmail: 'corporate.contact@taiwantech.com',
    contactPhone: '02-2345-6789',
    address: '台北市信義區信義路五段7號',
    industry: '資訊科技',
    employeeCount: 150,
    membershipPlan: '企業方案 (50人)',
    totalSlots: 50,
    usedSlots: 35,
    startDate: '2023-07-01',
    endDate: '2024-07-01', // 設為已到期，用於測試功能
    status: 'expired',
    createdAt: '2024-06-15',
    membershipPlans: [
      {
        id: 1,
        name: '企業方案 (第一期)',
        type: 'primary',
        duration: 12,
        durationType: 'annual',
        purchaseDate: '2024-01-15',
        startDate: '2024-01-15',
        endDate: '2025-01-15',
        slots: 50,
        usedSlots: 35,
        status: 'active',
        features: ['基本功能', '企業報表'],
        basePrice: 50000,
        discountRate: 0.1
      },
      {
        id: 11,
        name: '企業方案 (第二期)',
        type: 'primary',
        duration: 12,
        durationType: 'annual',
        purchaseDate: '2024-09-01',
        startDate: '2024-09-01',
        endDate: '2025-09-01',
        slots: 30,
        usedSlots: 18,
        status: 'active',
        features: ['基本功能'],
        basePrice: 36000
      }
    ]
  },
  {
    id: 2,
    name: '創新製造有限公司',
    contactPerson: '李經理',
    contactEmail: 'manager@innovation.com',
    contactPhone: '03-1234-5678',
    address: '桃園市中壢區中央路100號',
    industry: '製造業',
    employeeCount: 80,
    membershipPlan: '企業方案 (30人)',
    totalSlots: 30,
    usedSlots: 25,
    startDate: '2024-08-01',
    endDate: '2025-08-01',
    status: 'active',
    createdAt: '2024-07-20',
    membershipPlans: [
      {
        id: 2,
        name: '企業方案 (2024年度)',
        type: 'primary',
        duration: 12,
        durationType: 'annual',
        purchaseDate: '2024-03-01',
        startDate: '2024-03-01',
        endDate: '2025-03-01',
        slots: 30,
        usedSlots: 25,
        status: 'active',
        features: ['基本功能', '專人客服'],
        basePrice: 30000,
        discountRate: 0.05
      },
      {
        id: 21,
        name: '企業方案 (續約)',
        type: 'primary',
        duration: 12,
        durationType: 'annual',
        purchaseDate: '2024-11-15',
        startDate: '2025-03-01',
        endDate: '2026-03-01',
        slots: 40,
        usedSlots: 0,
        status: 'active',
        features: ['基本功能', '專人客服', '數據分析'],
        basePrice: 48000
      }
    ]
  },
  {
    id: 3,
    name: '數位教育科技公司',
    contactPerson: '陳技術長',
    contactEmail: 'cto@edutech.com',
    contactPhone: '07-9876-5432',
    address: '高雄市前鎮區成功二路88號',
    industry: '教育科技',
    employeeCount: 120,
    membershipPlan: '企業進階方案 (100人)',
    totalSlots: 100,
    usedSlots: 78,
    startDate: '2024-06-01',
    endDate: '2025-06-01',
    status: 'active',
    createdAt: '2024-05-15',
    membershipPlans: [
      {
        id: 3,
        name: '企業方案 (大型)',
        type: 'primary',
        duration: 12,
        durationType: 'annual',
        purchaseDate: '2024-06-01',
        startDate: '2024-06-01',
        endDate: '2025-06-01',
        slots: 100,
        usedSlots: 78,
        status: 'active',
        features: ['所有功能', '優先支援'],
        basePrice: 100000,
        discountRate: 0.15
      }
    ]
  }
];

// Mock 企業用戶數據
const corporateUsers: CorporateUser[] = [
  {
    id: 1,
    companyId: 1,
    planId: 1, // 屬於第一期方案
    name: '張小明',
    email: 'zhang@taiwantech.com',
    phone: '0912-345-678',
    department: '研發部',
    position: '軟體工程師',
    joinDate: '2024-07-01', // 加入企業方案的時間
    membershipStartDate: '2024-07-01', // 年方案：從加入日開始
    membershipEndDate: '2025-07-01', // 年方案：加入日+12個月
    planType: 'yearly',
    status: 'active',
    isAccountHolder: true,
    membershipStatus: {
      isActive: true,
      daysRemaining: 193, // 到2025-07-01的剩餘天數
      willExpireWithPlan: false // 個人會員期限獨立於企業方案
    },
    learningProgress: {
      coursesEnrolled: 5,
      coursesCompleted: 3,
      totalHours: 24,
      lastActivity: '2024-12-20',
      completionRate: 60
    }
  },
  {
    id: 2,
    companyId: 1,
    planId: 1, // 屬於第一期方案
    name: '李小華',
    email: 'li@taiwantech.com',
    phone: '0923-456-789',
    department: '行銷部',
    position: '行銷專員',
    joinDate: '2024-08-15', // 加入企業方案的時間
    membershipStartDate: '2024-08-15', // 季方案：從加入日開始
    membershipEndDate: '2024-11-15', // 季方案：加入日+3個月
    planType: 'quarterly',
    status: 'expired', // 季方案已過期
    isAccountHolder: false,
    membershipStatus: {
      isActive: false,
      daysRemaining: 0, // 已過期
      willExpireWithPlan: false // 個人會員期限獨立於企業方案
    },
    learningProgress: {
      coursesEnrolled: 3,
      coursesCompleted: 2,
      totalHours: 18,
      lastActivity: '2024-12-19',
      completionRate: 67
    }
  },
  {
    id: 3,
    companyId: 1,
    planId: 11, // 屬於第二期方案
    name: '王小美',
    email: 'wang@taiwantech.com',
    phone: '0934-567-890',
    department: '人資部',
    position: '人資專員',
    joinDate: '2024-09-01', // 加入企業方案的時間
    membershipStartDate: '2024-09-01', // 年方案：從加入日開始
    membershipEndDate: '2025-09-01', // 年方案：加入日+12個月，超過企業方案期限
    planType: 'yearly',
    status: 'active',
    isAccountHolder: false,
    membershipStatus: {
      isActive: true,
      daysRemaining: 254, // 到2025-09-01的剩餘天數，超過企業方案期限
      willExpireWithPlan: false // 個人會員期限優先，不隨企業方案到期
    },
    learningProgress: {
      coursesEnrolled: 2,
      coursesCompleted: 1,
      totalHours: 8,
      lastActivity: '2024-12-10',
      completionRate: 50
    }
  },
  {
    id: 4,
    companyId: 2,
    planId: 2, // 屬於創新製造2024年度方案
    name: '陳工程師',
    email: 'chen@innovation.com',
    phone: '0945-678-901',
    department: '技術部',
    position: '資深工程師',
    joinDate: '2024-08-01',
    membershipStartDate: '2024-08-01',
    membershipEndDate: '2025-08-01',
    planType: 'yearly',
    status: 'active',
    isAccountHolder: true,
    membershipStatus: {
      isActive: true,
      daysRemaining: 224,
      willExpireWithPlan: false
    },
    learningProgress: {
      coursesEnrolled: 4,
      coursesCompleted: 4,
      totalHours: 32,
      lastActivity: '2024-12-21',
      completionRate: 100
    }
  },
  {
    id: 5,
    companyId: 3,
    planId: 3, // 屬於數位教育大型方案
    name: '黃產品經理',
    email: 'huang@edutech.com',
    phone: '0956-789-012',
    department: '產品部',
    position: '產品經理',
    joinDate: '2024-06-01',
    membershipStartDate: '2024-06-01',
    membershipEndDate: '2025-06-01',
    planType: 'yearly',
    status: 'active',
    isAccountHolder: true,
    membershipStatus: {
      isActive: true,
      daysRemaining: 162,
      willExpireWithPlan: false
    },
    learningProgress: {
      coursesEnrolled: 6,
      coursesCompleted: 5,
      totalHours: 45,
      lastActivity: '2024-12-22',
      completionRate: 83
    }
  },
  {
    id: 6,
    companyId: 3,
    planId: 3, // 屬於數位教育大型方案
    name: '劉數據分析師',
    email: 'liu@edutech.com',
    phone: '0967-890-123',
    department: '數據部',
    position: '數據分析師',
    joinDate: '2024-07-15',
    membershipStartDate: '2024-07-15',
    membershipEndDate: '2025-07-15',
    planType: 'yearly',
    status: 'active',
    isAccountHolder: false,
    membershipStatus: {
      isActive: true,
      daysRemaining: 207,
      willExpireWithPlan: false
    },
    learningProgress: {
      coursesEnrolled: 8,
      coursesCompleted: 6,
      totalHours: 52,
      lastActivity: '2024-12-21',
      completionRate: 75
    }
  },
  // 新增更多台灣科技公司的用戶
  {
    id: 7,
    companyId: 1,
    planId: 1, // 屬於第一期方案
    name: '林設計師',
    email: 'lin@taiwantech.com',
    phone: '0978-901-234',
    department: '設計部',
    position: 'UI設計師',
    joinDate: '2024-02-01',
    membershipStartDate: '2024-02-01',
    membershipEndDate: '2025-02-01',
    planType: 'yearly',
    status: 'active',
    isAccountHolder: false,
    membershipStatus: {
      isActive: true,
      daysRemaining: 43,
      willExpireWithPlan: false
    },
    learningProgress: {
      coursesEnrolled: 4,
      coursesCompleted: 3,
      totalHours: 22,
      lastActivity: '2024-12-18',
      completionRate: 75
    }
  },
  {
    id: 8,
    companyId: 1,
    planId: 11, // 屬於第二期方案
    name: '黃測試工程師',
    email: 'huang@taiwantech.com',
    phone: '0989-012-345',
    department: '品質部',
    position: '測試工程師',
    joinDate: '2024-10-01',
    membershipStartDate: '2024-10-01',
    membershipEndDate: '2025-10-01',
    planType: 'yearly',
    status: 'active',
    isAccountHolder: false,
    membershipStatus: {
      isActive: true,
      daysRemaining: 284,
      willExpireWithPlan: false
    },
    learningProgress: {
      coursesEnrolled: 2,
      coursesCompleted: 1,
      totalHours: 12,
      lastActivity: '2024-12-22',
      completionRate: 50
    }
  },
  // 新增創新製造公司的用戶
  {
    id: 9,
    companyId: 2,
    planId: 2, // 屬於2024年度方案
    name: '吳主管',
    email: 'wu@innovation.com',
    phone: '0990-123-456',
    department: '管理部',
    position: '部門主管',
    joinDate: '2024-03-15',
    membershipStartDate: '2024-03-15',
    membershipEndDate: '2025-03-15',
    planType: 'yearly',
    status: 'active',
    isAccountHolder: false,
    membershipStatus: {
      isActive: true,
      daysRemaining: 85,
      willExpireWithPlan: false
    },
    learningProgress: {
      coursesEnrolled: 3,
      coursesCompleted: 3,
      totalHours: 28,
      lastActivity: '2024-12-20',
      completionRate: 100
    }
  }
];

// Mock 帳號轉移記錄
const accountTransfers: AccountTransfer[] = [
  {
    id: 'transfer_001',
    companyId: 1,
    fromUserId: 2,
    toUserId: 1,
    fromUserName: '李小華',
    toUserName: '張小明',
    transferDate: '2024-12-01',
    reason: '職務調整，需要轉移學習進度',
    approvedBy: '王企業窗口',
    status: 'approved'
  }
];

// API 函數
export const getCompanies = (): Company[] => {
  return companies;
};

export const getCompanyById = (companyId: string): Company | undefined => {
  return companies.find(company => company.id === parseInt(companyId));
};

export const getCorporateUsersByCompany = (companyId: string): CorporateUser[] => {
  return corporateUsers.filter(user => user.companyId === parseInt(companyId));
};

export const getCorporateUsersByPlan = (planId: number): CorporateUser[] => {
  return corporateUsers.filter(user => user.planId === planId);
};

export const getCorporateUserById = (userId: number): CorporateUser | undefined => {
  return corporateUsers.find(user => user.id === userId);
};

export const getAccountTransfersByCompany = (companyId: string): AccountTransfer[] => {
  return accountTransfers.filter(transfer => transfer.companyId === parseInt(companyId));
};

export const updateCorporateUser = (userId: number, updates: Partial<CorporateUser>): CorporateUser | null => {
  const index = corporateUsers.findIndex(user => user.id === userId);
  if (index === -1) return null;
  
  const updatedUser = {
    ...corporateUsers[index],
    ...updates
  };
  
  corporateUsers[index] = updatedUser;
  return updatedUser;
};

export const transferMembershipAccount = (
  companyId: number,
  fromUserId: number,
  toUserId: number,
  reason: string,
  approvedBy: string
): AccountTransfer => {
  const fromUser = getCorporateUserById(fromUserId);
  const toUser = getCorporateUserById(toUserId);
  
  if (!fromUser || !toUser) {
    throw new Error('用戶不存在');
  }
  
  // 更新帳號持有者狀態
  updateCorporateUser(fromUserId, { isAccountHolder: false });
  updateCorporateUser(toUserId, { isAccountHolder: true });
  
  // 創建轉移記錄
  const transfer: AccountTransfer = {
    id: `transfer_${Date.now()}`,
    companyId,
    fromUserId,
    toUserId,
    fromUserName: fromUser.name,
    toUserName: toUser.name,
    transferDate: new Date().toISOString().split('T')[0],
    reason,
    approvedBy,
    status: 'approved'
  };
  
  accountTransfers.push(transfer);
  return transfer;
};

export const addCorporateUser = (companyId: string, userData: Omit<CorporateUser, 'id' | 'companyId' | 'learningProgress'>): CorporateUser => {
  const newUser: CorporateUser = {
    id: Math.max(...corporateUsers.map(u => u.id), 0) + 1,
    companyId: parseInt(companyId),
    ...userData,
    learningProgress: {
      coursesEnrolled: 0,
      coursesCompleted: 0,
      totalHours: 0,
      lastActivity: new Date().toISOString().split('T')[0],
      completionRate: 0
    }
  };
  
  corporateUsers.push(newUser);
  return newUser;
};

// 企業CRUD函數
export const addCompany = (companyData: Omit<Company, 'id' | 'createdAt' | 'membershipPlans'>): Company => {
  const newCompany: Company = {
    id: Math.max(...companies.map(c => c.id), 0) + 1,
    ...companyData,
    createdAt: new Date().toISOString().split('T')[0],
    membershipPlans: []
  };
  
  companies.push(newCompany);
  return newCompany;
};

export const updateCompany = (companyId: number, updates: Partial<Company>): Company | null => {
  const index = companies.findIndex(company => company.id === companyId);
  if (index === -1) return null;
  
  const updatedCompany = {
    ...companies[index],
    ...updates
  };
  
  companies[index] = updatedCompany;
  return updatedCompany;
};

export const deleteCompany = (companyId: number): boolean => {
  const index = companies.findIndex(company => company.id === companyId);
  if (index === -1) return false;
  
  // 同時刪除相關的企業用戶
  const userIndices = [];
  for (let i = corporateUsers.length - 1; i >= 0; i--) {
    if (corporateUsers[i].companyId === companyId) {
      corporateUsers.splice(i, 1);
    }
  }
  
  companies.splice(index, 1);
  return true;
};

export const getCompanyStatistics = (companyId: string) => {
  const users = getCorporateUsersByCompany(companyId);
  const company = getCompanyById(companyId);
  
  if (!company) return null;
  
  const activeUsers = users.filter(user => user.status === 'active');
  const totalCourses = users.reduce((sum, user) => sum + user.learningProgress.coursesEnrolled, 0);
  const completedCourses = users.reduce((sum, user) => sum + user.learningProgress.coursesCompleted, 0);
  const totalHours = users.reduce((sum, user) => sum + user.learningProgress.totalHours, 0);
  const averageCompletion = users.length > 0 ? 
    users.reduce((sum, user) => sum + user.learningProgress.completionRate, 0) / users.length : 0;
  
  return {
    company,
    totalUsers: users.length,
    activeUsers: activeUsers.length,
    usageRate: (company.usedSlots / company.totalSlots) * 100,
    totalCourses,
    completedCourses,
    totalHours,
    averageCompletion,
    recentActivity: users
      .sort((a, b) => new Date(b.learningProgress.lastActivity).getTime() - new Date(a.learningProgress.lastActivity).getTime())
      .slice(0, 5)
  };
};

// 計算會員期限的輔助函數
export const calculateMembershipPeriod = (
  joinDate: string, 
  planType: 'quarterly' | 'yearly',
  corporatePlanEndDate?: string
): { startDate: string; endDate: string; daysRemaining: number; willExpireWithPlan: boolean } => {
  const join = new Date(joinDate);
  const today = new Date();
  
  let endDate: Date;
  let willExpireWithPlan = false;
  
  if (planType === 'quarterly') {
    // 季方案：加入日 + 3個月
    endDate = new Date(join);
    endDate.setMonth(endDate.getMonth() + 3);
  } else {
    // 年方案：加入日 + 12個月
    endDate = new Date(join);
    endDate.setFullYear(endDate.getFullYear() + 1);
  }
  
  // 個人會員期限優先，不受企業方案期限限制
  // 如果企業方案先到期，個人會員仍可繼續使用至個人期限結束
  if (corporatePlanEndDate) {
    const corporateEnd = new Date(corporatePlanEndDate);
    if (corporateEnd < endDate) {
      // 企業方案先到期，但個人會員期限更長，以個人期限為準
      willExpireWithPlan = false;
    } else {
      // 個人會員期限在企業方案期限內
      willExpireWithPlan = false;
    }
  }
  
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  
  return {
    startDate: join.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    daysRemaining,
    willExpireWithPlan
  };
};

// 檢查企業方案是否已到期
export const isCorporatePlanExpired = (companyId: number): boolean => {
  const company = companies.find(c => c.id === companyId);
  if (!company) return true;
  
  const today = new Date();
  const endDate = new Date(company.endDate);
  return today > endDate;
};

// 檢查是否可以新增會員（企業方案未到期）
export const canAddNewMember = (companyId: number): { canAdd: boolean; reason?: string } => {
  const company = companies.find(c => c.id === companyId);
  if (!company) {
    return { canAdd: false, reason: '找不到企業資訊' };
  }
  
  if (isCorporatePlanExpired(companyId)) {
    return { canAdd: false, reason: '企業方案已到期，無法新增會員' };
  }
  
  if (company.usedSlots >= company.totalSlots) {
    return { canAdd: false, reason: '企業方案帳號已滿，無法新增會員' };
  }
  
  return { canAdd: true };
};

// 新增企業用戶（需檢查企業方案狀態）
export const addCorporateUserWithValidation = (
  companyId: number,
  userData: Omit<CorporateUser, 'id' | 'companyId' | 'membershipStartDate' | 'membershipEndDate' | 'membershipStatus'>
): { success: boolean; message: string; user?: CorporateUser } => {
  const validation = canAddNewMember(companyId);
  if (!validation.canAdd) {
    return { success: false, message: validation.reason || '無法新增會員' };
  }
  
  const company = companies.find(c => c.id === companyId);
  if (!company) {
    return { success: false, message: '找不到企業資訊' };
  }
  
  const membershipPeriod = calculateMembershipPeriod(
    userData.joinDate,
    userData.planType,
    company.endDate
  );
  
  const newUser: CorporateUser = {
    ...userData,
    id: Date.now(), // 簡單的ID生成
    companyId,
    membershipStartDate: membershipPeriod.startDate,
    membershipEndDate: membershipPeriod.endDate,
    membershipStatus: {
      isActive: membershipPeriod.daysRemaining > 0,
      daysRemaining: membershipPeriod.daysRemaining,
      willExpireWithPlan: membershipPeriod.willExpireWithPlan
    }
  };
  
  corporateUsers.push(newUser);
  
  // 更新企業使用的帳號數
  const companyIndex = companies.findIndex(c => c.id === companyId);
  if (companyIndex !== -1) {
    companies[companyIndex].usedSlots += 1;
  }
  
  return { success: true, message: '會員新增成功', user: newUser };
};

// 更新用戶會員狀態的函數（企業方案到期後仍可使用）
export const updateUserMembershipStatus = (userId: number, newPlanType: 'quarterly' | 'yearly'): { success: boolean; message: string } => {
  const userIndex = corporateUsers.findIndex(user => user.id === userId);
  if (userIndex === -1) {
    return { success: false, message: '找不到用戶' };
  }
  
  const user = corporateUsers[userIndex];
  const company = companies.find(c => c.id === user.companyId);
  
  if (!company) {
    return { success: false, message: '找不到企業資訊' };
  }
  
  // 企業方案到期後仍可修改現有會員
  const membershipPeriod = calculateMembershipPeriod(
    user.joinDate, 
    newPlanType, 
    company.endDate
  );
  
  corporateUsers[userIndex] = {
    ...user,
    planType: newPlanType,
    membershipStartDate: membershipPeriod.startDate,
    membershipEndDate: membershipPeriod.endDate,
    membershipStatus: {
      isActive: membershipPeriod.daysRemaining > 0,
      daysRemaining: membershipPeriod.daysRemaining,
      willExpireWithPlan: membershipPeriod.willExpireWithPlan
    },
    status: membershipPeriod.daysRemaining > 0 ? 'active' : 'expired'
  };
  
  return { success: true, message: '會員資訊更新成功' };
};

// 刪除企業用戶（企業方案到期後仍可使用）
export const deleteCorporateUserWithValidation = (userId: number): { success: boolean; message: string } => {
  const userIndex = corporateUsers.findIndex(user => user.id === userId);
  if (userIndex === -1) {
    return { success: false, message: '找不到用戶' };
  }
  
  const user = corporateUsers[userIndex];
  const companyId = user.companyId;
  
  // 移除用戶
  corporateUsers.splice(userIndex, 1);
  
  // 更新企業使用的帳號數
  const companyIndex = companies.findIndex(c => c.id === companyId);
  if (companyIndex !== -1) {
    companies[companyIndex].usedSlots = Math.max(0, companies[companyIndex].usedSlots - 1);
  }
  
  return { success: true, message: '會員刪除成功' };
};