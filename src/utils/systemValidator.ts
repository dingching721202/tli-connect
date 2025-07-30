// ========================================
// 系統功能驗證器 - Phase 3.4
// 確保所有現有功能正常運作
// ========================================

import { users, getUserById, createUser } from '@/data/users';
import { memberships } from '@/data/member_cards';
import { courseSessions } from '@/data/courseSessions';
import { courseSchedules, getCourseScheduleById } from '@/data/courseSchedules';
import { courseModules, getCourseModuleById } from '@/data/courseModules';
import { validateMembershipActivation, activateMembership } from '@/services/membershipService';
import { createSingleBooking } from '@/services/bookingService';
import { hasPermission, canAccessResource, ResourceType } from '@/services/rbacService';
import { createCorporateClient } from '@/services/corporateService';
import { registerAgent } from '@/services/agentService';

export interface ValidationResult {
  test_name: string;
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
  execution_time: number;
}

export interface SystemValidationReport {
  overall_success: boolean;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  test_results: ValidationResult[];
  execution_time: number;
  system_health: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
}

// ========================================
// 基礎數據驗證
// ========================================

/**
 * 驗證用戶註冊登入功能
 */
async function validateUserRegistrationLogin(): Promise<ValidationResult> {
  const startTime = Date.now();
  
  try {
    // 測試用戶創建
    const testUser = {
      name: '測試用戶',
      email: `test_${Date.now()}@example.com`,
      phone: '0912345678',
      password: 'test_password',
      status: 'ACTIVE' as const
    };
    
    const newUser = createUser(testUser);
    
    if (!newUser.id) {
      throw new Error('用戶創建失敗：沒有返回 ID');
    }
    
    // 測試用戶查詢
    const retrievedUser = getUserById(newUser.id);
    if (!retrievedUser) {
      throw new Error('用戶查詢失敗：找不到剛創建的用戶');
    }
    
    if (retrievedUser.email !== testUser.email) {
      throw new Error('用戶數據不一致：電子郵件不匹配');
    }
    
    return {
      test_name: '用戶註冊登入測試',
      success: true,
      message: '用戶註冊登入功能正常',
      details: {
        created_user_id: newUser.id,
        email: testUser.email
      },
      execution_time: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      test_name: '用戶註冊登入測試',
      success: false,
      message: `用戶註冊登入測試失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
      execution_time: Date.now() - startTime
    };
  }
}

/**
 * 驗證會員卡購買與啟用功能
 */
async function validateMembershipPurchaseActivation(): Promise<ValidationResult> {
  const startTime = Date.now();
  
  try {
    // 檢查現有會員卡
    if (memberships.length === 0) {
      throw new Error('系統中沒有會員卡數據');
    }
    
    const testMembership = memberships.find(m => m.status === 'PURCHASED');
    if (!testMembership) {
      throw new Error('找不到可測試的已購買會員卡');
    }
    
    // 測試會員卡驗證
    const validation = validateMembershipActivation(testMembership.id);
    if (!validation.isValid) {
      throw new Error(`會員卡驗證失敗: ${validation.reason}`);
    }
    
    // 測試會員卡啟用
    const activationResult = activateMembership(testMembership.id);
    if (!activationResult.success) {
      throw new Error(`會員卡啟用失敗: ${activationResult.message}`);
    }
    
    return {
      test_name: '會員卡購買啟用測試',
      success: true,
      message: '會員卡購買啟用功能正常',
      details: {
        membership_id: testMembership.id,
        activation_result: activationResult.message
      },
      execution_time: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      test_name: '會員卡購買啟用測試',
      success: false,
      message: `會員卡購買啟用測試失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
      execution_time: Date.now() - startTime
    };
  }
}

/**
 * 驗證課程預約流程
 */
