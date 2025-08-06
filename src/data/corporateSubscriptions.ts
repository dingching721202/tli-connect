import { CorporateSubscription } from '@/types/corporateSubscription';

// 企業訂閱示例數據
export const corporateSubscriptions: CorporateSubscription[] = [
  {
    id: 1,
    company_id: 'corp_001',
    plan_id: 3, // 企業年度方案
    order_id: 1001,
    seats_total: 50,
    seats_used: 12,
    seats_available: 38, // 計算得出
    purchase_date: '2024-01-15T00:00:00Z',
    activation_deadline: '2024-02-15T00:00:00Z',
    status: 'activated',
    amount_paid: 150000,
    auto_renewal: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
    company_name: '台積電股份有限公司',
    plan_title: '企業年度方案',
    plan_type: 'corporate',
    duration_type: 'annual',
    duration_days: 365
  },
  {
    id: 2,
    company_id: 'corp_002',
    plan_id: 4, // 企業季度方案
    order_id: 1002,
    seats_total: 20,
    seats_used: 18,
    seats_available: 2,
    purchase_date: '2024-03-01T00:00:00Z',
    activation_deadline: '2024-04-01T00:00:00Z',
    status: 'activated',
    amount_paid: 60000,
    auto_renewal: false,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-10T00:00:00Z',
    company_name: '富邦金融控股股份有限公司',
    plan_title: '企業季度方案',
    plan_type: 'corporate',
    duration_type: 'season',
    duration_days: 90
  },
  {
    id: 3,
    company_id: 'corp_003',
    plan_id: 3,
    seats_total: 100,
    seats_used: 0,
    seats_available: 100,
    purchase_date: '2024-07-01T00:00:00Z',
    activation_deadline: '2024-08-01T00:00:00Z',
    status: 'purchased',
    amount_paid: 300000,
    auto_renewal: true,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z',
    company_name: '中華電信股份有限公司',
    plan_title: '企業年度方案',
    plan_type: 'corporate',
    duration_type: 'annual',
    duration_days: 365
  }
];


const subscriptionData = { corporateSubscriptions };
export default subscriptionData;