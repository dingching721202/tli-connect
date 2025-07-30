import type { CorporateClient } from '@/types/business';

// ========================================
// 企業客戶資料 - MECE架構
// 獨立管理企業客戶資訊，與個人用戶分離
// ========================================

export const corporateClients: CorporateClient[] = [
  {
    id: 1,
    company_name: "台灣科技股份有限公司",
    company_name_en: "Taiwan Technology Co., Ltd.",
    registration_number: "12345678",
    tax_id: "12345678",
    industry: "科技業",
    company_size: "LARGE", // 500+ 員工
    address: "台北市信義區信義路五段7號",
    phone: "02-8101-8888",
    website: "https://www.taiwantech.com",
    description: "領先的科技解決方案提供商，專注於企業軟體開發與系統整合服務",
    contract_type: "ANNUAL",
    contract_start_date: "2025-01-01",
    contract_end_date: "2025-12-31",
    payment_terms: "NET_30",
    billing_contact: {
      name: "財務部 李小姐",
      email: "finance@taiwantech.com",
      phone: "02-8101-8899"
    },
    training_budget: 500000,
    currency: "TWD",
    status: "ACTIVE",
    notes: "重要客戶，年度合約，提供員工英語培訓服務",
    created_at: "2025-01-15T10:00:00+00:00",
    updated_at: "2025-07-20T00:00:00+00:00"
  },
  {
    id: 2,
    company_name: "創新金融科技有限公司",
    company_name_en: "Innovation FinTech Ltd.",
    registration_number: "87654321",
    tax_id: "87654321",
    industry: "金融科技",
    company_size: "MEDIUM", // 100-500 員工
    address: "台北市大安區敦化南路二段208號",
    phone: "02-2706-5555",
    website: "https://www.innovfintech.com",
    description: "專注於數位支付與區塊鏈技術的金融科技公司",
    contract_type: "QUARTERLY",
    contract_start_date: "2025-04-01",
    contract_end_date: "2025-12-31",
    payment_terms: "NET_15",
    billing_contact: {
      name: "管理部 王先生",
      email: "admin@innovfintech.com",
      phone: "02-2706-5566"
    },
    training_budget: 200000,
    currency: "TWD",
    status: "ACTIVE",
    notes: "季度合約，主要培訓需求為商務英語",
    created_at: "2025-03-20T14:30:00+00:00",
    updated_at: "2025-07-15T00:00:00+00:00"
  },
  {
    id: 3,
    company_name: "綠能環保工程股份有限公司",
    company_name_en: "Green Energy Environmental Engineering Co., Ltd.",
    registration_number: "11223344",
    tax_id: "11223344",
    industry: "環保工程",
    company_size: "SMALL", // 50-100 員工
    address: "桃園市中壢區中正路123號",
    phone: "03-4567890",
    website: "https://www.greenenergy.com.tw",
    description: "專業的環保工程與再生能源解決方案提供商",
    contract_type: "PROJECT_BASED",
    contract_start_date: "2025-06-01",
    contract_end_date: "2025-08-31",
    payment_terms: "NET_30",
    billing_contact: {
      name: "人資部 陳小姐",
      email: "hr@greenenergy.com.tw",
      phone: "03-4567891"
    },
    training_budget: 80000,
    currency: "TWD",
    status: "ACTIVE",
    notes: "專案型合約，針對國際業務團隊進行英語培訓",
    created_at: "2025-05-15T09:00:00+00:00",
    updated_at: "2025-07-10T00:00:00+00:00"
  },
  {
    id: 4,
    company_name: "國際貿易商行",
    company_name_en: "International Trading Company",
    registration_number: "55667788",
    tax_id: "55667788",
    industry: "國際貿易",
    company_size: "SMALL", // 20-50 員工
    address: "高雄市前鎮區中山二路88號",
    phone: "07-3334444",
    website: "https://www.intltrade.com.tw",
    description: "專營亞洲地區進出口貿易，主要商品為電子零件與紡織品",
    contract_type: "MONTHLY",
    contract_start_date: "2025-07-01",
    contract_end_date: "2025-09-30",
    payment_terms: "NET_15",
    billing_contact: {
      name: "總務 林先生",
      email: "admin@intltrade.com.tw",  
      phone: "07-3334455"
    },
    training_budget: 45000,
    currency: "TWD",
    status: "TRIAL",
    notes: "試用期間，評估培訓效果後決定是否續約",
    created_at: "2025-06-25T16:00:00+00:00",
    updated_at: "2025-07-25T00:00:00+00:00"
  },
  {
    id: 5,
    company_name: "醫療器材製造股份有限公司",
    company_name_en: "Medical Device Manufacturing Co., Ltd.",
    registration_number: "99887766",
    tax_id: "99887766",
    industry: "醫療器材",
    company_size: "MEDIUM", // 200-500 員工
    address: "新竹市東區光復路二段101號",
    phone: "03-5712345",
    website: "https://www.meddevice.com.tw",
    description: "專業醫療器材製造商，產品銷售至全球30多個國家",
    contract_type: "ANNUAL",
    contract_start_date: "2025-03-01",
    contract_end_date: "2026-02-28",
    payment_terms: "NET_30",
    billing_contact: {
      name: "財務部 黃經理",
      email: "finance@meddevice.com.tw",
      phone: "03-5712346"
    },
    training_budget: 300000,
    currency: "TWD",
    status: "SUSPENDED",
    notes: "因疫情影響暫停培訓，預計Q4恢復",
    created_at: "2025-02-10T11:30:00+00:00",
    updated_at: "2025-06-30T00:00:00+00:00"
  }
];

