/**
 * Unified Services Index - Phase 3 Refactor
 * 
 * This module exports all unified services that provide a bridge between:
 * - New Supabase-based services (primary data source)
 * - Legacy localStorage/mock data (fallback during migration)
 * - Existing API compatibility
 * 
 * Import these services instead of the original dataService exports
 * to get the benefits of Supabase integration with fallback support.
 */

// Core services - Phase 3.1 completed
export { authService } from './authService'
export { memberCardService } from './membershipService'
export { bookingService } from './bookingService'
export { dashboardService } from './dashboardService'

// Corporate services - Phase 3.2 completed
export { corporateService } from './corporateService'

// Auxiliary services - Phase 3.3 completed
export { agentService } from './agentService'
export { leaveService } from './leaveService'

// Phase 3.4 services - Now unified! ✅
export { orderService } from './orderService'
export { timeslotService } from './timeslotService'
export { staffService } from './staffService'

// Phase 3.5 services - Complete Unification! 🎯
export { teacherService } from './teacherService'
export { courseService } from './courseService'
export { memberCardPlanService } from './memberCardPlanService'
export { consultationService } from './consultationService'
export { systemSettingsService } from './systemSettingsService'
export { referralService } from './referralService'

// Re-export types for compatibility
export type { TimeslotWithBookings } from './timeslotService'
export type { Teacher } from './teacherService'
export type { Course, CourseTemplate, CourseSchedule } from './courseService'
export type { MemberCardPlan, MemberCard } from './memberCardPlanService'
export type { Consultation, ConsultationType, ConsultationStatus } from './consultationService'
export type { SystemSettings } from './systemSettingsService'
export type { ReferralCode, ReferralUsage, ReferralReward } from './referralService'

/**
 * Service availability status for monitoring migration progress
 */
export const serviceStatus = {
  // Phase 3.1 - Core services (✅ Completed)
  authService: { 
    status: 'unified', 
    supabaseIntegration: true, 
    legacyFallback: true,
    description: 'Supabase Auth with localStorage fallback'
  },
  memberCardService: { 
    status: 'unified', 
    supabaseIntegration: true, 
    legacyFallback: true,
    description: 'Supabase Memberships with memberCardStore fallback'
  },
  bookingService: { 
    status: 'unified', 
    supabaseIntegration: true, 
    legacyFallback: true,
    description: 'Supabase Courses/Enrollments with localStorage fallback'
  },
  dashboardService: { 
    status: 'unified', 
    supabaseIntegration: true, 
    legacyFallback: true,
    description: 'Aggregates unified services with legacy data integration'
  },
  
  // Phase 3.2 - Corporate services (✅ Completed)
  corporateService: { 
    status: 'unified', 
    supabaseIntegration: false, 
    legacyFallback: true,
    description: 'Corporate management with legacy stores (Supabase integration planned)'
  },
  
  // Phase 3.3 - Auxiliary services (✅ Completed)
  agentService: { 
    status: 'unified', 
    supabaseIntegration: false, 
    legacyFallback: true,
    description: 'Agent management with legacy data (Supabase integration planned)'
  },
  leaveService: { 
    status: 'unified', 
    supabaseIntegration: false, 
    legacyFallback: true,
    description: 'Leave management with localStorage (Supabase integration planned)'
  },
  
  // Phase 3.4 - Remaining services (✅ Completed)
  orderService: { 
    status: 'unified', 
    supabaseIntegration: false, 
    legacyFallback: true,
    description: 'Unified service with legacy fallback (Supabase integration planned)'
  },
  timeslotService: { 
    status: 'unified', 
    supabaseIntegration: false, 
    legacyFallback: true,
    description: 'Unified service with legacy fallback (Supabase integration planned)'
  },
  staffService: { 
    status: 'unified', 
    supabaseIntegration: false, 
    legacyFallback: true,
    description: 'Unified service with legacy fallback (Supabase integration planned)'
  },
  
  // Phase 3.5 - Complete Unification (🎯 NEW!)
  teacherService: { 
    status: 'unified', 
    supabaseIntegration: false, 
    legacyFallback: true,
    description: 'Teacher management with legacy data (Supabase integration planned)'
  },
  courseService: { 
    status: 'unified', 
    supabaseIntegration: false, 
    legacyFallback: true,
    description: 'Course management with legacy utilities (Supabase integration planned)'
  },
  memberCardPlanService: { 
    status: 'unified', 
    supabaseIntegration: false, 
    legacyFallback: true,
    description: 'Member card plans with legacy store (Supabase integration planned)'
  },
  consultationService: { 
    status: 'unified', 
    supabaseIntegration: false, 
    legacyFallback: true,
    description: 'Consultation management with localStorage (Supabase integration planned)'
  },
  systemSettingsService: { 
    status: 'unified', 
    supabaseIntegration: false, 
    legacyFallback: true,
    description: 'System settings with localStorage (Supabase integration planned)'
  },
  referralService: { 
    status: 'unified', 
    supabaseIntegration: false, 
    legacyFallback: true,
    description: 'Referral system with legacy data (Supabase integration planned)'
  }
} as const

/**
 * Get overall migration progress
 */
export function getMigrationProgress() {
  const services = Object.values(serviceStatus)
  const total = services.length
  const unified = services.filter(s => s.status === 'unified').length
  const legacy = 0 // All services are now unified
  
  return {
    total,
    unified,
    legacy,
    progressPercentage: Math.round((unified / total) * 100),
    phase3_1_complete: true,  // Core services (4/4 completed)
    phase3_2_complete: true,  // Corporate services (1/1 completed)
    phase3_3_complete: true,  // Auxiliary services (2/2 completed)
    phase3_4_complete: true,  // Remaining services (3/3 completed) ✅
    phase3_5_complete: true   // Complete Unification (6/6 completed) 🎯
  }
}

/**
 * Utility to check if a service is using Supabase
 */
export function isServiceSupabaseEnabled(serviceName: keyof typeof serviceStatus): boolean {
  return serviceStatus[serviceName]?.supabaseIntegration || false
}

/**
 * Utility to check if a service has legacy fallback
 */
export function hasServiceLegacyFallback(serviceName: keyof typeof serviceStatus): boolean {
  return serviceStatus[serviceName]?.legacyFallback || false
}

// Debug utilities
export function logMigrationStatus() {
  const progress = getMigrationProgress()
  console.log('📊 Service Migration Status:', progress)
  console.log('🔧 Service Details:', serviceStatus)
}

// Log current status on import (development only)
if (process.env.NODE_ENV === 'development') {
  console.log('🎯 Unified Services Phase 3.5 COMPLETE! 100% UNIFIED! 🚀', {
    phase3_1_unified: ['authService', 'memberCardService', 'bookingService', 'dashboardService'],
    phase3_2_unified: ['corporateService'],
    phase3_3_unified: ['agentService', 'leaveService'],
    phase3_4_unified: ['orderService', 'timeslotService', 'staffService'],
    phase3_5_unified: ['teacherService', 'courseService', 'memberCardPlanService', 'consultationService', 'systemSettingsService', 'referralService'], // 🎯 NEW!
    progress: getMigrationProgress()
  })
}