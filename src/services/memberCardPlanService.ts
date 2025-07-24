import { memberCardPlans, MemberCardPlan } from '@/data/member_card_plans';

export class MemberCardPlanService {
  private static STORAGE_KEY = 'memberCardPlans';

  // 獲取所有方案
  static getAllPlans(): MemberCardPlan[] {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [...memberCardPlans];
    }
    return [...memberCardPlans];
  }

  // 獲取已發布的方案
  static getPublishedPlans(): MemberCardPlan[] {
    return this.getAllPlans().filter(plan => plan.status === 'PUBLISHED');
  }

  // 儲存方案到 localStorage
  static savePlans(plans: MemberCardPlan[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(plans));
    }
  }

  // 獲取單一方案
  static getPlanById(id: number): MemberCardPlan | null {
    const plans = this.getAllPlans();
    return plans.find(plan => plan.id === id) || null;
  }

  // 創建新方案
  static createPlan(planData: Omit<MemberCardPlan, 'id' | 'created_at' | 'member_card_id'>): MemberCardPlan {
    const plans = this.getAllPlans();
    const newId = Math.max(...plans.map(p => p.id), 0) + 1;
    
    const newPlan: MemberCardPlan = {
      ...planData,
      id: newId,
      created_at: new Date().toISOString(),
      member_card_id: newId
    };

    plans.push(newPlan);
    this.savePlans(plans);
    return newPlan;
  }

  // 更新方案
  static updatePlan(id: number, updates: Partial<MemberCardPlan>): MemberCardPlan | null {
    const plans = this.getAllPlans();
    const planIndex = plans.findIndex(plan => plan.id === id);
    
    if (planIndex === -1) {
      return null;
    }

    const updatedPlan = {
      ...plans[planIndex],
      ...updates,
      id // 確保 ID 不被覆蓋
    };

    plans[planIndex] = updatedPlan;
    this.savePlans(plans);
    return updatedPlan;
  }

  // 刪除方案
  static deletePlan(id: number): boolean {
    const plans = this.getAllPlans();
    const planIndex = plans.findIndex(plan => plan.id === id);
    
    if (planIndex === -1) {
      return false;
    }

    plans.splice(planIndex, 1);
    this.savePlans(plans);
    return true;
  }

  // 初始化 localStorage（如果為空）
  static initializeStorage(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        this.savePlans(memberCardPlans);
      }
    }
  }
}