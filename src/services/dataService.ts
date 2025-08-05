import { 
  User, Membership, ClassTimeslot, ClassAppointment,
  ApiResponse, LoginResponse, BatchBookingResponse
} from '@/types';
import { Agent } from '@/data/agents';
import { SalesRecord } from '@/types/sales';
import { generateBookingSessions } from '@/data/courseBookingIntegration';
import { teacherDataService } from '@/data/teachers';
import { hashString } from '@/utils/enrollmentUtils';
import { UserRole } from '@/data/user_roles';


interface LeaveRequest {
  id: string;
  teacherId: number;
  teacherName: string;
  teacherEmail: string;
  sessionId: string;
  courseName: string;
  courseDate: string;
  courseTime: string;
  reason: string;
  note?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt: string | null;
  reviewerName: string | null;
  adminNote: string | null;
}

// TypeScript 資料匯入
import { users as usersData } from '@/data/users';
import { memberCardStore } from '@/lib/memberCardStore';
import { classTimeslots as classTimeslotsData } from '@/data/class_timeslots';
import { classAppointments as classAppointmentsData } from '@/data/class_appointments';
import { agents as agentsData } from '@/data/agents';

// 模擬資料庫
const users: User[] = [...usersData] as User[];
const classTimeslots: ClassTimeslot[] = [...classTimeslotsData] as ClassTimeslot[];
const classAppointments: ClassAppointment[] = [...classAppointmentsData] as ClassAppointment[];
const agents: Agent[] = [...agentsData] as Agent[];

