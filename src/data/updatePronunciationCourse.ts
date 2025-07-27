// 更新Pronunciation課程的虛擬教室連結和教材連結
import { getCourseTemplates, updateCourseTemplate, createCourseTemplate, type CourseTemplate } from './courseTemplateUtils';

// Pronunciation課程的虛擬教室連結配置
const pronunciationClassroomLinks = {
  1: 'https://us06web.zoom.us/j/7212021983?pwd=Jhb69e1fj4rk6ShfjL9gBCmdFmFO7t.1',
  2: 'https://us06web.zoom.us/j/7212021984?pwd=Jhb69e1fj4rk6ShfjL9gBCmdFmFO7t.2',
  3: 'https://us06web.zoom.us/j/7212021985?pwd=Jhb69e1fj4rk6ShfjL9gBCmdFmFO7t.3',
  4: 'https://us06web.zoom.us/j/7212021986?pwd=Jhb69e1fj4rk6ShfjL9gBCmdFmFO7t.4',
  5: 'https://us06web.zoom.us/j/7212021987?pwd=Jhb69e1fj4rk6ShfjL9gBCmdFmFO7t.5',
  6: 'https://us06web.zoom.us/j/7212021988?pwd=Jhb69e1fj4rk6ShfjL9gBCmdFmFO7t.6',
  7: 'https://us06web.zoom.us/j/7212021989?pwd=Jhb69e1fj4rk6ShfjL9gBCmdFmFO7t.7',
  8: 'https://us06web.zoom.us/j/7212021990?pwd=Jhb69e1fj4rk6ShfjL9gBCmdFmFO7t.8'
};

// Pronunciation課程的教材連結配置
const pronunciationMaterialLinks = {
  1: '/materials/pronunciation/lesson1-consonant-vowel.pdf',
  2: '/materials/pronunciation/lesson2-stress-rhythm.pdf', 
  3: '/materials/pronunciation/lesson3-intonation.pdf',
  4: '/materials/pronunciation/lesson4-connected-speech.pdf',
  5: '/materials/pronunciation/lesson5-difficult-sounds.pdf',
  6: '/materials/pronunciation/lesson6-word-pronunciation.pdf',
  7: '/materials/pronunciation/lesson7-sentence-pronunciation.pdf',
  8: '/materials/pronunciation/lesson8-final-practice.pdf'
};

