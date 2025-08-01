import { memberCardPlans, MemberCardPlan } from '@/data/member_card_plans';

// localStorage 持久化儲存
class MemberCardPlanStore {
  private static instance: MemberCardPlanStore;
  private plans: MemberCardPlan[] = [];
  private readonly STORAGE_KEY = 'memberCardPlans';

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): MemberCardPlanStore {
    if (!MemberCardPlanStore.instance) {
      MemberCardPlanStore.instance = new MemberCardPlanStore();
    }
    return MemberCardPlanStore.instance;
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') {
      // 服務器端渲染時使用預設數據
      this.plans = [...memberCardPlans];
      return;
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsedPlans = JSON.parse(stored);
        this.plans = parsedPlans;
        console.log('📚 從 localStorage 載入方案數據:', this.plans.length, '個方案');
      } else {
        // 首次使用，初始化數據
        this.plans = [...memberCardPlans];
        this.saveToStorage();
        console.log('🆕 初始化方案數據到 localStorage:', this.plans.length, '個方案');
      }
    } catch (error) {
      console.error('❌ 載入方案數據失敗，使用預設數據:', error);
      this.plans = [...memberCardPlans];
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.plans));
      console.log('💾 方案數據已儲存到 localStorage');
    } catch (error) {
      console.error('❌ 儲存方案數據失敗:', error);
    }
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
    this.saveToStorage(); // 持久化儲存
    return newPlan;
  }

  updatePlan(id: number, updates: Partial<MemberCardPlan>): MemberCardPlan | null {
    const planIndex = this.plans.findIndex(plan => plan.id === id);
    
    if (planIndex === -1) {
      return null;
    }

    // 處理數據類型並確保正確格式
    const processedUpdates = {
      ...updates,
      // 確保數字欄位是正確的類型
      duration_days: updates.duration_days !== undefined ? 
        (typeof updates.duration_days === 'string' ? parseInt(updates.duration_days) : updates.duration_days) : 
        this.plans[planIndex].duration_days,
      
      // 確保價格欄位是字串類型
      original_price: updates.original_price !== undefined ? 
        updates.original_price.toString() : 
        this.plans[planIndex].original_price,
      
      sale_price: updates.sale_price !== undefined ? 
        updates.sale_price.toString() : 
        this.plans[planIndex].sale_price,
      
      // 確保啟用期限是數字類型
      activate_deadline_days: updates.activate_deadline_days !== undefined ?
        (typeof updates.activate_deadline_days === 'string' ? parseInt(updates.activate_deadline_days) : updates.activate_deadline_days) :
        this.plans[planIndex].activate_deadline_days,
      
      // 確保功能陣列不為空
      features: updates.features ? updates.features.filter(f => f && f.trim() !== '') : this.plans[planIndex].features,
      
      // 確保布林值欄位正確處理
      hide_price: updates.hide_price !== undefined ? Boolean(updates.hide_price) : this.plans[planIndex].hide_price,
      popular: updates.popular !== undefined ? Boolean(updates.popular) : this.plans[planIndex].popular
    };

    const updatedPlan = {
      ...this.plans[planIndex],
      ...processedUpdates,
      id // 確保 ID 不被覆蓋
    };

    this.plans[planIndex] = updatedPlan;
    this.saveToStorage(); // 持久化儲存
    
    // 輸出更新日誌以便調試
    console.log('💾 方案更新成功:', {
      id: updatedPlan.id,
      title: updatedPlan.title,
      status: updatedPlan.status,
      hide_price: updatedPlan.hide_price,
      popular: updatedPlan.popular,
      updatedFields: Object.keys(updates),
      newValues: {
        hide_price: processedUpdates.hide_price,
        popular: processedUpdates.popular
      }
    });
    
    return updatedPlan;
  }

  deletePlan(id: number): boolean {
    const planIndex = this.plans.findIndex(plan => plan.id === id);
    
    if (planIndex === -1) {
      return false;
    }

    this.plans.splice(planIndex, 1);
    this.saveToStorage(); // 持久化儲存
    return true;
  }

  // 重置到預設數據（開發調試用）
  resetToDefault(): void {
    this.plans = [...memberCardPlans];
    this.saveToStorage();
    console.log('🔄 方案數據已重置為預設值');
  }

  // 清除 localStorage 數據（開發調試用）
  clearStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('🗑️ 已清除 localStorage 中的方案數據');
    }
  }
}

export const memberCardPlanStore = MemberCardPlanStore.getInstance();