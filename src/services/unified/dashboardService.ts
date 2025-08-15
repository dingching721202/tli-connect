/**
 * Unified Dashboard Service - Phase 3 Refactor
 * 
 * This service provides a unified interface that integrates:
 * - Supabase data sources (primary)
 * - Legacy dashboard data (for migration period)
 * - Backwards compatibility with existing API
 */

import { memberCardService } from './membershipService'
import { bookingService } from './bookingService'
import { authService } from './authService'
import { generateBookingSessions } from '@/data/courseBookingIntegration'
import { teacherDataService } from '@/data/teachers'
import { hashString } from '@/utils/enrollmentUtils'

// Legacy imports
import { users as usersData } from '@/data/users'

class UnifiedDashboardService {
  private useLegacyMode = false

  constructor() {
    // Since dashboard service primarily aggregates other services,
    // we'll rely on the individual services' availability checks
    this.useLegacyMode = false
  }

  /**
   * Get dashboard data for any user role
   */
  async getDashboardData(userId: number, userRole?: string) {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(300)
    
    console.log(`📊 獲取 Dashboard 資料 - 用戶ID: ${userId}, 角色: ${userRole}`)
    
    if (userRole === 'TEACHER') {
      const upcomingClasses = await this.getTeacherBookings(userId)
      return {
        membership: null, // 教師不需要會員資格
        upcomingClasses
      }
    }
    
    // Student dashboard logic
    let membership = await memberCardService.getMembership(userId)
    console.log('🎯 找到的 ACTIVE 會員卡:', membership)
    
    if (!membership) {
      membership = await memberCardService.getUserInactiveMembership(userId)
      console.log('🎯 找到的 PURCHASED 會員卡:', membership)
    }
    
    console.log('📋 最終返回的會員資格:', membership)
    
    const upcomingClasses = await this.getBookedCoursesFromCalendar(userId)
    
    return {
      membership,
      upcomingClasses
    }
  }

  /**
   * Get teacher's upcoming bookings
   */
  async getTeacherBookings(teacherId: number) {
    try {
      console.log(`👨‍🏫 獲取教師 ${teacherId} 的預約資料`)
      
      const allSessions = generateBookingSessions()
      console.log('📅 所有課程時段數量:', allSessions.length)
      
      const allAppointments = await bookingService.getAllBookings()
      const appointments = allAppointments.success ? allAppointments.data || [] : []
      console.log('📋 所有預約記錄數量:', appointments.length)
      
      // Get teacher info
      let teacher = teacherDataService.getTeacherById(teacherId)
      
      if (!teacher) {
        const users: any[] = [...usersData]
        const user = users.find(u => u.id === teacherId && u.roles.includes('TEACHER'))
        if (user) {
          const allTeachers = teacherDataService.getAllTeachers()
          teacher = allTeachers.find(t => t.email === user.email) || null
          console.log(`通過email ${user.email} 找到教師:`, teacher?.name)
        }
      }
      
      if (!teacher) {
        console.warn(`找不到教師 ID: ${teacherId}`)
        return []
      }
      
      console.log('👨‍🏫 找到教師:', teacher.name)
      
      // Find teacher's sessions
      const teacherSessions = allSessions.filter(session => {
        return session.teacherName === teacher.name || 
               session.teacherId === teacherId ||
               session.teacherId === teacherId.toString()
      })
      
      console.log(`📚 教師 ${teacher.name} 的課程時段數量:`, teacherSessions.length)
      
      // Show all teacher sessions regardless of enrollment
      const teacherBookings = []
      
      for (const session of teacherSessions) {
        const sessionHashId = hashString(session.id)
        
        // Find students enrolled in this session
        const sessionAppointments = appointments.filter(appointment => 
          appointment.class_timeslot_id === sessionHashId && 
          appointment.status === 'CONFIRMED'
        )
        
        if (sessionAppointments.length > 0) {
          // Has enrolled students: status "opened"
          for (const appointment of sessionAppointments) {
            const student = usersData.find(u => u.id === appointment.user_id)
            
            teacherBookings.push({
              appointment,
              session: {
                ...session,
                bookingStatus: 'opened' // 已開課
              },
              student: student ? {
                id: student.id,
                name: student.name,
                email: student.email,
                phone: student.phone || ''
              } : null
            })
          }
        } else {
          // No enrolled students: status "pending"
          teacherBookings.push({
            appointment: null,
            session: {
              ...session,
              bookingStatus: 'pending' // 待開課
            },
            student: null
          })
        }
      }
      
      console.log(`👥 教師 ${teacher.name} 的學生預約數量:`, teacherBookings.length)
      
      return teacherBookings
    } catch (error) {
      console.error('獲取教師預約資料失敗:', error)
      return []
    }
  }

