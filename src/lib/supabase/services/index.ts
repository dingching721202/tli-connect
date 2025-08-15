// Service exports for easy importing
export { authService } from './auth'
export { usersService, type UserFilters, type CreateUserData, type UpdateUserData } from './users'
export { membershipsService, type MembershipFilters, type CreateMembershipData, type UpdateMembershipData } from './memberships'
export { 
  coursesService, 
  type CourseFilters, 
  type SessionFilters, 
  type EnrollmentFilters,
  type CreateCourseTemplateData,
  type CreateScheduleData,
  type CreateSessionData,
  type CreateEnrollmentData
} from './courses'

// Re-export base service for custom services
export { BaseSupabaseService } from './base'

// Re-export common types
export type {
  QueryResult,
  QueryListResult,
  PaginationOptions,
  PaginatedResponse
} from '../types'