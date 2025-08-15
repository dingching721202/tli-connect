/**
 * Unified Booking Service - Phase 3 Refactor
 * 
 * This service provides a unified interface that integrates:
 * - Supabase Courses and Enrollments (primary data source)
 * - Legacy booking system (for migration period)
 * - Backwards compatibility with existing API
 */

import { coursesService as supabaseCoursesService } from '@/lib/supabase/services'
import { ClassAppointment, BatchBookingResponse, ApiResponse, ClassTimeslot } from '@/types'
import { generateBookingSessions } from '@/data/courseBookingIntegration'
import { hashString } from '@/utils/enrollmentUtils'
import { memberCardService } from './membershipService'

// Legacy imports for fallback
import { classTimeslots as classTimeslotsData } from '@/data/class_timeslots'
import { classAppointments as classAppointmentsData } from '@/data/class_appointments'

class UnifiedBookingService {
  private useLegacyMode = false // Toggle for gradual migration
  private classTimeslots: ClassTimeslot[] = [...classTimeslotsData] as ClassTimeslot[]
  private classAppointments: ClassAppointment[] = [...classAppointmentsData] as ClassAppointment[]

  constructor() {
    // Check if Supabase is available and properly configured
    this.checkSupabaseAvailability()
  }

  private async checkSupabaseAvailability() {
    try {
      // Test Supabase connection
      await supabaseCoursesService.getAvailableSessions()
      this.useLegacyMode = false
      console.log('🔧 Unified Booking Service: Using Supabase mode')
    } catch (error) {
      console.warn('⚠️ Supabase not available, falling back to legacy mode:', error)
      this.useLegacyMode = true
    }
  }

