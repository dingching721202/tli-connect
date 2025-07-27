// 更新Pronunciation課程的腳本
// 在瀏覽器控制台中執行此腳本

// 模擬localStorage（如果需要）
if (typeof localStorage === 'undefined') {
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  };
}

// 課程模板更新函數
function updatePronunciationCourse() {
  // 獲取現有課程模板
  const existingTemplates = JSON.parse(localStorage.getItem('courseTemplates') || '[]');
  
  // 查找Pronunciation課程
  let pronunciationTemplate = existingTemplates.find(t => 
    t.title.toLowerCase().includes('pronunciation') || 
    t.title.includes('發音')
  );
  
  // Pronunciation課程的Session配置
  const pronunciationSessions = [
    {
      sessionNumber: 1,
      title: 'Lesson 1 - Pronunciation of Consonant & Vowel',
      virtualClassroomLink: 'https://us06web.zoom.us/j/7212021983?pwd=Jhb69e1fj4rk6ShfjL9gBCmdFmFO7t.1',
      materialLink: '/materials/pronunciation/lesson1-consonant-vowel.pdf',
      useGlobalTitle: false,
      useGlobalClassroom: false,
      useGlobalMaterial: false
    },
    {
      sessionNumber: 2,
      title: 'Lesson 2 - Stress and Rhythm',
      virtualClassroomLink: 'https://us06web.zoom.us/j/7212021984?pwd=Jhb69e1fj4rk6ShfjL9gBCmdFmFO7t.2',
      materialLink: '/materials/pronunciation/lesson2-stress-rhythm.pdf',
      useGlobalTitle: false,
      useGlobalClassroom: false,
      useGlobalMaterial: false
    },
    {
      sessionNumber: 3,
      title: 'Lesson 3 - Intonation Patterns',
      virtualClassroomLink: 'https://us06web.zoom.us/j/7212021985?pwd=Jhb69e1fj4rk6ShfjL9gBCmdFmFO7t.3',
      materialLink: '/materials/pronunciation/lesson3-intonation.pdf',
      useGlobalTitle: false,
      useGlobalClassroom: false,
      useGlobalMaterial: false
    },
    {
      sessionNumber: 4,
      title: 'Lesson 4 - Connected Speech',
      virtualClassroomLink: 'https://us06web.zoom.us/j/7212021986?pwd=Jhb69e1fj4rk6ShfjL9gBCmdFmFO7t.4',
      materialLink: '/materials/pronunciation/lesson4-connected-speech.pdf',
      useGlobalTitle: false,
      useGlobalClassroom: false,
      useGlobalMaterial: false
    },
    {
      sessionNumber: 5,
      title: 'Lesson 5 - Difficult Sounds',
      virtualClassroomLink: 'https://us06web.zoom.us/j/7212021987?pwd=Jhb69e1fj4rk6ShfjL9gBCmdFmFO7t.5',
      materialLink: '/materials/pronunciation/lesson5-difficult-sounds.pdf',
      useGlobalTitle: false,
      useGlobalClassroom: false,
      useGlobalMaterial: false
    },
    {
      sessionNumber: 6,
      title: 'Lesson 6 - Word Pronunciation',
      virtualClassroomLink: 'https://us06web.zoom.us/j/7212021988?pwd=Jhb69e1fj4rk6ShfjL9gBCmdFmFO7t.6',
      materialLink: '/materials/pronunciation/lesson6-word-pronunciation.pdf',
      useGlobalTitle: false,
      useGlobalClassroom: false,
      useGlobalMaterial: false
    },
    {
      sessionNumber: 7,
      title: 'Lesson 7 - Sentence Pronunciation',
      virtualClassroomLink: 'https://us06web.zoom.us/j/7212021989?pwd=Jhb69e1fj4rk6ShfjL9gBCmdFmFO7t.7',
      materialLink: '/materials/pronunciation/lesson7-sentence-pronunciation.pdf',
      useGlobalTitle: false,
      useGlobalClassroom: false,
      useGlobalMaterial: false
    },
    {
      sessionNumber: 8,
      title: 'Lesson 8 - Final Practice',
      virtualClassroomLink: 'https://us06web.zoom.us/j/7212021990?pwd=Jhb69e1fj4rk6ShfjL9gBCmdFmFO7t.8',
      materialLink: '/materials/pronunciation/lesson8-final-practice.pdf',
      useGlobalTitle: false,
      useGlobalClassroom: false,
      useGlobalMaterial: false
    }
  ];
  
  if (pronunciationTemplate) {
    // 更新現有模板
    console.log('更新現有 Pronunciation 課程模板:', pronunciationTemplate.title);
    
    pronunciationTemplate.title = 'Pronunciation';
    pronunciationTemplate.description = '英語發音訓練課程，專注於子音母音發音、重音節奏、語調等技巧';
    pronunciationTemplate.category = '英文';
    pronunciationTemplate.level = '初級';
    pronunciationTemplate.totalSessions = 8;
    pronunciationTemplate.capacity = 15;
    pronunciationTemplate.sessions = pronunciationSessions;
    pronunciationTemplate.status = 'published';
    pronunciationTemplate.updatedAt = new Date().toISOString();
  } else {
    // 創建新模板
    console.log('創建新的 Pronunciation 課程模板');
    
    pronunciationTemplate = {
      id: `template_${Date.now()}`,
      title: 'Pronunciation',
      description: '英語發音訓練課程，專注於子音母音發音、重音節奏、語調等技巧',
      category: '英文',
      level: '初級',
      totalSessions: 8,
      capacity: 15,
      sessions: pronunciationSessions,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    existingTemplates.push(pronunciationTemplate);
  }
  
  // 保存到localStorage
  localStorage.setItem('courseTemplates', JSON.stringify(existingTemplates));
  
  console.log('✅ Pronunciation 課程模板已更新');
  console.log('課程配置:', pronunciationTemplate);
  
  // 觸發課程排程更新事件
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('courseTemplatesUpdated'));
  }
  
  return pronunciationTemplate;
}

// 驗證更新結果
function validateUpdate() {
  const templates = JSON.parse(localStorage.getItem('courseTemplates') || '[]');
  const pronunciationTemplate = templates.find(t => 
    t.title.toLowerCase().includes('pronunciation')
  );
  
  if (!pronunciationTemplate) {
    console.error('❌ 未找到 Pronunciation 課程模板');
    return false;
  }
  
  console.log('\n=== Pronunciation 課程驗證 ===');
  console.log('課程名稱:', pronunciationTemplate.title);
  console.log('課程狀態:', pronunciationTemplate.status);
  console.log('總課程數:', pronunciationTemplate.totalSessions);
  console.log('實際Session數:', pronunciationTemplate.sessions.length);
  
  pronunciationTemplate.sessions.forEach(session => {
    console.log(`\nLesson ${session.sessionNumber}: ${session.title}`);
    console.log(`  虛擬教室: ${session.virtualClassroomLink}`);
    console.log(`  教材連結: ${session.materialLink}`);
  });
  
  console.log('\n✅ 驗證完成');
  return true;
}

// 執行更新
console.log('開始更新 Pronunciation 課程...');
updatePronunciationCourse();
validateUpdate();

console.log('\n=== 使用說明 ===');
console.log('1. 此腳本已建立或更新 Pronunciation 課程模板');
console.log('2. 每個 Lesson 都有獨特的 Zoom 連結');
console.log('3. 課程狀態已設為 "published"');
console.log('4. 請重新整理相關頁面以查看更新');