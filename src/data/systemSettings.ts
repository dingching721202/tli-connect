import { SystemSettings } from '@/types/systemSettings';

export const systemSettings: SystemSettings[] = [
  {
    id: 'corporate_member_activation_deadline',
    category: 'corporate',
    key: 'member_activation_deadline_days',
    value: 30,
    description: '企業會員卡啟用期限（天數）',
    data_type: 'number',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'corporate_subscription_activation_deadline',
    category: 'corporate',
    key: 'subscription_activation_deadline_days',
    value: 90,
    description: '企業訂閱啟用期限（天數）',
    data_type: 'number',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'auto_expire_inactive_members',
    category: 'corporate',
    key: 'auto_expire_inactive_members',
    value: true,
    description: '自動過期未啟用的企業會員',
    data_type: 'boolean',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'allow_member_self_activation',
    category: 'corporate',
    key: 'allow_member_self_activation',
    value: true,
    description: '允許企業會員自行啟用會員卡',
    data_type: 'boolean',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  // 課程預約設定
  {
    id: 'course_reservation_advance_days',
    category: 'course',
    key: 'reservation_advance_days',
    value: 7,
    description: '提前多少天可以預約課程',
    data_type: 'number',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'course_reservation_advance_hours',
    category: 'course',
    key: 'reservation_advance_hours',
    value: 2,
    description: '課程開始前多少小時截止預約',
    data_type: 'number',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'course_modification_deadline_hours',
    category: 'course',
    key: 'modification_deadline_hours',
    value: 4,
    description: '課程開始前多少小時可以修改預約',
    data_type: 'number',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'course_cancellation_deadline_hours',
    category: 'course',
    key: 'cancellation_deadline_hours',
    value: 6,
    description: '課程開始前多少小時可以取消預約',
    data_type: 'number',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'course_allow_same_day_reservation',
    category: 'course',
    key: 'allow_same_day_reservation',
    value: true,
    description: '是否允許當天預約課程',
    data_type: 'boolean',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'course_auto_cancel_no_show',
    category: 'course',
    key: 'auto_cancel_no_show',
    value: false,
    description: '自動取消未出席的預約',
    data_type: 'boolean',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export default systemSettings;