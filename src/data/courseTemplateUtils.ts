import { courseModules } from './courseModules';
import { courseSchedules } from './courseSchedules';
import { courseSessions } from './courseSessions';
import type { CourseModule, CourseSchedule, CourseSession } from '@/types/business';

// ========================================
// 課程範本工具函數 - MECE架構
// 提供課程模組、排程和節次之間的關聯操作
// ========================================

// 根據課程模組創建新的課程排程
export const createScheduleFromModule = (
  moduleId: number,
  scheduleData: Omit<CourseSchedule, 'id' | 'course_module_id' | 'created_at' | 'updated_at'>
): CourseSchedule | null => {
  const courseModule = courseModules.find(m => m.id === moduleId);
  if (!courseModule) return null;

  const newSchedule: CourseSchedule = {
    ...scheduleData,
    id: Math.max(...courseSchedules.map(s => s.id), 0) + 1,
    course_module_id: moduleId,
    title: scheduleData.title || courseModule.title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  courseSchedules.push(newSchedule);
  return newSchedule;
};

// 根據課程排程自動生成課程節次
export const generateSessionsFromSchedule = (scheduleId: number): CourseSession[] => {
  const schedule = courseSchedules.find(s => s.id === scheduleId);
  const courseModule = schedule ? courseModules.find(m => m.id === schedule.course_module_id) : null;
  
  if (!schedule || !courseModule) return [];

  const sessions: CourseSession[] = [];
  const startDate = new Date(schedule.start_date);
  const endDate = new Date(schedule.end_date);
  
  // 根據 recurring_pattern 生成節次
  if (schedule.recurring_pattern) {
    const { days_of_week, exceptions } = schedule.recurring_pattern;
    const currentDate = new Date(startDate);
    let sessionNumber = 1;

    while (currentDate <= endDate && sessionNumber <= courseModule.total_sessions) {
      const dayOfWeek = currentDate.getDay();
      
      if (days_of_week.includes(dayOfWeek)) {
        const dateString = currentDate.toISOString().split('T')[0];
        
        // 檢查是否為例外日期
        if (!exceptions.includes(dateString)) {
          const sessionId = Math.max(...courseSessions.map(s => s.id), 0) + sessionNumber;
          
          const session: CourseSession = {
            id: sessionId,
            course_schedule_id: scheduleId,
            session_number: sessionNumber,
            start_time: `${dateString}T${getTimeFromSchedule(schedule, 'start')}`,
            end_time: `${dateString}T${getTimeFromSchedule(schedule, 'end')}`,
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

      // 移到下一天
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  // 將生成的節次添加到 courseSessions 陣列
  sessions.forEach(session => courseSessions.push(session));
  
  return sessions;
};

// 從排程中提取時間（簡化版本，實際應該有更複雜的邏輯）
function getTimeFromSchedule(schedule: CourseSchedule, type: 'start' | 'end'): string {
  // 這裡應該根據課程排程的具體時間設定來決定
  // 暫時使用預設時間
  if (type === 'start') {
    return '10:00:00+08:00';
  } else {
    return '12:00:00+08:00';
  }
}

// 獲取課程模組的完整資訊（包含排程和節次）
export const getCourseModuleWithSchedules = (moduleId: number) => {
  const courseModule = courseModules.find(m => m.id === moduleId);
  if (!courseModule) return null;

  const schedules = courseSchedules.filter(s => s.course_module_id === moduleId);
  const schedulesWithSessions = schedules.map(schedule => ({
    ...schedule,
    sessions: courseSessions.filter(session => session.course_schedule_id === schedule.id)
  }));

  return {
    ...courseModule,
    schedules: schedulesWithSessions
  };
};

// 獲取課程排程的完整資訊（包含模組和節次）
export const getCourseScheduleWithDetails = (scheduleId: number) => {
  const schedule = courseSchedules.find(s => s.id === scheduleId);
  if (!schedule) return null;

  const courseModule = courseModules.find(m => m.id === schedule.course_module_id);
  const sessions = courseSessions.filter(s => s.course_schedule_id === scheduleId);

  return {
    ...schedule,
    courseModule,
    sessions
  };
};

// 複製課程模組（用於創建相似的課程）
export const duplicateCourseModule = (
  moduleId: number, 
  modifications: Partial<Omit<CourseModule, 'id' | 'created_at' | 'updated_at'>>
): CourseModule | null => {
  const originalModule = courseModules.find(m => m.id === moduleId);
  if (!originalModule) return null;

  const newModule: CourseModule = {
    ...originalModule,
    ...modifications,
    id: Math.max(...courseModules.map(m => m.id), 0) + 1,
    title: modifications.title || `${originalModule.title} (複製)`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  courseModules.push(newModule);
  return newModule;
};

// 檢查課程容量和可用性
export const checkCourseAvailability = (scheduleId: number) => {
  const schedule = courseSchedules.find(s => s.id === scheduleId);
  if (!schedule) return null;

  const sessions = courseSessions.filter(s => s.course_schedule_id === scheduleId);
  const totalCapacity = sessions.reduce((sum, session) => sum + session.capacity, 0);
  const totalReserved = sessions.reduce((sum, session) => sum + session.reserved_count, 0);

  return {
    schedule,
    total_capacity: totalCapacity,
    total_reserved: totalReserved,
    available_slots: totalCapacity - totalReserved,
    occupancy_rate: totalCapacity > 0 ? (totalReserved / totalCapacity) * 100 : 0,
    sessions_count: sessions.length,
    status: schedule.status
  };
};

// 獲取熱門課程（根據預約率）
export const getPopularCourses = (limit: number = 10) => {
  const coursesWithStats = courseSchedules.map(schedule => {
    const availability = checkCourseAvailability(schedule.id);
    return {
      ...schedule,
      ...availability
    };
  }).filter(course => course !== null);

  return coursesWithStats
    .sort((a, b) => b.occupancy_rate - a.occupancy_rate)
    .slice(0, limit);
};

// 搜尋課程（跨模組、排程搜尋）
export const searchCourses = (
  keyword: string,
  filters?: {
    language?: string;
    level?: string;
    teacher_id?: number;
    location_type?: string;
    price_range?: [number, number];
  }
) => {
  const searchTerm = keyword.toLowerCase();
  
  // 先在模組中搜尋
  const matchingModules = courseModules.filter(module => 
    module.title.toLowerCase().includes(searchTerm) ||
    module.description.toLowerCase().includes(searchTerm) ||
    module.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );

  // 獲取對應的排程
  const results = matchingModules.flatMap(module => {
    let schedules = courseSchedules.filter(s => s.course_module_id === module.id);

    // 應用篩選條件
    if (filters) {
      if (filters.language) {
        schedules = schedules.filter(() => module.language === filters.language);
      }
      if (filters.level) {
        schedules = schedules.filter(() => module.level === filters.level);
      }
      if (filters.teacher_id) {
        schedules = schedules.filter(s => s.teacher_id === filters.teacher_id);
      }
      if (filters.location_type) {
        schedules = schedules.filter(s => s.location.type === filters.location_type);
      }
      if (filters.price_range) {
        const [min, max] = filters.price_range;
        schedules = schedules.filter(s => s.price >= min && s.price <= max);
      }
    }

    return schedules.map(schedule => ({
      module,
      schedule,
      availability: checkCourseAvailability(schedule.id)
    }));
  });

  return results;
};

// 獲取所有課程範本
export const getCourseTemplates = () => {
  return courseModules.map(module => ({
    ...module,
    schedules: courseSchedules.filter(s => s.course_module_id === module.id)
  }));
};

// 獲取已發布的課程範本
export const getPublishedCourseTemplates = () => {
  const publishedScheduleModuleIds = new Set(
    courseSchedules
      .filter(s => s.status === 'PUBLISHED')
      .map(s => s.course_module_id)
  );
  
  return courseModules
    .filter(module => module.is_active && publishedScheduleModuleIds.has(module.id))
    .map(module => ({
      ...module,
      schedules: courseSchedules.filter(s => s.course_module_id === module.id && s.status === 'PUBLISHED')
    }));
};

// 課程統計
export const getCourseStatistics = () => {
  const totalModules = courseModules.length;
  const totalSchedules = courseSchedules.length;
  const totalSessions = courseSessions.length;
  
  const activeModules = courseModules.filter(m => m.is_active).length;
  const publishedSchedules = courseSchedules.filter(s => s.status === 'PUBLISHED').length;
  const scheduledSessions = courseSessions.filter(s => s.status === 'SCHEDULED').length;

  const languages = [...new Set(courseModules.map(m => m.language))];
  const levels = [...new Set(courseModules.map(m => m.level))];

  return {
    totals: {
      modules: totalModules,
      schedules: totalSchedules,
      sessions: totalSessions
    },
    active: {
      modules: activeModules,
      schedules: publishedSchedules,
      sessions: scheduledSessions
    },
    diversity: {
      languages: languages.length,
      levels: levels.length,
      available_languages: languages,
      available_levels: levels
    }
  };
};

// ========================================
// CRUD operations for CourseModule (Templates)
// ========================================

// 更新課程範本
export const updateCourseTemplate = (
  id: number,
  updates: Partial<Omit<CourseModule, 'id' | 'created_at' | 'updated_at'>>
): CourseModule | null => {
  const index = courseModules.findIndex(m => m.id === id);
  if (index === -1) return null;

  const updatedModule = {
    ...courseModules[index],
    ...updates,
    updated_at: new Date().toISOString()
  };

  courseModules[index] = updatedModule;
  return updatedModule;
};

// 創建課程範本
export const createCourseTemplate = (
  moduleData: Omit<CourseModule, 'id' | 'created_at' | 'updated_at'>
): CourseModule => {
  const newModule: CourseModule = {
    ...moduleData,
    id: Math.max(...courseModules.map(m => m.id), 0) + 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  courseModules.push(newModule);
  return newModule;
};

// 刪除課程範本
export const deleteCourseTemplate = (id: number): boolean => {
  const index = courseModules.findIndex(m => m.id === id);
  if (index === -1) return false;

  // 檢查是否有相關的課程排程，如果有則不允許刪除
  const relatedSchedules = courseSchedules.filter(s => s.course_module_id === id);
  if (relatedSchedules.length > 0) {
    console.warn(`Cannot delete course template ${id}: has ${relatedSchedules.length} related schedules`);
    return false;
  }

  courseModules.splice(index, 1);
  return true;
};

// 同步範本到預約系統
export const syncTemplateToBookingSystem = (templateId: number): boolean => {
  const template = courseModules.find(m => m.id === templateId);
  if (!template || !template.is_active) return false;

  // 簡化的同步邏輯 - 實際應該調用外部API
  console.log(`Syncing template ${templateId} (${template.title}) to booking system`);
  
  // 標記為已同步（這裡可以添加同步狀態字段）
  const updatedTemplate = {
    ...template,
    updated_at: new Date().toISOString()
  };

  const index = courseModules.findIndex(m => m.id === templateId);
  if (index !== -1) {
    courseModules[index] = updatedTemplate;
  }

  return true;
};

// 從預約系統移除課程
export const removeCourseFromBookingSystem = (templateId: number): boolean => {
  const template = courseModules.find(m => m.id === templateId);
  if (!template) return false;

  // 簡化的移除邏輯 - 實際應該調用外部API
  console.log(`Removing template ${templateId} (${template.title}) from booking system`);
  
  // 將狀態設為非活躍
  const updatedTemplate = {
    ...template,
    is_active: false,
    updated_at: new Date().toISOString()
  };

  const index = courseModules.findIndex(m => m.id === templateId);
  if (index !== -1) {
    courseModules[index] = updatedTemplate;
  }

  return true;
};

// 複製課程範本 (別名函數，指向現有的 duplicateCourseModule)
export const duplicateCourseTemplate = (
  templateId: number,
  modifications: Partial<Omit<CourseModule, 'id' | 'created_at' | 'updated_at'>>
): CourseModule | null => {
  return duplicateCourseModule(templateId, modifications);
};