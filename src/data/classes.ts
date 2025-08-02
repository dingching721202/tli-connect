export interface Schedule {
  days: string[];
  start_time: string;
  end_time: string;
}

export interface Class {
  id: number;
  created_at: string;
  course_id: number;
  class_name: string;
  teacher_id: string;
  start_time: string;
  end_time: string;
  capacity: number;
  current_enrollments: number;
  status: 'active' | 'inactive' | 'completed' | 'cancelled';
  location: string;
  class_code: string;
  session_duration: number;
  total_sessions: number;
  schedule: Schedule;
  enrollment_deadline: string;
  waitlist_enabled: boolean;
  waitlist_count: number;
  updated_at: string;
  // 從課程模組同步的欄位
  categories: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  material_link: string[];
  unit_name?: string; // 單元名稱
  classroom_link?: string; // 教室連結
  language: 'english' | 'chinese' | 'japanese';
  description: string;
  tags: string[];
  prerequisites: string;
}

export const classes: Class[] = [
  {
    id: 1,
    created_at: "2025-07-14T12:00:00+00:00",
    course_id: 1,
    class_name: "基礎英文會話 - 第1期",
    teacher_id: "teacher_001",
    start_time: "2025-07-15T19:00:00+00:00",
    end_time: "2025-09-12T21:00:00+00:00",
    capacity: 15,
    current_enrollments: 12,
    status: "active",
    location: "線上",
    class_code: "ENG001-01",
    session_duration: 120,
    total_sessions: 16,
    schedule: {
      days: ["Tuesday", "Thursday"],
      start_time: "19:00",
      end_time: "21:00"
    },
    enrollment_deadline: "2024-07-25T23:59:59+00:00",
    waitlist_enabled: true,
    waitlist_count: 3,
    updated_at: "2025-07-20T00:00:00Z",
    // 從課程模組同步的欄位
    categories: ["語言學習", "英文"],
    level: "beginner",
    material_link: ["英文會話教材", "聽力練習CD"],
    unit_name: "基礎英文會話",
    classroom_link: "https://meet.google.com/english-class",
    language: "english",
    description: "適合初學者的英文會話課程，重點培養日常對話能力",
    tags: ["英文", "會話", "初學者", "小班制"],
    prerequisites: "無"
  },
  {
    id: 2,
    created_at: "2025-07-14T12:00:00+00:00",
    course_id: 2,
    class_name: "基礎中文會話 - 第1期",
    teacher_id: "teacher_002",
    start_time: "2025-07-16T18:00:00+00:00",
    end_time: "2025-10-12T20:00:00+00:00",
    capacity: 12,
    current_enrollments: 8,
    status: "active",
    location: "台北教室",
    class_code: "CHN001-01",
    session_duration: 120,
    total_sessions: 20,
    schedule: {
      days: ["Tuesday", "Saturday"],
      start_time: "18:00",
      end_time: "20:00"
    },
    enrollment_deadline: "2024-08-01T23:59:59+00:00",
    waitlist_enabled: false,
    waitlist_count: 0,
    updated_at: "2025-07-20T00:00:00Z",
    // 從課程模組同步的欄位
    categories: ["語言學習", "中文"],
    level: "beginner",
    material_link: ["中文會話教材", "聽力練習CD"],
    unit_name: "基礎中文會話",
    classroom_link: "https://meet.google.com/chinese-class",
    language: "chinese",
    description: "專為外國學生設計的中文會話課程，從基礎發音開始",
    tags: ["中文", "會話", "初學者", "發音訓練"],
    prerequisites: "無"
  },
  {
    id: 3,
    created_at: "2025-07-14T12:00:00+00:00",
    course_id: 3,
    class_name: "商務英語進階 - 第1期",
    teacher_id: "teacher_003",
    start_time: "2025-08-05T19:30:00+00:00",
    end_time: "2025-10-21T21:30:00+00:00",
    capacity: 20,
    current_enrollments: 16,
    status: "active",
    location: "線上",
    class_code: "BUS001-01",
    session_duration: 120,
    total_sessions: 24,
    schedule: {
      days: ["Monday", "Wednesday"],
      start_time: "19:30",
      end_time: "21:30"
    },
    enrollment_deadline: "2024-07-25T23:59:59+00:00",
    waitlist_enabled: true,
    waitlist_count: 5,
    updated_at: "2025-07-20T00:00:00Z",
    // 從課程模組同步的欄位
    categories: ["商務英語", "職場溝通"],
    level: "intermediate",
    material_link: ["商務英語教材", "線上練習平台"],
    unit_name: "商務英語進階",
    classroom_link: "https://meet.google.com/business-english",
    language: "english",
    description: "針對商務環境設計的英語課程，包含會議、簡報、談判技巧",
    tags: ["商務英語", "職場溝通", "簡報技巧", "談判"],
    prerequisites: "基礎英語能力"
  },
  {
    id: 4,
    created_at: "2025-07-14T12:00:00+00:00",
    course_id: 4,
    class_name: "日語入門 - 第1期",
    teacher_id: "teacher_004",
    start_time: "2025-08-02T19:00:00+00:00",
    end_time: "2025-11-01T21:00:00+00:00",
    capacity: 18,
    current_enrollments: 14,
    status: "active",
    location: "台北教室",
    class_code: "JPN001-01",
    session_duration: 120,
    total_sessions: 28,
    schedule: {
      days: ["Friday"],
      start_time: "19:00",
      end_time: "21:00"
    },
    enrollment_deadline: "2024-07-26T23:59:59+00:00",
    waitlist_enabled: false,
    waitlist_count: 0,
    updated_at: "2025-07-20T00:00:00Z",
    // 從課程模組同步的欄位
    categories: ["語言學習", "日語"],
    level: "beginner",
    material_link: ["日語入門教材", "發音練習CD"],
    unit_name: "日語入門",
    classroom_link: "https://meet.google.com/japanese-class",
    language: "japanese",
    description: "日語五十音開始，包含基礎語法與日常會話",
    tags: ["日語", "五十音", "入門", "基礎語法"],
    prerequisites: "無"
  },
  {
    id: 5,
    created_at: "2025-07-14T12:00:00+00:00",
    course_id: 5,
    class_name: "TOEIC 衝刺班 - 第1期",
    teacher_id: "teacher_005",
    start_time: "2025-08-03T14:00:00+00:00",
    end_time: "2025-09-08T17:00:00+00:00",
    capacity: 25,
    current_enrollments: 22,
    status: "active",
    location: "台北教室",
    class_code: "TOE001-01",
    session_duration: 180,
    total_sessions: 12,
    schedule: {
      days: ["Saturday", "Sunday"],
      start_time: "14:00",
      end_time: "17:00"
    },
    enrollment_deadline: "2024-07-30T23:59:59+00:00",
    waitlist_enabled: true,
    waitlist_count: 8,
    updated_at: "2025-07-20T00:00:00Z",
    // 從課程模組同步的欄位
    categories: ["證照考試", "英語檢定"],
    level: "intermediate",
    material_link: ["TOEIC官方指南", "模擬試題"],
    unit_name: "TOEIC 衝刺班",
    classroom_link: "https://meet.google.com/toeic-prep",
    language: "english",
    description: "針對TOEIC考試的密集訓練課程，目標分數700+",
    tags: ["TOEIC", "證照考試", "密集班", "考試技巧"],
    prerequisites: "中級英語程度"
  },
  {
    id: 6,
    created_at: "2025-07-14T12:00:00+00:00",
    course_id: 6,
    class_name: "雅思寫作專修 - 第1期",
    teacher_id: "teacher_006",
    start_time: "2025-08-07T18:30:00+00:00",
    end_time: "2025-09-25T21:00:00+00:00",
    capacity: 15,
    current_enrollments: 11,
    status: "active",
    location: "線上",
    class_code: "IEL001-01",
    session_duration: 150,
    total_sessions: 16,
    schedule: {
      days: ["Wednesday"],
      start_time: "18:30",
      end_time: "21:00"
    },
    enrollment_deadline: "2024-08-01T23:59:59+00:00",
    waitlist_enabled: true,
    waitlist_count: 2,
    updated_at: "2025-07-20T00:00:00Z",
    // 從課程模組同步的欄位
    categories: ["證照考試", "學術英語"],
    level: "advanced",
    material_link: ["雅思寫作指南", "範文集"],
    unit_name: "雅思寫作專修",
    classroom_link: "https://meet.google.com/ielts-writing",
    language: "english",
    description: "專攻IELTS寫作技巧，提升學術寫作能力",
    tags: ["IELTS", "雅思", "寫作", "學術英語"],
    prerequisites: "高中級英語程度"
  }
];

export default classes;