/**
 * Unified Membership Service - Phase 3 Refactor
 * 
 * This service provides a unified interface that integrates:
 * - Supabase Memberships (primary data source)
 * - Legacy memberCardStore (for migration period)
 * - Backwards compatibility with existing API
 */

import { membershipsService as supabaseMembershipsService } from '@/lib/supabase/services'
import { Membership, ApiResponse } from '@/types'
import { memberCardStore } from '@/lib/memberCardStore'
import { queryOptimizer } from '@/lib/performance/queryOptimizer'

class UnifiedMembershipService {
  private useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED

  constructor() {
    // Phase 4.3: Force Supabase mode activation
    this.useLegacyMode = false
    console.log('🚀 Unified Membership Service: Phase 4.3 - Supabase integration ACTIVE')
  }

  /**
   * Get all membership cards (admin view) with performance optimization
   */
  async getAllCards(): Promise<Membership[]> {
    const cacheKey = 'membership:all_cards';
    
    return queryOptimizer.executeWithCache(
      cacheKey,
      async () => {
        if (!this.useLegacyMode) {
          try {
            const result = await supabaseMembershipsService.getMemberships(
              {},
              { page: 1, limit: 1000, orderBy: 'created_at', ascending: false }
            )

            if (result.data) {
              // Convert Supabase format to legacy format
              return result.data.map(this.convertSupabaseToLegacyFormat)
            }
          } catch (error) {
            console.error('Supabase getAllCards failed, falling back to legacy:', error)
            this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
          }
        }

        // Legacy mode implementation
        return this.legacyGetAllCards()
      },
      2 * 60 * 1000 // 2 minutes cache
    );
  }

