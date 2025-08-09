import { MemberCard, memberCards as initialMemberCards } from '@/data/member_cards';

// 在服務器端使用內存存儲，在客戶端使用localStorage
class MemberCardStorage {
  private static instance: MemberCardStorage;
  private memberCards: MemberCard[] = [];
  private initialized: boolean = false;

  private constructor() {
    this.initializeData();
  }

  public static getInstance(): MemberCardStorage {
    if (!MemberCardStorage.instance) {
      MemberCardStorage.instance = new MemberCardStorage();
    }
    return MemberCardStorage.instance;
  }

  private initializeData(): void {
    if (this.initialized) return;

    // 使用初始資料並添加 updated_at 欄位
    this.memberCards = initialMemberCards.map(card => ({
      ...card,
      updated_at: card.updated_at || card.created_at
    }));

    this.initialized = true;
  }

  public getAllCards(): MemberCard[] {
    this.initializeData();
    return [...this.memberCards];
  }

  public getCardById(id: number): MemberCard | undefined {
    this.initializeData();
    return this.memberCards.find(card => card.id === id);
  }

  public addCard(cardData: Omit<MemberCard, 'id' | 'created_at' | 'updated_at'>): MemberCard {
    this.initializeData();
    
    const newCard: MemberCard = {
      id: Math.max(...this.memberCards.map(c => c.id), 0) + 1,
      name: cardData.name.trim(),
      available_course_ids: cardData.available_course_ids,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.memberCards.push(newCard);
    this.saveToStorage();
    return newCard;
  }

  public updateCard(id: number, cardData: Partial<Omit<MemberCard, 'id' | 'created_at'>>): MemberCard | null {
    this.initializeData();
    
    const cardIndex = this.memberCards.findIndex(c => c.id === id);
    if (cardIndex === -1) return null;

    this.memberCards[cardIndex] = {
      ...this.memberCards[cardIndex],
      ...cardData,
      name: cardData.name ? cardData.name.trim() : this.memberCards[cardIndex].name,
      updated_at: new Date().toISOString()
    };

    this.saveToStorage();
    return this.memberCards[cardIndex];
  }

  public deleteCard(id: number): MemberCard | null {
    this.initializeData();
    
    const cardIndex = this.memberCards.findIndex(c => c.id === id);
    if (cardIndex === -1) return null;

    const deletedCard = this.memberCards.splice(cardIndex, 1)[0];
    this.saveToStorage();
    return deletedCard;
  }

  private saveToStorage(): void {
    // 在服務器端，資料保存在內存中
    // 在真實應用中，這裡應該保存到資料庫
    console.log('會員卡資料已更新，當前數量:', this.memberCards.length);
  }

  // 用於重置資料（測試或開發用）
  public resetData(): void {
    this.memberCards = initialMemberCards.map(card => ({
      ...card,
      updated_at: card.updated_at || card.created_at
    }));
    this.saveToStorage();
  }
}

export default MemberCardStorage;