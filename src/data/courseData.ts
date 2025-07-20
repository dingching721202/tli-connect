// 課程數據管理系統 - 連動課程管理和課程預約

// 課程管理的數據結構
export interface Schedule {
  weekdays: string[];
  startTime: string;
  endTime: string;
  instructorId: string | number;
}

export interface Session {
  title: string;
  classroom: string;
  materials: string;
}

export interface GeneratedSession {
  date: string;
  title: string;
  startTime: string;
  endTime: string;
  instructorId: string | number;
  instructorName: string;
  classroom: string;
  materials: string;
}

export interface ManagedCourse {
  id?: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  totalSessions: number;
  excludeDates: string[];
  status: 'draft' | 'active' | 'completed';
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  globalSchedules: Schedule[];
  sessions: Session[];
  generatedSessions: GeneratedSession[];
}

export interface Instructor {
  id: number;
  name: string;
  email: string;
  expertise: string;
  availability: Record<string, string[]>;
  rating: number;
  courses: number[];
}

// 預約系統的數據結構（簡化版）
export interface BookingCourse {
  id: number;
  title: string;
  date: string;
  timeSlot: string;
  instructor: string;
  price: number;
  description: string;
}

// 全局數據存儲
let managedCourses: ManagedCourse[] = [];
let instructors: Instructor[] = [];

// 初始化數據
const initializeData = () => {
  // 初始化教師數據
  instructors = [
    {
      id: 1,
      name: '張老師',
      email: 'zhang@example.com',
      expertise: '商務華語、華語會話',
      availability: {
        '1': ['09:00-12:00', '14:00-17:00'],
        '2': ['09:00-12:00', '14:00-17:00'],
        '3': ['09:00-12:00', '14:00-17:00'],
        '4': ['09:00-12:00', '14:00-17:00'],
        '5': ['09:00-12:00', '14:00-17:00']
      },
      rating: 4.8,
      courses: [1]
    },
    {
      id: 2,
      name: '王老師',
      email: 'wang@example.com',
      expertise: '華語文法、華語寫作',
      availability: {
        '1': ['09:00-12:00', '14:00-17:00'],
        '2': ['09:00-12:00', '14:00-17:00'],
        '3': ['09:00-12:00', '14:00-17:00'],
        '4': ['09:00-12:00', '14:00-17:00'],
        '5': ['09:00-12:00', '14:00-17:00']
      },
      rating: 4.9,
      courses: [2]
    },
    {
      id: 3,
      name: '李老師',
      email: 'li@example.com',
      expertise: '基礎華語、華語發音',
      availability: {
        '1': ['09:00-12:00', '14:00-17:00'],
        '2': ['09:00-12:00', '14:00-17:00'],
        '3': ['09:00-12:00', '14:00-17:00'],
        '4': ['09:00-12:00', '14:00-17:00'],
        '5': ['09:00-12:00', '14:00-17:00']
      },
      rating: 4.7,
      courses: []
    }
  ];

  // 初始化課程數據
  managedCourses = [
    {
      id: 1,
      title: '商務華語會話',
      description: '提升商務溝通技巧，學習專業商務用語及會議表達',
      startDate: '2025-06-01',
      endDate: '2025-08-31',
      totalSessions: 24,
      excludeDates: [],
      status: 'active',
      category: '商務華語',
      level: 'intermediate',
      globalSchedules: [
        {
          weekdays: ['2', '4'], // 週二、週四
          startTime: '09:00',
          endTime: '10:30',
          instructorId: 1
        }
      ],
      sessions: [
        { title: '商務會議對話基礎', classroom: 'https://meet.google.com/abc-def-ghi', materials: 'https://drive.google.com/folder/d/example1' },
        { title: '商務電話溝通', classroom: 'https://meet.google.com/abc-def-ghi', materials: 'https://drive.google.com/folder/d/example1' },
        { title: '商務簡報技巧', classroom: 'https://meet.google.com/abc-def-ghi', materials: 'https://drive.google.com/folder/d/example1' }
      ],
      generatedSessions: []
    },
    {
      id: 2,
      title: '華語文法精修',
      description: '系統性學習華語文法結構與語法應用',
      startDate: '2025-06-01',
      endDate: '2025-08-31',
      totalSessions: 20,
      excludeDates: [],
      status: 'active',
      category: '華語文法',
      level: 'advanced',
      globalSchedules: [
        {
          weekdays: ['1', '3'], // 週一、週三
          startTime: '14:00',
          endTime: '15:30',
          instructorId: 2
        }
      ],
      sessions: [
        { title: '華語句型結構', classroom: 'https://meet.google.com/def-ghi-jkl', materials: 'https://drive.google.com/folder/d/example2' },
        { title: '語法應用練習', classroom: 'https://meet.google.com/def-ghi-jkl', materials: 'https://drive.google.com/folder/d/example2' }
      ],
      generatedSessions: []
    },
    {
      id: 3,
      title: '基礎華語入門',
      description: '零基礎華語學習，從發音開始系統學習',
      startDate: '2025-06-01',
      endDate: '2025-08-31',
      totalSessions: 30,
      excludeDates: [],
      status: 'active',
      category: '基礎華語',
      level: 'beginner',
      globalSchedules: [
        {
          weekdays: ['1', '3', '5'], // 週一、週三、週五
          startTime: '10:00',
          endTime: '11:30',
          instructorId: 3
        }
      ],
      sessions: [
        { title: '華語發音基礎', classroom: 'https://meet.google.com/ghi-jkl-mno', materials: 'https://drive.google.com/folder/d/example3' },
        { title: '基礎詞彙學習', classroom: 'https://meet.google.com/ghi-jkl-mno', materials: 'https://drive.google.com/folder/d/example3' },
        { title: '簡單對話練習', classroom: 'https://meet.google.com/ghi-jkl-mno', materials: 'https://drive.google.com/folder/d/example3' }
      ],
      generatedSessions: []
    }
  ];

  // 為每個課程生成具體的課程時段
  managedCourses.forEach(course => {
    course.generatedSessions = generateCourseSessions(course);
  });
};

