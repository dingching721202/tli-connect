import type { CorporateClient, CorporateEmployee, CorporateSubscription } from '@/types/business';

// ========================================
// 企業資料 - MECE架構
// 管理企業客戶、員工和訂閱資料
// ========================================

export const corporateClients: CorporateClient[] = [
  {
    id: 1,
    company_name: 'ABC科技股份有限公司',
    registration_number: '12345678',
    industry: '科技業',
    company_size: '100-500人',
    address: '台北市信義區信義路五段7號',
    primary_contact: {
      name: '張經理',
      position: '人力資源經理',
      email: 'hr.manager@abc-tech.com',
      phone: '02-1234-5678',
      department: '人力資源部'
    },
    billing_contact: {
      name: '財務部',
      position: '財務經理',
      email: 'finance@abc-tech.com',
      phone: '02-1234-5679',
      department: '財務部'
    },
    contract_terms: {
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      auto_renewal: true,
      payment_terms: 'NET_30',
      discount_rate: 15,
      minimum_commitment: 50
    },
    status: 'ACTIVE',
    created_at: '2024-01-01T00:00:00+00:00',
    updated_at: '2024-01-15T00:00:00+00:00'
  },
  {
    id: 2,
    company_name: '123金融服務公司',
    registration_number: '87654321',
    industry: '金融業',
    company_size: '500-1000人',
    address: '台北市中正區重慶南路一段122號',
    primary_contact: {
      name: '王協理',
      position: '培訓協理',
      email: 'training@123finance.com',
      phone: '02-5678-1234'
    },
    contract_terms: {
      start_date: '2024-03-01',
      end_date: '2025-02-28',
      auto_renewal: false,
      payment_terms: 'NET_60',
      discount_rate: 20,
      minimum_commitment: 100
    },
    status: 'ACTIVE',
    created_at: '2024-03-01T00:00:00+00:00',
    updated_at: '2024-03-15T00:00:00+00:00'
  }
];

export const corporateSubscriptions: CorporateSubscription[] = [
  {
    id: 1,
    corporate_client_id: 1,
    plan_name: '企業標準方案',
    employee_limit: 100,
    course_access: [1, 2, 3, 4, 5],
    monthly_fee: 25000,
    setup_fee: 10000,
    status: 'ACTIVE',
    billing_cycle: 'MONTHLY',
    next_billing_date: '2024-02-01',
    created_at: '2024-01-01T00:00:00+00:00',
    updated_at: '2024-01-15T00:00:00+00:00'
  },
  {
    id: 2,
    corporate_client_id: 2,
    plan_name: '企業進階方案',
    employee_limit: 200,
    course_access: [1, 2, 3, 4, 5, 6],
    monthly_fee: 45000,
    setup_fee: 15000,
    status: 'ACTIVE',
    billing_cycle: 'QUARTERLY',
    next_billing_date: '2024-06-01',
    created_at: '2024-03-01T00:00:00+00:00',
    updated_at: '2024-03-15T00:00:00+00:00'
  }
];

export const corporateEmployees: CorporateEmployee[] = [
  {
    id: 1,
    user_id: 5,
    corporate_client_id: 1,
    employee_id: 'EMP001',
    department: '業務部',
    position: '業務專員',
    manager_email: 'manager@abc-tech.com',
    enrollment_date: '2024-01-15',
    status: 'ACTIVE',
    created_at: '2024-01-15T00:00:00+00:00',
    updated_at: '2024-01-15T00:00:00+00:00'
  },
  {
    id: 2,
    user_id: 6,
    corporate_client_id: 1,
    employee_id: 'EMP002',
    department: '研發部',
    position: '軟體工程師',
    manager_email: 'rd.manager@abc-tech.com',
    enrollment_date: '2024-01-20',
    status: 'ACTIVE',
    created_at: '2024-01-20T00:00:00+00:00',
    updated_at: '2024-01-20T00:00:00+00:00'
  }
];

// ========================================
// 輔助函數
// ========================================

// 根據ID獲取企業客戶
export const getCorporateClientById = (id: number): CorporateClient | undefined => {
  return corporateClients.find(client => client.id === id);
};

// 根據狀態獲取企業客戶
export const getCorporateClientsByStatus = (status: string): CorporateClient[] => {
  return corporateClients.filter(client => client.status === status);
};

// 根據企業ID獲取訂閱
export const getSubscriptionByClientId = (clientId: number): CorporateSubscription | undefined => {
  return corporateSubscriptions.find(sub => sub.corporate_client_id === clientId);
};

// 根據企業ID獲取員工
export const getEmployeesByClientId = (clientId: number): CorporateEmployee[] => {
  return corporateEmployees.filter(emp => emp.corporate_client_id === clientId);
};

// 根據用戶ID獲取企業員工資料
export const getCorporateEmployeeByUserId = (userId: number): CorporateEmployee | undefined => {
  return corporateEmployees.find(emp => emp.user_id === userId);
};

// 計算會員期間函數
export const calculateMembershipPeriod = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.ceil(diffDays / 30);
  
  return {
    days: diffDays,
    months: diffMonths,
    weeks: Math.ceil(diffDays / 7)
  };
};

// 額外的輔助函數
export const getCompanies = (): CorporateClient[] => {
  return corporateClients;
};

export const addCompany = (company: Omit<CorporateClient, 'id' | 'created_at' | 'updated_at'>): CorporateClient => {
  const newCompany: CorporateClient = {
    ...company,
    id: Math.max(...corporateClients.map(c => c.id), 0) + 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  corporateClients.push(newCompany);
  return newCompany;
};

export const updateCompany = (companyId: number, updates: Partial<CorporateClient>): boolean => {
  const companyIndex = corporateClients.findIndex(c => c.id === companyId);
  if (companyIndex === -1) return false;
  
  corporateClients[companyIndex] = {
    ...corporateClients[companyIndex],
    ...updates,
    updated_at: new Date().toISOString()
  };
  return true;
};

export const deleteCompany = (companyId: number): boolean => {
  const companyIndex = corporateClients.findIndex(c => c.id === companyId);
  if (companyIndex === -1) return false;
  
  corporateClients.splice(companyIndex, 1);
  return true;
};

export const getCompanyStatistics = () => {
  return {
    total: corporateClients.length,
    active: corporateClients.filter(c => c.status === 'ACTIVE').length,
    inactive: corporateClients.filter(c => c.status === 'INACTIVE').length,
    pending: corporateClients.filter(c => c.status === 'PENDING').length
  };
};

export const getCorporateUsersByCompany = (companyId: number): CorporateEmployee[] => {
  return getEmployeesByClientId(companyId);
};

// 向下相容的預設匯出
export { corporateClients as default };