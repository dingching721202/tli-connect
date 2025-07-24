import { 
  User, Course, Class,
  Membership, ClassTimeslot, ClassAppointment,
  ApiResponse, LoginResponse, BatchBookingResponse
} from '@/types';

// TypeScript 資料匯入
import { users as usersData } from '@/data/users';
import { courses as coursesData } from '@/data/courses';
import { classes as classesData } from '@/data/classes';
import { memberships as membershipsData } from '@/data/memberships';
import { classTimeslots as classTimeslotsData } from '@/data/class_timeslots';
import { classAppointments as classAppointmentsData } from '@/data/class_appointments';

// 模擬資料庫
const users: User[] = [...usersData] as User[];
const courses: Course[] = [...coursesData] as Course[];
const classes: Class[] = [...classesData] as Class[];
const memberships: Membership[] = [...membershipsData] as Membership[];
const classTimeslots: ClassTimeslot[] = [...classTimeslotsData] as ClassTimeslot[];
const classAppointments: ClassAppointment[] = [...classAppointmentsData] as ClassAppointment[];

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
      role: 'STUDENT',
      created_at: new Date().toISOString()
    };
    
    users.push(newUser);
    
    // 生成 JWT token
    const jwt = jwtUtils.generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role
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
      role: user.role
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
  }
};

// 會員方案服務已移除，將重新實作

// 訂單服務 (US03) - 會員方案相關功能已移除，將重新實作
export const orderService = {
  // 創建訂單功能暫時移除，等待會員方案重新實作
};

