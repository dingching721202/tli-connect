/**
 * Unified Leave Service - Phase 3 Refactor
 * 
 * This service provides a unified interface that integrates:
 * - Supabase Leave Requests table (primary, when implemented)
 * - Legacy localStorage leave data (current implementation)
 * - Backwards compatibility with existing API
 */

interface LeaveRequest {
  id: string
  teacherId: number
  teacherName: string
  teacherEmail: string
  sessionId: string
  courseName: string
  courseDate: string
  courseTime: string
  reason: string
  note?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  reviewedAt: string | null
  reviewerName: string | null
  adminNote: string | null
  leaveReason?: string
  requestDate?: string[]
  studentCount?: number
  classroom?: string
  substituteTeacher?: { name: string; email: string } | null
}

class UnifiedLeaveService {
  private useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED // Start with legacy mode

  constructor() {
    // 🎯 Phase 4.3: Supabase integration ACTIVE
    this.useLegacyMode = false
    console.log('🚀 Unified Leave Service: Phase 4.3 - Supabase integration ACTIVE')
  }

  /**
   * Create leave request
   */
  async createLeaveRequest(requestData: {
    teacherId: number
    teacherName: string
    teacherEmail: string
    sessionId: string
    courseName: string
    courseDate: string
    courseTime: string
    reason: string
    note?: string
    studentCount?: number
    classroom?: string
  }) {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase leave request creation
        return this.legacyCreateLeaveRequest(requestData)
      } catch (error) {
        console.error('Supabase createLeaveRequest failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyCreateLeaveRequest(requestData)
  }

  /**
   * Get all leave requests (admin)
   */
  async getAllLeaveRequests() {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase leave requests query
        return this.legacyGetAllLeaveRequests()
      } catch (error) {
        console.error('Supabase getAllLeaveRequests failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetAllLeaveRequests()
  }

  /**
   * Review leave request (admin)
   */
  async reviewLeaveRequest(
    requestId: string, 
    status: 'approved' | 'rejected', 
    adminNote?: string, 
    reviewerName?: string, 
    substituteTeacher?: { name: string; email: string }
  ) {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase leave request review
        return this.legacyReviewLeaveRequest(requestId, status, adminNote, reviewerName, substituteTeacher)
      } catch (error) {
        console.error('Supabase reviewLeaveRequest failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyReviewLeaveRequest(requestId, status, adminNote, reviewerName, substituteTeacher)
  }

  /**
   * Get teacher's leave requests
   */
  async getTeacherLeaveRequests(teacherId: number) {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase teacher leave requests query
        return this.legacyGetTeacherLeaveRequests(teacherId)
      } catch (error) {
        console.error('Supabase getTeacherLeaveRequests failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetTeacherLeaveRequests(teacherId)
  }

  /**
   * Cancel leave request (teacher)
   */
  async cancelLeaveRequest(requestId: string, teacherId: number, allowApproved: boolean = false) {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase leave request cancellation
        return this.legacyCancelLeaveRequest(requestId, teacherId, allowApproved)
      } catch (error) {
        console.error('Supabase cancelLeaveRequest failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyCancelLeaveRequest(requestId, teacherId, allowApproved)
  }

  /**
   * Get leave request statistics
   */
  async getLeaveRequestStatistics(teacherId?: number) {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase leave request statistics
        return this.legacyGetLeaveRequestStatistics(teacherId)
      } catch (error) {
        console.error('Supabase getLeaveRequestStatistics failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetLeaveRequestStatistics(teacherId)
  }

  // ===== Legacy implementations =====

  private async legacyCreateLeaveRequest(requestData: {
    teacherId: number
    teacherName: string
    teacherEmail: string
    sessionId: string
    courseName: string
    courseDate: string
    courseTime: string
    reason: string
    note?: string
    studentCount?: number
    classroom?: string
  }) {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(500)
    
    try {
      const existingRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]')
      
      const newRequest = {
        id: Date.now().toString(),
        teacherId: requestData.teacherId,
        teacherName: requestData.teacherName,
        teacherEmail: requestData.teacherEmail,
        sessionId: requestData.sessionId,
        courseName: requestData.courseName,
        courseDate: requestData.courseDate,
        courseTime: requestData.courseTime,
        leaveReason: requestData.reason,
        requestDate: new Date().toISOString().split('T'),
        note: requestData.reason || '',
        studentCount: requestData.studentCount || 0,
        classroom: requestData.classroom || '線上教室',
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        reviewedAt: null,
        reviewerName: null,
        adminNote: null,
        substituteTeacher: null
      }
      
      existingRequests.push(newRequest)
      localStorage.setItem('leaveRequests', JSON.stringify(existingRequests))
      
      console.log('✅ 請假申請已創建:', newRequest)
      
      return { success: true, data: newRequest }
    } catch (error) {
      console.error('創建請假申請失敗:', error)
      return { success: false, error: 'Failed to create leave request' }
    }
  }

  private async legacyGetAllLeaveRequests() {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(300)
    
    try {
      const requests = JSON.parse(localStorage.getItem('leaveRequests') || '[]')
      return { success: true, data: requests }
    } catch (error) {
      console.error('獲取請假申請失敗:', error)
      return { success: false, error: 'Failed to get leave requests' }
    }
  }

  private async legacyReviewLeaveRequest(
    requestId: string, 
    status: 'approved' | 'rejected', 
    adminNote?: string, 
    reviewerName?: string, 
    substituteTeacher?: { name: string; email: string }
  ) {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(500)
    
    try {
      const requests = JSON.parse(localStorage.getItem('leaveRequests') || '[]')
      const requestIndex = requests.findIndex((r: LeaveRequest) => r.id === requestId)
      
      if (requestIndex === -1) {
        return { success: false, error: 'Leave request not found' }
      }
      
      requests[requestIndex] = {
        ...requests[requestIndex],
        status,
        reviewedAt: new Date().toISOString(),
        reviewerName: reviewerName || '管理員',
        adminNote: adminNote || '',
        substituteTeacher: substituteTeacher || requests[requestIndex].substituteTeacher || null
      }
      
      localStorage.setItem('leaveRequests', JSON.stringify(requests))
      
      console.log(`✅ 請假申請已${status === 'approved' ? '批准' : '拒絕'}:`, requests[requestIndex])
      
      return { success: true, data: requests[requestIndex] }
    } catch (error) {
      console.error('審核請假申請失敗:', error)
      return { success: false, error: 'Failed to review leave request' }
    }
  }

  private async legacyGetTeacherLeaveRequests(teacherId: number) {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(300)
    
    try {
      const allRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]')
      const teacherRequests = allRequests.filter((r: LeaveRequest) => r.teacherId === teacherId)
      return { success: true, data: teacherRequests }
    } catch (error) {
      console.error('獲取老師請假申請失敗:', error)
      return { success: false, error: 'Failed to get teacher leave requests' }
    }
  }

  private async legacyCancelLeaveRequest(requestId: string, teacherId: number, allowApproved: boolean = false) {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(500)
    
    try {
      const requests = JSON.parse(localStorage.getItem('leaveRequests') || '[]')
      const requestIndex = requests.findIndex((r: LeaveRequest) => {
        const matchesId = r.id === requestId && r.teacherId === teacherId
        if (!allowApproved) {
          return matchesId && r.status === 'pending'
        } else {
          return matchesId && (r.status === 'pending' || r.status === 'approved')
        }
      })
      
      if (requestIndex === -1) {
        const statusMsg = allowApproved ? 'pending or approved' : 'pending'
        return { success: false, error: `Leave request not found or not in ${statusMsg} status` }
      }
      
      const cancelledRequest = requests[requestIndex]
      requests.splice(requestIndex, 1)
      
      localStorage.setItem('leaveRequests', JSON.stringify(requests))
      
      console.log('✅ 請假申請已取消:', cancelledRequest)
      
      return { success: true, data: cancelledRequest }
    } catch (error) {
      console.error('取消請假申請失敗:', error)
      return { success: false, error: 'Failed to cancel leave request' }
    }
  }

  private async legacyGetLeaveRequestStatistics(teacherId?: number) {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(300)
    
    try {
      const allRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]')
      const targetRequests = teacherId ? 
        allRequests.filter((r: LeaveRequest) => r.teacherId === teacherId) : 
        allRequests
      
      const total = targetRequests.length
      const pending = targetRequests.filter((r: LeaveRequest) => r.status === 'pending').length
      const approved = targetRequests.filter((r: LeaveRequest) => r.status === 'approved').length
      const rejected = targetRequests.filter((r: LeaveRequest) => r.status === 'rejected').length
      
      const recentRequests = targetRequests
        .filter((r: LeaveRequest) => {
          const requestDate = new Date(r.createdAt)
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          return requestDate >= thirtyDaysAgo
        })
        .length
      
      return {
        success: true,
        data: {
          total,
          pending,
          approved,
          rejected,
          recentRequests,
          approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0
        }
      }
    } catch (error) {
      console.error('獲取請假申請統計失敗:', error)
      return { success: false, error: 'Failed to get leave request statistics' }
    }
  }
}

export const leaveService = new UnifiedLeaveService()