// ========================================
// 輔助函數
// ========================================

// 根據狀態獲取企業客戶
export const getCorporateClientsByStatus = (status: string): CorporateClient[] => {
  return corporateClients.filter(client => client.status === status);
};

// 根據企業規模獲取客戶
export const getCorporateClientsBySize = (size: string): CorporateClient[] => {
  return corporateClients.filter(client => client.company_size === size);
};

// 根據行業獲取企業客戶
export const getCorporateClientsByIndustry = (industry: string): CorporateClient[] => {
  return corporateClients.filter(client => client.industry === industry);
};

// 根據合約類型獲取企業客戶
export const getCorporateClientsByContractType = (contractType: string): CorporateClient[] => {
  return corporateClients.filter(client => client.contract_type === contractType);
};

// 根據ID獲取企業客戶
export const getCorporateClientById = (id: number): CorporateClient | undefined => {
  return corporateClients.find(client => client.id === id);
};

// 獲取有效的企業客戶
export const getActiveCorporateClients = (): CorporateClient[] => {
  return corporateClients.filter(client => client.status === 'ACTIVE');
};

// 檢查企業客戶是否有效
export const isActiveCorporateClient = (client: CorporateClient): boolean => {
  return client.status === 'ACTIVE';
};

// 檢查合約是否即將到期 (30天內)
export const isContractExpiringSoon = (client: CorporateClient): boolean => {
  if (!client.contract_end_date) return false;
  
  const now = new Date();
  const endDate = new Date(client.contract_end_date);
  const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
};

// 獲取即將到期的合約
export const getExpiringContracts = (): CorporateClient[] => {
  return corporateClients.filter(isContractExpiringSoon);
};

// 根據預算範圍獲取企業客戶
export const getCorporateClientsByBudgetRange = (minBudget: number, maxBudget: number): CorporateClient[] => {
  return corporateClients.filter(client => 
    client.training_budget >= minBudget && client.training_budget <= maxBudget
  );
};

// 搜尋企業客戶
export const searchCorporateClients = (keyword: string): CorporateClient[] => {
  const searchTerm = keyword.toLowerCase();
  return corporateClients.filter(client =>
    client.company_name.toLowerCase().includes(searchTerm) ||
    client.company_name_en?.toLowerCase().includes(searchTerm) ||
    client.industry.toLowerCase().includes(searchTerm) ||
    client.description.toLowerCase().includes(searchTerm)
  );
};

// 獲取企業規模統計
export const getCorporateClientSizeStats = () => {
  const stats = { SMALL: 0, MEDIUM: 0, LARGE: 0, ENTERPRISE: 0 };
  corporateClients.forEach(client => {
    if (stats.hasOwnProperty(client.company_size)) {
      stats[client.company_size as keyof typeof stats]++;
    }
  });
  return stats;
};

// 獲取行業分布統計
export const getCorporateClientIndustryStats = () => {
  const stats: Record<string, number> = {};
  corporateClients.forEach(client => {
    stats[client.industry] = (stats[client.industry] || 0) + 1;
  });
  return stats;
};

// 計算總培訓預算
export const getTotalTrainingBudget = (): number => {
  return corporateClients
    .filter(client => client.status === 'ACTIVE')
    .reduce((total, client) => total + client.training_budget, 0);
};

// 向下相容的預設匯出
export default corporateClients;