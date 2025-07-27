// 課程連結查找工具 - 根據課程名稱和Lesson編號從課程模組中獲取正確的連結
import { getCourseTemplates } from '@/data/courseTemplateUtils';

export interface CourseLinks {
  classroom: string | null;
  materials: string | null;
}

/**
 * 根據課程名稱和Lesson編號從課程模組中查找對應的虛擬教室連結和教材連結
 * @param courseName 課程名稱（如 "Pronunciation"）
 * @param lessonNumber Lesson編號（如 1, 2, 3...）
 * @returns 包含classroom和materials連結的物件
 */
export function getCourseLinksFromTemplate(courseName: string, lessonNumber: number): CourseLinks {
  console.log(`🔍 查找課程連結: ${courseName} - Lesson ${lessonNumber}`);
  
  try {
    // 1. 獲取所有課程模板
    const templates = getCourseTemplates();
    console.log(`📚 總共有 ${templates.length} 個課程模板`);
    
    // 2. 根據課程名稱查找對應的模板
    // 支援多種匹配方式：完全匹配、包含匹配、部分匹配
    const courseTemplate = templates.find(template => {
      const templateTitle = template.title.toLowerCase();
      const searchName = courseName.toLowerCase();
      
      // 完全匹配
      if (templateTitle === searchName) return true;
      
      // 包含匹配
      if (templateTitle.includes(searchName) || searchName.includes(templateTitle)) return true;
      
      // 去除空格後匹配
      const normalizedTemplate = templateTitle.replace(/\s+/g, '');
      const normalizedSearch = searchName.replace(/\s+/g, '');
      if (normalizedTemplate === normalizedSearch) return true;
      
      return false;
    });
    
    if (!courseTemplate) {
      console.warn(`❌ 未找到課程模板: ${courseName}`);
      console.log('可用的課程模板:', templates.map(t => t.title));
      return { classroom: null, materials: null };
    }
    
    console.log(`✅ 找到課程模板: ${courseTemplate.title}`);
    
    // 3. 在模板中查找對應的Session
    const session = courseTemplate.sessions.find(s => s.sessionNumber === lessonNumber);
    
    if (!session) {
      console.warn(`❌ 在課程 ${courseTemplate.title} 中未找到 Lesson ${lessonNumber}`);
      console.log('可用的Lesson:', courseTemplate.sessions.map(s => `Lesson ${s.sessionNumber}: ${s.title}`));
      return { classroom: null, materials: null };
    }
    
    console.log(`✅ 找到課程Session: Lesson ${session.sessionNumber} - ${session.title}`);
    
    // 4. 獲取連結，個別連結為空或佔位符時使用統一設定
    let classroom = session.virtualClassroomLink;
    let materials = session.materialLink;
    
    // 檢查是否為無效連結（空值）
    const isInvalidLink = (link: string | null | undefined): boolean => {
      return !link || link.trim() === '';
    };
    
    // 如果個別教室連結無效，使用統一設定
    if (isInvalidLink(classroom)) {
      classroom = courseTemplate.globalSettings?.defaultVirtualClassroomLink || null;
      if (classroom && !isInvalidLink(classroom)) {
        console.log(`📍 使用統一教室設定: ${classroom}`);
      } else {
        classroom = null;
        console.log(`⚠️ 教室連結無效，統一設定也無效`);
      }
    } else {
      console.log(`📍 使用個別教室設定: ${classroom}`);
    }
    
    // 如果個別教材連結無效，使用統一設定
    if (isInvalidLink(materials)) {
      materials = courseTemplate.globalSettings?.defaultMaterialLink || null;
      if (materials && !isInvalidLink(materials)) {
        console.log(`📄 使用統一教材設定: ${materials}`);
      } else {
        materials = null;
        console.log(`⚠️ 教材連結無效，統一設定也無效`);
      }
    } else {
      console.log(`📄 使用個別教材設定: ${materials}`);
    }
    
    console.log(`🔗 最終連結:`, {
      classroom: classroom || '無',
      materials: materials || '無'
    });
    
    return {
      classroom: classroom || null,
      materials: materials || null
    };
    
  } catch (error) {
    console.error('獲取課程連結時發生錯誤:', error);
    return { classroom: null, materials: null };
  }
}

/**
 * 從課程完整名稱中解析課程名稱和Lesson編號
 * @param fullCourseName 完整課程名稱 (如 "Pronunciation - Lesson 1 - Pronunciation of Consonant & Vowel")
 * @returns 解析後的課程名稱和Lesson編號
 */
export function parseCourseNameAndLesson(fullCourseName: string): { courseName: string; lessonNumber: number } | null {
  console.log(`🔍 解析課程名稱: ${fullCourseName}`);
  
  try {
    // 支援多種格式的解析
    const patterns = [
      // "Pronunciation - Lesson 1 - Pronunciation of Consonant & Vowel"
      /^(.+?)\s*-\s*Lesson\s+(\d+)\s*-\s*.+$/i,
      // "Pronunciation Lesson 1 - Pronunciation of Consonant & Vowel"  
      /^(.+?)\s+Lesson\s+(\d+)\s*-\s*.+$/i,
      // "Pronunciation - Lesson 1"
      /^(.+?)\s*-\s*Lesson\s+(\d+)$/i,
      // "Pronunciation Lesson 1"
      /^(.+?)\s+Lesson\s+(\d+)$/i
    ];
    
    for (const pattern of patterns) {
      const match = fullCourseName.match(pattern);
      if (match) {
        const courseName = match[1].trim();
        const lessonNumber = parseInt(match[2], 10);
        
        console.log(`✅ 解析成功: 課程=${courseName}, Lesson=${lessonNumber}`);
        return { courseName, lessonNumber };
      }
    }
    
    console.warn(`❌ 無法解析課程名稱: ${fullCourseName}`);
    return null;
    
  } catch (error) {
    console.error('解析課程名稱時發生錯誤:', error);
    return null;
  }
}

