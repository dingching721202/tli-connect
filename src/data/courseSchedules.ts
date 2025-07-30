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
    location_type: "ONLINE",
    location_address: "",
    start_date: "2025-08-01",
    end_date: "2025-09-26",
    enrollment_start: "2025-07-15",
    enrollment_end: "2025-07-25",
    price: 3200,
    discount_price: undefined,
    currency: "TWD",
    max_students: 15,
    current_students: 12,
    status: "ENROLLING",
    recurring_type: "WEEKLY",
    recurring_days: ["TUESDAY", "THURSDAY"],
    session_time: "19:00-21:00",
    timezone: "Asia/Taipei",
    is_waitlist_enabled: true,
    waitlist_count: 3,
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },
  {
    id: 2,
    course_module_id: 1,
    title: "基礎英文會話 - 9月班",
    teacher_id: 4, // 王老師
    teacher_name: "王老師",
    location_type: "ONLINE",
    location_address: "",
    start_date: "2025-09-05",
    end_date: "2025-10-31",
    enrollment_start: "2025-08-15",
    enrollment_end: "2025-08-30",
    price: 3200,
    discount_price: undefined,
    currency: "TWD",
    max_students: 15,
    current_students: 5,
    status: "SCHEDULED",
    recurring_type: "WEEKLY",
    recurring_days: ["MONDAY", "WEDNESDAY"],
    session_time: "19:30-21:30",
    timezone: "Asia/Taipei",
    is_waitlist_enabled: true,
    waitlist_count: 0,
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
    location_type: "CLASSROOM",
    location_address: "台北市大安區信義路四段1號8樓",
    start_date: "2025-08-06",
    end_date: "2025-10-08",
    enrollment_start: "2025-07-20",
    enrollment_end: "2025-08-01",
    price: 4200,
    discount_price: undefined,
    currency: "TWD",
    max_students: 12,
    current_students: 8,
    status: "ENROLLING",
    recurring_type: "WEEKLY",
    recurring_days: ["TUESDAY", "SATURDAY"],
    session_time: "14:00-16:00",
    timezone: "Asia/Taipei",
    is_waitlist_enabled: false,
    waitlist_count: 0,
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
    location_type: "ONLINE",
    location_address: "",
    start_date: "2025-08-05",
    end_date: "2025-10-21",
    enrollment_start: "2025-07-10",
    enrollment_end: "2025-07-25",
    price: 5800,
    discount_price: 5200,
    currency: "TWD",
    max_students: 20,
    current_students: 16,
    status: "ENROLLING",
    recurring_type: "WEEKLY",
    recurring_days: ["MONDAY", "WEDNESDAY"],
    session_time: "20:00-22:00",
    timezone: "Asia/Taipei",
    is_waitlist_enabled: true,
    waitlist_count: 2,
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
    location_type: "CLASSROOM",
    location_address: "台北市大安區信義路四段1號10樓",
    start_date: "2025-08-02",
    end_date: "2025-11-01",
    enrollment_start: "2025-07-10",
    enrollment_end: "2025-07-26",
    price: 6500,
    discount_price: 6000,
    currency: "TWD",
    max_students: 18,
    current_students: 14,
    status: "ENROLLING",
    recurring_type: "WEEKLY",
    recurring_days: ["FRIDAY"],
    session_time: "19:00-21:00",
    timezone: "Asia/Taipei",
    is_waitlist_enabled: false,
    waitlist_count: 0,
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
    location_type: "CLASSROOM",
    location_address: "台北市大安區信義路四段1號9樓",
    start_date: "2025-08-03",
    end_date: "2025-09-08",
    enrollment_start: "2025-07-15",
    enrollment_end: "2025-07-30",
    price: 4800,
    discount_price: 4300,
    currency: "TWD",
    max_students: 25,
    current_students: 22,
    status: "ENROLLING",
    recurring_type: "WEEKLY",
    recurring_days: ["SATURDAY", "SUNDAY"],
    session_time: "09:00-12:00",
    timezone: "Asia/Taipei",
    is_waitlist_enabled: true,
    waitlist_count: 5,
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
    location_type: "ONLINE",
    location_address: "",
    start_date: "2025-08-07",
    end_date: "2025-09-25",
    enrollment_start: "2025-07-20",
    enrollment_end: "2025-08-01",
    price: 5200,
    discount_price: undefined,
    currency: "TWD",
    max_students: 15,
    current_students: 11,
    status: "ENROLLING",
    recurring_type: "WEEKLY",
    recurring_days: ["WEDNESDAY"],
    session_time: "19:30-22:00",
    timezone: "Asia/Taipei",
    is_waitlist_enabled: true,
    waitlist_count: 1,
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },

  // 額外的排程 - 同一個課程模組的不同時間段
  {
    id: 8,
    course_module_id: 3, // 商務英語進階
    title: "商務英語進階 - 週末班",
    teacher_id: 4, // 王老師
    teacher_name: "王老師",
    location_type: "HYBRID",
    location_address: "台北市大安區信義路四段1號12樓",
    start_date: "2025-08-10",
    end_date: "2025-11-02",
    enrollment_start: "2025-07-25",
    enrollment_end: "2025-08-05",
    price: 6200,
    discount_price: undefined,
    currency: "TWD",
    max_students: 18,
    current_students: 3,
    status: "SCHEDULED",
    recurring_type: "WEEKLY",
    recurring_days: ["SATURDAY"],
    session_time: "14:00-18:00",
    timezone: "Asia/Taipei",
    is_waitlist_enabled: true,
    waitlist_count: 0,
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
  return courseSchedules.filter(schedule => schedule.location_type === locationType);
};

// 根據ID獲取排程
export const getCourseScheduleById = (id: number): CourseSchedule | undefined => {
  return courseSchedules.find(schedule => schedule.id === id);
};

// 檢查排程是否開放報名
export const isEnrollmentOpen = (schedule: CourseSchedule): boolean => {
  const now = new Date();
  const enrollmentStart = new Date(schedule.enrollment_start);
  const enrollmentEnd = new Date(schedule.enrollment_end);
  
  return now >= enrollmentStart && 
         now <= enrollmentEnd && 
         schedule.status === 'ENROLLING';
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
  return schedule.is_waitlist_enabled && !hasAvailableSlots(schedule);
};

// 向下相容的預設匯出
export default courseSchedules;