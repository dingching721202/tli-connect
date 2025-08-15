/**
 * Unified Staff Service - Phase 3.4 Refactor
 * 
 * This service provides a unified interface that integrates:
 * - Supabase Staff Operations (primary data source)
 * - Legacy staff service (for migration period)
 * - Backwards compatibility with existing API
 */

import { ApiResponse } from '@/types'

class UnifiedStaffService {
  private useLegacyMode = true // Start with legacy mode for Phase 3.4

  constructor() {
    // Check if Supabase is available and properly configured
    this.checkSupabaseAvailability()
  }

  private async checkSupabaseAvailability() {
    try {
      // TODO: Test Supabase connection when staff service is ready
      // await supabaseStaffService.getStaffOperations()
      // this.useLegacyMode = false
      // console.log('🔧 Unified Staff Service: Using Supabase mode')
      this.useLegacyMode = true
      console.log('🔧 Unified Staff Service: Using Legacy mode (Supabase not implemented yet)')
    } catch (error) {
      console.warn('⚠️ Supabase not available, falling back to legacy mode:', error)
      this.useLegacyMode = true
    }
  }

  /**
   * Cancel timeslot (staff operation)
   */
  async cancelTimeslot(timeslotId: number): Promise<ApiResponse<boolean>> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase timeslot cancellation
        // const result = await supabaseStaffService.cancelTimeslot(timeslotId)
        // return result
        this.useLegacyMode = true
      } catch (error) {
        console.error('Supabase cancelTimeslot failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    return this.legacyCancelTimeslot(timeslotId)
  }

  /**
   * Restore timeslot (staff operation)
   */
  async restoreTimeslot(timeslotId: number): Promise<ApiResponse<boolean>> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase timeslot restoration
        // const result = await supabaseStaffService.restoreTimeslot(timeslotId)
        // return result
        this.useLegacyMode = true
      } catch (error) {
        console.error('Supabase restoreTimeslot failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    return this.legacyRestoreTimeslot(timeslotId)
  }

  /**
   * Batch cancel timeslots (staff operation)
   */
  async batchCancelTimeslots(timeslotIds: number[]): Promise<ApiResponse<{ success: number[], failed: number[] }>> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase batch timeslot cancellation
        // const result = await supabaseStaffService.batchCancelTimeslots(timeslotIds)
        // return result
        this.useLegacyMode = true
      } catch (error) {
        console.error('Supabase batchCancelTimeslots failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    return this.legacyBatchCancelTimeslots(timeslotIds)
  }

  /**
   * Get staff operations log
   */
  async getStaffOperationsLog(staffId?: number, limit?: number): Promise<any[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase staff operations log query
        // const result = await supabaseStaffService.getOperationsLog(staffId, limit)
        // return result
        this.useLegacyMode = true
      } catch (error) {
        console.error('Supabase getStaffOperationsLog failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    return this.legacyGetStaffOperationsLog(staffId, limit)
  }

  /**
   * Log staff operation
   */
  async logStaffOperation(operation: {
    staff_id: number
    operation_type: 'CANCEL_TIMESLOT' | 'RESTORE_TIMESLOT' | 'BATCH_CANCEL' | 'UPDATE_SCHEDULE'
    target_id: string | number
    description: string
    metadata?: any
  }): Promise<ApiResponse<any>> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase staff operation logging
        // const result = await supabaseStaffService.logOperation(operation)
        // return result
        this.useLegacyMode = true
      } catch (error) {
        console.error('Supabase logStaffOperation failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    return this.legacyLogStaffOperation(operation)
  }

  /**
   * Get system status for staff
   */
  async getSystemStatus(): Promise<{
    timeslots: { total: number, active: number, canceled: number }
    bookings: { total: number, active: number, canceled: number }
    teachers: { total: number, active: number }
    students: { total: number, active: number }
  }> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase system status query
        // const result = await supabaseStaffService.getSystemStatus()
        // return result
        this.useLegacyMode = true
      } catch (error) {
        console.error('Supabase getSystemStatus failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    return this.legacyGetSystemStatus()
  }

  // Legacy implementations
  private async legacyCancelTimeslot(timeslotId: number): Promise<ApiResponse<boolean>> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(500)

    try {
      // Get timeslots from localStorage
      const timeslots = JSON.parse(localStorage.getItem('classTimeslots') || '[]')
      const timeslotIndex = timeslots.findIndex((t: any) => t.id === timeslotId)
      
      if (timeslotIndex === -1) {
        return { success: false, error: 'Timeslot not found' }
      }

      // Cancel the timeslot
      timeslots[timeslotIndex].status = 'CANCELED'
      timeslots[timeslotIndex].updated_at = new Date().toISOString()
      localStorage.setItem('classTimeslots', JSON.stringify(timeslots))

      // Cancel related appointments
      const appointments = JSON.parse(localStorage.getItem('classAppointments') || '[]')
      const updatedAppointments = appointments.map((appointment: any) => {
        if (appointment.class_timeslot_id === timeslotId) {
          return { ...appointment, status: 'CANCELED', updated_at: new Date().toISOString() }
        }
        return appointment
      })
      localStorage.setItem('classAppointments', JSON.stringify(updatedAppointments))

      // Log operation
      await this.legacyLogStaffOperation({
        staff_id: 0, // System operation
        operation_type: 'CANCEL_TIMESLOT',
        target_id: timeslotId,
        description: `Canceled timeslot ${timeslotId}`,
        metadata: { timeslot: timeslots[timeslotIndex] }
      })

      console.log('✅ 時段已取消:', timeslotId)
      return { success: true, data: true }
    } catch (error) {
      console.error('取消時段失敗:', error)
      return { success: false, error: 'Failed to cancel timeslot' }
    }
  }

  private async legacyRestoreTimeslot(timeslotId: number): Promise<ApiResponse<boolean>> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(500)

    try {
      // Get timeslots from localStorage
      const timeslots = JSON.parse(localStorage.getItem('classTimeslots') || '[]')
      const timeslotIndex = timeslots.findIndex((t: any) => t.id === timeslotId)
      
      if (timeslotIndex === -1) {
        return { success: false, error: 'Timeslot not found' }
      }

      // Restore the timeslot
      timeslots[timeslotIndex].status = 'SCHEDULED'
      timeslots[timeslotIndex].updated_at = new Date().toISOString()
      localStorage.setItem('classTimeslots', JSON.stringify(timeslots))

      // Log operation
      await this.legacyLogStaffOperation({
        staff_id: 0, // System operation
        operation_type: 'RESTORE_TIMESLOT',
        target_id: timeslotId,
        description: `Restored timeslot ${timeslotId}`,
        metadata: { timeslot: timeslots[timeslotIndex] }
      })

      console.log('✅ 時段已恢復:', timeslotId)
      return { success: true, data: true }
    } catch (error) {
      console.error('恢復時段失敗:', error)
      return { success: false, error: 'Failed to restore timeslot' }
    }
  }

  private async legacyBatchCancelTimeslots(timeslotIds: number[]): Promise<ApiResponse<{ success: number[], failed: number[] }>> {
    const results = { success: [] as number[], failed: [] as number[] }

    for (const timeslotId of timeslotIds) {
      try {
        const result = await this.legacyCancelTimeslot(timeslotId)
        if (result.success) {
          results.success.push(timeslotId)
        } else {
          results.failed.push(timeslotId)
        }
      } catch (error) {
        results.failed.push(timeslotId)
      }
    }

    // Log batch operation
    await this.legacyLogStaffOperation({
      staff_id: 0, // System operation
      operation_type: 'BATCH_CANCEL',
      target_id: 'batch',
      description: `Batch canceled ${results.success.length} timeslots, ${results.failed.length} failed`,
      metadata: { results, timeslotIds }
    })

    return { success: true, data: results }
  }

  private async legacyGetStaffOperationsLog(staffId?: number, limit = 50): Promise<any[]> {
    try {
      const operations = JSON.parse(localStorage.getItem('staffOperations') || '[]')
      let filteredOps = operations

      if (staffId) {
        filteredOps = operations.filter((op: any) => op.staff_id === staffId)
      }

      return filteredOps
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit)
    } catch (error) {
      console.error('獲取課務操作記錄失敗:', error)
      return []
    }
  }

  private async legacyLogStaffOperation(operation: {
    staff_id: number
    operation_type: 'CANCEL_TIMESLOT' | 'RESTORE_TIMESLOT' | 'BATCH_CANCEL' | 'UPDATE_SCHEDULE'
    target_id: string | number
    description: string
    metadata?: any
  }): Promise<ApiResponse<any>> {
    try {
      const operations = JSON.parse(localStorage.getItem('staffOperations') || '[]')
      const generateId = (array: { id: number }[]): number => {
        return Math.max(0, ...array.map(item => item.id)) + 1
      }

      const newOperation = {
        id: generateId(operations),
        ...operation,
        created_at: new Date().toISOString()
      }

      operations.push(newOperation)
      localStorage.setItem('staffOperations', JSON.stringify(operations))

      console.log('✅ 課務操作已記錄:', newOperation)
      return { success: true, data: newOperation }
    } catch (error) {
      console.error('記錄課務操作失敗:', error)
      return { success: false, error: 'Failed to log staff operation' }
    }
  }

  private async legacyGetSystemStatus(): Promise<{
    timeslots: { total: number, active: number, canceled: number }
    bookings: { total: number, active: number, canceled: number }
    teachers: { total: number, active: number }
    students: { total: number, active: number }
  }> {
    try {
      const timeslots = JSON.parse(localStorage.getItem('classTimeslots') || '[]')
      const appointments = JSON.parse(localStorage.getItem('classAppointments') || '[]')
      const users = JSON.parse(localStorage.getItem('users') || '[]')

      return {
        timeslots: {
          total: timeslots.length,
          active: timeslots.filter((t: any) => t.status === 'SCHEDULED').length,
          canceled: timeslots.filter((t: any) => t.status === 'CANCELED').length
        },
        bookings: {
          total: appointments.length,
          active: appointments.filter((a: any) => a.status === 'CONFIRMED').length,
          canceled: appointments.filter((a: any) => a.status === 'CANCELED').length
        },
        teachers: {
          total: users.filter((u: any) => u.roles.includes('TEACHER')).length,
          active: users.filter((u: any) => u.roles.includes('TEACHER') && u.account_status === 'ACTIVE').length
        },
        students: {
          total: users.filter((u: any) => u.roles.includes('STUDENT')).length,
          active: users.filter((u: any) => u.roles.includes('STUDENT') && u.account_status === 'ACTIVE').length
        }
      }
    } catch (error) {
      console.error('獲取系統狀態失敗:', error)
      return {
        timeslots: { total: 0, active: 0, canceled: 0 },
        bookings: { total: 0, active: 0, canceled: 0 },
        teachers: { total: 0, active: 0 },
        students: { total: 0, active: 0 }
      }
    }
  }
}

export const staffService = new UnifiedStaffService()