/**
 * 根據完整課程名稱獲取課程連結（組合函數）
 * @param fullCourseName 完整課程名稱
 * @returns 包含classroom和materials連結的物件
 */
export function getCourseLinksFromFullName(fullCourseName: string): CourseLinks {
  const parsed = parseCourseNameAndLesson(fullCourseName);
  
  if (!parsed) {
    console.warn(`無法解析課程名稱，返回空連結: ${fullCourseName}`);
    return { classroom: null, materials: null };
  }
  
  return getCourseLinksFromTemplate(parsed.courseName, parsed.lessonNumber);
}

/**
 * 驗證連結是否有效
 * @param link 要驗證的連結
 * @returns 是否為有效連結
 */
export function isValidLink(link: string | null): boolean {
  if (!link || link.trim() === '') return false;
  
  // 檢查是否為有效的URL或路徑
  try {
    // URL格式檢查
    if (link.startsWith('http://') || link.startsWith('https://')) {
      new URL(link);
      return true;
    }
    
    // 相對路徑檢查
    if (link.startsWith('/') || link.startsWith('./') || link.startsWith('../')) {
      return true;
    }
    
    // 檔案名稱檢查
    if (link.includes('.')) {
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * 為按鈕提供的整合函數：根據課程名稱和Lesson編號獲取有效的課程連結
 * @param courseName 課程名稱 (如 "Pronunciation")
 * @param lessonNumber Lesson編號 (如 1, 2, 3...)
 * @returns 可直接用於按鈕的連結物件
 */
export function getCourseLinksForLesson(courseName: string, lessonNumber: number): {
  classroom: string | null;
  materials: string | null;
  hasValidClassroom: boolean;
  hasValidMaterials: boolean;
} {
  const links = getCourseLinksFromTemplate(courseName, lessonNumber);
  
  return {
    classroom: isValidLink(links.classroom) ? links.classroom : null,
    materials: isValidLink(links.materials) ? links.materials : null,
    hasValidClassroom: isValidLink(links.classroom),
    hasValidMaterials: isValidLink(links.materials)
  };
}

/**
 * 為按鈕提供的整合函數：獲取有效的課程連結 (舊版本，用於向後兼容)
 * @param fullCourseName 完整課程名稱
 * @returns 可直接用於按鈕的連結物件
 */
export function getValidCourseLinks(fullCourseName: string): {
  classroom: string | null;
  materials: string | null;
  hasValidClassroom: boolean;
  hasValidMaterials: boolean;
} {
  const links = getCourseLinksFromFullName(fullCourseName);
  
  return {
    classroom: isValidLink(links.classroom) ? links.classroom : null,
    materials: isValidLink(links.materials) ? links.materials : null,
    hasValidClassroom: isValidLink(links.classroom),
    hasValidMaterials: isValidLink(links.materials)
  };
}

/**
 * 測試和調試函數
 */
export function debugCourseLinks() {
  console.log('\n=== 課程連結調試信息 ===');
  
  const templates = getCourseTemplates();
  console.log(`📚 總課程模板數: ${templates.length}`);
  
  templates.forEach(template => {
    console.log(`\n📖 課程: ${template.title}`);
    console.log(`🏷️ 分類: ${template.category}`);
    console.log(`📊 總Session數: ${template.totalSessions}`);
    console.log(`🌐 統一設定:`, template.globalSettings);
    
    template.sessions.forEach(session => {
      console.log(`  📝 Lesson ${session.sessionNumber}: ${session.title}`);
      console.log(`     🔗 虛擬教室: ${session.virtualClassroomLink || '(空白)'}`);
      console.log(`     📄 教材: ${session.materialLink || '(空白)'}`);
    });
  });
  
  // 測試解析功能
  const testCourses = [
    'Pronunciation - Lesson 1 - Pronunciation of Consonant & Vowel',
    'Basic English - Lesson 2 - Grammar Basics',
    'Business English Lesson 3'
  ];
  
  console.log('\n=== 解析測試 ===');
  testCourses.forEach(courseName => {
    const parsed = parseCourseNameAndLesson(courseName);
    console.log(`輸入: ${courseName}`);
    console.log(`解析: ${parsed ? `${parsed.courseName} / Lesson ${parsed.lessonNumber}` : '失敗'}`);
    
    if (parsed) {
      const links = getCourseLinksFromTemplate(parsed.courseName, parsed.lessonNumber);
      console.log(`連結: 教室=${links.classroom || '無'}, 教材=${links.materials || '無'}`);
    }
    console.log('---');
  });
}