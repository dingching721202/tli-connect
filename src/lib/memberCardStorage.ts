import { MemberCard, memberCards as initialMemberCards } from '@/data/member_cards';

// 全域儲存變數，確保跨模組共享
let globalMemberCards: MemberCard[] = [];
let globalInitialized: boolean = false;

// 在服務器端使用內存存儲，在客戶端使用localStorage
class MemberCardStorage {
  private static instance: MemberCardStorage;

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
    if (globalInitialized) return;

    // 使用初始資料並添加 updated_at 欄位
    globalMemberCards = initialMemberCards.map(card => ({
      ...card,
      updated_at: card.updated_at || card.created_at
    }));

    globalInitialized = true;
    console.log('MemberCardStorage 初始化完成，載入', globalMemberCards.length, '個會員卡');
  }

  public getAllCards(): MemberCard[] {
    this.initializeData();
    return [...globalMemberCards];
  }

  public getCardById(id: number): MemberCard | undefined {
    this.initializeData();
    return globalMemberCards.find(card => card.id === id);
  }

  public addCard(cardData: Omit<MemberCard, 'id' | 'created_at' | 'updated_at'>): MemberCard {
    this.initializeData();
    
    const newCard: MemberCard = {
      id: Math.max(...globalMemberCards.map(c => c.id), 0) + 1,
      name: cardData.name.trim(),
      available_course_ids: cardData.available_course_ids,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    globalMemberCards.push(newCard);
    this.saveToStorage();
    return newCard;
  }

  public updateCard(id: number, cardData: Partial<Omit<MemberCard, 'id' | 'created_at'>>): MemberCard | null {
    this.initializeData();
    
    const cardIndex = globalMemberCards.findIndex(c => c.id === id);
    if (cardIndex === -1) {
      console.log(`會員卡 ID ${id} 不存在，當前會員卡列表:`, globalMemberCards.map(c => c.id));
      return null;
    }

    globalMemberCards[cardIndex] = {
      ...globalMemberCards[cardIndex],
      ...cardData,
      name: cardData.name ? cardData.name.trim() : globalMemberCards[cardIndex].name,
      updated_at: new Date().toISOString()
    };

    this.saveToStorage();
    console.log(`會員卡 ID ${id} 更新成功:`, globalMemberCards[cardIndex]);
    return globalMemberCards[cardIndex];
  }

  public deleteCard(id: number): MemberCard | null {
    this.initializeData();
    
    const cardIndex = globalMemberCards.findIndex(c => c.id === id);
    if (cardIndex === -1) return null;

    const deletedCard = globalMemberCards.splice(cardIndex, 1)[0];
    this.saveToStorage();
    return deletedCard;
  }

  private saveToStorage(): void {
    // 在服務器端，資料保存在內存中
    // 在真實應用中，這裡應該保存到資料庫
    console.log('會員卡資料已更新，當前數量:', globalMemberCards.length);
  }

  // 用於重置資料（測試或開發用）
  public resetData(): void {
    globalMemberCards = initialMemberCards.map(card => ({
      ...card,
      updated_at: card.updated_at || card.created_at
    }));
    this.saveToStorage();
  }
}

export default MemberCardStorage;