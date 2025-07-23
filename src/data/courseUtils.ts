// Import TypeScript data
import { courses as coursesData } from './courses';
import { teachers as teachersData } from './teachers';

// Raw data interfaces for JSON files
interface RawCourseData {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  instructor: string;
  instructor_id: string;
  duration: string;
  price: number;
  original_price: number;
  currency: string;
  cover_image_url: string;
  categories: string[];
  language: string;
  level: string;
  max_students: number;
  current_students: number;
  rating: number;
  total_sessions: number;
  session_duration: number;
  location: string;
  is_active: boolean;
  status: string;
  tags: string[];
  prerequisites: string;
  materials: string[];
  refund_policy: string;
  start_date: string;
  end_date: string;
  enrollment_deadline: string;
  recurring: boolean;
  recurring_type: string;
  recurring_days: string[];
  waitlist_enabled: boolean;
}

interface RawTeacherData {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  specialties: string[];
  languages: string[];
  experience: number;
  rating: number;
  is_active: boolean;
  profile_image?: string;
  certifications: string[];
  education: string[];
  teaching_philosophy: string;
  created_at: string;
  updated_at: string;
}

// Type definitions based on the original files
export interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  instructor_id: string;
  duration: string;
  price: number;
  original_price: number;
  currency: string;
  category: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  language: 'english' | 'chinese' | 'japanese';
  max_students: number;
  current_students: number;
  rating: number;
  cover_image_url: string;
  location: string;
  is_active: boolean;
  status: string;
  tags: string[];
  prerequisites: string;
  materials: string[];
  refund_policy: string;
  start_date: string;
  end_date: string;
  enrollment_deadline: string;
  recurring: boolean;
  recurring_type: string;
  recurring_days: string[];
  waitlist_enabled: boolean;
  total_sessions: number;
  session_duration: number;
  updated_at: string;
  created_at: string;
}

export interface ManagedCourse {
  id: string;
  title: string;
  description: string;
  teacher: string;
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
  sessionDuration: number;
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
  experience: number;
  rating: number;
  is_active: boolean;
  profile_image?: string;
  certifications: string[];
  education: string[];
  teaching_philosophy: string;
  created_at: string;
  updated_at: string;
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

// Convert JSON data to proper interfaces
function convertToCourse(data: RawCourseData): Course {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    instructor: data.instructor,
    instructor_id: data.instructor_id,
    duration: data.duration,
    price: data.price,
    original_price: data.original_price,
    currency: data.currency,
    category: data.categories,
    level: data.level as 'beginner' | 'intermediate' | 'advanced',
    language: data.language as 'english' | 'chinese' | 'japanese',
    max_students: data.max_students,
    current_students: data.current_students,
    rating: data.rating,
    cover_image_url: data.cover_image_url,
    location: data.location,
    is_active: data.is_active,
    status: data.status,
    tags: data.tags,
    prerequisites: data.prerequisites,
    materials: data.materials,
    refund_policy: data.refund_policy,
    start_date: data.start_date,
    end_date: data.end_date,
    enrollment_deadline: data.enrollment_deadline,
    recurring: data.recurring,
    recurring_type: data.recurring_type,
    recurring_days: data.recurring_days,
    waitlist_enabled: data.waitlist_enabled,
    total_sessions: data.total_sessions,
    session_duration: data.session_duration,
    updated_at: data.updated_at,
    created_at: data.created_at
  };
}