// 輔助函數
const generateId = (array: { id: number }[]): number => {
  return Math.max(0, ...array.map(item => item.id)) + 1;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 導入 JWT 工具
import { jwtUtils } from '@/lib/jwt';

// 用戶相關服務 (US01)
export const authService = {
  // 註冊用戶
  async register(email: string, password: string, name: string, phone: string): Promise<LoginResponse> {
    await delay(500); // 模擬網路延遲
    
    // 檢查 Email 是否已存在
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return { success: false, error: 'EMAIL_ALREADY_EXISTS' };
    }
    
    // 創建新用戶
    const newUser: User = {
      id: generateId(users),
      name,
      email,
      phone,
      password: `$2b$10$${password}`, // 模擬密碼雜湊
      roles: ['STUDENT'],
      membership_status: 'NON_MEMBER',
      account_status: 'ACTIVE',
      campus: '羅斯福校',
      created_at: new Date().toISOString()
    };
    
    users.push(newUser);
    
    // 生成 JWT token
    const jwt = jwtUtils.generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.roles[0]
    });
    
    // 自動登入
    return {
      success: true,
      user_id: newUser.id,
      jwt
    };
  },
  
  // 用戶登入
  async login(email: string, password: string): Promise<LoginResponse> {
    await delay(500);
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return { success: false, error: 'INVALID_CREDENTIALS' };
    }
    
    // 簡化密碼驗證 - 支援預設密碼或儲存的密碼
    const isValidPassword = password === 'password' || 
                           password === user.password;
    
    if (!isValidPassword) {
      return { success: false, error: 'INVALID_CREDENTIALS' };
    }
    
    // 生成 JWT token
    const jwt = jwtUtils.generateToken({
      userId: user.id,
      email: user.email,
      role: user.roles[0] || 'STUDENT'
    });
    
    return {
      success: true,
      user_id: user.id,
      jwt
    };
  },
  
  // 獲取用戶資料
  async getUser(id: number): Promise<User | null> {
    return users.find(user => user.id === id) || null;
  },

  // 角色管理相關功能
  async getUserRoles(userId: number) {
    await delay(200);
    
    try {
      const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
      const activeRoles = userRoles.filter((ur: UserRole) => ur.user_id === userId && ur.is_active);
      return { success: true, data: activeRoles };
    } catch (error) {
      console.error('獲取用戶角色失敗:', error);
      return { success: false, error: 'Failed to get user roles' };
    }
  },

  async updateUserRoles(userId: number, roles: string[], adminId: number) {
    await delay(500);
    
    try {
      const timestamp = new Date().toISOString();
      
      // 更新用戶角色
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        users[userIndex].roles = roles as ('STUDENT' | 'TEACHER' | 'STAFF' | 'CORPORATE_CONTACT' | 'ADMIN' | 'AGENT')[];
        users[userIndex].updated_at = timestamp;
        
        // 同步到 localStorage
        const localUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[] as User[];
        const localUserIndex = localUsers.findIndex((u: User) => u.id === userId);
        if (localUserIndex !== -1) {
          localUsers[localUserIndex].roles = roles as ('STUDENT' | 'TEACHER' | 'STAFF' | 'CORPORATE_CONTACT' | 'ADMIN' | 'AGENT')[];
          localUsers[localUserIndex].updated_at = timestamp;
          localStorage.setItem('users', JSON.stringify(localUsers));
        }
      }
      
      // 更新附加角色
      let userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
      
      // 停用該用戶的所有角色
      userRoles = userRoles.map((ur: UserRole) => 
        ur.user_id === userId ? { ...ur, is_active: false } : ur
      );
      
      // 添加新角色
      roles.forEach(role => {
        const newRole = {
          id: Math.max(0, ...userRoles.map((r: UserRole) => r.id)) + 1,
          user_id: userId,
          role: role,
          granted_by: adminId,
          granted_at: timestamp,
          is_active: true
        };
        userRoles.push(newRole);
      });
      
      localStorage.setItem('userRoles', JSON.stringify(userRoles));
      
      console.log('✅ 用戶角色已更新:', { userId, roles, adminId });
      return { success: true, data: { roles } };
    } catch (error) {
      console.error('更新用戶角色失敗:', error);
      return { success: false, error: 'Failed to update user roles' };
    }
  },

  async updateUserStatus(userId: number, status: 'NON_MEMBER' | 'MEMBER' | 'EXPIRED_MEMBER' | 'TEST_USER', _adminId: number) {
    await delay(300);
    
    try {
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return { success: false, error: 'User not found' };
      }
      
      const now = new Date().toISOString();
      users[userIndex].membership_status = status;
      users[userIndex].updated_at = now;
      
      // 同步到 localStorage 以保持一致性
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
      const localUserIndex = localUsers.findIndex((u: User) => u.id === userId);
      if (localUserIndex !== -1) {
        localUsers[localUserIndex].membership_status = status;
        localUsers[localUserIndex].updated_at = now;
        localStorage.setItem('users', JSON.stringify(localUsers));
      }
      
      console.log('✅ 用戶狀態已更新:', { userId, status, adminId: _adminId });
      return { success: true, data: users[userIndex] };
    } catch (error) {
      console.error('更新用戶狀態失敗:', error);
      return { success: false, error: 'Failed to update user status' };
    }
  },

  async getAllUsersWithRoles() {
    await delay(300);
    
    try {
      const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
      
      const usersWithRoles = users.map(user => {
        const activeRoles = userRoles
          .filter((ur: UserRole) => ur.user_id === user.id && ur.is_active)
          .map((ur: UserRole) => ur.role);
        
        return {
          ...user,
          roles: activeRoles
        };
      });
      
      return { success: true, data: usersWithRoles };
    } catch (error) {
      console.error('獲取用戶和角色失敗:', error);
      return { success: false, error: 'Failed to get users with roles' };
    }
  },

  // 創建新用戶
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>, _adminId: number) {
    await delay(500);
    
    // adminId reserved for future authorization checks
    
    try {
      const timestamp = new Date().toISOString();
      const newId = Math.max(0, ...users.map(u => u.id)) + 1;
      
      // 檢查 email 是否已存在
      const existingUser = users.find(u => u.email === userData.email);
      if (existingUser) {
        return { success: false, error: 'Email already exists' };
      }
      
      const newUser = {
        id: newId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password, // 實際環境中應該要 hash
        roles: userData.roles,
        membership_status: userData.membership_status,
        campus: userData.campus,
        account_status: 'ACTIVE' as 'ACTIVE' | 'SUSPENDED',
        created_at: timestamp,
        updated_at: timestamp
      };
      
      users.push(newUser);
      
      // 同步到 localStorage
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
      localUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(localUsers));
      
      console.log('✅ 新用戶已創建:', newUser);
      return { success: true, data: newUser };
    } catch (error) {
      console.error('創建用戶失敗:', error);
      return { success: false, error: 'Failed to create user' };
    }
  },

  // 更新用戶基本資訊
  async updateUser(userData: User, _adminId: number) {
    await delay(300);
    
    // adminId reserved for future authorization checks
    
    try {
      const userIndex = users.findIndex(u => u.id === userData.id);
      if (userIndex === -1) {
        return { success: false, error: 'User not found' };
      }
      
      // 檢查 email 是否與其他用戶重複
      const existingUser = users.find(u => u.email === userData.email && u.id !== userData.id);
      if (existingUser) {
        return { success: false, error: 'Email already exists' };
      }
      
      const timestamp = new Date().toISOString();
      users[userIndex] = {
        ...users[userIndex],
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        roles: userData.roles,
        membership_status: userData.membership_status,
        campus: userData.campus,
        updated_at: timestamp
      };
      
      // 同步到 localStorage
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
      const localUserIndex = localUsers.findIndex((u: User) => u.id === userData.id);
      if (localUserIndex !== -1) {
        localUsers[localUserIndex] = users[userIndex];
        localStorage.setItem('users', JSON.stringify(localUsers));
      }
      
      console.log('✅ 用戶資訊已更新:', users[userIndex]);
      return { success: true, data: users[userIndex] };
    } catch (error) {
      console.error('更新用戶失敗:', error);
      return { success: false, error: 'Failed to update user' };
    }
  },

  // 刪除用戶
  async deleteUser(userId: number, adminId: number) {
    await delay(300);
    
    try {
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return { success: false, error: 'User not found' };
      }
      
      // 防止刪除管理員自己
      if (userId === adminId) {
        return { success: false, error: 'Cannot delete yourself' };
      }
      
      const deletedUser = users[userIndex];
      users.splice(userIndex, 1);
      
      // 同步到 localStorage
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
      const localUserIndex = localUsers.findIndex((u: User) => u.id === userId);
      if (localUserIndex !== -1) {
        localUsers.splice(localUserIndex, 1);
        localStorage.setItem('users', JSON.stringify(localUsers));
      }
      
      // 同時刪除相關的角色記錄
      let userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
      userRoles = userRoles.filter((ur: UserRole) => ur.user_id !== userId);
      localStorage.setItem('userRoles', JSON.stringify(userRoles));
      
      console.log('✅ 用戶已刪除:', deletedUser);
      return { success: true, data: deletedUser };
    } catch (error) {
      console.error('刪除用戶失敗:', error);
      return { success: false, error: 'Failed to delete user' };
    }
  },

  // 自動判斷並更新會員狀態
  async autoUpdateMembershipStatus(userId: number) {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return { success: false, error: 'User not found' };

      let newStatus: 'NON_MEMBER' | 'MEMBER' | 'EXPIRED_MEMBER' | 'TEST_USER' = 'NON_MEMBER';

      // 檢查用戶角色
      if (!user.roles.includes('STUDENT')) {
        // 非學生角色自動變成使用者
        newStatus = 'NON_MEMBER';
      } else {
        // 學生角色需要檢查會員卡狀態
        const activeMembership = await memberCardService.getMembership(userId);
        if (activeMembership) {
          if (activeMembership.status === 'ACTIVE') {
            // 檢查是否過期
            const now = new Date();
            const expireTime = new Date(activeMembership.expire_time || '');
            if (expireTime > now) {
              newStatus = 'MEMBER';
            } else {
              newStatus = 'EXPIRED_MEMBER';
              // 同時更新會員卡狀態為過期
              const membershipIndex = memberships.findIndex(m => m.id === activeMembership.id);
              if (membershipIndex !== -1) {
                memberships[membershipIndex].status = 'EXPIRED';
              }
            }
          } else if (activeMembership.status === 'EXPIRED') {
            newStatus = 'EXPIRED_MEMBER';
          }
        }
        // 如果沒有會員卡，保持為 NON_MEMBER
      }

      // 更新用戶狀態
      if (user.membership_status !== newStatus) {
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          users[userIndex].membership_status = newStatus;
          users[userIndex].updated_at = new Date().toISOString();

          // 同步到 localStorage
          const localUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
          const localUserIndex = localUsers.findIndex((u: User) => u.id === userId);
          if (localUserIndex !== -1) {
            localUsers[localUserIndex].membership_status = newStatus;
            localUsers[localUserIndex].updated_at = new Date().toISOString();
            localStorage.setItem('users', JSON.stringify(localUsers));
          }
        }
      }

      return { success: true, data: { userId, oldStatus: user.membership_status, newStatus } };
    } catch (error) {
      console.error('自動更新會員狀態失敗:', error);
      return { success: false, error: 'Failed to auto update membership status' };
    }
  },

  async updateUserAccountStatus(userId: number, status: 'ACTIVE' | 'SUSPENDED', adminId: number) {
    await delay(300);
    
    try {
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return { success: false, error: 'User not found' };
      }
      
      const now = new Date().toISOString();
      users[userIndex].account_status = status;
      users[userIndex].updated_at = now;
      
      // 同步到 localStorage 以保持一致性
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
      const localUserIndex = localUsers.findIndex((u: User) => u.id === userId);
      if (localUserIndex !== -1) {
        localUsers[localUserIndex].account_status = status;
        localUsers[localUserIndex].updated_at = now;
        localStorage.setItem('users', JSON.stringify(localUsers));
      }
      
      console.log('✅ 用戶帳號狀態已更新:', { userId, status, adminId });
      return { success: true, data: users[userIndex] };
    } catch (error) {
      console.error('更新用戶帳號狀態失敗:', error);
      return { success: false, error: 'Failed to update user account status' };
    }
  }
};

