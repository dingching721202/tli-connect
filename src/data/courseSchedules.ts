import type { CourseSchedule } from '@/types/business';

// ========================================
// 課程排程資料 - MECE架構
// 管理具體的課程排程和時間安排
// ========================================

export const courseSchedules: CourseSchedule[] = [];

// ========================================
// 輔助函數
// ========================================

// 根據課程模組ID獲取排程
export const getSchedulesByModuleId = (moduleId: number): CourseSchedule[] => {
  return courseSchedules.filter(schedule => schedule.course_module_id === moduleId);
};

// 根據教師ID獲取排程
export const getSchedulesByTeacherId = (teacherId: number): CourseSchedule[] => {
  return courseSchedules.filter(schedule => schedule.teacher_id === teacherId);
};

// 根據狀態獲取排程
export const getSchedulesByStatus = (status: CourseSchedule['status']): CourseSchedule[] => {
  return courseSchedules.filter(schedule => schedule.status === status);
};

// 根據地點類型獲取排程
export const getSchedulesByLocationType = (type: 'ONLINE' | 'PHYSICAL' | 'HYBRID'): CourseSchedule[] => {
  return courseSchedules.filter(schedule => schedule.location.type === type);
};

// 根據日期範圍獲取排程
export const getSchedulesByDateRange = (startDate: string, endDate: string): CourseSchedule[] => {
  return courseSchedules.filter(schedule => 
    schedule.start_date >= startDate && schedule.end_date <= endDate
  );
};

// 根據ID獲取排程
export const getScheduleById = (id: number): CourseSchedule | undefined => {
  return courseSchedules.find(schedule => schedule.id === id);
};

// 搜尋課程排程
export const searchCourseSchedules = (keyword: string): CourseSchedule[] => {
  const searchTerm = keyword.toLowerCase();
  
  return courseSchedules.filter(schedule =>
    schedule.title.toLowerCase().includes(searchTerm) ||
    schedule.description?.toLowerCase().includes(searchTerm)
  );
};

// 課程排程統計
export const getCourseScheduleStatistics = () => {
  const total = courseSchedules.length;
  const published = courseSchedules.filter(s => s.status === 'PUBLISHED').length;
  const draft = courseSchedules.filter(s => s.status === 'DRAFT').length;
  const cancelled = courseSchedules.filter(s => s.status === 'CANCELLED').length;
  
  const locationTypes = courseSchedules.reduce((acc, schedule) => {
    acc[schedule.location.type] = (acc[schedule.location.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    total,
    by_status: { published, draft, cancelled },
    by_location_type: locationTypes
  };
};

// 向下相容的預設匯出
export default courseSchedules;