export function createOrUpdatePronunciationCourse(): CourseTemplate {
  const templates = getCourseTemplates();
  
  // 查找是否已存在Pronunciation課程模板
  const pronunciationTemplate = templates.find(t => 
    t.title.toLowerCase().includes('pronunciation') || 
    t.title.includes('發音')
  );
  
  // 創建Pronunciation課程的Session配置
  const pronunciationSessions = [
    {
      sessionNumber: 1,
      title: 'Lesson 1 - Pronunciation of Consonant & Vowel',
      virtualClassroomLink: pronunciationClassroomLinks[1],
      materialLink: pronunciationMaterialLinks[1]
    },
    {
      sessionNumber: 2,
      title: 'Lesson 2 - Stress and Rhythm',
      virtualClassroomLink: pronunciationClassroomLinks[2],
      materialLink: pronunciationMaterialLinks[2]
    },
    {
      sessionNumber: 3,
      title: 'Lesson 3 - Intonation Patterns',
      virtualClassroomLink: pronunciationClassroomLinks[3],
      materialLink: pronunciationMaterialLinks[3]
    },
    {
      sessionNumber: 4,
      title: 'Lesson 4 - Connected Speech',
      virtualClassroomLink: pronunciationClassroomLinks[4],
      materialLink: pronunciationMaterialLinks[4]
    },
    {
      sessionNumber: 5,
      title: 'Lesson 5 - Difficult Sounds',
      virtualClassroomLink: pronunciationClassroomLinks[5],
      materialLink: pronunciationMaterialLinks[5]
    },
    {
      sessionNumber: 6,
      title: 'Lesson 6 - Word Pronunciation',
      virtualClassroomLink: pronunciationClassroomLinks[6],
      materialLink: pronunciationMaterialLinks[6]
    },
    {
      sessionNumber: 7,
      title: 'Lesson 7 - Sentence Pronunciation',
      virtualClassroomLink: pronunciationClassroomLinks[7],
      materialLink: pronunciationMaterialLinks[7]
    },
    {
      sessionNumber: 8,
      title: 'Lesson 8 - Final Practice',
      virtualClassroomLink: pronunciationClassroomLinks[8],
      materialLink: pronunciationMaterialLinks[8]
    }
  ];
  
  if (pronunciationTemplate) {
    // 更新現有模板
    console.log(`更新現有 Pronunciation 課程模板: ${pronunciationTemplate.title}`);
    
    const updatedTemplate = updateCourseTemplate(pronunciationTemplate.id, {
      title: 'Pronunciation',
      description: '英語發音訓練課程，專注於子音母音發音、重音節奏、語調等技巧',
      category: '英文',
      level: '初級',
      totalSessions: 8,
      capacity: 15,
      sessions: pronunciationSessions,
      status: 'published'
    });
    
    if (!updatedTemplate) {
      throw new Error('更新 Pronunciation 課程模板失敗');
    }
    
    return updatedTemplate;
  } else {
    // 創建新模板
    console.log('創建新的 Pronunciation 課程模板');
    
    const newTemplate = createCourseTemplate({
      title: 'Pronunciation',
      description: '英語發音訓練課程，專注於子音母音發音、重音節奏、語調等技巧',
      category: '英文',
      level: '初級',
      totalSessions: 8,
      capacity: 15,
      sessions: pronunciationSessions,
      status: 'published'
    });
    
    return newTemplate;
  }
}

// 更新其他課程的虛擬教室連結（可以根據需要擴展）
export function updateCourseClassroomLinks() {
  const templates = getCourseTemplates();
  
  // 可以為其他課程設置特定的虛擬教室連結
  const courseConfigs = {
    '基礎英文會話': {
      baseZoomUrl: 'https://us06web.zoom.us/j/8888888888?pwd=BasicEnglishConversation',
      materialBasePath: '/materials/basic-english'
    },
    '商務英語進階': {
      baseZoomUrl: 'https://us06web.zoom.us/j/9999999999?pwd=BusinessEnglishAdvanced', 
      materialBasePath: '/materials/business-english'
    }
    // 可以繼續添加其他課程
  };
  
  templates.forEach(template => {
    const config = courseConfigs[template.title as keyof typeof courseConfigs];
    if (config) {
      // 為每個session設置連結
      const updatedSessions = template.sessions.map((session, index) => ({
        ...session,
        virtualClassroomLink: `${config.baseZoomUrl}.${session.sessionNumber}`,
        materialLink: session.materialLink || `${config.materialBasePath}/lesson${session.sessionNumber}.pdf`
      }));
      
      updateCourseTemplate(template.id, {
        sessions: updatedSessions
      });
      
      console.log(`已更新課程 ${template.title} 的虛擬教室連結`);
    }
  });
}

// 驗證課程連結配置
export function validateCourseLinks() {
  const templates = getCourseTemplates();
  const reports: string[] = [];
  
  templates.forEach(template => {
    reports.push(`\n=== ${template.title} ===`);
    reports.push(`狀態: ${template.status}`);
    reports.push(`總課程數: ${template.totalSessions}`);
    reports.push(`實際Session數: ${template.sessions.length}`);
    
    template.sessions.forEach(session => {
      reports.push(`  Lesson ${session.sessionNumber}: ${session.title}`);
      reports.push(`    虛擬教室: ${session.virtualClassroomLink || '未設置'}`);
      reports.push(`    教材連結: ${session.materialLink || '未設置'}`);
    });
  });
  
  console.log('課程連結配置報告:', reports.join('\n'));
  return reports.join('\n');
}