// 會員方案服務已移除，將重新實作

// 訂單服務 (US03) - 會員方案相關功能已移除，將重新實作
export const orderService = {
  // 創建訂單功能暫時移除，等待會員方案重新實作
};

// 會員卡服務 (US04)
// 統一的格式轉換函數
const convertMembershipToLegacyFormat = (um: {
  id: number;
  created_at: string;
  member_card_id: number;
  duration_days?: number;
  activation_date?: string;
  expiry_date?: string;
  status: string;
  activation_deadline?: string;
  user_id: number;
  plan_id: number;
  user_email: string;
  user_name: string;
  order_id?: number;
}) => ({
  id: um.id,
  created_at: um.created_at,
  member_card_id: um.member_card_id,
  duration_in_days: um.duration_days || 365,
  start_time: um.activation_date || null,
  expire_time: um.expiry_date || null,
  activated: um.status === 'activated',
  activate_expire_time: um.activation_deadline || '',
  user_id: um.user_id,
  status: um.status === 'purchased' ? 'PURCHASED' as const : 
          um.status === 'activated' ? 'ACTIVE' as const : 
          'EXPIRED' as const,
  // 向後相容性屬性
  plan_id: um.plan_id,
  user_email: um.user_email,
  user_name: um.user_name,
  order_id: um.order_id
});

export const memberCardService = {
  // 取得所有會員卡（統一使用 memberCardStore）
  async getAllCards() {
    const userMemberships = await memberCardStore.getAllUserMemberships();
    
    return userMemberships.map(convertMembershipToLegacyFormat);
  },
  
  // 創建會員卡（統一使用 memberCardStore）
  async createCard(cardData: {
    plan_id: number;
    user_email: string;
    user_name: string;
    user_id: number;
    order_id: number;
    start_date: string;
    end_date: string;
    status: 'PURCHASED' | 'ACTIVE' | 'EXPIRED';
  }) {
    await delay(500);
    
    const userMembership = await memberCardStore.createMembership({
      user_id: cardData.user_id,
      user_name: cardData.user_name,
      user_email: cardData.user_email,
      plan_id: cardData.plan_id,
      order_id: cardData.order_id,
      amount_paid: 0, // 需要從其他地方獲取
      auto_renewal: false
    });

    // 如果狀態是 ACTIVE，立即開啟會員卡
    if (cardData.status === 'ACTIVE') {
      await memberCardStore.activateMemberCard(userMembership.id);
    }

    return convertMembershipToLegacyFormat(userMembership);
  },

  // 啟用會員卡（統一使用 memberCardStore）
  async activateMemberCard(userId: number, membershipId: number): Promise<ApiResponse<Membership>> {
    await delay(500);
    
    console.log(`🔍 查找會員卡 - 用戶ID: ${userId}, 會員卡ID: ${membershipId}`);
    
    try {
      // 檢查會員卡是否存在且屬於該用戶
      const userMembership = await memberCardStore.getUserMembershipById(membershipId);
      
      if (!userMembership || userMembership.user_id !== userId) {
        console.log('❌ 找不到會員資格記錄');
        return { success: false, error: 'Membership not found or not purchased' };
      }

      if (userMembership.status !== 'purchased') {
        console.log(`❌ 會員卡狀態不正確: ${userMembership.status} (需要 purchased)`);
        return { success: false, error: 'Membership not found or not purchased' };
      }

      // 檢查是否已有啟用的會員卡
      const userMemberships = await memberCardStore.getUserMembershipsByUserId(userId);
      const activeMembership = userMemberships.find(m => m.status === 'activated');
      if (activeMembership) {
        return { success: false, error: 'ACTIVE_CARD_EXISTS' };
      }

      // 啟用會員卡
      const activatedMembership = await memberCardStore.activateMemberCard(membershipId);
      
      if (!activatedMembership) {
        return { success: false, error: 'Failed to activate membership' };
      }

      console.log('✅ 會員卡啟用成功:', activatedMembership);

      const membership = convertMembershipToLegacyFormat(activatedMembership);
      return { success: true, data: membership };
    } catch (error) {
      console.error('啟用會員卡失敗:', error);
      return { success: false, error: (error as Error).message };
    }
  },
  
  // 獲取用戶會員資格 (只返回 ACTIVE 狀態)
  async getMembership(userId: number): Promise<Membership | null> {
    const userMemberships = await memberCardStore.getUserMembershipsByUserId(userId);
    const activeMembership = userMemberships.find(m => m.status === 'activated');
    
    console.log(`🔍 getMembership - 用戶ID: ${userId}, 找到的 ACTIVE 會員卡:`, activeMembership);
    
    if (!activeMembership) {
      return null;
    }

    return convertMembershipToLegacyFormat(activeMembership);
  },

  // 獲取用戶的待啟用會員卡 (PURCHASED 狀態)
  async getUserPurchasedMembership(userId: number): Promise<Membership | null> {
    const userMemberships = await memberCardStore.getUserMembershipsByUserId(userId);
    const purchasedMembership = userMemberships.find(m => m.status === 'purchased');
    
    console.log(`🔍 getUserPurchasedMembership - 用戶ID: ${userId}, 找到的 PURCHASED 會員卡:`, purchasedMembership);
    
    if (!purchasedMembership) {
      return null;
    }

    return convertMembershipToLegacyFormat(purchasedMembership);
  },
  
  // 獲取用戶所有會員資格（包括未啟用的）
  async getAllUserMemberships(userId: number): Promise<Membership[]> {
    const userMemberships = await memberCardStore.getUserMembershipsByUserId(userId);
    
    return userMemberships.map(convertMembershipToLegacyFormat);
  },

  // 檢查並更新過期的會員卡
  async checkAndUpdateExpiredMemberships(): Promise<{ updated: number; expired: Membership[] }> {
    await delay(500);
    
    // 使用統一的過期狀態更新
    await memberCardStore.updateExpiredStatus();
    
    // 獲取所有過期的會員卡
    const expiredUserMemberships = await memberCardStore.getUserMembershipsByStatus('expired');
    
    const expiredMemberships = expiredUserMemberships.map(convertMembershipToLegacyFormat);

    // 更新用戶會員狀態
    const uniqueUserIds = [...new Set(expiredMemberships.map(m => m.user_id))];
    for (const userId of uniqueUserIds) {
      await authService.autoUpdateMembershipStatus(userId);
    }

    console.log(`🔍 檢查會員卡過期 - 更新了 ${expiredMemberships.length} 張過期會員卡`);
    return { updated: expiredMemberships.length, expired: expiredMemberships };
  },

  // 獲取即將過期的會員卡（7天內）
  async getExpiringMemberships(days: number = 7): Promise<Membership[]> {
    const now = new Date();
    const checkDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const allMemberships = await memberCardStore.getAllUserMemberships();
    
    const expiringMemberships = allMemberships.filter(um => {
      if (um.status === 'activated' && um.expiry_date) {
        const expireTime = new Date(um.expiry_date);
        return expireTime > now && expireTime <= checkDate;
      }
      return false;
    });

    return expiringMemberships.map(convertMembershipToLegacyFormat);
  }
};

