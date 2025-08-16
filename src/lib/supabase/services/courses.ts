import { BaseSupabaseService } from './base'
import { CourseTemplate, CourseSession, CourseEnrollment, Campus, SessionStatus, BookingStatus } from '../types'
import { PaginationOptions, PaginatedResponse, QueryResult } from '../types'

export interface CourseFilters {
  campus?: Campus
  category?: string
  level?: string
  is_active?: boolean
  teacher_id?: string
  search?: string
}

export interface SessionFilters {
  schedule_id?: string
  teacher_id?: string
  campus?: Campus
  status?: SessionStatus
  date_from?: string
  date_to?: string
}

export interface EnrollmentFilters {
  user_id?: string
  session_id?: string
  schedule_id?: string
  campus?: Campus
  status?: BookingStatus
  date_from?: string
  date_to?: string
}

export interface CreateCourseTemplateData {
  name: string
  description?: string
  category?: string
  level?: string
  duration_minutes: number
  max_capacity: number
  campus: Campus
}

export interface CreateScheduleData {
  template_id: string
  teacher_id: string
  start_date: string
  end_date: string
  schedule_pattern?: Record<string, unknown>
  max_capacity: number
  campus: Campus
}

export interface CreateSessionData {
  schedule_id: string
  session_date: string
  start_time: string
  end_time: string
  campus: Campus
  notes?: string
}

export interface CreateEnrollmentData {
  user_id: string
  session_id: string
}

export class CoursesService extends BaseSupabaseService {
  // ===== Course Templates =====
  
  /**
   * Get course templates with filters and pagination
   */
  async getCourseTemplates(
    filters: CourseFilters = {},
    pagination: PaginationOptions
  ): Promise<PaginatedResponse<CourseTemplate>> {
    let query = this.client
      .from('course_templates')
      .select('*')

    // Apply filters
    if (filters.campus) {
      query = query.eq('campus', filters.campus)
    }
    
    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    
    if (filters.level) {
      query = query.eq('level', filters.level)
    }
    
    if (typeof filters.is_active === 'boolean') {
      query = query.eq('is_active', filters.is_active)
    }
    
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    return this.paginatedQuery<CourseTemplate>(query, pagination)
  }

  /**
   * Get course template by ID
   */
  async getCourseTemplateById(templateId: string): Promise<QueryResult<CourseTemplate>> {
    const query = this.client
      .from('course_templates')
      .select('*')
      .eq('id', templateId)

    return this.singleQuery(query)
  }

