// 課程預約整合模組 - 連接課程模組與預約系統
import { getManagedCourses, ManagedCourse } from './courseUtils';
import { getTeachers } from './courseUtils';
import { getCourseTemplates, CourseTemplate } from './courseTemplateUtils';
import { getPublishedCourseSchedules, getCourseScheduleFullTitle } from './courseScheduleUtils';

export interface BookingCourseSession {
  id: string;
  courseId: string;
  courseTitle: string;
  sessionNumber: number;
  sessionTitle: string;
  date: string;
  startTime: string;
  endTime: string;
  teacherId: string | number;
  teacherName: string;
  classroom: string;
  materials: string;
  category: string;
  difficulty: string;
  capacity: number;
  currentEnrollments: number;
  price: number;
  status: 'available' | 'full' | 'cancelled';
}

export interface CourseFilter {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  selected: boolean;
}

// 定義生成的課程時段類型
type GeneratedSession = {
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  classroom: string;
  materials: string;
  teacherId?: string | number;
};

// 從課程模組生成預約可用的課程時段
export function generateBookingSessions(): BookingCourseSession[] {
  const courses = getSyncedManagedCourses();
  const teachers = getTeachers();
  const sessions: BookingCourseSession[] = [];

  courses.forEach(course => {
    // 只處理已發布的課程
    if (course.status !== 'active') return;

    // 根據 ManagedCourse 的實際結構生成時段
    const courseSessions: GeneratedSession[] = generateCourseSessionsFromManagedCourse(course);
    
    courseSessions.forEach((session, index) => {
      // 優先使用排程中的教師ID（如果存在），回退到課程的教師
      const teacherId = session.teacherId || course.teacher;
      const teacher = teachers.find(t => t.id.toString() === teacherId.toString());
      
      sessions.push({
        id: `${course.id}_session_${index + 1}`,
        courseId: course.id,
        courseTitle: course.title,
        sessionNumber: index + 1,
        sessionTitle: session.title || `第${index + 1}課`,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        teacherId: teacherId,
        teacherName: teacher?.name || '未指定',
        classroom: session.classroom || course.location || 'Online',
        materials: session.materials || course.materials?.join(', ') || '',
        category: course.category,
        difficulty: course.difficulty,
        capacity: course.capacity,
        currentEnrollments: course.currentEnrollments,
        price: course.price,
        status: course.currentEnrollments >= course.capacity ? 'full' : 'available'
      });
    });
  });

  return sessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// 根據 ManagedCourse 生成課程時段（使用課程排程的完整邏輯）
function generateCourseSessionsFromManagedCourse(course: {
  id: string;
  startDate: string;
  endDate: string;
  totalSessions: number;
  startTime: string;
  endTime: string;
  recurring: boolean;
  recurringDays?: string[];
  location?: string;
  materials?: string[];
  globalSchedules?: Array<{
    weekdays: string[];
    startTime: string;
    endTime: string;
    teacherId: string;
  }>;
  sessions?: Array<{
    title: string;
    classroom: string;
    materials: string;
  }>;
  excludeDates?: string[];
}) {
  // 優先檢查課程是否有詳細的排程配置（來自課程排程模組）
  if (course.globalSchedules && course.sessions && course.startDate && course.endDate) {
    console.log(`為課程 ${course.id} 使用詳細排程配置，生成 ${course.totalSessions} 個時段`);
    // 使用課程排程模組的完整排程邏輯
    return generateDetailedCourseSessions({
      startDate: course.startDate,
      endDate: course.endDate,
      totalSessions: course.totalSessions,
      globalSchedules: course.globalSchedules,
      sessions: course.sessions,
      excludeDates: course.excludeDates || []
    });
  }
  
  // 回退到簡化邏輯（為了向後兼容沒有排程的課程）
  console.log(`為課程 ${course.id} 使用預設排程邏輯`);
  const { startDate, endDate, totalSessions, startTime, endTime, recurring, recurringDays } = course;
  
  if (!startDate || !endDate || !totalSessions) {
    return [];
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const generatedSessions: GeneratedSession[] = [];
  
  if (!recurring) {
    // 非重複課程，只在開始日期創建一個時段
    generatedSessions.push({
      date: startDate,
      startTime: startTime || '09:00',
      endTime: endTime || '17:00',
      title: '第1課',
      classroom: course.location || 'Online',
      materials: course.materials?.join(', ') || ''
    });
  } else {
    // 重複課程，根據 recurringDays 生成時段
    const classDays = recurringDays?.map(day => parseInt(day)) || [1, 3, 5]; // 預設週一、三、五
    const currentDate = new Date(start);
    let sessionIndex = 0;
    
    while (currentDate <= end && sessionIndex < totalSessions) {
      const dayOfWeek = currentDate.getDay();
      const dateStr = currentDate.getFullYear() + '-' + 
        String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(currentDate.getDate()).padStart(2, '0');
      
      if (classDays.includes(dayOfWeek)) {
        generatedSessions.push({
          date: dateStr,
          startTime: startTime || '09:00',
          endTime: endTime || '17:00',
          title: `第${sessionIndex + 1}課`,
          classroom: course.location || 'Online',
          materials: course.materials?.join(', ') || ''
        });
        
        sessionIndex++;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  
  return generatedSessions;
}

// 使用課程模組的完整排程邏輯（複製自 CourseManagement.tsx）
function generateDetailedCourseSessions(course: {
  startDate: string;
  endDate: string;
  totalSessions: number;
  globalSchedules: Array<{
    weekdays: string[];
    startTime: string;
    endTime: string;
    teacherId: string;
  }>;
  sessions: Array<{
    title: string;
    classroom: string;
    materials: string;
  }>;
  excludeDates?: string[];
}) {
  const { startDate, endDate, totalSessions, globalSchedules, sessions, excludeDates } = course;
  
  if (!startDate || !endDate || !globalSchedules?.[0]?.weekdays?.length || !sessions?.length) {
    return [];
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const excludeSet = new Set(excludeDates || []);
  const generatedSessions: GeneratedSession[] = [];
  
  // 處理多個排程時段（如果課程有多個課程排程）
  globalSchedules.forEach((schedule, scheduleIndex) => {
    const classDays = schedule.weekdays.map((day: string) => parseInt(day));
    const currentDate = new Date(start);
    let sessionIndex = 0;
    
    console.log(`處理排程 ${scheduleIndex + 1}/${globalSchedules.length}:`, {
      weekdays: classDays,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      teacherId: schedule.teacherId
    });
    
    // 為每個排程生成對應的課程時段
    while (currentDate <= end && sessionIndex < totalSessions) {
      const dayOfWeek = currentDate.getDay();
      const dateStr = currentDate.getFullYear() + '-' + 
        String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(currentDate.getDate()).padStart(2, '0');
      
      if (classDays.includes(dayOfWeek) && !excludeSet.has(dateStr)) {
        const sessionContent = sessions[sessionIndex % sessions.length];
        
        generatedSessions.push({
          date: dateStr,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          title: `${sessionContent.title}${globalSchedules.length > 1 ? ` (班別${scheduleIndex + 1})` : ''}`,
          classroom: sessionContent.classroom,
          materials: sessionContent.materials,
          teacherId: schedule.teacherId
        });
        
        sessionIndex++;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log(`排程 ${scheduleIndex + 1} 生成了 ${sessionIndex} 個時段`);
  });
  
  console.log(`總共生成 ${generatedSessions.length} 個課程時段`);
  return generatedSessions.sort((a, b) => {
    // 先按日期排序，再按時間排序
    const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });
}

// 獲取課程篩選選項（包含同步的課程模組資料）
export function getCourseFilters(): CourseFilter[] {
  // 優先從 localStorage 獲取已同步的課程資料
  const syncedCourses = getSyncedManagedCourses();
  const filters: CourseFilter[] = [];
  
  syncedCourses.forEach(course => {
    if (course.status === 'active') {
      filters.push({
        id: course.id!,
        title: course.title || '',
        category: course.category || '其它',
        difficulty: course.difficulty || 'beginner',
        selected: true // 預設全選
      });
    }
  });
  
  return filters;
}

// 獲取包含同步資料的管理課程（從課程模組和課程排程合併）
function getSyncedManagedCourses(): ManagedCourse[] {
  if (typeof localStorage === 'undefined') {
    return getManagedCourses(); // 伺服器端回退到預設資料
  }
  
  // 1. 從課程排程模組獲取已發布的排程（這些包含實際的課程安排）
  try {
    const schedules = getPublishedCourseSchedules();
    const templates = getCourseTemplates();
    const publishedTemplates = templates.filter((template: CourseTemplate) => template.status === 'published');
    
    console.log('獲取到', schedules.length, '個已發布的課程排程');
    console.log('獲取到', publishedTemplates.length, '個已發布的課程模板');
    
    const managedCourses: ManagedCourse[] = [];
    
    // 2. 優先處理有排程的課程（這些有實際的日曆安排）
    schedules.forEach((schedule) => {
      const template = templates.find(t => t.id === schedule.templateId);
      if (template && template.status === 'published') {
        // 每個排程創建一個 ManagedCourse，這樣多個排程就會顯示多個課程實例
        const managedCourse = {
          id: `${template.id}_${schedule.id}`, // 組合ID確保唯一性
          title: getCourseScheduleFullTitle(schedule), // 使用完整標題（包含系列名稱）
          description: template.description || '',
          teacher: schedule.teacherId,
          capacity: 15,
          price: getPriceFromTemplateCategory(template.category),
          currency: 'TWD',
          startDate: schedule.startDate,
          endDate: schedule.endDate,
          startTime: schedule.timeSlots[0]?.startTime || '10:00',
          endTime: schedule.timeSlots[0]?.endTime || '11:30',
          location: '線上課程',
          category: template.category || '其它',
          tags: [template.category, template.level],
          status: 'active' as const,
          enrollmentDeadline: new Date(new Date(schedule.startDate).getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          materials: template.sessions?.map((s) => s.materialLink).filter((link): link is string => Boolean(link)) || [],
          prerequisites: '無特殊要求',
          language: getLanguageFromTemplateCategory(template.category),
          difficulty: mapLevelToEnglish(template.level) as 'beginner' | 'intermediate' | 'advanced',
          totalSessions: template.totalSessions || 1,
          sessionDuration: 90,
          recurring: true,
          recurringType: 'weekly' as const,
          recurringDays: schedule.timeSlots[0]?.weekdays.map(day => day.toString()) || ['1', '3', '5'],
          maxEnrollments: 15,
          currentEnrollments: 0,
          waitlistEnabled: true,
          refundPolicy: '開課前24小時內不可退費',
          createdAt: schedule.createdAt,
          updatedAt: schedule.updatedAt
        } as ManagedCourse & {
          // 添加詳細的排程信息，這樣可以生成正確的日曆時段
          globalSchedules: Array<{
            weekdays: string[];
            startTime: string;
            endTime: string;
            teacherId: string;
          }>;
          sessions: Array<{
            title: string;
            classroom: string;
            materials: string;
          }>;
          excludeDates: string[];
        };
        
        // 添加額外的排程信息
        (managedCourse as unknown as { 
          globalSchedules: Array<{
            weekdays: string[];
            startTime: string;
            endTime: string;
            teacherId: string;
          }>;
          sessions: Array<{
            title: string;
            classroom: string;
            materials: string;
          }>;
          excludeDates: string[];
        }).globalSchedules = schedule.timeSlots.map(slot => ({
          weekdays: slot.weekdays.map(day => day.toString()),
          startTime: slot.startTime,
          endTime: slot.endTime,
          teacherId: slot.teacherId
        }));
        
        (managedCourse as unknown as { 
          sessions: Array<{
            title: string;
            classroom: string;
            materials: string;
          }>;
        }).sessions = template.sessions.map((session, index) => ({
          title: session.title,
          classroom: session.virtualClassroomLink || '線上教室',
          materials: session.materialLink || `第${index + 1}課教材`
        }));
        
        (managedCourse as unknown as { excludeDates: string[] }).excludeDates = schedule.excludeDates || [];
        
        managedCourses.push(managedCourse);
      }
    });
    
    // 3. 如果有已發布的模板但沒有對應的排程，也要顯示（用預設排程）
    publishedTemplates.forEach((template: CourseTemplate) => {
      const hasSchedule = schedules.some(s => s.templateId === template.id);
      if (!hasSchedule) {
        // 沒有排程的模板使用預設設定
        const defaultManagedCourse = {
          id: template.id?.replace('template_', '') || '',
          title: template.title || '',
          description: template.description || '',
          teacher: getTeacherNameFromTemplateCategory(template.category),
          capacity: 15,
          price: getPriceFromTemplateCategory(template.category),
          currency: 'TWD',
          startDate: '2025-08-01T00:00:00+00:00',
          endDate: '2025-12-31T23:59:59+00:00',
          startTime: getDefaultStartTime(template.category),
          endTime: getDefaultEndTime(template.category),
          location: '線上課程',
          category: template.category || '其它',
          tags: [template.category, template.level],
          status: 'active' as const,
          enrollmentDeadline: '2025-07-30T23:59:59+00:00',
          materials: template.sessions?.map((s) => s.materialLink).filter((link): link is string => Boolean(link)) || [],
          prerequisites: '無特殊要求',
          language: getLanguageFromTemplateCategory(template.category),
          difficulty: mapLevelToEnglish(template.level) as 'beginner' | 'intermediate' | 'advanced',
          totalSessions: template.totalSessions || 1,
          sessionDuration: 90,
          recurring: true,
          recurringType: 'weekly' as const,
          recurringDays: getRecurringDaysFromCategory(template.category),
          maxEnrollments: 15,
          currentEnrollments: 0,
          waitlistEnabled: true,
          refundPolicy: '課程開始前7天可申請退費',
          createdAt: template.createdAt || new Date().toISOString(),
          updatedAt: template.updatedAt || new Date().toISOString()
        } as ManagedCourse;
        
        // 添加預設的排程信息
        (defaultManagedCourse as unknown as { 
          globalSchedules: Array<{
            weekdays: string[];
            startTime: string;
            endTime: string;
            teacherId: string;
          }>;
        }).globalSchedules = [{
          weekdays: getRecurringDaysFromCategory(template.category),
          startTime: getDefaultStartTime(template.category),
          endTime: getDefaultEndTime(template.category),
          teacherId: getTeacherNameFromTemplateCategory(template.category)
        }];
        
        (defaultManagedCourse as unknown as { 
          sessions: Array<{
            title: string;
            classroom: string;
            materials: string;
          }>;
        }).sessions = template.sessions.map((session, index) => ({
          title: session.title,
          classroom: session.virtualClassroomLink || '線上教室',
          materials: session.materialLink || `第${index + 1}課教材`
        }));
        
        (defaultManagedCourse as unknown as { excludeDates: string[] }).excludeDates = [];
        
        managedCourses.push(defaultManagedCourse);
      }
    });
    
    console.log('總共生成', managedCourses.length, '個可預約課程');
    return managedCourses;
    
  } catch (error) {
    console.error('從課程模組獲取資料時發生錯誤:', error);
  }
  
  // 2. 如果課程模組沒有資料，嘗試從同步的課程資料獲取
  const syncedCoursesStr = localStorage.getItem('courses');
  if (syncedCoursesStr) {
    try {
      const syncedCourses = JSON.parse(syncedCoursesStr);
      console.log('從同步資料獲取到', syncedCourses.length, '個課程');
      
      // 將同步資料轉換為 ManagedCourse 格式
      return syncedCourses.map((course: {
        id: number | string;
        template_id?: string;
        title: string;
        description: string;
        teacher_id?: string;
        teacher?: string;
        max_students?: number;
        price?: number;
        currency?: string;
        start_date?: string;
        end_date?: string;
        location?: string;
        categories?: string[];
        tags?: string[];
        is_active?: boolean;
        status?: string;
        enrollment_deadline?: string;
        materials?: string[];
        prerequisites?: string;
        language?: string;
        level?: string;
        total_sessions?: number;
        session_duration?: number;
        recurring?: boolean;
        recurring_type?: string;
        recurring_days?: string[];
        current_students?: number;
        waitlist_enabled?: boolean;
        refund_policy?: string;
        created_at?: string;
        updated_at?: string;
      }) => ({
        id: course.id?.toString() || course.template_id?.replace('template_', '') || '',
        title: course.title || '',
        description: course.description || '',
        teacher: course.teacher_id || course.teacher || '',
        capacity: course.max_students || 15,
        price: course.price || 0,
        currency: course.currency || 'TWD',
        startDate: course.start_date || '',
        endDate: course.end_date || '',
        startTime: getDefaultStartTime(course.categories?.[0] || ''),
        endTime: getDefaultEndTime(course.categories?.[0] || ''),
        location: course.location || '線上課程',
        category: course.categories?.[0] || '其它',
        tags: course.tags || [],
        status: course.is_active && course.status === 'active' ? 'active' : 'draft',
        enrollmentDeadline: course.enrollment_deadline || '',
        materials: course.materials || [],
        prerequisites: course.prerequisites || '',
        language: course.language || 'chinese',
        difficulty: course.level || 'beginner',
        totalSessions: course.total_sessions || 1,
        sessionDuration: course.session_duration || 90,
        recurring: course.recurring || false,
        recurringType: course.recurring_type as 'weekly' | 'biweekly' | 'monthly' || 'weekly',
        recurringDays: course.recurring_days || [],
        maxEnrollments: course.max_students || 15,
        currentEnrollments: course.current_students || 0,
        waitlistEnabled: course.waitlist_enabled || false,
        refundPolicy: course.refund_policy || '',
        createdAt: course.created_at || new Date().toISOString(),
        updatedAt: course.updated_at || new Date().toISOString()
      }));
    } catch (error) {
      console.error('解析同步課程資料時發生錯誤:', error);
    }
  }
  
  // 3. 如果都沒有資料，回退到預設資料
  console.log('回退到預設課程資料');
  return getManagedCourses();
}

// 輔助函數 - 針對課程模組的資料映射
function getTeacherNameFromTemplateCategory(category: string): string {
  const teacherMap: { [key: string]: string } = {
    '中文': 'Lisa Chen',
    '英文': 'James Wilson', 
    '文化': 'Amy Wu',
    '商業': 'Michael Brown',
    '師資': 'Dr. Emily Zhang',
    '其它': 'Sarah Lee'
  };
  return teacherMap[category] || 'Sarah Lee';
}

function getPriceFromTemplateCategory(category: string): number {
  const priceMap: { [key: string]: number } = {
    '中文': 2800,
    '英文': 3200,
    '文化': 2500,
    '商業': 4000,
    '師資': 5000,
    '其它': 2500
  };
  return priceMap[category] || 2500;
}

function getLanguageFromTemplateCategory(category: string): string {
  const languageMap: { [key: string]: string } = {
    '中文': 'chinese',
    '英文': 'english',
    '文化': 'chinese',
    '商業': 'english',
    '師資': 'chinese',
    '其它': 'chinese'
  };
  return languageMap[category] || 'chinese';
}

// 將中文級別映射為英文級別  
function mapLevelToEnglish(level: string): string {
  const levelMap: { [key: string]: string } = {
    '初級': 'beginner',
    '中級': 'intermediate', 
    '中高級': 'intermediate',
    '高級': 'advanced',
    '不限': 'beginner'
  };
  return levelMap[level] || 'beginner';
}

// 根據分類獲取合適的重複日期
function getRecurringDaysFromCategory(category: string): string[] {
  const daysMap: { [key: string]: string[] } = {
    '中文': ['Monday', 'Wednesday', 'Friday'],
    '英文': ['Tuesday', 'Thursday'],
    '文化': ['Saturday'],
    '商業': ['Monday', 'Wednesday'],
    '師資': ['Tuesday', 'Thursday'],
    '其它': ['Saturday']
  };
  return daysMap[category] || ['Saturday'];
}

// 根據分類獲取預設開始時間
function getDefaultStartTime(category: string): string {
  const timeMap: { [key: string]: string } = {
    '商業': '19:00',
    '師資': '19:00', 
    '英文': '19:00',
    '文化': '14:00',
    '中文': '10:00',
    '其它': '10:00'
  };
  return timeMap[category] || '10:00';
}

// 根據分類獲取預設結束時間
function getDefaultEndTime(category: string): string {
  const timeMap: { [key: string]: string } = {
    '商業': '21:00',
    '師資': '21:00',
    '英文': '21:00', 
    '文化': '15:30',
    '中文': '11:30',
    '其它': '11:30'
  };
  return timeMap[category] || '11:30';
}

// 根據篩選條件過濾課程時段
export function filterBookingSessions(
  sessions: BookingCourseSession[], 
  selectedCourseIds: string[]
): BookingCourseSession[] {
  if (selectedCourseIds.length === 0) return sessions;
  
  return sessions.filter(session => 
    selectedCourseIds.includes(session.courseId)
  );
}

// 獲取特定日期的課程時段
export function getSessionsByDate(
  sessions: BookingCourseSession[], 
  date: string
): BookingCourseSession[] {
  return sessions.filter(session => session.date === date);
}

// 格式化課程顯示文字
export function formatSessionDisplay(session: BookingCourseSession): string {
  const difficultyMap = {
    'beginner': '初級',
    'intermediate': '中級', 
    'advanced': '高級'
  };
  
  const difficulty = difficultyMap[session.difficulty as keyof typeof difficultyMap] || session.difficulty;
  
  return `${session.courseTitle} ${difficulty} 第${session.sessionNumber}課 ${session.startTime}-${session.endTime}`;
}

// 獲取課程類別顏色
export function getCategoryColor(category: string): string {
  const colorMap: { [key: string]: string } = {
    '中文': 'bg-blue-100 text-blue-800',
    '英文': 'bg-green-100 text-green-800',
    '文化': 'bg-purple-100 text-purple-800',
    '商業': 'bg-orange-100 text-orange-800',
    '師資': 'bg-red-100 text-red-800',
    '其它': 'bg-gray-100 text-gray-800'
  };
  
  return colorMap[category] || colorMap['其它'];
}

// 獲取難度等級顏色
export function getDifficultyColor(difficulty: string): string {
  const colorMap: { [key: string]: string } = {
    'beginner': 'bg-green-100 text-green-800',
    'intermediate': 'bg-yellow-100 text-yellow-800',
    'advanced': 'bg-red-100 text-red-800'
  };
  
  return colorMap[difficulty] || colorMap['beginner'];
}