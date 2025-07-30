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
    title: "自我介紹與基本問候",
    session_date: "2025-08-01",
    start_time: "19:00",
    end_time: "21:00",
    timezone: "Asia/Taipei",
    location_type: "ONLINE",
    location_address: "",
    meeting_url: "https://zoom.us/j/1234567890",
    status: "SCHEDULED",
    materials: ["Unit 1 - 自我介紹", "問候語練習題"],
    homework: "錄製一分鐘自我介紹影片",
    notes: "第一堂課重點在於建立學習氣氛",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },
  {
    id: 2,
    course_schedule_id: 1,
    session_number: 2,
    title: "日常生活詞彙",
    session_date: "2025-08-03",
    start_time: "19:00",
    end_time: "21:00",
    timezone: "Asia/Taipei",
    location_type: "ONLINE",
    location_address: "",
    meeting_url: "https://zoom.us/j/1234567890",
    status: "SCHEDULED",
    materials: ["Unit 2 - 日常詞彙", "生活用語手冊"],
    homework: "完成詞彙練習題1-10",
    notes: "",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },
  {
    id: 3,
    course_schedule_id: 1,
    session_number: 3,
    title: "購物情境對話",
    session_date: "2025-08-06",
    start_time: "19:00",
    end_time: "21:00",
    timezone: "Asia/Taipei",
    location_type: "ONLINE",
    location_address: "",
    meeting_url: "https://zoom.us/j/1234567890",
    status: "SCHEDULED",
    materials: ["Unit 3 - 購物英語", "情境對話CD"],
    homework: "角色扮演練習：在超市購物",
    notes: "",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },

  // 商務英語進階 - 8月班 (course_schedule_id: 4)
  {
    id: 4,
    course_schedule_id: 4,
    session_number: 1,
    title: "商務會議英語基礎",
    session_date: "2025-08-05",
    start_time: "20:00",
    end_time: "22:00",
    timezone: "Asia/Taipei",
    location_type: "ONLINE",
    location_address: "",
    meeting_url: "https://zoom.us/j/9876543210",
    status: "SCHEDULED",
    materials: ["Business Meeting Essentials", "會議用語手冊"],
    homework: "準備5分鐘商務自我介紹",
    notes: "重點：專業形象建立",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },
  {
    id: 5,
    course_schedule_id: 4,
    session_number: 2,
    title: "會議主持與參與技巧",
    session_date: "2025-08-07",
    start_time: "20:00",
    end_time: "22:00",
    timezone: "Asia/Taipei",
    location_type: "ONLINE",
    location_address: "",
    meeting_url: "https://zoom.us/j/9876543210",
    status: "SCHEDULED",
    materials: ["Meeting Leadership Guide", "參與技巧實戰"],
    homework: "準備主持10分鐘小組討論",
    notes: "",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },

  // TOEIC 衝刺班 - 8月班 (course_schedule_id: 6)
  {
    id: 6,
    course_schedule_id: 6,
    session_number: 1,
    title: "TOEIC 考試介紹與聽力策略",
    session_date: "2025-08-03",
    start_time: "09:00",
    end_time: "12:00",
    timezone: "Asia/Taipei",
    location_type: "CLASSROOM",
    location_address: "台北市大安區信義路四段1號9樓",
    meeting_url: "",
    status: "SCHEDULED",
    materials: ["TOEIC官方指南", "聽力策略手冊"],
    homework: "完成聽力練習題Part 1-2",
    notes: "發放官方模擬試題",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },
  {
    id: 7,
    course_schedule_id: 6,
    session_number: 2,
    title: "聽力Part 3-4 深度練習",
    session_date: "2025-08-04",
    start_time: "09:00",
    end_time: "12:00",
    timezone: "Asia/Taipei",
    location_type: "CLASSROOM",
    location_address: "台北市大安區信義路四段1號9樓",
    meeting_url: "",
    status: "SCHEDULED",
    materials: ["進階聽力題庫", "解題技巧指南"],
    homework: "完成聽力模擬測驗A",
    notes: "",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },

  // 基礎中文會話 - 8月班 (course_schedule_id: 3)
  {
    id: 8,
    course_schedule_id: 3,
    session_number: 1,
    title: "中文拼音系統介紹",
    session_date: "2025-08-06",
    start_time: "14:00",
    end_time: "16:00",
    timezone: "Asia/Taipei",
    location_type: "CLASSROOM",
    location_address: "台北市大安區信義路四段1號8樓",
    meeting_url: "",
    status: "SCHEDULED",
    materials: ["拼音教材", "發音練習CD"],
    homework: "練習四個聲調發音",
    notes: "需要準備發音教具",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },
  {
    id: 9,
    course_schedule_id: 3,
    session_number: 2,
    title: "基本問候語與自我介紹",
    session_date: "2025-08-10",
    start_time: "14:00",
    end_time: "16:00",
    timezone: "Asia/Taipei",
    location_type: "CLASSROOM",
    location_address: "台北市大安區信義路四段1號8樓",
    meeting_url: "",
    status: "SCHEDULED",
    materials: ["問候語手册", "文化背景介紹"],
    homework: "記住10個常用問候語",
    notes: "",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },

  // 雅思寫作專修 - 8月班 (course_schedule_id: 7)
  {
    id: 10,
    course_schedule_id: 7,
    session_number: 1,
    title: "IELTS Task 1 - 圖表描述基礎",
    session_date: "2025-08-07",
    start_time: "19:30",
    end_time: "22:00",
    timezone: "Asia/Taipei",
    location_type: "ONLINE",
    location_address: "",
    meeting_url: "https://zoom.us/j/5555666677",
    status: "SCHEDULED",
    materials: ["IELTS寫作指南", "圖表分析範例"],
    homework: "完成3篇圖表描述練習",
    notes: "重點：數據描述語彙",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },

  // 日語入門 - 8月班 (course_schedule_id: 5)
  {
    id: 11,
    course_schedule_id: 5,
    session_number: 1,
    title: "平假名 あ行-か行",
    session_date: "2025-08-02",
    start_time: "19:00",
    end_time: "21:00",
    timezone: "Asia/Taipei",
    location_type: "CLASSROOM",
    location_address: "台北市大安區信義路四段1號10樓",
    meeting_url: "",
    status: "SCHEDULED",
    materials: ["五十音練習帖", "發音示範CD"],
    homework: "熟記あ行到か行平假名",
    notes: "準備假名練習卡片",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },
  {
    id: 12,
    course_schedule_id: 5,
    session_number: 2,
    title: "平假名 さ行-た行",
    session_date: "2025-08-09",
    start_time: "19:00",
    end_time: "21:00",
    timezone: "Asia/Taipei",
    location_type: "CLASSROOM",
    location_address: "台北市大安區信義路四段1號10樓",
    meeting_url: "",
    status: "SCHEDULED",
    materials: ["五十音練習帖", "筆順練習紙"],
    homework: "熟記さ行到た行平假名",
    notes: "",
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
  return courseSessions.filter(session => session.session_date === date);
};

