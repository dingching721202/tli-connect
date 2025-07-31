import type { CourseSession } from '@/types/business';

// ========================================
// 課程節次資料 - MECE架構
// 管理每個具體的課程節次
// ========================================

export const courseSessions: CourseSession[] = [];

// ========================================
// 輔助函數
// ========================================

// 根據課程排程ID獲取節次
export const getSessionsByScheduleId = (scheduleId: number): CourseSession[] => {
  return courseSessions.filter(session => session.course_schedule_id === scheduleId);
};

// 根據狀態獲取節次
export const getSessionsByStatus = (status: CourseSession['status']): CourseSession[] => {
  return courseSessions.filter(session => session.status === status);
};

// 根據日期範圍獲取節次
export const getSessionsByDateRange = (startDate: string, endDate: string): CourseSession[] => {
  return courseSessions.filter(session => 
    session.start_time >= startDate && session.end_time <= endDate
  );
};

// 根據ID獲取節次
export const getSessionById = (id: number): CourseSession | undefined => {
  return courseSessions.find(session => session.id === id);
};

// 獲取即將到來的節次
export const getUpcomingSessions = (limit: number = 10): CourseSession[] => {
  const now = new Date().toISOString();
  return courseSessions
    .filter(session => session.start_time > now && session.status === 'SCHEDULED')
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
    .slice(0, limit);
};

// 獲取今日的節次
export const getTodaySessions = (): CourseSession[] => {
  const today = new Date().toISOString().split('T')[0];
  return courseSessions.filter(session => 
    session.start_time.startsWith(today)
  );
};

// 課程節次統計
export const getCourseSessionStatistics = () => {
  const total = courseSessions.length;
  const scheduled = courseSessions.filter(s => s.status === 'SCHEDULED').length;
  const ongoing = courseSessions.filter(s => s.status === 'ONGOING').length;
  const completed = courseSessions.filter(s => s.status === 'COMPLETED').length;
  const cancelled = courseSessions.filter(s => s.status === 'CANCELED').length;
  
  const totalCapacity = courseSessions.reduce((sum, session) => sum + session.capacity, 0);
  const totalReserved = courseSessions.reduce((sum, session) => sum + session.reserved_count, 0);
  
  return {
    total,
    by_status: { scheduled, ongoing, completed, cancelled },
    capacity: {
      total: totalCapacity,
      reserved: totalReserved,
      available: totalCapacity - totalReserved,
      occupancy_rate: totalCapacity > 0 ? (totalReserved / totalCapacity) * 100 : 0
    }
  };
};

// 向下相容的預設匯出
export default courseSessions;