export interface CorporateClient {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  industry: string;
  employeeCount: string;
  contractStartDate: string;
  contractEndDate: string;
  packageType: string;
  monthlyFee: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string | number;
  name: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address?: string;
  industry: string;
  employeeCount: string;
  status: 'active' | 'inactive' | 'expired';
  createdAt: string;
  membershipPlans?: MembershipPlan[];
  startDate?: string;
  endDate?: string;
}

export interface MembershipPlan {
  id: string | number;
  name: string;
  price?: number;
  duration: number;
  type?: 'individual' | 'corporate' | 'addon' | 'enterprise' | 'primary';
  features?: string[];
  published?: boolean;
  category?: string;
  popular?: boolean;
  status?: 'draft' | 'published' | 'active' | 'inactive' | 'expiring_soon';
  durationType?: 'annual' | 'monthly' | 'quarterly';
  purchaseDate?: string;
  startDate?: string;
  endDate?: string;
  slots?: number;
  basePrice?: number;
  discountRate?: number;
  finalPrice?: number;
}

export interface CorporatePackage {
  id: string;
  name: string;
  description: string;
  maxUsers: number;
  monthlyPricePerUser: number;
  features: string[];
  isActive: boolean;
}

// Mock corporate clients data
const corporateClients: CorporateClient[] = [
  {
    id: 'corp_001',
    companyName: '台積電股份有限公司',
    contactName: '張經理',
    contactEmail: 'manager.zhang@tsmc.com',
    contactPhone: '+886-3-568-2301',
    industry: '科技業',
    employeeCount: '1000人以上',
    contractStartDate: '2024-01-01',
    contractEndDate: '2024-12-31',
    packageType: 'Enterprise',
    monthlyFee: 150000,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-07-20T00:00:00Z'
  },
  {
    id: 'corp_002',
    companyName: '富邦金融控股股份有限公司',
    contactName: '李主管',
    contactEmail: 'supervisor.li@fubon.com',
    contactPhone: '+886-2-8771-6699',
    industry: '金融服務',
    employeeCount: '500-1000人',
    contractStartDate: '2024-03-01',
    contractEndDate: '2025-02-28',
    packageType: 'Professional',
    monthlyFee: 80000,
    status: 'active',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-07-20T00:00:00Z'
  }
];

// Mock corporate packages data
const corporatePackages: CorporatePackage[] = [
  {
    id: 'pkg_basic',
    name: '基礎企業方案',
    description: '適合小型企業的基礎培訓方案',
    maxUsers: 50,
    monthlyPricePerUser: 500,
    features: [
      '基礎課程內容',
      '學習進度追蹤',
      '基本報表功能',
      'Email 客服支援'
    ],
    isActive: true
  },
  {
    id: 'pkg_professional',
    name: '專業企業方案',
    description: '適合中型企業的專業培訓方案',
    maxUsers: 200,
    monthlyPricePerUser: 400,
    features: [
      '完整課程內容',
      '詳細學習分析',
      '客製化報表',
      '專屬客服經理',
      '線上直播課程'
    ],
    isActive: true
  },
  {
    id: 'pkg_enterprise',
    name: '企業旗艦方案',
    description: '適合大型企業的全方位培訓方案',
    maxUsers: -1, // unlimited
    monthlyPricePerUser: 300,
    features: [
      '全部課程內容',
      'AI 學習推薦',
      '高級分析儀表板',
      '24小時專屬支援',
      '客製化課程開發',
      'API 整合服務',
      '多語言支援'
    ],
    isActive: true
  }
];

// Get all corporate clients
export function getAllCorporateClients(): CorporateClient[] {
  return corporateClients;
}

// Get corporate client by ID
export function getCorporateClientById(id: string): CorporateClient | null {
  return corporateClients.find(client => client.id === id) || null;
}

// Get active corporate clients
export function getActiveCorporateClients(): CorporateClient[] {
  return corporateClients.filter(client => client.status === 'active');
}

