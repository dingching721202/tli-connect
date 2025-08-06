// 系統設定相關類型

export interface SystemSettings {
  id: string;
  category: 'corporate' | 'general' | 'notification' | 'security';
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

export default SystemSettings;