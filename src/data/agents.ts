export interface Agent {
  id: number;
  user_id: number; // 關聯到 users 表
  agent_code: string; // 代理代碼
  agent_type: 'AGENT' | 'CONSULTANT' | 'TEACHER_AGENT' | 'STUDENT_AGENT';
  commission_rate: number; // 分紅比例 (百分比)
  referral_link: string; // 推廣連結
  is_company: boolean; // 是否為企業代理
  company_name?: string; // 公司名稱 (如果是企業代理)
  contact_person?: string; // 聯絡人 (如果是企業代理)
  tax_id?: string; // 統一編號 (如果是企業代理)
  bank_account?: string; // 銀行帳號
  address?: string; // 地址
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'; // 狀態
  total_sales: number; // 總銷售額
  total_commission: number; // 總分紅
  sales_count: number; // 銷售筆數
  last_sale_date?: string; // 最後銷售日期
  notes?: string; // 備註
  created_at: string;
  updated_at: string;
}

export const agents: Agent[] = [
  {
    id: 1,
    user_id: 9, // 將創建一個新的 user
    agent_code: 'AGT001',
    agent_type: 'AGENT',
    commission_rate: 15,
    referral_link: 'https://tli-connect.com/membership?ref=AGT001',
    is_company: false,
    bank_account: '123-456-789012',
    address: '台北市大安區信義路四段1號',
    status: 'ACTIVE',
    total_sales: 156800,
    total_commission: 23520,
    sales_count: 12,
    last_sale_date: '2025-01-18',
    notes: '表現優異的代理',
    created_at: '2024-01-15T00:00:00+00:00',
    updated_at: '2025-01-20T00:00:00+00:00'
  },
  {
    id: 2,
    user_id: 10,
    agent_code: 'CON001',
    agent_type: 'CONSULTANT',
    commission_rate: 8,
    referral_link: 'https://tli-connect.com/membership?ref=CON001',
    is_company: false,
    bank_account: '987-654-321098',
    address: '台北市信義區松仁路100號',
    status: 'ACTIVE',
    total_sales: 298400,
    total_commission: 23872,
    sales_count: 18,
    last_sale_date: '2025-01-19',
    notes: '業務能力強，客戶關係良好',
    created_at: '2024-02-01T00:00:00+00:00',
    updated_at: '2025-01-20T00:00:00+00:00'
  },
  {
    id: 3,
    user_id: 11,
    agent_code: 'AGT002',
    agent_type: 'AGENT',
    commission_rate: 10,
    referral_link: 'https://tli-connect.com/membership?ref=AGT002',
    is_company: true,
    company_name: '創新科技有限公司',
    contact_person: '李經理',
    tax_id: '12345678',
    bank_account: '555-666-777888',
    address: '新北市板橋區文化路二段100號',
    status: 'ACTIVE',
    total_sales: 67200,
    total_commission: 6720,
    sales_count: 5,
    last_sale_date: '2025-01-16',
    notes: '企業代理，主要推廣企業課程',
    created_at: '2024-03-10T00:00:00+00:00',
    updated_at: '2025-01-20T00:00:00+00:00'
  },
  {
    id: 4,
    user_id: 12,
    agent_code: 'TCH001',
    agent_type: 'TEACHER_AGENT',
    commission_rate: 12,
    referral_link: 'https://tli-connect.com/membership?ref=TCH001',
    is_company: false,
    bank_account: '345-678-901234',
    address: '台北市中山區南京東路三段219號',
    status: 'ACTIVE',
    total_sales: 120000,
    total_commission: 14400,
    sales_count: 8,
    last_sale_date: '2024-12-10',
    notes: '教學經驗豐富，學生推薦成功',
    created_at: '2024-03-01T00:00:00+00:00',
    updated_at: '2025-01-20T00:00:00+00:00'
  },
  {
    id: 5,
    user_id: 13,
    agent_code: 'STU001',
    agent_type: 'STUDENT_AGENT',
    commission_rate: 8,
    referral_link: 'https://tli-connect.com/membership?ref=STU001',
    is_company: false,
    bank_account: '456-789-012345',
    address: '台北市文山區木柵路四段159號',
    status: 'ACTIVE',
    total_sales: 54000,
    total_commission: 4320,
    sales_count: 3,
    last_sale_date: '2024-12-05',
    notes: '積極推薦同學，表現優秀',
    created_at: '2024-06-01T00:00:00+00:00',
    updated_at: '2025-01-20T00:00:00+00:00'
  }
];

export default agents;