// 會員卡服務 (US04)
export const memberCardService = {
  // 取得所有會員卡
  getAllCards() {
    return memberships;
  },
  
  // 創建會員卡
  createCard(cardData: {
    plan_id: number;
    user_email: string;
    user_name: string;
    user_id: number;
    order_id: number;
    start_date: string;
    end_date: string;
    status: 'PURCHASED' | 'ACTIVE' | 'EXPIRED';
  }) {
    const newCard = {
      id: generateId(memberships),
      member_card_id: cardData.plan_id,
      user_id: cardData.user_id,
      duration_in_days: Math.ceil((new Date(cardData.end_date).getTime() - new Date(cardData.start_date).getTime()) / (1000 * 60 * 60 * 24)),
      start_time: cardData.start_date,
      expire_time: cardData.end_date,
      status: cardData.status,
      activated: cardData.status === 'ACTIVE',
      activate_expire_time: cardData.end_date,
      created_at: new Date().toISOString(),
      plan_id: cardData.plan_id,
      user_email: cardData.user_email,
      user_name: cardData.user_name,
      order_id: cardData.order_id,
      start_date: cardData.start_date,
      end_date: cardData.end_date
    };
    
    memberships.push(newCard);
    return newCard;
  },
  // 啟用會員卡
  async activateMemberCard(userId: number, membershipId: number): Promise<ApiResponse<Membership>> {
    await delay(500);
    
    console.log(`🔍 查找會員卡 - 用戶ID: ${userId}, 會員卡ID: ${membershipId}`);
    console.log('📋 所有會員資格:', memberships);
    
    const membership = memberships.find(m => m.id === membershipId && m.user_id === userId);
    console.log('🎯 找到的會員資格:', membership);
    
    if (!membership) {
      console.log('❌ 找不到會員資格記錄');
      return { success: false, error: 'Membership not found or not purchased' };
    }
    
    if (membership.status !== 'PURCHASED') {
      console.log(`❌ 會員卡狀態不正確: ${membership.status} (需要 PURCHASED)`);
      return { success: false, error: 'Membership not found or not purchased' };
    }
    
    // 檢查是否已有啟用的會員卡
    const activeMembership = memberships.find(m => 
      m.user_id === userId && m.status === 'ACTIVE'
    );
    if (activeMembership) {
      return { success: false, error: 'ACTIVE_CARD_EXISTS' };
    }
    
    // 啟用會員卡
    const now = new Date();
    membership.status = 'ACTIVE';
    membership.activated = true;
    membership.start_time = now.toISOString();
    membership.expire_time = new Date(now.getTime() + membership.duration_in_days * 24 * 60 * 60 * 1000).toISOString();
    
    console.log('✅ 會員卡啟用成功:', membership);
    
    return { success: true, data: membership };
  },
  
  // 獲取用戶會員資格 (只返回 ACTIVE 狀態)
  async getUserMembership(userId: number): Promise<Membership | null> {
    const activeMembership = memberships.find(m => m.user_id === userId && m.status === 'ACTIVE');
    console.log(`🔍 getUserMembership - 用戶ID: ${userId}, 找到的 ACTIVE 會員卡:`, activeMembership);
    return activeMembership || null;
  },

  // 獲取用戶的待啟用會員卡 (PURCHASED 狀態)
  async getUserPurchasedMembership(userId: number): Promise<Membership | null> {
    const purchasedMembership = memberships.find(m => m.user_id === userId && m.status === 'PURCHASED');
    console.log(`🔍 getUserPurchasedMembership - 用戶ID: ${userId}, 找到的 PURCHASED 會員卡:`, purchasedMembership);
    return purchasedMembership || null;
  },
  
  // 獲取用戶所有會員資格（包括未啟用的）
  async getAllUserMemberships(userId: number): Promise<Membership[]> {
    return memberships.filter(m => m.user_id === userId);
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
  // 批量預約課程
  async batchBooking(userId: number, timeslotIds: number[]): Promise<BatchBookingResponse> {
    await delay(1000);
    
    const now = new Date();
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // 檢查會員資格
    const membership = await memberCardService.getUserMembership(userId);
    if (!membership) {
      return {
        success: [],
        failed: timeslotIds.map(id => ({ timeslot_id: id, reason: 'MEMBERSHIP_EXPIRED' }))
      };
    }
    
    const successBookings: Array<{ timeslot_id: number; booking_id: number }> = [];
    const failedBookings: Array<{ timeslot_id: number; reason: 'FULL' | 'WITHIN_24H' | 'MEMBERSHIP_EXPIRED' }> = [];
    
    // US06: 從localStorage讀取最新的時段資料，確保與課程模組同步
    let currentTimeslots = [...classTimeslots];
    if (typeof localStorage !== 'undefined') {
      try {
        const storedTimeslots = localStorage.getItem('classTimeslots');
        if (storedTimeslots) {
          currentTimeslots = JSON.parse(storedTimeslots);
        }
      } catch (error) {
        console.error('讀取時段資料失敗:', error);
      }
    }
    
    for (const timeslotId of timeslotIds) {
      const timeslot = currentTimeslots.find(t => t.id === timeslotId);
      if (!timeslot) continue;
      
      const slotStart = new Date(timeslot.start_time);
      
      // 檢查是否在24小時內
      if (slotStart <= twentyFourHoursLater) {
        failedBookings.push({ timeslot_id: timeslotId, reason: 'WITHIN_24H' });
        continue;
      }
      
      // 檢查是否額滿
      if ((timeslot.reserved_count || 0) >= (timeslot.capacity || 20)) {
        failedBookings.push({ timeslot_id: timeslotId, reason: 'FULL' });
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
      
      classAppointments.push(newAppointment);
      
      // 更新時段的預約人數
      timeslot.reserved_count = (timeslot.reserved_count || 0) + 1;
      
      // US06: 同步更新到localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('classTimeslots', JSON.stringify(currentTimeslots));
      }
      
      successBookings.push({
        timeslot_id: timeslotId,
        booking_id: newAppointment.id
      });
    }
    
    return { success: successBookings, failed: failedBookings };
  },
  
  // 取消預約
  async cancelBooking(userId: number, appointmentId: number): Promise<ApiResponse<boolean>> {
    await delay(500);
    
    const appointment = classAppointments.find(a => a.id === appointmentId && a.user_id === userId);
    if (!appointment || appointment.status === 'CANCELED') {
      return { success: false, error: 'Appointment not found' };
    }
    
    const timeslot = classTimeslots.find(t => t.id === appointment.class_timeslot_id);
    if (!timeslot) {
      return { success: false, error: 'Timeslot not found' };
    }
    
    const now = new Date();
    const slotStart = new Date(timeslot.start_time);
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    // 檢查是否在24小時內
    if (slotStart.getTime() - now.getTime() <= twentyFourHours) {
      return { success: false, error: 'CANNOT_CANCEL_WITHIN_24H' };
    }
    
    // 取消預約
    appointment.status = 'CANCELED';
    timeslot.reserved_count = Math.max(0, (timeslot.reserved_count || 0) - 1);
    
    return { success: true, data: true };
  },
  
  // 獲取用戶預約
  async getUserAppointments(userId: number): Promise<ClassAppointment[]> {
    return classAppointments.filter(a => a.user_id === userId && a.status === 'CONFIRMED');
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
  // 獲取用戶Dashboard資料
  async getDashboardData(userId: number) {
    await delay(300);
    
    console.log(`📊 獲取 Dashboard 資料 - 用戶ID: ${userId}`);
    
    // 優先獲取 ACTIVE 會員卡，如果沒有則獲取 PURCHASED 會員卡
    let membership = await memberCardService.getUserMembership(userId);
    console.log('🎯 找到的 ACTIVE 會員卡:', membership);
    
    if (!membership) {
      membership = await memberCardService.getUserPurchasedMembership(userId);
      console.log('🎯 找到的 PURCHASED 會員卡:', membership);
    }
    
    console.log('📋 最終返回的會員資格:', membership);
    
    const appointments = await bookingService.getUserAppointments(userId);
    
    // 獲取預約的詳細資訊
    const upcomingClasses = [];
    for (const appointment of appointments) {
      const timeslot = classTimeslots.find(t => t.id === appointment.class_timeslot_id);
      if (timeslot) {
        const classInfo = classes.find(c => c.id === timeslot.class_id);
        const courseInfo = courses.find(c => c.id === classInfo?.course_id);
        
        upcomingClasses.push({
          appointment,
          timeslot,
          class: classInfo,
          course: courseInfo
        });
      }
    }
    
    // 按時間排序（近到遠）
    upcomingClasses.sort((a, b) => 
      new Date(a.timeslot.start_time).getTime() - new Date(b.timeslot.start_time).getTime()
    );
    
    return {
      membership,
      upcomingClasses
    };
  }
};