  /**
   * Create a new membership card
   */
  async createCard(cardData: {
    plan_id: number
    user_email: string
    user_name: string
    user_id: number
    order_id: number
    start_date: string
    end_date: string
    status: 'PURCHASED' | 'ACTIVE' | 'EXPIRED'
  }): Promise<Membership> {
    if (!this.useLegacyMode) {
      try {
        // Create membership in Supabase
        const createData = {
          user_id: cardData.user_id.toString(),
          plan_id: cardData.plan_id.toString(),
          type: 'individual' as const,
          campus: 'TAIPEI' as const, // Default campus
          auto_renew: false
        }

        const result = await supabaseMembershipsService.createMembership(createData)

        if (result.data) {
          // If status is ACTIVE, activate immediately
          if (cardData.status === 'ACTIVE') {
            await supabaseMembershipsService.activateMembership(result.data.id)
            const activatedResult = await supabaseMembershipsService.getMembershipById(result.data.id)
            if (activatedResult.data) {
              return this.convertSupabaseToLegacyFormat(activatedResult.data as Record<string, unknown>)
            }
          }

          return this.convertSupabaseToLegacyFormat(result.data as Record<string, unknown>)
        }
      } catch (error) {
        console.error('Supabase createCard failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    // Legacy mode implementation
    return this.legacyCreateCard(cardData)
  }

  /**
   * Activate membership card
   */
  async activateMemberCard(userId: number, membershipId: number): Promise<ApiResponse<Membership>> {
    if (!this.useLegacyMode) {
      try {
        // Find membership by user and ID
        const userMemberships = await supabaseMembershipsService.getUserMemberships(userId.toString())
        
        if (userMemberships.data) {
          const membership = userMemberships.data.find(m => 
            parseInt(m.id) === membershipId && m.status === 'PURCHASED'
          )

          if (!membership) {
            return { success: false, error: 'Membership not found or not inactive' }
          }

          // Check for existing active membership
          const activeMembership = userMemberships.data.find(m => m.status === 'ACTIVATED')
          if (activeMembership) {
            return { success: false, error: 'ACTIVE_CARD_EXISTS' }
          }

          // Activate membership
          const result = await supabaseMembershipsService.activateMembership(membership.id)
          
          if (result.data) {
            return { 
              success: true, 
              data: this.convertSupabaseToLegacyFormat(result.data as Record<string, unknown>)
            }
          }
        }

        return { success: false, error: 'Failed to activate membership' }
      } catch (error) {
        console.error('Supabase activateMemberCard failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    // Legacy mode implementation
    return this.legacyActivateMemberCard(userId, membershipId)
  }

  /**
   * Get user's active membership
   */
  async getMembership(userId: number): Promise<Membership | null> {
    if (!this.useLegacyMode) {
      try {
        const result = await supabaseMembershipsService.getUserActiveMembership(userId.toString())
        
        if (result.data) {
          return this.convertSupabaseToLegacyFormat(result.data as Record<string, unknown>)
        }
        
        return null
      } catch (error) {
        console.error('Supabase getMembership failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    // Legacy mode implementation
    return this.legacyGetMembership(userId)
  }

  /**
   * Get user's inactive (purchased but not activated) membership
   */
  async getUserInactiveMembership(userId: number): Promise<Membership | null> {
    if (!this.useLegacyMode) {
      try {
        const result = await supabaseMembershipsService.getUserMemberships(userId.toString())
        
        if (result.data) {
          const inactiveMembership = result.data.find(m => m.status === 'PURCHASED')
          if (inactiveMembership) {
            return this.convertSupabaseToLegacyFormat(inactiveMembership as Record<string, unknown>)
          }
        }
        
        return null
      } catch (error) {
        console.error('Supabase getUserInactiveMembership failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    // Legacy mode implementation
    return this.legacyGetUserInactiveMembership(userId)
  }

  /**
   * Get all user memberships (all statuses)
   */
  async getAllMembershipsByUserId(userId: number): Promise<Membership[]> {
    if (!this.useLegacyMode) {
      try {
        const result = await supabaseMembershipsService.getUserMemberships(userId.toString())
        
        if (result.data) {
          return result.data.map(m => this.convertSupabaseToLegacyFormat(m as Record<string, unknown>))
        }
        
        return []
      } catch (error) {
        console.error('Supabase getAllMembershipsByUserId failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    // Legacy mode implementation
    return this.legacyGetAllMembershipsByUserId(userId)
  }

  /**
   * Check and update expired memberships
   */
  async checkAndUpdateExpiredMemberships(): Promise<{ updated: number; expired: Membership[] }> {
    if (!this.useLegacyMode) {
      try {
        // Get all active memberships that should be expired
        const now = new Date().toISOString()
        const result = await supabaseMembershipsService.getMemberships(
          { status: 'ACTIVATED' },
          { page: 1, limit: 1000, orderBy: 'expires_at', ascending: true }
        )

        if (result.data) {
          const expiredMemberships: Membership[] = []
          
          for (const membership of result.data) {
            if (membership.expires_at && membership.expires_at < now) {
              // Update to expired status
              await supabaseMembershipsService.updateMembership(membership.id, {
                status: 'EXPIRED'
              })
              
              expiredMemberships.push(this.convertSupabaseToLegacyFormat(membership as Record<string, unknown>))
            }
          }

          return { 
            updated: expiredMemberships.length, 
            expired: expiredMemberships 
          }
        }

        return { updated: 0, expired: [] }
      } catch (error) {
        console.error('Supabase checkAndUpdateExpiredMemberships failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    // Legacy mode implementation
    return this.legacyCheckAndUpdateExpiredMemberships()
  }

  /**
   * Get all memberships (alias for getAllCards for compatibility)
   */
  async getAllMemberships(): Promise<Membership[]> {
    return this.getAllCards()
  }

  /**
   * Manually add member (admin function)
   */
  async manuallyAddMember(memberData: {
    user_name: string
    user_email: string
    plan_id: number
    auto_activation: boolean
    company_name?: string
  }): Promise<ApiResponse<Membership>> {
    if (!this.useLegacyMode) {
      try {
        // Create user first if not exists
        // TODO: Integrate with unified auth service to create user
        // For now, fallback to legacy implementation
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      } catch (error) {
        console.error('Supabase manuallyAddMember failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    // Legacy mode implementation
    return this.legacyManuallyAddMember(memberData)
  }

  /**
   * Update member information
   */
  async updateMemberInfo(membershipId: number, memberData: {
    user_name: string
    user_email: string
  }): Promise<ApiResponse<boolean>> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase member info update
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      } catch (error) {
        console.error('Supabase updateMemberInfo failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    // Legacy mode implementation
    return this.legacyUpdateMemberInfo(membershipId, memberData)
  }

  /**
   * Update member plan
   */
  async updateMemberPlan(membershipId: number, planId: number): Promise<ApiResponse<boolean>> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase plan update
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      } catch (error) {
        console.error('Supabase updateMemberPlan failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    // Legacy mode implementation
    return this.legacyUpdateMemberPlan(membershipId, planId)
  }

  /**
   * Update member card status
   */
  async updateMemberCardStatus(membershipId: number, status: Membership['status']): Promise<ApiResponse<boolean>> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase status update
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      } catch (error) {
        console.error('Supabase updateMemberCardStatus failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    // Legacy mode implementation
    return this.legacyUpdateMemberCardStatus(membershipId, status)
  }

  /**
   * Update member card dates
   */
  async updateMemberCardDates(membershipId: number, dates: {
    purchase_date?: string
    activation_deadline?: string
    activation_date?: string
    expiry_date?: string
  }): Promise<ApiResponse<boolean>> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase dates update
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      } catch (error) {
        console.error('Supabase updateMemberCardDates failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    // Legacy mode implementation
    return this.legacyUpdateMemberCardDates(membershipId, dates)
  }

  /**
   * Delete membership
   */
  async deleteMembership(membershipId: number): Promise<ApiResponse<boolean>> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase membership deletion
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      } catch (error) {
        console.error('Supabase deleteMembership failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    // Legacy mode implementation
    return this.legacyDeleteMembership(membershipId)
  }

  /**
   * Get expiring memberships (within specified days)
   */
  async getExpiringMemberships(days: number = 7): Promise<Membership[]> {
    if (!this.useLegacyMode) {
      try {
        const now = new Date()
        const checkDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

        const result = await supabaseMembershipsService.getMemberships(
          { status: 'ACTIVATED' },
          { page: 1, limit: 1000, orderBy: 'expires_at', ascending: true }
        )

        if (result.data) {
          const expiringMemberships = result.data.filter(m => {
            if (m.expires_at) {
              const expireTime = new Date(m.expires_at)
              return expireTime > now && expireTime <= checkDate
            }
            return false
          })

          return expiringMemberships.map(m => this.convertSupabaseToLegacyFormat(m as Record<string, unknown>))
        }

        return []
      } catch (error) {
        console.error('Supabase getExpiringMemberships failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    // Legacy mode implementation
    return this.legacyGetExpiringMemberships(days)
  }

  /**
   * Convert Supabase membership format to legacy format
   */
  private convertSupabaseToLegacyFormat(membership: Record<string, unknown>): Membership {
    return {
      id: parseInt(membership.id),
      created_at: membership.created_at,
      member_card_id: parseInt(membership.card_number?.slice(-6) || membership.id),
      duration_in_days: 365, // Default duration
      start_time: membership.activated_at || null,
      expire_time: membership.expires_at || null,
      activated: membership.status === 'ACTIVATED',
      activate_expire_time: membership.activation_deadline || '',
      user_id: parseInt(membership.user_id),
      status: membership.status === 'PURCHASED' ? 'INACTIVE' as const :
              membership.status === 'ACTIVATED' ? 'ACTIVE' as const :
              'EXPIRED' as const,
      plan_id: parseInt(membership.plan_id),
      user_email: membership.user_email || '',
      user_name: membership.user_name || '',
      order_id: membership.order_id ? parseInt(membership.order_id) : undefined
    }
  }

  // Legacy implementations (using existing memberCardStore)
  private async legacyManuallyAddMember(memberData: {
    user_name: string
    user_email: string
    plan_id: number
    auto_activation: boolean
    company_name?: string
  }): Promise<ApiResponse<Membership>> {
    try {
      const result = await memberCardStore.manuallyAddMember(memberData)
      return { success: true, data: result }
    } catch (error) {
      console.error('Legacy manuallyAddMember failed:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  private async legacyUpdateMemberInfo(membershipId: number, memberData: {
    user_name: string
    user_email: string
  }): Promise<ApiResponse<boolean>> {
    try {
      await memberCardStore.updateMemberInfo(membershipId, memberData)
      return { success: true, data: true }
    } catch (error) {
      console.error('Legacy updateMemberInfo failed:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  private async legacyUpdateMemberPlan(membershipId: number, planId: number): Promise<ApiResponse<boolean>> {
    try {
      await memberCardStore.updateMemberPlan(membershipId, planId)
      return { success: true, data: true }
    } catch (error) {
      console.error('Legacy updateMemberPlan failed:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  private async legacyUpdateMemberCardStatus(membershipId: number, status: Membership['status']): Promise<ApiResponse<boolean>> {
    try {
      await memberCardStore.updateMemberCardStatus(membershipId, status)
      return { success: true, data: true }
    } catch (error) {
      console.error('Legacy updateMemberCardStatus failed:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  private async legacyUpdateMemberCardDates(membershipId: number, dates: {
    purchase_date?: string
    activation_deadline?: string
    activation_date?: string
    expiry_date?: string
  }): Promise<ApiResponse<boolean>> {
    try {
      await memberCardStore.updateMemberCardDates(membershipId, dates)
      return { success: true, data: true }
    } catch (error) {
      console.error('Legacy updateMemberCardDates failed:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  private async legacyDeleteMembership(membershipId: number): Promise<ApiResponse<boolean>> {
    try {
      await memberCardStore.deleteMembership(membershipId)
      return { success: true, data: true }
    } catch (error) {
      console.error('Legacy deleteMembership failed:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  private async legacyGetAllCards(): Promise<Membership[]> {
    const userMemberships = await memberCardStore.getAllMemberships()
    
    return userMemberships
      .filter(um => um.member_card_id !== undefined && um.plan_id !== undefined)
      .map(um => this.convertLegacyMembershipToFormat({
        ...um,
        member_card_id: um.member_card_id!,
        plan_id: um.plan_id!
      }) as unknown as Membership)
  }

  private async legacyCreateCard(cardData: {
    plan_id: number
    user_email: string
    user_name: string
    user_id: number
    order_id: number
    start_date: string
    end_date: string
    status: 'PURCHASED' | 'ACTIVE' | 'EXPIRED'
  }): Promise<Membership> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(500)
    
    const userMembership = await memberCardStore.createMembership({
      user_id: cardData.user_id,
      user_name: cardData.user_name,
      user_email: cardData.user_email,
      plan_id: cardData.plan_id,
      order_id: cardData.order_id,
      amount_paid: 0,
      auto_renewal: false
    })

    if (cardData.status === 'ACTIVE') {
      await memberCardStore.activateMemberCard(userMembership.id)
    }

    return this.convertLegacyMembershipToFormat({
      ...userMembership,
      member_card_id: userMembership.member_card_id!,
      plan_id: userMembership.plan_id!
    }) as unknown as Membership
  }

  private async legacyActivateMemberCard(userId: number, membershipId: number): Promise<ApiResponse<Membership>> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(500)
    
    try {
      const userMembership = await memberCardStore.getMembershipById(membershipId)
      
      if (!userMembership || userMembership.user_id !== userId) {
        return { success: false, error: 'Membership not found or not inactive' }
      }

      if (userMembership.status !== 'inactive') {
        return { success: false, error: 'Membership not found or not inactive' }
      }

      const userMemberships = await memberCardStore.getMembershipsByUserId(userId)
      const activeMembership = userMemberships.find(m => m.status === 'activated')
      if (activeMembership) {
        return { success: false, error: 'ACTIVE_CARD_EXISTS' }
      }

      const activatedMembership = await memberCardStore.activateMemberCard(membershipId)
      
      if (!activatedMembership) {
        return { success: false, error: 'Failed to activate membership' }
      }

      const membership = this.convertLegacyMembershipToFormat({
        ...activatedMembership,
        member_card_id: activatedMembership.member_card_id!,
        plan_id: activatedMembership.plan_id!
      })
      
      return { success: true, data: membership as unknown as Membership }
    } catch (error) {
      console.error('啟用會員卡失敗:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  private async legacyGetMembership(userId: number): Promise<Membership | null> {
    const userMemberships = await memberCardStore.getMembershipsByUserId(userId)
    const activeMembership = userMemberships.find(m => m.status === 'activated')
    
    if (!activeMembership) {
      return null
    }

    return this.convertLegacyMembershipToFormat({
      ...activeMembership,
      member_card_id: activeMembership.member_card_id!,
      plan_id: activeMembership.plan_id!
    }) as unknown as Membership
  }

  private async legacyGetUserInactiveMembership(userId: number): Promise<Membership | null> {
    const userMemberships = await memberCardStore.getMembershipsByUserId(userId)
    const inactiveMembership = userMemberships.find(m => m.status === 'inactive')
    
    if (!inactiveMembership) {
      return null
    }

    return this.convertLegacyMembershipToFormat({
      ...inactiveMembership,
      member_card_id: inactiveMembership.member_card_id!,
      plan_id: inactiveMembership.plan_id!
    }) as unknown as Membership
  }

  private async legacyGetAllMembershipsByUserId(userId: number): Promise<Membership[]> {
    const userMemberships = await memberCardStore.getMembershipsByUserId(userId)
    
    return userMemberships
      .filter(um => um.member_card_id !== undefined && um.plan_id !== undefined)
      .map(um => this.convertLegacyMembershipToFormat({
        ...um,
        member_card_id: um.member_card_id!,
        plan_id: um.plan_id!
      }) as unknown as Membership)
  }

  private async legacyCheckAndUpdateExpiredMemberships(): Promise<{ updated: number; expired: Membership[] }> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(500)
    
    await memberCardStore.updateExpiredStatus()
    
    const expiredUserMemberships = await memberCardStore.getMembershipsByStatus('expired')
    
    const expiredMemberships = expiredUserMemberships
      .filter(um => um.member_card_id !== undefined && um.plan_id !== undefined)
      .map(um => this.convertLegacyMembershipToFormat({
        ...um,
        member_card_id: um.member_card_id!,
        plan_id: um.plan_id!
      }) as unknown as Membership)

    return { updated: expiredMemberships.length, expired: expiredMemberships }
  }

  private async legacyGetExpiringMemberships(days: number = 7): Promise<Membership[]> {
    const now = new Date()
    const checkDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

    const allMemberships = await memberCardStore.getAllMemberships()
    
    const expiringMemberships = allMemberships.filter(um => {
      if (um.status === 'activated' && um.expiry_date) {
        const expireTime = new Date(um.expiry_date)
        return expireTime > now && expireTime <= checkDate
      }
      return false
    })

    return expiringMemberships
      .filter(um => um.member_card_id !== undefined && um.plan_id !== undefined)
      .map(um => this.convertLegacyMembershipToFormat({
        ...um,
        member_card_id: um.member_card_id!,
        plan_id: um.plan_id!
      }) as unknown as Membership)
  }

  private convertLegacyMembershipToFormat(um: {
    id: number
    created_at: string
    member_card_id: number
    duration_days?: number
    activation_date?: string
    expiry_date?: string
    status: string
    activation_deadline?: string
    user_id: number
    plan_id: number
    user_email: string
    user_name: string
    order_id?: number
  }) {
    return {
      id: um.id,
      created_at: um.created_at,
      member_card_id: um.member_card_id,
      duration_in_days: um.duration_days || 365,
      start_time: um.activation_date || null,
      expire_time: um.expiry_date || null,
      activated: um.status === 'activated',
      activate_expire_time: um.activation_deadline || '',
      user_id: um.user_id,
      status: um.status === 'inactive' ? 'INACTIVE' as const : 
              um.status === 'activated' ? 'ACTIVE' as const : 
              'EXPIRED' as const,
      plan_id: um.plan_id,
      user_email: um.user_email,
      user_name: um.user_name,
      order_id: um.order_id
    }
  }
}

export const memberCardService = new UnifiedMembershipService()