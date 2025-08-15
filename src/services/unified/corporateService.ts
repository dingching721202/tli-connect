/**
 * Unified Corporate Service - Phase 3 Refactor
 * 
 * This service provides a unified interface that integrates:
 * - Supabase Organizations and Corporate Subscriptions (primary)
 * - Legacy corporate stores (for migration period)
 * - Backwards compatibility with existing API
 */

import { corporateStore } from '@/lib/corporateStore'
import { corporateSubscriptionStore } from '@/lib/corporateSubscriptionStore'
import { corporateMemberStore } from '@/lib/corporateMemberStore'
import { Company } from '@/data/corporateData'
import { CorporateSubscription } from '@/types/corporateSubscription'

class UnifiedCorporateService {
  private useLegacyMode = true // Start with legacy mode, will implement Supabase later

  constructor() {
    // For now, we'll use legacy mode as Supabase tables may not be ready
    this.useLegacyMode = true
    console.log('🔧 Unified Corporate Service: Using Legacy mode')
  }

  // ===== Company Management =====

  /**
   * Get all companies
   */
  async getAllCompanies(): Promise<Company[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase organizations query
        // const result = await supabaseOrganizationsService.getOrganizations()
        // return result.data
        return this.legacyGetAllCompanies()
      } catch (error) {
        console.error('Supabase getAllCompanies failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyGetAllCompanies()
  }

  /**
   * Get company by ID
   */
  async getCompanyById(id: string | number): Promise<Company | null> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase organization by ID query
        return this.legacyGetCompanyById(id)
      } catch (error) {
        console.error('Supabase getCompanyById failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyGetCompanyById(id)
  }

  /**
   * Get companies by status
   */
  async getCompaniesByStatus(status: Company['status']): Promise<Company[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase organizations by status query
        return this.legacyGetCompaniesByStatus(status)
      } catch (error) {
        console.error('Supabase getCompaniesByStatus failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyGetCompaniesByStatus(status)
  }

  /**
   * Create company
   */
  async createCompany(companyData: Omit<Company, 'id' | 'createdAt'>): Promise<Company> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase organization creation
        return this.legacyCreateCompany(companyData)
      } catch (error) {
        console.error('Supabase createCompany failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyCreateCompany(companyData)
  }

  /**
   * Update company
   */
  async updateCompany(id: string | number, updates: Partial<Company>): Promise<Company | null> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase organization update
        return this.legacyUpdateCompany(id, updates)
      } catch (error) {
        console.error('Supabase updateCompany failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyUpdateCompany(id, updates)
  }

  /**
   * Delete company
   */
  async deleteCompany(id: string | number): Promise<boolean> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase organization deletion
        return this.legacyDeleteCompany(id)
      } catch (error) {
        console.error('Supabase deleteCompany failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyDeleteCompany(id)
  }

  /**
   * Search companies
   */
  async searchCompanies(searchTerm: string): Promise<Company[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase organizations search
        return this.legacySearchCompanies(searchTerm)
      } catch (error) {
        console.error('Supabase searchCompanies failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacySearchCompanies(searchTerm)
  }

  /**
   * Get company statistics
   */
  async getCompanyStatistics() {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase organizations statistics
        return this.legacyGetCompanyStatistics()
      } catch (error) {
        console.error('Supabase getCompanyStatistics failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyGetCompanyStatistics()
  }

  // ===== Corporate Subscription Management =====

  /**
   * Get all corporate subscriptions
   */
  async getAllCorporateSubscriptions(): Promise<CorporateSubscription[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase corporate subscriptions query
        return this.legacyGetAllCorporateSubscriptions()
      } catch (error) {
        console.error('Supabase getAllCorporateSubscriptions failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyGetAllCorporateSubscriptions()
  }

  /**
   * Get corporate subscriptions by company ID
   */
  async getCorporateSubscriptionsByCompanyId(companyId: string): Promise<CorporateSubscription[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase corporate subscriptions by company query
        return this.legacyGetCorporateSubscriptionsByCompanyId(companyId)
      } catch (error) {
        console.error('Supabase getCorporateSubscriptionsByCompanyId failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyGetCorporateSubscriptionsByCompanyId(companyId)
  }

  /**
   * Create corporate subscription
   */
  async createCorporateSubscription(subscriptionData: any): Promise<CorporateSubscription> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase corporate subscription creation
        return this.legacyCreateCorporateSubscription(subscriptionData)
      } catch (error) {
        console.error('Supabase createCorporateSubscription failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyCreateCorporateSubscription(subscriptionData)
  }

  /**
   * Update corporate subscription
   */
  async updateCorporateSubscription(id: number, updates: Partial<CorporateSubscription>): Promise<CorporateSubscription | null> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase corporate subscription update
        return this.legacyUpdateCorporateSubscription(id, updates)
      } catch (error) {
        console.error('Supabase updateCorporateSubscription failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyUpdateCorporateSubscription(id, updates)
  }

  /**
   * Get corporate subscription statistics
   */
  async getCorporateSubscriptionStatistics(companyId?: string) {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase corporate subscription statistics
        return this.legacyGetCorporateSubscriptionStatistics(companyId)
      } catch (error) {
        console.error('Supabase getCorporateSubscriptionStatistics failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyGetCorporateSubscriptionStatistics(companyId)
  }

  // ===== Corporate Member Management =====

  /**
   * Get corporate members by company ID
   */
  async getCorporateMembers(companyId: string) {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase corporate members query
        return this.legacyGetCorporateMembers(companyId)
      } catch (error) {
        console.error('Supabase getCorporateMembers failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyGetCorporateMembers(companyId)
  }

  /**
   * Issue corporate membership to user
   */
  async issueCorporateMembership(data: {
    companyId: string
    userId: number
    subscriptionId: number
    employeeId: string
  }) {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase corporate membership issuance
        return this.legacyIssueCorporateMembership(data)
      } catch (error) {
        console.error('Supabase issueCorporateMembership failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyIssueCorporateMembership(data)
  }

  // ===== Corporate Member Management =====

  /**
   * Get all corporate members
   */
  async getAllMembers() {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase corporate members query
        return this.legacyGetAllMembers()
      } catch (error) {
        console.error('Supabase getAllMembers failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyGetAllMembers()
  }

  /**
   * Create corporate member
   */
  async createMember(memberData: any) {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase member creation
        return this.legacyCreateMember(memberData)
      } catch (error) {
        console.error('Supabase createMember failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyCreateMember(memberData)
  }

  /**
   * Get member by ID
   */
  async getMemberById(memberId: number) {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase member query
        return this.legacyGetMemberById(memberId)
      } catch (error) {
        console.error('Supabase getMemberById failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyGetMemberById(memberId)
  }

  /**
   * Update corporate member
   */
  async updateMember(memberId: number, updates: any) {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase member update
        return this.legacyUpdateMember(memberId, updates)
      } catch (error) {
        console.error('Supabase updateMember failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyUpdateMember(memberId, updates)
  }

  /**
   * Delete corporate member
   */
  async deleteMember(memberId: number) {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase member deletion
        return this.legacyDeleteMember(memberId)
      } catch (error) {
        console.error('Supabase deleteMember failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyDeleteMember(memberId)
  }

  /**
   * Activate member card
   */
  async activateMemberCard(memberId: number) {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase member activation
        return this.legacyActivateMemberCard(memberId)
      } catch (error) {
        console.error('Supabase activateMemberCard failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyActivateMemberCard(memberId)
  }

  /**
   * Get learning records for member
   */
  async getLearningRecords(memberId: number) {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase learning records query
        return this.legacyGetLearningRecords(memberId)
      } catch (error) {
        console.error('Supabase getLearningRecords failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyGetLearningRecords(memberId)
  }

  /**
   * Get reservation records for member
   */
  async getReservationRecords(memberId: number) {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase reservation records query
        return this.legacyGetReservationRecords(memberId)
      } catch (error) {
        console.error('Supabase getReservationRecords failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyGetReservationRecords(memberId)
  }

  /**
   * Revoke corporate membership
   */
  async revokeCorporateMembership(companyId: string, userId: number) {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase corporate membership revocation
        return this.legacyRevokeCorporateMembership(companyId, userId)
      } catch (error) {
        console.error('Supabase revokeCorporateMembership failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyRevokeCorporateMembership(companyId, userId)
  }

  // ===== Legacy implementations =====

  private async legacyGetAllCompanies(): Promise<Company[]> {
    return corporateStore.getAllCompanies()
  }

  private async legacyGetCompanyById(id: string | number): Promise<Company | null> {
    return corporateStore.getCompanyById(id)
  }

  private async legacyGetCompaniesByStatus(status: Company['status']): Promise<Company[]> {
    return corporateStore.getCompaniesByStatus(status)
  }

  private async legacyCreateCompany(companyData: Omit<Company, 'id' | 'createdAt'>): Promise<Company> {
    return corporateStore.createCompany(companyData)
  }

  private async legacyUpdateCompany(id: string | number, updates: Partial<Company>): Promise<Company | null> {
    return corporateStore.updateCompany(id, updates)
  }

  private async legacyDeleteCompany(id: string | number): Promise<boolean> {
    return corporateStore.deleteCompany(id)
  }

  private async legacySearchCompanies(searchTerm: string): Promise<Company[]> {
    return corporateStore.searchCompanies(searchTerm)
  }

  private async legacyGetCompanyStatistics() {
    return corporateStore.getCompanyStatistics()
  }

  private async legacyGetAllCorporateSubscriptions(): Promise<CorporateSubscription[]> {
    return corporateSubscriptionStore.getAllSubscriptions()
  }

  private async legacyGetCorporateSubscriptionsByCompanyId(companyId: string): Promise<CorporateSubscription[]> {
    return corporateSubscriptionStore.getSubscriptionsByCompanyId(companyId)
  }

  private async legacyCreateCorporateSubscription(subscriptionData: any): Promise<CorporateSubscription> {
    return corporateSubscriptionStore.createSubscription(subscriptionData)
  }

  private async legacyUpdateCorporateSubscription(id: number, updates: Partial<CorporateSubscription>): Promise<CorporateSubscription | null> {
    return corporateSubscriptionStore.updateSubscription(id, updates)
  }

  private async legacyGetCorporateSubscriptionStatistics(companyId?: string) {
    return corporateSubscriptionStore.getSubscriptionStatistics(companyId)
  }

  private async legacyGetCorporateMembers(companyId: string) {
    return corporateMemberStore.getCorporateMembersByCompanyId(companyId)
  }

  private async legacyIssueCorporateMembership(data: {
    companyId: string
    userId: number
    subscriptionId: number
    employeeId: string
  }) {
    return corporateMemberStore.issueCorporateMembership(data)
  }

  private async legacyRevokeCorporateMembership(companyId: string, userId: number) {
    return corporateMemberStore.revokeCorporateMembership(companyId, userId)
  }

  // ===== Legacy Corporate Member Implementations =====

  private async legacyGetAllMembers() {
    return corporateMemberStore.getAllMembers()
  }

  private async legacyCreateMember(memberData: any) {
    return corporateMemberStore.createMember(memberData)
  }

  private async legacyGetMemberById(memberId: number) {
    return corporateMemberStore.getMemberById(memberId)
  }

  private async legacyUpdateMember(memberId: number, updates: any) {
    return corporateMemberStore.updateMember(memberId, updates)
  }

  private async legacyDeleteMember(memberId: number) {
    return corporateMemberStore.deleteMember(memberId)
  }

  private async legacyActivateMemberCard(memberId: number) {
    return corporateMemberStore.activateMemberCard(memberId)
  }

  private async legacyGetLearningRecords(memberId: number) {
    return corporateMemberStore.getLearningRecords(memberId)
  }

  private async legacyGetReservationRecords(memberId: number) {
    return corporateMemberStore.getReservationRecords(memberId)
  }
}

export const corporateService = new UnifiedCorporateService()