  /**
   * Create course template
   */
  async createCourseTemplate(templateData: CreateCourseTemplateData): Promise<QueryResult<CourseTemplate>> {
    try {
      const { data, error } = await this.client
        .from('course_templates')
        .insert({
          name: templateData.name,
          description: templateData.description,
          category: templateData.category,
          level: templateData.level,
          duration_minutes: templateData.duration_minutes,
          max_capacity: templateData.max_capacity,
          campus: templateData.campus,
          is_active: true
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error: unknown) {
      return { data: null, error: new Error(error instanceof Error ? error.message : String(error)) }
    }
  }

  // ===== Course Sessions =====

  /**
   * Get course sessions with enrollment information
   */
  async getCourseSessions(
    filters: SessionFilters = {},
    pagination: PaginationOptions
  ): Promise<PaginatedResponse<CourseSession & { 
    course_name: string
    teacher_name: string
    enrolled_count: number
    max_capacity: number
  }>> {
    let query = this.client
      .from('course_sessions_with_enrollment')
      .select('*')

    // Apply filters
    if (filters.schedule_id) {
      query = query.eq('schedule_id', filters.schedule_id)
    }
    
    if (filters.teacher_id) {
      query = query.eq('teacher_id', filters.teacher_id)
    }
    
    if (filters.campus) {
      query = query.eq('campus', filters.campus)
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters.date_from) {
      query = query.gte('session_date', filters.date_from)
    }
    
    if (filters.date_to) {
      query = query.lte('session_date', filters.date_to)
    }

    return this.paginatedQuery(query, pagination)
  }

  /**
   * Get available sessions for booking
   */
  async getAvailableSessions(
    campus?: Campus,
    dateFrom?: string,
    dateTo?: string
  ): Promise<QueryResult<(CourseSession & { 
    course_name: string
    teacher_name: string
    enrolled_count: number
    max_capacity: number
    available_spots: number
  })[]>> {
    try {
      let query = this.client
        .from('course_sessions_with_enrollment')
        .select('*')
        .eq('status', 'SCHEDULED')

      if (campus) {
        query = query.eq('campus', campus)
      }
      
      if (dateFrom) {
        query = query.gte('session_date', dateFrom)
      }
      
      if (dateTo) {
        query = query.lte('session_date', dateTo)
      }

      const { data, error } = await query
        .order('session_date', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) {
        throw error
      }

      // Add available spots calculation
      const sessionsWithAvailability = data?.map(session => ({
        ...session,
        available_spots: session.max_capacity - session.enrolled_count
      })) || []

      return { data: sessionsWithAvailability, error: null }
    } catch (error: unknown) {
      return { data: null, error: new Error(error instanceof Error ? error.message : String(error)) }
    }
  }

  /**
   * Create course session
   */
  async createCourseSession(sessionData: CreateSessionData): Promise<QueryResult<CourseSession>> {
    try {
      // Validate schedule exists and get capacity
      const { data: schedule, error: scheduleError } = await this.client
        .from('course_schedules')
        .select('max_capacity, is_active')
        .eq('id', sessionData.schedule_id)
        .single()

      if (scheduleError || !schedule) {
        throw new Error('Invalid course schedule')
      }

      if (!schedule.is_active) {
        throw new Error('Course schedule is not active')
      }

      const { data, error } = await this.client
        .from('course_sessions')
        .insert({
          schedule_id: sessionData.schedule_id,
          session_date: sessionData.session_date,
          start_time: sessionData.start_time,
          end_time: sessionData.end_time,
          status: 'SCHEDULED',
          actual_capacity: 0,
          notes: sessionData.notes,
          campus: sessionData.campus
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error: unknown) {
      return { data: null, error: new Error(error instanceof Error ? error.message : String(error)) }
    }
  }

  // ===== Course Enrollments =====

  /**
   * Get enrollments with filters and pagination
   */
  async getEnrollments(
    filters: EnrollmentFilters = {},
    pagination: PaginationOptions
  ): Promise<PaginatedResponse<CourseEnrollment & {
    session_date: string
    course_name: string
    teacher_name: string
  }>> {
    let query = this.client
      .from('course_enrollments')
      .select(`
        *,
        course_sessions (
          session_date,
          course_schedules (
            course_templates (
              name
            ),
            core_users (
              full_name
            )
          )
        )
      `)

    // Apply filters
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id)
    }
    
    if (filters.session_id) {
      query = query.eq('session_id', filters.session_id)
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    // Note: For date and schedule_id filters, we'd need to join with course_sessions
    // This is a simplified version - in production, consider using a view

    return this.paginatedQuery(query, pagination)
  }

  /**
   * Get user's enrollments
   */
  async getUserEnrollments(
    userId: string,
    status?: BookingStatus
  ): Promise<QueryResult<(CourseEnrollment & {
    session_date: string
    start_time: string
    end_time: string
    course_name: string
    teacher_name: string
  })[]>> {
    try {
      let query = this.client
        .from('course_enrollments')
        .select(`
          *,
          course_sessions (
            session_date,
            start_time,
            end_time,
            course_schedules (
              course_templates (
                name
              ),
              core_users (
                full_name
              )
            )
          )
        `)
        .eq('user_id', userId)

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query
        .order('enrollment_date', { ascending: false })

      if (error) {
        throw error
      }

      // Transform data to flatten nested structure
      const enrollments = data?.map((enrollment: Record<string, unknown>) => ({
        ...enrollment,
        session_date: (enrollment as { course_sessions: { session_date: string } }).course_sessions.session_date,
        start_time: (enrollment as { course_sessions: { start_time: string } }).course_sessions.start_time,
        end_time: (enrollment as { course_sessions: { end_time: string } }).course_sessions.end_time,
        course_name: (enrollment as { course_sessions: { course_schedules: { course_templates: { name: string } } } }).course_sessions.course_schedules.course_templates.name,
        teacher_name: (enrollment as { course_sessions: { course_schedules: { core_users: { full_name: string } } } }).course_sessions.course_schedules.core_users.full_name
      })) || []

      return { data: enrollments as (CourseEnrollment & { session_date: string; start_time: string; end_time: string; course_name: string; teacher_name: string })[], error: null }
    } catch (error: unknown) {
      return { data: null, error: new Error(error instanceof Error ? error.message : String(error)) }
    }
  }

  /**
   * Create enrollment (book a session)
   */
  async createEnrollment(enrollmentData: CreateEnrollmentData): Promise<QueryResult<CourseEnrollment>> {
    try {
      // Check if session has capacity
      const { data: sessionInfo, error: sessionError } = await this.client
        .from('course_sessions_with_enrollment')
        .select('max_capacity, enrolled_count, status')
        .eq('id', enrollmentData.session_id)
        .single()

      if (sessionError || !sessionInfo) {
        throw new Error('Session not found')
      }

      if (sessionInfo.status !== 'SCHEDULED') {
        throw new Error('Session is not available for booking')
      }

      if (sessionInfo.enrolled_count >= sessionInfo.max_capacity) {
        throw new Error('Session is fully booked')
      }

      // Check if user is already enrolled
      const { data: existingEnrollment } = await this.client
        .from('course_enrollments')
        .select('id')
        .eq('user_id', enrollmentData.user_id)
        .eq('session_id', enrollmentData.session_id)
        .single()

      if (existingEnrollment) {
        throw new Error('User is already enrolled in this session')
      }

      // Check if user has valid membership
      // This would require integration with membership service
      // For now, we'll skip this validation

      // Create enrollment
      const { data, error } = await this.client
        .from('course_enrollments')
        .insert({
          user_id: enrollmentData.user_id,
          session_id: enrollmentData.session_id,
          enrollment_date: new Date().toISOString(),
          status: 'CONFIRMED'
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Update session capacity
      await this.client
        .from('course_sessions')
        .update({
          actual_capacity: sessionInfo.enrolled_count + 1
        })
        .eq('id', enrollmentData.session_id)

      // Log activity
      await this.logActivity(
        enrollmentData.user_id,
        'BOOKING',
        'course_enrollment',
        data.id,
        'Session booking created',
        { session_id: enrollmentData.session_id }
      )

      return { data, error: null }
    } catch (error: unknown) {
      return { data: null, error: new Error(error instanceof Error ? error.message : String(error)) }
    }
  }

  /**
   * Cancel enrollment
   */
  async cancelEnrollment(enrollmentId: string, cancelledBy?: string): Promise<QueryResult<CourseEnrollment>> {
    try {
      // Get enrollment details
      const { data: enrollment, error: enrollmentError } = await this.client
        .from('course_enrollments')
        .select('*')
        .eq('id', enrollmentId)
        .single()

      if (enrollmentError || !enrollment) {
        throw new Error('Enrollment not found')
      }

      if (enrollment.status !== 'CONFIRMED') {
        throw new Error('Enrollment cannot be cancelled')
      }

      // Update enrollment status
      const { data, error } = await this.client
        .from('course_enrollments')
        .update({
          status: 'CANCELLED',
          updated_at: new Date().toISOString()
        })
        .eq('id', enrollmentId)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Update session capacity
      const { data: sessionInfo } = await this.client
        .from('course_sessions')
        .select('actual_capacity')
        .eq('id', enrollment.session_id)
        .single()

      if (sessionInfo && sessionInfo.actual_capacity > 0) {
        await this.client
          .from('course_sessions')
          .update({
            actual_capacity: sessionInfo.actual_capacity - 1
          })
          .eq('id', enrollment.session_id)
      }

      // Log activity
      await this.logActivity(
        cancelledBy || enrollment.user_id,
        'CANCELLATION',
        'course_enrollment',
        enrollmentId,
        'Session booking cancelled',
        { session_id: enrollment.session_id, cancelled_by: cancelledBy }
      )

      return { data, error: null }
    } catch (error: unknown) {
      return { data: null, error: new Error(error instanceof Error ? error.message : String(error)) }
    }
  }

  /**
   * Mark attendance for enrollment
   */
  async markAttendance(
    enrollmentId: string,
    attended: boolean,
    feedback?: string,
    rating?: number
  ): Promise<QueryResult<CourseEnrollment>> {
    try {
      const { data, error } = await this.client
        .from('course_enrollments')
        .update({
          attended,
          feedback,
          rating,
          status: attended ? 'COMPLETED' : 'NO_SHOW',
          updated_at: new Date().toISOString()
        })
        .eq('id', enrollmentId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error: unknown) {
      return { data: null, error: new Error(error instanceof Error ? error.message : String(error)) }
    }
  }

  /**
   * Get course categories
   */
  async getCourseCategories(campus?: Campus): Promise<QueryResult<string[]>> {
    try {
      let query = this.client
        .from('course_templates')
        .select('category')
        .not('category', 'is', null)
        .eq('is_active', true)

      if (campus) {
        query = query.eq('campus', campus)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      const categories = [...new Set(data?.map(item => item.category).filter(Boolean) || [])]
      return { data: categories, error: null }
    } catch (error: unknown) {
      return { data: null, error: new Error(error instanceof Error ? error.message : String(error)) }
    }
  }

  /**
   * Get session statistics for admin dashboard
   */
  async getSessionStats(campus?: Campus): Promise<QueryResult<{
    total_sessions: number
    scheduled_sessions: number
    completed_sessions: number
    cancelled_sessions: number
    total_enrollments: number
    average_attendance_rate: number
  }>> {
    try {
      let query = this.client
        .from('course_sessions')
        .select(`
          id,
          status,
          course_enrollments (
            id,
            attended
          )
        `)

      if (campus) {
        query = query.eq('campus', campus)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      const sessions = data || []
      const totalEnrollments = sessions.reduce((sum: number, session: Record<string, unknown>) => 
        sum + ((session.course_enrollments as unknown[] | undefined)?.length || 0), 0)
      
      const attendedEnrollments = sessions.reduce((sum: number, session: Record<string, unknown>) => 
        sum + ((session.course_enrollments as Record<string, unknown>[] | undefined)?.filter((e: Record<string, unknown>) => e.attended === true).length || 0), 0)

      const stats = {
        total_sessions: sessions.length,
        scheduled_sessions: sessions.filter(s => s.status === 'SCHEDULED').length,
        completed_sessions: sessions.filter(s => s.status === 'COMPLETED').length,
        cancelled_sessions: sessions.filter(s => s.status === 'CANCELLED').length,
        total_enrollments: totalEnrollments,
        average_attendance_rate: totalEnrollments > 0 ? (attendedEnrollments / totalEnrollments) * 100 : 0
      }

      return { data: stats, error: null }
    } catch (error: unknown) {
      return { data: null, error: new Error(error instanceof Error ? error.message : String(error)) }
    }
  }
}

// Export singleton instance
export const coursesService = new CoursesService()