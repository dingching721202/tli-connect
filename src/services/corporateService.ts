import type { 
  CorporateClient, 
  CorporateEmployee, 
  CorporateSubscription, 
  CorporateInquiry,
  User
} from '@/types/business';
import { 
  corporateClients, 
  corporateEmployees, 
  corporateSubscriptions,
  getCorporateClientById,
  getEmployeesByClientId,
  getSubscriptionByClientId
} from '@/data/corporateData';
import { 
  corporateInquiries,
  getCorporateInquiryById,
  updateCorporateInquiry
} from '@/data/corporateInquiry';
import { getUserById, createUser } from '@/data/users';

// ========================================
// 企業客戶管理服務 - Phase 2.4
// 實現完整的企業客戶管理系統
// ========================================

export interface CorporateClientResult {
  success: boolean;
  message: string;
  client?: CorporateClient;
}

export interface CorporateEmployeeResult {
  success: boolean;
  message: string;
  employee?: CorporateEmployee;
  user?: User;
}

export interface CorporateSubscriptionResult {
  success: boolean;
  message: string;
  subscription?: CorporateSubscription;
}

export interface CorporateInquiryResult {
  success: boolean;
  message: string;
  inquiry?: CorporateInquiry;
}

export interface CorporateStats {
  total_clients: number;
  active_clients: number;
  inactive_clients: number;
  pending_clients: number;
  total_employees: number;
  active_subscriptions: number;
  total_inquiries: number;
  pending_inquiries: number;
  monthly_revenue: number;
}

export interface EnrollmentResult {
  success: boolean;
  message: string;
  enrolled_employees: CorporateEmployee[];
  failed_enrollments: { user_id: number; reason: string; }[];
}

// ========================================
// 企業客戶管理
// ========================================

/**
 * 創建新的企業客戶
 * @param clientData 企業客戶資料
 * @returns 創建結果
 */
export const createCorporateClient = (
  clientData: Omit<CorporateClient, 'id' | 'created_at' | 'updated_at'>
): CorporateClientResult => {
  try {
    // 檢查是否已存在相同統編的企業
    const existingClient = corporateClients.find(
      client => client.registration_number === clientData.registration_number
    );
    
    if (existingClient) {
      return {
        success: false,
        message: '該統一編號的企業已存在'
      };
    }
    
    const now = new Date();
    const newClient: CorporateClient = {
      ...clientData,
      id: Math.max(...corporateClients.map(c => c.id), 0) + 1,
      status: 'PENDING', // 新企業預設為待審核狀態
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };
    
    corporateClients.push(newClient);
    
    return {
      success: true,
      message: '企業客戶創建成功',
      client: newClient
    };
  } catch (error) {
    return {
      success: false,
      message: '企業客戶創建失敗'
    };
  }
};

/**
 * 更新企業客戶資料
 * @param clientId 企業客戶ID
 * @param updates 更新資料
 * @returns 更新結果
 */
