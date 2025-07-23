// 日曆排程模組 - 專注於課程時間安排
export interface CourseSchedule {
  id: string;
  templateId: string; // 關聯到 CourseTemplate
  templateTitle: string; // 冗余字段，便於顯示
  teacherId: string;
  teacherName: string; // 冗余字段，便於顯示
  timeSlots: TimeSlot[];
  startDate: string;
  endDate: string; // 自動計算
  excludeDates: string[];
  generatedSessions: ScheduledSession[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  id: string;
  weekdays: number[]; // 0-6 代表週日到週六
  startTime: string; // HH:MM 格式
  endTime: string; // HH:MM 格式
  teacherId: string;
}

export interface ScheduledSession {
  id: string;
  date: string;
  sessionNumber: number;
  title: string;
  startTime: string;
  endTime: string;
  teacherId: string;
  teacherName: string;
  virtualClassroomLink?: string;
  materialLink?: string;
}

// 獲取所有課程排程
export function getCourseSchedules(): CourseSchedule[] {
  if (typeof localStorage !== 'undefined') {
    const schedules = localStorage.getItem('courseSchedules');
    return schedules ? JSON.parse(schedules) : [];
  }
  return [];
}

// 根據 ID 獲取課程排程
export function getCourseScheduleById(id: string): CourseSchedule | null {
  const schedules = getCourseSchedules();
  return schedules.find(schedule => schedule.id === id) || null;
}

// 創建新課程排程
export function createCourseSchedule(schedule: Omit<CourseSchedule, 'id' | 'createdAt' | 'updatedAt'>): CourseSchedule {
  const newSchedule: CourseSchedule = {
    ...schedule,
    id: `schedule_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (typeof localStorage !== 'undefined') {
    const schedules = getCourseSchedules();
    schedules.push(newSchedule);
    localStorage.setItem('courseSchedules', JSON.stringify(schedules));
    
    // 觸發更新事件
    window.dispatchEvent(new CustomEvent('courseSchedulesUpdated'));
  }

  return newSchedule;
}

// 更新課程排程
export function updateCourseSchedule(id: string, updates: Partial<CourseSchedule>): CourseSchedule | null {
  if (typeof localStorage !== 'undefined') {
    const schedules = getCourseSchedules();
    const index = schedules.findIndex(schedule => schedule.id === id);
    
    if (index === -1) return null;
    
    schedules[index] = {
      ...schedules[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('courseSchedules', JSON.stringify(schedules));
    
    // 觸發更新事件
    window.dispatchEvent(new CustomEvent('courseSchedulesUpdated'));
    
    return schedules[index];
  }
  
  return null;
}

// 刪除課程排程
export function deleteCourseSchedule(id: string): boolean {
  if (typeof localStorage !== 'undefined') {
    const schedules = getCourseSchedules();
    const filteredSchedules = schedules.filter(schedule => schedule.id !== id);
    
    if (filteredSchedules.length !== schedules.length) {
      localStorage.setItem('courseSchedules', JSON.stringify(filteredSchedules));
      
      // 觸發更新事件
      window.dispatchEvent(new CustomEvent('courseSchedulesUpdated'));
      
      return true;
    }
  }
  
  return false;
}

// 生成課程時間表
export function generateScheduledSessions(
  templateId: string,
  templateTitle: string,
  totalSessions: number,
  sessions: { sessionNumber: number; title: string; virtualClassroomLink?: string; materialLink?: string }[],
  timeSlots: TimeSlot[],
  startDate: string,
  excludeDates: string[],
  teacherName: string
): ScheduledSession[] {
  if (!timeSlots.length || !startDate || !totalSessions) {
    return [];
  }

  const generatedSessions: ScheduledSession[] = [];
  const start = new Date(startDate);
  const excludeSet = new Set(excludeDates);
  let sessionCount = 0;
  // eslint-disable-next-line prefer-const
  let currentDate = new Date(start);

  while (sessionCount < totalSessions) {
    const dayOfWeek = currentDate.getDay();
    const dateStr = currentDate.toISOString().split('T')[0];

    // 檢查是否有符合的時間段且不在排除日期中
    for (const timeSlot of timeSlots) {
      if (timeSlot.weekdays.includes(dayOfWeek) && !excludeSet.has(dateStr) && sessionCount < totalSessions) {
        const sessionTemplate = sessions[sessionCount % sessions.length];
        
        generatedSessions.push({
          id: `session_${templateId}_${sessionCount + 1}`,
          date: dateStr,
          sessionNumber: sessionCount + 1,
          title: sessionTemplate.title,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          teacherId: timeSlot.teacherId,
          teacherName: teacherName,
          virtualClassroomLink: sessionTemplate.virtualClassroomLink,
          materialLink: sessionTemplate.materialLink
        });

        sessionCount++;
        break; // 一天只排一堂課
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return generatedSessions;
}

// 計算結束日期
export function calculateEndDate(
  startDate: string,
  totalSessions: number,
  timeSlots: TimeSlot[],
  excludeDates: string[] = []
): string {
  if (!timeSlots.length || !startDate || !totalSessions) {
    return '';
  }

  const start = new Date(startDate);
  const excludeSet = new Set(excludeDates);
  let sessionCount = 0;
  // eslint-disable-next-line prefer-const
  let currentDate = new Date(start);

  while (sessionCount < totalSessions) {
    const dayOfWeek = currentDate.getDay();
    const dateStr = currentDate.toISOString().split('T')[0];

    // 檢查是否有符合的時間段且不在排除日期中
    for (const timeSlot of timeSlots) {
      if (timeSlot.weekdays.includes(dayOfWeek) && !excludeSet.has(dateStr)) {
        sessionCount++;
        if (sessionCount >= totalSessions) {
          return dateStr;
        }
        break;
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return currentDate.toISOString().split('T')[0];
}

// 獲取已發布的課程排程
export function getPublishedCourseSchedules(): CourseSchedule[] {
  const schedules = getCourseSchedules();
  return schedules.filter(schedule => schedule.status === 'published');
}