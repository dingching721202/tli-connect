import type { CourseModule } from '@/types/business';

// ========================================
// 課程模組資料 - MECE架構
// 定義課程範本和基本資訊，不包含排程相關資料
// ========================================

export const courseModules: CourseModule[] = [
  {
    id: 1,
    title: "基礎英文會話",
    description: "適合初學者的英文會話課程，重點培養日常對話能力",
    short_description: "初學者英文會話入門課程",
    language: "ENGLISH",
    level: "BEGINNER",
    duration_weeks: 8,
    total_sessions: 16,
    session_duration_minutes: 120,
    categories: ["語言學習", "英文"],
    tags: ["英文", "會話", "初學者", "小班制"],
    prerequisites: "無",
    learning_objectives: [
      "掌握基本日常會話",
      "建立英語口說信心",
      "學會常用生活詞彙"
    ],
    curriculum_outline: [
      "第1-2週：自我介紹與問候",
      "第3-4週：日常生活對話",
      "第5-6週：購物與用餐",
      "第7-8週：旅遊與交通"
    ],
    materials: ["英文會話教材", "聽力練習CD"],
    refund_policy: "開課前7天可全額退費",
    min_students: 8,
    max_students: 15,
    default_price: 3200,
    currency: "TWD",
    cover_image_url: "/images/courses/basic-english.jpg",
    is_active: true,
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },
  {
    id: 2,
    title: "基礎中文會話",
    description: "專為外國學生設計的中文會話課程，從基礎發音開始",
    short_description: "外國人中文入門課程",
    language: "CHINESE",
    level: "BEGINNER",
    duration_weeks: 10,
    total_sessions: 20,
    session_duration_minutes: 120,
    categories: ["語言學習", "中文"],
    tags: ["中文", "會話", "初學者", "發音訓練"],
    prerequisites: "無",
    learning_objectives: [
      "掌握中文基礎發音",
      "學會日常會話表達",
      "認識基本漢字"
    ],
    curriculum_outline: [
      "第1-2週：拼音與聲調",
      "第3-4週：基本問候語",
      "第5-6週：數字與時間",
      "第7-8週：購物對話",
      "第9-10週：綜合練習"
    ],
    materials: ["中文會話教材", "聽力練習CD"],
    refund_policy: "開課前5天可退費80%",
    min_students: 6,
    max_students: 12,
    default_price: 4200,
    currency: "TWD",
    cover_image_url: "/images/courses/chinese-conversation.jpg",
    is_active: true,
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },
  {
    id: 3,
    title: "商務英語進階",
    description: "針對商務環境設計的英語課程，包含會議、簡報、談判技巧",
    short_description: "商務英語專業課程",
    language: "ENGLISH",
    level: "INTERMEDIATE",
    duration_weeks: 12,
    total_sessions: 24,
    session_duration_minutes: 120,
    categories: ["商務英語", "職場溝通"],
    tags: ["商務英語", "職場溝通", "簡報技巧", "談判"],
    prerequisites: "基礎英語能力",
    learning_objectives: [
      "掌握商務會議英語",
      "學會專業簡報技巧",
      "提升商務談判能力"
    ],
    curriculum_outline: [
      "第1-3週：商務會議英語",
      "第4-6週：簡報技巧與表達",
      "第7-9週：商務談判策略",
      "第10-12週：跨文化溝通"
    ],
    materials: ["商務英語教材", "線上練習平台"],
    refund_policy: "開課前7天可全額退費",
    min_students: 10,
    max_students: 20,
    default_price: 5800,
    currency: "TWD",
    cover_image_url: "/images/courses/business-english.jpg",
    is_active: true,
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },
  {
    id: 4,
    title: "日語入門",
    description: "日語五十音開始，包含基礎語法與日常會話",
    short_description: "日語零基礎入門課程",
    language: "JAPANESE",
    level: "BEGINNER",
    duration_weeks: 14,
    total_sessions: 28,
    session_duration_minutes: 120,
    categories: ["語言學習", "日語"],
    tags: ["日語", "五十音", "入門", "基礎語法"],
    prerequisites: "無",
    learning_objectives: [
      "熟練掌握五十音",
      "學會基礎語法結構",
      "能進行簡單日常對話"
    ],
    curriculum_outline: [
      "第1-2週：平假名與片假名",
      "第3-4週：基本語法結構",
      "第5-8週：動詞變化與時態",
      "第9-12週：日常會話練習",
      "第13-14週：綜合應用"
    ],
    materials: ["日語入門教材", "發音練習CD"],
    refund_policy: "開課前5天可退費80%",
    min_students: 8,
    max_students: 18,
    default_price: 6500,
    currency: "TWD",
    cover_image_url: "/images/courses/japanese-basic.jpg",
    is_active: true,
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },
  {
    id: 5,
    title: "TOEIC 衝刺班",
    description: "針對TOEIC考試的密集訓練課程，目標分數700+",
    short_description: "TOEIC考試專班",
    language: "ENGLISH",
    level: "INTERMEDIATE",
    duration_weeks: 6,
    total_sessions: 12,
    session_duration_minutes: 180,
    categories: ["證照考試", "英語檢定"],
    tags: ["TOEIC", "證照考試", "密集班", "考試技巧"],
    prerequisites: "中級英語程度",
    learning_objectives: [
      "掌握TOEIC考試技巧",
      "提升聽力理解能力",
      "強化閱讀速度與準確度"
    ],
    curriculum_outline: [
      "第1週：考試介紹與聽力技巧",
      "第2週：閱讀理解策略",
      "第3-4週：模擬測驗與檢討",
      "第5-6週：衝刺練習與應考準備"
    ],
    materials: ["TOEIC官方指南", "模擬試題"],
    refund_policy: "開課前3天可退費50%",
    min_students: 15,
    max_students: 25,
    default_price: 4800,
    currency: "TWD",
    cover_image_url: "/images/courses/toeic-prep.jpg",
    is_active: true,
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },
  {
    id: 6,
    title: "雅思寫作專修",
    description: "專攻IELTS寫作技巧，提升學術寫作能力",
    short_description: "雅思寫作專業訓練",
    language: "ENGLISH",
    level: "ADVANCED",
    duration_weeks: 8,
    total_sessions: 16,
    session_duration_minutes: 150,
    categories: ["證照考試", "學術英語"],
    tags: ["IELTS", "雅思", "寫作", "學術英語"],
    prerequisites: "高中級英語程度",
    learning_objectives: [
      "掌握雅思寫作技巧",
      "提升學術寫作水準",
      "學會論證結構組織"
    ],
    curriculum_outline: [
      "第1-2週：Task 1 圖表描述",
      "第3-4週：Task 2 論證寫作",
      "第5-6週：語法與詞彙強化",
      "第7-8週：模考練習與評改"
    ],
    materials: ["雅思寫作指南", "範文集"],
    refund_policy: "開課前7天可全額退費",
    min_students: 8,
    max_students: 15,
    default_price: 5200,
    currency: "TWD",
    cover_image_url: "/images/courses/ielts-writing.jpg",
    is_active: true,
    created_at: "2025-07-14T12:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  }
];

// ========================================
// 輔助函數
// ========================================

// 根據語言獲取課程模組
export const getCourseModulesByLanguage = (language: string): CourseModule[] => {
  return courseModules.filter(module => module.language === language);
};

// 根據等級獲取課程模組
export const getCourseModulesByLevel = (level: string): CourseModule[] => {
  return courseModules.filter(module => module.level === level);
};

// 根據分類獲取課程模組
export const getCourseModulesByCategory = (category: string): CourseModule[] => {
  return courseModules.filter(module => 
    module.categories.includes(category)
  );
};

// 根據ID獲取課程模組
export const getCourseModuleById = (id: number): CourseModule | undefined => {
  return courseModules.find(module => module.id === id);
};

// 檢查課程模組是否有效
export const isActiveCourseModule = (module: CourseModule): boolean => {
  return module.is_active;
};

// 搜尋課程模組
export const searchCourseModules = (keyword: string): CourseModule[] => {
  const searchTerm = keyword.toLowerCase();
  return courseModules.filter(module =>
    module.title.toLowerCase().includes(searchTerm) ||
    module.description.toLowerCase().includes(searchTerm) ||
    module.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
};

// 向下相容的預設匯出
export default courseModules;