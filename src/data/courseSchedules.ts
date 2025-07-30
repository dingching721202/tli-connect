import type { CourseSchedule } from '@/types/business';

// ========================================
// 課程排程資料 - MECE架構
// 定義具體的課程開課時間、地點、教師等排程資訊
// ========================================

export const courseSchedules: CourseSchedule[] = [
  // 基礎英文會話 - 課程模組ID: 1
  {
    id: 1,
    course_module_id: 1,
    title: "基礎英文會話 - 8月班",
    teacher_id: 4, // 王老師
    teacher_name: "王老師",
    location: {
      type: "ONLINE",
      online_link: "https://zoom.us/j/1234567890",
      platform: "ZOOM"
    },
    price: 3200,
    original_price: 3200,
    currency: "TWD",
    max_students: 15,
    current_students: 12,
    start_date: "2025-08-01",
    end_date: "2025-09-26",
    enrollment_deadline: "2025-07-25",
    status: "PUBLISHED",
    recurring_pattern: {
      type: "WEEKLY",
      days_of_week: [2, 4], // Tuesday, Thursday
      exceptions: []
    },
    waitlist_enabled: true,
    special_notes: "線上課程，需要穩定網路連線",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },
  {
    id: 2,
    course_module_id: 1,
    title: "基礎英文會話 - 9月班",
    teacher_id: 4, // 王老師
    teacher_name: "王老師",
    location: {
      type: "ONLINE",
      online_link: "https://zoom.us/j/1234567891",
      platform: "ZOOM"
    },
    price: 3200,
    original_price: 3200,
    currency: "TWD",
    max_students: 15,
    current_students: 5,
    start_date: "2025-09-05",
    end_date: "2025-10-31",
    enrollment_deadline: "2025-08-30",
    status: "DRAFT",
    recurring_pattern: {
      type: "WEEKLY",
      days_of_week: [1, 3], // Monday, Wednesday
      exceptions: []
    },
    waitlist_enabled: true,
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },

  // 基礎中文會話 - 課程模組ID: 2
  {
    id: 3,
    course_module_id: 2,
    title: "基礎中文會話 - 8月班",
    teacher_id: 4, // 王老師
    teacher_name: "王老師",
    location: {
      type: "PHYSICAL",
      address: "台北市大安區信義路四段1號",
      room: "8樓 A 教室"
    },
    price: 4200,
    original_price: 4200,
    currency: "TWD",
    max_students: 12,
    current_students: 8,
    start_date: "2025-08-06",
    end_date: "2025-10-08",
    enrollment_deadline: "2025-08-01",
    status: "PUBLISHED",
    recurring_pattern: {
      type: "WEEKLY",
      days_of_week: [2, 6], // Tuesday, Saturday
      exceptions: []
    },
    waitlist_enabled: false,
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },

  // 商務英語進階 - 課程模組ID: 3
  {
    id: 4,
    course_module_id: 3,
    title: "商務英語進階 - 8月班",
    teacher_id: 4, // 王老師
    teacher_name: "王老師",
    location: {
      type: "ONLINE",
      online_link: "https://zoom.us/j/9876543210",
      platform: "ZOOM"
    },
    price: 5800,
    original_price: 6200,
    currency: "TWD",
    max_students: 20,
    current_students: 16,
    start_date: "2025-08-05",
    end_date: "2025-10-21",
    enrollment_deadline: "2025-07-25",
    status: "PUBLISHED",
    recurring_pattern: {
      type: "WEEKLY",
      days_of_week: [1, 3], // Monday, Wednesday
      exceptions: []
    },
    waitlist_enabled: true,
    special_notes: "商務英語專班，適合有工作經驗者",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },

  // 日語入門 - 課程模組ID: 4
  {
    id: 5,
    course_module_id: 4,
    title: "日語入門 - 8月班",
    teacher_id: 4, // 王老師 (暫時，實際應該是日語老師)
    teacher_name: "田中太郎",
    location: {
      type: "PHYSICAL",
      address: "台北市大安區信義路四段1號",
      room: "10樓 B 教室"
    },
    price: 6500,
    original_price: 7000,
    currency: "TWD",
    max_students: 18,
    current_students: 14,
    start_date: "2025-08-02",
    end_date: "2025-11-01",
    enrollment_deadline: "2025-07-26",
    status: "PUBLISHED",
    recurring_pattern: {
      type: "WEEKLY",
      days_of_week: [5], // Friday
      exceptions: []
    },
    waitlist_enabled: false,
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },

  // TOEIC 衝刺班 - 課程模組ID: 5
  {
    id: 6,
    course_module_id: 5,
    title: "TOEIC 衝刺班 - 8月班",
    teacher_id: 4, // 王老師 (暫時，實際應該是TOEIC專門老師)
    teacher_name: "Sarah Wilson",
    location: {
      type: "PHYSICAL",
      address: "台北市大安區信義路四段1號",
      room: "9樓 C 教室"
    },
    price: 4800,
    original_price: 5200,
    currency: "TWD",
    max_students: 25,
    current_students: 22,
    start_date: "2025-08-03",
    end_date: "2025-09-08",
    enrollment_deadline: "2025-07-30",
    status: "PUBLISHED",
    recurring_pattern: {
      type: "WEEKLY",
      days_of_week: [6, 0], // Saturday, Sunday
      exceptions: []
    },
    waitlist_enabled: true,
    special_notes: "密集班課程，週末上課",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },

  // 雅思寫作專修 - 課程模組ID: 6
  {
    id: 7,
    course_module_id: 6,
    title: "雅思寫作專修 - 8月班",
    teacher_id: 4, // 王老師 (暫時，實際應該是雅思專門老師)
    teacher_name: "Dr. Emma Thompson",
    location: {
      type: "ONLINE",
      online_link: "https://zoom.us/j/5555666677",
      platform: "ZOOM"
    },
    price: 5200,
    original_price: 5600,
    currency: "TWD",
    max_students: 15,
    current_students: 11,
    start_date: "2025-08-07",
    end_date: "2025-09-25",
    enrollment_deadline: "2025-08-01",
    status: "PUBLISHED",
    recurring_pattern: {
      type: "WEEKLY",
      days_of_week: [3], // Wednesday
      exceptions: []
    },
    waitlist_enabled: true,
    special_notes: "專攻寫作技巧，需要具備中高級英語程度",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },

  // 額外的排程 - 商務英語進階週末班
  {
    id: 8,
    course_module_id: 3, // 商務英語進階
    title: "商務英語進階 - 週末班",
    teacher_id: 4, // 王老師
    teacher_name: "王老師",
    location: {
      type: "HYBRID",
      address: "台北市大安區信義路四段1號",
      room: "12樓會議室",
      online_link: "https://zoom.us/j/1111222233",
      platform: "ZOOM"
    },
    price: 6200,
    original_price: 6200,
    currency: "TWD",
    max_students: 18,
    current_students: 3,
    start_date: "2025-08-10",
    end_date: "2025-11-02",
    enrollment_deadline: "2025-08-05",
    status: "DRAFT",
    recurring_pattern: {
      type: "WEEKLY",
      days_of_week: [6], // Saturday
      exceptions: []
    },
    waitlist_enabled: true,
    special_notes: "混合式教學，結合實體與線上優勢",
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  }
];

