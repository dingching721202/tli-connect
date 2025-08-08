import { CorporateMember, LearningRecord, ReservationRecord } from '@/types/corporateSubscription';

// 企業會員示例數據
export const corporateMembers: CorporateMember[] = [
  {
    id: 1,
    subscription_id: 1,
    user_id: 101,
    user_name: '王小明',
    user_email: 'wang@tsmc.com',
    issued_date: '2024-01-25T00:00:00Z',
    activation_deadline: '2024-02-25T00:00:00Z',
    purchase_date: '2024-01-15T00:00:00Z',
    redemption_deadline: '2024-02-15T00:00:00Z',
    card_status: 'activated',
    activation_date: '2024-01-26T00:00:00Z',
    start_date: '2024-01-26T00:00:00Z',
    end_date: '2025-01-26T00:00:00Z',
    created_at: '2024-01-25T00:00:00Z',
    updated_at: '2024-01-26T00:00:00Z',
    company_id: 'corp_001',
    company_name: '台積電股份有限公司',
    plan_title: '企業年度方案',
    duration_type: 'annual',
    duration_days: 365
  },
  {
    id: 2,
    subscription_id: 1,
    user_id: 102,
    user_name: '李小華',
    user_email: 'li@tsmc.com',
    issued_date: '2024-01-26T00:00:00Z',
    activation_deadline: '2024-02-26T00:00:00Z',
    purchase_date: '2024-01-15T00:00:00Z',
    redemption_deadline: '2024-02-15T00:00:00Z',
    card_status: 'cancelled',
    created_at: '2024-01-26T00:00:00Z',
    updated_at: '2024-01-26T00:00:00Z',
    company_id: 'corp_001',
    company_name: '台積電股份有限公司',
    plan_title: '企業年度方案',
    duration_type: 'annual',
    duration_days: 365
  },
  {
    id: 3,
    subscription_id: 2,
    user_id: 201,
    user_name: '張大偉',
    user_email: 'zhang@fubon.com',
    issued_date: '2024-03-15T00:00:00Z',
    activation_deadline: '2024-04-15T00:00:00Z',
    purchase_date: '2024-03-01T00:00:00Z',
    redemption_deadline: '2024-04-01T00:00:00Z',
    card_status: 'activated',
    activation_date: '2024-03-16T00:00:00Z',
    start_date: '2024-03-16T00:00:00Z',
    end_date: '2024-06-16T00:00:00Z',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-16T00:00:00Z',
    company_id: 'corp_002',
    company_name: '富邦金融控股股份有限公司',
    plan_title: '企業季度方案',
    duration_type: 'season',
    duration_days: 90
  },
  {
    id: 4,
    subscription_id: 1,
    user_id: 103,
    user_name: '測試用戶1',
    user_email: 'test1@tsmc.com',
    issued_date: '2024-02-01T00:00:00Z',
    activation_deadline: '2024-03-01T00:00:00Z',
    purchase_date: '2024-01-15T00:00:00Z',
    redemption_deadline: '2024-02-15T00:00:00Z',
    card_status: 'test',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
    company_id: 'corp_001',
    company_name: '台積電股份有限公司',
    plan_title: '企業年度方案',
    duration_type: 'annual',
    duration_days: 365
  },
  {
    id: 5,
    subscription_id: 2,
    user_id: 202,
    user_name: '測試用戶2',
    user_email: 'test2@fubon.com',
    issued_date: '2024-03-20T00:00:00Z',
    activation_deadline: '2024-04-20T00:00:00Z',
    purchase_date: '2024-03-01T00:00:00Z',
    redemption_deadline: '2024-04-01T00:00:00Z',
    card_status: 'test',
    created_at: '2024-03-20T00:00:00Z',
    updated_at: '2024-03-20T00:00:00Z',
    company_id: 'corp_002',
    company_name: '富邦金融控股股份有限公司',
    plan_title: '企業季度方案',
    duration_type: 'season',
    duration_days: 90
  },
  {
    id: 6,
    subscription_id: 2,
    user_name: '陳小美',
    user_email: 'chen@fubon.com',
    issued_date: '2024-03-25T00:00:00Z',
    activation_deadline: '2024-04-25T00:00:00Z',
    purchase_date: '2024-03-01T00:00:00Z',
    redemption_deadline: '2024-04-01T00:00:00Z',
    card_status: 'inactive',
    created_at: '2024-03-25T00:00:00Z',
    updated_at: '2024-03-25T00:00:00Z',
    company_id: 'corp_002',
    company_name: '富邦金融控股股份有限公司',
    plan_title: '企業季度方案',
    duration_type: 'season',
    duration_days: 90,
    user_id: 203
  }
];

// 學習記錄示例數據
export const learningRecords: LearningRecord[] = [
  {
    id: 1,
    member_id: 1,
    course_id: 101,
    course_title: 'Python 基礎程式設計',
    activity_type: 'course_complete',
    activity_date: '2024-02-01T00:00:00Z',
    duration_minutes: 120,
    completion_rate: 100,
    created_at: '2024-02-01T00:00:00Z'
  },
  {
    id: 2,
    member_id: 1,
    course_id: 102,
    course_title: 'JavaScript 進階開發',
    activity_type: 'course_view',
    activity_date: '2024-02-05T00:00:00Z',
    duration_minutes: 45,
    completion_rate: 60,
    created_at: '2024-02-05T00:00:00Z'
  },
  {
    id: 3,
    member_id: 3,
    course_id: 103,
    course_title: '金融科技概論',
    activity_type: 'course_complete',
    activity_date: '2024-03-20T00:00:00Z',
    duration_minutes: 90,
    completion_rate: 100,
    created_at: '2024-03-20T00:00:00Z'
  }
];

// 預約記錄示例數據
export const reservationRecords: ReservationRecord[] = [
  {
    id: 1,
    member_id: 1,
    event_id: 201,
    event_title: 'AI 技術應用工作坊',
    event_date: '2024-02-15T14:00:00Z',
    reservation_date: '2024-02-10T00:00:00Z',
    status: 'attended',
    notes: '積極參與討論',
    created_at: '2024-02-10T00:00:00Z',
    updated_at: '2024-02-15T16:00:00Z'
  },
  {
    id: 2,
    member_id: 1,
    event_id: 202,
    event_title: '資料分析實戰班',
    event_date: '2024-03-01T09:00:00Z',
    reservation_date: '2024-02-25T00:00:00Z',
    status: 'reserved',
    created_at: '2024-02-25T00:00:00Z',
    updated_at: '2024-02-25T00:00:00Z'
  },
  {
    id: 3,
    member_id: 3,
    event_id: 203,
    event_title: '區塊鏈技術講座',
    event_date: '2024-03-25T15:00:00Z',
    reservation_date: '2024-03-22T00:00:00Z',
    status: 'cancelled',
    notes: '臨時有會議衝突',
    created_at: '2024-03-22T00:00:00Z',
    updated_at: '2024-03-24T00:00:00Z'
  }
];

const corporateData = { corporateMembers, learningRecords, reservationRecords };
export default corporateData;