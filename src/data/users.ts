import type { User } from '@/types/business';

// ========================================
// 使用者資料 - MECE架構
// 管理系統中所有用戶的基本資料
// ========================================

export const users: User[] = [
  {
    id: 1,
    name: '張同學',
    email: 'student.zhang@example.com',
    phone: '0912-345-678',
    password: 'hashed_password_1', // 實際應用中應該是加密的密碼
    role: 'STUDENT',
    status: 'ACTIVE',
    profile: {
      avatar_url: '/avatars/student1.jpg',
      date_of_birth: '1995-03-15',
      gender: 'MALE',
      nationality: '中華民國',
      language_preference: 'zh-TW',
      timezone: 'Asia/Taipei',
      emergency_contact: {
        name: '張媽媽',
        relationship: '母親',
        phone: '0987-654-321',
        email: 'zhang.mom@example.com'
      },
      learning_goals: ['提升英語口說能力', '準備多益考試', '職場英語應用']
    },
    created_at: '2024-01-01T00:00:00+00:00',
    updated_at: '2024-01-15T00:00:00+00:00'
  },
  {
    id: 2,
    name: '李同學',
    email: 'student.lee@example.com',
    phone: '0923-456-789',
    password: 'hashed_password_2',
    role: 'STUDENT',
    status: 'ACTIVE',
    profile: {
      date_of_birth: '1992-08-22',
      gender: 'FEMALE',
      nationality: '中華民國',
      language_preference: 'zh-TW',
      timezone: 'Asia/Taipei',
      learning_goals: ['日語會話', '商務日語', 'JLPT N2檢定']
    },
    created_at: '2023-12-15T00:00:00+00:00',
    updated_at: '2024-01-10T00:00:00+00:00'
  },
  {
    id: 3,
    name: '系統管理員',
    email: 'admin@tli-connect.com',
    phone: '0912-000-001',
    password: 'hashed_admin_password',
    role: 'ADMIN',
    status: 'ACTIVE',
    profile: {
      language_preference: 'zh-TW',
      timezone: 'Asia/Taipei'
    },
    created_at: '2023-01-01T00:00:00+00:00',
    updated_at: '2024-01-15T00:00:00+00:00'
  },
  {
    id: 4,
    name: '王老師',
    email: 'teacher.wang@tli-connect.com',
    phone: '0912-111-222',
    password: 'hashed_teacher_password',
    role: 'TEACHER',
    status: 'ACTIVE',
    profile: {
      avatar_url: '/avatars/teacher1.jpg',
      language_preference: 'zh-TW',
      timezone: 'Asia/Taipei',
      teaching_experience: {
        years_of_experience: 8,
        specializations: ['英文會話', '商務英語', '英語檢定'],
        certifications: ['TESOL', 'TOEIC 990'],
        languages_taught: ['English'],
        bio: '擁有豐富的英語教學經驗，專精於商務英語和會話訓練。'
      }
    },
    created_at: '2020-01-15T00:00:00+00:00',
    updated_at: '2024-01-15T00:00:00+00:00'
  },
  {
    id: 5,
    name: '陳員工',
    email: 'staff.chen@tli-connect.com',
    phone: '0912-333-444',
    password: 'hashed_staff_password',
    role: 'STAFF',
    status: 'ACTIVE',
    profile: {
      language_preference: 'zh-TW',
      timezone: 'Asia/Taipei'
    },
    created_at: '2023-06-01T00:00:00+00:00',
    updated_at: '2024-01-15T00:00:00+00:00'
  },
  {
    id: 6,
    name: '林經理',
    email: 'hr.lin@abc-company.com',
    phone: '0912-555-666',
    password: 'hashed_corporate_password',
    role: 'CORPORATE_CONTACT',
    status: 'ACTIVE',
    profile: {
      language_preference: 'zh-TW',
      timezone: 'Asia/Taipei',
      corporate_info: {
        company_id: 1,
        position: '人力資源經理',
        department: '人力資源部'
      }
    },
    created_at: '2024-01-01T00:00:00+00:00',
    updated_at: '2024-01-15T00:00:00+00:00'
  },
  {
    id: 7,
    name: '代理商王先生',
    email: 'agent.wang@example.com',
    phone: '0912-777-888',
    password: 'hashed_agent_password',
    role: 'AGENT',
    status: 'ACTIVE',
    profile: {
      language_preference: 'zh-TW',
      timezone: 'Asia/Taipei',
      agent_info: {
        agent_code: 'AG001',
        level: 'GOLD',
        commission_rate: 15,
        total_referrals: 48,
        total_commission_earned: 72000
      }
    },
    created_at: '2023-01-01T00:00:00+00:00',
    updated_at: '2024-01-15T00:00:00+00:00'
  }
];

// ========================================
// 輔助函數
// ========================================

// 根據ID獲取用戶
export const getUserById = (id: number): User | undefined => {
  return users.find(user => user.id === id);
};

// 根據電子郵件獲取用戶
export const getUserByEmail = (email: string): User | undefined => {
  return users.find(user => user.email === email);
};

// 根據角色獲取用戶
export const getUsersByRole = (role: User['role']): User[] => {
  return users.filter(user => user.role === role);
};

// 根據狀態獲取用戶
export const getUsersByStatus = (status: User['status']): User[] => {
  return users.filter(user => user.status === status);
};

// 驗證用戶登入
export const validateUserLogin = (email: string, password: string): User | null => {
  const user = getUserByEmail(email);
  // 實際應用中應該使用適當的密碼驗證
  if (user && user.password === password && user.status === 'ACTIVE') {
    return user;
  }
  return null;
};

// 創建新用戶
export const createUser = (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): User => {
  const newUser: User = {
    ...userData,
    id: Math.max(...users.map(u => u.id), 0) + 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  users.push(newUser);
  return newUser;
};

// 更新用戶資料
export const updateUser = (userId: number, updates: Partial<User>): boolean => {
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) return false;
  
  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  return true;
};

// 停用用戶
export const deactivateUser = (userId: number): boolean => {
  const user = getUserById(userId);
  if (!user) return false;
  
  user.status = 'INACTIVE';
  user.updated_at = new Date().toISOString();
  return true;
};

// 搜尋用戶
export const searchUsers = (
  keyword: string,
  role?: User['role'],
  status?: User['status']
): User[] => {
  const searchTerm = keyword.toLowerCase();
  
  return users.filter(user => {
    const matchesKeyword = 
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.phone.includes(searchTerm);
    
    const matchesRole = !role || user.role === role;
    const matchesStatus = !status || user.status === status;
    
    return matchesKeyword && matchesRole && matchesStatus;
  });
};

// 獲取用戶統計
export const getUserStatistics = () => {
  const total = users.length;
  const active = users.filter(u => u.status === 'ACTIVE').length;
  const inactive = users.filter(u => u.status === 'INACTIVE').length;
  const suspended = users.filter(u => u.status === 'SUSPENDED').length;
  
  const roleStats = {
    STUDENT: users.filter(u => u.role === 'STUDENT').length,
    TEACHER: users.filter(u => u.role === 'TEACHER').length,
    ADMIN: users.filter(u => u.role === 'ADMIN').length,
    STAFF: users.filter(u => u.role === 'STAFF').length,
    CORPORATE_CONTACT: users.filter(u => u.role === 'CORPORATE_CONTACT').length,
    AGENT: users.filter(u => u.role === 'AGENT').length
  };
  
  return {
    total,
    status: { active, inactive, suspended },
    roles: roleStats
  };
};

// 向下相容的預設匯出
export default users;