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
  }
];

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