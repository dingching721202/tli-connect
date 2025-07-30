import type { Teacher, TeacherLeaveRequest, TeacherSchedule } from '@/types/business';

// ========================================
// 教師資料 - MECE架構
// 管理教師資料、排程和請假記錄
// ========================================

export const teachers: Teacher[] = [
  {
    id: 1,
    user_id: 4, // 對應 users 中的王老師
    employee_id: 'TEACHER001',
    specializations: ['英文會話', '商務英語', '英語檢定'],
    languages: ['English', 'Chinese'],
    certifications: [
      {
        name: 'TESOL Certificate',
        issuer: 'TESOL International Association',
        issued_date: '2020-06-15',
        expiry_date: '2025-06-15',
        certificate_url: '/certificates/tesol-001.pdf'
      },
      {
        name: 'TOEIC Official Score 990',
        issuer: 'ETS',
        issued_date: '2019-03-20',
        certificate_url: '/certificates/toeic-990.pdf'
      }
    ],
    hourly_rate: 800,
    currency: 'TWD',
    max_students_per_class: 15,
    bio: '擁有超過8年的英語教學經驗，專精於商務英語和會話訓練。曾在多家跨國企業擔任英語培訓講師，能夠針對不同程度的學生提供客製化的教學內容。',
    years_of_experience: 8,
    rating: 4.8,
    total_reviews: 156,
    is_available: true,
    status: 'ACTIVE',
    hired_at: '2020-01-15',
    created_at: '2020-01-15T00:00:00+00:00',
    updated_at: '2024-01-15T00:00:00+00:00'
  },
  {
    id: 2,
    user_id: 7, // 假設的另一位教師
    employee_id: 'TEACHER002',
    specializations: ['日語會話', '日語文法', 'JLPT考試'],
    languages: ['Japanese', 'Chinese', 'English'],
    certifications: [
      {
        name: '日本語教師養成講座修了證',
        issuer: '日本語教育振興協會',
        issued_date: '2018-08-20',
        certificate_url: '/certificates/japanese-teacher-cert.pdf'
      }
    ],
    hourly_rate: 750,
    currency: 'TWD',
    max_students_per_class: 12,
    bio: '日語母語教師，在台灣教授日語已有6年經驗。擅長從零基礎開始的日語教學，能夠幫助學生快速掌握日語基礎和日常會話。',
    years_of_experience: 6,
    rating: 4.7,
    total_reviews: 89,
    is_available: true,
    status: 'ACTIVE',
    hired_at: '2021-03-01',
    created_at: '2021-03-01T00:00:00+00:00',
    updated_at: '2024-01-15T00:00:00+00:00'
  }
];

export const teacherSchedules: TeacherSchedule[] = [
  // 王老師的排程
  {
    id: 1,
    teacher_id: 1,
    day_of_week: 1, // Monday
    start_time: '09:00',
    end_time: '17:00',
    availability_status: 'AVAILABLE',
    max_bookings: 4,
    notes: '週一全天可授課',
    effective_from: '2024-01-01',
    created_at: '2024-01-01T00:00:00+00:00',
    updated_at: '2024-01-01T00:00:00+00:00'
  },
  {
    id: 2,
    teacher_id: 1,
    day_of_week: 2, // Tuesday
    start_time: '10:00',
    end_time: '18:00',
    availability_status: 'AVAILABLE',
    max_bookings: 4,
    effective_from: '2024-01-01',
    created_at: '2024-01-01T00:00:00+00:00',
    updated_at: '2024-01-01T00:00:00+00:00'
  },
  {
    id: 3,
    teacher_id: 1,
    day_of_week: 3, // Wednesday
    start_time: '09:00',
    end_time: '17:00',
    availability_status: 'AVAILABLE',
    max_bookings: 4,
    effective_from: '2024-01-01',
    created_at: '2024-01-01T00:00:00+00:00',
    updated_at: '2024-01-01T00:00:00+00:00'
  },
  {
    id: 4,
    teacher_id: 1,
    day_of_week: 4, // Thursday
    start_time: '10:00',
    end_time: '18:00',
    availability_status: 'AVAILABLE',
    max_bookings: 4,
    effective_from: '2024-01-01',
    created_at: '2024-01-01T00:00:00+00:00',
    updated_at: '2024-01-01T00:00:00+00:00'
  },
  {
    id: 5,
    teacher_id: 1,
    day_of_week: 5, // Friday
    start_time: '09:00',
    end_time: '16:00',
    availability_status: 'AVAILABLE',
    max_bookings: 3,
    notes: '週五下午較早結束',
    effective_from: '2024-01-01',
    created_at: '2024-01-01T00:00:00+00:00',
    updated_at: '2024-01-01T00:00:00+00:00'
  }
];

