export interface ManagedCourse {
  id?: string;
  title: string;
  description: string;
  instructor: string;
  capacity: number;
  price: number;
  currency: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  category: string;
  tags: string[];
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  enrollmentDeadline: string;
  materials: string[];
  prerequisites: string;
  language: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  totalSessions: number;
  sessionDuration: number; // in minutes
  recurring: boolean;
  recurringType?: 'weekly' | 'biweekly' | 'monthly';
  recurringDays?: string[];
  maxEnrollments: number;
  currentEnrollments: number;
  waitlistEnabled: boolean;
  refundPolicy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  specialties: string[];
  languages: string[];
  experience: number; // years
  rating: number;
  isActive: boolean;
  profileImage?: string;
  certifications: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseSession {
  id: string;
  courseId: string;
  sessionNumber: number;
  date: string;
  startTime: string;
  endTime: string;
  topic: string;
  description?: string;
  materials?: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
  attendanceCount?: number;
}

export interface GeneratedSession {
  sessionNumber: number;
  date: string;
  startTime: string;
  endTime: string;
  topic: string;
}

// Mock data
const managedCourses: ManagedCourse[] = [
  {
    id: 'course_001',
    title: '進階商務英語',
    description: '針對商務環境設計的英語課程，涵蓋會議、簡報、談判等場景',
    instructor: 'teacher_001',
    capacity: 20,
    price: 5000,
    currency: 'TWD',
    startDate: '2024-08-01',
    endDate: '2024-10-30',
    startTime: '19:00',
    endTime: '21:00',
    location: '線上',
    category: '語言學習',
    tags: ['英語', '商務', '職場'],
    status: 'active',
    enrollmentDeadline: '2024-07-25',
    materials: ['商務英語教材', '線上練習平台'],
    prerequisites: '基礎英語能力',
    language: 'english',
    difficulty: 'intermediate',
    totalSessions: 12,
    sessionDuration: 120,
    recurring: true,
    recurringType: 'weekly',
    recurringDays: ['Tuesday'],
    maxEnrollments: 20,
    currentEnrollments: 15,
    waitlistEnabled: true,
    refundPolicy: '開課前7天可全額退費',
    createdAt: '2024-07-10T00:00:00Z',
    updatedAt: '2024-07-20T00:00:00Z'
  },
  {
    id: 'course_002',
    title: '基礎中文會話',
    description: '適合初學者的中文會話課程，注重日常對話練習',
    instructor: 'teacher_002',
    capacity: 15,
    price: 3000,
    currency: 'TWD',
    startDate: '2024-08-15',
    endDate: '2024-11-15',
    startTime: '18:30',
    endTime: '20:00',
    location: '台北教室',
    category: '語言學習',
    tags: ['中文', '會話', '初學者'],
    status: 'active',
    enrollmentDeadline: '2024-08-08',
    materials: ['中文會話教材', '聽力練習CD'],
    prerequisites: '無',
    language: 'chinese',
    difficulty: 'beginner',
    totalSessions: 16,
    sessionDuration: 90,
    recurring: true,
    recurringType: 'weekly',
    recurringDays: ['Thursday'],
    maxEnrollments: 15,
    currentEnrollments: 8,
    waitlistEnabled: false,
    refundPolicy: '開課前5天可退費80%',
    createdAt: '2024-07-12T00:00:00Z',
    updatedAt: '2024-07-20T00:00:00Z'
  }
];

const teachers: Teacher[] = [
  {
    id: 'teacher_001',
    name: 'Jennifer Smith',
    email: 'jennifer@tliconnect.com',
    phone: '+886-2-1234-5678',
    bio: '擁有10年商務英語教學經驗，專精於企業培訓和職場溝通',
    specialties: ['商務英語', '簡報技巧', '談判英語'],
    languages: ['English', '中文'],
    experience: 10,
    rating: 4.8,
    isActive: true,
    certifications: ['TESOL', 'Business English Certificate'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-07-20T00:00:00Z'
  },
  {
    id: 'teacher_002',
    name: '王小明',
    email: 'wang@tliconnect.com',
    phone: '+886-2-2345-6789',
    bio: '中文教學專家，致力於讓外國學生輕鬆學會中文',
    specialties: ['中文會話', '繁體字教學', '台灣文化'],
    languages: ['中文', 'English', 'Japanese'],
    experience: 8,
    rating: 4.6,
    isActive: true,
    certifications: ['中文教師資格證', '對外漢語教學證書'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-07-20T00:00:00Z'
  }
];

// Course management functions
export function getManagedCourses(): ManagedCourse[] {
  return managedCourses;
}

export function getManagedCourseById(id: string): ManagedCourse | null {
  return managedCourses.find(course => course.id === id) || null;
}

export function addManagedCourse(course: Omit<ManagedCourse, 'id' | 'createdAt' | 'updatedAt'>): ManagedCourse {
  const newCourse: ManagedCourse = {
    ...course,
    id: `course_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  managedCourses.push(newCourse);
  return newCourse;
}

export function updateManagedCourse(id: string, updates: Partial<ManagedCourse>): ManagedCourse | null {
  const courseIndex = managedCourses.findIndex(course => course.id === id);
  
  if (courseIndex === -1) {
    return null;
  }
  
  managedCourses[courseIndex] = {
    ...managedCourses[courseIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  return managedCourses[courseIndex];
}

export function deleteManagedCourse(id: string): boolean {
  const courseIndex = managedCourses.findIndex(course => course.id === id);
  
  if (courseIndex === -1) {
    return false;
  }
  
  managedCourses.splice(courseIndex, 1);
  return true;
}

// Teacher management functions
export function getTeachers(): Teacher[] {
  return teachers;
}

export function getTeacherById(id: string): Teacher | null {
  return teachers.find(teacher => teacher.id === id) || null;
}

export function addTeacher(teacher: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>): Teacher {
  const newTeacher: Teacher = {
    ...teacher,
    id: `teacher_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  teachers.push(newTeacher);
  return newTeacher;
}

export function updateTeacher(id: string, updates: Partial<Teacher>): Teacher | null {
  const teacherIndex = teachers.findIndex(teacher => teacher.id === id);
  
  if (teacherIndex === -1) {
    return null;
  }
  
  teachers[teacherIndex] = {
    ...teachers[teacherIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  return teachers[teacherIndex];
}

export function deleteTeacher(id: string): boolean {
  const teacherIndex = teachers.findIndex(teacher => teacher.id === id);
  
  if (teacherIndex === -1) {
    return false;
  }
  
  teachers.splice(teacherIndex, 1);
  return true;
}

// Utility functions
export function getCoursesByStatus(status: ManagedCourse['status']): ManagedCourse[] {
  return managedCourses.filter(course => course.status === status);
}

export function getCoursesByCategory(category: string): ManagedCourse[] {
  return managedCourses.filter(course => course.category === category);
}

export function getCoursesByInstructor(instructorId: string): ManagedCourse[] {
  return managedCourses.filter(course => course.instructor === instructorId);
}

export function getActiveCourses(): ManagedCourse[] {
  return getCoursesByStatus('active');
}

export function getDraftCourses(): ManagedCourse[] {
  return getCoursesByStatus('draft');
}

export function searchCourses(query: string): ManagedCourse[] {
  const lowerQuery = query.toLowerCase();
  return managedCourses.filter(course =>
    course.title.toLowerCase().includes(lowerQuery) ||
    course.description.toLowerCase().includes(lowerQuery) ||
    course.category.toLowerCase().includes(lowerQuery) ||
    course.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

// Statistics functions
export function getCourseStatistics() {
  const totalCourses = managedCourses.length;
  const activeCourses = getCoursesByStatus('active').length;
  const draftCourses = getCoursesByStatus('draft').length;
  const completedCourses = getCoursesByStatus('completed').length;
  
  const totalEnrollments = managedCourses.reduce((total, course) => total + course.currentEnrollments, 0);
  const totalRevenue = managedCourses
    .filter(course => course.status === 'active')
    .reduce((total, course) => total + (course.price * course.currentEnrollments), 0);
  
  return {
    totalCourses,
    activeCourses,
    draftCourses,
    completedCourses,
    totalEnrollments,
    totalRevenue,
    averageEnrollmentRate: totalCourses > 0 ? 
      managedCourses.reduce((total, course) => total + (course.currentEnrollments / course.maxEnrollments), 0) / totalCourses : 0
  };
}