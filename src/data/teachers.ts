// Teachers data management service
// This service provides teacher data for course scheduling, authentication, and booking systems
// Consolidated from teacherData.ts with integrated teacher profiles

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

// Default teacher data - integrated from both data sources
const defaultTeachers: Teacher[] = [
  {
    id: 1,
    name: 'Jennifer Smith',
    email: 'jennifer@tliconnect.com',
    phone: '+886-2-1234-5678',
    status: 'active',
    joinDate: '2024-01-01',
    lastLogin: '2025-07-20',
    teachingCategory: ['英文', '商業'],
    expertise: ['商務英語', '簡報技巧', '談判英語'],
    experience: '10年以上',
    qualification: ['TESOL', 'Business English Certificate'],
    bio: '擁有10年商務英語教學經驗，專精於企業培訓和職場溝通',
    languages: ['English(母語)', '中文(流利)'],
    teachingHours: 800,
    rating: 4.8,
    totalStudents: 250,
    completedCourses: 120,
    accountStatus: 'verified',
    salary: 80000,
    contractType: 'full-time',
    address: '台北市信義區信義路五段7號',
    emergencyContact: 'John Smith',
    emergencyPhone: '+886-2-1234-9999',
    role: 'TEACHER',
    avatar: '/images/teachers/jennifer-smith.jpg',
    password: 'password'
  },
  {
    id: 2,
    name: '王老師',
    email: 'teacher@example.com',
    phone: '+886-2-2345-6789',
    status: 'active',
    joinDate: '2024-01-15',
    lastLogin: '2025-07-20',
    teachingCategory: ['中文', '文化'],
    expertise: ['中文會話', '繁體字教學', '台灣文化'],
    experience: '6-10年',
    qualification: ['中文教師資格證', '對外漢語教學證書'],
    bio: '中文教學專家，致力於讓外國學生輕鬆學會中文',
    languages: ['中文(母語)', 'English(流利)', 'Japanese(中等)'],
    teachingHours: 620,
    rating: 4.6,
    totalStudents: 180,
    completedCourses: 95,
    accountStatus: 'verified',
    salary: 65000,
    contractType: 'full-time',
    address: '台北市大安區敦化南路二段216號',
    emergencyContact: '王小明',
    emergencyPhone: '0987-654-321',
    role: 'TEACHER',
    avatar: '/images/teachers/wang-teacher.jpg',
    password: 'password'
  },
  {
    id: 3,
    name: 'Michael Johnson',
    email: 'michael@tliconnect.com',
    phone: '+886-2-3456-7890',
    status: 'active',
    joinDate: '2024-02-01',
    lastLogin: '2025-07-20',
    teachingCategory: ['英文', '商業'],
    expertise: ['高階商務英語', '領導力溝通', '國際商務'],
    experience: '10年以上',
    qualification: ['Cambridge DELTA', 'Business Communication Specialist'],
    bio: '資深商務英語培訓師，擅長企業內訓和高階主管課程',
    languages: ['English(母語)', 'French(流利)', '中文(中等)'],
    teachingHours: 920,
    rating: 4.9,
    totalStudents: 300,
    completedCourses: 145,
    accountStatus: 'verified',
    salary: 95000,
    contractType: 'full-time',
    address: '台北市信義區松仁路32號',
    emergencyContact: 'Mary Johnson',
    emergencyPhone: '+886-2-3456-9999',
    role: 'TEACHER',
    avatar: '/images/teachers/michael-johnson.jpg',
    password: 'password'
  },
  {
    id: 4,
    name: '田中太郎',
    email: 'tanaka@tliconnect.com',
    phone: '+886-2-4567-8901',
    status: 'active',
    joinDate: '2024-02-15',
    lastLogin: '2025-07-20',
    teachingCategory: ['日文', '文化'],
    expertise: ['日語基礎', '商務日語', '日本文化'],
    experience: '6-10年',
    qualification: ['日語教師養成講座修了', '日本語教育能力檢定試驗合格'],
    bio: '來自東京的日語教學專家，專門教授日語基礎到進階課程',
    languages: ['Japanese(母語)', '中文(流利)', 'English(中等)'],
    teachingHours: 540,
    rating: 4.6,
    totalStudents: 160,
    completedCourses: 85,
    accountStatus: 'verified',
    salary: 70000,
    contractType: 'full-time',
    address: '台北市中山區中山北路二段48號',
    emergencyContact: '田中花子',
    emergencyPhone: '+886-2-4567-9999',
    role: 'TEACHER',
    avatar: '/images/teachers/tanaka-taro.jpg',
    password: 'password'
  },
  {
    id: 5,
    name: 'Sarah Wilson',
    email: 'sarah@tliconnect.com',
    phone: '+886-2-5678-9012',
    status: 'active',
    joinDate: '2024-03-01',
    lastLogin: '2025-07-20',
    teachingCategory: ['英文'],
    expertise: ['TOEIC', 'TOEFL', '考試策略'],
    experience: '6-10年',
    qualification: ['ETS Certified TOEFL Instructor', 'TOEIC Official Test Prep Specialist'],
    bio: 'TOEIC和托福考試專家，幫助數千名學生達到理想成績',
    languages: ['English(母語)', '中文(流利)'],
    teachingHours: 720,
    rating: 4.8,
    totalStudents: 220,
    completedCourses: 110,
    accountStatus: 'verified',
    salary: 75000,
    contractType: 'full-time',
    address: '台北市大安區復興南路一段390號',
    emergencyContact: 'David Wilson',
    emergencyPhone: '+886-2-5678-9999',
    role: 'TEACHER',
    avatar: '/images/teachers/sarah-wilson.jpg',
    password: 'password'
  },
  {
    id: 6,
    name: 'Dr. Emma Thompson',
    email: 'emma@tliconnect.com',
    phone: '+886-2-6789-0123',
    status: 'active',
    joinDate: '2024-03-15',
    lastLogin: '2025-07-20',
    teachingCategory: ['英文'],
    expertise: ['IELTS', '學術寫作', '英語語言學'],
    experience: '10年以上',
    qualification: ['Cambridge CELTA', 'IELTS Examiner Certificate'],
    bio: '學術英語和IELTS寫作專家，擁有劍橋大學語言學博士學位',
    languages: ['English(母語)', 'German(流利)', '中文(中等)'],
    teachingHours: 850,
    rating: 4.9,
    totalStudents: 280,
    completedCourses: 140,
    accountStatus: 'verified',
    salary: 90000,
    contractType: 'full-time',
    address: '台北市中正區重慶南路一段122號',
    emergencyContact: 'Robert Thompson',
    emergencyPhone: '+886-2-6789-9999',
    role: 'TEACHER',
    avatar: '/images/teachers/emma-thompson.jpg',
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
        const dataVersion = localStorage.getItem('teachersDataVersion');
        const currentVersion = '2.0'; // 版本號用於檢測數據結構變化
        
        if (storedTeachers && dataVersion === currentVersion) {
          const parsed = JSON.parse(storedTeachers);
          // 如果 localStorage 是空數組，重新載入默認數據
          if (Array.isArray(parsed) && parsed.length === 0) {
            this.teachers = [...defaultTeachers];
            this.saveTeachers();
          } else {
            this.teachers = parsed;
          }
        } else {
          // 第一次使用或版本不匹配，載入新的默認數據
          console.log('Loading new teacher data (6 teachers)...');
          this.teachers = [...defaultTeachers];
          this.saveTeachers();
          localStorage.setItem('teachersDataVersion', currentVersion);
        }
      } catch (error) {
        console.error('Error loading teachers:', error);
        this.teachers = [...defaultTeachers];
        this.saveTeachers();
        localStorage.setItem('teachersDataVersion', '2.0');
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

  // Reset to default teachers (for testing/admin use)
  public resetToDefaultTeachers(): void {
    this.teachers = [...defaultTeachers];
    this.saveTeachers();
    if (typeof window !== 'undefined') {
      localStorage.setItem('teachersDataVersion', '2.0');
      console.log('Teachers data reset to 6 default teachers');
    }
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
export const resetToDefaultTeachers = () => teacherDataService.resetToDefaultTeachers();

// Export types
// Teacher is already exported as an interface above