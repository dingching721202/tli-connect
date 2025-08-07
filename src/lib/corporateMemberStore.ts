import { CorporateMember, LearningRecord, ReservationRecord } from '@/types/corporateSubscription';
import { corporateMembers, learningRecords, reservationRecords } from '@/data/corporateMembers';
import { systemSettings } from '@/data/systemSettings';

class CorporateMemberStore {
  private static instance: CorporateMemberStore;
  private members: CorporateMember[] = [];
  private learningRecords: LearningRecord[] = [];
  private reservationRecords: ReservationRecord[] = [];
  private readonly MEMBERS_STORAGE_KEY = 'corporateMembers';
  private readonly LEARNING_STORAGE_KEY = 'learningRecords';
  private readonly RESERVATION_STORAGE_KEY = 'reservationRecords';
  private isServerSide = typeof window === 'undefined';

  private constructor() {
    if (!this.isServerSide) {
      this.loadFromStorage();
    } else {
      this.members = [...corporateMembers];
      this.learningRecords = [...learningRecords];
      this.reservationRecords = [...reservationRecords];
    }
  }

  static getInstance(): CorporateMemberStore {
    if (!CorporateMemberStore.instance) {
      CorporateMemberStore.instance = new CorporateMemberStore();
    }
    return CorporateMemberStore.instance;
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') {
      this.members = [...corporateMembers];
      this.learningRecords = [...learningRecords];
      this.reservationRecords = [...reservationRecords];
      return;
    }

