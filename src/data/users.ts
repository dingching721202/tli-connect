import type { User, UserRole, UserStatus } from '@/types/business';

// ========================================
// 使用者資料 - MECE架構 
// 支援6種角色：STUDENT, TEACHER, ADMIN, STAFF, CORPORATE_CONTACT, AGENT
// ========================================

export const users: User[] = [
  // 學生用戶
  {
    id: 1,
    name: "Alice Wang",
    email: "alice@example.com",
    phone: "0900-111-222",
    password: "hashed_pw1",
    role: "STUDENT",
    status: "ACTIVE",
    profile: {
      language_preference: "zh-TW",
      timezone: "Asia/Taipei",
      learning_goals: ["商業英文", "日常會話"]
    },
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-14T12:00:00+00:00"
  },
  {
    id: 2,
    name: "Bob Chen",
    email: "user2@example.com",
    phone: "0900-333-444",
    password: "hashed_pw2",
    role: "STUDENT",
    status: "ACTIVE",
    profile: {
      language_preference: "zh-TW",
      timezone: "Asia/Taipei",
      learning_goals: ["基礎英文", "考試準備"]
    },
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-14T12:00:00+00:00"
  },
  {
    id: 3,
    name: "Charlie Lin",
    email: "charlie@example.com",
    phone: "0900-555-666",
    password: "hashed_pw3",
    role: "STUDENT",
    status: "ACTIVE",
    profile: {
      language_preference: "en-US",
      timezone: "Asia/Taipei",
      learning_goals: ["進階英文", "專業溝通"]
    },
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-14T12:00:00+00:00"
  },
  {
    id: 8,
    name: "David Wilson",
    email: "david@example.com",
    phone: "0900-123-456",
    password: "password",
    role: "STUDENT",
    status: "ACTIVE",
    profile: {
      language_preference: "en-US",
      timezone: "Asia/Taipei",
      learning_goals: ["中文學習"]
    },
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-14T12:00:00+00:00"
  },

  // 教師用戶
  {
    id: 4,
    name: "王老師",
    email: "teacher@example.com",
    phone: "0900-777-888",
    password: "password",
    role: "TEACHER",
    status: "ACTIVE",
    profile: {
      language_preference: "zh-TW",
      timezone: "Asia/Taipei",
      teaching_experience: {
        years_of_experience: 8,
        specializations: ["英文會話", "商業英文", "TOEIC準備"],
        certifications: ["TESOL", "劍橋英語教師認證"],
        languages_taught: ["English", "Chinese"],
        bio: "擁有8年英語教學經驗，專精於商業英文與會話練習"
      }
    },
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-14T12:00:00+00:00"
  },

  // 管理員用戶
  {
    id: 6,
    name: "Admin User",
    email: "admin@example.com",
    phone: "0900-888-999",
    password: "password",
    role: "ADMIN",
    status: "ACTIVE",
    profile: {
      language_preference: "zh-TW",
      timezone: "Asia/Taipei"
    },
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-14T12:00:00+00:00"
  },

  // 員工用戶 (舊的OPS角色更新為STAFF)
  {
    id: 5,
    name: "Olivia Kao",
    email: "olivia@example.com",
    phone: "0900-999-000",
    password: "hashed_pw5",
    role: "STAFF",
    status: "ACTIVE",
    profile: {
      language_preference: "zh-TW",
      timezone: "Asia/Taipei"
    },
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-14T12:00:00+00:00"
  },

  // 企業聯絡人
  {
    id: 7,
    name: "Frank Liu",
    email: "frank@taiwantech.com",
    phone: "0900-777-333",
    password: "password",
    role: "CORPORATE_CONTACT",
    status: "ACTIVE",
    profile: {
      language_preference: "zh-TW",
      timezone: "Asia/Taipei",
      corporate_info: {
        company_id: 1,
        position: "人力資源經理",
        department: "人力資源部"
      }
    },
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-14T12:00:00+00:00"
  },

  // 代理商用戶 (新增)
  {
    id: 9,
    name: "Sarah Agent",
    email: "sarah@agent.com",
    phone: "0900-555-111",
    password: "password",
    role: "AGENT",
    status: "ACTIVE",
    profile: {
      language_preference: "zh-TW",
      timezone: "Asia/Taipei",
      agent_info: {
        agent_code: "AG001",
        level: "GOLD",
        commission_rate: 15,
        parent_agent_id: undefined,
        total_referrals: 24,
        total_commission_earned: 36000
      }
    },
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-14T12:00:00+00:00"
  },

  // 另一個代理商用戶
  {
    id: 10,
    name: "Mike Agent",
    email: "mike@agent.com", 
    phone: "0900-666-222",
    password: "password",
    role: "AGENT",
    status: "ACTIVE",
    profile: {
      language_preference: "en-US",
      timezone: "Asia/Taipei",
      agent_info: {
        agent_code: "AG002",
        level: "SILVER",
        commission_rate: 12,
        parent_agent_id: 9, // 上級代理商
        total_referrals: 15,
        total_commission_earned: 18000
      }
    },
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-14T12:00:00+00:00"
  }
];

// ========================================
// 輔助函數
// ========================================

// 根據角色獲取用戶
export const getUsersByRole = (role: UserRole): User[] => {
  return users.filter(user => user.role === role);
};

// 根據狀態獲取用戶
export const getUsersByStatus = (status: UserStatus): User[] => {
  return users.filter(user => user.status === status);
};

// 根據ID獲取用戶
export const getUserById = (id: number): User | undefined => {
  return users.find(user => user.id === id);
};

// 根據email獲取用戶  
export const getUserByEmail = (email: string): User | undefined => {
  return users.find(user => user.email === email);
};

// 檢查用戶是否有特定角色權限
export const hasRole = (user: User, allowedRoles: UserRole[]): boolean => {
  return allowedRoles.includes(user.role);
};

// 檢查用戶是否為活躍狀態
export const isActiveUser = (user: User): boolean => {
  return user.status === 'ACTIVE';
};

// 向下相容的預設匯出
export default users;