// ========================================
// 推薦系統型別定義 (向後相容層)
// ========================================

// 注意：這個檔案主要用於向後相容性
// 新的推薦系統型別已定義在 business.ts 中的 Agent 相關型別

// ========================================
// 向後相容的型別別名
// ========================================

import type { 
  Agent, 
  Referral, 
  CommissionPayment
} from './business';

// @deprecated 請使用 business.ts 中的 Agent 型別
export interface ConsultantProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  totalEarnings: number;
  currentMonthEarnings: number;
  totalCustomers: number;
  activeReferralCodes: number;
  activeReferralLinks: number;
  commissionRate: number;
  paymentInfo: {
    bankAccount?: string;
    paymentMethod: 'bank_transfer' | 'paypal' | 'check';
    taxId?: string;
  };
  performance: {
    thisMonth: MonthlyPerformance;
    lastMonth: MonthlyPerformance;
    yearToDate: MonthlyPerformance;
  };
}

// @deprecated 請使用 business.ts 中的 Referral 型別
export interface ReferralCode {
  id: string;
  code: string;
  type: 'discount' | 'referral';
  discountPercentage?: number;
  discountAmount?: number;
  isActive: boolean;
  createdDate: string;
  expiryDate: string | null;
  usageCount: number;
  usageLimit?: number;
  description: string;
}

export interface ReferralLink {
  id: string;
  url: string;
  shortUrl: string;
  isActive: boolean;
  createdDate: string;
  clickCount: number;
  conversionCount: number;
  description: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

// @deprecated 請使用 business.ts 中的 Order 相關型別
export interface CustomerPurchase {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  productType: 'individual' | 'corporate';
  planName: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  purchaseDate: string;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  referralMethod: 'code' | 'link';
  referralValue: string;
  notes?: string;
}

// @deprecated 請使用 business.ts 中的 CommissionPayment 型別
export interface CommissionRecord {
  id: string;
  purchaseId: string;
  consultantId: number;
  consultantName: string;
  customerName: string;
  orderNumber: string;
  saleAmount: number;
  commissionRate: number;
  commissionAmount: number;
  commissionStatus: 'pending' | 'approved' | 'paid' | 'disputed';
  calculatedDate: string;
  paidDate?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface MonthlyPerformance {
  month: string; // YYYY-MM
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalSales: number;
  totalCommission: number;
  customerCount: number;
  averageOrderValue: number;
  topPerformingCode: string;
  topPerformingLink: string;
  newCustomers: number;
  returningCustomers: number;
}

export interface ReferralAnalytics {
  period: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalCommission: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  performanceByCode: Array<{
    code: string;
    usage: number;
    revenue: number;
    commission: number;
  }>;
  performanceByLink: Array<{
    url: string;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
}

export interface ReferralDashboardData {
  consultant: ConsultantProfile;
  recentPurchases: CustomerPurchase[];
  pendingCommissions: CommissionRecord[];
  activeCodes: ReferralCode[];
  activeLinks: ReferralLink[];
  analytics: ReferralAnalytics;
  monthlyPerformance: MonthlyPerformance[];
}

// ========================================
// 型別轉換輔助函數型別
// ========================================

export interface AgentToConsultantConverter {
  (agent: Agent): ConsultantProfile;
}

export interface ReferralToCodeConverter {
  (referral: Referral): ReferralCode;
}

export interface CommissionToRecordConverter {
  (commission: CommissionPayment): CommissionRecord;
}