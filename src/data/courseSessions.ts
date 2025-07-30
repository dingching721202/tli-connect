import type { CourseSession } from '@/types/business';

// ========================================
// 課程節次資料 - MECE架構
// 定義每個具體的課程節次，包含出席記錄等詳細資訊
// ========================================

export const courseSessions: CourseSession[] = [
  // 基礎英文會話 - 8月班 (course_schedule_id: 1)
  {
    id: 1,
    course_schedule_id: 1,
    session_number: 1,
    start_time: "2025-08-01T19:00:00+08:00",
    end_time: "2025-08-01T21:00:00+08:00",
    capacity: 15,
    reserved_count: 12,
    status: "SCHEDULED",
    topic: "自我介紹與基本問候",
    materials_url: ["/materials/basic-english-unit1.pdf", "/materials/greetings-practice.pdf"],
    homework_assigned: "錄製一分鐘自我介紹影片",
    notes: "第一堂課重點在於建立學習氣氛",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },
  {
    id: 2,
    course_schedule_id: 1,
    session_number: 2,
    start_time: "2025-08-03T19:00:00+08:00",
    end_time: "2025-08-03T21:00:00+08:00",
    capacity: 15,
    reserved_count: 12,
    status: "SCHEDULED",
    topic: "日常生活詞彙",
    materials_url: ["/materials/basic-english-unit2.pdf", "/materials/vocabulary-handbook.pdf"],
    homework_assigned: "完成詞彙練習題1-10",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },
  {
    id: 3,
    course_schedule_id: 1,
    session_number: 3,
    start_time: "2025-08-06T19:00:00+08:00",
    end_time: "2025-08-06T21:00:00+08:00",
    capacity: 15,
    reserved_count: 12,
    status: "SCHEDULED",
    topic: "購物情境對話",
    materials_url: ["/materials/basic-english-unit3.pdf", "/materials/shopping-dialogues.mp3"],
    homework_assigned: "角色扮演練習：在超市購物",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },

  // 商務英語進階 - 8月班 (course_schedule_id: 4)
  {
    id: 4,
    course_schedule_id: 4,
    session_number: 1,
    start_time: "2025-08-05T20:00:00+08:00",
    end_time: "2025-08-05T22:00:00+08:00",
    capacity: 20,
    reserved_count: 16,
    status: "SCHEDULED",
    topic: "商務會議英語基礎",
    materials_url: ["/materials/business-meeting-essentials.pdf", "/materials/meeting-vocabulary.pdf"],
    homework_assigned: "準備5分鐘商務自我介紹",
    notes: "重點：專業形象建立",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },
  {
    id: 5,
    course_schedule_id: 4,
    session_number: 2,
    start_time: "2025-08-07T20:00:00+08:00",
    end_time: "2025-08-07T22:00:00+08:00",
    capacity: 20,
    reserved_count: 16,
    status: "SCHEDULED",
    topic: "會議主持與參與技巧",
    materials_url: ["/materials/meeting-leadership-guide.pdf", "/materials/participation-skills.pdf"],
    homework_assigned: "準備主持10分鐘小組討論",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },

  // TOEIC 衝刺班 - 8月班 (course_schedule_id: 6)
  {
    id: 6,
    course_schedule_id: 6,
    session_number: 1,
    start_time: "2025-08-03T09:00:00+08:00",
    end_time: "2025-08-03T12:00:00+08:00",
    capacity: 25,
    reserved_count: 22,
    status: "SCHEDULED",
    topic: "TOEIC 考試介紹與聽力策略",
    materials_url: ["/materials/toeic-official-guide.pdf", "/materials/listening-strategies.pdf"],
    homework_assigned: "完成聽力練習題Part 1-2",
    notes: "發放官方模擬試題",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },
  {
    id: 7,
    course_schedule_id: 6,
    session_number: 2,
    start_time: "2025-08-04T09:00:00+08:00",
    end_time: "2025-08-04T12:00:00+08:00",
    capacity: 25,
    reserved_count: 22,
    status: "SCHEDULED",
    topic: "聽力Part 3-4 深度練習",
    materials_url: ["/materials/advanced-listening-bank.pdf", "/materials/solving-techniques.pdf"],
    homework_assigned: "完成聽力模擬測驗A",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },

  // 基礎中文會話 - 8月班 (course_schedule_id: 3)
  {
    id: 8,
    course_schedule_id: 3,
    session_number: 1,
    start_time: "2025-08-06T14:00:00+08:00",
    end_time: "2025-08-06T16:00:00+08:00",
    capacity: 12,
    reserved_count: 8,
    status: "SCHEDULED",
    topic: "中文拼音系統介紹",
    materials_url: ["/materials/pinyin-textbook.pdf", "/materials/pronunciation-practice.mp3"],
    homework_assigned: "練習四個聲調發音",
    notes: "需要準備發音教具",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },
  {
    id: 9,
    course_schedule_id: 3,
    session_number: 2,
    start_time: "2025-08-10T14:00:00+08:00",
    end_time: "2025-08-10T16:00:00+08:00",
    capacity: 12,
    reserved_count: 8,
    status: "SCHEDULED",
    topic: "基本問候語與自我介紹",
    materials_url: ["/materials/greetings-handbook.pdf", "/materials/cultural-background.pdf"],
    homework_assigned: "記住10個常用問候語",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },

  // 雅思寫作專修 - 8月班 (course_schedule_id: 7)
  {
    id: 10,
    course_schedule_id: 7,
    session_number: 1,
    start_time: "2025-08-07T19:30:00+08:00",
    end_time: "2025-08-07T22:00:00+08:00",
    capacity: 15,
    reserved_count: 11,
    status: "SCHEDULED",
    topic: "IELTS Task 1 - 圖表描述基礎",
    materials_url: ["/materials/ielts-writing-guide.pdf", "/materials/chart-analysis-examples.pdf"],
    homework_assigned: "完成3篇圖表描述練習",
    notes: "重點：數據描述語彙",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },

  // 日語入門 - 8月班 (course_schedule_id: 5)
  {
    id: 11,
    course_schedule_id: 5,
    session_number: 1,
    start_time: "2025-08-02T19:00:00+08:00",
    end_time: "2025-08-02T21:00:00+08:00",
    capacity: 18,
    reserved_count: 14,
    status: "SCHEDULED",
    topic: "平假名 あ行-か行",
    materials_url: ["/materials/hiragana-practice-book.pdf", "/materials/pronunciation-demo.mp3"],
    homework_assigned: "熟記あ行到か行平假名",
    notes: "準備假名練習卡片",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },
  {
    id: 12,
    course_schedule_id: 5,
    session_number: 2,
    start_time: "2025-08-09T19:00:00+08:00",
    end_time: "2025-08-09T21:00:00+08:00",
    capacity: 18,
    reserved_count: 14,
    status: "SCHEDULED",
    topic: "平假名 さ行-た行",
    materials_url: ["/materials/hiragana-practice-book.pdf", "/materials/stroke-order-sheets.pdf"],
    homework_assigned: "熟記さ行到た行平假名",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  }
];

