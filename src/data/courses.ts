export interface Course {
  id: number;
  created_at: string;
  title: string;
  description: string;
  teacher: string;
  teacher_id: string;
  duration: string;
  price: number;
  original_price: number;
  currency: string;
  cover_image_url: string;
  categories: string[];
  language: 'english' | 'chinese' | 'japanese';
  level: 'beginner' | 'intermediate' | 'advanced';
  capacity: number;
  current_students: number;
  rating: number;
  total_sessions: number;
  session_duration: number;
  location: string;
  is_active: boolean;
  status: string;
  tags: string[];
  prerequisites: string;
  material_link: string[];
  classroom_link?: string;
  refund_policy: string;
  start_date: string;
  end_date: string;
  enrollment_deadline: string;
  recurring: boolean;
  recurring_type: string;
  recurring_days: string[];
  waitlist_enabled: boolean;
  updated_at: string;
}

export const courses: Course[] = [
  {
    id: 1,
    created_at: "2025-07-14T12:00:00+00:00",
    title: "基礎英文會話",
    description: "適合初學者的英文會話課程，重點培養日常對話能力",
    teacher: "Jennifer Smith",
    teacher_id: "teacher_001", // Jennifer Smith - TEACHER
    duration: "8週",
    price: 3200,
    original_price: 3200,
    currency: "TWD",
    cover_image_url: "/images/courses/basic-english.jpg",
    categories: [
      "語言學習",
      "英文"
    ],
    language: "english",
    level: "beginner",
    capacity: 15,
    current_students: 12,
    rating: 4.8,
    total_sessions: 16,
    session_duration: 120,
    location: "線上",
    is_active: true,
    status: "active",
    tags: ["英文", "會話", "初學者", "小班制"],
    prerequisites: "無",
    material_link: ["英文會話教材", "聽力練習CD"],
    classroom_link: "https://meet.google.com/english-class",
    refund_policy: "開課前7天可全額退費",
    start_date: "2025-08-01",
    end_date: "2025-09-26",
    enrollment_deadline: "2025-07-25",
    recurring: true,
    recurring_type: "weekly",
    recurring_days: ["Tuesday", "Thursday"],
    waitlist_enabled: true,
    updated_at: "2025-07-20T00:00:00Z"
  },
  {
    id: 2,
    created_at: "2025-07-14T12:00:00+00:00",
    title: "基礎中文會話",
    description: "專為外國學生設計的中文會話課程，從基礎發音開始",
    teacher: "王小明",
    teacher_id: "teacher_002", // 王小明 - TEACHER
    duration: "10週",
    price: 4200,
    original_price: 4200,
    currency: "TWD",
    cover_image_url: "/images/courses/chinese-conversation.jpg",
    categories: [
      "語言學習",
      "中文"
    ],
    language: "chinese",
    level: "beginner",
    capacity: 12,
    current_students: 8,
    rating: 4.7,
    total_sessions: 20,
    session_duration: 120,
    location: "台北教室",
    is_active: true,
    status: "active",
    tags: ["中文", "會話", "初學者", "發音訓練"],
    prerequisites: "無",
    material_link: ["中文會話教材", "聽力練習CD"],
    classroom_link: "https://meet.google.com/chinese-class",
    refund_policy: "開課前5天可退費80%",
    start_date: "2025-08-06",
    end_date: "2025-10-08",
    enrollment_deadline: "2025-08-01",
    recurring: true,
    recurring_type: "weekly",
    recurring_days: ["Tuesday", "Saturday"],
    waitlist_enabled: false,
    updated_at: "2025-07-20T00:00:00Z"
  },
  {
    id: 3,
    created_at: "2025-07-14T12:00:00+00:00",
    title: "商務英語進階",
    description: "針對商務環境設計的英語課程，包含會議、簡報、談判技巧",
    teacher: "Michael Johnson",
    teacher_id: "teacher_003", // Michael Johnson - TEACHER
    duration: "12週",
    price: 5800,
    original_price: 6200,
    currency: "TWD",
    cover_image_url: "/images/courses/business-english.jpg",
    categories: [
      "商務英語",
      "職場溝通"
    ],
    language: "english",
    level: "intermediate",
    capacity: 20,
    current_students: 16,
    rating: 4.9,
    total_sessions: 24,
    session_duration: 120,
    location: "線上",
    is_active: true,
    status: "active",
    tags: ["商務英語", "職場溝通", "簡報技巧", "談判"],
    prerequisites: "基礎英語能力",
    material_link: ["商務英語教材", "線上練習平台"],
    classroom_link: "https://meet.google.com/business-english",
    refund_policy: "開課前7天可全額退費",
    start_date: "2025-08-05",
    end_date: "2025-10-21",
    enrollment_deadline: "2025-07-25",
    recurring: true,
    recurring_type: "weekly",
    recurring_days: ["Monday", "Wednesday"],
    waitlist_enabled: true,
    updated_at: "2025-07-20T00:00:00Z"
  },
  {
    id: 4,
    created_at: "2025-07-14T12:00:00+00:00",
    title: "日語入門",
    description: "日語五十音開始，包含基礎語法與日常會話",
    teacher: "田中太郎",
    teacher_id: "teacher_004", // 田中太郎 - TEACHER
    duration: "14週",
    price: 6500,
    original_price: 7000,
    currency: "TWD",
    cover_image_url: "/images/courses/japanese-basic.jpg",
    categories: [
      "語言學習",
      "日語"
    ],
    language: "japanese",
    level: "beginner",
    capacity: 18,
    current_students: 14,
    rating: 4.6,
    total_sessions: 28,
    session_duration: 120,
    location: "台北教室",
    is_active: true,
    status: "active",
    tags: ["日語", "五十音", "入門", "基礎語法"],
    prerequisites: "無",
    material_link: ["日語入門教材", "發音練習CD"],
    classroom_link: "https://meet.google.com/japanese-class",
    refund_policy: "開課前5天可退費80%",
    start_date: "2025-08-02",
    end_date: "2025-11-01",
    enrollment_deadline: "2025-07-26",
    recurring: true,
    recurring_type: "weekly",
    recurring_days: ["Friday"],
    waitlist_enabled: false,
    updated_at: "2025-07-20T00:00:00Z"
  },
  {
    id: 5,
    created_at: "2025-07-14T12:00:00+00:00",
    title: "TOEIC 衝刺班",
    description: "針對TOEIC考試的密集訓練課程，目標分數700+",
    teacher: "Sarah Wilson",
    teacher_id: "teacher_005", // Sarah Wilson - TEACHER
    duration: "6週",
    price: 4800,
    original_price: 5200,
    currency: "TWD",
    cover_image_url: "/images/courses/toeic-prep.jpg",
    categories: [
      "證照考試",
      "英語檢定"
    ],
    language: "english",
    level: "intermediate",
    capacity: 25,
    current_students: 22,
    rating: 4.8,
    total_sessions: 12,
    session_duration: 180,
    location: "台北教室",
    is_active: true,
    status: "active",
    tags: ["TOEIC", "證照考試", "密集班", "考試技巧"],
    prerequisites: "中級英語程度",
    material_link: ["TOEIC官方指南", "模擬試題"],
    classroom_link: "https://meet.google.com/toeic-prep",
    refund_policy: "開課前3天可退費50%",
    start_date: "2025-08-03",
    end_date: "2025-09-08",
    enrollment_deadline: "2025-07-30",
    recurring: true,
    recurring_type: "weekly",
    recurring_days: ["Saturday", "Sunday"],
    waitlist_enabled: true,
    updated_at: "2025-07-20T00:00:00Z"
  },
  {
    id: 6,
    created_at: "2025-07-14T12:00:00+00:00",
    title: "雅思寫作專修",
    description: "專攻IELTS寫作技巧，提升學術寫作能力",
    teacher: "Dr. Emma Thompson",
    teacher_id: "teacher_006", // Dr. Emma Thompson - TEACHER
    duration: "8週",
    price: 5200,
    original_price: 5600,
    currency: "TWD",
    cover_image_url: "/images/courses/ielts-writing.jpg",
    categories: [
      "證照考試",
      "學術英語"
    ],
    language: "english",
    level: "advanced",
    capacity: 15,
    current_students: 11,
    rating: 4.9,
    total_sessions: 16,
    session_duration: 150,
    location: "線上",
    is_active: true,
    status: "active",
    tags: ["IELTS", "雅思", "寫作", "學術英語"],
    prerequisites: "高中級英語程度",
    material_link: ["雅思寫作指南", "範文集"],
    classroom_link: "https://meet.google.com/ielts-writing",
    refund_policy: "開課前7天可全額退費",
    start_date: "2025-08-07",
    end_date: "2025-09-25",
    enrollment_deadline: "2025-08-01",
    recurring: true,
    recurring_type: "weekly",
    recurring_days: ["Wednesday"],
    waitlist_enabled: true,
    updated_at: "2025-07-20T00:00:00Z"
  }
];

export default courses;