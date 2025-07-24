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
}

// 獲取所有課程模板
export function getCourseTemplates(): CourseTemplate[] {
  if (typeof localStorage !== 'undefined') {
    const templates = localStorage.getItem('courseTemplates');
    const userTemplates = templates ? JSON.parse(templates) : [];
    
    // 如果沒有用戶創建的模板，返回從預設課程轉換的模板
    if (userTemplates.length === 0) {
      return getDefaultCourseTemplates();
    }
    
    return userTemplates;
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
    
    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('courseTemplates', JSON.stringify(templates));
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
    const generateSessions = (totalSessions: number, title: string): CourseSession[] => {
      const sessions: CourseSession[] = [];
      for (let i = 1; i <= totalSessions; i++) {
        sessions.push({
          sessionNumber: i,
          title: `第${i}課`,
          description: `${title} - 第${i}堂課程內容`,
          duration: course.session_duration,
          objectives: [`掌握第${i}課的核心概念`, `完成第${i}課的實踐練習`],
          materials: course.materials || [],
          homework: `第${i}課課後練習`,
          virtualClassroomLink: 'https://meet.google.com/course-session',
          materialLink: ''
        });
      }
      return sessions;
    };

    return {
      id: `template_${course.id}`,
      title: course.title,
      description: course.description,
      category: mapCategory(course.categories),
      difficulty: course.level as 'beginner' | 'intermediate' | 'advanced',
      language: course.language as 'chinese' | 'english' | 'japanese',
      totalSessions: course.total_sessions,
      sessionDuration: course.session_duration,
      prerequisites: course.prerequisites || '無特殊要求',
      targetAudience: course.level === 'beginner' ? '初學者' : course.level === 'intermediate' ? '中級學習者' : '高級學習者',
      learningObjectives: [
        `提升${course.language === 'chinese' ? '中文' : course.language === 'english' ? '英文' : '日語'}能力`,
        '增強實際溝通技巧',
        '建立自信的語言表達能力'
      ],
      teachingMethod: '互動式教學，結合理論與實踐',
      assessmentMethod: '平時表現 40% + 期中測驗 30% + 期末專案 30%',
      sessions: generateSessions(course.total_sessions, course.title),
      status: 'published' as const,
      createdAt: course.created_at,
      updatedAt: course.updated_at
    };
  });
}