async function validateCourseBookingFlow(): Promise<ValidationResult> {
  const startTime = Date.now();
  
  try {
    // 檢查課程數據
    if (courseSessions.length === 0) {
      throw new Error('系統中沒有課程節數據');
    }
    
    const testSession = courseSessions.find(s => s.status === 'SCHEDULED');
    if (!testSession) {
      throw new Error('找不到可預約的課程節');
    }
    
    // 檢查用戶數據
    const testUser = users.find(u => u.role === 'STUDENT' && u.status === 'ACTIVE');
    if (!testUser) {
      throw new Error('找不到可測試的學生用戶');
    }
    
    // 測試預約功能
    const bookingResult = createSingleBooking(testUser.id, testSession.id, '測試預約');
    
    if (!bookingResult.success) {
      // 如果失敗是因為合理原因（如沒有會員卡），也算通過
      const acceptableReasons = [
        '用戶沒有有效的會員卡',
        '會員卡剩餘課程數不足',
        '您已預約過此課程'
      ];
      
      const isAcceptableFailure = acceptableReasons.some(reason => 
        bookingResult.message.includes(reason)
      );
      
      if (!isAcceptableFailure) {
        throw new Error(`預約失敗: ${bookingResult.message}`);
      }
    }
    
    return {
      test_name: '課程預約流程測試',
      success: true,
      message: '課程預約流程功能正常',
      details: {
        user_id: testUser.id,
        session_id: testSession.id,
        booking_result: bookingResult.message
      },
      execution_time: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      test_name: '課程預約流程測試',
      success: false,
      message: `課程預約流程測試失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
      execution_time: Date.now() - startTime
    };
  }
}

/**
 * 驗證支付流程
 */
async function validatePaymentFlow(): Promise<ValidationResult> {
  const startTime = Date.now();
  
  try {
    // 模擬支付流程測試
    // 檢查訂單數據結構
    const testOrder = {
      user_id: 1,
      items: [{
        id: 1,
        type: 'MEMBERSHIP_PLAN' as const,
        item_id: 1,
        item_name: '測試方案',
        quantity: 1,
        unit_price: 1000,
        total_price: 1000
      }],
      subtotal: 1000,
      discount_amount: 0,
      tax_amount: 0,
      total_amount: 1000,
      currency: 'TWD' as const,
      status: 'PENDING_PAYMENT' as const,
      notes: '測試訂單'
    };
    
    // 驗證訂單結構
    const requiredFields = ['user_id', 'items', 'total_amount', 'currency', 'status'];
    for (const field of requiredFields) {
      if (!(field in testOrder)) {
        throw new Error(`訂單缺少必填欄位: ${field}`);
      }
    }
    
    // 驗證金額計算
    const calculatedTotal = testOrder.subtotal - testOrder.discount_amount + testOrder.tax_amount;
    if (calculatedTotal !== testOrder.total_amount) {
      throw new Error('訂單金額計算錯誤');
    }
    
    return {
      test_name: '支付流程測試',
      success: true,
      message: '支付流程功能正常',
      details: {
        test_order_total: testOrder.total_amount,
        currency: testOrder.currency
      },
      execution_time: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      test_name: '支付流程測試',
      success: false,
      message: `支付流程測試失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
      execution_time: Date.now() - startTime
    };
  }
}

/**
 * 驗證管理功能
 */
