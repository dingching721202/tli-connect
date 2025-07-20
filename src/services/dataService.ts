import { 
  User, Course, Class, MemberCardPlan,
  Membership, Order, ClassTimeslot, ClassAppointment,
  ApiResponse, LoginResponse, BatchBookingResponse
} from '@/types';

// JSON 資料匯入
import usersData from '@/data/users.json';
import coursesData from '@/data/courses.json';
import classesData from '@/data/classes.json';
import memberCardPlansData from '@/data/member_card_plans.json';
import membershipsData from '@/data/memberships.json';
import ordersData from '@/data/orders.json';
import classTimeslotsData from '@/data/class_timeslots.json';
import classAppointmentsData from '@/data/class_appointments.json';

// 模擬資料庫
const users: User[] = [...usersData] as User[];
const courses: Course[] = [...coursesData] as Course[];
const classes: Class[] = [...classesData] as Class[];
const memberCardPlans: MemberCardPlan[] = [...memberCardPlansData] as MemberCardPlan[];
const memberships: Membership[] = [...membershipsData] as Membership[];
const orders: Order[] = [...ordersData] as Order[];
const classTimeslots: ClassTimeslot[] = [...classTimeslotsData] as ClassTimeslot[];
const classAppointments: ClassAppointment[] = [...classAppointmentsData] as ClassAppointment[];

// 輔助函數
const generateId = (array: { id: number }[]): number => {
  return Math.max(0, ...array.map(item => item.id)) + 1;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
    
    // 自動登入
    return {
      success: true,
      user_id: newUser.id,
      jwt: `jwt_token_${newUser.id}_${Date.now()}`
    };
  },
  
  // 用戶登入
  async login(email: string, password: string): Promise<LoginResponse> {
    await delay(500);
    
    const user = users.find(u => u.email === email);
    if (!user || password !== 'password') { // 簡化密碼驗證
      return { success: false, error: 'INVALID_CREDENTIALS' };
    }
    
    return {
      success: true,
      user_id: user.id,
      jwt: `jwt_token_${user.id}_${Date.now()}`
    };
  },
  
  // 獲取用戶資料
  async getUser(id: number): Promise<User | null> {
    return users.find(user => user.id === id) || null;
  }
};

// 會員方案服務 (US02)
export const membershipService = {
  // 獲取已發布的會員方案
  async getPublishedPlans(): Promise<MemberCardPlan[]> {
    await delay(300);
    return memberCardPlans.filter(plan => plan.status === 'PUBLISHED');
  },
  
  // 獲取特定方案詳情
  async getPlan(planId: number): Promise<MemberCardPlan | null> {
    return memberCardPlans.find(plan => plan.id === planId) || null;
  }
};

// 訂單服務 (US03)
export const orderService = {
  // 創建訂單
  async createOrder(userId: number, planId: number): Promise<ApiResponse<Order>> {
    await delay(800);
    
    const plan = await membershipService.getPlan(planId);
    if (!plan) {
      return { success: false, error: 'Plan not found' };
    }
    
    const newOrder: Order = {
      id: generateId(orders),
      member_card_plan_id: planId,
      user_id: userId,
      price: plan.price,
      status: 'CREATED',
      created_at: new Date().toISOString()
    };
    
    orders.push(newOrder);
    
    // 模擬付款處理 (成功)
    setTimeout(() => {
      newOrder.status = 'COMPLETED';
      
      // 創建會員資格
      const newMembership: Membership = {
        id: generateId(memberships),
        member_card_id: plan.member_card_id,
        user_id: userId,
        duration_in_days: plan.duration_days || (plan.type === 'SEASON' ? 90 : 365),
        start_time: null,
        expire_time: null,
        status: 'PURCHASED',
        activated: false,
        activate_expire_time: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90天內啟用
        created_at: new Date().toISOString()
      };
      
      memberships.push(newMembership);
    }, 2000);
    
    return { success: true, data: newOrder };
  }
};

// 會員卡服務 (US04)
export const memberCardService = {
  // 啟用會員卡
  async activateMemberCard(userId: number, membershipId: number): Promise<ApiResponse<Membership>> {
    await delay(500);
    
    const membership = memberships.find(m => m.id === membershipId && m.user_id === userId);
    if (!membership || membership.status !== 'PURCHASED') {
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
    
    return { success: true, data: membership };
  },
  
  // 獲取用戶會員資格
  async getUserMembership(userId: number): Promise<Membership | null> {
    return memberships.find(m => m.user_id === userId && m.status === 'ACTIVE') || null;
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
    
    for (const timeslotId of timeslotIds) {
      const timeslot = classTimeslots.find(t => t.id === timeslotId);
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
      timeslot.reserved_count = (timeslot.reserved_count || 0) + 1;
      
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
    
    const membership = await memberCardService.getUserMembership(userId);
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