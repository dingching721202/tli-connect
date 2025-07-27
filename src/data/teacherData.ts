// Teacher data management service
// This service provides teacher data for course scheduling, authentication, and booking systems

export interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  lastLogin: string;
  
  // Professional Info
  teachingCategory: string[];
  expertise: string[];
  experience: string;
  qualification: string[];
  bio: string;
  languages: string[];
  
  // Teaching Info
  teachingHours: number;
  rating: number;
  totalStudents: number;
  completedCourses: number;
  
  // Account Info
  accountStatus: 'verified' | 'pending' | 'rejected';
  salary: number;
  contractType: 'full-time' | 'part-time' | 'freelance';
  
  // Contact Info
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  
  // Auth Info
  password?: string;
  role: 'TEACHER';
  avatar?: string;
}

// Default teacher data - this would be loaded from localStorage or API
const defaultTeachers: Teacher[] = [
  {
    id: 1,
    name: '王老師',
    email: 'teacher@example.com',
    phone: '0912-345-678',
    status: 'active',
    joinDate: '2024-01-15',
    lastLogin: '2024-12-20',
    teachingCategory: ['中文', '商業'],
    expertise: ['商務華語', '生活華語'],
    experience: '3-5年',
    qualification: ['TOCFL認證', '華語教學能力證書'],
    bio: '專精商務華語教學，擁有豐富的企業培訓經驗。',
    languages: ['中文(母語)', '英文(流利)'],
    teachingHours: 520,
    rating: 4.8,
    totalStudents: 156,
    completedCourses: 89,
    accountStatus: 'verified',
    salary: 60000,
    contractType: 'full-time',
    address: '台北市信義區信義路五段7號',
    emergencyContact: '王小明',
    emergencyPhone: '0987-654-321',
    role: 'TEACHER',
    avatar: 'https://www.gravatar.com/avatar/?d=mp&s=32',
    password: 'password'
  },
  {
    id: 2,
    name: '李老師',
    email: 'li@example.com',
    phone: '0923-456-789',
    status: 'active',
    joinDate: '2024-03-10',
    lastLogin: '2024-12-19',
    teachingCategory: ['中文'],
    expertise: ['日常會話', 'HSK準備'],
    experience: '3-5年',
    qualification: ['HSK考官證書'],
    bio: '專注於日常會話和HSK考試準備，教學方式活潑有趣。',
    languages: ['中文(母語)', '日文(中等)'],
    teachingHours: 320,
    rating: 4.6,
    totalStudents: 98,
    completedCourses: 67,
    accountStatus: 'verified',
    salary: 45000,
    contractType: 'part-time',
    address: '台北市大安區敦化南路二段216號',
    emergencyContact: '李美華',
    emergencyPhone: '0912-987-654',
    role: 'TEACHER',
    avatar: 'https://www.gravatar.com/avatar/?d=mp&s=32',
    password: 'password'
  },
  {
    id: 3,
    name: '張老師',
    email: 'zhang@example.com',
    phone: '0934-567-890',
    status: 'active',
    joinDate: '2023-09-01',
    lastLogin: '2024-11-15',
    teachingCategory: ['中文', '文化'],
    expertise: ['兒童華語', '青少年華語'],
    experience: '6-10年',
    qualification: ['兒童華語教學證書', 'TESOL認證'],
    bio: '專門教授兒童和青少年華語，深受學生喜愛。',
    languages: ['中文(母語)', '英文(流利)', '韓文(初級)'],
    teachingHours: 680,
    rating: 4.9,
    totalStudents: 203,
    completedCourses: 134,
    accountStatus: 'verified',
    salary: 55000,
    contractType: 'full-time',
    address: '新北市板橋區中山路一段161號',
    emergencyContact: '張大明',
    emergencyPhone: '0956-123-456',
    role: 'TEACHER',
    avatar: 'https://www.gravatar.com/avatar/?d=mp&s=32',
    password: 'password'
  }
];

// Teacher data service class
class TeacherDataService {
  private static instance: TeacherDataService;
  private teachers: Teacher[] = [];

  private constructor() {
    this.loadTeachers();
  }

  public static getInstance(): TeacherDataService {
    if (!TeacherDataService.instance) {
      TeacherDataService.instance = new TeacherDataService();
    }
    return TeacherDataService.instance;
  }

  // Load teachers from localStorage or use defaults
  private loadTeachers(): void {
    if (typeof window !== 'undefined') {
      try {
        const storedTeachers = localStorage.getItem('teachers');
        if (storedTeachers) {
          const parsed = JSON.parse(storedTeachers);
          // 如果 localStorage 是空數組，重新載入默認數據
          if (Array.isArray(parsed) && parsed.length === 0) {
            this.teachers = [...defaultTeachers];
            this.saveTeachers();
          } else {
            this.teachers = parsed;
          }
        } else {
          this.teachers = [...defaultTeachers];
          this.saveTeachers();
        }
      } catch (error) {
        console.error('Error loading teachers:', error);
        this.teachers = [...defaultTeachers];
        this.saveTeachers();
      }
    } else {
      this.teachers = [...defaultTeachers];
    }
  }

