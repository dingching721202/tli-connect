// Import TypeScript data
import { memberCardPlans } from './member_card_plans';
import { memberCards } from './member_cards';

interface RawMembershipPlanData {
  id: number;
  created_at: string;
  member_card_id: number;
  type: string;
  name: string;
  price: string;
  original_price: string;
  duration: number;
  plan_type: string;
  features: string[];
  status: 'DRAFT' | 'PUBLISHED';
  category: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  duration: number; // in months
  type: 'individual' | 'corporate';
  features: string[];
  published: boolean;
  category: string;
  popular?: boolean;
  status?: 'draft' | 'published' | 'active' | 'inactive';
  durationType?: 'annual' | 'monthly';
  purchaseDate?: string;
  startDate?: string;
  endDate?: string;
  slots?: number;
  basePrice?: number;
  discountRate?: number;
  finalPrice?: number;
}

// Convert JSON data to MembershipPlan format
function convertToMembershipPlan(plan: RawMembershipPlanData): MembershipPlan {
  return {
    id: plan.id.toString(),
    name: plan.name,
    price: parseFloat(plan.price),
    originalPrice: parseFloat(plan.original_price),
    duration: plan.duration,
    type: plan.plan_type as 'individual' | 'corporate',
    features: plan.features,
    published: plan.status === 'PUBLISHED',
    category: plan.category,
    status: plan.status === 'PUBLISHED' ? 'published' : 'draft',
    // 根據 type 欄位判斷是否為熱門方案（年度方案預設為熱門）
    popular: plan.type === 'YEAR'
  };
}

// Convert MembershipPlan to RawMembershipPlanData format
function convertToRawPlan(plan: Partial<MembershipPlan> & { id?: string | number }): RawMembershipPlanData {
  const id = typeof plan.id === 'string' ? parseInt(plan.id) : (plan.id || 0);
  
  // 根據持續時間自動判斷 type
  let planType = 'SEASON';
  if (plan.duration && plan.duration >= 12) {
    planType = 'YEAR';
  } else if (plan.type === 'corporate') {
    planType = 'CORPORATE';
  }
  
  return {
    id: id,
    created_at: new Date().toISOString(),
    member_card_id: id,
    type: planType,
    name: plan.name || '',
    price: (plan.price || 0).toString(),
    original_price: (plan.originalPrice || plan.price || 0).toString(),
    duration: plan.duration || 1,
    plan_type: plan.type || 'individual',
    features: plan.features || [],
    status: (plan.status === 'published' || plan.published) ? 'PUBLISHED' : 'DRAFT',
    category: plan.category || 'general'
  };
}

// Get published membership plans filtered by type
export function getPublishedMembershipPlans(type?: 'individual' | 'corporate'): MembershipPlan[] {
  // 合併靜態資料和 localStorage 資料
  const staticPlans = memberCardPlans;
  const localStoragePlans = typeof localStorage !== 'undefined' 
    ? JSON.parse(localStorage.getItem('memberCardPlans') || '[]')
    : [];
  
  // 合併資料，localStorage 優先（會覆蓋相同 ID 的靜態資料）
  const allPlansMap = new Map();
  
  // 先加入靜態資料
  staticPlans.forEach(plan => {
    allPlansMap.set(plan.id, plan);
  });
  
  // 再加入 localStorage 資料（會覆蓋相同 ID）
  localStoragePlans.forEach((plan: any) => {
    allPlansMap.set(plan.id, plan);
  });
  
  // 轉換為陣列並過濾已發布的方案
  let plans = Array.from(allPlansMap.values())
    .filter(plan => plan.status === 'PUBLISHED')
    .map(convertToMembershipPlan);
  
  if (type) {
    plans = plans.filter(plan => plan.type === type);
  }
  
  return plans;
}

// Get membership plan by ID
export function getMembershipPlanById(id: string): MembershipPlan | null {
  // 先檢查 localStorage
  if (typeof localStorage !== 'undefined') {
    const localStoragePlans = JSON.parse(localStorage.getItem('memberCardPlans') || '[]');
    const localPlan = localStoragePlans.find((plan: { id: string | number }) => plan.id.toString() === id);
    if (localPlan) {
      return convertToMembershipPlan(localPlan);
    }
  }
  
  // 如果 localStorage 中沒有，檢查靜態資料
  const plan = memberCardPlans.find(plan => plan.id.toString() === id);
  return plan ? convertToMembershipPlan(plan) : null;
}