// ========================================
// 輔助函數
// ========================================

// 根據課程模組ID獲取排程
export const getCourseSchedulesByModuleId = (moduleId: number): CourseSchedule[] => {
  return courseSchedules.filter(schedule => schedule.course_module_id === moduleId);
};

// 根據教師ID獲取排程
export const getCourseSchedulesByTeacherId = (teacherId: number): CourseSchedule[] => {
  return courseSchedules.filter(schedule => schedule.teacher_id === teacherId);
};

// 根據狀態獲取排程
export const getCourseSchedulesByStatus = (status: string): CourseSchedule[] => {
  return courseSchedules.filter(schedule => schedule.status === status);
};

// 根據地點類型獲取排程
export const getCourseSchedulesByLocationType = (locationType: string): CourseSchedule[] => {
  return courseSchedules.filter(schedule => schedule.location.type === locationType);
};

// 根據ID獲取排程
export const getCourseScheduleById = (id: number): CourseSchedule | undefined => {
  return courseSchedules.find(schedule => schedule.id === id);
};

// 檢查排程是否開放報名
export const isEnrollmentOpen = (schedule: CourseSchedule): boolean => {
  const now = new Date();
  const enrollmentEnd = new Date(schedule.enrollment_deadline);
  
  return now <= enrollmentEnd && 
         (schedule.status === 'PUBLISHED' || schedule.status === 'ONGOING');
};

// 檢查是否還有名額
export const hasAvailableSlots = (schedule: CourseSchedule): boolean => {
  return schedule.current_students < schedule.max_students;
};

// 取得可用名額數
export const getAvailableSlots = (schedule: CourseSchedule): number => {
  return Math.max(0, schedule.max_students - schedule.current_students);
};

// 檢查是否可以加入候補
export const canJoinWaitlist = (schedule: CourseSchedule): boolean => {
  return schedule.waitlist_enabled && !hasAvailableSlots(schedule);
};

// 向下相容的預設匯出
export default courseSchedules;