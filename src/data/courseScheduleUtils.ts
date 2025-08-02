// 課程排程模組 - 專注於課程時間安排
export interface CourseSchedule {
  id: string;
  templateId: string; // 關聯到 CourseTemplate
  templateTitle: string; // 冗余字段，便於顯示
  seriesName?: string; // 系列名稱，用於區分不同班別（如"B班"）
  teacherId: string;
  teacherName: string; // 冗余字段，便於顯示
  capacity: number; // 從模板同步的滿班人數
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
  classroom_link?: string;
  material_link?: string;
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
    
    // 觸發更新事件，讓時段管理也能即時更新
    window.dispatchEvent(new CustomEvent('courseSchedulesUpdated'));
    window.dispatchEvent(new CustomEvent('timeslotUpdated'));
  }

  return newSchedule;
}

// 更新課程排程
export function updateCourseSchedule(id: string, updates: Partial<CourseSchedule>): CourseSchedule | null {
  if (typeof localStorage !== 'undefined') {
    const schedules = getCourseSchedules();
    const index = schedules.findIndex(schedule => schedule.id === id);
    
    if (index === -1) return null;
    
    const originalSchedule = schedules[index];
    schedules[index] = {
      ...originalSchedule,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('courseSchedules', JSON.stringify(schedules));
    
    // 觸發更新事件，讓時段管理也能即時更新
    window.dispatchEvent(new CustomEvent('courseSchedulesUpdated'));
    window.dispatchEvent(new CustomEvent('timeslotUpdated'));
    
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
      
      // 觸發更新事件，讓時段管理也能即時更新
      window.dispatchEvent(new CustomEvent('courseSchedulesUpdated'));
      window.dispatchEvent(new CustomEvent('timeslotUpdated'));
      
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
  sessions: { sessionNumber: number; title: string; classroom_link?: string; material_link?: string }[],
  timeSlots: TimeSlot[],
  startDate: string,
  excludeDates: string[],
  teacherName: string,
  globalSettings?: { default_classroom_link?: string; default_material_link?: string }
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
    const dateStr = currentDate.getFullYear() + '-' + 
      String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + 
      String(currentDate.getDate()).padStart(2, '0');

    // 檢查是否有符合的時間段且不在排除日期中
    for (const timeSlot of timeSlots) {
      if (timeSlot.weekdays.includes(dayOfWeek) && !excludeSet.has(dateStr) && sessionCount < totalSessions) {
        const sessionTemplate = sessions[sessionCount % sessions.length];
        
        // 使用 session 的連結，如果為空則回退到 globalSettings
        const classroom_link = sessionTemplate.classroom_link || globalSettings?.default_classroom_link;
        const material_link = sessionTemplate.material_link || globalSettings?.default_material_link;

        generatedSessions.push({
          id: `session_${templateId}_${sessionCount + 1}`,
          date: dateStr,
          sessionNumber: sessionCount + 1,
          title: sessionTemplate.title,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          teacherId: timeSlot.teacherId,
          teacherName: teacherName,
          classroom_link,
          material_link
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
    const dateStr = currentDate.getFullYear() + '-' + 
      String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + 
      String(currentDate.getDate()).padStart(2, '0');

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

  return currentDate.getFullYear() + '-' + 
    String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + 
    String(currentDate.getDate()).padStart(2, '0');
}

// 獲取已發布的課程排程
export function getPublishedCourseSchedules(): CourseSchedule[] {
  const schedules = getCourseSchedules();
  return schedules.filter(schedule => schedule.status === 'published');
}

// 同步課程排程中的模板標題（當課程模板名稱更新時調用）
export function syncCourseScheduleTitles(): void {
  if (typeof localStorage === 'undefined') return;
  
  try {
    // 動態導入以避免循環依賴
    import('./courseTemplateUtils').then(({ getCourseTemplates }) => {
      const schedules = getCourseSchedules();
      const templates = getCourseTemplates();
      let hasUpdates = false;
      
      const updatedSchedules = schedules.map(schedule => {
        const template = templates.find(t => t.id === schedule.templateId);
        if (template && template.title !== schedule.templateTitle) {
          console.log(`同步課程排程標題: ${schedule.templateTitle} → ${template.title}`);
          hasUpdates = true;
          return {
            ...schedule,
            templateTitle: template.title,
            updatedAt: new Date().toISOString()
          };
        }
        return schedule;
      });
      
      if (hasUpdates) {
        localStorage.setItem('courseSchedules', JSON.stringify(updatedSchedules));
        // 觸發更新事件，讓時段管理也能即時更新
        window.dispatchEvent(new CustomEvent('courseSchedulesUpdated'));
        window.dispatchEvent(new CustomEvent('timeslotUpdated'));
        console.log('課程排程標題同步完成');
      }
    });
  } catch (error) {
    console.error('同步課程排程標題時發生錯誤:', error);
  }
}

// 同步課程排程與課程模板（當模板有重要變更時調用）
export function syncCourseScheduleWithTemplate(templateId: string, updatedTemplate: { 
  id: string;
  title: string; 
  totalSessions: number; 
  sessions: { sessionNumber: number; title: string; classroom_link?: string; material_link?: string }[];
  capacity?: number;
  globalSettings?: { default_classroom_link?: string; default_material_link?: string };
}): void {
  if (typeof localStorage === 'undefined') return;
  
  try {
    const schedules = getCourseSchedules();
    const relatedSchedules = schedules.filter(schedule => schedule.templateId === templateId);
    
    if (relatedSchedules.length === 0) {
      console.log(`沒有找到模板 ${templateId} 的相關課程排程`);
      return;
    }
    
    console.log(`找到 ${relatedSchedules.length} 個相關的課程排程需要同步`);
    
    let hasUpdates = false;
    const updatedSchedules = schedules.map(schedule => {
      if (schedule.templateId !== templateId) {
        return schedule;
      }
      
      // 創建更新的排程
      const updatedSchedule = { ...schedule };
      let scheduleChanged = false;
      
      // 同步標題
      if (updatedTemplate.title !== schedule.templateTitle) {
        console.log(`同步排程標題: ${schedule.templateTitle} → ${updatedTemplate.title}`);
        updatedSchedule.templateTitle = updatedTemplate.title;
        scheduleChanged = true;
      }
      
      // 同步容量
      if (updatedTemplate.capacity && updatedTemplate.capacity !== schedule.capacity) {
        console.log(`同步排程容量: ${schedule.capacity} → ${updatedTemplate.capacity}`);
        updatedSchedule.capacity = updatedTemplate.capacity;
        scheduleChanged = true;
      }
      
      // 如果總堂數有變更，需要重新生成sessions
      if (updatedTemplate.totalSessions !== schedule.generatedSessions.length) {
        console.log(`總堂數已變更: ${schedule.generatedSessions.length} → ${updatedTemplate.totalSessions}，重新生成課程時間表`);
        
        const newSessions = generateScheduledSessions(
          schedule.templateId,
          updatedTemplate.title,
          updatedTemplate.totalSessions,
          updatedTemplate.sessions,
          schedule.timeSlots,
          schedule.startDate,
          schedule.excludeDates,
          schedule.teacherName,
          updatedTemplate.globalSettings
        );
        
        // 重新計算結束日期
        const newEndDate = calculateEndDate(
          schedule.startDate,
          updatedTemplate.totalSessions,
          schedule.timeSlots,
          schedule.excludeDates
        );
        
        updatedSchedule.generatedSessions = newSessions;
        updatedSchedule.endDate = newEndDate;
        scheduleChanged = true;
      } else if (updatedTemplate.sessions && 
                 JSON.stringify(updatedTemplate.sessions) !== JSON.stringify(schedule.generatedSessions.map(s => ({
                   sessionNumber: s.sessionNumber,
                   title: s.title,
                   classroom_link: s.classroom_link,
                   material_link: s.material_link
                 })))) {
        // 如果課程內容有變更，更新現有sessions的內容
        console.log('課程內容已變更，更新現有課程時間表內容');
        
        const updatedSessions = schedule.generatedSessions.map(session => {
          const templateSession = updatedTemplate.sessions.find(ts => ts.sessionNumber === session.sessionNumber);
          if (templateSession) {
            return {
              ...session,
              title: templateSession.title,
              classroom_link: templateSession.classroom_link,
              material_link: templateSession.material_link
            };
          }
          return session;
        });
        
        updatedSchedule.generatedSessions = updatedSessions;
        scheduleChanged = true;
      }
      
      if (scheduleChanged) {
        updatedSchedule.updatedAt = new Date().toISOString();
        hasUpdates = true;
      }
      
      return updatedSchedule;
    });
    
    if (hasUpdates) {
      localStorage.setItem('courseSchedules', JSON.stringify(updatedSchedules));
      // 觸發更新事件，讓時段管理也能即時更新
      window.dispatchEvent(new CustomEvent('courseSchedulesUpdated'));
      window.dispatchEvent(new CustomEvent('timeslotUpdated'));
      console.log('課程排程同步完成');
      
      // 如果有發布的排程，也需要通知時段管理更新
      const hasPublishedSchedules = relatedSchedules.some(schedule => schedule.status === 'published');
      if (hasPublishedSchedules) {
        window.dispatchEvent(new CustomEvent('bookingsUpdated'));
        console.log('已通知時段管理更新預約數據');
      }
    } else {
      console.log('沒有需要同步的變更');
    }
    
  } catch (error) {
    console.error('同步課程排程時發生錯誤:', error);
  }
}

// 根據模板ID和系列名稱生成完整的單元名稱
export function generateCourseTitle(templateTitle: string, seriesName?: string): string {
  if (seriesName && seriesName.trim()) {
    return `${templateTitle}-${seriesName.trim()}`;
  }
  return templateTitle;
}

// 獲取課程排程的完整標題（包含系列名稱）
export function getCourseScheduleFullTitle(schedule: CourseSchedule): string {
  return generateCourseTitle(schedule.templateTitle, schedule.seriesName);
}