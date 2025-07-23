// 課程預約整合模組 - 連接課程管理與預約系統
import { getManagedCourses } from './courseUtils';
import { getTeachers } from './courseUtils';

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

// 從課程管理生成預約可用的課程時段
export function generateBookingSessions(): BookingCourseSession[] {
  const courses = getManagedCourses();
  const teachers = getTeachers();
  const sessions: BookingCourseSession[] = [];

  courses.forEach(course => {
    // 只處理已發布的課程
    if (course.status !== 'active') return;

    // 根據 ManagedCourse 的實際結構生成時段
    const courseSessions = generateCourseSessionsFromManagedCourse(course);
    
    courseSessions.forEach((session, index) => {
      // 優先使用排程中的教師ID，回退到課程的教師
      const teacherId = session.teacherId || course.instructor;
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

// 根據 ManagedCourse 生成課程時段（使用課程管理的完整邏輯）
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
  // 檢查課程是否有完整的排程配置
  if (course.globalSchedules && course.sessions && course.startDate && course.endDate) {
    // 使用課程管理的完整排程邏輯
    return generateDetailedCourseSessions(course);
  }
  
  // 回退到簡化邏輯（為了向後兼容）
  const { startDate, endDate, totalSessions, startTime, endTime, recurring, recurringDays } = course;
  
  if (!startDate || !endDate || !totalSessions) {
    return [];
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const generatedSessions: Array<{
    date: string;
    startTime: string;
    endTime: string;
    title: string;
    classroom: string;
    materials: string;
  }> = [];
  
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
      const dateStr = currentDate.toISOString().split('T')[0];
      
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

// 使用課程管理的完整排程邏輯（複製自 CourseManagement.tsx）
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
  const classDays = globalSchedules[0].weekdays.map((day: string) => parseInt(day));
  const excludeSet = new Set(excludeDates || []);
  const generatedSessions: Array<{
    date: string;
    startTime: string;
    endTime: string;
    title: string;
    classroom: string;
    materials: string;
    teacherId: string | number;
  }> = [];
  
  const currentDate = new Date(start);
  let sessionIndex = 0;
  
  while (currentDate <= end && sessionIndex < (totalSessions || 0)) {
    const dayOfWeek = currentDate.getDay();
    const dateStr = currentDate.toISOString().split('T')[0];
    
    if (classDays.includes(dayOfWeek) && !excludeSet.has(dateStr)) {
      const schedule = globalSchedules[0];
      const sessionContent = sessions[sessionIndex % sessions.length];
      
      generatedSessions.push({
        date: dateStr,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        title: sessionContent.title,
        classroom: sessionContent.classroom,
        materials: sessionContent.materials,
        teacherId: schedule.teacherId
      });
      
      sessionIndex++;
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return generatedSessions;
}

// 獲取課程篩選選項
export function getCourseFilters(): CourseFilter[] {
  const courses = getManagedCourses();
  const filters: CourseFilter[] = [];
  
  courses.forEach(course => {
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