// 生成課程時段的函數
const generateCourseSessions = (course: ManagedCourse): GeneratedSession[] => {
  const { startDate, endDate, globalSchedules, sessions, totalSessions, excludeDates } = course;
  
  if (!startDate || !endDate || globalSchedules.length === 0 || sessions.length === 0) return [];
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const generatedSessions: GeneratedSession[] = [];
  let sessionCount = 0;
  let currentSessionIndex = 0;
  
  // 遍歷日期範圍內的每一天
  const currentDate = new Date(start);
  
  while (currentDate <= end && sessionCount < totalSessions) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // 檢查是否是排除日期
    if (!excludeDates || !excludeDates.includes(dateStr)) {
      const dayOfWeek = currentDate.getDay().toString();
      
      // 遍歷每個全局時間段
      for (const schedule of globalSchedules) {
        // 檢查當前日期是否是指定的上課日
        if (schedule.weekdays.includes(dayOfWeek)) {
          // 獲取教師資訊
          const instructor = instructors.find(i => i.id === parseInt(schedule.instructorId.toString()));
          const instructorName = instructor ? instructor.name : '未指定';
          
          // 獲取對應的課程內容
          const sessionContent = sessions[currentSessionIndex % sessions.length];
          
          generatedSessions.push({
            date: dateStr,
            title: sessionContent.title || `第 ${sessionCount + 1} 堂課`,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            instructorId: schedule.instructorId,
            instructorName,
            classroom: sessionContent.classroom,
            materials: sessionContent.materials
          });
          
          sessionCount++;
          currentSessionIndex++;
          
          // 如果已達到總課程數，跳出
          if (sessionCount >= totalSessions) break;
        }
      }
    }
    
    // 移至下一天
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // 按日期排序
  return generatedSessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, totalSessions);
};

// 初始化數據
initializeData();

// API 函數

// 獲取所有管理的課程
export const getManagedCourses = (): ManagedCourse[] => {
  return managedCourses;
};

// 獲取已發布的課程
export const getActiveCourses = (): ManagedCourse[] => {
  return managedCourses.filter(course => course.status === 'active');
};

// 獲取特定課程
export const getManagedCourse = (id: number): ManagedCourse | undefined => {
  return managedCourses.find(course => course.id === id);
};

// 新增課程
export const addManagedCourse = (course: ManagedCourse): ManagedCourse => {
  const newCourse = {
    ...course,
    id: Math.max(0, ...managedCourses.map(c => c.id || 0)) + 1,
    generatedSessions: generateCourseSessions(course)
  };
  managedCourses.push(newCourse);
  return newCourse;
};

// 更新課程
export const updateManagedCourse = (id: number, updates: Partial<ManagedCourse>): ManagedCourse | null => {
  const index = managedCourses.findIndex(course => course.id === id);
  if (index === -1) return null;
  
  const updatedCourse = {
    ...managedCourses[index],
    ...updates,
    generatedSessions: generateCourseSessions({ ...managedCourses[index], ...updates })
  };
  
  managedCourses[index] = updatedCourse;
  return updatedCourse;
};

// 刪除課程
export const deleteManagedCourse = (id: number): boolean => {
  const index = managedCourses.findIndex(course => course.id === id);
  if (index === -1) return false;
  
  managedCourses.splice(index, 1);
  return true;
};

// 獲取教師列表
export const getInstructors = (): Instructor[] => {
  return instructors;
};

// 新增教師
export const addInstructor = (instructor: Omit<Instructor, 'id'>): Instructor => {
  const newInstructor = {
    ...instructor,
    id: Math.max(0, ...instructors.map(i => i.id)) + 1
  };
  instructors.push(newInstructor);
  return newInstructor;
};

// 轉換為預約系統格式的函數
export const convertToBookingCourses = (): BookingCourse[] => {
  const bookingCourses: BookingCourse[] = [];
  
  // 獲取所有已發布的課程
  const activeCourses = getActiveCourses();
  
  activeCourses.forEach(course => {
    course.generatedSessions.forEach((session, index) => {
      bookingCourses.push({
        id: parseInt(`${course.id}${String(index).padStart(3, '0')}`), // 組合 ID，例如：1001, 1002
        title: course.title,
        date: session.date,
        timeSlot: `${session.startTime}-${session.endTime}`,
        instructor: session.instructorName,
        price: 0, // 會員免費
        description: course.description
      });
    });
  });
  
  return bookingCourses.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// 獲取特定日期的課程
export const getCoursesByDate = (date: string): BookingCourse[] => {
  const allBookingCourses = convertToBookingCourses();
  return allBookingCourses.filter(course => course.date === date);
};

// 搜尋課程
export const searchCourses = (query: string): BookingCourse[] => {
  const allBookingCourses = convertToBookingCourses();
  const searchLower = query.toLowerCase();
  
  return allBookingCourses.filter(course => 
    course.title.toLowerCase().includes(searchLower) ||
    course.description.toLowerCase().includes(searchLower) ||
    course.instructor.toLowerCase().includes(searchLower)
  );
};

// 重新生成所有課程的時段（當課程數據更新時調用）
export const regenerateAllCourseSessions = (): void => {
  managedCourses.forEach(course => {
    course.generatedSessions = generateCourseSessions(course);
  });
};