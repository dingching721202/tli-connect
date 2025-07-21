export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  duration: number; // in months
  type: 'individual' | 'corporate';
  features: string[];
  published: boolean;
  category: string;
  popular?: boolean;
  status?: 'draft' | 'published' | 'active' | 'inactive';
  durationType?: 'annual' | 'monthly';
  purchaseDate?: string;
  startDate?: string;
  endDate?: string;
  slots?: number;
  basePrice?: number;
  discountRate?: number;
  finalPrice?: number;
}

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
  status: 'pending' | 'contacted' | 'quoted' | 'converted' | 'closed';
  submittedAt: string;
  updatedAt: string;
}

// Mock membership plans data
const membershipPlans: MembershipPlan[] = [
  {
    id: 'individual-season',
    name: '個人季度方案',
    price: 3000,
    originalPrice: 3000,
    duration: 3,
    type: 'individual',
    features: [
      '無限觀看所有學習影片',
      '參加線上團體課程',
      '免費預約課程活動',
      '24小時客服支援',
      '學習進度追蹤'
    ],
    published: true,
    category: 'season'
  },
  {
    id: 'individual-year',
    name: '個人年度方案',
    price: 10000,
    originalPrice: 12000,
    duration: 12,
    type: 'individual',
    features: [
      '無限觀看所有學習影片',
      '參加線上團體課程',
      '免費預約課程活動',
      '24小時優先客服支援',
      '學習進度追蹤',
      '專屬學習顧問',
      '會員專屬活動',
      '課程資料下載'
    ],
    published: true,
    category: 'year'
  },
  {
    id: 'corporate-custom',
    name: '企業客製方案',
    price: 0, // Custom pricing
    originalPrice: 0,
    duration: 12,
    type: 'corporate',
    features: [
      '客製化培訓內容',
      '專業顧問服務',
      '團隊學習管理',
      '詳細學習報告',
      '彈性課程安排',
      '企業專屬平台',
      '多語言支援',
      '24小時技術支援'
    ],
    published: true,
    category: 'corporate'
  }
];

// Get published membership plans filtered by type
export function getPublishedMembershipPlans(type?: 'individual' | 'corporate'): MembershipPlan[] {
  let plans = membershipPlans.filter(plan => plan.published);
  
  if (type) {
    plans = plans.filter(plan => plan.type === type);
  }
  
  return plans;
}

// Get membership plan by ID
export function getMembershipPlanById(id: string): MembershipPlan | null {
  return membershipPlans.find(plan => plan.id === id) || null;
}

// Corporate inquiry functions
export function createCorporateInquiry(inquiry: Omit<CorporateInquiry, 'id' | 'submittedAt' | 'updatedAt'>): Promise<CorporateInquiry> {
  return new Promise((resolve) => {
    // Simulate API call
    setTimeout(() => {
      const newInquiry: CorporateInquiry = {
        ...inquiry,
        id: `inquiry_${Date.now()}`,
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // In a real app, this would save to database/localStorage
      console.log('Corporate inquiry created:', newInquiry);
      
      resolve(newInquiry);
    }, 500);
  });
}

// Additional functions for membership plan management
export function getMembershipPlans(): MembershipPlan[] {
  return membershipPlans;
}

export function createMembershipPlan(plan: Omit<MembershipPlan, 'id'>): MembershipPlan {
  const newPlan: MembershipPlan = {
    ...plan,
    id: `plan_${Date.now()}`
  };
  membershipPlans.push(newPlan);
  return newPlan;
}

export function updateMembershipPlan(id: string, updates: Partial<MembershipPlan>): MembershipPlan | null {
  const index = membershipPlans.findIndex(plan => plan.id === id);
  if (index === -1) return null;
  
  membershipPlans[index] = { ...membershipPlans[index], ...updates };
  return membershipPlans[index];
}

export function deleteMembershipPlan(id: string): boolean {
  const index = membershipPlans.findIndex(plan => plan.id === id);
  if (index === -1) return false;
  
  membershipPlans.splice(index, 1);
  return true;
}

export function duplicateMembershipPlan(id: string): MembershipPlan | null {
  const plan = getMembershipPlanById(id);
  if (!plan) return null;
  
  return createMembershipPlan({
    ...plan,
    name: `${plan.name} (複製)`,
    published: false
  });
}

// Corporate inquiry management functions  
const corporateInquiries: CorporateInquiry[] = [];

export function getCorporateInquiries(): CorporateInquiry[] {
  return corporateInquiries;
}

export function updateCorporateInquiry(id: string, updates: Partial<CorporateInquiry>): CorporateInquiry | null {
  const index = corporateInquiries.findIndex(inquiry => inquiry.id === id);
  if (index === -1) return null;
  
  corporateInquiries[index] = {
    ...corporateInquiries[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  return corporateInquiries[index];
}

export function deleteCorporateInquiry(id: string): boolean {
  const index = corporateInquiries.findIndex(inquiry => inquiry.id === id);
  if (index === -1) return false;
  
  corporateInquiries.splice(index, 1);
  return true;
}