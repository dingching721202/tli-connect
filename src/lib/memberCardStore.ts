import { memberCards, MemberCard } from '@/data/member_cards';
import { promises as fs } from 'fs';
import path from 'path';

// localStorage 和檔案系統持久化儲存
class MemberCardStore {
  private static instance: MemberCardStore;
  private cards: MemberCard[] = [];
  private readonly STORAGE_KEY = 'memberCards';
  private readonly FILE_PATH = path.join(process.cwd(), 'data', 'memberCards.json');
  private isServerSide = typeof window === 'undefined';

  private constructor() {
    if (!this.isServerSide) {
      this.loadFromStorage();
    } else {
      // 服務端使用預設資料，在需要時再從檔案載入
      this.cards = [...memberCards];
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
      this.cards = [...memberCards];
      return;
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsedCards = JSON.parse(stored);
        this.cards = parsedCards;
        console.log('📚 從 localStorage 載入會員卡數據:', this.cards.length, '個會員卡');
      } else {
        // 首次使用，初始化數據
        this.cards = [...memberCards];
        this.saveToStorage();
        console.log('🆕 初始化會員卡數據到 localStorage:', this.cards.length, '個會員卡');
      }
    } catch (error) {
      console.error('❌ 載入會員卡數據失敗，使用預設數據:', error);
      this.cards = [...memberCards];
    }
  }

  // 服務端檔案載入
  private async loadFromFile(): Promise<void> {
    if (!this.isServerSide) return;
    
    try {
      await fs.access(this.FILE_PATH);
      const fileContent = await fs.readFile(this.FILE_PATH, 'utf-8');
      this.cards = JSON.parse(fileContent);
      console.log('📚 服務端從檔案載入會員卡數據:', this.cards.length, '個會員卡');
    } catch (error) {
      // 檔案不存在，使用預設資料
      console.log('📄 檔案不存在，使用預設會員卡資料');
      this.cards = [...memberCards];
    }
  }

  // 服務端檔案儲存
  private async saveToFile(): Promise<void> {
    if (!this.isServerSide) return;
    
    try {
      // 確保目錄存在
      const dir = path.dirname(this.FILE_PATH);
      await fs.mkdir(dir, { recursive: true });
      
      // 儲存資料
      await fs.writeFile(this.FILE_PATH, JSON.stringify(this.cards, null, 2));
      console.log('💾 會員卡數據已儲存到檔案');
    } catch (error) {
      console.error('❌ 儲存會員卡數據到檔案失敗:', error);
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cards));
      console.log('💾 會員卡數據已儲存到 localStorage');
    } catch (error) {
      console.error('❌ 儲存會員卡數據失敗:', error);
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

  async getAllCards(): Promise<MemberCard[]> {
    if (this.isServerSide) {
      // 服務端從檔案載入最新資料
      await this.loadFromFile();
    }
    return [...this.cards];
  }

  // 同步版本（為了向後相容）
  getAllCardsSync(): MemberCard[] {
    return [...this.cards];
  }

  async getCardById(id: number): Promise<MemberCard | null> {
    if (this.isServerSide) {
      // 服務端從檔案載入最新資料
      await this.loadFromFile();
    }
    return this.cards.find(card => card.id === id) || null;
  }

  // 同步版本（為了向後相容）
  getCardByIdSync(id: number): MemberCard | null {
    return this.cards.find(card => card.id === id) || null;
  }

  async createCard(cardData: Omit<MemberCard, 'id' | 'created_at'>): Promise<MemberCard> {
    const newId = Math.max(...this.cards.map(c => c.id), 0) + 1;
    
    const newCard: MemberCard = {
      ...cardData,
      id: newId,
      created_at: new Date().toISOString()
    };

    this.cards.push(newCard);
    await this.save(); // 持久化儲存
    return newCard;
  }

  async updateCard(id: number, updates: Partial<MemberCard>): Promise<MemberCard | null> {
    const cardIndex = this.cards.findIndex(card => card.id === id);
    
    if (cardIndex === -1) {
      return null;
    }

    const updatedCard = {
      ...this.cards[cardIndex],
      ...updates,
      id // 確保 ID 不被覆蓋
    };

    this.cards[cardIndex] = updatedCard;
    await this.save(); // 持久化儲存
    
    // 輸出更新日誌以便調試
    console.log('💾 會員卡更新成功:', {
      id: updatedCard.id,
      name: updatedCard.name,
      available_course_ids: updatedCard.available_course_ids
    });
    
    return updatedCard;
  }

  async deleteCard(id: number): Promise<boolean> {
    const cardIndex = this.cards.findIndex(card => card.id === id);
    
    if (cardIndex === -1) {
      return false;
    }

    this.cards.splice(cardIndex, 1);
    await this.save(); // 持久化儲存
    return true;
  }

  // 重置到預設數據（開發調試用）
  resetToDefault(): void {
    this.cards = [...memberCards];
    this.saveToStorage();
    console.log('🔄 會員卡數據已重置為預設值');
  }

  // 清除 localStorage 數據（開發調試用）
  clearStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('🗑️ 已清除 localStorage 中的會員卡數據');
    }
  }
}

export const memberCardStore = MemberCardStore.getInstance();