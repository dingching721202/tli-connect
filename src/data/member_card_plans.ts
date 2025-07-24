export interface MemberCardPlan {
  id: number;
  created_at: string;
  member_card_id: number;
  type: 'SEASON' | 'YEAR' | 'CORPORATE';
  name: string;
  price: string;
  original_price: string;
  duration: number;
  plan_type: 'individual' | 'corporate';
  features: string[];
  status: 'DRAFT' | 'PUBLISHED';
  category: string;
}

export const memberCardPlans: MemberCardPlan[] = [
  {
    id: 1,
    created_at: "2025-07-14T12:00:00+00:00",
    member_card_id: 1,
    type: "SEASON",
    name: "個人季度方案",
    price: "3000.00",
    original_price: "3000.00",
    duration: 3,
    plan_type: "individual",
    features: [
      "無限觀看所有學習影片",
      "參加線上團體課程",
      "免費預約課程活動",
      "24小時客服支援",
      "學習進度追蹤"
    ],
    status: 'PUBLISHED',
    category: "season"
  },
  {
    id: 2,
    created_at: "2025-07-14T12:00:00+00:00",
    member_card_id: 2,
    type: "YEAR",
    name: "個人年度方案",
    price: "10000.00",
    original_price: "12000.00",
    duration: 12,
    plan_type: "individual",
    features: [
      "無限觀看所有學習影片",
      "參加線上團體課程",
      "免費預約課程活動",
      "24小時優先客服支援",
      "學習進度追蹤",
      "專屬學習顧問",
      "會員專屬活動",
      "課程資料下載"
    ],
    status: 'PUBLISHED',
    category: "year"
  },
  {
    id: 3,
    created_at: "2025-07-14T12:00:00+00:00",
    member_card_id: 3,
    type: "CORPORATE",
    name: "企業客製方案",
    price: "0.00",
    original_price: "0.00",
    duration: 12,
    plan_type: "corporate",
    features: [
      "客製化培訓內容",
      "專業顧問服務",
      "團隊學習管理",
      "詳細學習報告",
      "彈性課程安排",
      "企業專屬平台",
      "多語言支援",
      "24小時技術支援"
    ],
    status: 'PUBLISHED',
    category: "corporate"
  }
];

export default memberCardPlans;