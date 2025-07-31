import type { CourseModule } from '@/types/business';

// ========================================
// 課程模組資料 - MECE架構
// 定義課程範本和基本資訊，不包含排程相關資料
// ========================================

export const courseModules: CourseModule[] = [];

// ========================================
// 輔助函數
// ========================================

// 根據語言篩選課程模組
export const getCourseModulesByLanguage = (language: CourseModule['language']): CourseModule[] => {
  return courseModules.filter(module => module.language === language);
};

// 根據級別篩選課程模組
export const getCourseModulesByLevel = (level: CourseModule['level']): CourseModule[] => {
  return courseModules.filter(module => module.level === level);
};

// 根據分類篩選課程模組
export const getCourseModulesByCategory = (category: string): CourseModule[] => {
  return courseModules.filter(module => module.categories.includes(category));
};

// 搜尋課程模組
export const searchCourseModules = (keyword: string): CourseModule[] => {
  const searchTerm = keyword.toLowerCase();
  
  return courseModules.filter(module =>
    module.title.toLowerCase().includes(searchTerm) ||
    module.description.toLowerCase().includes(searchTerm) ||
    module.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
};

// 根據ID獲取課程模組
export const getCourseModuleById = (id: number): CourseModule | undefined => {
  return courseModules.find(module => module.id === id);
};

// 獲取活躍的課程模組
export const getActiveCourseModules = (): CourseModule[] => {
  return courseModules.filter(module => module.is_active);
};

// 課程模組統計
export const getCourseModuleStatistics = () => {
  const total = courseModules.length;
  const active = courseModules.filter(m => m.is_active).length;
  const published = courseModules.filter(m => m.status === 'published').length;
  const draft = courseModules.filter(m => m.status === 'draft').length;
  
  const languages = courseModules.reduce((acc, module) => {
    acc[module.language] = (acc[module.language] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const levels = courseModules.reduce((acc, module) => {
    acc[module.level] = (acc[module.level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    total,
    active,
    published,
    draft,
    by_language: languages,
    by_level: levels
  };
};

// 向下相容的預設匯出
export default courseModules;