// Import JSON data
import memberCardPlans from './member_card_plans.json';

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
  published: boolean;
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
    published: plan.published,
    category: plan.category
  };
}

// Get published membership plans filtered by type
export function getPublishedMembershipPlans(type?: 'individual' | 'corporate'): MembershipPlan[] {
  let plans = memberCardPlans
    .filter(plan => plan.published)
    .map(convertToMembershipPlan);
  
  if (type) {
    plans = plans.filter(plan => plan.type === type);
  }
  
  return plans;
}

// Get membership plan by ID
export function getMembershipPlanById(id: string): MembershipPlan | null {
  const plan = memberCardPlans.find(plan => plan.id.toString() === id);
  return plan ? convertToMembershipPlan(plan) : null;
}

// Get all membership plans
export function getMembershipPlans(): MembershipPlan[] {
  return memberCardPlans.map(convertToMembershipPlan);
}

// Create new membership plan (adds to localStorage)
export function createMembershipPlan(plan: Omit<MembershipPlan, 'id'>): MembershipPlan {
  if (typeof localStorage !== 'undefined') {
    const existingPlans = JSON.parse(localStorage.getItem('memberCardPlans') || JSON.stringify(memberCardPlans));
    const newPlan = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      member_card_id: Date.now(),
      type: plan.type.toUpperCase(),
      name: plan.name,
      price: plan.price.toString(),
      original_price: plan.originalPrice.toString(),
      duration: plan.duration,
      plan_type: plan.type as string,
      features: plan.features,
      published: plan.published,
      category: plan.category
    };
    existingPlans.push(newPlan);
    localStorage.setItem('memberCardPlans', JSON.stringify(existingPlans));
    return convertToMembershipPlan(newPlan);
  }
  
  // Fallback for server-side
  const newPlan: MembershipPlan = {
    ...plan,
    id: `plan_${Date.now()}`
  };
  return newPlan;
}

// Update membership plan (updates localStorage)
export function updateMembershipPlan(id: string, updates: Partial<MembershipPlan>): MembershipPlan | null {
  if (typeof localStorage !== 'undefined') {
    const existingPlans = JSON.parse(localStorage.getItem('memberCardPlans') || JSON.stringify(memberCardPlans));
    const index = existingPlans.findIndex((plan: RawMembershipPlanData) => plan.id.toString() === id);
    if (index === -1) return null;
    
    // Convert updates back to JSON format
    const jsonUpdates: Partial<RawMembershipPlanData> = {};
    if (updates.name) jsonUpdates.name = updates.name;
    if (updates.price) jsonUpdates.price = updates.price.toString();
    if (updates.originalPrice) jsonUpdates.original_price = updates.originalPrice.toString();
    if (updates.duration) jsonUpdates.duration = updates.duration;
    if (updates.type) {
      jsonUpdates.plan_type = updates.type as string;
      jsonUpdates.type = updates.type.toUpperCase();
    }
    if (updates.features) jsonUpdates.features = updates.features;
    if (updates.published !== undefined) jsonUpdates.published = updates.published;
    if (updates.category) jsonUpdates.category = updates.category;
    
    existingPlans[index] = { ...existingPlans[index], ...jsonUpdates };
    localStorage.setItem('memberCardPlans', JSON.stringify(existingPlans));
    return convertToMembershipPlan(existingPlans[index]);
  }
  
  return null;
}

// Delete membership plan (removes from localStorage)
export function deleteMembershipPlan(id: string): boolean {
  if (typeof localStorage !== 'undefined') {
    const existingPlans = JSON.parse(localStorage.getItem('memberCardPlans') || JSON.stringify(memberCardPlans));
    const index = existingPlans.findIndex((plan: RawMembershipPlanData) => plan.id.toString() === id);
    if (index === -1) return false;
    
    existingPlans.splice(index, 1);
    localStorage.setItem('memberCardPlans', JSON.stringify(existingPlans));
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