// Get all membership plans
export function getMembershipPlans(): MembershipPlan[] {
  // 合併靜態資料和 localStorage 資料
  const staticPlans = memberCardPlans;
  let localStoragePlans = [];
  
  if (typeof localStorage !== 'undefined') {
    try {
      const storedPlans = localStorage.getItem('memberCardPlans');
      if (storedPlans) {
        localStoragePlans = JSON.parse(storedPlans);
      } else {
        // 如果 localStorage 為空，初始化為靜態資料
        localStoragePlans = JSON.parse(JSON.stringify(memberCardPlans));
        localStorage.setItem('memberCardPlans', JSON.stringify(localStoragePlans));
      }
    } catch (error) {
      console.warn('Failed to parse localStorage plans:', error);
      localStoragePlans = [];
    }
  }
  
  // 合併資料，localStorage 優先（會覆蓋相同 ID 的靜態資料）
  const allPlansMap = new Map();
  
  // 先加入靜態資料
  staticPlans.forEach(plan => {
    allPlansMap.set(plan.id, plan);
  });
  
  // 再加入 localStorage 資料（會覆蓋相同 ID）
  localStoragePlans.forEach((plan: { id: string | number }) => {
    allPlansMap.set(plan.id, plan);
  });
  
  // 轉換為陣列
  return Array.from(allPlansMap.values()).map(convertToMembershipPlan);
}

// Create new membership plan (adds to localStorage)
export function createMembershipPlan(plan: Omit<MembershipPlan, 'id'>): MembershipPlan {
  if (typeof localStorage !== 'undefined') {
    // 獲取現有的 localStorage 資料，如果沒有則初始化為空陣列
    let existingPlans = [];
    try {
      const storedPlans = localStorage.getItem('memberCardPlans');
      if (storedPlans) {
        existingPlans = JSON.parse(storedPlans);
      } else {
        // 如果 localStorage 為空，複製靜態資料作為初始資料
        existingPlans = JSON.parse(JSON.stringify(memberCardPlans));
        localStorage.setItem('memberCardPlans', JSON.stringify(existingPlans));
      }
    } catch (error) {
      console.warn('Failed to parse localStorage plans, using static data:', error);
      existingPlans = JSON.parse(JSON.stringify(memberCardPlans));
    }
    
    // 確保唯一 ID（包含靜態資料的 ID）
    const allIds = [
      ...existingPlans.map((p: { id?: number }) => p.id || 0),
      ...memberCardPlans.map(p => p.id)
    ];
    const maxId = Math.max(0, ...allIds);
    const newId = maxId + 1;
    
    // 使用統一的轉換函數
    const newPlan = convertToRawPlan({
      ...plan,
      id: newId
    });
    existingPlans.push(newPlan);
    localStorage.setItem('memberCardPlans', JSON.stringify(existingPlans));
    
    // 同時創建對應的會員卡
    createMemberCard(newId, plan.name, plan.type);
    
    // 觸發更新事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('membershipPlansUpdated'));
      window.dispatchEvent(new CustomEvent('memberCardsUpdated'));
    }
    
    return convertToMembershipPlan(newPlan);
  }
  
  // Fallback for server-side
  const maxId = Math.max(0, ...memberCardPlans.map(p => p.id || 0));
  const newPlan: MembershipPlan = {
    ...plan,
    id: `plan_${maxId + 1}_${Date.now()}`
  };
  return newPlan;
}

// Update membership plan (updates localStorage)
export function updateMembershipPlan(id: string, updates: Partial<MembershipPlan>): MembershipPlan | null {
  if (typeof localStorage !== 'undefined') {
    // 確保 localStorage 已初始化
    let existingPlans = [];
    try {
      const storedPlans = localStorage.getItem('memberCardPlans');
      if (storedPlans) {
        existingPlans = JSON.parse(storedPlans);
      } else {
        existingPlans = JSON.parse(JSON.stringify(memberCardPlans));
        localStorage.setItem('memberCardPlans', JSON.stringify(existingPlans));
      }
    } catch (error) {
      console.warn('Failed to parse localStorage plans:', error);
      existingPlans = JSON.parse(JSON.stringify(memberCardPlans));
    }
    const index = existingPlans.findIndex((plan: RawMembershipPlanData) => plan.id.toString() === id);
    if (index === -1) return null;
    
    // 合併現有資料和更新資料
    const currentPlan = existingPlans[index];
    const mergedPlan = {
      ...convertToMembershipPlan(currentPlan),
      ...updates,
      id: id
    };
    
    // 使用統一的轉換函數
    const updatedRawPlan = convertToRawPlan(mergedPlan);
    existingPlans[index] = updatedRawPlan;
    localStorage.setItem('memberCardPlans', JSON.stringify(existingPlans));
    
    // 觸發更新事件
    if (typeof window !== 'undefined') {
      console.log('🔔 觸發 membershipPlansUpdated 事件 - 方案已更新:', updatedRawPlan.name, 'status:', updatedRawPlan.status);
      window.dispatchEvent(new CustomEvent('membershipPlansUpdated'));
    }
    
    return convertToMembershipPlan(existingPlans[index]);
  }
  
  return null;
}