  /**
   * Get booked courses from calendar system (for students)
   */
  async getBookedCoursesFromCalendar(userId: number) {
    try {
      const allSessions = generateBookingSessions()
      
      const appointments = await bookingService.getUserAppointments(userId)
      console.log('📋 getUserAppointments 返回的預約記錄:', appointments)
      
      const confirmedAppointments = appointments.filter(a => a.status === 'CONFIRMED')
      const cancelledAppointments = appointments.filter(a => a.status === 'CANCELED')
      console.log('✅ CONFIRMED 預約數量:', confirmedAppointments.length)
      console.log('❌ CANCELED 預約數量:', cancelledAppointments.length)
      
      const bookedSessions = []
      
      for (const appointment of appointments) {
        const session = allSessions.find(s => {
          const sessionHashId = hashString(s.id)
          return sessionHashId === appointment.class_timeslot_id
        })
        
        if (session) {
          const bookedSession = {
            appointment,
            session,
            timeslot: {
              id: appointment.class_timeslot_id,
              start_time: `${session.date} ${session.startTime}`,
              end_time: `${session.date} ${session.endTime}`,
              class_id: session.courseId
            },
            class: {
              id: session.courseId,
              course_id: session.courseId
            },
            course: {
              id: session.courseId,
              title: session.courseTitle
            }
          }
          
          console.log('📋 找到匹配的課程時段:', {
            appointmentId: appointment.id,
            appointmentStatus: appointment.status,
            sessionTitle: session.courseTitle,
            timeslotId: appointment.class_timeslot_id
          })
          
          bookedSessions.push(bookedSession)
        } else {
          console.warn('⚠️ 找不到匹配的課程時段:', {
            appointmentId: appointment.id,
            timeslotId: appointment.class_timeslot_id,
            appointmentStatus: appointment.status
          })
        }
      }
      
      // Sort by time (earliest first)
      bookedSessions.sort((a, b) => 
        new Date(`${a.session.date} ${a.session.startTime}`).getTime() - 
        new Date(`${b.session.date} ${b.session.startTime}`).getTime()
      )
      
      const statusCounts = {
        confirmed: bookedSessions.filter(s => s.appointment.status === 'CONFIRMED').length,
        canceled: bookedSessions.filter(s => s.appointment.status === 'CANCELED').length,
        total: bookedSessions.length
      }
      console.log('📊 getBookedCoursesFromCalendar 狀態統計:', statusCounts)
      
      return bookedSessions
    } catch (error) {
      console.error('獲取預約課程失敗:', error)
      return []
    }
  }

  /**
   * Get teacher's courses from calendar (for teacher dashboard)
   */
  async getTeacherCoursesFromCalendar(teacherId: number) {
    try {
      const allSessions = generateBookingSessions()
      
      // Handle user system vs teacher management system ID mismatch
      const currentUser = usersData.find(u => u.id === teacherId)
      
      let actualTeacherId = teacherId
      if (currentUser && currentUser.roles.includes('TEACHER')) {
        const teacherInSystem = teacherDataService.getTeacherByEmail(currentUser.email)
        if (teacherInSystem) {
          actualTeacherId = teacherInSystem.id
          console.log(`🔄 用戶ID ${teacherId} (${currentUser.name}) 映射到教師系統ID ${actualTeacherId}`)
        }
      }
      
      // Filter sessions for this teacher
      const teacherSessions = allSessions.filter(session => 
        session.teacherId.toString() === actualTeacherId.toString()
      )
      
      const coursesWithStudents = []
      
      for (const session of teacherSessions) {
        const sessionHashId = hashString(session.id)
        console.log(`📊 檢查課程時段 ID 匹配:`, {
          sessionId: session.id,
          sessionHashId,
          courseTitle: session.courseTitle,
          teacherId: session.teacherId
        })
        
        // Get all appointments for this session
        const allAppointments = await bookingService.getAllBookings()
        const appointments = allAppointments.success ? allAppointments.data || [] : []
        
        const sessionAppointments = appointments.filter(appointment => 
          appointment.class_timeslot_id === sessionHashId && 
          appointment.status === 'CONFIRMED'
        )
        
        console.log(`🔍 找到 ${sessionAppointments.length} 個預約，時段ID: ${sessionHashId}`)
        
        // Get enrolled students info
        const studentList = []
        for (const appointment of sessionAppointments) {
          const student = usersData.find(u => u.id === appointment.user_id)
          if (student) {
            studentList.push({
              id: student.id,
              name: student.name,
              email: student.email
            })
          }
        }
        
        coursesWithStudents.push({
          session,
          studentList,
          appointmentCount: sessionAppointments.length
        })
      }
      
      // Sort by time (earliest first)
      coursesWithStudents.sort((a, b) => 
        new Date(`${a.session.date} ${a.session.startTime}`).getTime() - 
        new Date(`${b.session.date} ${b.session.startTime}`).getTime()
      )
      
      return coursesWithStudents
    } catch (error) {
      console.error('獲取老師課程失敗:', error)
      return []
    }
  }

  /**
   * Get dashboard statistics (admin use)
   */
  async getDashboardStats() {
    try {
      // Get all users count
      const allUsersResult = await authService.getAllUsersWithRoles()
      const totalUsers = allUsersResult.success ? allUsersResult.data?.length || 0 : 0

      // Get active memberships count
      const allMemberships = await memberCardService.getAllCards()
      const activeMemberships = allMemberships.filter(m => m.status === 'ACTIVE').length

      // Get upcoming classes count
      const allBookings = await bookingService.getAllBookings()
      const upcomingBookings = allBookings.success ? 
        (allBookings.data || []).filter(a => a.status === 'CONFIRMED').length : 0

      // Get teacher count
      const teachers = allUsersResult.success ? 
        (allUsersResult.data || []).filter(u => u.roles.includes('TEACHER')).length : 0

      return {
        totalUsers,
        activeMemberships,
        upcomingBookings,
        totalTeachers: teachers,
        expiredMemberships: allMemberships.filter(m => m.status === 'EXPIRED').length,
        pendingMemberships: allMemberships.filter(m => m.status === 'INACTIVE').length
      }
    } catch (error) {
      console.error('獲取Dashboard統計失敗:', error)
      return {
        totalUsers: 0,
        activeMemberships: 0,
        upcomingBookings: 0,
        totalTeachers: 0,
        expiredMemberships: 0,
        pendingMemberships: 0
      }
    }
  }
}

export const dashboardService = new UnifiedDashboardService()