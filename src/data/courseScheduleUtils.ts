import { courseSchedules } from './courseSchedules';
import { courseSessions } from './courseSessions';
import { courseModules } from './courseModules';
import type { CourseSchedule, CourseSession, CourseModule } from '@/types/business';

// ========================================
// 課程排程工具函數 - MECE架構
// 提供課程排程相關的實用函數
// ========================================

// 檢查排程衝突
export const checkScheduleConflict = (
  teacherId: number,
  startTime: string,
  endTime: string,
  excludeScheduleId?: number
): boolean => {
  const conflictingSchedules = courseSchedules.filter(schedule => 
    schedule.teacher_id === teacherId &&
    schedule.id !== excludeScheduleId &&
    schedule.status !== 'CANCELED'
  );

  // 簡化的衝突檢查邏輯
  return conflictingSchedules.some(schedule => {
    const sessions = courseSessions.filter(s => s.course_schedule_id === schedule.id);
    return sessions.some(session => {
      const sessionStart = new Date(session.start_time);
      const sessionEnd = new Date(session.end_time);
      const newStart = new Date(startTime);
      const newEnd = new Date(endTime);
      
      return (newStart < sessionEnd && newEnd > sessionStart);
    });
  });
};

// 獲取教師的可用時段
export const getTeacherAvailableSlots = (teacherId: number, date: string) => {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();
  
  // 獲取該教師在該天的所有排程
  const teacherSchedules = courseSchedules.filter(schedule => 
    schedule.teacher_id === teacherId &&
    schedule.status === 'PUBLISHED'
  );

  const busySlots: Array<{ start: string; end: string }> = [];
  
  teacherSchedules.forEach(schedule => {
    if (schedule.recurring_pattern?.days_of_week.includes(dayOfWeek)) {
      const sessions = courseSessions.filter(s => 
        s.course_schedule_id === schedule.id &&
        s.start_time.startsWith(date)
      );
      
      sessions.forEach(session => {
        busySlots.push({
          start: session.start_time,
          end: session.end_time
        });
      });
    }
  });

  return {
    date,
    teacher_id: teacherId,
    busy_slots: busySlots,
    available: busySlots.length === 0
  };
};

// 計算課程總收入
export const calculateScheduleRevenue = (scheduleId: number): number => {
  const schedule = courseSchedules.find(s => s.id === scheduleId);
  if (!schedule) return 0;
  
  return schedule.price * schedule.current_students;
};

// 獲取熱門時段統計
export const getPopularTimeSlots = () => {
  const timeSlotStats: Record<string, number> = {};
  
  courseSessions.forEach(session => {
    const startTime = new Date(session.start_time);
    const hour = startTime.getHours();
    const timeSlot = `${hour}:00-${hour + 2}:00`; // 假設每堂課2小時
    
    timeSlotStats[timeSlot] = (timeSlotStats[timeSlot] || 0) + session.reserved_count;
  });

  return Object.entries(timeSlotStats)
    .sort(([,a], [,b]) => b - a)
    .map(([timeSlot, bookings]) => ({ timeSlot, bookings }));
};

// 生成課程排程報告
export const generateScheduleReport = (scheduleId: number) => {
  const schedule = courseSchedules.find(s => s.id === scheduleId);
  if (!schedule) return null;

  const courseModule = courseModules.find(m => m.id === schedule.course_module_id);
  const sessions = courseSessions.filter(s => s.course_schedule_id === scheduleId);
  
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length;
  const upcomingSessions = sessions.filter(s => s.status === 'SCHEDULED').length;
  const totalCapacity = sessions.reduce((sum, s) => sum + s.capacity, 0);
  const totalReserved = sessions.reduce((sum, s) => sum + s.reserved_count, 0);
  
  return {
    schedule,
    courseModule,
    statistics: {
      total_sessions: totalSessions,
      completed_sessions: completedSessions,
      upcoming_sessions: upcomingSessions,
      progress_percentage: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
      total_capacity: totalCapacity,
      total_reserved: totalReserved,
      occupancy_rate: totalCapacity > 0 ? (totalReserved / totalCapacity) * 100 : 0,
      revenue: calculateScheduleRevenue(scheduleId)
    }
  };
};