  /**
   * Check if user has existing booking for a timeslot
   */
  async checkExistingBooking(userId: number, timeslotId: number): Promise<boolean> {
    if (!this.useLegacyMode) {
      try {
        // Convert legacy timeslot ID to session ID for Supabase
        const sessionId = this.convertTimeslotIdToSessionId(timeslotId)
        
        if (sessionId) {
          const result = await supabaseCoursesService.getUserEnrollments(userId.toString())
          
          if (result.data) {
            const existingBooking = result.data.find(enrollment => 
              enrollment.session_id === sessionId && 
              enrollment.status === 'CONFIRMED'
            )
            return !!existingBooking
          }
        }
        
        return false
      } catch (error) {
        console.error('Supabase checkExistingBooking failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    return this.legacyCheckExistingBooking(userId, timeslotId)
  }

  /**
   * Batch booking for multiple timeslots
   */
  async batchBooking(userId: number, timeslotIds: number[]): Promise<BatchBookingResponse> {
    if (!this.useLegacyMode) {
      try {
        // Check membership eligibility
        let membership = await memberCardService.getMembership(userId)
        if (!membership) {
          membership = await memberCardService.getUserInactiveMembership(userId)
        }

        if (!membership) {
          return {
            success: [],
            failed: timeslotIds.map(id => ({ timeslot_id: id, reason: 'MEMBERSHIP_EXPIRED' }))
          }
        }

        const successBookings: Array<{ timeslot_id: number; booking_id: number }> = []
        const failedBookings: Array<{ timeslot_id: number; reason: 'FULL' | 'WITHIN_24H' | 'MEMBERSHIP_EXPIRED' }> = []

        // Get available sessions from Supabase
        const availableSessionsResult = await supabaseCoursesService.getAvailableSessions()
        
        if (!availableSessionsResult.data) {
          // Fallback to legacy if no Supabase data
          return this.legacyBatchBooking(userId, timeslotIds)
        }

        const now = new Date()
        const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000)

        for (const timeslotId of timeslotIds) {
          // Convert legacy timeslot ID to session
          const session = this.findSessionByTimeslotId(timeslotId, availableSessionsResult.data)
          
          if (!session) {
            failedBookings.push({ timeslot_id: timeslotId, reason: 'FULL' })
            continue
          }

          // Check 24-hour rule
          const sessionDateTime = new Date(`${session.session_date}T${session.start_time}`)
          if (sessionDateTime <= twentyFourHoursLater) {
            failedBookings.push({ timeslot_id: timeslotId, reason: 'WITHIN_24H' })
            continue
          }

          // Check availability
          if (session.available_spots <= 0) {
            failedBookings.push({ timeslot_id: timeslotId, reason: 'FULL' })
            continue
          }

          // Check existing booking
          const existingBooking = await this.checkExistingBooking(userId, timeslotId)
          if (existingBooking) {
            failedBookings.push({ timeslot_id: timeslotId, reason: 'FULL' })
            continue
          }

          // Create enrollment in Supabase
          try {
            const enrollmentResult = await supabaseCoursesService.createEnrollment({
              user_id: userId.toString(),
              session_id: session.id
            })

            if (enrollmentResult.data) {
              successBookings.push({
                timeslot_id: timeslotId,
                booking_id: parseInt(enrollmentResult.data.id)
              })
            } else {
              failedBookings.push({ timeslot_id: timeslotId, reason: 'FULL' })
            }
          } catch (error) {
            console.error('Failed to create enrollment:', error)
            failedBookings.push({ timeslot_id: timeslotId, reason: 'FULL' })
          }
        }

        // Trigger update event if successful bookings
        if (successBookings.length > 0 && typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('bookingsUpdated'))
        }

        return { success: successBookings, failed: failedBookings }
      } catch (error) {
        console.error('Supabase batchBooking failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    return this.legacyBatchBooking(userId, timeslotIds)
  }

  /**
   * Cancel booking
   */
  async cancelBooking(userId: number, appointmentId: number): Promise<ApiResponse<boolean>> {
    if (!this.useLegacyMode) {
      try {
        // Find enrollment by appointment ID
        const enrollmentResult = await supabaseCoursesService.getUserEnrollments(userId.toString())
        
        if (enrollmentResult.data) {
          const enrollment = enrollmentResult.data.find(e => parseInt(e.id) === appointmentId)
          
          if (!enrollment) {
            return { success: false, error: 'Appointment not found' }
          }

          if (enrollment.status === 'CANCELLED') {
            return { success: false, error: 'Appointment already canceled' }
          }

          // Check 24-hour rule
          const sessionDateTime = new Date(`${enrollment.session_date}T${enrollment.start_time}`)
          const now = new Date()
          const twentyFourHours = 24 * 60 * 60 * 1000

          if (sessionDateTime.getTime() - now.getTime() <= twentyFourHours) {
            return { success: false, error: 'CANNOT_CANCEL_WITHIN_24H' }
          }

          // Cancel enrollment
          const cancelResult = await supabaseCoursesService.cancelEnrollment(enrollment.id)
          
          if (cancelResult.data) {
            // Trigger update event
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('bookingsUpdated'))
            }
            
            return { success: true, data: true }
          }
        }

        return { success: false, error: 'Failed to cancel booking' }
      } catch (error) {
        console.error('Supabase cancelBooking failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    return this.legacyCancelBooking(userId, appointmentId)
  }

  /**
   * Get all bookings (admin view)
   */
  async getAllBookings(): Promise<ApiResponse<ClassAppointment[]>> {
    if (!this.useLegacyMode) {
      try {
        const result = await supabaseCoursesService.getEnrollments(
          {},
          { page: 1, limit: 1000, orderBy: 'created_at', ascending: false }
        )

        if (result.data) {
          // Convert Supabase enrollments to legacy format
          const appointments = result.data.map(enrollment => ({
            id: parseInt(enrollment.id),
            class_timeslot_id: this.convertSessionIdToTimeslotId(enrollment.session_id),
            user_id: parseInt(enrollment.user_id),
            status: enrollment.status === 'CONFIRMED' ? 'CONFIRMED' as const :
                   enrollment.status === 'CANCELLED' ? 'CANCELED' as const : 'CONFIRMED' as const,
            booking_time: enrollment.enrolled_at || enrollment.created_at,
            created_at: enrollment.created_at
          }))

          return { success: true, data: appointments }
        }

        return { success: true, data: [] }
      } catch (error) {
        console.error('Supabase getAllBookings failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    return this.legacyGetAllBookings()
  }

  /**
   * Get user appointments
   */
  async getUserAppointments(userId: number): Promise<ClassAppointment[]> {
    if (!this.useLegacyMode) {
      try {
        const result = await supabaseCoursesService.getUserEnrollments(userId.toString())
        
        if (result.data) {
          // Convert to legacy format
          return result.data.map(enrollment => ({
            id: parseInt(enrollment.id),
            class_timeslot_id: this.convertSessionIdToTimeslotId(enrollment.session_id),
            user_id: userId,
            status: enrollment.status === 'CONFIRMED' ? 'CONFIRMED' as const :
                   enrollment.status === 'CANCELLED' ? 'CANCELED' as const : 'CONFIRMED' as const,
            booking_time: enrollment.enrolled_at || enrollment.created_at,
            created_at: enrollment.created_at
          }))
        }

        return []
      } catch (error) {
        console.error('Supabase getUserAppointments failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    return this.legacyGetUserAppointments(userId)
  }

  // Helper methods for ID conversion between legacy and Supabase formats
  private convertTimeslotIdToSessionId(timeslotId: number): string | null {
    // Implementation depends on how we map legacy timeslot IDs to Supabase session IDs
    // For now, we'll use the existing hash-based system
    const allSessions = generateBookingSessions()
    const session = allSessions.find(s => {
      const sessionHashId = hashString(s.id)
      return sessionHashId === timeslotId
    })
    return session?.id || null
  }

  private convertSessionIdToTimeslotId(sessionId: string): number {
    // Convert session ID back to legacy timeslot ID using hash
    return hashString(sessionId)
  }

  private findSessionByTimeslotId(timeslotId: number, availableSessions: any[]): any | null {
    // Find session by matching the hashed ID
    const allSessions = generateBookingSessions()
    const session = allSessions.find(s => {
      const sessionHashId = hashString(s.id)
      return sessionHashId === timeslotId
    })

    if (session) {
      // Find corresponding available session data
      return availableSessions.find(as => 
        as.session_date === session.date &&
        as.start_time === session.startTime &&
        as.course_name === session.courseTitle
      )
    }

    return null
  }

  // Legacy implementations
  private async legacyCheckExistingBooking(userId: number, timeslotId: number): Promise<boolean> {
    const memoryBooking = this.classAppointments.find(a => 
      a.user_id === userId && 
      a.class_timeslot_id === timeslotId && 
      a.status === 'CONFIRMED'
    )
    
    if (memoryBooking) {
      return true
    }
    
    if (typeof localStorage !== 'undefined') {
      try {
        const storedAppointments = JSON.parse(localStorage.getItem('classAppointments') || '[]') as ClassAppointment[]
        const localStorageBooking = storedAppointments.find((a: ClassAppointment) => 
          a.user_id === userId && 
          a.class_timeslot_id === timeslotId && 
          a.status === 'CONFIRMED'
        )
        
        if (localStorageBooking) {
          return true
        }
      } catch (error) {
        console.error('檢查localStorage預約時發生錯誤:', error)
      }
    }
    
    return false
  }

  private async legacyBatchBooking(userId: number, timeslotIds: number[]): Promise<BatchBookingResponse> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(1000)
    
    const now = new Date()
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    
    let membership = await memberCardService.getMembership(userId)
    if (!membership) {
      membership = await memberCardService.getUserInactiveMembership(userId)
    }
    
    if (!membership) {
      return {
        success: [],
        failed: timeslotIds.map(id => ({ timeslot_id: id, reason: 'MEMBERSHIP_EXPIRED' }))
      }
    }
    
    const successBookings: Array<{ timeslot_id: number; booking_id: number }> = []
    const failedBookings: Array<{ timeslot_id: number; reason: 'FULL' | 'WITHIN_24H' | 'MEMBERSHIP_EXPIRED' }> = []
    
    const allSessions = generateBookingSessions()
    const generateId = (array: { id: number }[]): number => {
      return Math.max(0, ...array.map(item => item.id)) + 1
    }
    
    for (const timeslotId of timeslotIds) {
      const session = allSessions.find(s => {
        const sessionHashId = hashString(s.id)
        return sessionHashId === timeslotId
      })
      
      if (!session) {
        failedBookings.push({ timeslot_id: timeslotId, reason: 'FULL' })
        continue
      }
      
      const slotStart = new Date(`${session.date} ${session.startTime}`)
      
      if (slotStart <= twentyFourHoursLater) {
        failedBookings.push({ timeslot_id: timeslotId, reason: 'WITHIN_24H' })
        continue
      }
      
      if (session.currentEnrollments >= session.capacity) {
        failedBookings.push({ timeslot_id: timeslotId, reason: 'FULL' })
        continue
      }
      
      const existingAppointment = await this.checkExistingBooking(userId, timeslotId)
      if (existingAppointment) {
        failedBookings.push({ timeslot_id: timeslotId, reason: 'FULL' })
        continue
      }
      
      const newAppointment: ClassAppointment = {
        id: generateId(this.classAppointments),
        class_timeslot_id: timeslotId,
        user_id: userId,
        status: 'CONFIRMED',
        booking_time: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
      
      this.classAppointments.push(newAppointment)
      
      if (typeof localStorage !== 'undefined') {
        const existingAppointments = JSON.parse(localStorage.getItem('classAppointments') || '[]') as ClassAppointment[]
        
        const isDuplicate = existingAppointments.some((apt: { user_id: number; class_timeslot_id: number; status: string }) => 
          apt.user_id === newAppointment.user_id && 
          apt.class_timeslot_id === newAppointment.class_timeslot_id &&
          apt.status === 'CONFIRMED'
        )
        
        if (!isDuplicate) {
          existingAppointments.push(newAppointment)
          localStorage.setItem('classAppointments', JSON.stringify(existingAppointments))
        }
      }
      
      successBookings.push({
        timeslot_id: timeslotId,
        booking_id: newAppointment.id
      })
    }
    
    if (successBookings.length > 0 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bookingsUpdated'))
    }
    
    return { success: successBookings, failed: failedBookings }
  }

  private async legacyCancelBooking(userId: number, appointmentId: number): Promise<ApiResponse<boolean>> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(500)
    
    // Implementation from original dataService
    let appointment = this.classAppointments.find(a => {
      return Number(a.id) === Number(appointmentId) && Number(a.user_id) === Number(userId)
    })
    
    let isFromLocalStorage = false
    
    if (!appointment && typeof localStorage !== 'undefined') {
      try {
        const storedAppointments = JSON.parse(localStorage.getItem('classAppointments') || '[]') as ClassAppointment[]
        appointment = storedAppointments.find((a: ClassAppointment) => {
          return Number(a.id) === Number(appointmentId) && Number(a.user_id) === Number(userId)
        })
        isFromLocalStorage = true
      } catch (error) {
        console.error('讀取預約資料失敗:', error)
      }
    }
    
    if (!appointment) {
      return { success: false, error: 'Appointment not found' }
    }
    
    if (appointment.status === 'CANCELED') {
      return { success: false, error: 'Appointment already canceled' }
    }
    
    const allSessions = generateBookingSessions()
    const session = allSessions.find(s => {
      const sessionHashId = hashString(s.id)
      return sessionHashId === appointment!.class_timeslot_id
    })
    
    if (!session) {
      return { success: false, error: 'Timeslot not found' }
    }
    
    const now = new Date()
    const slotStart = new Date(`${session.date} ${session.startTime}`)
    const twentyFourHours = 24 * 60 * 60 * 1000
    
    if (slotStart.getTime() - now.getTime() <= twentyFourHours) {
      return { success: false, error: 'CANNOT_CANCEL_WITHIN_24H' }
    }
    
    appointment.status = 'CANCELED'
    
    const memoryAppointmentIndex = this.classAppointments.findIndex(a => 
      Number(a.id) === Number(appointmentId) && Number(a.user_id) === Number(userId)
    )
    if (memoryAppointmentIndex !== -1) {
      this.classAppointments[memoryAppointmentIndex].status = 'CANCELED'
    }
    
    if (typeof localStorage !== 'undefined') {
      try {
        const storedAppointments = JSON.parse(localStorage.getItem('classAppointments') || '[]') as ClassAppointment[]
        const updatedAppointments = storedAppointments.map((a: ClassAppointment) => 
          Number(a.id) === Number(appointmentId) && Number(a.user_id) === Number(userId) ? 
          { ...a, status: 'CANCELED' as const } : a
        )
        localStorage.setItem('classAppointments', JSON.stringify(updatedAppointments))
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('bookingsUpdated'))
        }
      } catch (error) {
        console.error('更新預約資料失敗:', error)
      }
    }
    
    return { success: true, data: true }
  }

  private async legacyGetAllBookings(): Promise<ApiResponse<ClassAppointment[]>> {
    try {
      let allAppointments = [...this.classAppointments]
      
      if (typeof localStorage !== 'undefined') {
        try {
          const storedAppointments = JSON.parse(localStorage.getItem('classAppointments') || '[]') as ClassAppointment[]
          const existingIds = new Set(allAppointments.map(a => a.id))
          const newAppointments = storedAppointments.filter((a: ClassAppointment) => !existingIds.has(a.id))
          allAppointments = [...allAppointments, ...newAppointments]
        } catch (error) {
          console.error('讀取預約資料失敗:', error)
        }
      }
      
      const uniqueAppointmentsMap = new Map()
      allAppointments.forEach(appointment => {
        const key = `${appointment.id}-${appointment.user_id}`
        if (!uniqueAppointmentsMap.has(key) || 
            appointment.status === 'CANCELED' || 
            new Date(appointment.created_at) > new Date(uniqueAppointmentsMap.get(key).created_at)) {
          uniqueAppointmentsMap.set(key, appointment)
        }
      })
      
      const deduplicatedAppointments = Array.from(uniqueAppointmentsMap.values())
      return { success: true, data: deduplicatedAppointments }
    } catch (error) {
      console.error('獲取所有預約失敗:', error)
      return { success: false, error: 'Failed to get all bookings' }
    }
  }

  private async legacyGetUserAppointments(userId: number): Promise<ClassAppointment[]> {
    let allAppointments = [...this.classAppointments]
    
    if (typeof localStorage !== 'undefined') {
      try {
        const storedAppointments = JSON.parse(localStorage.getItem('classAppointments') || '[]') as ClassAppointment[]
        const existingIds = new Set(allAppointments.map(a => a.id))
        const newAppointments = storedAppointments.filter((a: ClassAppointment) => !existingIds.has(a.id))
        allAppointments = [...allAppointments, ...newAppointments]
      } catch (error) {
        console.error('讀取預約資料失敗:', error)
      }
    }
    
    const userAppointments = allAppointments.filter(a => a.user_id === userId)
    
    const uniqueAppointmentsMap = new Map()
    userAppointments.forEach(appointment => {
      const key = `${appointment.id}-${appointment.user_id}`
      if (!uniqueAppointmentsMap.has(key) || 
          appointment.status === 'CANCELED' || 
          new Date(appointment.created_at) > new Date(uniqueAppointmentsMap.get(key).created_at)) {
        uniqueAppointmentsMap.set(key, appointment)
      }
    })
    
    return Array.from(uniqueAppointmentsMap.values())
  }
}

export const bookingService = new UnifiedBookingService()