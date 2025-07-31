import type { CorporateClient, CorporateEmployee, CorporateSubscription } from '@/types/business';

// ========================================
// 企業資料 - 已清空
// ========================================

export const companies: CorporateClient[] = [];
export const corporateEmployees: CorporateEmployee[] = [];
export const corporateSubscriptions: CorporateSubscription[] = [];

// ========================================
// 輔助函數
// ========================================

// 根據ID獲取公司
export const getCompanyById = (id: number): CorporateClient | undefined => {
  return companies.find(company => company.id === id);
};

// 獲取所有公司
export const getCompanies = (): CorporateClient[] => {
  return companies;
};

// 新增公司
export const addCompany = (company: Omit<CorporateClient, 'id'>): CorporateClient => {
  const newCompany = { ...company, id: Math.max(...companies.map(c => c.id), 0) + 1 };
  companies.push(newCompany);
  return newCompany;
};

// 更新公司
export const updateCompany = (id: number, updates: Partial<CorporateClient>): CorporateClient | null => {
  const index = companies.findIndex(c => c.id === id);
  if (index !== -1) {
    companies[index] = { ...companies[index], ...updates };
    return companies[index];
  }
  return null;
};

// 刪除公司
export const deleteCompany = (id: number): boolean => {
  const index = companies.findIndex(c => c.id === id);
  if (index !== -1) {
    companies.splice(index, 1);
    return true;
  }
  return false;
};

// 獲取公司統計
export const getCompanyStatistics = () => {
  return {
    total: companies.length,
    active: companies.filter(c => c.status === 'ACTIVE').length,
    employees: corporateEmployees.length,
    subscriptions: corporateSubscriptions.length
  };
};

// 根據公司獲取企業用戶
export const getCorporateUsersByCompany = (companyId: number) => {
  return corporateEmployees.filter(emp => emp.company_id === companyId);
};

// 向下相容的預設匯出
export default companies;