import { memberships } from '@/data/memberships';
import { Membership } from '@/types/membership';
import { memberCardPlans } from '@/data/member_card_plans';
// 只在服務端使用 fs

// localStorage 和檔案系統持久化儲存
class MemberCardStore {
  private static instance: MemberCardStore;
  private userMemberCards: Membership[] = [];
  private readonly STORAGE_KEY = 'userMemberCards';
  private readonly FILE_NAME = 'userMemberCards.json';
  private isServerSide = typeof window === 'undefined';

  private constructor() {
    if (!this.isServerSide) {
      this.loadFromStorage();
    } else {
      // 服務端使用預設資料，在需要時再從檔案載入
      this.userMemberCards = [...memberships];
    }
  }

  static getInstance(): MemberCardStore {
    if (!MemberCardStore.instance) {
      MemberCardStore.instance = new MemberCardStore();
    }
    return MemberCardStore.instance;
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') {
      // 服務器端渲染時使用預設數據
      this.userMemberCards = [...memberships];
      return;
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsedCards = JSON.parse(stored);
        this.userMemberCards = parsedCards;
        console.log('👥 從 localStorage 載入用戶會員卡數據:', this.userMemberCards.length, '條記錄');
      } else {
        // 首次使用，初始化數據
        this.userMemberCards = [...memberships];
        this.saveToStorage();
        console.log('🆕 初始化用戶會員卡數據到 localStorage:', this.userMemberCards.length, '條記錄');
      }
    } catch (error) {
      console.error('❌ 載入用戶會員卡數據失敗，使用預設數據:', error);
      this.userMemberCards = [...memberships];
    }
  }

  // 服務端檔案載入
  private async loadFromFile(): Promise<void> {
    if (typeof window !== 'undefined') return; // 客戶端不執行
    
    try {
      const fs = (await import('fs')).promises;
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'data', this.FILE_NAME);
      
      await fs.access(filePath);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      this.userMemberCards = JSON.parse(fileContent);
      console.log('👥 服務端從檔案載入用戶會員卡數據:', this.userMemberCards.length, '條記錄');
    } catch (error) {
      // 檔案不存在，使用預設資料
      console.log('📄 檔案不存在，使用預設用戶會員卡資料:', error);
      this.userMemberCards = [...memberships];
    }
  }

  // 服務端檔案儲存
  private async saveToFile(): Promise<void> {
    if (typeof window !== 'undefined') return; // 客戶端不執行
    
    try {
      const fs = (await import('fs')).promises;
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'data', this.FILE_NAME);
      
      // 確保目錄存在
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      
      // 儲存資料
      await fs.writeFile(filePath, JSON.stringify(this.userMemberCards, null, 2));
      console.log('💾 用戶會員卡數據已儲存到檔案');
    } catch (error) {
      console.error('❌ 儲存用戶會員卡數據到檔案失敗:', error);
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.userMemberCards));
      console.log('💾 用戶會員卡數據已儲存到 localStorage');
    } catch (error) {
      console.error('❌ 儲存用戶會員卡數據失敗:', error);
    }
  }

  // 統一的儲存方法
  private async save(): Promise<void> {
    if (this.isServerSide) {
      await this.saveToFile();
    } else {
      this.saveToStorage();
    }
  }

  // 獲取所有用戶會員卡記錄
  async getAllUserMemberships(): Promise<Membership[]> {
    if (this.isServerSide) {
      await this.loadFromFile();
    }
    return [...this.userMemberCards];
  }

  // 根據用戶ID獲取會員卡記錄
  async getUserMembershipsByUserId(userId: number): Promise<Membership[]> {
    if (this.isServerSide) {
      await this.loadFromFile();
    }
    return this.userMemberCards.filter(card => card.user_id === userId);
  }

  // 根據狀態獲取會員卡記錄
  async getUserMembershipsByStatus(status: Membership['status']): Promise<Membership[]> {
    if (this.isServerSide) {
      await this.loadFromFile();
    }
    return this.userMemberCards.filter(card => card.status === status);
  }

  // 根據ID獲取單個會員卡記錄
  async getUserMembershipById(id: number): Promise<Membership | null> {
    if (this.isServerSide) {
      await this.loadFromFile();
    }
    return this.userMemberCards.find(card => card.id === id) || null;
  }

  // 創建新的用戶會員卡記錄（通常在訂單完成後調用）
  async createUserMembership(data: {
    user_id: number;
    user_name: string;
    user_email: string;
    plan_id: number;
    order_id?: number;
    amount_paid: number;
    auto_renewal?: boolean;
  }): Promise<Membership> {
    const newId = Math.max(...this.userMemberCards.map(c => c.id), 0) + 1;
    const now = new Date().toISOString();

    // 獲取計劃詳細資訊
    const plan = memberCardPlans.find(p => p.id === data.plan_id);
    if (!plan) {
      throw new Error(`找不到ID為 ${data.plan_id} 的會員卡計劃`);
    }

    // 計算開啟期限（購買後30天內需開啟，或根據計劃設定）
    const activationDeadlineDays = plan.activate_deadline_days || 30;
    const activationDeadline = new Date();
    activationDeadline.setDate(activationDeadline.getDate() + activationDeadlineDays);

    const newMembership: Membership = {
      id: newId,
      user_id: data.user_id,
      user_name: data.user_name,
      user_email: data.user_email,
      plan_id: data.plan_id,
      member_card_id: plan.member_card_id,
      order_id: data.order_id,
      status: 'purchased',
      purchase_date: now,
      activation_deadline: activationDeadline.toISOString(),
      amount_paid: data.amount_paid,
      auto_renewal: data.auto_renewal || false,
      created_at: now,
      updated_at: now,
      plan_title: plan.title,
      plan_type: plan.user_type,
      duration_type: plan.duration_type,
      duration_days: plan.duration_days
    };

    this.userMemberCards.push(newMembership);
    await this.save();
    
    console.log('✅ 創建用戶會員卡記錄成功:', {
      id: newMembership.id,
      user_name: newMembership.user_name,
      plan_title: newMembership.plan_title,
      status: newMembership.status
    });

    return newMembership;
  }

  // 開啟會員卡
  async activateMemberCard(id: number): Promise<Membership | null> {
    const cardIndex = this.userMemberCards.findIndex(card => card.id === id);
    
    if (cardIndex === -1) {
      return null;
    }

    const card = this.userMemberCards[cardIndex];
    
    // 檢查是否可以開啟
    if (card.status !== 'purchased') {
      throw new Error(`會員卡狀態為 ${card.status}，無法開啟`);
    }

    // 檢查開啟期限
    if (card.activation_deadline && new Date() > new Date(card.activation_deadline)) {
      throw new Error('會員卡開啟期限已過');
    }

    const now = new Date().toISOString();
    const activationDate = new Date();
    const expiryDate = new Date(activationDate);
    expiryDate.setDate(expiryDate.getDate() + (card.duration_days || 365));

    const updatedCard = {
      ...card,
      status: 'activated' as const,
      activation_date: now,
      expiry_date: expiryDate.toISOString(),
      updated_at: now
    };

    this.userMemberCards[cardIndex] = updatedCard;
    await this.save();

    console.log('✅ 會員卡開啟成功:', {
      id: updatedCard.id,
      user_name: updatedCard.user_name,
      plan_title: updatedCard.plan_title,
      expiry_date: updatedCard.expiry_date
    });

    return updatedCard;
  }

  // 更新會員卡狀態
  async updateMemberCardStatus(id: number, status: Membership['status']): Promise<Membership | null> {
    const cardIndex = this.userMemberCards.findIndex(card => card.id === id);
    
    if (cardIndex === -1) {
      return null;
    }

    const updatedCard = {
      ...this.userMemberCards[cardIndex],
      status,
      updated_at: new Date().toISOString()
    };

    this.userMemberCards[cardIndex] = updatedCard;
    await this.save();
    
    return updatedCard;
  }

  // 手動添加會員記錄（管理員功能）
  async manuallyAddMember(data: {
    user_name: string;
    user_email: string;
    plan_id: number;
    auto_activation?: boolean; // 是否自動開啟
  }): Promise<Membership> {
    // 這裡我們需要創建一個虛擬的user_id或者與現有用戶系統整合
    // 暫時使用email hash作為user_id
    const userId = Math.abs(data.user_email.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0));

    const plan = memberCardPlans.find(p => p.id === data.plan_id);
    if (!plan) {
      throw new Error(`找不到ID為 ${data.plan_id} 的會員卡計劃`);
    }

    const memberCard = await this.createUserMembership({
      user_id: userId,
      user_name: data.user_name,
      user_email: data.user_email,
      plan_id: data.plan_id,
      amount_paid: parseFloat(plan.sale_price),
      auto_renewal: false
    });

    // 如果設定為自動開啟，立即開啟會員卡
    if (data.auto_activation) {
      return await this.activateMemberCard(memberCard.id) || memberCard;
    }

    return memberCard;
  }

  // 檢查並更新過期狀態
  async updateExpiredStatus(): Promise<void> {
    const now = new Date();
    let hasUpdates = false;

    for (let i = 0; i < this.userMemberCards.length; i++) {
      const card = this.userMemberCards[i];
      
      // 檢查已開啟的會員卡是否過期
      if (card.status === 'activated' && card.expiry_date && new Date(card.expiry_date) < now) {
        this.userMemberCards[i] = {
          ...card,
          status: 'expired',
          updated_at: now.toISOString()
        };
        hasUpdates = true;
      }
      
      // 檢查未開啟的會員卡是否超過開啟期限
      if (card.status === 'purchased' && card.activation_deadline && new Date(card.activation_deadline) < now) {
        this.userMemberCards[i] = {
          ...card,
          status: 'expired',
          updated_at: now.toISOString()
        };
        hasUpdates = true;
      }
    }

    if (hasUpdates) {
      await this.save();
      console.log('⏰ 已更新過期會員卡狀態');
    }
  }

  // 獲取會員統計資訊
  async getMembershipStatistics(): Promise<{
    total: number;
    active: number;
    purchased: number;
    expired: number;
    cancelled: number;
  }> {
    if (this.isServerSide) {
      await this.loadFromFile();
    }

    // 先更新過期狀態
    await this.updateExpiredStatus();

    const stats = {
      total: this.userMemberCards.length,
      active: this.userMemberCards.filter(c => c.status === 'activated').length,
      purchased: this.userMemberCards.filter(c => c.status === 'purchased').length,
      expired: this.userMemberCards.filter(c => c.status === 'expired').length,
      cancelled: this.userMemberCards.filter(c => c.status === 'cancelled').length
    };

    return stats;
  }

  // 重置到預設數據（開發調試用）
  resetToDefault(): void {
    this.userMemberCards = [...memberships];
    this.saveToStorage();
    console.log('🔄 用戶會員卡數據已重置為預設值');
  }

  // 清除 localStorage 數據（開發調試用）
  clearStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('🗑️ 已清除 localStorage 中的用戶會員卡數據');
    }
  }
}

export const memberCardStore = MemberCardStore.getInstance();