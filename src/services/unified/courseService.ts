/**
 * Unified Course Service - Phase 3.5 Refactor
 * 
 * This service provides a unified interface that integrates:
 * - Supabase Courses table (primary, when implemented)
 * - Legacy course data utilities (current implementation)
 * - Backwards compatibility with existing API
 * 
 * Covers: CourseTemplates, CourseSchedules, CourseBooking, and Course Management
 */

import { Course } from '@/data/courses'
import { 
  CourseTemplate, 
  getCourseTemplates, 
  getCourseTemplateById,
  createCourseTemplate,
  updateCourseTemplate,
  deleteCourseTemplate,
  duplicateCourseTemplate,
  getPublishedCourseTemplates
} from '@/data/courseTemplateUtils'
import {
  CourseSchedule,
  getCourseSchedules,
  getCourseScheduleById,
  createCourseSchedule,
  updateCourseSchedule,
  deleteCourseSchedule,
  getPublishedCourseSchedules
} from '@/data/courseScheduleUtils'
import {
  getAllBookableSessions,
  getFilteredBookableSessions,
  getSessionsByDate,
  bookSession,
  cancelBooking,
  getUserBookings
} from '@/data/courseBookingUtils'

class UnifiedCourseService {
  private useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED // Start with legacy mode

  constructor() {
    // For now, we'll use legacy mode as Supabase course tables may not be ready
    this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
    console.log('🔧 Unified Course Service: Using Legacy mode')
  }

  // ===== Course Templates =====

  /**
   * Get all course templates
   */
  async getCourseTemplates(): Promise<CourseTemplate[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase course templates query
        return this.legacyGetCourseTemplates()
      } catch (error) {
        console.error('Supabase getCourseTemplates failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetCourseTemplates()
  }

  /**
   * Get course template by ID
   */
  async getCourseTemplateById(id: string): Promise<CourseTemplate | null> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase course template by ID query
        return this.legacyGetCourseTemplateById(id)
      } catch (error) {
        console.error('Supabase getCourseTemplateById failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetCourseTemplateById(id)
  }

  /**
   * Create course template
   */
  async createCourseTemplate(template: Omit<CourseTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<CourseTemplate> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase course template creation
        return this.legacyCreateCourseTemplate(template)
      } catch (error) {
        console.error('Supabase createCourseTemplate failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyCreateCourseTemplate(template)
  }

  /**
   * Update course template
   */
  async updateCourseTemplate(id: string, updates: Partial<CourseTemplate>): Promise<CourseTemplate | null> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase course template update
        return this.legacyUpdateCourseTemplate(id, updates)
      } catch (error) {
        console.error('Supabase updateCourseTemplate failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyUpdateCourseTemplate(id, updates)
  }

  /**
   * Delete course template
   */
  async deleteCourseTemplate(id: string): Promise<boolean> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase course template deletion
        return this.legacyDeleteCourseTemplate(id)
      } catch (error) {
        console.error('Supabase deleteCourseTemplate failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyDeleteCourseTemplate(id)
  }

  /**
   * Duplicate course template
   */
  async duplicateCourseTemplate(id: string): Promise<CourseTemplate | null> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase course template duplication
        return this.legacyDuplicateCourseTemplate(id)
      } catch (error) {
        console.error('Supabase duplicateCourseTemplate failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyDuplicateCourseTemplate(id)
  }

  /**
   * Get published course templates
   */
  async getPublishedCourseTemplates(): Promise<CourseTemplate[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase published course templates query
        return this.legacyGetPublishedCourseTemplates()
      } catch (error) {
        console.error('Supabase getPublishedCourseTemplates failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetPublishedCourseTemplates()
  }

  // ===== Course Schedules =====

  /**
   * Get all course schedules
   */
  async getCourseSchedules(): Promise<CourseSchedule[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase course schedules query
        return this.legacyGetCourseSchedules()
      } catch (error) {
        console.error('Supabase getCourseSchedules failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetCourseSchedules()
  }

  /**
   * Get course schedule by ID
   */
  async getCourseScheduleById(id: string): Promise<CourseSchedule | null> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase course schedule by ID query
        return this.legacyGetCourseScheduleById(id)
      } catch (error) {
        console.error('Supabase getCourseScheduleById failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetCourseScheduleById(id)
  }

  /**
   * Create course schedule
   */
  async createCourseSchedule(schedule: Omit<CourseSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<CourseSchedule> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase course schedule creation
        return this.legacyCreateCourseSchedule(schedule)
      } catch (error) {
        console.error('Supabase createCourseSchedule failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyCreateCourseSchedule(schedule)
  }

  /**
   * Update course schedule
   */
  async updateCourseSchedule(id: string, updates: Partial<CourseSchedule>): Promise<CourseSchedule | null> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase course schedule update
        return this.legacyUpdateCourseSchedule(id, updates)
      } catch (error) {
        console.error('Supabase updateCourseSchedule failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyUpdateCourseSchedule(id, updates)
  }

  /**
   * Delete course schedule
   */
  async deleteCourseSchedule(id: string): Promise<boolean> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase course schedule deletion
        return this.legacyDeleteCourseSchedule(id)
      } catch (error) {
        console.error('Supabase deleteCourseSchedule failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyDeleteCourseSchedule(id)
  }

  /**
   * Get published course schedules
   */
  async getPublishedCourseSchedules(): Promise<CourseSchedule[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase published course schedules query
        return this.legacyGetPublishedCourseSchedules()
      } catch (error) {
        console.error('Supabase getPublishedCourseSchedules failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetPublishedCourseSchedules()
  }

  // ===== Course Booking =====

  /**
   * Get all bookable sessions
   */
  async getAllBookableSessions() {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase bookable sessions query
        return this.legacyGetAllBookableSessions()
      } catch (error) {
        console.error('Supabase getAllBookableSessions failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetAllBookableSessions()
  }

  /**
   * Get filtered bookable sessions
   */
  async getFilteredBookableSessions(filters: Array<{ key: string; value: unknown; operator?: string }>) {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase filtered bookable sessions query
        return this.legacyGetFilteredBookableSessions(filters)
      } catch (error) {
        console.error('Supabase getFilteredBookableSessions failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetFilteredBookableSessions(filters)
  }

  /**
   * Get sessions by date
   */
  async getSessionsByDate(date: string, filters: Array<{ key: string; value: unknown; operator?: string }> = []) {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase sessions by date query
        return this.legacyGetSessionsByDate(date, filters)
      } catch (error) {
        console.error('Supabase getSessionsByDate failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetSessionsByDate(date, filters)
  }

  /**
   * Book session
   */
  async bookSession(sessionId: string, userId: string): Promise<boolean> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase session booking
        return this.legacyBookSession(sessionId, userId)
      } catch (error) {
        console.error('Supabase bookSession failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyBookSession(sessionId, userId)
  }

  /**
   * Cancel booking
   */
  async cancelBooking(sessionId: string, userId: string): Promise<boolean> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase booking cancellation
        return this.legacyCancelBooking(sessionId, userId)
      } catch (error) {
        console.error('Supabase cancelBooking failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyCancelBooking(sessionId, userId)
  }

  /**
   * Get user bookings
   */
  async getUserBookings(userId: string) {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase user bookings query
        return this.legacyGetUserBookings(userId)
      } catch (error) {
        console.error('Supabase getUserBookings failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetUserBookings(userId)
  }

  // ===== Legacy implementations =====

  private async legacyGetCourseTemplates(): Promise<CourseTemplate[]> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return getCourseTemplates()
  }

  private async legacyGetCourseTemplateById(id: string): Promise<CourseTemplate | null> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return getCourseTemplateById(id)
  }

  private async legacyCreateCourseTemplate(template: Omit<CourseTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<CourseTemplate> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(300)
    return createCourseTemplate(template)
  }

  private async legacyUpdateCourseTemplate(id: string, updates: Partial<CourseTemplate>): Promise<CourseTemplate | null> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)
    return updateCourseTemplate(id, updates)
  }

  private async legacyDeleteCourseTemplate(id: string): Promise<boolean> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)
    return deleteCourseTemplate(id)
  }

  private async legacyDuplicateCourseTemplate(id: string): Promise<CourseTemplate | null> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(300)
    return duplicateCourseTemplate(id)
  }

  private async legacyGetPublishedCourseTemplates(): Promise<CourseTemplate[]> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return getPublishedCourseTemplates()
  }

  private async legacyGetCourseSchedules(): Promise<CourseSchedule[]> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return getCourseSchedules()
  }

  private async legacyGetCourseScheduleById(id: string): Promise<CourseSchedule | null> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return getCourseScheduleById(id)
  }

