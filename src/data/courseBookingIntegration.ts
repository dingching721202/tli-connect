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

    // 生成課程時段
    const courseSessions = generateCourseSessions(course);
    
    courseSessions.forEach((session, index) => {
      const teacher = teachers.find(t => t.id.toString() === session.teacherId.toString());
      
      sessions.push({
        id: `${course.id}_session_${index + 1}`,
        courseId: course.id!,
        courseTitle: course.title || '',
        sessionNumber: index + 1,
        sessionTitle: session.title,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        teacherId: session.teacherId,
        teacherName: teacher?.name || '未指定',
        classroom: session.classroom,
        materials: session.materials,
        category: course.category || '其它',
        difficulty: course.difficulty || 'beginner',
        capacity: course.capacity || 20,
        currentEnrollments: course.currentEnrollments || 0,
        price: course.price || 0,
        status: (course.currentEnrollments || 0) >= (course.capacity || 20) ? 'full' : 'available'
      });
    });
  });

  return sessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// 生成課程時段的輔助函數（從CourseManagement複製並修改）
function generateCourseSessions(course: {
  startDate: string;
  endDate: string;
  totalSessions: number;
  globalSchedules: Array<{
    weekdays: string[];
    startTime: string;
    endTime: string;
    teacherId: string | number;
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
    title: string;
    startTime: string;
    endTime: string;
    teacherId: string | number;
    classroom: string;
    materials: string;
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
        title: sessionContent.title,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        teacherId: schedule.teacherId,
        classroom: sessionContent.classroom,
        materials: sessionContent.materials
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