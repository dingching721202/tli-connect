// 時段管理服務 - 直接使用課程排程和預約系統資料
import { generateBookingSessions } from '@/data/courseBookingIntegration';
import { hashString } from '@/utils/enrollmentUtils';

// 取消時段的本地存儲管理
function getCanceledTimeslots(): Set<string> {
  if (typeof localStorage === 'undefined') return new Set();
  
  try {
    const canceledIds = JSON.parse(localStorage.getItem('canceledTimeslots') || '[]');
    return new Set(canceledIds);
  } catch (error) {
    console.error('讀取已取消時段失敗:', error);
    return new Set();
  }
}

function saveCanceledTimeslots(canceledIds: Set<string>) {
  if (typeof localStorage === 'undefined') return;
  
  try {
    localStorage.setItem('canceledTimeslots', JSON.stringify(Array.from(canceledIds)));
  } catch (error) {
    console.error('儲存已取消時段失敗:', error);
  }
}

// 簡化的時段介面，直接映射預約系統的資料
export interface TimeslotWithBookings {
  id: string;
  title: string;
  teacherName: string;
  teacherId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  canCancel: boolean;
  timeStatus: 'pending' | 'started' | 'completed' | 'canceled';
  status: 'available' | 'full' | 'canceled' | 'past';
  enrolledStudents: Array<{
    userId: number;
    userName: string;
    userEmail: string;
    bookingId: number;
    bookedAt: string;
  }>;
  classroom_link?: string;
  material_link?: string;
}

// 主要功能：獲取所有時段及其預約資訊（直接來自課程排程+預約系統）
export function getAllTimeslotsWithBookings(): TimeslotWithBookings[] {
  console.log(`📅 時段管理: 從課程排程和預約系統獲取時段資料`);
  
  // 直接使用預約系統的資料，這確保與課程預約頁面完全一致
  const bookingSessions = generateBookingSessions();
  console.log(`📊 從預約系統獲取 ${bookingSessions.length} 個時段`);
  
  // 獲取已取消的時段列表
  const canceledTimeslots = getCanceledTimeslots();
  
  const timeslots: TimeslotWithBookings[] = bookingSessions.map(session => {
    const now = new Date();
    const sessionDateTime = new Date(`${session.date} ${session.startTime}`);
    const sessionEndTime = new Date(`${session.date} ${session.endTime}`);
    const canCancel = sessionDateTime > now;
    
    // 使用預約系統的實際預約數量
    const bookedCount = session.currentEnrollments;
    
    // 獲取學生詳細資訊
    const enrolledStudents = getEnrolledStudents(session.id);
    
    // 檢查是否已取消
    const isCanceled = canceledTimeslots.has(session.id);
    
    // 狀態計算：取消優先，然後是時間和預約狀態
    let timeStatus: 'pending' | 'started' | 'completed' | 'canceled';
    let status: 'available' | 'full' | 'canceled' | 'past';
    
    if (isCanceled) {
      timeStatus = 'canceled';
      status = 'canceled';
    } else if (sessionEndTime < now) {
      timeStatus = 'completed';
      status = 'past';
    } else if (bookedCount >= session.capacity) {
      timeStatus = bookedCount >= 1 ? 'started' : 'pending';
      status = 'full';
    } else if (bookedCount >= 1) {
      timeStatus = 'started';
      status = 'available';
    } else {
      timeStatus = 'pending';
      status = 'available';
    }
    
    return {
      id: session.id,
      title: `${session.courseTitle} Lesson ${session.sessionNumber} - ${session.sessionTitle}`,
      teacherName: session.teacherName,
      teacherId: session.teacherId.toString(),
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      capacity: session.capacity,
      bookedCount,
      canCancel: canCancel && !isCanceled,
      timeStatus,
      status,
      enrolledStudents,
      classroom_link: session.classroom_link,
      material_link: session.material_link
    };
  });
  
  // 按日期時間排序
  const sortedTimeslots = timeslots.sort((a, b) => {
    const aDateTime = new Date(`${a.date}T${a.startTime}`);
    const bDateTime = new Date(`${b.date}T${b.startTime}`);
    return aDateTime.getTime() - bDateTime.getTime();
  });
  
  console.log(`📊 時段管理總結: 共 ${sortedTimeslots.length} 個時段`);
  
  return sortedTimeslots;
}

// 取消時段
export function cancelTimeslot(timeslotId: string): boolean {
  try {
    const canceledTimeslots = getCanceledTimeslots();
    canceledTimeslots.add(timeslotId);
    saveCanceledTimeslots(canceledTimeslots);
    
    console.log(`📅 時段已取消: ${timeslotId}`);
    
    // 觸發更新事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('timeslotUpdated'));
    }
    
    return true;
  } catch (error) {
    console.error('取消時段失敗:', error);
    return false;
  }
}

// 恢復已取消的時段
export function restoreTimeslot(timeslotId: string): boolean {
  try {
    const canceledTimeslots = getCanceledTimeslots();
    canceledTimeslots.delete(timeslotId);
    saveCanceledTimeslots(canceledTimeslots);
    
    console.log(`📅 時段已恢復: ${timeslotId}`);
    
    // 觸發更新事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('timeslotUpdated'));
    }
    
    return true;
  } catch (error) {
    console.error('恢復時段失敗:', error);
    return false;
  }
}

// 檢查時段是否已取消
export function isTimeslotCanceled(timeslotId: string): boolean {
  const canceledTimeslots = getCanceledTimeslots();
  return canceledTimeslots.has(timeslotId);
}

// 獲取特定時段的學生預約詳情
function getEnrolledStudents(sessionId: string): Array<{
  userId: number;
  userName: string;
  userEmail: string;
  bookingId: number;
  bookedAt: string;
}> {
  if (typeof localStorage === 'undefined') return [];
  
  try {
    const appointments = JSON.parse(localStorage.getItem('classAppointments') || '[]');
    const sessionHashId = hashString(sessionId);
    
    // 找到該時段的所有確認預約
    const timeslotBookings = appointments.filter((booking: {
      class_timeslot_id: number;
      status: string;
    }) => 
      booking.class_timeslot_id === sessionHashId && 
      booking.status === 'CONFIRMED'
    );
    
    // 轉換為學生詳細資訊
    return timeslotBookings.map((booking: {
      user_id: number;
      id: number;
      created_at: string;
    }) => ({
      userId: booking.user_id,
      userName: `學生 ${booking.user_id}`,
      userEmail: `student${booking.user_id}@example.com`,
      bookingId: booking.id,
      bookedAt: booking.created_at
    }));
  } catch (error) {
    console.error('獲取學生預約詳情失敗:', error);
    return [];
  }
}

// 簡化的統計功能（如果需要）
export function getBookingStats() {
  const timeslots = getAllTimeslotsWithBookings();
  const totalBookings = timeslots.reduce((sum, slot) => sum + slot.bookedCount, 0);
  
  return {
    totalTimeslots: timeslots.length,
    totalBookings,
    availableSlots: timeslots.filter(slot => slot.timeStatus === 'pending').length,
    completedSlots: timeslots.filter(slot => slot.timeStatus === 'completed').length
  };
}