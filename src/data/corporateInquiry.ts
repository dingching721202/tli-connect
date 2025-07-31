import type { CorporateInquiry } from '@/types/business';

// ========================================
// 企業詢問資料 - 已清空
// ========================================

export const corporateInquiries: CorporateInquiry[] = [];

// ========================================
// 輔助函數
// ========================================

// 根據ID獲取企業詢問
export const getCorporateInquiryById = (id: number): CorporateInquiry | undefined => {
  return corporateInquiries.find(inquiry => inquiry.id === id);
};

// 獲取所有企業詢問
export const getCorporateInquiries = (): CorporateInquiry[] => {
  return corporateInquiries;
};

// 更新企業詢問
export const updateCorporateInquiry = (id: number, updates: Partial<CorporateInquiry>): CorporateInquiry | null => {
  const index = corporateInquiries.findIndex(inquiry => inquiry.id === id);
  if (index !== -1) {
    corporateInquiries[index] = { ...corporateInquiries[index], ...updates };
    return corporateInquiries[index];
  }
  return null;
};

// 刪除企業詢問
export const deleteCorporateInquiry = (id: number): boolean => {
  const index = corporateInquiries.findIndex(inquiry => inquiry.id === id);
  if (index !== -1) {
    corporateInquiries.splice(index, 1);
    return true;
  }
  return false;
};

// 獲取統計
export const getCorporateInquiryStatistics = () => {
  return {
    total: corporateInquiries.length
  };
};

// 向下相容的預設匯出
export default corporateInquiries;