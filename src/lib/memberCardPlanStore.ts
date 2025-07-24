import { memberCardPlans, MemberCardPlan } from '@/data/member_card_plans';

// 簡單的伺服器端記憶體儲存（實際應用中應該使用資料庫）
class MemberCardPlanStore {
  private static instance: MemberCardPlanStore;
  private plans: MemberCardPlan[] = [...memberCardPlans];

  private constructor() {}

  static getInstance(): MemberCardPlanStore {
    if (!MemberCardPlanStore.instance) {
      MemberCardPlanStore.instance = new MemberCardPlanStore();
    }
    return MemberCardPlanStore.instance;
  }

  getAllPlans(): MemberCardPlan[] {
    return [...this.plans];
  }

  getPublishedPlans(): MemberCardPlan[] {
    return this.plans.filter(plan => plan.status === 'PUBLISHED');
  }

  getPlansByType(userType?: 'individual' | 'corporate'): MemberCardPlan[] {
    const publishedPlans = this.getPublishedPlans();
    if (!userType) return publishedPlans;
    return publishedPlans.filter(plan => plan.user_type === userType);
  }

  getPlanById(id: number): MemberCardPlan | null {
    return this.plans.find(plan => plan.id === id) || null;
  }

  createPlan(planData: Omit<MemberCardPlan, 'id' | 'created_at' | 'member_card_id'>): MemberCardPlan {
    const newId = Math.max(...this.plans.map(p => p.id), 0) + 1;
    
    const newPlan: MemberCardPlan = {
      ...planData,
      id: newId,
      created_at: new Date().toISOString(),
      member_card_id: newId
    };

    this.plans.push(newPlan);
    return newPlan;
  }

  updatePlan(id: number, updates: Partial<MemberCardPlan>): MemberCardPlan | null {
    const planIndex = this.plans.findIndex(plan => plan.id === id);
    
    if (planIndex === -1) {
      return null;
    }

    const updatedPlan = {
      ...this.plans[planIndex],
      ...updates,
      id, // 確保 ID 不被覆蓋
      duration_days: updates.duration_days ? parseInt(updates.duration_days.toString()) : this.plans[planIndex].duration_days,
      original_price: updates.original_price ? updates.original_price.toString() : this.plans[planIndex].original_price,
      sale_price: updates.sale_price ? updates.sale_price.toString() : this.plans[planIndex].sale_price
    };

    this.plans[planIndex] = updatedPlan;
    return updatedPlan;
  }

  deletePlan(id: number): boolean {
    const planIndex = this.plans.findIndex(plan => plan.id === id);
    
    if (planIndex === -1) {
      return false;
    }

    this.plans.splice(planIndex, 1);
    return true;
  }
}

export const memberCardPlanStore = MemberCardPlanStore.getInstance();