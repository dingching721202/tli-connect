import { courseSchedules } from './courseSchedules';
import { courseSessions } from './courseSessions';
import { bookings } from './bookings';
import { memberships } from './memberships';
import { courseModules } from './courseModules';
import type { CourseSchedule, Booking } from '@/types/business';

// ========================================
// 課程預約整合工具 - MECE架構
// 整合課程系統與預約系統的相關函數
// ========================================

// 課程篩選器界面
export interface CourseFilter {
  id: string;
  title: string;
  selected: boolean;
}

// 檢查用戶是否可以預約特定課程節次
export const canUserBookSession = (
  userId: number,
  sessionId: number
): { canBook: boolean; reason?: string } => {
  const session = courseSessions.find(s => s.id === sessionId);
  if (!session) {
    return { canBook: false, reason: '找不到課程節次' };
  }

  const schedule = courseSchedules.find(s => s.id === session.course_schedule_id);
  if (!schedule) {
    return { canBook: false, reason: '找不到課程排程' };
  }

  // 檢查課程狀態
  if (schedule.status !== 'PUBLISHED') {
    return { canBook: false, reason: '課程尚未開放預約' };
  }

  // 檢查節次狀態
  if (session.status !== 'SCHEDULED') {
    return { canBook: false, reason: '課程節次不可預約' };
  }

  // 檢查容量
  if (session.reserved_count >= session.capacity) {
    return { canBook: false, reason: '課程已滿' };
  }

  // 檢查用戶是否有有效會員卡
  const activeMembership = memberships.find(m => 
    m.user_id === userId && 
    m.status === 'ACTIVE' &&
    m.remaining_sessions > 0
  );

  if (!activeMembership) {
    return { canBook: false, reason: '沒有有效的會員卡或剩餘課程' };
  }

  // 檢查是否已經預約
  const existingBooking = bookings.find(b => 
    b.user_id === userId && 
    b.course_session_id === sessionId &&
    b.status !== 'CANCELED'
  );

  if (existingBooking) {
    return { canBook: false, reason: '已經預約過此課程' };
  }

  // 檢查預約時間限制（24小時前取消規則的反向檢查）
  const sessionStart = new Date(session.start_time);
  const now = new Date();
  const hoursUntilSession = (sessionStart.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilSession < 2) { // 課程開始前2小時不能預約
    return { canBook: false, reason: '課程開始前2小時不能預約' };
  }

  return { canBook: true };
};