export const updateCorporateClient = (
  clientId: number,
  updates: Partial<CorporateClient>
): CorporateClientResult => {
  try {
    const clientIndex = corporateClients.findIndex(c => c.id === clientId);
    
    if (clientIndex === -1) {
      return {
        success: false,
        message: '企業客戶不存在'
      };
    }
    
    const updatedClient = {
      ...corporateClients[clientIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    corporateClients[clientIndex] = updatedClient;
    
    return {
      success: true,
      message: '企業客戶資料更新成功',
      client: updatedClient
    };
  } catch (error) {
    return {
      success: false,
      message: '企業客戶資料更新失敗'
    };
  }
};

/**
 * 啟用企業客戶
 * @param clientId 企業客戶ID
 * @returns 啟用結果
 */
export const activateCorporateClient = (clientId: number): CorporateClientResult => {
  return updateCorporateClient(clientId, { status: 'ACTIVE' });
};

/**
 * 停用企業客戶
 * @param clientId 企業客戶ID
 * @param reason 停用原因
 * @returns 停用結果
 */
export const deactivateCorporateClient = (
  clientId: number, 
  reason?: string
): CorporateClientResult => {
  const result = updateCorporateClient(clientId, { status: 'INACTIVE' });
  
  if (result.success) {
    // 同時停用該企業的所有員工
    const employees = getEmployeesByClientId(clientId);
    employees.forEach(employee => {
      const user = getUserById(employee.user_id);
      if (user) {
        user.status = 'SUSPENDED';
        user.updated_at = new Date().toISOString();
      }
    });
    
    result.message = `企業客戶已停用${reason ? `，原因：${reason}` : ''}`;
  }
  
  return result;
};

// ========================================
// 企業員工管理
// ========================================

/**
 * 新增企業員工
 * @param clientId 企業客戶ID
 * @param userData 用戶資料
 * @param employeeData 員工資料
 * @returns 新增結果
 */
export const addCorporateEmployee = (
  clientId: number,
  userData: Omit<User, 'id' | 'role' | 'created_at' | 'updated_at'>,
  employeeData: Omit<CorporateEmployee, 'id' | 'user_id' | 'corporate_client_id' | 'created_at' | 'updated_at'>
): CorporateEmployeeResult => {
  try {
    const client = getCorporateClientById(clientId);
    if (!client) {
      return {
        success: false,
        message: '企業客戶不存在'
      };
    }
    
    if (client.status !== 'ACTIVE') {
      return {
        success: false,
        message: '企業客戶未啟用，無法新增員工'
      };
    }
    
    // 檢查員工編號是否重複
    const existingEmployee = corporateEmployees.find(
      emp => emp.corporate_client_id === clientId && emp.employee_id === employeeData.employee_id
    );
    
    if (existingEmployee) {
      return {
        success: false,
        message: '員工編號已存在'
      };
    }
    
    // 創建用戶帳號
    const newUser = createUser({
      ...userData,
      role: 'STUDENT', // 企業員工預設為學生角色
      status: 'ACTIVE'
    });
    
    // 創建企業員工記錄
    const now = new Date();
    const newEmployee: CorporateEmployee = {
      ...employeeData,
      id: Math.max(...corporateEmployees.map(e => e.id), 0) + 1,
      user_id: newUser.id,
      corporate_client_id: clientId,
      status: 'ACTIVE',
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };
    
    corporateEmployees.push(newEmployee);
    
    return {
      success: true,
      message: '企業員工新增成功',
      employee: newEmployee,
      user: newUser
    };
  } catch (error) {
    return {
      success: false,
      message: '企業員工新增失敗'
    };
  }
};

/**
 * 批次新增企業員工
 * @param clientId 企業客戶ID
 * @param employeesData 員工資料列表
 * @returns 批次新增結果
 */
export const batchAddCorporateEmployees = (
  clientId: number,
  employeesData: Array<{
    userData: Omit<User, 'id' | 'role' | 'created_at' | 'updated_at'>;
    employeeData: Omit<CorporateEmployee, 'id' | 'user_id' | 'corporate_client_id' | 'created_at' | 'updated_at'>;
  }>
): EnrollmentResult => {
  const results: EnrollmentResult = {
    success: false,
    message: '',
    enrolled_employees: [],
    failed_enrollments: []
  };
  
  for (const { userData, employeeData } of employeesData) {
    const result = addCorporateEmployee(clientId, userData, employeeData);
    
    if (result.success && result.employee) {
      results.enrolled_employees.push(result.employee);
    } else {
      results.failed_enrollments.push({
        user_id: 0, // 用戶尚未創建
        reason: result.message
      });
    }
  }
  
  results.success = results.enrolled_employees.length > 0;
  
  if (results.enrolled_employees.length === employeesData.length) {
    results.message = '所有員工新增成功';
  } else if (results.enrolled_employees.length > 0) {
    results.message = `部分員工新增成功：${results.enrolled_employees.length}/${employeesData.length}`;
  } else {
    results.message = '所有員工新增失敗';
  }
  
  return results;
};

/**
 * 停用企業員工
 * @param employeeId 員工ID
 * @param reason 停用原因
 * @returns 停用結果
 */
export const deactivateCorporateEmployee = (
  employeeId: number,
  reason?: string
): CorporateEmployeeResult => {
  try {
    const employeeIndex = corporateEmployees.findIndex(e => e.id === employeeId);
    
    if (employeeIndex === -1) {
      return {
        success: false,
        message: '企業員工不存在'
      };
    }
    
    const employee = corporateEmployees[employeeIndex];
    employee.status = 'INACTIVE';
    employee.updated_at = new Date().toISOString();
    
    // 同時停用用戶帳號
    const user = getUserById(employee.user_id);
    if (user) {
      user.status = 'SUSPENDED';
      user.updated_at = new Date().toISOString();
    }
    
    return {
      success: true,
      message: `企業員工已停用${reason ? `，原因：${reason}` : ''}`,
      employee,
      user
    };
  } catch (error) {
    return {
      success: false,
      message: '企業員工停用失敗'
    };
  }
};

// ========================================
// 企業訂閱管理
// ========================================

/**
 * 創建企業訂閱
 * @param subscriptionData 訂閱資料
 * @returns 創建結果
 */
export const createCorporateSubscription = (
  subscriptionData: Omit<CorporateSubscription, 'id' | 'created_at' | 'updated_at'>
): CorporateSubscriptionResult => {
  try {
    const client = getCorporateClientById(subscriptionData.corporate_client_id);
    if (!client) {
      return {
        success: false,
        message: '企業客戶不存在'
      };
    }
    
    // 檢查是否已有有效訂閱
    const existingSubscription = getSubscriptionByClientId(subscriptionData.corporate_client_id);
    if (existingSubscription && existingSubscription.status === 'ACTIVE') {
      return {
        success: false,
        message: '該企業已有有效訂閱'
      };
    }
    
    const now = new Date();
    const newSubscription: CorporateSubscription = {
      ...subscriptionData,
      id: Math.max(...corporateSubscriptions.map(s => s.id), 0) + 1,
      status: 'ACTIVE',
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };
    
    corporateSubscriptions.push(newSubscription);
    
    return {
      success: true,
      message: '企業訂閱創建成功',
      subscription: newSubscription
    };
  } catch (error) {
    return {
      success: false,
      message: '企業訂閱創建失敗'
    };
  }
};

/**
 * 更新企業訂閱
 * @param subscriptionId 訂閱ID
 * @param updates 更新資料
 * @returns 更新結果
 */
export const updateCorporateSubscription = (
  subscriptionId: number,
  updates: Partial<CorporateSubscription>
): CorporateSubscriptionResult => {
  try {
    const subscriptionIndex = corporateSubscriptions.findIndex(s => s.id === subscriptionId);
    
    if (subscriptionIndex === -1) {
      return {
        success: false,
        message: '企業訂閱不存在'
      };
    }
    
    const updatedSubscription = {
      ...corporateSubscriptions[subscriptionIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    corporateSubscriptions[subscriptionIndex] = updatedSubscription;
    
    return {
      success: true,
      message: '企業訂閱更新成功',
      subscription: updatedSubscription
    };
  } catch (error) {
    return {
      success: false,
      message: '企業訂閱更新失敗'
    };
  }
};

// ========================================
// 企業詢問管理
// ========================================

/**
 * 處理企業詢問
 * @param inquiryId 詢問ID
 * @param status 新狀態
 * @param notes 處理備註
 * @returns 處理結果
 */
export const processCorporateInquiry = (
  inquiryId: number,
  status: CorporateInquiry['status'],
  notes?: string
): CorporateInquiryResult => {
  try {
    const inquiry = getCorporateInquiryById(inquiryId);
    if (!inquiry) {
      return {
        success: false,
        message: '企業詢問不存在'
      };
    }
    
    const success = updateCorporateInquiry(inquiryId, {
      status,
      notes: notes || inquiry.notes
    });
    
    if (success) {
      return {
        success: true,
        message: '企業詢問處理成功',
        inquiry: getCorporateInquiryById(inquiryId)
      };
    } else {
      return {
        success: false,
        message: '企業詢問處理失敗'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: '企業詢問處理失敗'
    };
  }
};

/**
 * 將詢問轉換為正式客戶
 * @param inquiryId 詢問ID
 * @returns 轉換結果
 */
export const convertInquiryToClient = (inquiryId: number): CorporateClientResult => {
  try {
    const inquiry = getCorporateInquiryById(inquiryId);
    if (!inquiry) {
      return {
        success: false,
        message: '企業詢問不存在'
      };
    }
    
    if (inquiry.status !== 'QUOTED') {
      return {
        success: false,
        message: '只有已報價的詢問可以轉換為客戶'
      };
    }
    
    // 創建企業客戶
    const clientData: Omit<CorporateClient, 'id' | 'created_at' | 'updated_at'> = {
      company_name: inquiry.company_name,
      registration_number: `REG${Date.now()}`, // 暫時生成註冊號
      industry: inquiry.industry,
      company_size: inquiry.company_size,
      address: '待填寫', // 需要後續完善
      primary_contact: {
        name: inquiry.contact_person,
        email: inquiry.contact_email,
        phone: inquiry.contact_phone,
        position: '聯絡人',
        department: '待填寫'
      },
      contract_terms: {
        start_date: new Date().toISOString().split('T')[0],
        end_date: (() => {
          const endDate = new Date();
          endDate.setFullYear(endDate.getFullYear() + 1);
          return endDate.toISOString().split('T')[0];
        })(),
        auto_renewal: true,
        payment_terms: 'NET_30',
        discount_rate: 10,
        minimum_commitment: 10
      },
      status: 'PENDING'
    };
    
    const clientResult = createCorporateClient(clientData);
    
    if (clientResult.success) {
      // 更新詢問狀態
      processCorporateInquiry(inquiryId, 'CONVERTED', '已轉換為正式客戶');
    }
    
    return clientResult;
  } catch (error) {
    return {
      success: false,
      message: '詢問轉換失敗'
    };
  }
};

// ========================================
// 統計報表功能
// ========================================

/**
 * 獲取企業客戶統計資料
 * @returns 統計資料
 */
export const getCorporateStatistics = (): CorporateStats => {
  const clients = corporateClients;
  const employees = corporateEmployees;
  const subscriptions = corporateSubscriptions;
  const inquiries = corporateInquiries;
  
  // 計算月收入
  const activeSubscriptions = subscriptions.filter(s => s.status === 'ACTIVE');
  const monthlyRevenue = activeSubscriptions.reduce((total, sub) => {
    return total + (sub.billing_cycle === 'MONTHLY' ? sub.monthly_fee : sub.monthly_fee / 3);
  }, 0);
  
  return {
    total_clients: clients.length,
    active_clients: clients.filter(c => c.status === 'ACTIVE').length,
    inactive_clients: clients.filter(c => c.status === 'INACTIVE').length,
    pending_clients: clients.filter(c => c.status === 'PENDING').length,
    total_employees: employees.length,
    active_subscriptions: activeSubscriptions.length,
    total_inquiries: inquiries.length,
    pending_inquiries: inquiries.filter(i => i.status === 'NEW' || i.status === 'CONTACTED').length,
    monthly_revenue: monthlyRevenue
  };
};

/**
 * 獲取企業客戶詳細報表
 * @param clientId 企業客戶ID
 * @returns 詳細報表
 */
export const getCorporateClientReport = (clientId: number) => {
  const client = getCorporateClientById(clientId);
  if (!client) return null;
  
  const employees = getEmployeesByClientId(clientId);
  const subscription = getSubscriptionByClientId(clientId);
  
  // 計算員工使用統計
  const activeEmployees = employees.filter(e => e.status === 'ACTIVE').length;
  const totalEmployees = employees.length;
  
  return {
    client,
    subscription,
    employee_stats: {
      total: totalEmployees,
      active: activeEmployees,
      inactive: totalEmployees - activeEmployees,
      utilization_rate: subscription ? (activeEmployees / subscription.employee_limit) * 100 : 0
    },
    contract_info: client.contract_terms,
    last_updated: client.updated_at
  };
};

// ========================================
// 預設匯出
// ========================================

const corporateServiceModule = {
  createCorporateClient,
  updateCorporateClient,
  activateCorporateClient,
  deactivateCorporateClient,
  addCorporateEmployee,
  batchAddCorporateEmployees,
  deactivateCorporateEmployee,
  createCorporateSubscription,
  updateCorporateSubscription,
  processCorporateInquiry,
  convertInquiryToClient,
  getCorporateStatistics,
  getCorporateClientReport
};

export default corporateServiceModule;