// 複製課程排程
export const duplicateSchedule = (
  scheduleId: number,
  modifications: Partial<Omit<CourseSchedule, 'id' | 'created_at' | 'updated_at'>>
): CourseSchedule | null => {
  const originalSchedule = courseSchedules.find(s => s.id === scheduleId);
  if (!originalSchedule) return null;

  const newSchedule: CourseSchedule = {
    ...originalSchedule,
    ...modifications,
    id: Math.max(...courseSchedules.map(s => s.id), 0) + 1,
    title: modifications.title || `${originalSchedule.title} (複製)`,
    current_students: 0, // 新排程從0開始
    status: 'DRAFT', // 新排程預設為草稿狀態
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  courseSchedules.push(newSchedule);
  return newSchedule;
};

// 更新排程狀態
export const updateScheduleStatus = (
  scheduleId: number, 
  newStatus: CourseSchedule['status']
): boolean => {
  const schedule = courseSchedules.find(s => s.id === scheduleId);
  if (!schedule) return false;

  schedule.status = newStatus;
  schedule.updated_at = new Date().toISOString();
  return true;
};

// 計算排程完成度
export const calculateScheduleCompletion = (scheduleId: number): number => {
  const sessions = courseSessions.filter(s => s.course_schedule_id === scheduleId);
  if (sessions.length === 0) return 0;

  const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length;
  return (completedSessions / sessions.length) * 100;
};

// 獲取即將開始的課程
export const getUpcomingSchedules = (hours: number = 24): CourseSchedule[] => {
  const now = new Date();
  const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

  return courseSchedules.filter(schedule => {
    const sessions = courseSessions.filter(s => 
      s.course_schedule_id === schedule.id &&
      s.status === 'SCHEDULED'
    );

    return sessions.some(session => {
      const sessionStart = new Date(session.start_time);
      return sessionStart >= now && sessionStart <= futureTime;
    });
  });
};

// 獲取所有課程排程
export const getCourseSchedules = () => {
  return courseSchedules.map(schedule => ({
    ...schedule,
    courseModule: courseModules.find(m => m.id === schedule.course_module_id),
    sessions: courseSessions.filter(s => s.course_schedule_id === schedule.id)
  }));
};

// 獲取已發布的課程排程
export const getPublishedCourseSchedules = () => {
  return courseSchedules
    .filter(schedule => schedule.status === 'PUBLISHED')
    .map(schedule => ({
      ...schedule,
      courseModule: courseModules.find(m => m.id === schedule.course_module_id),
      sessions: courseSessions.filter(s => s.course_schedule_id === schedule.id)
    }));
};

// 計算課程結束日期
export const calculateEndDate = (
  startDate: string,
  totalSessions: number,
  recurringPattern: { type: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'; days_of_week: number[]; exceptions: string[] }
): string => {
  const start = new Date(startDate);
  const currentDate = new Date(start);
  let sessionCount = 0;
  
  while (sessionCount < totalSessions) {
    const dayOfWeek = currentDate.getDay();
    const dateString = currentDate.toISOString().split('T')[0];
    
    if (recurringPattern.days_of_week.includes(dayOfWeek) && 
        !recurringPattern.exceptions.includes(dateString)) {
      sessionCount++;
    }
    
    if (sessionCount < totalSessions) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  
  return currentDate.toISOString().split('T')[0];
};

// 生成排程節次
export const generateScheduledSessions = (
  scheduleId: number,
  startTime: string = '10:00:00+08:00',
  endTime: string = '12:00:00+08:00'
): CourseSession[] => {
  const schedule = courseSchedules.find(s => s.id === scheduleId);
  const courseModule = schedule ? courseModules.find(m => m.id === schedule.course_module_id) : null;
  
  if (!schedule || !courseModule) return [];

  const sessions: CourseSession[] = [];
  const startDate = new Date(schedule.start_date);
  const endDate = new Date(schedule.end_date);
  
  if (schedule.recurring_pattern) {
    const { days_of_week, exceptions } = schedule.recurring_pattern;
    const currentDate = new Date(startDate);
    let sessionNumber = 1;

    while (currentDate <= endDate && sessionNumber <= courseModule.total_sessions) {
      const dayOfWeek = currentDate.getDay();
      
      if (days_of_week.includes(dayOfWeek)) {
        const dateString = currentDate.toISOString().split('T')[0];
        
        if (!exceptions.includes(dateString)) {
          const sessionId = Math.max(...courseSessions.map(s => s.id), 0) + sessionNumber;
          
          const session: CourseSession = {
            id: sessionId,
            course_schedule_id: scheduleId,
            session_number: sessionNumber,
            start_time: `${dateString}T${startTime}`,
            end_time: `${dateString}T${endTime}`,
            capacity: schedule.max_students,
            reserved_count: 0,
            status: 'SCHEDULED',
            topic: `第${sessionNumber}堂課`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          sessions.push(session);
          sessionNumber++;
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return sessions;
};

// 計算教師工作負載
export const calculateTeacherWorkload = (teacherId: number, period: 'week' | 'month' = 'week') => {
  const now = new Date();
  const periodStart = new Date(now);
  
  if (period === 'week') {
    periodStart.setDate(now.getDate() - now.getDay());
  } else {
    periodStart.setDate(1);
  }
  
  const periodEnd = new Date(periodStart);
  if (period === 'week') {
    periodEnd.setDate(periodStart.getDate() + 6);
  } else {
    periodEnd.setMonth(periodStart.getMonth() + 1, 0);
  }

  const teacherSchedules = courseSchedules.filter(s => s.teacher_id === teacherId);
  let totalHours = 0;
  let totalSessions = 0;

  teacherSchedules.forEach(schedule => {
    const sessions = courseSessions.filter(s => {
      if (s.course_schedule_id !== schedule.id) return false;
      const sessionDate = new Date(s.start_time);
      return sessionDate >= periodStart && sessionDate <= periodEnd;
    });

    sessions.forEach(session => {
      const start = new Date(session.start_time);
      const end = new Date(session.end_time);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      totalHours += hours;
      totalSessions += 1;
    });
  });

  return {
    teacher_id: teacherId,
    period,
    period_start: periodStart.toISOString().split('T')[0],
    period_end: periodEnd.toISOString().split('T')[0],
    total_hours: totalHours,
    total_sessions: totalSessions,
    average_hours_per_day: totalHours / ((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))
  };
};

// ========================================
// CRUD operations for CourseSchedule
// ========================================

// 更新課程排程
export const updateCourseSchedule = (
  id: number,
  updates: Partial<Omit<CourseSchedule, 'id' | 'created_at' | 'updated_at'>>
): CourseSchedule | null => {
  const index = courseSchedules.findIndex(s => s.id === id);
  if (index === -1) return null;

  const updatedSchedule = {
    ...courseSchedules[index],
    ...updates,
    updated_at: new Date().toISOString()
  };

  courseSchedules[index] = updatedSchedule;
  return updatedSchedule;
};

// 創建課程排程
export const createCourseSchedule = (
  scheduleData: Omit<CourseSchedule, 'id' | 'created_at' | 'updated_at'>
): CourseSchedule => {
  const newSchedule: CourseSchedule = {
    ...scheduleData,
    id: Math.max(...courseSchedules.map(s => s.id), 0) + 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  courseSchedules.push(newSchedule);
  return newSchedule;
};

// 刪除課程排程
export const deleteCourseSchedule = (id: number): boolean => {
  const index = courseSchedules.findIndex(s => s.id === id);
  if (index === -1) return false;

  // 同時刪除相關的課程節次
  const sessionIndicesToRemove = courseSessions
    .map((session, idx) => session.course_schedule_id === id ? idx : -1)
    .filter(idx => idx !== -1)
    .reverse(); // 從後往前刪除以保持索引正確性

  sessionIndicesToRemove.forEach(idx => courseSessions.splice(idx, 1));
  
  courseSchedules.splice(index, 1);
  return true;
};

// 獲取課程排程完整標題
export const getCourseScheduleFullTitle = (scheduleId: number): string => {
  const schedule = courseSchedules.find(s => s.id === scheduleId);
  if (!schedule) return '';

  const courseModule = courseModules.find(m => m.id === schedule.course_module_id);
  const moduleTitle = courseModule ? courseModule.title : '未知課程';
  
  return `${moduleTitle} - ${schedule.title}`;
};

// 向下相容的預設匯出
export default {
  checkScheduleConflict,
  getTeacherAvailableSlots,
  calculateScheduleRevenue,
  getPopularTimeSlots,
  generateScheduleReport,
  duplicateSchedule,
  updateScheduleStatus,
  calculateScheduleCompletion,
  getUpcomingSchedules,
  calculateTeacherWorkload,
  updateCourseSchedule,
  createCourseSchedule,
  deleteCourseSchedule,
  getCourseScheduleFullTitle
};