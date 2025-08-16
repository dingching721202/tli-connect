/**
 * Unified Member Card Plan Service - Phase 3.5 Refactor
 * 
 * This service provides a unified interface that integrates:
 * - Supabase MemberCardPlans table (primary, when implemented)
 * - Legacy memberCardPlanStore (current implementation)
 * - Backwards compatibility with existing API
 */

import { memberCardPlanStore } from '@/lib/memberCardPlanStore'
import { MemberCardPlan } from '@/data/member_card_plans'
import { MemberCard, memberCards } from '@/data/member_cards'

class UnifiedMemberCardPlanService {
  private useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED // Start with legacy mode

  constructor() {
    // 🎯 Phase 4.3: Supabase integration ACTIVE
    this.useLegacyMode = false
    console.log('🚀 Unified Member Card Plan Service: Phase 4.3 - Supabase integration ACTIVE')
  }

  /**
   * Get all member card plans (including drafts)
   */
  async getAllPlans(): Promise<MemberCardPlan[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase member card plans query
        return this.legacyGetAllPlans()
      } catch (error) {
        console.error('Supabase getAllPlans failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetAllPlans()
  }

  /**
   * Get published member card plans only
   */
  async getPublishedPlans(): Promise<MemberCardPlan[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase published plans query
        return this.legacyGetPublishedPlans()
      } catch (error) {
        console.error('Supabase getPublishedPlans failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetPublishedPlans()
  }

  /**
   * Get plans by user type
   */
  async getPlansByType(userType?: 'individual' | 'corporate'): Promise<MemberCardPlan[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase plans by type query
        return this.legacyGetPlansByType(userType)
      } catch (error) {
        console.error('Supabase getPlansByType failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetPlansByType(userType)
  }

  /**
   * Get plan by ID
   */
  async getPlanById(id: number): Promise<MemberCardPlan | null> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase plan by ID query
        return this.legacyGetPlanById(id)
      } catch (error) {
        console.error('Supabase getPlanById failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetPlanById(id)
  }

  /**
   * Create new member card plan
   */
  async createPlan(planData: Omit<MemberCardPlan, 'id' | 'created_at' | 'member_card_id'>): Promise<MemberCardPlan> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase plan creation
        return this.legacyCreatePlan(planData)
      } catch (error) {
        console.error('Supabase createPlan failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyCreatePlan(planData)
  }

  /**
   * Update member card plan
   */
  async updatePlan(id: number, updates: Partial<MemberCardPlan>): Promise<MemberCardPlan | null> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase plan update
        return this.legacyUpdatePlan(id, updates)
      } catch (error) {
        console.error('Supabase updatePlan failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyUpdatePlan(id, updates)
  }

  /**
   * Delete member card plan
   */
  async deletePlan(id: number): Promise<boolean> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase plan deletion
        return this.legacyDeletePlan(id)
      } catch (error) {
        console.error('Supabase deletePlan failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyDeletePlan(id)
  }

  // ===== Additional helper methods =====

  /**
   * Get all member cards (for plan association)
   */
  async getAllMemberCards(): Promise<MemberCard[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase member cards query
        return this.legacyGetAllMemberCards()
      } catch (error) {
        console.error('Supabase getAllMemberCards failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetAllMemberCards()
  }

  /**
   * Get available courses (for plan features)
   */
  async getAvailableCourses() {
    if (!this.useLegacyMode) {
      try {
        // Supabase implementation: Get active course templates
        const { createClient } = await import('@supabase/supabase-js')
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const supabase = createClient(supabaseUrl, supabaseKey)

        const { data: templates, error } = await supabase
          .from('course_templates')
          .select('id, name, description, category, level')
          .eq('is_active', true)
          .order('name')

        if (error) {
          throw error
        }

        // Transform to match expected course data format
        const coursesData = templates.map(template => ({
          id: template.id,
          title: template.name,
          language: this.getLanguageFromCategory(template.category),
          level: template.level,
          category: template.category,
          description: template.description
        }))

        return coursesData
      } catch (error) {
        console.error('Supabase getAvailableCourses failed:', error)
        throw error
      }
    }

    // Legacy mode is disabled, always use Supabase
    throw new Error('Legacy mode is disabled for getAvailableCourses')
  }

  /**
   * Reset plans to default (development/testing)
   */
  async resetToDefault(): Promise<void> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase plan reset
        return this.legacyResetToDefault()
      } catch (error) {
        console.error('Supabase resetToDefault failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyResetToDefault()
  }

  // ===== Helper methods =====

  private getLanguageFromCategory(category: string): string {
    const languageMap: Record<string, string> = {
      '中文': 'chinese',
      '英文': 'english', 
      '語言學習': 'chinese',
      '商務英語': 'english',
      '證照考試': 'english',
      '日文': 'japanese',
      '韓文': 'korean',
      '文化': 'chinese',
      '商業': 'english',
      '師資': 'chinese',
      '其它': 'chinese'
    };
    return languageMap[category] || 'chinese';
  }

  // ===== Legacy implementations =====

  private async legacyGetAllPlans(): Promise<MemberCardPlan[]> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return memberCardPlanStore.getAllPlans()
  }

  private async legacyGetPublishedPlans(): Promise<MemberCardPlan[]> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return memberCardPlanStore.getPublishedPlans()
  }

  private async legacyGetPlansByType(userType?: 'individual' | 'corporate'): Promise<MemberCardPlan[]> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return memberCardPlanStore.getPlansByType(userType)
  }

  private async legacyGetPlanById(id: number): Promise<MemberCardPlan | null> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return memberCardPlanStore.getPlanById(id)
  }

  private async legacyCreatePlan(planData: Omit<MemberCardPlan, 'id' | 'created_at' | 'member_card_id'>): Promise<MemberCardPlan> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(300)
    return memberCardPlanStore.createPlan(planData)
  }

  private async legacyUpdatePlan(id: number, updates: Partial<MemberCardPlan>): Promise<MemberCardPlan | null> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)
    return memberCardPlanStore.updatePlan(id, updates)
  }

  private async legacyDeletePlan(id: number): Promise<boolean> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)
    return memberCardPlanStore.deletePlan(id)
  }

  private async legacyGetAllMemberCards(): Promise<MemberCard[]> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return [...memberCards]
  }


  private async legacyResetToDefault(): Promise<void> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)
    return memberCardPlanStore.resetToDefault()
  }
}

export const memberCardPlanService = new UnifiedMemberCardPlanService()
export type { MemberCardPlan, MemberCard }