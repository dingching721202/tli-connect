import { CorporateSubscription, CreateCorporateSubscriptionRequest } from '@/types/corporateSubscription';
import { corporateSubscriptions } from '@/data/corporateSubscriptions';
import { memberCardPlans } from '@/data/member_card_plans';
import { getCompanies } from '@/data/corporateData';

class CorporateSubscriptionStore {
  private static instance: CorporateSubscriptionStore;
  private subscriptions: CorporateSubscription[] = [];
  private readonly SUBSCRIPTION_STORAGE_KEY = 'corporateSubscriptions';
  private isServerSide = typeof window === 'undefined';

  private constructor() {
    if (!this.isServerSide) {
      this.loadFromStorage();
    } else {
      this.subscriptions = [...corporateSubscriptions];
    }
  }

  static getInstance(): CorporateSubscriptionStore {
    if (!CorporateSubscriptionStore.instance) {
      CorporateSubscriptionStore.instance = new CorporateSubscriptionStore();
    }
    return CorporateSubscriptionStore.instance;
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') {
      this.subscriptions = [...corporateSubscriptions];
      return;
    }

    try {
      // 載入企業訂閱數據
      const storedSubscriptions = localStorage.getItem(this.SUBSCRIPTION_STORAGE_KEY);
      if (storedSubscriptions) {
        this.subscriptions = JSON.parse(storedSubscriptions);
      } else {
        this.subscriptions = [...corporateSubscriptions];
        this.saveSubscriptionsToStorage();
      }

      console.log('📊 企業訂閱數據載入完成:', this.subscriptions.length, '個訂閱');
    } catch (error) {
      console.error('❌ 載入企業訂閱數據失敗:', error);
      this.subscriptions = [...corporateSubscriptions];
    }
  }

  private saveSubscriptionsToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.SUBSCRIPTION_STORAGE_KEY, JSON.stringify(this.subscriptions));
    } catch (error) {
      console.error('❌ 保存企業訂閱數據失敗:', error);
    }
  }


  // 獲取所有企業訂閱
  async getAllSubscriptions(): Promise<CorporateSubscription[]> {
    return [...this.subscriptions];
  }

  // 根據公司獲取訂閱
  async getSubscriptionsByCompany(companyId: string | number): Promise<CorporateSubscription[]> {
    return this.subscriptions.filter(sub => sub.corp_id === companyId);
  }

  // 獲取企業訂閱統計
  async getSubscriptionStatistics() {
    const stats = {
      total: this.subscriptions.length,
      active: this.subscriptions.filter(s => s.status === 'activated').length,
      inactive: this.subscriptions.filter(s => s.status === 'inactive').length,
      expired: this.subscriptions.filter(s => s.status === 'expired').length,
      cancelled: this.subscriptions.filter(s => s.status === 'cancelled').length,
      totalSeats: this.subscriptions.reduce((sum, s) => sum + s.seats_total, 0),
      usedSeats: this.subscriptions.reduce((sum, s) => sum + s.seats_used, 0),
      availableSeats: this.subscriptions.reduce((sum, s) => sum + s.seats_available, 0),
      totalRevenue: this.subscriptions.reduce((sum, s) => sum + s.amount_paid, 0)
    };

    return stats;
  }

  // 創建企業訂閱
  async createSubscription(data: CreateCorporateSubscriptionRequest): Promise<CorporateSubscription> {
    const newId = Math.max(...this.subscriptions.map(s => s.id), 0) + 1;
    const now = new Date().toISOString();

    // 獲取方案信息
    const plan = memberCardPlans.find(p => p.id === data.plan_id);
    if (!plan || plan.user_type !== 'corporate') {
      throw new Error(`找不到ID為 ${data.plan_id} 的企業方案`);
    }

    // 獲取公司信息
    const companies = getCompanies();
    const company = companies.find(c => c.id === data.corp_id);
    if (!company) {
      throw new Error(`找不到ID為 ${data.corp_id} 的公司`);
    }

    // 計算開啟期限
    const activationDeadline = new Date();
    activationDeadline.setDate(activationDeadline.getDate() + (plan.activate_deadline_days || 30));

    const newSubscription: CorporateSubscription = {
      id: newId,
      corp_id: data.corp_id,
      plan_id: data.plan_id,
      seats_total: data.seats_total,
      seats_used: 0,
      seats_available: data.seats_total,
      purchase_date: now,
      activation_deadline: activationDeadline.toISOString(),
      status: 'inactive',
      amount_paid: data.amount_paid,
      auto_renewal: data.auto_renewal || false,
      created_at: now,
      updated_at: now,
      company_name: company.name,
      plan_title: plan.title,
      plan_type: 'corporate',
      duration_type: plan.duration_type,
      duration_days: plan.duration_days
    };

    this.subscriptions.push(newSubscription);
    this.saveSubscriptionsToStorage();

    console.log('✅ 企業訂閱創建成功:', newSubscription);
    return newSubscription;
  }


  // 更新企業訂閱
  async updateSubscription(id: number, updates: { 
    seats_used?: number, 
    seats_available?: number,
    seats_total?: number,
    amount_paid?: number,
    auto_renewal?: boolean,
    status?: 'inactive' | 'activated' | 'expired' | 'cancelled' | 'test',
    plan_id?: number,
    plan_title?: string,
    duration_type?: 'season' | 'annual',
    duration_days?: number
  }): Promise<CorporateSubscription | null> {
    const subscriptionIndex = this.subscriptions.findIndex(s => s.id === id);
    if (subscriptionIndex === -1) {
      throw new Error('找不到指定的企業訂閱');
    }

    this.subscriptions[subscriptionIndex] = {
      ...this.subscriptions[subscriptionIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.saveSubscriptionsToStorage();
    return this.subscriptions[subscriptionIndex];
  }

  // 激活企業訂閱
  async activateSubscription(id: number): Promise<CorporateSubscription | null> {
    const subscriptionIndex = this.subscriptions.findIndex(s => s.id === id);
    if (subscriptionIndex === -1) {
      throw new Error('找不到指定的企業訂閱');
    }

    const subscription = this.subscriptions[subscriptionIndex];
    if (subscription.status !== 'inactive') {
      throw new Error(`企業訂閱狀態為 ${subscription.status}，無法激活`);
    }

    // 檢查激活期限
    if (subscription.activation_deadline && new Date() > new Date(subscription.activation_deadline)) {
      throw new Error('企業訂閱激活期限已過');
    }

    const now = new Date().toISOString();

    subscription.status = 'activated';
    subscription.updated_at = now;

    this.saveSubscriptionsToStorage();

    console.log('✅ 企業訂閱激活成功:', subscription);
    return subscription;
  }
}

export const corporateSubscriptionStore = CorporateSubscriptionStore.getInstance();