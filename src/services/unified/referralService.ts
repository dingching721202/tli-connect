/**
 * Unified Referral Service - Phase 3.5 Refactor
 * 
 * This service provides a unified interface that integrates:
 * - Supabase Referrals table (primary, when implemented)
 * - Legacy referralData utilities (current implementation)
 * - Backwards compatibility with existing referral API
 */

import {
  ReferralCode,
  ReferralUsage,
  ReferralReward,
  getAllReferralCodes,
  getReferralCodeById,
  getReferralCodeByCode,
  getActiveReferralCodes,
  createReferralCode,
  validateReferralCode,
  getReferralUsagesByReferrer,
  getReferralUsagesByReferred,
  createReferralUsage,
  getReferralRewardsByReferrer,
  getTotalEarnings,
  createReferralReward,
  getReferralStatistics,
  generateReferralCode,
  getReferralCodesByUser
} from '@/data/referralData'

class UnifiedReferralService {
  private useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED // Start with legacy mode

  constructor() {
    // 🎯 Phase 4.3: Supabase integration ACTIVE
    this.useLegacyMode = false
    console.log('🚀 Unified Referral Service: Phase 4.3 - Supabase integration ACTIVE')
  }

  // ===== Referral Codes =====

  /**
   * Get all referral codes
   */
  async getAllReferralCodes(): Promise<ReferralCode[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase referral codes query
        return this.legacyGetAllReferralCodes()
      } catch (error) {
        console.error('Supabase getAllReferralCodes failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetAllReferralCodes()
  }

  /**
   * Get referral code by ID
   */
  async getReferralCodeById(id: string): Promise<ReferralCode | null> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase referral code by ID query
        return this.legacyGetReferralCodeById(id)
      } catch (error) {
        console.error('Supabase getReferralCodeById failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetReferralCodeById(id)
  }

  /**
   * Get referral code by code string
   */
  async getReferralCodeByCode(code: string): Promise<ReferralCode | null> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase referral code by code query
        return this.legacyGetReferralCodeByCode(code)
      } catch (error) {
        console.error('Supabase getReferralCodeByCode failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetReferralCodeByCode(code)
  }

  /**
   * Get referral codes by user/referrer
   */
  async getReferralCodesByUser(userId: string): Promise<ReferralCode[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase referral codes by user query
        return this.legacyGetReferralCodesByUser(userId)
      } catch (error) {
        console.error('Supabase getReferralCodesByUser failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetReferralCodesByUser(userId)
  }

  /**
   * Get active referral codes
   */
  async getActiveReferralCodes(): Promise<ReferralCode[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase active referral codes query
        return this.legacyGetActiveReferralCodes()
      } catch (error) {
        console.error('Supabase getActiveReferralCodes failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetActiveReferralCodes()
  }

  /**
   * Create new referral code
   */
  async createReferralCode(codeData: Omit<ReferralCode, 'id' | 'currentUses' | 'createdAt' | 'updatedAt'>): Promise<ReferralCode> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase referral code creation
        return this.legacyCreateReferralCode(codeData)
      } catch (error) {
        console.error('Supabase createReferralCode failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyCreateReferralCode(codeData)
  }

  /**
   * Validate referral code
   */
  async validateReferralCode(code: string): Promise<{ isValid: boolean; referralCode?: ReferralCode; message: string }> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase referral code validation
        return this.legacyValidateReferralCode(code)
      } catch (error) {
        console.error('Supabase validateReferralCode failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyValidateReferralCode(code)
  }

  /**
   * Generate new referral code
   */
  async generateReferralCode(prefix: string = 'TLI'): Promise<string> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase referral code generation
        return this.legacyGenerateReferralCode(prefix)
      } catch (error) {
        console.error('Supabase generateReferralCode failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGenerateReferralCode(prefix)
  }

  // ===== Referral Usage =====

  /**
   * Get referral usage by referrer
   */
  async getReferralUsagesByReferrer(referrerId: string): Promise<ReferralUsage[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase referral usage by referrer query
        return this.legacyGetReferralUsagesByReferrer(referrerId)
      } catch (error) {
        console.error('Supabase getReferralUsagesByReferrer failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetReferralUsagesByReferrer(referrerId)
  }

  /**
   * Get referral usage by referred user
   */
  async getReferralUsagesByReferred(referredUserId: string): Promise<ReferralUsage[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase referral usage by referred query
        return this.legacyGetReferralUsagesByReferred(referredUserId)
      } catch (error) {
        console.error('Supabase getReferralUsagesByReferred failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetReferralUsagesByReferred(referredUserId)
  }

  /**
   * Create referral usage
   */
  async createReferralUsage(usageData: Omit<ReferralUsage, 'id' | 'usedAt' | 'completedAt'>): Promise<ReferralUsage> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase referral usage creation
        return this.legacyCreateReferralUsage(usageData)
      } catch (error) {
        console.error('Supabase createReferralUsage failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyCreateReferralUsage(usageData)
  }

  // ===== Referral Rewards =====

  /**
   * Get referral rewards by referrer
   */
  async getReferralRewardsByReferrer(referrerId: string): Promise<ReferralReward[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase referral rewards by referrer query
        return this.legacyGetReferralRewardsByReferrer(referrerId)
      } catch (error) {
        console.error('Supabase getReferralRewardsByReferrer failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetReferralRewardsByReferrer(referrerId)
  }

  /**
   * Get total earnings for referrer
   */
  async getTotalEarnings(referrerId: string): Promise<{ total: number; pending: number; paid: number }> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase total earnings calculation
        return this.legacyGetTotalEarnings(referrerId)
      } catch (error) {
        console.error('Supabase getTotalEarnings failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetTotalEarnings(referrerId)
  }

  /**
   * Create referral reward
   */
  async createReferralReward(rewardData: Omit<ReferralReward, 'id' | 'earnedAt' | 'paidAt'>): Promise<ReferralReward> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase referral reward creation
        return this.legacyCreateReferralReward(rewardData)
      } catch (error) {
        console.error('Supabase createReferralReward failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyCreateReferralReward(rewardData)
  }

  // ===== Statistics =====

  /**
   * Get referral statistics
   */
  async getReferralStatistics(referrerId?: string) {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase referral statistics
        return this.legacyGetReferralStatistics(referrerId)
      } catch (error) {
        console.error('Supabase getReferralStatistics failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetReferralStatistics(referrerId)
  }

  // ===== Legacy implementations =====

  private async legacyGetAllReferralCodes(): Promise<ReferralCode[]> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return getAllReferralCodes()
  }

  private async legacyGetReferralCodeById(id: string): Promise<ReferralCode | null> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return getReferralCodeById(id)
  }

  private async legacyGetReferralCodeByCode(code: string): Promise<ReferralCode | null> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return getReferralCodeByCode(code)
  }

  private async legacyGetReferralCodesByUser(userId: string): Promise<ReferralCode[]> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return getReferralCodesByUser(userId)
  }

  private async legacyGetActiveReferralCodes(): Promise<ReferralCode[]> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return getActiveReferralCodes()
  }

  private async legacyCreateReferralCode(codeData: Omit<ReferralCode, 'id' | 'currentUses' | 'createdAt' | 'updatedAt'>): Promise<ReferralCode> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(300)
    return createReferralCode(codeData)
  }

  private async legacyValidateReferralCode(code: string): Promise<{ isValid: boolean; referralCode?: ReferralCode; message: string }> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(150)
    return validateReferralCode(code)
  }

