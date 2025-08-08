// 系統設定相關類型

export interface SystemSettings {
  id: string;
  category: 'corporate' | 'general' | 'notification' | 'security' | 'course';
  key: string;
  value: string | number | boolean;
  description: string;
  data_type: 'string' | 'number' | 'boolean' | 'json';
  created_at: string;
  updated_at: string;
}

// 企業會員相關設定
export interface CorporateSettings {
  member_activation_deadline_days: number; // 會員卡啟用期限天數
  subscription_activation_deadline_days: number; // 企業訂閱啟用期限天數
  auto_expire_inactive_members: boolean; // 自動過期未啟用會員
  allow_member_self_activation: boolean; // 允許會員自行啟用
}

// 課程預約相關設定
export interface CourseSettings {
  reservation_advance_days: number; // 提前多少天可以預約課程
  reservation_advance_hours: number; // 提前多少小時可以預約課程
  modification_deadline_hours: number; // 課程開始前多少小時可以修改預約
  cancellation_deadline_hours: number; // 課程開始前多少小時可以取消預約
  allow_same_day_reservation: boolean; // 是否允許當天預約
  auto_cancel_no_show: boolean; // 自動取消未出席的預約
}

export default SystemSettings;