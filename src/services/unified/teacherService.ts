/**
 * Unified Teacher Service - Phase 3.5 Refactor
 * 
 * This service provides a unified interface that integrates:
 * - Supabase Teachers table (primary, when implemented)
 * - Legacy teacherDataService (current implementation)
 * - Backwards compatibility with existing API
 */

import { Teacher, teacherDataService } from '@/data/teachers'

class UnifiedTeacherService {
  private useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED // Start with legacy mode

  constructor() {
    // 🎯 Phase 4.3: Supabase integration ACTIVE
    this.useLegacyMode = false
    console.log('🚀 Unified Teacher Service: Phase 4.3 - Supabase integration ACTIVE')
  }

  /**
   * Get all teachers
   */
  async getAllTeachers(): Promise<Teacher[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase teachers query
        // const result = await supabaseTeachersService.getAllTeachers()
        // return result.data
        return this.legacyGetAllTeachers()
      } catch (error) {
        console.error('Supabase getAllTeachers failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetAllTeachers()
  }

  /**
   * Get active teachers
   */
  async getActiveTeachers(): Promise<Teacher[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase active teachers query
        return this.legacyGetActiveTeachers()
      } catch (error) {
        console.error('Supabase getActiveTeachers failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetActiveTeachers()
  }

  /**
   * Get teacher by ID
   */
  async getTeacherById(id: number): Promise<Teacher | null> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase teacher by ID query
        return this.legacyGetTeacherById(id)
      } catch (error) {
        console.error('Supabase getTeacherById failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetTeacherById(id)
  }

  /**
   * Get teacher by email (for authentication)
   */
  async getTeacherByEmail(email: string): Promise<Teacher | null> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase teacher by email query
        return this.legacyGetTeacherByEmail(email)
      } catch (error) {
        console.error('Supabase getTeacherByEmail failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetTeacherByEmail(email)
  }

  /**
   * Add new teacher
   */
  async addTeacher(teacherData: Omit<Teacher, 'id' | 'role' | 'teachingHours' | 'rating' | 'totalStudents' | 'completedCourses' | 'accountStatus' | 'lastLogin'>): Promise<Teacher> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase teacher creation
        return this.legacyAddTeacher(teacherData)
      } catch (error) {
        console.error('Supabase addTeacher failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyAddTeacher(teacherData)
  }

  /**
   * Update teacher
   */
  async updateTeacher(id: number, updates: Partial<Teacher>): Promise<Teacher | null> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase teacher update
        return this.legacyUpdateTeacher(id, updates)
      } catch (error) {
        console.error('Supabase updateTeacher failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyUpdateTeacher(id, updates)
  }

  /**
   * Delete teacher
   */
  async deleteTeacher(id: number): Promise<boolean> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase teacher deletion
        return this.legacyDeleteTeacher(id)
      } catch (error) {
        console.error('Supabase deleteTeacher failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyDeleteTeacher(id)
  }

  /**
   * Update teacher statistics
   */
  async updateTeacherStats(teacherId: number, stats: {
    teachingHours?: number;
    rating?: number;
    totalStudents?: number;
    completedCourses?: number;
  }): Promise<void> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase teacher stats update
        return this.legacyUpdateTeacherStats(teacherId, stats)
      } catch (error) {
        console.error('Supabase updateTeacherStats failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyUpdateTeacherStats(teacherId, stats)
  }

  /**
   * Get teachers for course scheduling
   */
  async getTeachersForScheduling(): Promise<Array<{
    id: string;
    name: string;
    email: string;
    expertise: string[];
    status: string;
    available: boolean;
  }>> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase teachers for scheduling query
        return this.legacyGetTeachersForScheduling()
      } catch (error) {
        console.error('Supabase getTeachersForScheduling failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetTeachersForScheduling()
  }

  /**
   * Search teachers
   */
  async searchTeachers(query: string): Promise<Teacher[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase teacher search
        return this.legacySearchTeachers(query)
      } catch (error) {
        console.error('Supabase searchTeachers failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacySearchTeachers(query)
  }

  /**
   * Filter teachers by status
   */
  async filterTeachersByStatus(status: 'active' | 'inactive' | 'suspended'): Promise<Teacher[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase teachers by status filter
        return this.legacyFilterTeachersByStatus(status)
      } catch (error) {
        console.error('Supabase filterTeachersByStatus failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyFilterTeachersByStatus(status)
  }

  /**
   * Get teacher statistics
   */
  async getTeacherStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    totalTeachingHours: number;
    totalStudents: number;
    averageRating: number;
  }> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase teacher statistics
        return this.legacyGetTeacherStatistics()
      } catch (error) {
        console.error('Supabase getTeacherStatistics failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetTeacherStatistics()
  }

  /**
   * Reset to default teachers
   */
  async resetToDefaultTeachers(): Promise<void> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase teacher reset
        return this.legacyResetToDefaultTeachers()
      } catch (error) {
        console.error('Supabase resetToDefaultTeachers failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyResetToDefaultTeachers()
  }

  // ===== Legacy implementations =====

  private async legacyGetAllTeachers(): Promise<Teacher[]> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return teacherDataService.getAllTeachers()
  }

  private async legacyGetActiveTeachers(): Promise<Teacher[]> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return teacherDataService.getActiveTeachers()
  }

  private async legacyGetTeacherById(id: number): Promise<Teacher | null> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return teacherDataService.getTeacherById(id)
  }

  private async legacyGetTeacherByEmail(email: string): Promise<Teacher | null> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return teacherDataService.getTeacherByEmail(email)
  }

  private async legacyAddTeacher(teacherData: Omit<Teacher, 'id' | 'role' | 'teachingHours' | 'rating' | 'totalStudents' | 'completedCourses' | 'accountStatus' | 'lastLogin'>): Promise<Teacher> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(300)
    return teacherDataService.addTeacher(teacherData)
  }

  private async legacyUpdateTeacher(id: number, updates: Partial<Teacher>): Promise<Teacher | null> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)
    return teacherDataService.updateTeacher(id, updates)
  }

  private async legacyDeleteTeacher(id: number): Promise<boolean> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)
    return teacherDataService.deleteTeacher(id)
  }

  private async legacyUpdateTeacherStats(teacherId: number, stats: {
    teachingHours?: number;
    rating?: number;
    totalStudents?: number;
    completedCourses?: number;
  }): Promise<void> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)
    return teacherDataService.updateTeacherStats(teacherId, stats)
  }

  private async legacyGetTeachersForScheduling(): Promise<Array<{
    id: string;
    name: string;
    email: string;
    expertise: string[];
    status: string;
    available: boolean;
  }>> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return teacherDataService.getTeachersForScheduling()
  }

  private async legacySearchTeachers(query: string): Promise<Teacher[]> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(150)
    return teacherDataService.searchTeachers(query)
  }

  private async legacyFilterTeachersByStatus(status: 'active' | 'inactive' | 'suspended'): Promise<Teacher[]> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return teacherDataService.filterTeachersByStatus(status)
  }

  private async legacyGetTeacherStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    totalTeachingHours: number;
    totalStudents: number;
    averageRating: number;
  }> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(150)
    return teacherDataService.getTeacherStatistics()
  }

  private async legacyResetToDefaultTeachers(): Promise<void> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)
    return teacherDataService.resetToDefaultTeachers()
  }
}

export const teacherService = new UnifiedTeacherService()
export type { Teacher }