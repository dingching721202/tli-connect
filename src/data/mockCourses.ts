export interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  price: number;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: 'english' | 'chinese' | 'japanese';
  maxStudents: number;
  currentStudents: number;
  rating: number;
  imageUrl: string;
  schedule: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  tags: string[];
}

export const mockCourses: Course[] = [
  {
    id: 1,
    title: '基礎英文會話',
    description: '適合初學者的英文會話課程，重點培養日常對話能力',
    instructor: 'Jennifer Smith',
    duration: '8週',
    price: 3200,
    category: '語言學習',
    level: 'beginner',
    language: 'english',
    maxStudents: 15,
    currentStudents: 12,
    rating: 4.8,
    imageUrl: '/images/courses/basic-english.jpg',
    schedule: [
      {
        dayOfWeek: 'Tuesday',
        startTime: '19:00',
        endTime: '21:00'
      },
      {
        dayOfWeek: 'Thursday',
        startTime: '19:00',
        endTime: '21:00'
      }
    ],
    startDate: '2024-08-01',
    endDate: '2024-09-26',
    isActive: true,
    tags: ['英文', '會話', '初學者', '小班制']
  },
  {
    id: 2,
    title: '商務英語進階',
    description: '針對商務環境設計的英語課程，包含會議、簡報、談判技巧',
    instructor: 'Michael Johnson',
    duration: '12週',
    price: 5800,
    category: '商務英語',
    level: 'intermediate',
    language: 'english',
    maxStudents: 20,
    currentStudents: 16,
    rating: 4.9,
    imageUrl: '/images/courses/business-english.jpg',
    schedule: [
      {
        dayOfWeek: 'Monday',
        startTime: '19:30',
        endTime: '21:30'
      },
      {
        dayOfWeek: 'Wednesday',
        startTime: '19:30',
        endTime: '21:30'
      }
    ],
    startDate: '2024-08-05',
    endDate: '2024-10-21',
    isActive: true,
    tags: ['商務英語', '職場溝通', '簡報技巧', '談判']
  },
  {
    id: 3,
    title: '中文會話基礎',
    description: '專為外國學生設計的中文會話課程，從基礎發音開始',
    instructor: '王小明',
    duration: '10週',
    price: 4200,
    category: '語言學習',
    level: 'beginner',
    language: 'chinese',
    maxStudents: 12,
    currentStudents: 8,
    rating: 4.7,
    imageUrl: '/images/courses/chinese-conversation.jpg',
    schedule: [
      {
        dayOfWeek: 'Tuesday',
        startTime: '18:00',
        endTime: '20:00'
      },
      {
        dayOfWeek: 'Saturday',
        startTime: '10:00',
        endTime: '12:00'
      }
    ],
    startDate: '2024-08-06',
    endDate: '2024-10-08',
    isActive: true,
    tags: ['中文', '會話', '初學者', '發音訓練']
  },
  {
    id: 4,
    title: '日語入門',
    description: '日語五十音開始，包含基礎語法與日常會話',
    instructor: '田中太郎',
    duration: '14週',
    price: 6500,
    category: '語言學習',
    level: 'beginner',
    language: 'japanese',
    maxStudents: 18,
    currentStudents: 14,
    rating: 4.6,
    imageUrl: '/images/courses/japanese-basic.jpg',
    schedule: [
      {
        dayOfWeek: 'Friday',
        startTime: '19:00',
        endTime: '21:00'
      }
    ],
    startDate: '2024-08-02',
    endDate: '2024-11-01',
    isActive: true,
    tags: ['日語', '五十音', '入門', '基礎語法']
  },
  {
    id: 5,
    title: 'TOEIC 衝刺班',
    description: '針對TOEIC考試的密集訓練課程，目標分數700+',
    instructor: 'Sarah Wilson',
    duration: '6週',
    price: 4800,
    category: '證照考試',
    level: 'intermediate',
    language: 'english',
    maxStudents: 25,
    currentStudents: 22,
    rating: 4.8,
    imageUrl: '/images/courses/toeic-prep.jpg',
    schedule: [
      {
        dayOfWeek: 'Saturday',
        startTime: '14:00',
        endTime: '17:00'
      },
      {
        dayOfWeek: 'Sunday',
        startTime: '14:00',
        endTime: '17:00'
      }
    ],
    startDate: '2024-08-03',
    endDate: '2024-09-08',
    isActive: true,
    tags: ['TOEIC', '證照考試', '密集班', '考試技巧']
  },
  {
    id: 6,
    title: '雅思寫作專修',
    description: '專攻IELTS寫作技巧，提升學術寫作能力',
    instructor: 'Dr. Emma Thompson',
    duration: '8週',
    price: 5200,
    category: '證照考試',
    level: 'advanced',
    language: 'english',
    maxStudents: 15,
    currentStudents: 11,
    rating: 4.9,
    imageUrl: '/images/courses/ielts-writing.jpg',
    schedule: [
      {
        dayOfWeek: 'Wednesday',
        startTime: '18:30',
        endTime: '21:00'
      }
    ],
    startDate: '2024-08-07',
    endDate: '2024-09-25',
    isActive: true,
    tags: ['IELTS', '雅思', '寫作', '學術英語']
  }
];

// Helper functions
export function getCourseById(id: number): Course | undefined {
  return mockCourses.find(course => course.id === id);
}

export function getCoursesByCategory(category: string): Course[] {
  return mockCourses.filter(course => course.category === category);
}

export function getCoursesByLevel(level: Course['level']): Course[] {
  return mockCourses.filter(course => course.level === level);
}

export function getCoursesByLanguage(language: Course['language']): Course[] {
  return mockCourses.filter(course => course.language === language);
}

export function getActiveCourses(): Course[] {
  return mockCourses.filter(course => course.isActive);
}

export function searchCourses(query: string): Course[] {
  const searchTerm = query.toLowerCase();
  return mockCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm) ||
    course.description.toLowerCase().includes(searchTerm) ||
    course.instructor.toLowerCase().includes(searchTerm) ||
    course.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
}

export function getAvailableCourses(): Course[] {
  return mockCourses.filter(course => 
    course.isActive && course.currentStudents < course.maxStudents
  );
}

export function getPopularCourses(): Course[] {
  return mockCourses
    .filter(course => course.isActive)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);
}

export function getCourseCategories(): string[] {
  const categories = new Set(mockCourses.map(course => course.category));
  return Array.from(categories);
}

export function getCourseInstructors(): string[] {
  const instructors = new Set(mockCourses.map(course => course.instructor));
  return Array.from(instructors);
}