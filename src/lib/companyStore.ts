import { Company } from '@/data/corporateData';

class CompanyStore {
  private static instance: CompanyStore;
  private companies: Company[] = [];
  private readonly STORAGE_KEY = 'companies';
  private isServerSide = typeof window === 'undefined';

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): CompanyStore {
    if (!CompanyStore.instance) {
      CompanyStore.instance = new CompanyStore();
    }
    return CompanyStore.instance;
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') {
      // 在服務器端使用預設數據
      this.companies = this.getDefaultCompanies();
      return;
    }

    try {
      const storedCompanies = localStorage.getItem(this.STORAGE_KEY);
      if (storedCompanies) {
        this.companies = JSON.parse(storedCompanies);
      } else {
        // 初次載入使用預設數據
        this.companies = this.getDefaultCompanies();
        this.saveToStorage();
      }
      console.log('📦 企業數據載入完成:', this.companies.length, '家企業');
    } catch (error) {
      console.error('❌ 載入企業數據失敗:', error);
      this.companies = this.getDefaultCompanies();
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.companies));
    } catch (error) {
      console.error('❌ 保存企業數據失敗:', error);
    }
  }

  private getDefaultCompanies(): Company[] {
    return [
      {
        id: 'corp_001',
        name: '台積電股份有限公司',
        contactName: '張經理',
        contactEmail: 'manager.zhang@tsmc.com',
        contactPhone: '+886-3-568-2301',
        address: '台灣新竹市力行路8號',
        industry: '科技業',
        employeeCount: '1000人以上',
        status: 'activated',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'corp_002',
        name: '富邦金融控股股份有限公司',
        contactName: '李主管',
        contactEmail: 'supervisor.li@fubon.com',
        contactPhone: '+886-2-8771-6699',
        address: '台北市松山區敦化南路一段108號',
        industry: '金融服務',
        employeeCount: '500-1000人',
        status: 'activated',
        createdAt: '2024-03-01T00:00:00Z'
      },
      {
        id: 'corp_003',
        name: '中華電信股份有限公司',
        contactName: '王協理',
        contactEmail: 'director.wang@cht.com.tw',
        contactPhone: '+886-2-2344-3488',
        address: '台北市中正區信義路一段21-3號',
        industry: '電信業',
        employeeCount: '1000人以上',
        status: 'activated',
        createdAt: '2024-07-01T00:00:00Z'
      }
    ];
  }

  // ===== CRUD Operations =====

  // 獲取所有企業
  async getAllCompanies(): Promise<Company[]> {
    return [...this.companies];
  }

  // 根據ID獲取企業
  async getCompanyById(id: string | number): Promise<Company | null> {
    return this.companies.find(company => company.id === id) || null;
  }

  // 根據狀態獲取企業
  async getCompaniesByStatus(status: Company['status']): Promise<Company[]> {
    return this.companies.filter(company => company.status === status);
  }

  // 創建企業
  async createCompany(companyData: Omit<Company, 'id' | 'createdAt'>): Promise<Company> {
    const newId = `corp_${Date.now()}`;
    const now = new Date().toISOString();

    const newCompany: Company = {
      ...companyData,
      id: newId,
      createdAt: now
    };

    this.companies.push(newCompany);
    this.saveToStorage();

    console.log('✅ 企業創建成功:', newCompany);
    return newCompany;
  }

  // 更新企業
  async updateCompany(id: string | number, updates: Partial<Company>): Promise<Company | null> {
    const companyIndex = this.companies.findIndex(company => company.id === id);
    if (companyIndex === -1) {
      throw new Error('找不到指定的企業');
    }

    this.companies[companyIndex] = {
      ...this.companies[companyIndex],
      ...updates
    };

    this.saveToStorage();
    console.log('✅ 企業更新成功:', this.companies[companyIndex]);
    return this.companies[companyIndex];
  }

  // 刪除企業
  async deleteCompany(id: string | number): Promise<boolean> {
    const companyIndex = this.companies.findIndex(company => company.id === id);
    if (companyIndex === -1) {
      throw new Error('找不到指定的企業');
    }

    const deletedCompany = this.companies[companyIndex];
    this.companies.splice(companyIndex, 1);
    this.saveToStorage();

    console.log('✅ 企業刪除成功:', deletedCompany);
    return true;
  }

  // ===== 統計功能 =====

  // 獲取企業統計
  async getCompanyStatistics() {
    const total = this.companies.length;
    const active = this.companies.filter(c => c.status === 'activated').length;
    const suspended = this.companies.filter(c => c.status === 'suspended').length;
    const expired = this.companies.filter(c => c.status === 'expired').length;
    const nonMember = this.companies.filter(c => c.status === 'non_member').length;
    const test = this.companies.filter(c => c.status === 'test').length;

    // 行業分布
    const industryBreakdown = this.companies.reduce((acc, company) => {
      acc[company.industry] = (acc[company.industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 員工數分布
    const employeeBreakdown = this.companies.reduce((acc, company) => {
      acc[company.employeeCount] = (acc[company.employeeCount] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      suspended,
      expired,
      nonMember,
      test,
      industryBreakdown,
      employeeBreakdown
    };
  }

  // 搜尋企業
  async searchCompanies(searchTerm: string): Promise<Company[]> {
    if (!searchTerm.trim()) {
      return this.getAllCompanies();
    }

    const term = searchTerm.toLowerCase();
    return this.companies.filter(company => 
      company.name.toLowerCase().includes(term) ||
      company.contactName.toLowerCase().includes(term) ||
      company.contactEmail.toLowerCase().includes(term) ||
      company.industry.toLowerCase().includes(term)
    );
  }
}

export const companyStore = CompanyStore.getInstance();