// Delete membership plan (removes from localStorage)
export function deleteMembershipPlan(id: string): boolean {
  if (typeof localStorage !== 'undefined') {
    // 確保 localStorage 已初始化
    let existingPlans = [];
    try {
      const storedPlans = localStorage.getItem('memberCardPlans');
      if (storedPlans) {
        existingPlans = JSON.parse(storedPlans);
      } else {
        existingPlans = JSON.parse(JSON.stringify(memberCardPlans));
        localStorage.setItem('memberCardPlans', JSON.stringify(existingPlans));
      }
    } catch (error) {
      console.warn('Failed to parse localStorage plans:', error);
      existingPlans = JSON.parse(JSON.stringify(memberCardPlans));
    }
    const index = existingPlans.findIndex((plan: RawMembershipPlanData) => plan.id.toString() === id);
    if (index === -1) return false;
    
    const planToDelete = existingPlans[index];
    existingPlans.splice(index, 1);
    localStorage.setItem('memberCardPlans', JSON.stringify(existingPlans));
    
    // 同時刪除對應的會員卡
    deleteMemberCard(planToDelete.member_card_id);
    
    // 觸發更新事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('membershipPlansUpdated'));
      window.dispatchEvent(new CustomEvent('memberCardsUpdated'));
    }
    
    return true;
  }
  
  return false;
}

// Duplicate membership plan
export function duplicateMembershipPlan(id: string): MembershipPlan | null {
  const plan = getMembershipPlanById(id);
  if (!plan) return null;
  
  return createMembershipPlan({
    ...plan,
    name: `${plan.name} (複製)`,
    published: false
  });
}

// 會員卡管理功能
export function createMemberCard(cardId: number, planName: string, planType: 'individual' | 'corporate'): void {
  if (typeof localStorage !== 'undefined') {
    const existingCards = JSON.parse(localStorage.getItem('memberCards') || JSON.stringify(memberCards));
    
    // 檢查是否已存在相同 ID 的會員卡
    const existingCard = existingCards.find((card: any) => card.id === cardId);
    if (existingCard) {
      // 更新現有會員卡
      existingCard.name = planName;
      existingCard.card_type = planType;
      existingCard.description = `${planName}通行證`;
      existingCard.status = 'active';
    } else {
      // 創建新會員卡
      const newCard = {
        id: cardId,
        created_at: new Date().toISOString(),
        name: planName,
        available_course_ids: planType === 'corporate' ? [1, 2] : [2], // 企業方案可訪問更多課程
        description: `${planName}通行證`,
        card_type: planType,
        status: 'active'
      };
      existingCards.push(newCard);
    }
    
    localStorage.setItem('memberCards', JSON.stringify(existingCards));
  }
}

// 獲取所有會員卡
export function getMemberCards() {
  if (typeof localStorage !== 'undefined') {
    const localStorageCards = JSON.parse(localStorage.getItem('memberCards') || JSON.stringify(memberCards));
    return localStorageCards;
  }
  return memberCards;
}

// 刪除會員卡
export function deleteMemberCard(cardId: number): boolean {
  if (typeof localStorage !== 'undefined') {
    const existingCards = JSON.parse(localStorage.getItem('memberCards') || JSON.stringify(memberCards));
    const index = existingCards.findIndex((card: any) => card.id === cardId);
    if (index === -1) return false;
    
    existingCards.splice(index, 1);
    localStorage.setItem('memberCards', JSON.stringify(existingCards));
    
    // 觸發更新事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('memberCardsUpdated'));
    }
    
    return true;
  }
  return false;
}