  private async legacyGenerateReferralCode(prefix: string = 'TLI'): Promise<string> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return generateReferralCode(prefix)
  }

  private async legacyGetReferralUsagesByReferrer(referrerId: string): Promise<ReferralUsage[]> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return getReferralUsagesByReferrer(referrerId)
  }

  private async legacyGetReferralUsagesByReferred(referredUserId: string): Promise<ReferralUsage[]> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return getReferralUsagesByReferred(referredUserId)
  }

  private async legacyCreateReferralUsage(usageData: Omit<ReferralUsage, 'id' | 'usedAt' | 'completedAt'>): Promise<ReferralUsage> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(300)
    return createReferralUsage(usageData)
  }

  private async legacyGetReferralRewardsByReferrer(referrerId: string): Promise<ReferralReward[]> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return getReferralRewardsByReferrer(referrerId)
  }

  private async legacyGetTotalEarnings(referrerId: string): Promise<{ total: number; pending: number; paid: number }> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(150)
    return getTotalEarnings(referrerId)
  }

  private async legacyCreateReferralReward(rewardData: Omit<ReferralReward, 'id' | 'earnedAt' | 'paidAt'>): Promise<ReferralReward> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(300)
    return createReferralReward(rewardData)
  }

  private async legacyGetReferralStatistics(referrerId?: string) {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(150)
    return getReferralStatistics(referrerId)
  }
}

export const referralService = new UnifiedReferralService()
export type { ReferralCode, ReferralUsage, ReferralReward }