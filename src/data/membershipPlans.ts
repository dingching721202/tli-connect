// 會員方案數據管理
export interface MembershipPlan {
  id: string;
  name: string;
  type: 'individual' | 'corporate';
  duration: number; // 月數
  price: number;
  originalPrice: number;
  popular: boolean;
  features: string[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

// 企業表單提交類型
export interface CorporateInquiry {
  id: string;
  companyName: string;
  contactName: string;
  contactTitle: string;
  email: string;
  phone: string;
  employeeCount: string;
  industry: string;
  trainingNeeds: string[];
  budget: string;
  timeline: string;
  message: string;
  status: 'pending' | 'contacted' | 'quoted' | 'closed';
  submittedAt: string;
  updatedAt: string;
}

// 模擬數據存儲 - 在實際應用中這會是 API 調用
const membershipPlans: MembershipPlan[] = [
  {
    id: 'quarterly',
    name: '季方案',
    type: 'individual',
    duration: 3,
    price: 10800,
    originalPrice: 12000,
    popular: false,
    features: [
      '觀看所有學習影片',
      '參加線上團體課程',
      '免費預約課程',
      '參加活動及研討會',
      '專屬學習資源',
      '學習進度追蹤'
    ],
    status: 'published',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 'yearly',
    name: '年方案',
    type: 'individual',
    duration: 12,
    price: 36000,
    originalPrice: 43200,
    popular: true,
    features: [
      '觀看所有學習影片',
      '參加線上團體課程',
      '免費預約課程',
      '參加活動及研討會',
      '專屬學習資源',
      '學習進度追蹤',
      '優先客服支援',
      '限定會員活動'
    ],
    status: 'published',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 'corporate-basic',
    name: '企業方案',
    type: 'corporate',
    duration: 12,
    price: 0, // 企業方案採用詢價制
    originalPrice: 0,
    popular: false,
    features: [
      '團體學習管理',
      '員工進度追蹤',
      '客製化課程內容',
      '專屬企業管理後台',
      '批量帳號管理',
      '學習報告分析',
      '專屬客服支援',
      '彈性付款方案'
    ],
    status: 'published',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 'corporate-premium',
    name: '企業進階方案',
    type: 'corporate',
    duration: 12,
    price: 0, // 企業方案採用詢價制
    originalPrice: 0,
    popular: true,
    features: [
      '包含基礎方案所有功能',
      '一對一諮詢服務',
      '客製化培訓課程',
      '現場培訓支援',
      'API 系統整合',
      '白標解決方案',
      '優先技術支援',
      '季度業務回顧'
    ],
    status: 'draft',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

// 企業詢價表單存儲
const corporateInquiries: CorporateInquiry[] = [];

// API 函數
export const getMembershipPlans = (type?: 'individual' | 'corporate', status?: 'draft' | 'published'): MembershipPlan[] => {
  let filteredPlans = membershipPlans;
  
  if (type) {
    filteredPlans = filteredPlans.filter(plan => plan.type === type);
  }
  
  if (status) {
    filteredPlans = filteredPlans.filter(plan => plan.status === status);
  }
  
  return filteredPlans;
};

export const getPublishedMembershipPlans = (type?: 'individual' | 'corporate'): MembershipPlan[] => {
  return getMembershipPlans(type, 'published');
};

export const getMembershipPlan = (id: string): MembershipPlan | undefined => {
  return membershipPlans.find(plan => plan.id === id);
};

export const createMembershipPlan = (plan: Omit<MembershipPlan, 'id' | 'createdAt' | 'updatedAt'>): MembershipPlan => {
  const now = new Date().toISOString().split('T')[0];
  const newPlan: MembershipPlan = {
    ...plan,
    id: `plan_${Date.now()}`,
    createdAt: now,
    updatedAt: now
  };
  
  membershipPlans.push(newPlan);
  return newPlan;
};

export const updateMembershipPlan = (id: string, updates: Partial<MembershipPlan>): MembershipPlan | null => {
  const index = membershipPlans.findIndex(plan => plan.id === id);
  if (index === -1) return null;
  
  const updatedPlan = {
    ...membershipPlans[index],
    ...updates,
    updatedAt: new Date().toISOString().split('T')[0]
  };
  
  membershipPlans[index] = updatedPlan;
  return updatedPlan;
};

export const deleteMembershipPlan = (id: string): boolean => {
  const index = membershipPlans.findIndex(plan => plan.id === id);
  if (index === -1) return false;
  
  membershipPlans.splice(index, 1);
  return true;
};

export const duplicateMembershipPlan = (id: string): MembershipPlan | null => {
  const originalPlan = getMembershipPlan(id);
  if (!originalPlan) return null;
  
  return createMembershipPlan({
    ...originalPlan,
    name: `${originalPlan.name} (副本)`,
    status: 'draft'
  });
};

// 企業詢價表單 API
export const createCorporateInquiry = (inquiry: Omit<CorporateInquiry, 'id' | 'submittedAt' | 'updatedAt'>): CorporateInquiry => {
  const now = new Date().toISOString();
  const newInquiry: CorporateInquiry = {
    ...inquiry,
    id: `inquiry_${Date.now()}`,
    submittedAt: now,
    updatedAt: now
  };
  
  corporateInquiries.push(newInquiry);
  return newInquiry;
};

export const getCorporateInquiries = (status?: CorporateInquiry['status']): CorporateInquiry[] => {
  if (status) {
    return corporateInquiries.filter(inquiry => inquiry.status === status);
  }
  return [...corporateInquiries].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
};

export const getCorporateInquiry = (id: string): CorporateInquiry | undefined => {
  return corporateInquiries.find(inquiry => inquiry.id === id);
};

export const updateCorporateInquiry = (id: string, updates: Partial<CorporateInquiry>): CorporateInquiry | null => {
  const index = corporateInquiries.findIndex(inquiry => inquiry.id === id);
  if (index === -1) return null;
  
  const updatedInquiry = {
    ...corporateInquiries[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  corporateInquiries[index] = updatedInquiry;
  return updatedInquiry;
};

export const deleteCorporateInquiry = (id: string): boolean => {
  const index = corporateInquiries.findIndex(inquiry => inquiry.id === id);
  if (index === -1) return false;
  
  corporateInquiries.splice(index, 1);
  return true;
};