import type { Teacher, TeacherLeaveRequest, TeacherSchedule } from '@/types/business';

// ========================================
// 教師資料 - 已清空
// ========================================

export const teachers: Teacher[] = [];
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
    return newTeacher;
  },
  update: (id: number, updates: Partial<Teacher>) => {
    const index = teachers.findIndex(t => t.id === id);
    if (index !== -1) {
      teachers[index] = { ...teachers[index], ...updates };
      return teachers[index];
    }
    return null;
  },
  delete: (id: number) => {
    const index = teachers.findIndex(t => t.id === id);
    if (index !== -1) {
      teachers.splice(index, 1);
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