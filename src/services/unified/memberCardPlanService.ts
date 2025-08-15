/**
 * Unified Member Card Plan Service - Phase 3.5 Refactor
 * 
 * This service provides a unified interface that integrates:
 * - Supabase MemberCardPlans table (primary, when implemented)
 * - Legacy memberCardPlanStore (current implementation)
 * - Backwards compatibility with existing API
 */

import { MemberCardPlan, memberCardPlanStore } from '@/lib/memberCardPlanStore'
import { MemberCard, memberCards } from '@/data/member_cards'
import { getCourseTemplates, getPublishedCourseSchedules } from '@/data/courseTemplateUtils'

class UnifiedMemberCardPlanService {
  private useLegacyMode = true // Start with legacy mode

  constructor() {
    // For now, we'll use legacy mode as Supabase member card plans table may not be ready
    this.useLegacyMode = true
    console.log('🔧 Unified Member Card Plan Service: Using Legacy mode')
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
        this.useLegacyMode = true
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
        this.useLegacyMode = true
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
        this.useLegacyMode = true
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
        this.useLegacyMode = true
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
        this.useLegacyMode = true
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
        this.useLegacyMode = true
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
        this.useLegacyMode = true
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
        this.useLegacyMode = true
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
        // TODO: Implement Supabase available courses query
        return this.legacyGetAvailableCourses()
      } catch (error) {
        console.error('Supabase getAvailableCourses failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyGetAvailableCourses()
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
        this.useLegacyMode = true
      }
    }

    return this.legacyResetToDefault()
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

  private async legacyGetAvailableCourses() {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(150)
    
    // This mimics the logic from MemberCardPlanManagement component
    const getLanguageFromCategory = (category: string) => {
      const languageMap: Record<string, string> = {
        '中文': 'chinese',
        '英文': 'english',
        '日文': 'japanese',
        '韓文': 'korean',
        '文化': 'chinese',
        '商業': 'english',
        '師資': 'chinese',
        '其它': 'chinese'
      };
      return languageMap[category] || 'chinese';
    };

    try {
      const templates = getCourseTemplates();
      const schedules = getPublishedCourseSchedules();
      
      const coursesData: any[] = [];
      
      // 1. Process templates with schedules
      schedules.forEach(schedule => {
        const template = templates.find(t => t.id === schedule.templateId);
        if (template && template.status === 'published') {
          coursesData.push({
            id: `${template.id}_${schedule.id}`,
            title: schedule.seriesName ? `${template.title} - ${schedule.seriesName}` : template.title,
            language: getLanguageFromCategory(template.category),
            level: template.level,
            category: template.category,
            description: template.description
          });
        }
      });
      
      // 2. Process published templates without schedules
      const publishedTemplates = templates.filter(t => t.status === 'published');
      publishedTemplates.forEach(template => {
        const hasSchedule = schedules.some(s => s.templateId === template.id);
        if (!hasSchedule) {
          coursesData.push({
            id: template.id,
            title: template.title,
            language: getLanguageFromCategory(template.category),
            level: template.level,
            category: template.category,
            description: template.description
          });
        }
      });
      
      return coursesData;
    } catch (error) {
      console.error('Error loading available courses:', error);
      return [];
    }
  }

  private async legacyResetToDefault(): Promise<void> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)
    return memberCardPlanStore.resetToDefault()
  }
}

export const memberCardPlanService = new UnifiedMemberCardPlanService()
export type { MemberCardPlan, MemberCard }