// 課程時段服務 (US05)
export const timeslotService = {
  // 獲取可預約的課程時段
  async getAvailableTimeslots(): Promise<ClassTimeslot[]> {
    await delay(300);
    
    const now = new Date();
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    return classTimeslots.filter(slot => {
      const slotStart = new Date(slot.start_time);
      return slot.status === 'CREATED' && 
             (slot.reserved_count || 0) < (slot.capacity || 20) &&
             slotStart > twentyFourHoursLater;
    });
  },
  
  // 獲取所有時段（包含狀態）
  async getAllTimeslots(): Promise<ClassTimeslot[]> {
    await delay(300);
    return [...classTimeslots];
  }
};

// 預約服務 (US06, US07)
export const bookingService = {
  // 檢查用戶是否已經預約過特定時段
  async checkExistingBooking(userId: number, timeslotId: number): Promise<boolean> {
    // 檢查內存中的預約
    const memoryBooking = classAppointments.find(a => 
      a.user_id === userId && 
      a.class_timeslot_id === timeslotId && 
      a.status === 'CONFIRMED'
    );
    
    if (memoryBooking) {
      return true;
    }
    
    // 檢查localStorage中的預約
    if (typeof localStorage !== 'undefined') {
      try {
        const storedAppointments = JSON.parse(localStorage.getItem('classAppointments') || '[]') as ClassAppointment[];
        const localStorageBooking = storedAppointments.find((a: ClassAppointment) => 
          a.user_id === userId && 
          a.class_timeslot_id === timeslotId && 
          a.status === 'CONFIRMED'
        );
        
        if (localStorageBooking) {
          return true;
        }
      } catch (error) {
        console.error('檢查localStorage預約時發生錯誤:', error);
      }
    }
    
    return false;
  },

  // 批量預約課程
  async batchBooking(userId: number, timeslotIds: number[]): Promise<BatchBookingResponse> {
    await delay(1000);
    
    const now = new Date();
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // 檢查會員資格 - 允許 ACTIVE 和 PURCHASED 狀態的會員預約
    let membership = await memberCardService.getMembership(userId);
    if (!membership) {
      membership = await memberCardService.getUserPurchasedMembership(userId);
    }
    
    console.log(`🔍 batchBooking - 用戶ID: ${userId}, 會員資格:`, membership);
    
    if (!membership) {
      console.log(`❌ batchBooking - 用戶ID: ${userId} 沒有有效的會員資格`);
      return {
        success: [],
        failed: timeslotIds.map(id => ({ timeslot_id: id, reason: 'MEMBERSHIP_EXPIRED' }))
      };
    }
    
    const successBookings: Array<{ timeslot_id: number; booking_id: number }> = [];
    const failedBookings: Array<{ timeslot_id: number; reason: 'FULL' | 'WITHIN_24H' | 'MEMBERSHIP_EXPIRED' }> = [];
    
    // 從課程預約日曆系統獲取時段資訊
    const allSessions = generateBookingSessions();
    
    for (const timeslotId of timeslotIds) {
      console.log(`🔍 處理時段ID: ${timeslotId}`);
      
      // 根據 timeslotId 查找對應的課程時段
      const session = allSessions.find(s => {
        const sessionHashId = hashString(s.id);
        return sessionHashId === timeslotId;
      });
      
      if (!session) {
        console.log(`❌ 找不到時段ID: ${timeslotId}`);
        failedBookings.push({ timeslot_id: timeslotId, reason: 'FULL' });
        continue;
      }
      
      console.log(`✅ 找到課程時段:`, session);
      
      const slotStart = new Date(`${session.date} ${session.startTime}`);
      
      // 檢查是否在24小時內
      if (slotStart <= twentyFourHoursLater) {
        console.log(`❌ 時段在24小時內: ${session.date} ${session.startTime}`);
        failedBookings.push({ timeslot_id: timeslotId, reason: 'WITHIN_24H' });
        continue;
      }
      
      // 檢查是否額滿
      if (session.currentEnrollments >= session.capacity) {
        console.log(`❌ 時段已額滿: ${session.currentEnrollments}/${session.capacity}`);
        failedBookings.push({ timeslot_id: timeslotId, reason: 'FULL' });
        continue;
      }
      
      // 檢查用戶是否已經預約過這個時段（防止重複預約）
      const existingAppointment = await this.checkExistingBooking(userId, timeslotId);
      if (existingAppointment) {
        console.log(`❌ 用戶 ${userId} 已預約過時段 ${timeslotId}`);
        failedBookings.push({ timeslot_id: timeslotId, reason: 'FULL' }); // 使用FULL作為已預約的原因
        continue;
      }
      
      // 創建預約
      const newAppointment: ClassAppointment = {
        id: generateId(classAppointments),
        class_timeslot_id: timeslotId,
        user_id: userId,
        status: 'CONFIRMED',
        created_at: new Date().toISOString()
      };
      
      console.log(`✅ 創建新預約:`, newAppointment);
      console.log(`🔧 預約詳情 - sessionId: ${session.id}, sessionHashId: ${hashString(session.id)}, timeslotId: ${timeslotId}`);
      classAppointments.push(newAppointment);
      
      // 同步更新到 localStorage（帶數據驗證）
      if (typeof localStorage !== 'undefined') {
        const existingAppointments = JSON.parse(localStorage.getItem('classAppointments') || '[]') as ClassAppointment[];
        
        // 檢查是否已存在相同的預約（避免重複）
        const isDuplicate = existingAppointments.some((apt: { user_id: number; class_timeslot_id: number; status: string }) => 
          apt.user_id === newAppointment.user_id && 
          apt.class_timeslot_id === newAppointment.class_timeslot_id &&
          apt.status === 'CONFIRMED'
        );
        
        if (!isDuplicate) {
          existingAppointments.push(newAppointment);
          localStorage.setItem('classAppointments', JSON.stringify(existingAppointments));
          console.log(`📱 已同步預約到 localStorage:`, newAppointment);
        } else {
          console.log(`⚠️ 重複預約，跳過同步:`, newAppointment);
        }
      }
      
      successBookings.push({
        timeslot_id: timeslotId,
        booking_id: newAppointment.id
      });
    }
    
    // 如果有成功的預約，觸發更新事件通知其他組件
    if (successBookings.length > 0) {
      console.log(`🔔 觸發 bookingsUpdated 事件，通知其他組件更新，成功預約數量: ${successBookings.length}`);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bookingsUpdated'));
      }
    }
    
    return { success: successBookings, failed: failedBookings };
  },
  
  // 取消預約
  async cancelBooking(userId: number, appointmentId: number): Promise<ApiResponse<boolean>> {
    await delay(500);
    
    console.log('🔥 ===== 開始取消預約調試 =====');
    console.log('🔍 開始取消預約 - userId:', userId, 'appointmentId:', appointmentId);
    console.log('📊 內存中的所有預約:', classAppointments);
    console.log('🔍 參數類型檢查:', {
      userIdType: typeof userId,
      userIdValue: userId,
      appointmentIdType: typeof appointmentId,
      appointmentIdValue: appointmentId,
      isUserIdNumber: !isNaN(Number(userId)),
      isAppointmentIdNumber: !isNaN(Number(appointmentId))
    });
    
    // 先檢查內存中的預約
    let appointment = classAppointments.find(a => {
      const matchesId = Number(a.id) === Number(appointmentId);
      const matchesUser = Number(a.user_id) === Number(userId);
      console.log('🔍 內存比較預約:', {
        appointmentData: a,
        matchesId,
        matchesUser,
        idComparison: `${a.id}(${typeof a.id}) === ${appointmentId}(${typeof appointmentId})`,
        userComparison: `${a.user_id}(${typeof a.user_id}) === ${userId}(${typeof userId})`
      });
      return matchesId && matchesUser;
    });
    let isFromLocalStorage = false;
    
    console.log('📋 內存中的預約查找結果:', appointment);
    
    // 如果內存中沒有，檢查 localStorage
    if (!appointment && typeof localStorage !== 'undefined') {
      try {
        const storedAppointments = JSON.parse(localStorage.getItem('classAppointments') || '[]') as ClassAppointment[];
        console.log('💾 localStorage中的所有預約:', storedAppointments);
        console.log('🔍 搜索條件 - appointmentId:', appointmentId, 'userId:', userId);
        
        appointment = storedAppointments.find((a: ClassAppointment) => {
          // 確保比較時使用正確的數據類型
          const matchesId = Number(a.id) === Number(appointmentId);
          const matchesUser = Number(a.user_id) === Number(userId);
          console.log('🔍 比較預約:', {
            appointmentData: a,
            appointmentDataKeys: Object.keys(a || {}),
            appointmentDataValues: Object.values(a || {}),
            matchesId,
            matchesUser,
            idComparison: `${a.id}(${typeof a.id}) === ${appointmentId}(${typeof appointmentId})`,
            userComparison: `${a.user_id}(${typeof a.user_id}) === ${userId}(${typeof userId})`
          });
          return matchesId && matchesUser;
        });
        
        console.log('📋 localStorage中的預約查找結果:', appointment);
        isFromLocalStorage = true;
      } catch (error) {
        console.error('讀取預約資料失敗:', error);
      }
    }
    
    if (!appointment) {
      console.error('❌ 找不到預約記錄:', { userId, appointmentId });
      return { success: false, error: 'Appointment not found' };
    }
    
    // 檢查appointment對象的完整性
    const isValidAppointment = appointment && 
                              typeof appointment === 'object' &&
                              'id' in appointment && 
                              'user_id' in appointment && 
                              'class_timeslot_id' in appointment && 
                              'status' in appointment &&
                              appointment.id != null &&
                              appointment.user_id != null &&
                              appointment.class_timeslot_id != null &&
                              appointment.status != null;
    
    if (!isValidAppointment) {
      console.error('❌ 預約記錄資料不完整或格式錯誤:', {
        appointment: appointment,
        appointmentType: typeof appointment,
        appointmentKeys: appointment ? Object.keys(appointment) : 'null',
        hasId: appointment && 'id' in appointment,
        hasUserId: appointment && 'user_id' in appointment,
        hasTimeslotId: appointment && 'class_timeslot_id' in appointment,
        hasStatus: appointment && 'status' in appointment
      });
      return { success: false, error: 'Appointment data incomplete or invalid' };
    }
    
    console.log('✅ 找到完整的預約記錄:', {
      appointmentId: appointment.id,
      userId: appointment.user_id,
      timeslotId: appointment.class_timeslot_id,
      status: appointment.status,
      isFromLocalStorage
    });
    
    // 詳細檢查appointment對象的內容
    console.log('🔍 檢查appointment對象詳細內容:', {
      appointment: appointment,
      appointmentKeys: Object.keys(appointment || {}),
      appointmentValues: Object.values(appointment || {}),
      hasId: 'id' in appointment,
      hasStatus: 'status' in appointment,
      hasUserId: 'user_id' in appointment,
      hasTimeslotId: 'class_timeslot_id' in appointment
    });
    
    console.log('🔥 即將檢查appointment.status:', appointment.status, 'type:', typeof appointment.status);
    console.log('🔥 appointment === CANCELED?', appointment.status === 'CANCELED');
    
    if (appointment.status === 'CANCELED') {
      console.error('❌ 預約已被取消:', {
        appointmentId: appointment.id || 'missing',
        status: appointment.status || 'missing',
        userId: appointment.user_id || 'missing',
        fullAppointment: appointment
      });
      return { success: false, error: 'Appointment already canceled' };
    }
    
    // 從課程預約日曆系統獲取時段資訊來做24小時檢查
    const allSessions = generateBookingSessions();
    const session = allSessions.find(s => {
      const sessionHashId = hashString(s.id);
      return sessionHashId === appointment!.class_timeslot_id;
    });
    
    if (!session) {
      return { success: false, error: 'Timeslot not found' };
    }
    
    const now = new Date();
    const slotStart = new Date(`${session.date} ${session.startTime}`);
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    // 檢查是否在24小時內
    if (slotStart.getTime() - now.getTime() <= twentyFourHours) {
      return { success: false, error: 'CANNOT_CANCEL_WITHIN_24H' };
    }
    
    // 取消預約
    appointment.status = 'CANCELED';
    
    // 同時更新內存和 localStorage 中的資料
    // 1. 更新內存中的資料
    const memoryAppointmentIndex = classAppointments.findIndex(a => Number(a.id) === Number(appointmentId) && Number(a.user_id) === Number(userId));
    if (memoryAppointmentIndex !== -1) {
      classAppointments[memoryAppointmentIndex].status = 'CANCELED';
      console.log('✅ 內存中的預約已更新為CANCELED');
    }
    
    // 2. 更新 localStorage 中的資料
    if (typeof localStorage !== 'undefined') {
      try {
        const storedAppointments = JSON.parse(localStorage.getItem('classAppointments') || '[]') as ClassAppointment[];
        const updatedAppointments = storedAppointments.map((a: ClassAppointment) => 
          Number(a.id) === Number(appointmentId) && Number(a.user_id) === Number(userId) ? 
          { ...a, status: 'CANCELED' as const } : a
        );
        localStorage.setItem('classAppointments', JSON.stringify(updatedAppointments));
        console.log('✅ localStorage中的預約已更新為CANCELED');
        
        // 觸發自定義事件通知其他組件更新資料
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('bookingsUpdated'));
        }
      } catch (error) {
        console.error('更新預約資料失敗:', error);
      }
    }
    
    return { success: true, data: true };
  },
  
  // 獲取所有預約記錄（管理員用）
  async getAllBookings(): Promise<ApiResponse<ClassAppointment[]>> {
    try {
      // 合併內存中的預約和 localStorage 中的預約
      let allAppointments = [...classAppointments];
      
      // 從 localStorage 讀取預約資料
      if (typeof localStorage !== 'undefined') {
        try {
          const storedAppointments = JSON.parse(localStorage.getItem('classAppointments') || '[]') as ClassAppointment[];
          // 合併資料，避免重複
          const existingIds = new Set(allAppointments.map(a => a.id));
          const newAppointments = storedAppointments.filter((a: ClassAppointment) => !existingIds.has(a.id));
          allAppointments = [...allAppointments, ...newAppointments];
        } catch (error) {
          console.error('讀取預約資料失敗:', error);
        }
      }
      
      // 去重處理
      const uniqueAppointmentsMap = new Map();
      allAppointments.forEach(appointment => {
        const key = `${appointment.id}-${appointment.user_id}`;
        if (!uniqueAppointmentsMap.has(key) || 
            appointment.status === 'CANCELED' || 
            new Date(appointment.created_at) > new Date(uniqueAppointmentsMap.get(key).created_at)) {
          uniqueAppointmentsMap.set(key, appointment);
        }
      });
      
      const deduplicatedAppointments = Array.from(uniqueAppointmentsMap.values());
      return { success: true, data: deduplicatedAppointments };
    } catch (error) {
      console.error('獲取所有預約失敗:', error);
      return { success: false, error: 'Failed to get all bookings' };
    }
  },

  // 獲取用戶預約
  async getUserAppointments(userId: number): Promise<ClassAppointment[]> {
    // 合併內存中的預約和 localStorage 中的預約
    let allAppointments = [...classAppointments];
    
    // 從 localStorage 讀取預約資料
    if (typeof localStorage !== 'undefined') {
      try {
        const storedAppointments = JSON.parse(localStorage.getItem('classAppointments') || '[]') as ClassAppointment[];
        console.log('💾 從localStorage讀取的預約:', storedAppointments);
        // 合併資料，避免重複
        const existingIds = new Set(allAppointments.map(a => a.id));
        const newAppointments = storedAppointments.filter((a: ClassAppointment) => !existingIds.has(a.id));
        allAppointments = [...allAppointments, ...newAppointments];
      } catch (error) {
        console.error('讀取預約資料失敗:', error);
      }
    }
    
    // 返回所有狀態的預約（CONFIRMED 和 CANCELED），並進行去重
    const userAppointments = allAppointments.filter(a => a.user_id === userId);
    
    // 去重：使用 Map 以 appointment.id 為 key 來去除重複項目
    const uniqueAppointmentsMap = new Map();
    userAppointments.forEach(appointment => {
      const key = `${appointment.id}-${appointment.user_id}`;
      // 如果已存在相同key，保留較新的或status為CANCELED的（表示最新狀態）
      if (!uniqueAppointmentsMap.has(key) || 
          appointment.status === 'CANCELED' || 
          new Date(appointment.created_at) > new Date(uniqueAppointmentsMap.get(key).created_at)) {
        uniqueAppointmentsMap.set(key, appointment);
      }
    });
    
    const deduplicatedAppointments = Array.from(uniqueAppointmentsMap.values());
    console.log('📋 getUserAppointments 去重前數量:', userAppointments.length);
    console.log('📋 getUserAppointments 去重後數量:', deduplicatedAppointments.length);
    console.log('📋 getUserAppointments 返回的去重預約:', deduplicatedAppointments);
    
    return deduplicatedAppointments;
  }
};