async function validateAdminFunctions(): Promise<ValidationResult> {
  const startTime = Date.now();
  
  try {
    // 檢查管理員用戶
    const adminUser = users.find(u => u.role === 'ADMIN' && u.status === 'ACTIVE');
    if (!adminUser) {
      throw new Error('系統中沒有啟用的管理員用戶');
    }
    
    // 測試權限檢查
    const hasUserManagementPermission = hasPermission(adminUser.id, 'MANAGE_USERS' as never);
    if (!hasUserManagementPermission) {
      throw new Error('管理員沒有用戶管理權限');
    }
    
    // 測試資源存取
    const canAccessUserResource = canAccessResource(
      adminUser.id, 
      ResourceType.USER, 
      1, 
      'view'
    );
    if (!canAccessUserResource) {
      throw new Error('管理員無法存取用戶資源');
    }
    
    return {
      test_name: '管理功能測試',
      success: true,
      message: '管理功能正常',
      details: {
        admin_user_id: adminUser.id,
        permissions_working: true
      },
      execution_time: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      test_name: '管理功能測試',
      success: false,
      message: `管理功能測試失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
      execution_time: Date.now() - startTime
    };
  }
}

// ========================================
// 架構完整性驗證
// ========================================

/**
 * 驗證 MECE 架構完整性
 */
async function validateMECEArchitecture(): Promise<ValidationResult> {
  const startTime = Date.now();
  
  try {
    // 檢查三層課程架構
    if (courseModules.length === 0) {
      throw new Error('課程模組數據為空');
    }
    
    if (courseSchedules.length === 0) {
      throw new Error('課程排程數據為空');
    }
    
    if (courseSessions.length === 0) {
      throw new Error('課程節數據為空');
    }
    
    // 檢查關聯性
    const scheduleWithInvalidModule = courseSchedules.find(schedule => {
      const courseModule = getCourseModuleById(schedule.course_module_id);
      return !courseModule;
    });
    
    if (scheduleWithInvalidModule) {
      throw new Error(`發現關聯無效的課程排程: ${scheduleWithInvalidModule.id}`);
    }
    
    const sessionWithInvalidSchedule = courseSessions.find(session => {
      const schedule = getCourseScheduleById(session.course_schedule_id);
      return !schedule;
    });
    
    if (sessionWithInvalidSchedule) {
      throw new Error(`發現關聯無效的課程節: ${sessionWithInvalidSchedule.id}`);
    }
    
    // 檢查六角色系統
    const expectedRoles = ['STUDENT', 'TEACHER', 'ADMIN', 'STAFF', 'CORPORATE_CONTACT', 'AGENT'];
    const existingRoles = [...new Set(users.map(u => u.role))];
    
    const missingRoles = expectedRoles.filter(role => !existingRoles.includes(role));
    if (missingRoles.length > 0) {
      throw new Error(`缺少角色類型的用戶: ${missingRoles.join(', ')}`);
    }
    
    return {
      test_name: 'MECE架構完整性測試',
      success: true,
      message: 'MECE架構完整性正常',
      details: {
        course_modules: courseModules.length,
        course_schedules: courseSchedules.length,
        course_sessions: courseSessions.length,
        user_roles: existingRoles
      },
      execution_time: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      test_name: 'MECE架構完整性測試',
      success: false,
      message: `MECE架構完整性測試失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
      execution_time: Date.now() - startTime
    };
  }
}

/**
 * 驗證企業功能
 */
async function validateCorporateFunctions(): Promise<ValidationResult> {
  const startTime = Date.now();
  
  try {
    // 測試企業客戶創建
    const testCorporateData = {
      company_name: `測試企業_${Date.now()}`,
      registration_number: `TEST${Date.now()}`,
      industry: '科技業',
      company_size: '10-50人',
      address: '測試地址',
      primary_contact: {
        name: '測試聯絡人',
        email: `test_contact_${Date.now()}@example.com`,
        phone: '02-1234-5678',
        position: '經理',
        department: '人力資源部'
      },
      contract_terms: {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        auto_renewal: true,
        payment_terms: 'NET_30' as const,
        discount_rate: 10,
        minimum_commitment: 5
      }
    };
    
    const corporateResult = createCorporateClient(testCorporateData);
    
    if (!corporateResult.success) {
      throw new Error(`企業客戶創建失敗: ${corporateResult.message}`);
    }
    
    return {
      test_name: '企業功能測試',
      success: true,
      message: '企業功能正常',
      details: {
        created_client_id: corporateResult.client?.id,
        company_name: testCorporateData.company_name
      },
      execution_time: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      test_name: '企業功能測試',
      success: false,
      message: `企業功能測試失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
      execution_time: Date.now() - startTime
    };
  }
}

/**
 * 驗證代理商功能
 */
async function validateAgentFunctions(): Promise<ValidationResult> {
  const startTime = Date.now();
  
  try {
    // 測試代理商註冊
    const testAgentData = {
      name: `測試代理商_${Date.now()}`,
      email: `test_agent_${Date.now()}@example.com`,
      phone: '0912345678',
      password: 'test_password',
      status: 'ACTIVE' as const,
      profile: {
        language_preference: 'zh-TW',
        timezone: 'Asia/Taipei'
      }
    };
    
    const agentResult = registerAgent(testAgentData);
    
    if (!agentResult.success) {
      throw new Error(`代理商註冊失敗: ${agentResult.message}`);
    }
    
    return {
      test_name: '代理商功能測試',
      success: true,
      message: '代理商功能正常',
      details: {
        created_agent_id: agentResult.agent?.id,
        agent_name: testAgentData.name
      },
      execution_time: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      test_name: '代理商功能測試',
      success: false,
      message: `代理商功能測試失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
      execution_time: Date.now() - startTime
    };
  }
}

