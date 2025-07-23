// 課程管理模組 - 專注於課程本質建立
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
    return templates ? JSON.parse(templates) : [];
  }
  return [];
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