    try {
      // 載入企業會員數據
      const storedMembers = localStorage.getItem(this.MEMBERS_STORAGE_KEY);
      if (storedMembers) {
        this.members = JSON.parse(storedMembers);
      } else {
        this.members = [...corporateMembers];
        this.saveMembersToStorage();
      }

      // 載入學習記錄
      const storedLearning = localStorage.getItem(this.LEARNING_STORAGE_KEY);
      if (storedLearning) {
        this.learningRecords = JSON.parse(storedLearning);
      } else {
        this.learningRecords = [...learningRecords];
        this.saveLearningToStorage();
      }

      // 載入預約記錄
      const storedReservation = localStorage.getItem(this.RESERVATION_STORAGE_KEY);
      if (storedReservation) {
        this.reservationRecords = JSON.parse(storedReservation);
      } else {
        this.reservationRecords = [...reservationRecords];
        this.saveReservationToStorage();
      }

      console.log('📚 企業會員數據載入完成:', this.members.length, '個會員');
    } catch (error) {
      console.error('❌ 載入企業會員數據失敗:', error);
      this.members = [...corporateMembers];
      this.learningRecords = [...learningRecords];
      this.reservationRecords = [...reservationRecords];
    }
  }

  private saveMembersToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.MEMBERS_STORAGE_KEY, JSON.stringify(this.members));
    } catch (error) {
      console.error('❌ 保存企業會員數據失敗:', error);
    }
  }

  private saveLearningToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.LEARNING_STORAGE_KEY, JSON.stringify(this.learningRecords));
    } catch (error) {
      console.error('❌ 保存學習記錄失敗:', error);
    }
  }

  private saveReservationToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.RESERVATION_STORAGE_KEY, JSON.stringify(this.reservationRecords));
    } catch (error) {
      console.error('❌ 保存預約記錄失敗:', error);
    }
  }

  private getSystemSetting(key: string, defaultValue: unknown): unknown {
    const setting = systemSettings.find(s => s.key === key);
    return setting ? setting.value : defaultValue;
  }

  // ===== 企業會員 CRUD =====

  // 獲取所有企業會員
  async getAllMembers(): Promise<CorporateMember[]> {
    return [...this.members];
  }

  // 根據企業訂閱獲取會員
  async getMembersBySubscription(subscriptionId: number): Promise<CorporateMember[]> {
    return this.members.filter(member => member.subscription_id === subscriptionId);
  }

  // 根據企業獲取會員
  async getMembersByCompany(companyId: string | number): Promise<CorporateMember[]> {
    return this.members.filter(member => member.company_id === companyId);
  }

  // 獲取單個企業會員
  async getMemberById(id: number): Promise<CorporateMember | null> {
    return this.members.find(member => member.id === id) || null;
  }

  // 創建企業會員 (分配席次)
  async createMember(data: {
    subscription_id: number;
    user_name: string;
    user_email: string;
    company_id: string | number;
    company_name: string;
    plan_title: string;
    duration_type: 'season' | 'annual';
    duration_days: number;
    purchase_date: string;
    redemption_deadline: string;
  }): Promise<CorporateMember> {
    const newId = Math.max(...this.members.map(m => m.id), 0) + 1;
    const now = new Date().toISOString();
    
    // 生成新的用戶ID（如果是新用戶）
    const userId = Math.abs(data.user_email.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0));

    // 計算啟用期限（基於系統設定）
    const activationDeadlineDays = this.getSystemSetting('member_activation_deadline_days', 30) as number;
    const activationDeadline = new Date();
    activationDeadline.setDate(activationDeadline.getDate() + activationDeadlineDays);

    const newMember: CorporateMember = {
      id: newId,
      subscription_id: data.subscription_id,
      user_id: userId,
      user_name: data.user_name,
      user_email: data.user_email,
      issued_date: now,
      activation_deadline: activationDeadline.toISOString(),
      purchase_date: data.purchase_date,
      redemption_deadline: data.redemption_deadline,
      card_status: 'inactive',
      created_at: now,
      updated_at: now,
      company_id: data.company_id,
      company_name: data.company_name,
      plan_title: data.plan_title,
      duration_type: data.duration_type,
      duration_days: data.duration_days
    };

    this.members.push(newMember);
    this.saveMembersToStorage();

    console.log('✅ 企業會員創建成功:', newMember);
    return newMember;
  }

  // 更新企業會員
  async updateMember(id: number, updates: Partial<CorporateMember>): Promise<CorporateMember | null> {
    const memberIndex = this.members.findIndex(m => m.id === id);
    if (memberIndex === -1) {
      throw new Error('找不到指定的企業會員');
    }

    this.members[memberIndex] = {
      ...this.members[memberIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.saveMembersToStorage();
    console.log('✅ 企業會員更新成功:', this.members[memberIndex]);
    return this.members[memberIndex];
  }

  // 啟用企業會員卡
  async activateMemberCard(id: number): Promise<CorporateMember | null> {
    const memberIndex = this.members.findIndex(m => m.id === id);
    if (memberIndex === -1) {
      throw new Error('找不到指定的企業會員');
    }

    const member = this.members[memberIndex];
    
    // 允許啟用未啟用的會員卡或重新啟用過期的會員卡
    if (member.card_status !== 'inactive' && member.card_status !== 'expired') {
      throw new Error(`會員卡狀態為 ${member.card_status}，無法啟用`);
    }

    // 對於未啟用的會員卡，檢查啟用期限
    if (member.card_status === 'purchased' && new Date() > new Date(member.activation_deadline)) {
      throw new Error('會員卡啟用期限已過');
    }

    const now = new Date().toISOString();
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (member.duration_days || 365));

    // 如果是重新啟用過期卡，保留原始的啟用日期
    const activationDate = member.card_status === 'expired' && member.activation_date 
      ? member.activation_date 
      : now;

    this.members[memberIndex] = {
      ...member,
      card_status: 'activated',
      activation_date: activationDate,
      start_date: now,
      end_date: endDate.toISOString(),
      updated_at: now
    };

    this.saveMembersToStorage();
    console.log('✅ 企業會員卡啟用成功:', this.members[memberIndex]);
    return this.members[memberIndex];
  }

  // 刪除企業會員
  async deleteMember(id: number): Promise<boolean> {
    const memberIndex = this.members.findIndex(m => m.id === id);
    if (memberIndex === -1) {
      throw new Error('找不到指定的企業會員');
    }

    const deletedMember = this.members[memberIndex];
    this.members.splice(memberIndex, 1);
    
    // 同時刪除相關的學習記錄和預約記錄
    this.learningRecords = this.learningRecords.filter(r => r.member_id !== id);
    this.reservationRecords = this.reservationRecords.filter(r => r.member_id !== id);
    
    this.saveMembersToStorage();
    this.saveLearningToStorage();
    this.saveReservationToStorage();

    console.log('✅ 企業會員刪除成功:', deletedMember);
    return true;
  }

  // ===== 學習記錄 CRUD =====

  // 獲取會員學習記錄
  async getLearningRecords(memberId: number): Promise<LearningRecord[]> {
    return this.learningRecords.filter(record => record.member_id === memberId);
  }

  // 創建學習記錄
  async createLearningRecord(data: Omit<LearningRecord, 'id' | 'created_at'>): Promise<LearningRecord> {
    const newId = Math.max(...this.learningRecords.map(r => r.id), 0) + 1;
    const newRecord: LearningRecord = {
      ...data,
      id: newId,
      created_at: new Date().toISOString()
    };

    this.learningRecords.push(newRecord);
    this.saveLearningToStorage();
    return newRecord;
  }

  // ===== 預約記錄 CRUD =====

  // 獲取會員預約記錄
  async getReservationRecords(memberId: number): Promise<ReservationRecord[]> {
    return this.reservationRecords.filter(record => record.member_id === memberId);
  }

  // 創建預約記錄
  async createReservationRecord(data: Omit<ReservationRecord, 'id' | 'created_at' | 'updated_at'>): Promise<ReservationRecord> {
    const newId = Math.max(...this.reservationRecords.map(r => r.id), 0) + 1;
    const now = new Date().toISOString();
    const newRecord: ReservationRecord = {
      ...data,
      id: newId,
      created_at: now,
      updated_at: now
    };

    this.reservationRecords.push(newRecord);
    this.saveReservationToStorage();
    return newRecord;
  }

  // 更新預約記錄
  async updateReservationRecord(id: number, updates: Partial<ReservationRecord>): Promise<ReservationRecord | null> {
    const recordIndex = this.reservationRecords.findIndex(r => r.id === id);
    if (recordIndex === -1) {
      throw new Error('找不到指定的預約記錄');
    }

    this.reservationRecords[recordIndex] = {
      ...this.reservationRecords[recordIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.saveReservationToStorage();
    return this.reservationRecords[recordIndex];
  }

  // ===== 統計功能 =====

  // 獲取會員統計
  async getMemberStatistics() {
    const totalMembers = this.members.length;
    const activatedMembers = this.members.filter(m => m.card_status === 'activated').length;
    const purchasedMembers = this.members.filter(m => m.card_status === 'purchased').length;
    const expiredMembers = this.members.filter(m => m.card_status === 'expired').length;
    
    const totalLearningHours = this.learningRecords.reduce((sum, record) => 
      sum + (record.duration_minutes || 0), 0) / 60;
    
    const totalReservations = this.reservationRecords.length;
    const attendedReservations = this.reservationRecords.filter(r => r.status === 'attended').length;

    return {
      totalMembers,
      activatedMembers,
      purchasedMembers,
      expiredMembers,
      totalLearningHours: Math.round(totalLearningHours * 10) / 10,
      totalReservations,
      attendedReservations,
      attendanceRate: totalReservations > 0 ? Math.round((attendedReservations / totalReservations) * 100) : 0
    };
  }

  // 檢查並更新過期狀態
  async updateExpiredStatus(): Promise<void> {
    const now = new Date();
    let hasUpdates = false;

    for (let i = 0; i < this.members.length; i++) {
      const member = this.members[i];
      
      // 檢查已啟用的會員卡是否過期
      if (member.card_status === 'activated' && member.end_date && new Date(member.end_date) < now) {
        this.members[i] = {
          ...member,
          card_status: 'expired',
          updated_at: now.toISOString()
        };
        hasUpdates = true;
      }
      
      // 檢查未啟用的會員卡是否超過啟用期限
      if (member.card_status === 'purchased' && new Date(member.activation_deadline) < now) {
        const autoExpire = this.getSystemSetting('auto_expire_inactive_members', true) as boolean;
        if (autoExpire) {
          this.members[i] = {
            ...member,
            card_status: 'expired',
            updated_at: now.toISOString()
          };
          hasUpdates = true;
        }
      }
    }

    if (hasUpdates) {
      this.saveMembersToStorage();
      console.log('⏰ 已更新過期企業會員狀態');
    }
  }
}

export const corporateMemberStore = CorporateMemberStore.getInstance();