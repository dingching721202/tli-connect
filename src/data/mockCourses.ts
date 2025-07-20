export interface Course {
  id: number;
  title: string;
  date: string;
  timeSlot: string;
  instructor: string;
  price: number;
  description: string;
}

export const mockCourses: Course[] = [
  // June 2025 華語文課程 (為會員免費，但仍需要價格字段用於顯示)
  {
    id: 1,
    title: "商務華語會話",
    date: "2025-06-03",
    timeSlot: "09:00-10:30",
    instructor: "張老師",
    price: 0, // 會員免費
    description: "提升商務溝通技巧，學習專業商務用語及會議表達"
  },
  {
    id: 2,
    title: "華語文寫作班",
    date: "2025-06-03",
    timeSlot: "14:00-15:30",
    instructor: "王老師",
    price: 0,
    description: "針對華語文寫作技巧進行深度訓練，包含議論文與記敘文"
  },
  {
    id: 3,
    title: "日常華語對話",
    date: "2025-06-05",
    timeSlot: "10:00-11:30",
    instructor: "陳老師",
    price: 0,
    description: "生活化華語對話練習，提升口語表達流利度"
  },
  {
    id: 4,
    title: "華語聽力強化",
    date: "2025-06-05",
    timeSlot: "15:00-16:30",
    instructor: "李老師",
    price: 0,
    description: "華語聽力技巧訓練與模擬測驗，提升聽力理解能力"
  },
  // 🎯 新增：6月8日 - 一天三堂課的完整排程
  {
    id: 5,
    title: "華語文法精修",
    date: "2025-06-08",
    timeSlot: "09:30-11:00",
    instructor: "林老師",
    price: 0,
    description: "系統性學習華語文法結構與語法應用"
  },
  {
    id: 6,
    title: "商務華語簡報",
    date: "2025-06-08",
    timeSlot: "13:00-14:30",
    instructor: "吳老師",
    price: 0,
    description: "華語商務簡報技巧與實戰演練，提升職場溝通能力"
  },
  {
    id: 7,
    title: "華語發音矯正",
    date: "2025-06-08",
    timeSlot: "16:00-17:30",
    instructor: "劉老師",
    price: 0,
    description: "華語發音技巧與聲調矯正，打造標準普通話"
  },
  // 🌟 新增：6月12日 - 另一個滿課日（5堂課，測試"更多"顯示）
  {
    id: 8,
    title: "旅遊華語",
    date: "2025-06-12",
    timeSlot: "09:00-10:30",
    instructor: "黃老師",
    price: 0,
    description: "旅遊常用華語對話與情境練習，輕鬆暢遊華語世界"
  },
  {
    id: 9,
    title: "華語朗讀訓練",
    date: "2025-06-12",
    timeSlot: "11:00-12:30",
    instructor: "周老師",
    price: 0,
    description: "華語朗讀技巧與情感表達訓練"
  },
  {
    id: 10,
    title: "學術華語寫作",
    date: "2025-06-12",
    timeSlot: "14:00-15:30",
    instructor: "鄭老師",
    price: 0,
    description: "學術論文寫作技巧與格式規範，提升學術表達能力"
  },
  {
    id: 11,
    title: "華語面試技巧",
    date: "2025-06-12",
    timeSlot: "16:30-18:00",
    instructor: "許老師",
    price: 0,
    description: "華語面試常見問題與回答技巧，增強求職競爭力"
  },
  {
    id: 12,
    title: "華語演講訓練",
    date: "2025-06-12",
    timeSlot: "19:00-20:30",
    instructor: "賴老師",
    price: 0,
    description: "華語演講技巧與表達能力訓練，提升公眾演說能力"
  },
  // 其他原有課程
  {
    id: 13,
    title: "華語閱讀理解",
    date: "2025-06-15",
    timeSlot: "10:00-11:30",
    instructor: "謝老師",
    price: 0,
    description: "華語閱讀理解技巧與文本分析能力培養"
  },
  {
    id: 14,
    title: "華語新聞閱讀",
    date: "2025-06-18",
    timeSlot: "15:00-16:30",
    instructor: "蔡老師",
    price: 0,
    description: "透過新聞文章提升華語閱讀理解能力與時事了解"
  },
  {
    id: 15,
    title: "華語書信寫作",
    date: "2025-06-20",
    timeSlot: "13:30-15:00",
    instructor: "楊老師",
    price: 0,
    description: "正式書信與電子郵件寫作技巧與格式規範"
  },
  {
    id: 16,
    title: "華語面試技巧",
    date: "2025-06-22",
    timeSlot: "09:00-10:30",
    instructor: "許老師",
    price: 0,
    description: "華語面試常見問題與回答技巧，增強求職競爭力"
  },
  {
    id: 17,
    title: "華語閱讀理解",
    date: "2025-06-25",
    timeSlot: "11:00-12:30",
    instructor: "謝老師",
    price: 0,
    description: "華語閱讀理解技巧與文本分析能力培養"
  },
  {
    id: 18,
    title: "華語新聞閱讀",
    date: "2025-06-27",
    timeSlot: "15:00-16:30",
    instructor: "蔡老師",
    price: 0,
    description: "透過新聞文章提升華語閱讀理解能力與時事了解"
  },
  {
    id: 19,
    title: "華語書信寫作",
    date: "2025-06-29",
    timeSlot: "13:30-15:00",
    instructor: "楊老師",
    price: 0,
    description: "正式書信與電子郵件寫作技巧與格式規範"
  },
  {
    id: 20,
    title: "華語演講訓練",
    date: "2025-06-29",
    timeSlot: "10:30-12:00",
    instructor: "賴老師",
    price: 0,
    description: "華語演講技巧與表達能力訓練，提升公眾演說能力"
  },
  // July 2025 華語文課程
  {
    id: 21,
    title: "初級華語會話",
    date: "2025-07-02",
    timeSlot: "09:00-10:30",
    instructor: "陳老師",
    price: 0,
    description: "華語基礎會話練習，適合初學者建立語言基礎"
  },
  {
    id: 22,
    title: "華語文化課程",
    date: "2025-07-02",
    timeSlot: "14:00-15:30",
    instructor: "王老師",
    price: 0,
    description: "透過文化學習華語，了解中華文化內涵"
  },
  {
    id: 23,
    title: "中級華語會話",
    date: "2025-07-05",
    timeSlot: "10:00-11:30",
    instructor: "李老師",
    price: 0,
    description: "中級華語會話練習，提升日常溝通能力"
  },
  {
    id: 24,
    title: "華語詞彙擴充",
    date: "2025-07-08",
    timeSlot: "09:30-11:00",
    instructor: "張老師",
    price: 0,
    description: "系統性學習華語詞彙，擴充語言表達能力"
  },
  {
    id: 25,
    title: "華語童話故事",
    date: "2025-07-10",
    timeSlot: "11:00-12:30",
    instructor: "林老師",
    price: 0,
    description: "透過童話故事學習華語，寓教於樂的學習方式"
  }
];