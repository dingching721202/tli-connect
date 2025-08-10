// 統一的用戶相關類型定義

// 用戶角色類型
export type UserRole = 'STUDENT' | 'TEACHER' | 'CORPORATE_CONTACT' | 'AGENT' | 'STAFF' | 'ADMIN';

// 會員狀態類型  
export type MembershipStatus = 'non_member' | 'inactive' | 'activated' | 'expired' | 'cancelled' | 'test';

// 帳戶狀態類型
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';

// 校區類型
export type Campus = '羅斯福校' | '士林校' | '台中校' | '高雄校' | '總部';

// 前端用戶界面（不包含敏感資訊）
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  roles: UserRole[];
  membership_status: MembershipStatus;
  account_status: AccountStatus;
  campus: Campus;
  created_at: string;
  updated_at?: string;
  // 前端專用字段
  avatar?: string;
  membership?: Record<string, unknown>; // 會員資格詳情
  agentData?: Record<string, unknown>; // 代理數據
  corp_id?: string; // 企業窗口用戶的公司ID
}

// 後端用戶界面（包含敏感資訊，僅用於API和資料庫）
export interface UserWithPassword extends User {
  password: string;
}

// 用戶創建請求
export interface CreateUserRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  roles: UserRole[];
  campus: Campus;
}

// 用戶更新請求
export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  roles?: UserRole[];
  membership_status?: MembershipStatus;
  account_status?: AccountStatus;
  campus?: Campus;
  avatar?: string;
}

// 用戶角色管理
export interface UserRoleAssignment {
  id: number;
  user_id: number;
  role: UserRole;
  granted_by: number;
  granted_at: string;
  is_active: boolean;
}

// 用戶統計資訊
export interface UserStats {
  total_users: number;
  active_users: number;
  suspended_users: number;
  members: number;
  non_members: number;
  by_role: Record<UserRole, number>;
  by_campus: Record<Campus, number>;
}

// 用戶搜尋過濾器
export interface UserFilter {
  search?: string;
  roles?: UserRole[];
  membership_status?: MembershipStatus[];
  account_status?: AccountStatus[];
  campus?: Campus[];
}

export default User;