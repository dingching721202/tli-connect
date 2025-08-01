import type { Teacher, TeacherLeaveRequest, TeacherSchedule } from '@/types/business';

// ========================================
// 教師資料 - 已清空
// ========================================

export const teachers: Teacher[] = [];

// 從 localStorage 載入教師資料
const loadTeachersFromLocalStorage = () => {
  if (typeof localStorage !== 'undefined') {
    try {
      const savedTeachers = localStorage.getItem('teachers');
      if (savedTeachers) {
        const parsedTeachers = JSON.parse(savedTeachers);
        teachers.length = 0; // 清空現有資料
        teachers.push(...parsedTeachers);
        console.log('✅ 教師資料已從 localStorage 載入', teachers.length, '筆記錄');
      }
    } catch (error) {
      console.error('❌ 從 localStorage 載入教師資料失敗:', error);
    }
  }
};

// 初始化時載入資料
loadTeachersFromLocalStorage();
export const teacherLeaveRequests: TeacherLeaveRequest[] = [];
export const teacherSchedules: TeacherSchedule[] = [];

// ========================================
// 輔助函數
// ========================================

// 根據ID獲取教師
export const getTeacherById = (id: number): Teacher | undefined => {
  return teachers.find(teacher => teacher.id === id);
};

// 根據Email獲取教師 (需要配合用戶系統)
export const getTeacherByEmail = (email: string): Teacher | undefined => {
  // 注意：Teacher 接口沒有直接的 email 屬性，需要通過 user_id 關聯到 User 系統
  // 這個函數保留是為了向下兼容，實際使用時可能需要在調用處處理
  return undefined;
};

// 獲取活躍教師
export const getActiveTeachers = (): Teacher[] => {
  return teachers.filter(teacher => teacher.status === 'ACTIVE');
};

// 教師資料服務物件
export const teacherDataService = {
  getAll: () => teachers,
  getAllTeachers: () => teachers,
  getById: (id: number) => getTeacherById(id),
  getTeacherById: (id: number) => getTeacherById(id),
  getTeacherByEmail: (email: string) => getTeacherByEmail(email),
  getActive: () => getActiveTeachers(),
  create: (teacher: Omit<Teacher, 'id'>) => {
    const newTeacher = { ...teacher, id: Math.max(...teachers.map(t => t.id), 0) + 1 };
    teachers.push(newTeacher);
    
    // 儲存到 localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('teachers', JSON.stringify(teachers));
    }
    
    return newTeacher;
  },
  addTeacher: (teacherData: any) => {
    // 將傳入的資料轉換為正確的 Teacher 格式
    const newTeacher: Teacher = {
      id: Math.max(...teachers.map(t => t.id), 0) + 1,
      user_id: teacherData.user_id || 0,
      employee_id: teacherData.employee_id || undefined,
      specializations: teacherData.specializations || teacherData.teaching_category || teacherData.teachingCategory || [],
      languages: teacherData.languages || [],
      certifications: teacherData.certifications || [],
      hourly_rate: teacherData.hourly_rate || teacherData.salary || 0,
      currency: teacherData.currency || 'TWD',
      max_students_per_class: teacherData.max_students_per_class || 20,
      bio: teacherData.bio || '',
      years_of_experience: parseInt(teacherData.years_of_experience || teacherData.experience?.replace('年', '') || '0'),
      rating: teacherData.rating || 0,
      total_reviews: teacherData.total_reviews || 0,
      is_available: teacherData.is_available !== false,
      status: teacherData.status === 'active' ? 'ACTIVE' : (teacherData.status || 'ACTIVE'),
      hired_at: teacherData.hired_at || teacherData.join_date || new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    teachers.push(newTeacher);
    
    // 儲存到 localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('teachers', JSON.stringify(teachers));
    }
    
    return newTeacher;
  },
  update: (id: number, updates: Partial<Teacher>) => {
    const index = teachers.findIndex(t => t.id === id);
    if (index !== -1) {
      teachers[index] = { ...teachers[index], ...updates };
      
      // 儲存到 localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('teachers', JSON.stringify(teachers));
      }
      
      return teachers[index];
    }
    return null;
  },
  delete: (id: number) => {
    const index = teachers.findIndex(t => t.id === id);
    if (index !== -1) {
      teachers.splice(index, 1);
      
      // 儲存到 localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('teachers', JSON.stringify(teachers));
      }
      
      return true;
    }
    return false;
  }
};

// 獲取統計
export const getTeacherStatistics = () => {
  return {
    total: teachers.length,
    active: teachers.filter(t => t.status === 'ACTIVE').length,
    leave_requests: teacherLeaveRequests.length
  };
};

// 向下相容的預設匯出
export default teachers;