// 根據狀態獲取課程節次
export const getCourseSessionsByStatus = (status: string): CourseSession[] => {
  return courseSessions.filter(session => session.status === status);
};

// 根據地點類型獲取課程節次
export const getCourseSessionsByLocationType = (locationType: string): CourseSession[] => {
  return courseSessions.filter(session => session.location_type === locationType);
};

// 根據ID獲取課程節次
export const getCourseSessionById = (id: number): CourseSession | undefined => {
  return courseSessions.find(session => session.id === id);
};

// 獲取課程排程的下一節課
export const getNextSessionByScheduleId = (scheduleId: number): CourseSession | undefined => {
  const now = new Date();
  const sessions = getCourseSessionsByScheduleId(scheduleId)
    .filter(session => {
      const sessionDateTime = new Date(`${session.session_date}T${session.start_time}`);
      return sessionDateTime > now;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.session_date}T${a.start_time}`);
      const dateB = new Date(`${b.session_date}T${b.start_time}`);
      return dateA.getTime() - dateB.getTime();
    });
  
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
  
  const startDate = weekStart.toISOString().split('T')[0];
  const endDate = weekEnd.toISOString().split('T')[0];
  
  return courseSessions.filter(session => 
    session.session_date >= startDate && session.session_date <= endDate
  );
};

// 檢查課程節次是否已開始
export const hasSessionStarted = (session: CourseSession): boolean => {
  const now = new Date();
  const sessionStart = new Date(`${session.session_date}T${session.start_time}`);
  return now >= sessionStart;
};

// 檢查課程節次是否已結束
export const hasSessionEnded = (session: CourseSession): boolean => {
  const now = new Date();
  const sessionEnd = new Date(`${session.session_date}T${session.end_time}`);
  return now > sessionEnd;
};

// 向下相容的預設匯出
export default courseSessions;