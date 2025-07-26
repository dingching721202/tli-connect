// 課程模組 - 專注於課程架構建立
// 導入預設課程資料
import { courses } from './courses';

export interface CourseTemplate {
  id: string;
  title: string;
  description: string;
  category: '中文' | '英文' | '文化' | '商業' | '師資' | '其它';
  level: '不限' | '初級' | '中級' | '中高級' | '高級';
  totalSessions: number;
  capacity: number; // 滿班人數
  // 統一設定 - 作為所有課程的預設值
  globalSettings?: {
    defaultTitle?: string; // 統一課程標題模板，例如 "第{n}課"
    defaultVirtualClassroomLink?: string; // 統一虛擬教室連結
    defaultMaterialLink?: string; // 統一教材連結
  };
  sessions: CourseSession[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface CourseSession {
  sessionNumber: number;
  title: string;
  virtualClassroomLink?: string;
  materialLink?: string; // 可以是 URL 或 PDF 路徑
  // 如果這些欄位為空或未特別設定，則自動使用 globalSettings 中的預設值
  useGlobalTitle?: boolean; // 是否使用統一標題（預設 true）
  useGlobalClassroom?: boolean; // 是否使用統一虛擬教室（預設 true）
  useGlobalMaterial?: boolean; // 是否使用統一教材（預設 true）
}

// 獲取所有課程模板
export function getCourseTemplates(): CourseTemplate[] {
  if (typeof localStorage !== 'undefined') {
    const templates = localStorage.getItem('courseTemplates');
    
    // 檢查是否曾經初始化過課程模板
    const hasInitialized = localStorage.getItem('courseTemplatesInitialized');
    
    if (templates) {
      // 有模板數據，直接返回（包括空陣列，表示用戶已刪除所有模板）
      return JSON.parse(templates);
    } else if (!hasInitialized) {
      // 首次使用，從預設課程轉換模板並標記為已初始化
      const defaultTemplates = getDefaultCourseTemplates();
      
      localStorage.setItem('courseTemplates', JSON.stringify(defaultTemplates));
      localStorage.setItem('courseTemplatesInitialized', 'true');
      
      // 同步已發布的預設模板到預約系統
      defaultTemplates.forEach(template => {
        if (template.status === 'published') {
          syncTemplateToBookingSystem(template);
        }
      });
      
      return defaultTemplates;
    } else {
      // 已初始化但沒有模板數據，表示用戶已刪除所有模板
      return [];
    }
  }
  
  // 伺服器端或無 localStorage 時返回預設模板
  return getDefaultCourseTemplates();
}

// 根據 ID 獲取課程模板
export function getCourseTemplateById(id: string): CourseTemplate | null {
  const templates = getCourseTemplates();
  return templates.find(template => template.id === id) || null;
}

// 創建新課程模板
export function createCourseTemplate(template: Omit<CourseTemplate, 'id' | 'createdAt' | 'updatedAt'>): CourseTemplate {
  const newTemplate: CourseTemplate = {
    ...template,
    id: `template_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (typeof localStorage !== 'undefined') {
    const templates = getCourseTemplates();
    templates.push(newTemplate);
    localStorage.setItem('courseTemplates', JSON.stringify(templates));
  }

  return newTemplate;
}

// 更新課程模板
export function updateCourseTemplate(id: string, updates: Partial<CourseTemplate>): CourseTemplate | null {
  if (typeof localStorage !== 'undefined') {
    const templates = getCourseTemplates();
    const index = templates.findIndex(template => template.id === id);
    
    if (index === -1) return null;
    
    const oldTemplate = templates[index];
    const titleChanged = updates.title && updates.title !== oldTemplate.title;
    
    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('courseTemplates', JSON.stringify(templates));
    
    // 如果標題有變更，同步更新課程排程中的標題
    if (titleChanged) {
      console.log(`課程模板標題已更新: ${oldTemplate.title} → ${updates.title}`);
      // 動態導入以避免循環依賴
      import('./courseScheduleUtils').then(({ syncCourseScheduleTitles }) => {
        syncCourseScheduleTitles();
      }).catch(error => {
        console.error('同步課程排程標題失敗:', error);
      });
    }
    
    return templates[index];
  }
  
  return null;
}

// 刪除課程模板
export function deleteCourseTemplate(id: string): boolean {
  if (typeof localStorage !== 'undefined') {
    const templates = getCourseTemplates();
    const filteredTemplates = templates.filter(template => template.id !== id);
    
    if (filteredTemplates.length !== templates.length) {
      localStorage.setItem('courseTemplates', JSON.stringify(filteredTemplates));
      
      // 同時清理相關的課程排程和同步課程數據
      try {
        // 清理課程排程
        const schedules = JSON.parse(localStorage.getItem('courseSchedules') || '[]');
        const filteredSchedules = schedules.filter((schedule: { templateId: string }) => 
          schedule.templateId !== id
        );
        
        if (filteredSchedules.length !== schedules.length) {
          localStorage.setItem('courseSchedules', JSON.stringify(filteredSchedules));
          console.log(`清理了 ${schedules.length - filteredSchedules.length} 個相關的課程排程`);
        }
        
        // 清理同步的課程數據
        const courses = JSON.parse(localStorage.getItem('courses') || '[]');
        const filteredCourses = courses.filter((course: { template_id?: string; id: number | string }) => {
          // 根據 template_id 或推導的 template ID 過濾
          if (course.template_id && course.template_id === id) {
            return false;
          }
          // 檢查是否匹配推導的模板ID
          const templateId = `template_${course.id}`;
          return templateId !== id;
        });
        
        if (filteredCourses.length !== courses.length) {
          localStorage.setItem('courses', JSON.stringify(filteredCourses));
          console.log(`清理了 ${courses.length - filteredCourses.length} 個相關的同步課程數據`);
        }
      } catch (error) {
        console.error('清理相關數據時發生錯誤:', error);
      }
      
      // 觸發自定義事件通知其他組件數據已更新
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('courseTemplatesUpdated', { detail: { action: 'delete', templateId: id } }));
      }
      
      return true;
    }
  }
  
  return false;
}

// 複製課程模板
export function duplicateCourseTemplate(id: string): CourseTemplate | null {
  const template = getCourseTemplateById(id);
  if (!template) return null;
  
  return createCourseTemplate({
    ...template,
    title: `${template.title} (複製)`,
    status: 'draft'
  });
}

// 獲取已發布的課程模板
export function getPublishedCourseTemplates(): CourseTemplate[] {
  const templates = getCourseTemplates();
  return templates.filter(template => template.status === 'published');
}

// 將課程模板同步到預約系統的課程資料
export function syncTemplateToBookingSystem(template: CourseTemplate): void {
  if (typeof localStorage === 'undefined') return;
  
  // 獲取現有的課程資料
  const coursesStr = localStorage.getItem('courses');
  const existingCourses = coursesStr ? JSON.parse(coursesStr) : [];
  
  // 檢查是否已存在對應的課程（透過模板ID查找）
  const existingCourseIndex = existingCourses.findIndex((course: { template_id?: string; id: number | string }) => 
    course.template_id === template.id || course.id.toString() === template.id.replace('template_', '')
  );
  
  // 將模板轉換為預約系統的課程格式
  const bookingCourse = {
    id: existingCourseIndex >= 0 ? existingCourses[existingCourseIndex].id : parseInt(template.id.replace('template_', '')),
    template_id: template.id, // 記錄對應的模板ID
    created_at: template.createdAt,
    updated_at: template.updatedAt,
    title: template.title,
    description: template.description,
    teacher: getTeacherNameFromCategory(template.category),
    teacher_id: getTeacherIdFromCategory(template.category),
    duration: `${template.totalSessions}堂課`,
    price: getPriceFromCategory(template.category),
    original_price: getPriceFromCategory(template.category),
    currency: "TWD",
    cover_image_url: "/images/courses/default.jpg",
    categories: [template.category],
    language: getLanguageFromCategory(template.category),
    level: mapLevelToEnglish(template.level),
    max_students: 15,
    current_students: 0,
    rating: 4.5,
    total_sessions: template.totalSessions,
    session_duration: 90,
    location: "線上課程",
    is_active: template.status === 'published',
    status: template.status === 'published' ? 'active' : 'draft',
    tags: [template.category, template.level],
    prerequisites: "無特殊要求",
    materials: template.sessions.map(session => session.materialLink || `第${session.sessionNumber}課教材`).filter(Boolean),
    refund_policy: "課程開始前7天可申請退費",
    start_date: "2025-08-01T00:00:00+00:00",
    end_date: "2025-12-31T23:59:59+00:00",
    enrollment_deadline: "2025-07-30T23:59:59+00:00",
    recurring: true,
    recurring_type: "weekly",
    recurring_days: getRecurringDaysFromCategory(template.category),
    waitlist_enabled: true
  };
  
  if (existingCourseIndex >= 0) {
    // 更新現有課程
    existingCourses[existingCourseIndex] = { ...existingCourses[existingCourseIndex], ...bookingCourse };
  } else {
    // 添加新課程
    existingCourses.push(bookingCourse);
  }
  
  // 保存到 localStorage
  localStorage.setItem('courses', JSON.stringify(existingCourses));
}

// 根據分類獲取合適的教師名稱（使用教師管理系統）
function getTeacherNameFromCategory(category: string): string {
  try {
    const { teacherDataService } = require('./teacherData');
    const teachers = teacherDataService.getAllTeachers();
    
    // 根據分類映射到教師專長，找到對應的教師
    const categoryMap: { [key: string]: string[] } = {
      '中文': ['中文會話', '繁體字教學', '台灣文化'],
      '英文': ['商務英語', '簡報技巧', '談判英語'], 
      '文化': ['台灣文化', '中華文化'],
      '商業': ['商務英語', '職場溝通'],
      '師資': ['教學方法', '師資培訓'],
      '其它': []
    };
    
    const targetSkills = categoryMap[category] || [];
    const teacher = teachers.find(t => 
      t.status === 'active' && 
      targetSkills.some(skill => t.expertise.includes(skill))
    );
    
    return teacher?.name || '未指定教師';
  } catch (error) {
    console.error('獲取教師名稱失敗:', error);
    return '未指定教師';
  }
}

// 根據分類獲取合適的教師ID（使用教師管理系統）
function getTeacherIdFromCategory(category: string): number {
  try {
    const { teacherDataService } = require('./teacherData');
    const teachers = teacherDataService.getAllTeachers();
    
    // 根據分類映射到教師專長，找到對應的教師
    const categoryMap: { [key: string]: string[] } = {
      '中文': ['中文會話', '繁體字教學', '台灣文化'],
      '英文': ['商務英語', '簡報技巧', '談判英語'], 
      '文化': ['台灣文化', '中華文化'],
      '商業': ['商務英語', '職場溝通'],
      '師資': ['教學方法', '師資培訓'],
      '其它': []
    };
    
    const targetSkills = categoryMap[category] || [];
    const teacher = teachers.find(t => 
      t.status === 'active' && 
      targetSkills.some(skill => t.expertise.includes(skill))
    );
    
    return teacher?.id || 1; // 默認返回第一個教師的ID
  } catch (error) {
    console.error('獲取教師ID失敗:', error);
    return 1; // 默認返回ID 1
  }
}

// 根據分類獲取合適的價格
function getPriceFromCategory(category: string): number {
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

// 根據分類獲取合適的語言
function getLanguageFromCategory(category: string): string {
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

// 移除預約系統中的課程（當模板被刪除時）
export function removeCourseFromBookingSystem(templateId: string): void {
  if (typeof localStorage === 'undefined') return;
  
  const coursesStr = localStorage.getItem('courses');
  if (!coursesStr) return;
  
  const existingCourses = JSON.parse(coursesStr);
  const filteredCourses = existingCourses.filter((course: { template_id?: string; id: number | string }) => 
    course.template_id !== templateId && course.id.toString() !== templateId.replace('template_', '')
  );
  
  localStorage.setItem('courses', JSON.stringify(filteredCourses));
}

// 從預設課程轉換為課程模板
function getDefaultCourseTemplates(): CourseTemplate[] {
  return courses.map(course => {
    // 將課程分類映射到模板分類
    const mapCategory = (categories: string[]): '中文' | '英文' | '文化' | '商業' | '師資' | '其它' => {
      const firstCategory = categories[0] || '';
      if (firstCategory.includes('中文') || firstCategory.includes('華語')) return '中文';
      if (firstCategory.includes('英文') || firstCategory.includes('English') || 
          firstCategory.includes('商務英語') || firstCategory.includes('證照考試') || 
          firstCategory.includes('學術英語')) return '英文';
      if (firstCategory.includes('文化')) return '文化';
      if (firstCategory.includes('商業') || firstCategory.includes('職場')) return '商業';
      if (firstCategory.includes('師資') || firstCategory.includes('教學')) return '師資';
      return '其它';
    };

    // 根據課程總堂數生成課程內容
    const generateSessions = (totalSessions: number): CourseSession[] => {
      const sessions: CourseSession[] = [];
      for (let i = 1; i <= totalSessions; i++) {
        sessions.push({
          sessionNumber: i,
          title: `第${i}課`,
          virtualClassroomLink: 'https://meet.google.com/course-session',
          materialLink: ''
        });
      }
      return sessions;
    };

    // 將英文級別映射到中文級別
    const mapLevel = (level: string): '不限' | '初級' | '中級' | '中高級' | '高級' => {
      switch (level) {
        case 'beginner': return '初級';
        case 'intermediate': return '中級';
        case 'advanced': return '高級';
        default: return '不限';
      }
    };

    return {
      id: `template_${course.id}`,
      title: course.title,
      description: course.description,
      category: mapCategory(course.categories),
      level: mapLevel(course.level),
      totalSessions: course.total_sessions,
      capacity: 20, // 預設滿班人數
      sessions: generateSessions(course.total_sessions),
      status: 'published' as const,
      createdAt: course.created_at,
      updatedAt: course.updated_at
    };
  });
}