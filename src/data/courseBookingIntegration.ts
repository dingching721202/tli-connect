// 課程預約整合模組 - 直接使用課程排程系統資料
import { getCourseTemplates } from './courseTemplateUtils';
import { getPublishedCourseSchedules, getCourseScheduleFullTitle } from './courseScheduleUtils';
import { getEnrollmentCountBySessionId } from '../utils/enrollmentUtils';

// Hash function and enrollment counting utilities imported from utils

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
  classroom_link?: string; // 教室連結
  material_link?: string;  // 教材連結
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

// 移除：不再需要 GeneratedSession 類型

// 從課程模組生成預約可用的課程時段
export function generateBookingSessions(): BookingCourseSession[] {
  // 優先使用課程排程系統的數據，這與時段管理使用相同的數據源
  const publishedSchedules = getPublishedCourseSchedules();
  const sessions: BookingCourseSession[] = [];

  console.log(`📅 generateBookingSessions: 找到 ${publishedSchedules.length} 個已發布的課程排程`);

  // 首先從課程排程生成時段
  publishedSchedules.forEach(schedule => {
    if (!schedule.generatedSessions || schedule.generatedSessions.length === 0) {
      console.log(`⚠️ 課程排程 ${schedule.templateTitle} 沒有生成的課程時段`);
      return;
    }

    console.log(`✅ 課程排程 ${schedule.templateTitle} 有 ${schedule.generatedSessions.length} 個時段`);
    schedule.generatedSessions.forEach(session => {
      
      sessions.push({
        id: session.id,
        courseId: schedule.templateId,
        courseTitle: getCourseScheduleFullTitle(schedule),
        sessionNumber: session.sessionNumber,
        sessionTitle: session.title,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        teacherId: session.teacherId,
        teacherName: session.teacherName,
        classroom: session.classroom_link || '線上教室',
        materials: session.material_link || '',
        classroom_link: session.classroom_link, // 教室連結
        material_link: session.material_link,   // 教材連結
        category: '課程管理',
        difficulty: '不限',
        capacity: schedule.capacity || 20, // 從排程獲取容量，回退為預設值
        currentEnrollments: getEnrollmentCountBySessionId(session.id),
        price: 0,
        status: 'available' as const
      });
    });
  });

  // 預約課程只來自已發布的課程排程，不使用其他資料來源

  console.log(`📊 generateBookingSessions 總結: 共生成 ${sessions.length} 個時段（全部來自已發布的課程排程）`);

  return sessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// 移除：課程排程系統已經自動處理時段生成，不需要額外的生成邏輯

// 獲取課程篩選選項（基於已發布的課程排程）
export function getCourseFilters(): CourseFilter[] {
  const publishedSchedules = getPublishedCourseSchedules();
  const templates = getCourseTemplates();
  const filters: CourseFilter[] = [];
  
  publishedSchedules.forEach(schedule => {
    // 查找對應的課程模板以獲取分類和難度資訊
    const template = templates.find(t => t.id === schedule.templateId);
    if (template) {
      filters.push({
        id: schedule.templateId,
        title: getCourseScheduleFullTitle(schedule),
        category: template.category || '其它',
        difficulty: template.level || '初級',
        selected: true // 預設全選
      });
    }
  });
  
  return filters;
}

// 移除：不再使用輔助函數，課程排程系統自己處理所有設定

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
  
  return `${session.courseTitle} ${difficulty} Lesson ${session.sessionNumber} ${session.startTime}-${session.endTime}`;
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