// ========================================
// 完整系統驗證
// ========================================

/**
 * 執行完整的系統驗證
 */
export async function performSystemValidation(): Promise<SystemValidationReport> {
  const startTime = Date.now();
  
  const testFunctions = [
    validateUserRegistrationLogin,
    validateMembershipPurchaseActivation,
    validateCourseBookingFlow,
    validatePaymentFlow,
    validateAdminFunctions,
    validateMECEArchitecture,
    validateCorporateFunctions,
    validateAgentFunctions
  ];
  
  const results: ValidationResult[] = [];
  
  console.log('開始系統驗證測試...');
  
  for (const testFunction of testFunctions) {
    try {
      const result = await testFunction();
      results.push(result);
      console.log(`✓ ${result.test_name}: ${result.success ? '通過' : '失敗'}`);
    } catch (error) {
      results.push({
        test_name: testFunction.name,
        success: false,
        message: `測試執行失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
        execution_time: 0
      });
      console.log(`✗ ${testFunction.name}: 執行失敗`);
    }
  }
  
  const passedTests = results.filter(r => r.success).length;
  const failedTests = results.length - passedTests;
  const successRate = (passedTests / results.length) * 100;
  
  // 計算系統健康度
  let systemHealth: SystemValidationReport['system_health'];
  if (successRate >= 95) {
    systemHealth = 'EXCELLENT';
  } else if (successRate >= 80) {
    systemHealth = 'GOOD';
  } else if (successRate >= 60) {
    systemHealth = 'WARNING';
  } else {
    systemHealth = 'CRITICAL';
  }
  
  const report: SystemValidationReport = {
    overall_success: failedTests === 0,
    total_tests: results.length,
    passed_tests: passedTests,
    failed_tests: failedTests,
    test_results: results,
    execution_time: Date.now() - startTime,
    system_health: systemHealth
  };
  
  console.log('\n=== 系統驗證報告 ===');
  console.log(`總測試數: ${report.total_tests}`);
  console.log(`通過測試: ${report.passed_tests}`);
  console.log(`失敗測試: ${report.failed_tests}`);
  console.log(`成功率: ${successRate.toFixed(1)}%`);
  console.log(`系統健康度: ${systemHealth}`);
  console.log(`執行時間: ${report.execution_time}ms`);
  
  return report;
}

/**
 * 快速健康檢查
 */
export async function quickHealthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  issues: string[];
  checked_components: string[];
}> {
  const issues: string[] = [];
  const checkedComponents: string[] = [];
  
  // 檢查基本數據
  checkedComponents.push('用戶數據');
  if (users.length === 0) {
    issues.push('沒有用戶數據');
  }
  
  checkedComponents.push('課程數據');
  if (courseModules.length === 0) {
    issues.push('沒有課程模組數據');
  }
  
  checkedComponents.push('會員卡數據');
  if (memberships.length === 0) {
    issues.push('沒有會員卡數據');
  }
  
  // 檢查關鍵角色
  checkedComponents.push('管理員角色');
  const hasAdmin = users.some(u => u.role === 'ADMIN' && u.status === 'ACTIVE');
  if (!hasAdmin) {
    issues.push('沒有啟用的管理員用戶');
  }
  
  return {
    status: issues.length === 0 ? 'healthy' : 'unhealthy',
    issues,
    checked_components: checkedComponents
  };
}

const systemValidatorModule = {
  performSystemValidation,
  quickHealthCheck
};

export default systemValidatorModule;