function convertToManagedCourse(data: RawCourseData): ManagedCourse {
  return {
    id: data.id.toString(),
    title: data.title,
    description: data.description,
    teacher: data.instructor_id,
    capacity: data.max_students,
    price: data.price,
    currency: data.currency,
    startDate: data.start_date,
    endDate: data.end_date,
    startTime: data.recurring_days?.[0] ? "19:00" : "18:00", // Default time
    endTime: data.recurring_days?.[0] ? "21:00" : "20:00", // Default time
    location: data.location,
    category: data.categories?.[0] || "語言學習",
    tags: data.tags,
    status: data.status as 'draft' | 'active' | 'completed' | 'cancelled',
    enrollmentDeadline: data.enrollment_deadline,
    materials: data.materials,
    prerequisites: data.prerequisites,
    language: data.language,
    difficulty: data.level as 'beginner' | 'intermediate' | 'advanced',
    totalSessions: data.total_sessions,
    sessionDuration: data.session_duration,
    recurring: data.recurring,
    recurringType: data.recurring_type as 'weekly' | 'biweekly' | 'monthly',
    recurringDays: data.recurring_days,
    maxEnrollments: data.max_students,
    currentEnrollments: data.current_students,
    waitlistEnabled: data.waitlist_enabled,
    refundPolicy: data.refund_policy,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

// Course functions (from mockCourses.ts)
export function getCourseById(id: number): Course | undefined {
  const course = coursesData.find(course => course.id === id);
  return course ? convertToCourse(course) : undefined;
}

export function getCoursesByCategory(category: string): Course[] {
  return coursesData
    .filter(course => course.categories.includes(category))
    .map(convertToCourse);
}

export function getCoursesByLevel(level: Course['level']): Course[] {
  return coursesData
    .filter(course => course.level === level)
    .map(convertToCourse);
}

export function getCoursesByLanguage(language: Course['language']): Course[] {
  return coursesData
    .filter(course => course.language === language)
    .map(convertToCourse);
}

export function getActiveCourses(): Course[] {
  return coursesData
    .filter(course => course.is_active)
    .map(convertToCourse);
}

export function searchCourses(query: string): Course[] {
  const searchTerm = query.toLowerCase();
  return coursesData
    .filter(course =>
      course.title.toLowerCase().includes(searchTerm) ||
      course.description.toLowerCase().includes(searchTerm) ||
      course.instructor.toLowerCase().includes(searchTerm) ||
      course.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    )
    .map(convertToCourse);
}

export function getAvailableCourses(): Course[] {
  return coursesData
    .filter(course => 
      course.is_active && course.current_students < course.max_students
    )
    .map(convertToCourse);
}

export function getPopularCourses(): Course[] {
  return coursesData
    .filter(course => course.is_active)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3)
    .map(convertToCourse);
}

export function getCourseCategories(): string[] {
  const categories = new Set<string>();
  coursesData.forEach(course => {
    course.categories.forEach(category => categories.add(category));
  });
  return Array.from(categories);
}

export function getCourseInstructors(): string[] {
  const instructors = new Set(coursesData.map(course => course.instructor));
  return Array.from(instructors);
}

// Managed course functions (from courseData.ts)
export function getManagedCourses(): ManagedCourse[] {
  return coursesData.map(convertToManagedCourse);
}

export function getManagedCourseById(id: string): ManagedCourse | null {
  const course = coursesData.find(course => course.id.toString() === id);
  return course ? convertToManagedCourse(course) : null;
}

export function addManagedCourse(course: Omit<ManagedCourse, 'id' | 'createdAt' | 'updatedAt'>): ManagedCourse {
  if (typeof localStorage !== 'undefined') {
    const existingCourses = JSON.parse(localStorage.getItem('courses') || JSON.stringify(coursesData));
    const newCourse = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      title: course.title,
      description: course.description,
      instructor: course.teacher,
      instructor_id: course.teacher,
      duration: "待定",
      price: course.price,
      original_price: course.price,
      currency: course.currency,
      cover_image_url: "/images/courses/default.jpg",
      categories: [course.category],
      language: course.language,
      level: course.difficulty,
      max_students: course.capacity,
      current_students: 0,
      rating: 0,
      total_sessions: course.totalSessions,
      session_duration: course.sessionDuration,
      location: course.location,
      is_active: course.status === 'active',
      status: course.status,
      tags: course.tags,
      prerequisites: course.prerequisites,
      materials: course.materials,
      refund_policy: course.refundPolicy,
      start_date: course.startDate,
      end_date: course.endDate,
      enrollment_deadline: course.enrollmentDeadline,
      recurring: course.recurring,
      recurring_type: course.recurringType || 'weekly',
      recurring_days: course.recurringDays || [],
      waitlist_enabled: course.waitlistEnabled,
      updated_at: new Date().toISOString()
    };
    existingCourses.push(newCourse);
    localStorage.setItem('courses', JSON.stringify(existingCourses));
    return convertToManagedCourse(newCourse);
  }
  
  // Fallback for server-side
  const newCourse: ManagedCourse = {
    ...course,
    id: `course_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return newCourse;
}

export function updateManagedCourse(id: string, updates: Partial<ManagedCourse>): ManagedCourse | null {
  if (typeof localStorage !== 'undefined') {
    const existingCourses = JSON.parse(localStorage.getItem('courses') || JSON.stringify(coursesData));
    const courseIndex = existingCourses.findIndex((course: RawCourseData) => course.id.toString() === id);
    
    if (courseIndex === -1) {
      return null;
    }
    
    // Convert updates to JSON format
    const jsonUpdates: Partial<RawCourseData> = { updated_at: new Date().toISOString() };
    Object.keys(updates).forEach(key => {
      const value = updates[key as keyof ManagedCourse];
      if (value !== undefined) {
        // Map ManagedCourse fields to JSON format
        switch (key) {
          case 'capacity':
            jsonUpdates.max_students = value as number;
            break;
          case 'difficulty':
            jsonUpdates.level = value as string;
            break;
          case 'totalSessions':
            jsonUpdates.total_sessions = value as number;
            break;
          case 'sessionDuration':
            jsonUpdates.session_duration = value as number;
            break;
          case 'currentEnrollments':
            jsonUpdates.current_students = value as number;
            break;
          case 'maxEnrollments':
            jsonUpdates.max_students = value as number;
            break;
          case 'waitlistEnabled':
            jsonUpdates.waitlist_enabled = value as boolean;
            break;
          case 'refundPolicy':
            jsonUpdates.refund_policy = value as string;
            break;
          case 'startDate':
            jsonUpdates.start_date = value as string;
            break;
          case 'endDate':
            jsonUpdates.end_date = value as string;
            break;
          case 'enrollmentDeadline':
            jsonUpdates.enrollment_deadline = value as string;
            break;
          case 'recurringType':
            jsonUpdates.recurring_type = value as string;
            break;
          case 'recurringDays':
            jsonUpdates.recurring_days = value as string[];
            break;
          default:
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (jsonUpdates as any)[key] = value;
            break;
        }
      }
    });
    
    existingCourses[courseIndex] = { ...existingCourses[courseIndex], ...jsonUpdates };
    localStorage.setItem('courses', JSON.stringify(existingCourses));
    return convertToManagedCourse(existingCourses[courseIndex]);
  }
  
  return null;
}

export function deleteManagedCourse(id: string): boolean {
  if (typeof localStorage !== 'undefined') {
    const existingCourses = JSON.parse(localStorage.getItem('courses') || JSON.stringify(coursesData));
    const courseIndex = existingCourses.findIndex((course: RawCourseData) => course.id.toString() === id);
    
    if (courseIndex === -1) {
      return false;
    }
    
    existingCourses.splice(courseIndex, 1);
    localStorage.setItem('courses', JSON.stringify(existingCourses));
    return true;
  }
  
  return false;
}

// Teacher management functions
export function getTeachers(): Teacher[] {
  return teachersData as Teacher[];
}

export function getTeacherById(id: string): Teacher | null {
  return teachersData.find(teacher => teacher.id === id) as Teacher || null;
}

export function addTeacher(teacher: Omit<Teacher, 'id' | 'created_at' | 'updated_at'>): Teacher {
  if (typeof localStorage !== 'undefined') {
    const existingTeachers = JSON.parse(localStorage.getItem('teachers') || JSON.stringify(teachersData));
    const newTeacher = {
      ...teacher,
      id: `teacher_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    existingTeachers.push(newTeacher);
    localStorage.setItem('teachers', JSON.stringify(existingTeachers));
    return newTeacher as Teacher;
  }
  
  const newTeacher: Teacher = {
    ...teacher,
    id: `teacher_${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  return newTeacher;
}

export function updateTeacher(id: string, updates: Partial<Teacher>): Teacher | null {
  if (typeof localStorage !== 'undefined') {
    const existingTeachers = JSON.parse(localStorage.getItem('teachers') || JSON.stringify(teachersData));
    const teacherIndex = existingTeachers.findIndex((teacher: RawTeacherData) => teacher.id === id);
    
    if (teacherIndex === -1) {
      return null;
    }
    
    existingTeachers[teacherIndex] = {
      ...existingTeachers[teacherIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem('teachers', JSON.stringify(existingTeachers));
    return existingTeachers[teacherIndex] as Teacher;
  }
  
  return null;
}

export function deleteTeacher(id: string): boolean {
  if (typeof localStorage !== 'undefined') {
    const existingTeachers = JSON.parse(localStorage.getItem('teachers') || JSON.stringify(teachersData));
    const teacherIndex = existingTeachers.findIndex((teacher: RawTeacherData) => teacher.id === id);
    
    if (teacherIndex === -1) {
      return false;
    }
    
    existingTeachers.splice(teacherIndex, 1);
    localStorage.setItem('teachers', JSON.stringify(existingTeachers));
    return true;
  }
  
  return false;
}

// Utility functions
export function getCoursesByStatus(status: ManagedCourse['status']): ManagedCourse[] {
  return coursesData
    .filter(course => course.status === status)
    .map(convertToManagedCourse);
}

export function getCoursesByTeacher(teacherId: string): ManagedCourse[] {
  return coursesData
    .filter(course => course.instructor_id === teacherId)
    .map(convertToManagedCourse);
}

export function getDraftCourses(): ManagedCourse[] {
  return getCoursesByStatus('draft');
}

// Statistics functions
export function getCourseStatistics() {
  const totalCourses = coursesData.length;
  const activeCourses = coursesData.filter(course => course.status === 'active').length;
  const draftCourses = coursesData.filter(course => course.status === 'draft').length;
  const completedCourses = coursesData.filter(course => course.status === 'completed').length;
  
  const totalEnrollments = coursesData.reduce((total, course) => total + course.current_students, 0);
  const totalRevenue = coursesData
    .filter(course => course.status === 'active')
    .reduce((total, course) => total + (course.price * course.current_students), 0);
  
  return {
    totalCourses,
    activeCourses,
    draftCourses,
    completedCourses,
    totalEnrollments,
    totalRevenue,
    averageEnrollmentRate: totalCourses > 0 ? 
      coursesData.reduce((total, course) => total + (course.current_students / course.max_students), 0) / totalCourses : 0
  };
}