// ========================================
// 輔助函數
// ========================================

// 根據課程排程ID獲取所有節次
export const getCourseSessionsByScheduleId = (scheduleId: number): CourseSession[] => {
  return courseSessions.filter(session => session.course_schedule_id === scheduleId);
};

// 根據日期獲取課程節次
export const getCourseSessionsByDate = (date: string): CourseSession[] => {
  return courseSessions.filter(session => {
    const sessionDate = new Date(session.start_time).toISOString().split('T')[0];
    return sessionDate === date;
  });
};

// 根據狀態獲取課程節次
export const getCourseSessionsByStatus = (status: string): CourseSession[] => {
  return courseSessions.filter(session => session.status === status);
};

// 根據ID獲取課程節次
export const getCourseSessionById = (id: number): CourseSession | undefined => {
  return courseSessions.find(session => session.id === id);
};

// 獲取課程排程的下一節課
export const getNextSessionByScheduleId = (scheduleId: number): CourseSession | undefined => {
  const now = new Date();
  const sessions = getCourseSessionsByScheduleId(scheduleId)
    .filter(session => new Date(session.start_time) > now)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  
  return sessions[0];
};

// 獲取今天的課程節次
export const getTodaySessions = (): CourseSession[] => {
  const today = new Date().toISOString().split('T')[0];
  return getCourseSessionsByDate(today);
};

// 獲取本週的課程節次
export const getThisWeekSessions = (): CourseSession[] => {
  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
  
  return courseSessions.filter(session => {
    const sessionDate = new Date(session.start_time);
    return sessionDate >= weekStart && sessionDate <= weekEnd;
  });
};

// 檢查課程節次是否已開始
export const hasSessionStarted = (session: CourseSession): boolean => {
  const now = new Date();
  const sessionStart = new Date(session.start_time);
  return now >= sessionStart;
};

// 檢查課程節次是否已結束
export const hasSessionEnded = (session: CourseSession): boolean => {
  const now = new Date();
  const sessionEnd = new Date(session.end_time);
  return now > sessionEnd;
};

// 檢查課程節次是否還有名額
export const hasAvailableCapacity = (session: CourseSession): boolean => {
  return session.reserved_count < session.capacity;
};

// 獲取課程節次可用名額
export const getAvailableCapacity = (session: CourseSession): number => {
  return Math.max(0, session.capacity - session.reserved_count);
};

// 向下相容的預設匯出
export default courseSessions;