export interface UserRole {
  id: number;
  user_id: number;
  role: 'STUDENT' | 'TEACHER' | 'CORPORATE_CONTACT' | 'AGENT' | 'OPS' | 'ADMIN';
  granted_by: number; // admin user id who granted the role
  granted_at: string;
  is_active: boolean;
}

export const userRoles: UserRole[] = [
  // Alice Wang - 學生角色
  {
    id: 1,
    user_id: 1,
    role: 'STUDENT',
    granted_by: 6, // Admin User
    granted_at: '2025-07-14T12:00:00+00:00',
    is_active: true
  },
  // Bob Chen - 學生角色
  {
    id: 2,
    user_id: 2,
    role: 'STUDENT', 
    granted_by: 6, // Admin User
    granted_at: '2025-07-14T12:00:00+00:00',
    is_active: true
  },
  // Charlie Lin - 學生角色
  {
    id: 3,
    user_id: 3,
    role: 'STUDENT',
    granted_by: 6, // Admin User  
    granted_at: '2025-07-14T12:00:00+00:00',
    is_active: true
  },
  // 王老師 - 教師角色
  {
    id: 4,
    user_id: 4,
    role: 'TEACHER',
    granted_by: 6, // Admin User
    granted_at: '2025-07-14T12:00:00+00:00',
    is_active: true
  },
  // Olivia Kao - 營運角色
  {
    id: 5,
    user_id: 5,
    role: 'OPS',
    granted_by: 6, // Admin User
    granted_at: '2025-07-14T12:00:00+00:00',
    is_active: true
  },
  // Admin User - 管理員角色
  {
    id: 6,
    user_id: 6,
    role: 'ADMIN',
    granted_by: 6, // Self-granted
    granted_at: '2025-07-14T12:00:00+00:00',
    is_active: true
  },
  // Frank Liu - 企業窗口角色
  {
    id: 7,
    user_id: 7,
    role: 'CORPORATE_CONTACT',
    granted_by: 6, // Admin User
    granted_at: '2025-07-14T12:00:00+00:00',
    is_active: true
  },
  // Agent users - 代理角色
  {
    id: 8,
    user_id: 9,
    role: 'AGENT',
    granted_by: 6, // Admin User
    granted_at: '2024-01-15T00:00:00+00:00',
    is_active: true
  },
  {
    id: 9,
    user_id: 10,
    role: 'AGENT',
    granted_by: 6, // Admin User
    granted_at: '2024-02-01T00:00:00+00:00',
    is_active: true
  },
  {
    id: 10,
    user_id: 11,
    role: 'AGENT',
    granted_by: 6, // Admin User
    granted_at: '2024-03-10T00:00:00+00:00',
    is_active: true
  },
  {
    id: 11,
    user_id: 12,
    role: 'AGENT',
    granted_by: 6, // Admin User
    granted_at: '2024-03-01T00:00:00+00:00',
    is_active: true
  },
  // 多角色範例：張代理既是代理又是教師
  {
    id: 12,
    user_id: 9, // 張代理
    role: 'TEACHER',
    granted_by: 6, // Admin User
    granted_at: '2024-02-01T00:00:00+00:00',
    is_active: true
  },
  // 林同學既是代理又是學生
  {
    id: 13,
    user_id: 13,
    role: 'AGENT',
    granted_by: 6, // Admin User
    granted_at: '2024-06-01T00:00:00+00:00',
    is_active: true
  },
  {
    id: 14,
    user_id: 13,
    role: 'STUDENT',
    granted_by: 6, // Admin User
    granted_at: '2024-06-15T00:00:00+00:00',
    is_active: true
  }
];

export default userRoles;