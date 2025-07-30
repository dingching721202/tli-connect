import type { CorporateInquiry } from '@/types/business';

// ========================================
// 企業詢問資料 - MECE架構
// 管理企業客戶的詢問和洽談記錄
// ========================================

export const corporateInquiries: CorporateInquiry[] = [
  {
    id: 1,
    company_name: 'ABC科技股份有限公司',
    contact_person: '張經理',
    contact_email: 'manager.zhang@abc-tech.com',
    contact_phone: '02-1234-5678',
    company_size: '100-500人',
    industry: '科技業',
    training_needs: ['商務英語', '簡報技巧', '跨文化溝通'],
    preferred_languages: ['英文', '中文'],
    budget_range: '50-100萬',
    timeline: '3個月內',
    status: 'NEW',
    assigned_to: 4, // 員工ID
    notes: '對英語培訓特別感興趣，希望能提供客製化課程',
    created_at: '2025-01-10T10:00:00+00:00',
    updated_at: '2025-01-15T14:30:00+00:00'
  },
  {
    id: 2,
    company_name: 'XYZ製造業有限公司',
    contact_person: '李總監',
    contact_email: 'director.li@xyz-mfg.com',
    contact_phone: '03-9876-5432',
    company_size: '50-100人',
    industry: '製造業',
    training_needs: ['技術英語', '安全培訓'],
    preferred_languages: ['英文'],
    budget_range: '20-50萬',
    timeline: '6個月內',
    status: 'CONTACTED',
    assigned_to: 4,
    notes: '主要需要技術相關的英語培訓',
    created_at: '2025-01-12T09:30:00+00:00',
    updated_at: '2025-01-16T11:20:00+00:00'
  },
  {
    id: 3,
    company_name: '123金融服務公司',
    contact_person: '王協理',
    contact_email: 'associate.wang@123finance.com',
    contact_phone: '02-5678-1234',
    company_size: '500-1000人',
    industry: '金融業',
    training_needs: ['商務英語', '金融英語', '客戶服務'],
    preferred_languages: ['英文', '日文'],
    budget_range: '100-200萬',
    timeline: '立即開始',
    status: 'QUOTED',
    assigned_to: 4,
    notes: '大型企業客戶，需要comprehensive培訓方案',
    created_at: '2025-01-08T15:45:00+00:00',
    updated_at: '2025-01-18T16:15:00+00:00'
  }
];

// ========================================
// 輔助函數
// ========================================

// 根據狀態獲取詢問
export const getCorporateInquiriesByStatus = (status: string): CorporateInquiry[] => {
  return corporateInquiries.filter(inquiry => inquiry.status === status);
};

// 根據負責人獲取詢問
export const getCorporateInquiriesByAssignee = (assigneeId: number): CorporateInquiry[] => {
  return corporateInquiries.filter(inquiry => inquiry.assigned_to === assigneeId);
};

// 根據公司規模獲取詢問
export const getCorporateInquiriesByCompanySize = (companySize: string): CorporateInquiry[] => {
  return corporateInquiries.filter(inquiry => inquiry.company_size === companySize);
};

// 根據行業獲取詢問
export const getCorporateInquiriesByIndustry = (industry: string): CorporateInquiry[] => {
  return corporateInquiries.filter(inquiry => inquiry.industry === industry);
};

// 根據ID獲取詢問
export const getCorporateInquiryById = (id: number): CorporateInquiry | undefined => {
  return corporateInquiries.find(inquiry => inquiry.id === id);
};

// 新增詢問
export const addCorporateInquiry = (inquiry: Omit<CorporateInquiry, 'id' | 'created_at' | 'updated_at'>): void => {
  const newInquiry: CorporateInquiry = {
    ...inquiry,
    id: Math.max(...corporateInquiries.map(i => i.id), 0) + 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  corporateInquiries.push(newInquiry);
};

// 更新詢問狀態
export const updateInquiryStatus = (id: number, status: CorporateInquiry['status'], notes?: string): boolean => {
  const inquiry = getCorporateInquiryById(id);
  if (inquiry) {
    inquiry.status = status;
    if (notes) inquiry.notes = notes;
    inquiry.updated_at = new Date().toISOString();
    return true;
  }
  return false;
};

// 新增缺失的匯出函數
export const getCorporateInquiries = (): CorporateInquiry[] => {
  return corporateInquiries;
};

export const updateCorporateInquiry = (id: number, updates: Partial<CorporateInquiry>): boolean => {
  const inquiryIndex = corporateInquiries.findIndex(i => i.id === id);
  if (inquiryIndex === -1) return false;
  
  corporateInquiries[inquiryIndex] = {
    ...corporateInquiries[inquiryIndex],
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  return true;
};

export const deleteCorporateInquiry = (id: number): boolean => {
  const inquiryIndex = corporateInquiries.findIndex(i => i.id === id);
  if (inquiryIndex === -1) return false;
  
  corporateInquiries.splice(inquiryIndex, 1);
  return true;
};

// 向下相容的預設匯出
export default corporateInquiries;