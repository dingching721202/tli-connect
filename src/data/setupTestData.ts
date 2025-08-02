// 設置測試資料來驗證連結功能
import { getCourseTemplates, createCourseTemplate, updateCourseTemplate } from './courseTemplateUtils';
import { getCourseSchedules, createCourseSchedule } from './courseScheduleUtils';
import { teacherDataService } from './teacherData';
import { hashString } from '../utils/enrollmentUtils';

export function setupPronunciationTestData() {
  console.log('🚀 開始設置 Pronunciation 測試資料...');
  
  // 1. 創建或更新 Pronunciation 課程模板
  const templates = getCourseTemplates();
  let pronunciationTemplate = templates.find(t => 
    t.title.toLowerCase().includes('pronunciation') || 
    t.title === 'Pronunciation'
  );
  
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
    }
  ];
  
  if (pronunciationTemplate) {
    console.log(`📝 更新現有 Pronunciation 模板: ${pronunciationTemplate.id}`);
    pronunciationTemplate = updateCourseTemplate(pronunciationTemplate.id, {
      title: 'Pronunciation',
      description: '英語發音訓練課程，專注於子音母音發音、重音節奏、語調等技巧',
      category: '英文',
      level: '初級',
      totalSessions: 4,
      capacity: 15,
      sessions: pronunciationSessions,
      status: 'published'
    }) || undefined;
  } else {
    console.log('🆕 創建新的 Pronunciation 模板');
    pronunciationTemplate = createCourseTemplate({
      title: 'Pronunciation',
      description: '英語發音訓練課程，專注於子音母音發音、重音節奏、語調等技巧',
      category: '英文',
      level: '初級',
      totalSessions: 4,
      capacity: 15,
      sessions: pronunciationSessions,
      status: 'published'
    });
  }
  
  if (!pronunciationTemplate) {
    throw new Error('創建 Pronunciation 模板失敗');
  }
  
  console.log('✅ Pronunciation 模板已設置:', pronunciationTemplate.id);
  
  // 2. 創建課程排程（讓課程出現在預約系統中）
  const schedules = getCourseSchedules();
  let pronunciationSchedule = schedules.find(s => s.templateId === pronunciationTemplate.id);
  
  if (!pronunciationSchedule) {
    console.log('📅 創建 Pronunciation 課程排程');
    
    // 獲取王老師的ID（從教師管理系統）
    let teacherId = '1'; // 默認使用ID 1
    try {
      const teachers = teacherDataService.getAllTeachers();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wangTeacher = teachers.find((t: any) => t.name === '王老師' || t.name.includes('王'));
      if (wangTeacher) {
        teacherId = wangTeacher.id.toString();
      }
      console.log(`👨‍🏫 使用教師ID: ${teacherId}`);
    } catch (error) {
      console.warn('獲取教師資料失敗，使用默認ID:', error);
    }
    
    pronunciationSchedule = createCourseSchedule({
      templateId: pronunciationTemplate.id,
      templateTitle: pronunciationTemplate.title,
      seriesName: '',
      teacherId: teacherId,
      teacherName: '王老師',
      capacity: pronunciationTemplate.capacity, // 添加 capacity 屬性
      timeSlots: [
        {
          id: 'slot_1',
          weekdays: [2, 4], // 週二、週四
          startTime: '19:00',
          endTime: '20:30',
          teacherId: teacherId
        }
      ],
      startDate: '2025-08-01',
      endDate: '2025-12-31',
      excludeDates: [],
      generatedSessions: [],
      status: 'published'
    });
    
    console.log('✅ Pronunciation 排程已創建:', pronunciationSchedule.id);
  } else {
    console.log('✅ Pronunciation 排程已存在:', pronunciationSchedule.id);
  }
  
  // 3. 創建一些測試預約資料
  if (typeof localStorage !== 'undefined') {
    setupTestBookingData(pronunciationTemplate.id);
  }
  
  console.log('🎉 Pronunciation 測試資料設置完成！');
  return {
    template: pronunciationTemplate,
    schedule: pronunciationSchedule
  };
}

function setupTestBookingData(templateId: string) {
  console.log('📋 設置測試預約資料...');
  
  // 獲取現有預約資料
  const existingAppointments = JSON.parse(localStorage.getItem('classAppointments') || '[]');
  
  // 檢查是否已有 Pronunciation 的測試預約
  const hasTestBooking = existingAppointments.some((apt: { course_name?: string }) => 
    apt.course_name && apt.course_name.includes('Pronunciation')
  );
  
  if (!hasTestBooking) {
    // 創建測試預約，使用正確的 session ID 格式
    // 根據 courseScheduleUtils.ts 中的格式：session_${templateId}_${sessionNumber}
    const sessionIds = [
      `session_${templateId}_1`, // Lesson 1
      `session_${templateId}_2`, // Lesson 2  
      `session_${templateId}_3`, // Lesson 3
      `session_${templateId}_4`  // Lesson 4
    ];
    
    const testAppointments = sessionIds.map((sessionId, index) => ({
      id: Date.now() + index,
      user_id: 2, // Alice Wang的ID
      class_timeslot_id: hashString(sessionId),
      course_name: `Pronunciation - Lesson ${index + 1}`,
      status: 'CONFIRMED',
      created_at: new Date().toISOString(),
      booking_date: index < 2 ? '2025-08-04' : '2025-08-11', // 前兩堂在8/4-8/5，後兩堂在8/11-8/12
      booking_time: index % 2 === 0 ? '12:30-13:20' : '19:30-20:20' // 週一12:30，週二19:30
    }));
    
    existingAppointments.push(...testAppointments);
    localStorage.setItem('classAppointments', JSON.stringify(existingAppointments));
    
    console.log(`✅ 測試預約已創建 - Alice Wang 預約了 ${testAppointments.length} 堂 Pronunciation 課程`);
    testAppointments.forEach((apt, index) => {
      console.log(`  - Session ${index + 1}: timeslot_id = ${apt.class_timeslot_id}, sessionId = ${sessionIds[index]}`);
    });
  } else {
    console.log('✅ 測試預約已存在');
  }
}