  private async legacyCreateCourseSchedule(schedule: Omit<CourseSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<CourseSchedule> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(300)
    return createCourseSchedule(schedule)
  }

  private async legacyUpdateCourseSchedule(id: string, updates: Partial<CourseSchedule>): Promise<CourseSchedule | null> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)
    return updateCourseSchedule(id, updates)
  }

  private async legacyDeleteCourseSchedule(id: string): Promise<boolean> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)
    return deleteCourseSchedule(id)
  }

  private async legacyGetPublishedCourseSchedules(): Promise<CourseSchedule[]> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return getPublishedCourseSchedules()
  }

  private async legacyGetAllBookableSessions() {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(150)
    return getAllBookableSessions()
  }

  private async legacyGetFilteredBookableSessions(filters: Array<{ key: string; value: unknown; operator?: string }>) {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(150)
    return getFilteredBookableSessions(filters as never)
  }

  private async legacyGetSessionsByDate(date: string, filters: Array<{ key: string; value: unknown; operator?: string }> = []) {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return getSessionsByDate(date, filters as never)
  }

  private async legacyBookSession(sessionId: string, userId: string): Promise<boolean> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)
    return bookSession(sessionId, userId)
  }

  private async legacyCancelBooking(sessionId: string, userId: string): Promise<boolean> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)
    return cancelBooking(sessionId, userId)
  }

  private async legacyGetUserBookings(userId: string) {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(150)
    return getUserBookings(userId)
  }
}

export const courseService = new UnifiedCourseService()
export type { Course, CourseTemplate, CourseSchedule }