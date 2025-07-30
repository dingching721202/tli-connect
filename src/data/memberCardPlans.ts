import type { MemberCardPlan } from '@/types/business';

// ========================================
// 會員卡方案資料 - MECE架構
// 定義會員卡方案模板，與用戶實例分離
// ========================================

export const memberCardPlans: MemberCardPlan[] = [
  {
    id: 1,
    name: "基礎方案",
    description: "適合初學者的入門方案，包含基礎課程與服務",
    short_description: "入門學習方案",
    plan_type: "BASIC",
    duration_days: 90,
    price: 2999,
    original_price: 3299,
    currency: "TWD",
    sessions_total: 12,
    features: [
      "12堂一對一課程",
      "基礎學習資料",
      "線上客服支援",
      "90天有效期"
    ],
    restrictions: [
      "僅限基礎課程",
      "不可轉讓",
      "不可退費"
    ],
    activation_deadline_days: 30,
    is_active: true,
    is_popular: false,
    sort_order: 1,
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },
  {
    id: 2,
    name: "標準方案",
    description: "最受歡迎的學習方案，涵蓋多種課程類型與完整服務",
    short_description: "熱門學習方案",
    plan_type: "STANDARD",
    duration_days: 180,
    price: 5999,
    original_price: 6999,
    currency: "TWD",
    sessions_total: 30,
    features: [
      "30堂一對一或小班課程",
      "完整學習資料包",
      "優先預約權",
      "專屬學習顧問",
      "180天有效期",
      "免費重修一次"
    ],
    restrictions: [
      "限選定課程類型",
      "不可轉讓"
    ],
    activation_deadline_days: 30,
    is_active: true,
    is_popular: true,
    sort_order: 2,
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },
  {
    id: 3,
    name: "高級方案",
    description: "高階學習者專屬方案，享有最完整的學習資源與服務",
    short_description: "高階專業方案",
    plan_type: "PREMIUM",
    duration_days: 365,
    price: 11999,
    original_price: 14999,
    currency: "TWD",
    sessions_total: 80,
    features: [
      "80堂任選課程",
      "VIP專屬服務",
      "無限次重修",
      "專業認證課程",
      "1年有效期",
      "專屬學習計畫",
      "優先新課程體驗",
      "學習成果認證"
    ],
    restrictions: [
      "僅限本人使用"
    ],
    activation_deadline_days: 60,
    is_active: true,
    is_popular: false,
    sort_order: 3,
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },
  {
    id: 4,
    name: "企業方案",
    description: "為企業客戶設計的大量學習方案，支援團體管理與統計報表",
    short_description: "企業團體方案",
    plan_type: "CORPORATE",
    duration_days: 365,
    price: 99999,
    original_price: 120000,
    currency: "TWD",
    sessions_total: 500,
    features: [
      "500堂團體課程額度",
      "企業專屬管理後台",
      "學習進度統計報表",
      "客製化課程內容",
      "專屬企業顧問",
      "彈性排課服務",
      "團體學習認證",
      "1年使用期限"
    ],
    restrictions: [
      "需企業合約",
      "最少10人使用",
      "需提前30天預約"
    ],
    activation_deadline_days: 90,
    is_active: true,
    is_popular: false,
    sort_order: 4,
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },
  {
    id: 5,
    name: "試用方案",
    description: "新用戶專屬體驗方案，讓您了解我們的教學品質",
    short_description: "新手體驗方案",
    plan_type: "TRIAL",
    duration_days: 30,
    price: 399,
    original_price: 799,
    currency: "TWD",
    sessions_total: 3,
    features: [
      "3堂體驗課程",
      "基礎學習資料",
      "新手指導服務",
      "30天體驗期"
    ],
    restrictions: [
      "每人限購一次",
      "僅限新用戶",
      "不可轉讓",
      "不可退費"
    ],
    activation_deadline_days: 14,
    is_active: true,
    is_popular: false,
    sort_order: 0,
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },
  {
    id: 6,
    name: "季度密集方案",
    description: "3個月密集學習方案，適合有明確學習目標的學習者",
    short_description: "密集學習方案", 
    plan_type: "INTENSIVE",
    duration_days: 90,
    price: 8999,
    original_price: 10999,
    currency: "TWD",
    sessions_total: 50,
    features: [
      "50堂密集課程",
      "每週最多8堂課",
      "專屬學習追蹤",
      "快速進步保證",
      "90天密集期",
      "學習成果測評"
    ],
    restrictions: [
      "需通過入學測試",
      "每週至少上3堂課",
      "不可暫停"
    ],
    activation_deadline_days: 7,
    is_active: true,
    is_popular: false,
    sort_order: 5,
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  }
];

// ========================================
// 輔助函數
// ========================================

// 根據方案類型獲取會員卡方案
export const getMemberCardPlansByType = (planType: string): MemberCardPlan[] => {
  return memberCardPlans.filter(plan => plan.plan_type === planType);
};

// 根據價格範圍獲取會員卡方案
export const getMemberCardPlansByPriceRange = (minPrice: number, maxPrice: number): MemberCardPlan[] => {
  return memberCardPlans.filter(plan => 
    plan.price >= minPrice && plan.price <= maxPrice
  );
};

// 獲取熱門方案
export const getPopularMemberCardPlans = (): MemberCardPlan[] => {
  return memberCardPlans.filter(plan => plan.is_popular && plan.is_active);
};

// 獲取有效的會員卡方案
export const getActiveMemberCardPlans = (): MemberCardPlan[] => {
  return memberCardPlans
    .filter(plan => plan.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);
};

// 根據ID獲取會員卡方案
export const getMemberCardPlanById = (id: number): MemberCardPlan | undefined => {
  return memberCardPlans.find(plan => plan.id === id);
};

// 檢查方案是否有效
export const isActiveMemberCardPlan = (plan: MemberCardPlan): boolean => {
  return plan.is_active;
};

// 計算方案折扣百分比
export const getDiscountPercentage = (plan: MemberCardPlan): number => {
  if (!plan.original_price || plan.original_price <= plan.price) {
    return 0;
  }
  return Math.round(((plan.original_price - plan.price) / plan.original_price) * 100);
};

// 取得方案的性價比分數 (課程數/價格)
export const getValueScore = (plan: MemberCardPlan): number => {
  return Math.round((plan.sessions_total / plan.price) * 10000) / 10000;
};

// 推薦給新手的方案
export const getRecommendedPlansForBeginner = (): MemberCardPlan[] => {
  return memberCardPlans
    .filter(plan => 
      plan.is_active && 
      (plan.plan_type === 'TRIAL' || plan.plan_type === 'BASIC' || plan.plan_type === 'STANDARD')
    )
    .sort((a, b) => a.sort_order - b.sort_order);
};

// 推薦給企業的方案
export const getRecommendedPlansForCorporate = (): MemberCardPlan[] => {
  return memberCardPlans
    .filter(plan => 
      plan.is_active && 
      (plan.plan_type === 'CORPORATE' || plan.plan_type === 'PREMIUM')
    )
    .sort((a, b) => a.sort_order - b.sort_order);
};

// 向下相容的預設匯出
export default memberCardPlans;