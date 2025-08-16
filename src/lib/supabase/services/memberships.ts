import { BaseSupabaseService } from './base'
import { UnifiedMembership, MembershipPlan, MembershipType, MembershipStatus, Campus } from '../types'
import { PaginationOptions, PaginatedResponse, QueryResult } from '../types'

export interface MembershipFilters {
  user_id?: string
  organization_id?: string
  type?: MembershipType
  status?: MembershipStatus
  campus?: Campus
  card_number?: string
}

export interface CreateMembershipData {
  user_id: string
  organization_id?: string
  plan_id: string
  type: MembershipType
  campus: Campus
  auto_renew?: boolean
}

export interface UpdateMembershipData {
  status?: MembershipStatus
  activated_at?: string
  expires_at?: string
  auto_renew?: boolean
}

export class MembershipsService extends BaseSupabaseService {
  /**
   * Get paginated list of memberships with filters
   */
  async getMemberships(
    filters: MembershipFilters = {},
    pagination: PaginationOptions
  ): Promise<PaginatedResponse<UnifiedMembership & { plan_name: string; user_name: string }>> {
    let query = this.client
      .from('active_memberships_with_plans')
      .select('*')

    // Apply filters
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id)
    }
    
    if (filters.organization_id) {
      query = query.eq('organization_id', filters.organization_id)
    }
    
    if (filters.type) {
      query = query.eq('type', filters.type)
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters.campus) {
      query = query.eq('campus', filters.campus)
    }
    
    if (filters.card_number) {
      query = query.eq('card_number', filters.card_number)
    }

    return this.paginatedQuery(query, pagination)
  }

  /**
   * Get single membership by ID
   */
  async getMembershipById(membershipId: string): Promise<QueryResult<UnifiedMembership>> {
    const query = this.client
      .from('unified_memberships')
      .select('*')
      .eq('id', membershipId)

    return this.singleQuery(query)
  }

  /**
   * Get user's active membership
   */
  async getUserActiveMembership(userId: string): Promise<QueryResult<UnifiedMembership & { plan_name: string }>> {
    const query = this.client
      .from('active_memberships_with_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'ACTIVATED')
      .order('activated_at', { ascending: false })

    return this.singleQuery(query)
  }

  /**
   * Get user's memberships (all statuses)
   */
  async getUserMemberships(userId: string): Promise<QueryResult<UnifiedMembership[]>> {
    const query = this.client
      .from('unified_memberships')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return this.listQuery(query)
  }

  /**
   * Get membership by card number
   */
  async getMembershipByCardNumber(cardNumber: string): Promise<QueryResult<UnifiedMembership>> {
    const query = this.client
      .from('unified_memberships')
      .select('*')
      .eq('card_number', cardNumber)

    return this.singleQuery(query)
  }

  /**
   * Create new membership
   */
  async createMembership(membershipData: CreateMembershipData): Promise<QueryResult<UnifiedMembership>> {
    try {
      // Get plan details for validation and setup
      const { data: plan, error: planError } = await this.client
        .from('membership_plans')
        .select('*')
        .eq('id', membershipData.plan_id)
        .eq('is_active', true)
        .single()

      if (planError || !plan) {
        throw new Error('Invalid or inactive membership plan')
      }

      // Generate unique card number
      const cardNumber = await this.generateCardNumber(membershipData.campus)

      // Create membership record
      const { data, error } = await this.client
        .from('unified_memberships')
        .insert({
          user_id: membershipData.user_id,
          organization_id: membershipData.organization_id,
          plan_id: membershipData.plan_id,
          type: membershipData.type,
          status: 'PURCHASED',
          card_number: cardNumber,
          purchased_at: new Date().toISOString(),
          campus: membershipData.campus,
          auto_renew: membershipData.auto_renew || false
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Log activity
      await this.logActivity(
        membershipData.user_id,
        'PURCHASE',
        'membership',
        data.id,
        `Membership purchased: ${plan.name}`,
        { 
          plan_name: plan.name, 
          card_number: cardNumber,
          type: membershipData.type
        },
        membershipData.campus
      )

      return { data, error: null }
    } catch (error: unknown) {
      return { data: null, error: new Error(error instanceof Error ? error.message : String(error)) }
    }
  }

  /**
   * Activate membership
   */
  async activateMembership(membershipId: string, activatedBy?: string): Promise<QueryResult<UnifiedMembership>> {
    try {
      // Get membership and plan details
      const { data: membership, error: membershipError } = await this.client
        .from('unified_memberships')
        .select(`
          *,
          membership_plans (
            duration_months
          )
        `)
        .eq('id', membershipId)
        .single()

      if (membershipError || !membership) {
        throw new Error('Membership not found')
      }

      if (membership.status !== 'PURCHASED') {
        throw new Error('Membership cannot be activated')
      }

      // Calculate expiration date
      const activatedAt = new Date()
      const expiresAt = new Date(activatedAt)
      expiresAt.setMonth(expiresAt.getMonth() + (membership as Record<string, Record<string, number>>).membership_plans.duration_months)

      // Update membership status
      const { data, error } = await this.client
        .from('unified_memberships')
        .update({
          status: 'ACTIVATED',
          activated_at: activatedAt.toISOString(),
          expires_at: expiresAt.toISOString()
        })
        .eq('id', membershipId)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Log activity
      await this.logActivity(
        activatedBy || membership.user_id,
        'MEMBERSHIP_ACTIVATE',
        'membership',
        membershipId,
        `Membership activated: ${membership.card_number}`,
        { 
          activated_at: activatedAt.toISOString(),
          expires_at: expiresAt.toISOString()
        },
        membership.campus
      )

      return { data, error: null }
    } catch (error: unknown) {
      return { data: null, error: new Error(error instanceof Error ? error.message : String(error)) }
    }
  }

  /**
   * Update membership
   */
  async updateMembership(membershipId: string, updateData: UpdateMembershipData): Promise<QueryResult<UnifiedMembership>> {
    try {
      const { data, error } = await this.client
        .from('unified_memberships')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', membershipId)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Log activity
      await this.logActivity(
        data.user_id,
        'MEMBERSHIP_UPDATE',
        'membership',
        membershipId,
        'Membership updated',
        updateData as Record<string, unknown>,
        data.campus
      )

      return { data, error: null }
    } catch (error: unknown) {
      return { data: null, error: new Error(error instanceof Error ? error.message : String(error)) }
    }
  }

  /**
   * Cancel membership
   */
  async cancelMembership(membershipId: string, cancelledBy?: string): Promise<QueryResult<UnifiedMembership>> {
    try {
      // Get membership details
      const { data: membership, error: membershipError } = await this.client
        .from('unified_memberships')
        .select('*')
        .eq('id', membershipId)
        .single()

      if (membershipError || !membership) {
        throw new Error('Membership not found')
      }

      const { data, error } = await this.client
        .from('unified_memberships')
        .update({
          status: 'CANCELLED',
          updated_at: new Date().toISOString()
        })
        .eq('id', membershipId)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Log activity
      await this.logActivity(
        cancelledBy || membership.user_id,
        'CANCELLATION',
        'membership',
        membershipId,
        `Membership cancelled: ${membership.card_number}`,
        { cancelled_by: cancelledBy },
        membership.campus
      )

      return { data, error: null }
    } catch (error: unknown) {
      return { data: null, error: new Error(error instanceof Error ? error.message : String(error)) }
    }
  }

  /**
   * Get all membership plans
   */
  async getMembershipPlans(campus?: Campus): Promise<QueryResult<MembershipPlan[]>> {
    let query = this.client
      .from('membership_plans')
      .select('*')
      .eq('is_active', true)

    if (campus) {
      query = query.eq('campus', campus)
    }

    query = query.order('price', { ascending: true })

    return this.listQuery(query)
  }

  /**
   * Check if user has valid membership for given date
   */
  async checkMembershipValidity(userId: string, checkDate: string = new Date().toISOString()): Promise<boolean> {
    try {
      const { data, error } = await this.client
        .from('unified_memberships')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'ACTIVATED')
        .gte('expires_at', checkDate)
        .limit(1)

      return !error && data && data.length > 0
    } catch (error) {
      console.error('Error checking membership validity:', error)
      return false
    }
  }

  /**
   * Generate unique card number
   */
  private async generateCardNumber(campus: Campus): Promise<string> {
    const campusCode = this.getCampusCode(campus)
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    
    return `${campusCode}${timestamp}${random}`
  }

  /**
   * Get campus code for card number generation
   */
  private getCampusCode(campus: Campus): string {
    const codes: Record<Campus, string> = {
      'TAIPEI': 'TPE',
      'TAICHUNG': 'TXG', 
      'KAOHSIUNG': 'KHH'
    }
    return codes[campus] || 'TPE'
  }

  /**
   * Get membership statistics for a user
   */
  async getMembershipStats(userId: string): Promise<QueryResult<{
    total_memberships: number
    active_memberships: number
    expired_memberships: number
    total_spent: number
  }>> {
    try {
      const { data: memberships, error } = await this.client
        .from('unified_memberships')
        .select(`
          id,
          status,
          orders (
            total_amount
          )
        `)
        .eq('user_id', userId)

      if (error) {
        throw error
      }

      const stats = {
        total_memberships: memberships?.length || 0,
        active_memberships: memberships?.filter(m => m.status === 'ACTIVATED').length || 0,
        expired_memberships: memberships?.filter(m => m.status === 'EXPIRED').length || 0,
        total_spent: memberships?.reduce((sum, m: { orders?: { total_amount?: number }[] }) => {
          return sum + (m.orders?.[0]?.total_amount || 0)
        }, 0) || 0
      }

      return { data: stats, error: null }
    } catch (error: unknown) {
      return { data: null, error: new Error(error instanceof Error ? error.message : String(error)) }
    }
  }
}

// Export singleton instance
export const membershipsService = new MembershipsService()