export const teacherLeaveRequests: TeacherLeaveRequest[] = [
  {
    id: 1,
    teacher_id: 1,
    leave_type: 'VACATION',
    start_date: '2024-02-10',
    end_date: '2024-02-16',
    reason: '春節假期',
    status: 'APPROVED',
    approved_by: 3, // 管理員ID
    approved_at: '2024-01-20T10:00:00+00:00',
    created_at: '2024-01-15T14:30:00+00:00',
    updated_at: '2024-01-20T10:00:00+00:00'
  },
  {
    id: 2,
    teacher_id: 1,
    leave_type: 'PERSONAL',
    start_date: '2024-03-15',
    end_date: '2024-03-15',
    reason: '個人事務',
    status: 'PENDING',
    created_at: '2024-03-10T09:15:00+00:00',
    updated_at: '2024-03-10T09:15:00+00:00'
  }
];

// ========================================
// 輔助函數
// ========================================

// 根據用戶ID獲取教師資料
export const getTeacherByUserId = (userId: number): Teacher | undefined => {
  return teachers.find(teacher => teacher.user_id === userId);
};

// 根據ID獲取教師資料
export const getTeacherById = (id: number): Teacher | undefined => {
  return teachers.find(teacher => teacher.id === id);
};

// 根據狀態獲取教師
export const getTeachersByStatus = (status: string): Teacher[] => {
  return teachers.filter(teacher => teacher.status === status);
};

// 根據專業領域獲取教師
export const getTeachersBySpecialization = (specialization: string): Teacher[] => {
  return teachers.filter(teacher => 
    teacher.specializations.includes(specialization)
  );
};

// 根據教師ID獲取排程
export const getSchedulesByTeacherId = (teacherId: number): TeacherSchedule[] => {
  return teacherSchedules.filter(schedule => schedule.teacher_id === teacherId);
};

// 根據教師ID獲取請假記錄
export const getLeaveRequestsByTeacherId = (teacherId: number): TeacherLeaveRequest[] => {
  return teacherLeaveRequests.filter(request => request.teacher_id === teacherId);
};

// 根據狀態獲取請假記錄
export const getLeaveRequestsByStatus = (status: string): TeacherLeaveRequest[] => {
  return teacherLeaveRequests.filter(request => request.status === status);
};

// 檢查教師在特定日期是否可用
export const isTeacherAvailable = (teacherId: number, date: string): boolean => {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();
  
  // 檢查是否有排程
  const schedule = teacherSchedules.find(s => 
    s.teacher_id === teacherId && 
    s.day_of_week === dayOfWeek &&
    s.availability_status === 'AVAILABLE'
  );
  
  if (!schedule) return false;
  
  // 檢查是否有請假
  const hasLeave = teacherLeaveRequests.some(request => 
    request.teacher_id === teacherId &&
    request.status === 'APPROVED' &&
    date >= request.start_date &&
    date <= request.end_date
  );
  
  return !hasLeave;
};

// 新增請假申請
export const addLeaveRequest = (request: Omit<TeacherLeaveRequest, 'id' | 'created_at' | 'updated_at'>): void => {
  const newRequest: TeacherLeaveRequest = {
    ...request,
    id: Math.max(...teacherLeaveRequests.map(r => r.id), 0) + 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  teacherLeaveRequests.push(newRequest);
};

// 獲取所有活躍教師
export const getActiveTeachers = (): Teacher[] => {
  return teachers.filter(teacher => teacher.status === 'ACTIVE' && teacher.is_available);
};

// 教師數據服務物件
export const teacherDataService = {
  getTeacherById,
  getTeacherByUserId,
  getTeachersByStatus,
  getTeachersBySpecialization,
  getActiveTeachers,
  getSchedulesByTeacherId,
  getLeaveRequestsByTeacherId,
  getLeaveRequestsByStatus,
  isTeacherAvailable,
  addLeaveRequest
};

// 向下相容的預設匯出
export { teachers as default };