// 課務服務 (US08)
export const staffService = {
  // 取消課程時段
  async cancelTimeslot(timeslotId: number): Promise<ApiResponse<boolean>> {
    await delay(500);
    
    const timeslot = classTimeslots.find(t => t.id === timeslotId);
    if (!timeslot) {
      return { success: false, error: 'Timeslot not found' };
    }
    
    // 將時段狀態改為取消
    timeslot.status = 'CANCELED';
    
    // 自動取消相關預約
    const relatedAppointments = classAppointments.filter(a => a.class_timeslot_id === timeslotId);
    relatedAppointments.forEach(appointment => {
      appointment.status = 'CANCELED';
    });
    
    return { success: true, data: true };
  }
};

// Dashboard服務 (US09)
export const dashboardService = {
  // 獲取用戶Dashboard資料 - 從課程預約日曆系統獲取真實預約資料
  async getDashboardData(userId: number, userRole?: string) {
    await delay(300);
    
    console.log(`📊 獲取 Dashboard 資料 - 用戶ID: ${userId}, 角色: ${userRole}`);
    
    // 如果是教師，獲取學生預約其課程的資料
    if (userRole === 'TEACHER') {
      const upcomingClasses = await this.getTeacherBookings(userId);
      return {
        membership: null, // 教師不需要會員資格
        upcomingClasses
      };
    }
    
    // 學生的原有邏輯
    // 優先獲取 ACTIVE 會員卡，如果沒有則獲取 PURCHASED 會員卡
    let membership = await memberCardService.getMembership(userId);
    console.log('🎯 找到的 ACTIVE 會員卡:', membership);
    
    if (!membership) {
      membership = await memberCardService.getUserPurchasedMembership(userId);
      console.log('🎯 找到的 PURCHASED 會員卡:', membership);
    }
    
    console.log('📋 最終返回的會員資格:', membership);
    
    // 從課程預約日曆系統獲取真實預約資料
    const upcomingClasses = await this.getBookedCoursesFromCalendar(userId);
    
    return {
      membership,
      upcomingClasses
    };
  },

  // 獲取教師的預約課程資料
  async getTeacherBookings(teacherId: number) {
    try {
      console.log(`👨‍🏫 獲取教師 ${teacherId} 的預約資料`);
      
      // 獲取所有可用的課程時段
      const allSessions = generateBookingSessions();
      console.log('📅 所有課程時段數量:', allSessions.length);
      
      // 獲取所有預約記錄
      const allAppointments = JSON.parse(localStorage.getItem('classAppointments') || '[]') as ClassAppointment[];
      console.log('📋 所有預約記錄數量:', allAppointments.length);
      
      // 獲取教師資料以匹配教師ID
      let teacher = teacherDataService.getTeacherById(teacherId);
      
      // 如果通過ID找不到，嘗試通過用戶資料匹配
      if (!teacher) {
        const user = users.find(u => u.id === teacherId && u.roles.includes('TEACHER'));
        if (user) {
          // 通過email匹配教師管理系統中的教師
          const allTeachers = teacherDataService.getAllTeachers();
          teacher = allTeachers.find(t => t.email === user.email) || null;
          console.log(`通過email ${user.email} 找到教師:`, teacher?.name);
        }
      }
      
      if (!teacher) {
        console.warn(`找不到教師 ID: ${teacherId}`);
        return [];
      }
      
      console.log('👨‍🏫 找到教師:', teacher.name);
      
      // 找出與該教師相關的課程時段
      const teacherSessions = allSessions.filter(session => {
        // 比較教師名稱或ID
        return session.teacherName === teacher.name || 
               session.teacherId === teacherId ||
               session.teacherId === teacherId.toString();
      });
      
      console.log(`📚 教師 ${teacher.name} 的課程時段數量:`, teacherSessions.length);
      
      // 🔧 修改：顯示教師所有課程時段，不論是否有學生預約
      const teacherBookings = [];
      
      for (const session of teacherSessions) {
        const sessionHashId = hashString(session.id);
        
        // 找出預約了此時段的學生
        const sessionAppointments = allAppointments.filter((appointment: ClassAppointment) => 
          appointment.class_timeslot_id === sessionHashId && 
          appointment.status === 'CONFIRMED'
        );
        
        if (sessionAppointments.length > 0) {
          // 有學生預約：狀態為"已開課"
          for (const appointment of sessionAppointments) {
            const student = users.find(u => u.id === appointment.user_id);
            
            teacherBookings.push({
              appointment,
              session: {
                ...session,
                bookingStatus: 'opened' // 已開課
              },
              student: student ? {
                id: student.id,
                name: student.name,
                email: student.email,
                phone: student.phone || ''
              } : null
            });
          }
        } else {
          // 🔧 新增：無學生預約，狀態為"待開課"
          teacherBookings.push({
            appointment: null, // 沒有預約記錄
            session: {
              ...session,
              bookingStatus: 'pending' // 待開課
            },
            student: null // 沒有學生
          });
        }
      }
      
      console.log(`👥 教師 ${teacher.name} 的學生預約數量:`, teacherBookings.length);
      
      return teacherBookings;
    } catch (error) {
      console.error('獲取教師預約資料失敗:', error);
      return [];
    }
  },

  // 從課程預約日曆系統獲取已預約的課程
  async getBookedCoursesFromCalendar(userId: number) {
    
    try {
      // 獲取所有可用的課程時段
      const allSessions = generateBookingSessions();
      
      // 獲取用戶的預約記錄
      const appointments = await bookingService.getUserAppointments(userId);
      console.log('📋 getUserAppointments 返回的預約記錄:', appointments);
      
      // 記錄不同狀態的預約統計
      const confirmedAppointments = appointments.filter(a => a.status === 'CONFIRMED');
      const cancelledAppointments = appointments.filter(a => a.status === 'CANCELED');
      console.log('✅ CONFIRMED 預約數量:', confirmedAppointments.length, confirmedAppointments.map(a => ({id: a.id, timeslotId: a.class_timeslot_id})));
      console.log('❌ CANCELED 預約數量:', cancelledAppointments.length, cancelledAppointments.map(a => ({id: a.id, timeslotId: a.class_timeslot_id})));
      
      // 將預約記錄與課程時段對應
      const bookedSessions = [];
      
      for (const appointment of appointments) {
        // 使用 timeslot_id 查找對應的課程時段
        const session = allSessions.find(s => {
          const sessionHashId = hashString(s.id);
          return sessionHashId === appointment.class_timeslot_id;
        });
        
        if (session) {
          const bookedSession = {
            appointment,
            session,
            // 添加方便使用的屬性
            timeslot: {
              id: appointment.class_timeslot_id,
              start_time: `${session.date} ${session.startTime}`,
              end_time: `${session.date} ${session.endTime}`,
              class_id: session.courseId
            },
            class: {
              id: session.courseId,
              course_id: session.courseId
            },
            course: {
              id: session.courseId,
              title: session.courseTitle
            }
          };
          
          // 調試：檢查appointment資料
          console.log('📋 找到匹配的課程時段:', {
            appointmentId: appointment.id,
            appointmentStatus: appointment.status,
            sessionTitle: session.courseTitle,
            timeslotId: appointment.class_timeslot_id
          });
          
          bookedSessions.push(bookedSession);
        } else {
          console.warn('⚠️ 找不到匹配的課程時段:', {
            appointmentId: appointment.id,
            timeslotId: appointment.class_timeslot_id,
            appointmentStatus: appointment.status
          });
        }
      }
      
      // 按時間排序（近到遠）
      bookedSessions.sort((a, b) => 
        new Date(`${a.session.date} ${a.session.startTime}`).getTime() - 
        new Date(`${b.session.date} ${b.session.startTime}`).getTime()
      );
      
      // 統計各種狀態的預約
      const statusCounts = {
        confirmed: bookedSessions.filter(s => s.appointment.status === 'CONFIRMED').length,
        canceled: bookedSessions.filter(s => s.appointment.status === 'CANCELED').length,
        total: bookedSessions.length
      };
      console.log('📊 getBookedCoursesFromCalendar 狀態統計:', statusCounts);
      
      return bookedSessions;
    } catch (error) {
      console.error('獲取預約課程失敗:', error);
      return [];
    }
  },

  // 獲取老師的課程時段（從課程預約日曆系統）
  async getTeacherCoursesFromCalendar(teacherId: number) {
    
    try {
      // 獲取所有可用的課程時段
      const allSessions = generateBookingSessions();
      
      // 🔧 修復：解決用戶系統和教師管理系統的ID不一致問題
      // 用戶系統：王老師 id=4，教師管理系統：王老師 id=1
      const currentUser = users.find(u => u.id === teacherId);
      
      let actualTeacherId = teacherId;
      if (currentUser && currentUser.roles.includes('TEACHER')) {
        // 根據姓名和email在教師系統中找到對應的教師
        const teacherInSystem = teacherDataService.getTeacherByEmail(currentUser.email);
        if (teacherInSystem) {
          actualTeacherId = teacherInSystem.id;
          console.log(`🔄 用戶ID ${teacherId} (${currentUser.name}) 映射到教師系統ID ${actualTeacherId}`);
        }
      }
      
      // 篩選出該老師的課程時段
      const teacherSessions = allSessions.filter(session => 
        session.teacherId.toString() === actualTeacherId.toString()
      );
      
      // 為每個時段獲取學生列表
      const coursesWithStudents = [];
      
      for (const session of teacherSessions) {
        // 獲取該時段的所有預約
        const sessionHashId = hashString(session.id);
        console.log(`📊 檢查課程時段 ID 匹配:`, {
          sessionId: session.id,
          sessionHashId,
          courseTitle: session.courseTitle,
          teacherId: session.teacherId,
          availableAppointmentIds: classAppointments.map(a => a.class_timeslot_id)
        });
        
        const appointments = classAppointments.filter(appointment => 
          appointment.class_timeslot_id === sessionHashId && 
          appointment.status === 'CONFIRMED'
        );
        
        console.log(`🔍 找到 ${appointments.length} 個預約，時段ID: ${sessionHashId}`);
        
        // 獲取預約學生的詳細資訊
        const studentList = [];
        for (const appointment of appointments) {
          const student = users.find(u => u.id === appointment.user_id);
          if (student) {
            studentList.push({
              id: student.id,
              name: student.name,
              email: student.email
            });
          }
        }
        
        coursesWithStudents.push({
          session,
          studentList,
          appointmentCount: appointments.length
        });
      }
      
      // 按時間排序（近到遠）
      coursesWithStudents.sort((a, b) => 
        new Date(`${a.session.date} ${a.session.startTime}`).getTime() - 
        new Date(`${b.session.date} ${b.session.startTime}`).getTime()
      );
      
      return coursesWithStudents;
    } catch (error) {
      console.error('獲取老師課程失敗:', error);
      return [];
    }
  }
};