// Get corporate clients by industry
export function getCorporateClientsByIndustry(industry: string): CorporateClient[] {
  return corporateClients.filter(client => client.industry === industry);
}

// Get all corporate packages
export function getAllCorporatePackages(): CorporatePackage[] {
  return corporatePackages.filter(pkg => pkg.isActive);
}

// Get corporate package by ID
export function getCorporatePackageById(id: string): CorporatePackage | null {
  return corporatePackages.find(pkg => pkg.id === id) || null;
}

// Create a new corporate client
export function createCorporateClient(clientData: Omit<CorporateClient, 'id' | 'createdAt' | 'updatedAt'>): CorporateClient {
  const newClient: CorporateClient = {
    ...clientData,
    id: `corp_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  corporateClients.push(newClient);
  return newClient;
}

// Update corporate client
export function updateCorporateClient(id: string, updates: Partial<CorporateClient>): CorporateClient | null {
  const clientIndex = corporateClients.findIndex(client => client.id === id);
  
  if (clientIndex === -1) {
    return null;
  }
  
  corporateClients[clientIndex] = {
    ...corporateClients[clientIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  return corporateClients[clientIndex];
}

// Delete corporate client
export function deleteCorporateClient(id: string): boolean {
  const clientIndex = corporateClients.findIndex(client => client.id === id);
  
  if (clientIndex === -1) {
    return false;
  }
  
  corporateClients.splice(clientIndex, 1);
  return true;
}

// Calculate total monthly revenue
export function calculateTotalMonthlyRevenue(): number {
  return corporateClients
    .filter(client => client.status === 'active')
    .reduce((total, client) => total + client.monthlyFee, 0);
}

// Get corporate statistics
export function getCorporateStatistics() {
  const totalClients = corporateClients.length;
  const activeClients = corporateClients.filter(client => client.status === 'active').length;
  const totalRevenue = calculateTotalMonthlyRevenue();
  
  // Industry breakdown
  const industryBreakdown = corporateClients.reduce((acc, client) => {
    acc[client.industry] = (acc[client.industry] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalClients,
    activeClients,
    inactiveClients: totalClients - activeClients,
    totalRevenue,
    industryBreakdown
  };
}

// Additional functions required by UserManagement component
export function getCompanies(): Company[] {
  return corporateClients.map(client => ({
    id: client.id,
    name: client.companyName,
    contactName: client.contactName,
    contactEmail: client.contactEmail,
    contactPhone: client.contactPhone,
    address: '', // Default value since not in CorporateClient
    industry: client.industry,
    employeeCount: client.employeeCount,
    status: client.status === 'active' ? 'active' : client.status === 'suspended' ? 'inactive' : 'inactive',
    createdAt: client.createdAt,
    membershipPlans: [] // 添加空數組作為預設值
  }));
}

export function getCompanyStatistics() {
  return getCorporateStatistics();
}

export function getCorporateUsersByCompany() {
  // Mock data - in real app would fetch from database
  return [];
}

export function getCorporateUsersByPlan() {
  // Mock data - in real app would fetch from database
  return [];
}

export function addCompany(companyData: Omit<Company, 'id' | 'createdAt'>): Company {
  const newCompany: Company = {
    ...companyData,
    id: `company_${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  
  // Would save to database in real app
  return newCompany;
}

export function updateCompany(id: string, updates: Partial<Company>): Company | null {
  // Mock implementation - would update in database
  const company = getCompanies().find(c => c.id === id);
  if (!company) return null;
  
  return {
    ...company,
    ...updates
  };
}

export function deleteCompany(): boolean {
  // Mock implementation - would delete from database
  return true;
}

// Additional function for corporate management
export function calculateMembershipPeriod(startDate: string, durationMonths: number): { endDate: string; daysRemaining: number } {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setMonth(end.getMonth() + durationMonths);
  
  const now = new Date();
  const daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  
  return {
    endDate: end.toISOString().split('T')[0],
    daysRemaining
  };
}