// 驗證設置是否正確
export function validatePronunciationSetup() {
  console.log('\n=== 驗證 Pronunciation 設置 ===');
  
  // 1. 驗證課程模板
  const templates = getCourseTemplates();
  const pronunciationTemplate = templates.find(t => t.title === 'Pronunciation');
  
  if (!pronunciationTemplate) {
    console.error('❌ 未找到 Pronunciation 課程模板');
    return false;
  }
  
  console.log('✅ 課程模板存在:', pronunciationTemplate.title);
  console.log('📚 總課程數:', pronunciationTemplate.totalSessions);
  console.log('📋 Session配置:');
  
  pronunciationTemplate.sessions.forEach(session => {
    console.log(`  - Lesson ${session.sessionNumber}: ${session.title}`);
    console.log(`    🔗 虛擬教室: ${session.classroom_link}`);
    console.log(`    📄 教材: ${session.material_link}`);
  });
  
  // 2. 驗證課程排程
  const schedules = getCourseSchedules();
  const pronunciationSchedule = schedules.find(s => s.templateId === pronunciationTemplate.id);
  
  if (!pronunciationSchedule) {
    console.error('❌ 未找到 Pronunciation 課程排程');
    return false;
  }
  
  console.log('✅ 課程排程存在:', pronunciationSchedule.id);
  console.log('👨‍🏫 教師:', pronunciationSchedule.teacherName);
  console.log('📅 時間段:', pronunciationSchedule.timeSlots.map(slot => 
    `週${slot.weekdays.join(',')} ${slot.startTime}-${slot.endTime}`
  ).join(', '));
  
  // 3. 驗證預約資料
  if (typeof localStorage !== 'undefined') {
    const appointments = JSON.parse(localStorage.getItem('classAppointments') || '[]');
    const pronunciationBookings = appointments.filter((apt: { course_name?: string }) => 
      apt.course_name && apt.course_name.includes('Pronunciation')
    );
    
    console.log('✅ 測試預約數量:', pronunciationBookings.length);
    pronunciationBookings.forEach((booking: { user_id: string; course_name: string }) => {
      console.log(`  - 用戶${booking.user_id}: ${booking.course_name}`);
    });
  }
  
  console.log('\n🎉 Pronunciation 設置驗證完成！');
  return true;
}

// 在瀏覽器控制台中執行的簡化腳本
export const browserSetupScript = `
// 在瀏覽器控制台中執行此腳本來設置 Pronunciation 測試資料

// 1. 設置課程模板
function setupPronunciationTemplate() {
  const templates = JSON.parse(localStorage.getItem('courseTemplates') || '[]');
  
  // 移除現有的 Pronunciation 模板
  const filteredTemplates = templates.filter(t => !t.title.toLowerCase().includes('pronunciation'));
  
  // 創建新的 Pronunciation 模板
  const pronunciationTemplate = {
    id: 'template_pronunciation_' + Date.now(),
    title: 'Pronunciation',
    description: '英語發音訓練課程，專注於子音母音發音、重音節奏、語調等技巧',
    category: '英文',
    level: '初級',
    totalSessions: 4,
    capacity: 15,
    sessions: [
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
      }
    ],
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  filteredTemplates.push(pronunciationTemplate);
  localStorage.setItem('courseTemplates', JSON.stringify(filteredTemplates));
  
  console.log('✅ Pronunciation 課程模板已設置');
  return pronunciationTemplate;
}

// 2. 設置課程排程
function setupPronunciationSchedule(templateId) {
  const schedules = JSON.parse(localStorage.getItem('courseSchedules') || '[]');
  
  // 移除現有的 Pronunciation 排程
  const filteredSchedules = schedules.filter(s => s.templateId !== templateId);
  
  // 創建新的排程
  const pronunciationSchedule = {
    id: 'schedule_pronunciation_' + Date.now(),
    templateId: templateId,
    templateTitle: 'Pronunciation',
    seriesName: '',
    teacherId: '1',
    teacherName: '王老師',
    timeSlots: [
      {
        id: 'slot_1',
        weekdays: [2, 4],
        startTime: '19:00',
        endTime: '20:30',
        teacherId: '1'
      }
    ],
    startDate: '2025-08-01',
    endDate: '2025-09-30',
    excludeDates: [],
    generatedSessions: [],
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  filteredSchedules.push(pronunciationSchedule);
  localStorage.setItem('courseSchedules', JSON.stringify(filteredSchedules));
  
  console.log('✅ Pronunciation 課程排程已設置');
  return pronunciationSchedule;
}

// 執行設置
console.log('🚀 開始設置 Pronunciation 測試資料...');
const template = setupPronunciationTemplate();
const schedule = setupPronunciationSchedule(template.id);

// 觸發更新事件
window.dispatchEvent(new CustomEvent('courseTemplatesUpdated'));
window.dispatchEvent(new CustomEvent('courseSchedulesUpdated'));

console.log('🎉 Pronunciation 測試資料設置完成！');
console.log('請重新整理頁面以查看更新');
`;