// 請假管理服務
// 代理管理服務
export const agentService = {
  // 獲取所有代理
  async getAllAgents(): Promise<Agent[]> {
    await delay(200);
    return [...agents];
  },

  // 根據 user_id 獲取代理資料
  async getAgentByUserId(userId: number): Promise<Agent | null> {
    await delay(200);
    return agents.find(agent => agent.user_id === userId) || null;
  },

  // 根據代理 ID 獲取代理資料
  async getAgentById(agentId: number): Promise<Agent | null> {
    await delay(200);
    return agents.find(agent => agent.id === agentId) || null;
  },

  // 獲取代理的銷售紀錄 (僅限該代理自己的資料)
  async getAgentSalesRecords(agentUserId: number): Promise<SalesRecord[]> {
    await delay(200);
    const agent = agents.find(a => a.user_id === agentUserId);
    if (!agent) return [];
    
    // 這裡返回該代理的銷售紀錄
    // 目前為模擬資料，實際應該從銷售紀錄表中查詢
    return [];
  },

  // 更新代理資料
  async updateAgent(agentId: number, updateData: Partial<Agent>): Promise<boolean> {
    await delay(300);
    const index = agents.findIndex(agent => agent.id === agentId);
    if (index === -1) return false;
    
    agents[index] = {
      ...agents[index],
      ...updateData,
      updated_at: new Date().toISOString()
    };
    return true;
  },

  // 檢查使用者是否為代理
  async isUserAgent(userId: number): Promise<boolean> {
    await delay(100);
    return agents.some(agent => agent.user_id === userId);
  },

  // 根據代理代碼獲取代理
  async getAgentByCode(agentCode: string): Promise<Agent | null> {
    await delay(200);
    return agents.find(agent => agent.agent_code === agentCode) || null;
  }
};

