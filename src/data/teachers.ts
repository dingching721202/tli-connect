export interface Teacher {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  specialties: string[];
  languages: string[];
  experience: number;
  rating: number;
  is_active: boolean;
  profile_image: string;
  certifications: string[];
  education: string[];
  teaching_philosophy: string;
  updated_at: string;
}

export const teachers: Teacher[] = [
  {
    id: "teacher_001",
    created_at: "2024-01-01T00:00:00Z",
    name: "Jennifer Smith",
    email: "jennifer@tliconnect.com",
    phone: "+886-2-1234-5678",
    bio: "擁有10年商務英語教學經驗，專精於企業培訓和職場溝通",
    specialties: ["商務英語", "簡報技巧", "談判英語"],
    languages: ["English", "中文"],
    experience: 10,
    rating: 4.8,
    is_active: true,
    profile_image: "/images/teachers/jennifer-smith.jpg",
    certifications: ["TESOL", "Business English Certificate"],
    education: [
      "University of California, Berkeley - M.A. in Applied Linguistics",
      "Harvard University - B.A. in English Literature"
    ],
    teaching_philosophy: "I believe in creating an engaging and practical learning environment where students can apply English skills in real-world business scenarios.",
    updated_at: "2025-07-20T00:00:00Z"
  },
  {
    id: "teacher_002",
    created_at: "2024-01-15T00:00:00Z",
    name: "王老師",
    email: "teacher@example.com",
    phone: "+886-2-2345-6789",
    bio: "中文教學專家，致力於讓外國學生輕鬆學會中文",
    specialties: ["中文會話", "繁體字教學", "台灣文化"],
    languages: ["中文", "English", "Japanese"],
    experience: 8,
    rating: 4.6,
    is_active: true,
    profile_image: "/images/teachers/wang-teacher.jpg",
    certifications: ["中文教師資格證", "對外漢語教學證書"],
    education: [
      "台灣大學中國文學系碩士",
      "師範大學華語文教學研究所"
    ],
    teaching_philosophy: "透過文化融入語言教學，讓學生在學習中文的同時也能深入了解台灣文化。",
    updated_at: "2025-07-20T00:00:00Z"
  },
  {
    id: "teacher_003",
    created_at: "2024-02-01T00:00:00Z",
    name: "Michael Johnson",
    email: "michael@tliconnect.com",
    phone: "+886-2-3456-7890",
    bio: "資深商務英語培訓師，擅長企業內訓和高階主管課程",
    specialties: ["高階商務英語", "領導力溝通", "國際商務"],
    languages: ["English", "French", "中文"],
    experience: 12,
    rating: 4.9,
    is_active: true,
    profile_image: "/images/teachers/michael-johnson.jpg",
    certifications: ["Cambridge DELTA", "Business Communication Specialist"],
    education: [
      "London School of Economics - MBA",
      "Oxford University - B.A. in International Relations"
    ],
    teaching_philosophy: "Focus on practical communication skills that students can immediately apply in their professional environment.",
    updated_at: "2025-07-20T00:00:00Z"
  },
  {
    id: "teacher_004",
    created_at: "2024-02-15T00:00:00Z",
    name: "田中太郎",
    email: "tanaka@tliconnect.com",
    phone: "+886-2-4567-8901",
    bio: "來自東京的日語教學專家，專門教授日語基礎到進階課程",
    specialties: ["日語基礎", "商務日語", "日本文化"],
    languages: ["Japanese", "中文", "English"],
    experience: 7,
    rating: 4.6,
    is_active: true,
    profile_image: "/images/teachers/tanaka-taro.jpg",
    certifications: ["日語教師養成講座修了", "日本語教育能力檢定試驗合格"],
    education: [
      "早稻田大學日本語教育研究科修士",
      "東京大學文學部日本文學科"
    ],
    teaching_philosophy: "重視學生的興趣培養，透過有趣的教學方式讓學生愛上日語。",
    updated_at: "2025-07-20T00:00:00Z"
  },
  {
    id: "teacher_005",
    created_at: "2024-03-01T00:00:00Z",
    name: "Sarah Wilson",
    email: "sarah@tliconnect.com",
    phone: "+886-2-5678-9012",
    bio: "TOEIC和托福考試專家，幫助數千名學生達到理想成績",
    specialties: ["TOEIC", "TOEFL", "考試策略"],
    languages: ["English", "中文"],
    experience: 9,
    rating: 4.8,
    is_active: true,
    profile_image: "/images/teachers/sarah-wilson.jpg",
    certifications: ["ETS Certified TOEFL Instructor", "TOEIC Official Test Prep Specialist"],
    education: [
      "Columbia University - M.A. in TESOL",
      "UCLA - B.A. in Linguistics"
    ],
    teaching_philosophy: "Strategic test preparation combined with solid language foundation for lasting success.",
    updated_at: "2025-07-20T00:00:00Z"
  },
  {
    id: "teacher_006",
    created_at: "2024-03-15T00:00:00Z",
    name: "Dr. Emma Thompson",
    email: "emma@tliconnect.com",
    phone: "+886-2-6789-0123",
    bio: "學術英語和IELTS寫作專家，擁有劍橋大學語言學博士學位",
    specialties: ["IELTS", "學術寫作", "英語語言學"],
    languages: ["English", "German", "中文"],
    experience: 15,
    rating: 4.9,
    is_active: true,
    profile_image: "/images/teachers/emma-thompson.jpg",
    certifications: ["Cambridge CELTA", "IELTS Examiner Certificate"],
    education: [
      "Cambridge University - Ph.D. in Applied Linguistics",
      "Oxford University - M.A. in English Language and Literature"
    ],
    teaching_philosophy: "Academic excellence through systematic approach and personalized feedback.",
    updated_at: "2025-07-20T00:00:00Z"
  }
];

export default teachers;