  // Save teachers to localStorage
  private saveTeachers(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('teachers', JSON.stringify(this.teachers));
        // Trigger update event for other components
        window.dispatchEvent(new CustomEvent('teachersUpdated'));
      } catch (error) {
        console.error('Error saving teachers:', error);
      }
    }
  }

  // Get all teachers
  public getAllTeachers(): Teacher[] {
    return [...this.teachers];
  }

  // Get active teachers (for course scheduling)
  public getActiveTeachers(): Teacher[] {
    return this.teachers.filter(teacher => teacher.status === 'active');
  }

  // Get teacher by ID
  public getTeacherById(id: number): Teacher | null {
    return this.teachers.find(teacher => teacher.id === id) || null;
  }

  // Get teacher by email (for authentication)
  public getTeacherByEmail(email: string): Teacher | null {
    return this.teachers.find(teacher => teacher.email === email) || null;
  }

  // Add new teacher
  public addTeacher(teacherData: Omit<Teacher, 'id' | 'role' | 'teachingHours' | 'rating' | 'totalStudents' | 'completedCourses' | 'accountStatus' | 'lastLogin'>): Teacher {
    const newTeacher: Teacher = {
      ...teacherData,
      id: Math.max(...this.teachers.map(t => t.id), 0) + 1,
      role: 'TEACHER',
      teachingHours: 0,
      rating: 0,
      totalStudents: 0,
      completedCourses: 0,
      accountStatus: 'pending',
      lastLogin: '從未登入'
    };

    this.teachers.push(newTeacher);
    this.saveTeachers();
    return newTeacher;
  }

  // Update teacher
  public updateTeacher(id: number, updates: Partial<Teacher>): Teacher | null {
    const index = this.teachers.findIndex(teacher => teacher.id === id);
    if (index === -1) return null;

    this.teachers[index] = { ...this.teachers[index], ...updates };
    this.saveTeachers();
    return this.teachers[index];
  }

  // Delete teacher
  public deleteTeacher(id: number): boolean {
    const index = this.teachers.findIndex(teacher => teacher.id === id);
    if (index === -1) return false;

    this.teachers.splice(index, 1);
    this.saveTeachers();
    return true;
  }

  // Update teacher statistics (called from booking system)
  public updateTeacherStats(teacherId: number, stats: {
    teachingHours?: number;
    rating?: number;
    totalStudents?: number;
    completedCourses?: number;
  }): void {
    const teacher = this.getTeacherById(teacherId);
    if (teacher) {
      this.updateTeacher(teacherId, stats);
    }
  }

  // Get teachers for course scheduling (returns format expected by course management)
  public getTeachersForScheduling(): Array<{
    id: string;
    name: string;
    email: string;
    expertise: string[];
    status: string;
    available: boolean;
  }> {
    return this.getActiveTeachers().map(teacher => ({
      id: teacher.id.toString(),
      name: teacher.name,
      email: teacher.email,
      expertise: teacher.expertise,
      status: teacher.status,
      available: teacher.status === 'active'
    }));
  }

  // Search teachers
  public searchTeachers(query: string): Teacher[] {
    const lowercaseQuery = query.toLowerCase();
    return this.teachers.filter(teacher =>
      teacher.name.toLowerCase().includes(lowercaseQuery) ||
      teacher.email.toLowerCase().includes(lowercaseQuery) ||
      teacher.expertise.some(exp => exp.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Filter teachers by status
  public filterTeachersByStatus(status: 'active' | 'inactive' | 'suspended'): Teacher[] {
    return this.teachers.filter(teacher => teacher.status === status);
  }

  // Get teacher statistics
  public getTeacherStatistics(): {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    totalTeachingHours: number;
    totalStudents: number;
    averageRating: number;
  } {
    const active = this.teachers.filter(t => t.status === 'active').length;
    const inactive = this.teachers.filter(t => t.status === 'inactive').length;
    const suspended = this.teachers.filter(t => t.status === 'suspended').length;
    const totalTeachingHours = this.teachers.reduce((sum, t) => sum + t.teachingHours, 0);
    const totalStudents = this.teachers.reduce((sum, t) => sum + t.totalStudents, 0);
    const averageRating = this.teachers.length > 0 
      ? this.teachers.reduce((sum, t) => sum + t.rating, 0) / this.teachers.length 
      : 0;

    return {
      total: this.teachers.length,
      active,
      inactive,
      suspended,
      totalTeachingHours,
      totalStudents,
      averageRating
    };
  }
}

// Export singleton instance
export const teacherDataService = TeacherDataService.getInstance();

// Export convenience functions
export const getAllTeachers = () => teacherDataService.getAllTeachers();
export const getActiveTeachers = () => teacherDataService.getActiveTeachers();
export const getTeacherById = (id: number) => teacherDataService.getTeacherById(id);
export const getTeacherByEmail = (email: string) => teacherDataService.getTeacherByEmail(email);
export const addTeacher = (teacher: Omit<Teacher, 'id' | 'role' | 'teachingHours' | 'rating' | 'totalStudents' | 'completedCourses' | 'accountStatus' | 'lastLogin'>) => 
  teacherDataService.addTeacher(teacher);
export const updateTeacher = (id: number, updates: Partial<Teacher>) => teacherDataService.updateTeacher(id, updates);
export const deleteTeacher = (id: number) => teacherDataService.deleteTeacher(id);
export const getTeachersForScheduling = () => teacherDataService.getTeachersForScheduling();
export const searchTeachers = (query: string) => teacherDataService.searchTeachers(query);
export const getTeacherStatistics = () => teacherDataService.getTeacherStatistics();

// Export types
// Teacher is already exported as an interface above