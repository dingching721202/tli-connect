import { Membership } from '@/types/membership';

export interface UserMemberCardOriginal {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  plan_id: number; // 會員卡計劃ID
  member_card_id: number; // 會員卡ID
  order_id?: number; // 對應的訂單ID
  status: 'inactive' | 'activated' | 'expired' | 'cancelled';
  purchase_date: string; // 購買日期
  activation_date?: string; // 開啟日期
  expiry_date?: string; // 到期日期
  activation_deadline?: string; // 開啟期限（購買後30天內需開啟）
  amount_paid: number; // 支付金額
  auto_renewal?: boolean; // 自動續費
  created_at: string;
  updated_at: string;
  // 會員卡詳細資訊（從plan中獲取，便於顯示）
  plan_title?: string;
  plan_type?: 'individual' | 'corporate';
  duration_type?: 'season' | 'annual';
  duration_days?: number;
}

// 會員記錄（示例數據）
export const memberships: Membership[] = [
  {
    id: 1,
    user_id: 1,
    user_name: "Alice Wang",
    user_email: "alice@example.com",
    membership_type: 'individual',
    plan_id: 1,
    member_card_id: 1,
    order_id: 1001,
    status: 'activated',
    purchase_date: '2024-11-01T09:00:00Z',
    activation_date: '2024-11-02T10:00:00Z',
    expiry_date: '2025-09-30T23:59:59Z', // 到期日設定為9月30日
    activation_deadline: '2024-12-01T23:59:59Z',
    amount_paid: 3000,
    auto_renewal: false,
    created_at: '2024-11-01T09:00:00Z',
    updated_at: '2024-11-02T10:00:00Z',
    plan_title: '個人季度方案',
    plan_type: 'individual',
    duration_type: 'season',
    duration_days: 90
  },
  {
    id: 3,
    user_id: 2,
    user_name: "李美華",
    user_email: "meihua.li@example.com",
    membership_type: 'individual',
    plan_id: 2,
    member_card_id: 2,
    order_id: 2,
    status: 'inactive',
    purchase_date: '2024-12-15T14:30:00Z',
    activation_deadline: '2025-01-14T23:59:59Z',
    amount_paid: 30000,
    auto_renewal: true,
    created_at: '2024-12-15T14:30:00Z',
    updated_at: '2024-12-15T14:30:00Z',
    plan_title: '個人年度方案',
    plan_type: 'individual',
    duration_type: 'annual',
    duration_days: 365
  },
  {
    id: 4,
    user_id: 3,
    user_name: "王大強",
    user_email: "daqiang.wang@company.com",
    membership_type: 'individual',
    plan_id: 3,
    member_card_id: 3,
    order_id: 3,
    status: 'expired',
    purchase_date: '2024-01-15T10:00:00Z',
    activation_date: '2024-01-16T09:00:00Z',
    expiry_date: '2025-01-16T23:59:59Z',
    activation_deadline: '2024-02-14T23:59:59Z',
    amount_paid: 55000,
    auto_renewal: false,
    company_name: '台灣科技股份有限公司',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-16T09:00:00Z',
    plan_title: '企業年度方案',
    plan_type: 'corporate',
    duration_type: 'annual',
    duration_days: 365
  },
  {
    id: 5,
    user_id: 4,
    user_name: "陳小芳",
    user_email: "xiaofang.chen@example.com",
    membership_type: 'individual',
    plan_id: 1,
    member_card_id: 1,
    order_id: 4,
    status: 'activated',
    purchase_date: '2024-11-20T16:45:00Z',
    activation_date: '2024-11-21T08:00:00Z',
    expiry_date: '2025-02-19T23:59:59Z',
    activation_deadline: '2024-12-20T23:59:59Z',
    amount_paid: 3000,
    auto_renewal: true,
    created_at: '2024-11-20T16:45:00Z',
    updated_at: '2024-11-21T08:00:00Z',
    plan_title: '個人季度方案',
    plan_type: 'individual',
    duration_type: 'season',
    duration_days: 90
  },
  {
    id: 6,
    user_id: 5,
    user_name: "林企業代表",
    user_email: "representative@innovatetech.com",
    membership_type: 'corporate',
    plan_id: 4,
    member_card_id: 4,
    order_id: 5,
    status: 'activated',
    purchase_date: '2024-12-10T11:00:00Z',
    activation_date: '2024-12-11T09:00:00Z',
    expiry_date: '2025-12-11T23:59:59Z',
    activation_deadline: '2025-01-09T23:59:59Z',
    amount_paid: 80000,
    auto_renewal: true,
    company_name: '創新科技有限公司',
    created_at: '2024-12-10T11:00:00Z',
    updated_at: '2024-12-11T09:00:00Z',
    plan_title: '企業年度方案',
    plan_type: 'corporate',
    duration_type: 'annual',
    duration_days: 365
  }
];

export default memberships;