export const leaveService = {
  // 創建請假申請
  async createLeaveRequest(requestData: {
    teacherId: number;
    teacherName: string;
    teacherEmail: string;
    sessionId: string;
    courseName: string;
    courseDate: string;
    courseTime: string;
    reason: string;
    note?: string;
    studentCount?: number;
    classroom?: string;
  }) {
    await delay(500);
    
    try {
      // 獲取現有的請假申請
      const existingRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
      
      // 創建新的請假申請
      const newRequest = {
        id: Date.now().toString(),
        teacherId: requestData.teacherId,
        teacherName: requestData.teacherName,
        teacherEmail: requestData.teacherEmail,
        sessionId: requestData.sessionId,
        courseName: requestData.courseName,
        courseDate: requestData.courseDate,
        courseTime: requestData.courseTime,
        leaveReason: requestData.reason, // 對應介面定義
        requestDate: new Date().toISOString().split('T'), // 對應介面定義
        note: requestData.reason || '', // 將原因同時存為note以保持兼容性
        studentCount: requestData.studentCount || 0,
        classroom: requestData.classroom || '線上教室',
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        reviewedAt: null,
        reviewerName: null,
        adminNote: null,
        substituteTeacher: null
      };
      
      // 保存到 localStorage
      existingRequests.push(newRequest);
      localStorage.setItem('leaveRequests', JSON.stringify(existingRequests));
      
      console.log('✅ 請假申請已創建:', newRequest);
      
      return { success: true, data: newRequest };
    } catch (error) {
      console.error('創建請假申請失敗:', error);
      return { success: false, error: 'Failed to create leave request' };
    }
  },

  // 獲取所有請假申請（管理員用）
  async getAllLeaveRequests() {
    await delay(300);
    
    try {
      const requests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
      return { success: true, data: requests };
    } catch (error) {
      console.error('獲取請假申請失敗:', error);
      return { success: false, error: 'Failed to get leave requests' };
    }
  },

  // 審核請假申請（管理員用）
  async reviewLeaveRequest(requestId: string, status: 'approved' | 'rejected', adminNote?: string, reviewerName?: string, substituteTeacher?: { name: string; email: string }) {
    await delay(500);
    
    try {
      const requests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
      const requestIndex = requests.findIndex((r: LeaveRequest) => r.id === requestId);
      
      if (requestIndex === -1) {
        return { success: false, error: 'Leave request not found' };
      }
      
      // 更新請假申請狀態
      requests[requestIndex] = {
        ...requests[requestIndex],
        status,
        reviewedAt: new Date().toISOString(),
        reviewerName: reviewerName || '管理員',
        adminNote: adminNote || '',
        substituteTeacher: substituteTeacher || requests[requestIndex].substituteTeacher || null
      };
      
      localStorage.setItem('leaveRequests', JSON.stringify(requests));
      
      console.log(`✅ 請假申請已${status === 'approved' ? '批准' : '拒絕'}:`, requests[requestIndex]);
      
      return { success: true, data: requests[requestIndex] };
    } catch (error) {
      console.error('審核請假申請失敗:', error);
      return { success: false, error: 'Failed to review leave request' };
    }
  },

  // 獲取老師的請假申請
  async getTeacherLeaveRequests(teacherId: number) {
    await delay(300);
    
    try {
      const allRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
      const teacherRequests = allRequests.filter((r: LeaveRequest) => r.teacherId === teacherId);
      return { success: true, data: teacherRequests };
    } catch (error) {
      console.error('獲取老師請假申請失敗:', error);
      return { success: false, error: 'Failed to get teacher leave requests' };
    }
  },

  // 取消請假申請（教師用）
  async cancelLeaveRequest(requestId: string, teacherId: number, allowApproved: boolean = false) {
    await delay(500);
    
    try {
      const requests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
      const requestIndex = requests.findIndex((r: LeaveRequest) => {
        const matchesId = r.id === requestId && r.teacherId === teacherId;
        if (!allowApproved) {
          return matchesId && r.status === 'pending';
        } else {
          return matchesId && (r.status === 'pending' || r.status === 'approved');
        }
      });
      
      if (requestIndex === -1) {
        const statusMsg = allowApproved ? 'pending or approved' : 'pending';
        return { success: false, error: `Leave request not found or not in ${statusMsg} status` };
      }
      
      // 從列表中移除請假申請
      const cancelledRequest = requests[requestIndex];
      requests.splice(requestIndex, 1);
      
      localStorage.setItem('leaveRequests', JSON.stringify(requests));
      
      console.log('✅ 請假申請已取消:', cancelledRequest);
      
      return { success: true, data: cancelledRequest };
    } catch (error) {
      console.error('取消請假申請失敗:', error);
      return { success: false, error: 'Failed to cancel leave request' };
    }
  }
};