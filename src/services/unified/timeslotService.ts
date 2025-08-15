/**
 * Unified Timeslot Service - Phase 3.4 Refactor
 * 
 * This service provides a unified interface that integrates:
 * - Supabase Timeslots (primary data source)
 * - Legacy timeslot service (for migration period)
 * - Backwards compatibility with existing API
 */

// Import existing timeslot service for legacy mode
import { 
  getAllTimeslotsWithBookings as legacyGetAllTimeslotsWithBookings,
  cancelTimeslot as legacyCancelTimeslot,
  restoreTimeslot as legacyRestoreTimeslot,
  TimeslotWithBookings
} from '@/services/timeslotService'

class UnifiedTimeslotService {
  private useLegacyMode = true // Start with legacy mode for Phase 3.4

  constructor() {
    // Check if Supabase is available and properly configured
    this.checkSupabaseAvailability()
  }

  private async checkSupabaseAvailability() {
    try {
      // TODO: Test Supabase connection when timeslots service is ready
      // await supabaseTimeslotsService.getTimeslots()
      // this.useLegacyMode = false
      // console.log('🔧 Unified Timeslot Service: Using Supabase mode')
      this.useLegacyMode = true
      console.log('🔧 Unified Timeslot Service: Using Legacy mode (Supabase not implemented yet)')
    } catch (error) {
      console.warn('⚠️ Supabase not available, falling back to legacy mode:', error)
      this.useLegacyMode = true
    }
  }

  /**
   * Get all timeslots with bookings
   */
  getAllTimeslotsWithBookings(): TimeslotWithBookings[] {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase timeslots query
        // const result = await supabaseTimeslotsService.getTimeslotsWithBookings()
        // return result
        this.useLegacyMode = true
      } catch (error) {
        console.error('Supabase getAllTimeslotsWithBookings failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    return legacyGetAllTimeslotsWithBookings()
  }

  /**
   * Cancel timeslot
   */
  async cancelTimeslot(timeslotId: string): Promise<boolean> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase timeslot cancellation
        // const result = await supabaseTimeslotsService.cancelTimeslot(timeslotId)
        // return result
        this.useLegacyMode = true
      } catch (error) {
        console.error('Supabase cancelTimeslot failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    return legacyCancelTimeslot(timeslotId)
  }

  /**
   * Restore timeslot
   */
  async restoreTimeslot(timeslotId: string): Promise<boolean> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase timeslot restoration
        // const result = await supabaseTimeslotsService.restoreTimeslot(timeslotId)
        // return result
        this.useLegacyMode = true
      } catch (error) {
        console.error('Supabase restoreTimeslot failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    return legacyRestoreTimeslot(timeslotId)
  }

  /**
   * Get timeslot by ID
   */
  getTimeslotById(timeslotId: string): TimeslotWithBookings | null {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase timeslot by ID query
        // const result = await supabaseTimeslotsService.getTimeslotById(timeslotId)
        // return result
        this.useLegacyMode = true
      } catch (error) {
        console.error('Supabase getTimeslotById failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    const allTimeslots = legacyGetAllTimeslotsWithBookings()
    return allTimeslots.find(timeslot => timeslot.id === timeslotId) || null
  }

  /**
   * Get timeslots by teacher ID
   */
  getTimeslotsByTeacherId(teacherId: string): TimeslotWithBookings[] {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase timeslots by teacher query
        // const result = await supabaseTimeslotsService.getTimeslotsByTeacherId(teacherId)
        // return result
        this.useLegacyMode = true
      } catch (error) {
        console.error('Supabase getTimeslotsByTeacherId failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    const allTimeslots = legacyGetAllTimeslotsWithBookings()
    return allTimeslots.filter(timeslot => timeslot.teacherId === teacherId)
  }

  /**
   * Get timeslots by date range
   */
  getTimeslotsByDateRange(startDate: string, endDate: string): TimeslotWithBookings[] {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase timeslots by date range query
        // const result = await supabaseTimeslotsService.getTimeslotsByDateRange(startDate, endDate)
        // return result
        this.useLegacyMode = true
      } catch (error) {
        console.error('Supabase getTimeslotsByDateRange failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    const allTimeslots = legacyGetAllTimeslotsWithBookings()
    return allTimeslots.filter(timeslot => {
      const timeslotDate = new Date(timeslot.date)
      const start = new Date(startDate)
      const end = new Date(endDate)
      return timeslotDate >= start && timeslotDate <= end
    })
  }

  /**
   * Get available timeslots
   */
  getAvailableTimeslots(): TimeslotWithBookings[] {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase available timeslots query
        // const result = await supabaseTimeslotsService.getAvailableTimeslots()
        // return result
        this.useLegacyMode = true
      } catch (error) {
        console.error('Supabase getAvailableTimeslots failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    const allTimeslots = legacyGetAllTimeslotsWithBookings()
    return allTimeslots.filter(timeslot => 
      timeslot.status === 'available' && 
      timeslot.timeStatus !== 'canceled' &&
      timeslot.timeStatus !== 'completed'
    )
  }

  /**
   * Get canceled timeslots
   */
  getCanceledTimeslots(): TimeslotWithBookings[] {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase canceled timeslots query
        // const result = await supabaseTimeslotsService.getCanceledTimeslots()
        // return result
        this.useLegacyMode = true
      } catch (error) {
        console.error('Supabase getCanceledTimeslots failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    const allTimeslots = legacyGetAllTimeslotsWithBookings()
    return allTimeslots.filter(timeslot => timeslot.timeStatus === 'canceled')
  }

  /**
   * Batch cancel timeslots
   */
  async batchCancelTimeslots(timeslotIds: string[]): Promise<{ success: string[], failed: string[] }> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase batch cancel timeslots
        // const result = await supabaseTimeslotsService.batchCancelTimeslots(timeslotIds)
        // return result
        this.useLegacyMode = true
      } catch (error) {
        console.error('Supabase batchCancelTimeslots failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    const results = { success: [] as string[], failed: [] as string[] }
    
    for (const timeslotId of timeslotIds) {
      try {
        const cancelled = await legacyCancelTimeslot(timeslotId)
        if (cancelled) {
          results.success.push(timeslotId)
        } else {
          results.failed.push(timeslotId)
        }
      } catch (error) {
        results.failed.push(timeslotId)
      }
    }

    return results
  }

  /**
   * Update timeslot details
   */
  async updateTimeslot(timeslotId: string, updates: {
    classroom_link?: string
    material_link?: string
  }): Promise<boolean> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase timeslot update
        // const result = await supabaseTimeslotsService.updateTimeslot(timeslotId, updates)
        // return result
        this.useLegacyMode = true
      } catch (error) {
        console.error('Supabase updateTimeslot failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation - update in localStorage if available
    try {
      const timeslotUpdates = JSON.parse(localStorage.getItem('timeslotUpdates') || '{}')
      timeslotUpdates[timeslotId] = {
        ...timeslotUpdates[timeslotId],
        ...updates,
        updated_at: new Date().toISOString()
      }
      localStorage.setItem('timeslotUpdates', JSON.stringify(timeslotUpdates))
      console.log('✅ 時段資訊已更新:', { timeslotId, updates })
      return true
    } catch (error) {
      console.error('更新時段失敗:', error)
      return false
    }
  }
}

export const timeslotService = new UnifiedTimeslotService()

// Re-export types for compatibility
export type { TimeslotWithBookings }