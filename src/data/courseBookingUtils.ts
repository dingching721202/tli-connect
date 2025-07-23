// 課程預約工具函數 - 使用日曆排程數據
import {
  CourseSchedule,
  ScheduledSession,
  getPublishedCourseSchedules
} from './courseScheduleUtils';

export interface BookableSession {
  id: string;
  scheduleId: string;
  templateId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  teacherId: string;
  teacherName: string;
  virtualClassroomLink?: string;
  materialLink?: string;
  capacity: number;
  bookedCount: number;
  status: 'available' | 'full' | 'past';
}

export interface CourseFilter {
  scheduleId: string;
  title: string;
  selected: boolean;
}

// 獲取所有可預約的課程時段
export function getAllBookableSessions(): BookableSession[] {
  const publishedSchedules = getPublishedCourseSchedules();
  const bookableSessions: BookableSession[] = [];
  const currentDate = new Date();

  publishedSchedules.forEach(schedule => {
    schedule.generatedSessions.forEach(session => {
      const sessionDateTime = new Date(`${session.date} ${session.startTime}`);
      
      // 計算狀態
      let status: 'available' | 'full' | 'past' = 'available';
      
      if (sessionDateTime < currentDate) {
        status = 'past';
      } else {
        // 從 localStorage 獲取預約數據來計算已預約數量
        const bookings = getSessionBookings(session.id);
        const bookedCount = bookings.length;
        const capacity = 20; // 預設容量，可以從課程模板或排程中獲取
        
        if (bookedCount >= capacity) {
          status = 'full';
        }
      }

      bookableSessions.push({
        id: session.id,
        scheduleId: schedule.id,
        templateId: schedule.templateId,
        title: session.title,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        teacherId: session.teacherId,
        teacherName: session.teacherName,
        virtualClassroomLink: session.virtualClassroomLink,
        materialLink: session.materialLink,
        capacity: 20, // 預設容量
        bookedCount: getSessionBookings(session.id).length,
        status
      });
    });
  });

  return bookableSessions.sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.startTime}`);
    const dateB = new Date(`${b.date} ${b.startTime}`);
    return dateA.getTime() - dateB.getTime();
  });
}

// 獲取課程篩選器選項
export function getCourseFilters(): CourseFilter[] {
  const publishedSchedules = getPublishedCourseSchedules();
  
  return publishedSchedules.map(schedule => ({
    scheduleId: schedule.id,
    title: schedule.templateTitle,
    selected: true // 預設全選
  }));
}

// 根據篩選器獲取課程時段
export function getFilteredBookableSessions(filters: CourseFilter[]): BookableSession[] {
  const allSessions = getAllBookableSessions();
  const selectedScheduleIds = filters
    .filter(filter => filter.selected)
    .map(filter => filter.scheduleId);

  if (selectedScheduleIds.length === 0) {
    return allSessions; // 如果沒有選擇任何課程，顯示全部
  }

  return allSessions.filter(session => 
    selectedScheduleIds.includes(session.scheduleId)
  );
}

// 根據日期獲取課程時段
export function getSessionsByDate(date: string, filters: CourseFilter[] = []): BookableSession[] {
  const filteredSessions = filters.length > 0 
    ? getFilteredBookableSessions(filters)
    : getAllBookableSessions();

  return filteredSessions.filter(session => session.date === date);
}

// 預約課程時段
export function bookSession(sessionId: string, userId: string): boolean {
  if (typeof localStorage !== 'undefined') {
    const bookings = JSON.parse(localStorage.getItem('sessionBookings') || '[]');
    
    // 檢查是否已預約
    const existingBooking = bookings.find((booking: any) => 
      booking.sessionId === sessionId && booking.userId === userId
    );
    
    if (existingBooking) {
      return false; // 已經預約過
    }

    // 檢查容量
    const sessionBookings = bookings.filter((booking: any) => booking.sessionId === sessionId);
    if (sessionBookings.length >= 20) { // 預設容量
      return false; // 已滿
    }

    // 添加新預約
    const newBooking = {
      id: `booking_${Date.now()}`,
      sessionId,
      userId,
      bookedAt: new Date().toISOString(),
      status: 'confirmed'
    };

    bookings.push(newBooking);
    localStorage.setItem('sessionBookings', JSON.stringify(bookings));
    
    // 觸發更新事件
    window.dispatchEvent(new CustomEvent('sessionBookingsUpdated'));
    
    return true;
  }
  
  return false;
}

// 取消預約
export function cancelBooking(sessionId: string, userId: string): boolean {
  if (typeof localStorage !== 'undefined') {
    const bookings = JSON.parse(localStorage.getItem('sessionBookings') || '[]');
    const filteredBookings = bookings.filter((booking: any) => 
      !(booking.sessionId === sessionId && booking.userId === userId)
    );
    
    if (filteredBookings.length !== bookings.length) {
      localStorage.setItem('sessionBookings', JSON.stringify(filteredBookings));
      
      // 觸發更新事件
      window.dispatchEvent(new CustomEvent('sessionBookingsUpdated'));
      
      return true;
    }
  }
  
  return false;
}

// 獲取特定時段的所有預約
export function getSessionBookings(sessionId: string): any[] {
  if (typeof localStorage !== 'undefined') {
    const bookings = JSON.parse(localStorage.getItem('sessionBookings') || '[]');
    return bookings.filter((booking: any) => booking.sessionId === sessionId);
  }
  
  return [];
}

// 獲取用戶的所有預約
export function getUserBookings(userId: string): any[] {
  if (typeof localStorage !== 'undefined') {
    const bookings = JSON.parse(localStorage.getItem('sessionBookings') || '[]');
    return bookings.filter((booking: any) => booking.userId === userId);
  }
  
  return [];
}

// 批量預約
export function batchBookSessions(sessionIds: string[], userId: string): {
  success: string[];
  failed: { sessionId: string; reason: string }[];
} {
  const result = {
    success: [] as string[],
    failed: [] as { sessionId: string; reason: string }[]
  };

  sessionIds.forEach(sessionId => {
    const success = bookSession(sessionId, userId);
    if (success) {
      result.success.push(sessionId);
    } else {
      // 判斷失敗原因
      const existingBookings = getSessionBookings(sessionId);
      let reason = 'unknown';
      
      if (existingBookings.some((booking: any) => booking.userId === userId)) {
        reason = 'already_booked';
      } else if (existingBookings.length >= 20) {
        reason = 'full';
      }
      
      result.failed.push({ sessionId, reason });
    }
  });

  return result;
}