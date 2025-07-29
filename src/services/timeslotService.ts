// 時段預約服務 - 統一管理時段預約數據
import { ClassAppointment } from '@/types';
import { getCourseSchedules } from '@/data/courseScheduleUtils';
// import { getUserById } from '@/data/users'; // 暫時註解，使用預設用戶名

export interface TimeslotBookingInfo {
  timeslotId: string;
  sessionHashId: number;
  enrolledCount: number;
  enrolledStudents: Array<{
    userId: number;
    userName: string;
    userEmail: string;
    bookingId: number;
    bookedAt: string;
  }>;
}

export interface TimeslotWithBookings {
  id: string;
  title: string;
  teacherName: string;
  teacherId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'full' | 'past';
  capacity: number;
  bookedCount: number;
  canCancel: boolean;
  timeStatus: 'pending' | 'started' | 'completed';
  enrolledStudents: Array<{
    userId: number;
    userName: string;
    userEmail: string;
    bookingId: number;
    bookedAt: string;
  }>;
}

// Hash function for consistent ID generation
function hashString(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// 獲取並清理預約數據
function getBookingData(): ClassAppointment[] {
  if (typeof localStorage === 'undefined') return [];
  
  try {
    const appointments = JSON.parse(localStorage.getItem('classAppointments') || '[]');
    
    // 自動清理無效的預約數據
    const validAppointments = cleanupInvalidBookings(appointments);
    
    // 如果清理了數據，更新 localStorage
    if (validAppointments.length !== appointments.length) {
      localStorage.setItem('classAppointments', JSON.stringify(validAppointments));
      console.log(`🧹 自動清理了 ${appointments.length - validAppointments.length} 個無效預約`);
    }
    
    return validAppointments;
  } catch (error) {
    console.error('讀取預約數據失敗:', error);
    return [];
  }
}

// 清理無效的預約數據
function cleanupInvalidBookings(appointments: ClassAppointment[]): ClassAppointment[] {
  // 獲取所有有效的時段 Hash ID
  const validHashIds = getAllValidTimeslotHashIds();
  
  // 只保留匹配有效時段的預約
  return appointments.filter(appointment => {
    // 保留狀態為 CONFIRMED 且匹配有效時段的預約
    return appointment.status === 'CONFIRMED' && 
           validHashIds.includes(appointment.class_timeslot_id);
  });
}

// 獲取所有有效的時段 Hash ID
function getAllValidTimeslotHashIds(): number[] {
  const courseSchedules = getCourseSchedules();
  const publishedSchedules = courseSchedules.filter(schedule => schedule.status === 'published');
  const validHashIds: number[] = [];
  
  for (const schedule of publishedSchedules) {
    if (schedule.generatedSessions && schedule.generatedSessions.length > 0) {
      for (const session of schedule.generatedSessions) {
        const hashId = hashString(session.id);
        validHashIds.push(hashId);
      }
    }
  }
  
  return validHashIds;
}

// 根據時段 ID 獲取預約信息
export function getTimeslotBookingInfo(sessionId: string): TimeslotBookingInfo {
  const sessionHashId = hashString(sessionId);
  // 使用統一的預約數據獲取函數，確保數據一致性
  const allBookings = getBookingData();
  
  // 找到該時段的所有確認預約
  const timeslotBookings = allBookings.filter((booking: ClassAppointment) => 
    booking.class_timeslot_id === sessionHashId && 
    booking.status === 'CONFIRMED'
  );
  
  // 獲取學生詳細信息
  const enrolledStudents = timeslotBookings.map((booking: ClassAppointment) => {
    // const user = getUserById(booking.user_id); // 暫時使用預設值
    return {
      userId: booking.user_id,
      userName: `學生 ${booking.user_id}`, // user?.name || 
      userEmail: `student${booking.user_id}@example.com`, // user?.email || 
      bookingId: booking.id,
      bookedAt: booking.created_at
    };
  });
  
  return {
    timeslotId: sessionId,
    sessionHashId,
    enrolledCount: timeslotBookings.length,
    enrolledStudents
  };
}

// 獲取所有時段預約信息
export function getAllTimeslotsWithBookings(): TimeslotWithBookings[] {
  // 重新啟用自動清理，確保數據一致性
  getBookingData(); // 這會觸發自動清理
  
  const courseSchedules = getCourseSchedules();
  const publishedSchedules = courseSchedules.filter(schedule => schedule.status === 'published');
  const enrichedTimeslots: TimeslotWithBookings[] = [];
  
  for (const schedule of publishedSchedules) {
    if (!schedule.generatedSessions || schedule.generatedSessions.length === 0) {
      continue;
    }
    
    for (const session of schedule.generatedSessions) {
      const now = new Date();
      const sessionDateTime = new Date(`${session.date} ${session.startTime}`);
      const sessionEndTime = new Date(`${session.date} ${session.endTime}`);
      const canCancel = sessionDateTime > now;
      
      // 獲取該時段的預約信息
      const bookingInfo = getTimeslotBookingInfo(session.id);
      const bookedCount = bookingInfo.enrolledCount;
      
      // 狀態計算邏輯：沒人預約=待開課，有人預約=已開課，超過時間=已上課
      let timeStatus: 'pending' | 'started' | 'completed';
      if (sessionEndTime < now) {
        timeStatus = 'completed'; // 已超過上課時間 = 已上課
      } else if (bookedCount >= 1) {
        timeStatus = 'started'; // 有人預約 = 已開課
      } else {
        timeStatus = 'pending'; // 沒人預約 = 待開課
      }
      
      enrichedTimeslots.push({
        id: session.id,
        title: `${schedule.templateTitle}${schedule.seriesName ? ` ${schedule.seriesName}` : ''} Lesson ${session.sessionNumber} - ${session.title}`,
        teacherName: session.teacherName,
        teacherId: session.teacherId,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        status: 'available' as const,
        capacity: 20, // 默認容量，可以後續從排程配置中獲取
        bookedCount,
        canCancel,
        timeStatus,
        enrolledStudents: bookingInfo.enrolledStudents
      });
    }
  }
  
  // 按照距離現在時間排序（越靠近的越上面）
  const sortedTimeslots = enrichedTimeslots.sort((a, b) => {
    const now = new Date();
    const aDateTime = new Date(`${a.date}T${a.startTime}`);
    const bDateTime = new Date(`${b.date}T${b.startTime}`);
    
    const aDistance = Math.abs(aDateTime.getTime() - now.getTime());
    const bDistance = Math.abs(bDateTime.getTime() - now.getTime());
    
    return aDistance - bDistance;
  });
  
  return sortedTimeslots;
}

// 根據用戶 ID 獲取其所有預約
export function getUserBookings(userId: number): ClassAppointment[] {
  const allBookings = getBookingData();
  return allBookings.filter(booking => 
    booking.user_id === userId && 
    booking.status === 'CONFIRMED'
  );
}

// 獲取系統總預約統計
export function getBookingStats() {
  const allBookings = getBookingData();
  const confirmed = allBookings.filter(booking => booking.status === 'CONFIRMED').length;
  const cancelled = allBookings.filter(booking => booking.status === 'CANCELED').length;
  
  return {
    total: allBookings.length,
    confirmed,
    cancelled
  };
}