// 預約課程節次
export const bookCourseSession = (
  userId: number,
  sessionId: number,
  membershipId: number
): { success: boolean; booking?: Booking; error?: string } => {
  const canBookResult = canUserBookSession(userId, sessionId);
  if (!canBookResult.canBook) {
    return { success: false, error: canBookResult.reason };
  }

  const session = courseSessions.find(s => s.id === sessionId);
  const membership = memberships.find(m => m.id === membershipId);

  if (!session || !membership) {
    return { success: false, error: '找不到課程或會員卡' };
  }

  // 創建預約記錄
  const newBooking: Booking = {
    id: Math.max(...bookings.map(b => b.id), 0) + 1,
    user_id: userId,
    course_session_id: sessionId,
    membership_id: membershipId,
    status: 'CONFIRMED',
    booking_time: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // 更新節次預約數量
  session.reserved_count += 1;
  
  // 扣除會員卡課程數
  membership.remaining_sessions -= 1;
  membership.updated_at = new Date().toISOString();

  // 保存預約記錄
  bookings.push(newBooking);

  return { success: true, booking: newBooking };
};

// 取消課程預約
export const cancelCourseBooking = (
  bookingId: number,
  userId: number
): { success: boolean; error?: string } => {
  const booking = bookings.find(b => b.id === bookingId && b.user_id === userId);
  if (!booking) {
    return { success: false, error: '找不到預約記錄' };
  }

  if (booking.status === 'CANCELED') {
    return { success: false, error: '預約已經被取消' };
  }

  const session = courseSessions.find(s => s.id === booking.course_session_id);
  if (!session) {
    return { success: false, error: '找不到課程節次' };
  }

  // 檢查取消時間限制（24小時前才能取消）
  const sessionStart = new Date(session.start_time);
  const now = new Date();
  const hoursUntilSession = (sessionStart.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilSession < 24) {
    return { success: false, error: '課程開始前24小時內不能取消' };
  }

  // 更新預約狀態
  booking.status = 'CANCELED';
  booking.cancellation_time = new Date().toISOString();
  booking.updated_at = new Date().toISOString();

  // 恢復節次容量
  session.reserved_count = Math.max(0, session.reserved_count - 1);

  // 恢復會員卡課程數
  const membership = memberships.find(m => m.id === booking.membership_id);
  if (membership) {
    membership.remaining_sessions += 1;
    membership.updated_at = new Date().toISOString();
  }

  return { success: true };
};

// 批次預約課程
export const batchBookSessions = (
  userId: number,
  sessionIds: number[],
  membershipId: number
): {
  successful_bookings: Array<{ session_id: number; booking_id: number }>;
  failed_bookings: Array<{ session_id: number; reason: string }>;
} => {
  const successful_bookings: Array<{ session_id: number; booking_id: number }> = [];
  const failed_bookings: Array<{ session_id: number; reason: string }> = [];

  for (const sessionId of sessionIds) {
    const result = bookCourseSession(userId, sessionId, membershipId);
    
    if (result.success && result.booking) {
      successful_bookings.push({
        session_id: sessionId,
        booking_id: result.booking.id
      });
    } else {
      failed_bookings.push({
        session_id: sessionId,
        reason: result.error || '未知錯誤'
      });
    }
  }

  return { successful_bookings, failed_bookings };
};

// 獲取用戶的課程預約歷史
export const getUserBookingHistory = (userId: number, limit?: number) => {
  const userBookings = bookings
    .filter(b => b.user_id === userId)
    .sort((a, b) => new Date(b.booking_time).getTime() - new Date(a.booking_time).getTime());

  const bookingsWithDetails = userBookings.map(booking => {
    const session = courseSessions.find(s => s.id === booking.course_session_id);
    const schedule = session ? courseSchedules.find(s => s.id === session.course_schedule_id) : null;
    const membership = memberships.find(m => m.id === booking.membership_id);

    return {
      booking,
      session,
      schedule,
      membership
    };
  });

  return limit ? bookingsWithDetails.slice(0, limit) : bookingsWithDetails;
};

// 獲取課程的預約統計
export const getCourseBookingStats = (scheduleId: number) => {
  const schedule = courseSchedules.find(s => s.id === scheduleId);
  if (!schedule) return null;

  const sessions = courseSessions.filter(s => s.course_schedule_id === scheduleId);
  const allBookings = bookings.filter(b => 
    sessions.some(s => s.id === b.course_session_id)
  );

  const confirmedBookings = allBookings.filter(b => b.status === 'CONFIRMED');
  const canceledBookings = allBookings.filter(b => b.status === 'CANCELED');
  const attendedBookings = allBookings.filter(b => b.status === 'ATTENDED');

  const totalCapacity = sessions.reduce((sum, s) => sum + s.capacity, 0);
  const totalReserved = sessions.reduce((sum, s) => sum + s.reserved_count, 0);

  return {
    schedule_id: scheduleId,
    total_sessions: sessions.length,
    total_capacity: totalCapacity,
    total_reserved: totalReserved,
    available_slots: totalCapacity - totalReserved,
    occupancy_rate: totalCapacity > 0 ? (totalReserved / totalCapacity) * 100 : 0,
    booking_stats: {
      total_bookings: allBookings.length,
      confirmed: confirmedBookings.length,
      canceled: canceledBookings.length,
      attended: attendedBookings.length,
      no_show: allBookings.filter(b => b.status === 'NO_SHOW').length
    },
    cancellation_rate: allBookings.length > 0 ? (canceledBookings.length / allBookings.length) * 100 : 0,
    attendance_rate: (confirmedBookings.length + attendedBookings.length) > 0 ? 
      (attendedBookings.length / (confirmedBookings.length + attendedBookings.length)) * 100 : 0
  };
};

// 檢查課程節次衝突
export const checkSessionConflicts = (userId: number, sessionId: number): boolean => {
  const targetSession = courseSessions.find(s => s.id === sessionId);
  if (!targetSession) return false;

  const userBookings = bookings.filter(b => 
    b.user_id === userId && 
    b.status === 'CONFIRMED'
  );

  for (const booking of userBookings) {
    const bookedSession = courseSessions.find(s => s.id === booking.course_session_id);
    if (!bookedSession) continue;

    const targetStart = new Date(targetSession.start_time);
    const targetEnd = new Date(targetSession.end_time);
    const bookedStart = new Date(bookedSession.start_time);
    const bookedEnd = new Date(bookedSession.end_time);

    // 檢查時間重疊
    if (targetStart < bookedEnd && targetEnd > bookedStart) {
      return true; // 有衝突
    }
  }

  return false; // 無衝突
};

// 生成單一排程的預約節次資訊
export const generateBookingSessions = (scheduleId: number) => {
  const schedule = courseSchedules.find(s => s.id === scheduleId);
  if (!schedule) return [];

  return courseSessions
    .filter(s => s.course_schedule_id === scheduleId)
    .map(session => ({
      ...session,
      schedule,
      availability: {
        available_slots: session.capacity - session.reserved_count,
        is_full: session.reserved_count >= session.capacity,
        can_book: session.status === 'SCHEDULED' && session.reserved_count < session.capacity
      }
    }));
};

// 生成所有已發布排程的預約節次資訊
export const generateAllBookingSessions = () => {
  const publishedSchedules = courseSchedules.filter(s => s.status === 'PUBLISHED');
  const allSessions = [];

  for (const schedule of publishedSchedules) {
    const sessions = generateBookingSessions(schedule.id);
    allSessions.push(...sessions);
  }

  return allSessions;
};

// 獲取課程篩選選項 - 返回課程模組作為篩選器
export const getCourseFilters = (): CourseFilter[] => {
  return courseModules
    .filter(module => module.is_active)
    .map(module => ({
      id: module.id.toString(),
      title: module.title,
      selected: false
    }));
};

// 篩選預約節次
export const filterBookingSessions = (filters: {
  language?: string;
  level?: string;
  teacher_id?: number;
  location_type?: string;
  price_range?: [number, number];
  start_date?: string;
  end_date?: string;
}) => {
  let filteredSchedules = courseSchedules.filter(s => s.status === 'PUBLISHED');

  // 套用篩選條件
  if (filters.teacher_id) {
    filteredSchedules = filteredSchedules.filter(s => s.teacher_id === filters.teacher_id);
  }

  if (filters.location_type) {
    filteredSchedules = filteredSchedules.filter(s => s.location.type === filters.location_type);
  }

  if (filters.price_range) {
    const [min, max] = filters.price_range;
    filteredSchedules = filteredSchedules.filter(s => s.price >= min && s.price <= max);
  }

  if (filters.language || filters.level) {
    filteredSchedules = filteredSchedules.filter(s => {
      const courseModule = courseModules.find((m: { id: number }) => m.id === s.course_module_id);
      if (!courseModule) return false;
      
      if (filters.language && courseModule.language !== filters.language) return false;
      if (filters.level && courseModule.level !== filters.level) return false;
      
      return true;
    });
  }

  // 獲取對應的節次
  const allSessions = filteredSchedules.flatMap(schedule => 
    courseSessions
      .filter(s => s.course_schedule_id === schedule.id)
      .filter(s => {
        if (s.status !== 'SCHEDULED') return false;
        
        if (filters.start_date) {
          const sessionDate = new Date(s.start_time);
          const startDate = new Date(filters.start_date);
          if (sessionDate < startDate) return false;
        }
        
        if (filters.end_date) {
          const sessionDate = new Date(s.start_time);
          const endDate = new Date(filters.end_date);
          if (sessionDate > endDate) return false;
        }
        
        return true;
      })
      .map(session => ({
        ...session,
        schedule,
        courseModule: courseModules.find((m: { id: number }) => m.id === schedule.course_module_id),
        availability: {
          available_slots: session.capacity - session.reserved_count,
          is_full: session.reserved_count >= session.capacity,
          can_book: session.reserved_count < session.capacity
        }
      }))
  );

  return allSessions.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
};

// 獲取用戶推薦的課程（基於歷史預約）
export const getRecommendedCourses = (userId: number, limit: number = 5): CourseSchedule[] => {
  const userBookings = bookings.filter(b => b.user_id === userId);
  const bookedScheduleIds = new Set<number>();

  // 收集用戶已預約過的課程排程
  userBookings.forEach(booking => {
    const session = courseSessions.find(s => s.id === booking.course_session_id);
    if (session) {
      bookedScheduleIds.add(session.course_schedule_id);
    }
  });

  // 簡單的推薦邏輯：推薦相似的課程
  const availableSchedules = courseSchedules.filter(schedule => 
    schedule.status === 'PUBLISHED' &&
    !bookedScheduleIds.has(schedule.id) &&
    schedule.current_students < schedule.max_students
  );

  // 按照受歡迎程度排序（以當前學生數為指標）
  return availableSchedules
    .sort((a, b) => b.current_students - a.current_students)
    .slice(0, limit);
};

// 向下相容的預設匯出
const courseBookingIntegrationModule = {
  canUserBookSession,
  bookCourseSession,
  cancelCourseBooking,
  batchBookSessions,
  getUserBookingHistory,
  getCourseBookingStats,
  checkSessionConflicts,
  getRecommendedCourses,
  generateBookingSessions,
  generateAllBookingSessions,
  getCourseFilters,
  filterBookingSessions
};

export default courseBookingIntegrationModule;