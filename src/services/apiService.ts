// ========================================
// API 服務層 - Phase 2.6
// 統一 API 層標準化與錯誤處理機制
// ========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message: string;
  error_code?: string;
  timestamp: string;
  request_id?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

// API 錯誤代碼定義
export enum ApiErrorCode {
  // 通用錯誤
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // 用戶相關錯誤
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
  
  // 會員卡相關錯誤
  MEMBERSHIP_NOT_FOUND = 'MEMBERSHIP_NOT_FOUND',
  MEMBERSHIP_EXPIRED = 'MEMBERSHIP_EXPIRED',
  MEMBERSHIP_INSUFFICIENT_SESSIONS = 'MEMBERSHIP_INSUFFICIENT_SESSIONS',
  MEMBERSHIP_ACTIVATION_EXPIRED = 'MEMBERSHIP_ACTIVATION_EXPIRED',
  
  // 預約相關錯誤
  BOOKING_NOT_FOUND = 'BOOKING_NOT_FOUND',
  BOOKING_ALREADY_EXISTS = 'BOOKING_ALREADY_EXISTS',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  COURSE_FULL = 'COURSE_FULL',
  COURSE_NOT_AVAILABLE = 'COURSE_NOT_AVAILABLE',
  CANCELLATION_DEADLINE_PASSED = 'CANCELLATION_DEADLINE_PASSED',
  
  // 課程相關錯誤
  COURSE_NOT_FOUND = 'COURSE_NOT_FOUND',
  COURSE_INACTIVE = 'COURSE_INACTIVE',
  TEACHER_NOT_AVAILABLE = 'TEACHER_NOT_AVAILABLE',
  
  // 企業相關錯誤
  CORPORATE_CLIENT_NOT_FOUND = 'CORPORATE_CLIENT_NOT_FOUND',
  CORPORATE_SUBSCRIPTION_EXPIRED = 'CORPORATE_SUBSCRIPTION_EXPIRED',
  EMPLOYEE_LIMIT_EXCEEDED = 'EMPLOYEE_LIMIT_EXCEEDED',
  
  // 代理商相關錯誤
  AGENT_NOT_FOUND = 'AGENT_NOT_FOUND',
  REFERRAL_CODE_NOT_FOUND = 'REFERRAL_CODE_NOT_FOUND',
  REFERRAL_CODE_EXPIRED = 'REFERRAL_CODE_EXPIRED',
  REFERRAL_CODE_USAGE_EXCEEDED = 'REFERRAL_CODE_USAGE_EXCEEDED'
}

// 錯誤訊息對應表
export const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  // 通用錯誤
  [ApiErrorCode.INTERNAL_ERROR]: '系統內部錯誤',
  [ApiErrorCode.INVALID_REQUEST]: '請求格式不正確',
  [ApiErrorCode.UNAUTHORIZED]: '未授權存取',
  [ApiErrorCode.FORBIDDEN]: '權限不足',
  [ApiErrorCode.NOT_FOUND]: '資源不存在',
  [ApiErrorCode.VALIDATION_ERROR]: '資料驗證失敗',
  
  // 用戶相關錯誤
  [ApiErrorCode.USER_NOT_FOUND]: '用戶不存在',
  [ApiErrorCode.USER_ALREADY_EXISTS]: '用戶已存在',
  [ApiErrorCode.INVALID_CREDENTIALS]: '帳號或密碼錯誤',
  [ApiErrorCode.ACCOUNT_SUSPENDED]: '帳號已被停用',
  
  // 會員卡相關錯誤
  [ApiErrorCode.MEMBERSHIP_NOT_FOUND]: '會員卡不存在',
  [ApiErrorCode.MEMBERSHIP_EXPIRED]: '會員卡已過期',
  [ApiErrorCode.MEMBERSHIP_INSUFFICIENT_SESSIONS]: '會員卡剩餘課程數不足',
  [ApiErrorCode.MEMBERSHIP_ACTIVATION_EXPIRED]: '會員卡啟用期限已過',
  
  // 預約相關錯誤
  [ApiErrorCode.BOOKING_NOT_FOUND]: '預約記錄不存在',
  [ApiErrorCode.BOOKING_ALREADY_EXISTS]: '已預約過此課程',
  [ApiErrorCode.BOOKING_CANCELLED]: '預約已被取消',
  [ApiErrorCode.COURSE_FULL]: '課程已滿額',
  [ApiErrorCode.COURSE_NOT_AVAILABLE]: '課程不可預約',
  [ApiErrorCode.CANCELLATION_DEADLINE_PASSED]: '已超過取消期限',
  
  // 課程相關錯誤
  [ApiErrorCode.COURSE_NOT_FOUND]: '課程不存在',
  [ApiErrorCode.COURSE_INACTIVE]: '課程未啟用',
  [ApiErrorCode.TEACHER_NOT_AVAILABLE]: '教師不可用',
  
  // 企業相關錯誤
  [ApiErrorCode.CORPORATE_CLIENT_NOT_FOUND]: '企業客戶不存在',
  [ApiErrorCode.CORPORATE_SUBSCRIPTION_EXPIRED]: '企業訂閱已過期',
  [ApiErrorCode.EMPLOYEE_LIMIT_EXCEEDED]: '員工數量超過限制',
  
  // 代理商相關錯誤
  [ApiErrorCode.AGENT_NOT_FOUND]: '代理商不存在',
  [ApiErrorCode.REFERRAL_CODE_NOT_FOUND]: '推薦代碼不存在',
  [ApiErrorCode.REFERRAL_CODE_EXPIRED]: '推薦代碼已過期',
  [ApiErrorCode.REFERRAL_CODE_USAGE_EXCEEDED]: '推薦代碼使用次數已達上限'
};

// ========================================
// API 回應建構函數
// ========================================

/**
 * 建構成功回應
 * @param data 回應資料
 * @param message 成功訊息
 * @returns API回應
 */
export const createSuccessResponse = <T>(
  data?: T,
  message: string = '操作成功'
): ApiResponse<T> => {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    request_id: generateRequestId()
  };
};

/**
 * 建構錯誤回應
 * @param errorCode 錯誤代碼
 * @param customMessage 自訂錯誤訊息
 * @param details 錯誤詳細資訊
 * @returns API回應
 */
export const createErrorResponse = (
  errorCode: ApiErrorCode,
  customMessage?: string,
  details?: Record<string, unknown>
): ApiResponse => {
  return {
    success: false,
    message: customMessage || ERROR_MESSAGES[errorCode],
    error_code: errorCode,
    timestamp: new Date().toISOString(),
    request_id: generateRequestId(),
    ...(details && { data: details })
  };
};

/**
 * 建構分頁回應
 * @param data 回應資料
 * @param pagination 分頁資訊
 * @param message 成功訊息
 * @returns 分頁API回應
 */
export const createPaginatedResponse = <T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  message: string = '查詢成功'
): PaginatedResponse<T> => {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    request_id: generateRequestId(),
    pagination: {
      ...pagination,
      total_pages: totalPages,
      has_next: pagination.page < totalPages,
      has_prev: pagination.page > 1
    }
  };
};

// ========================================
// 分頁工具函數
// ========================================

/**
 * 計算分頁資料
 * @param data 原始資料陣列
 * @param page 頁碼（從1開始）
 * @param limit 每頁筆數
 * @returns 分頁後的資料和分頁資訊
 */
export const paginate = <T>(
  data: T[],
  page: number = 1,
  limit: number = 10
): {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
} => {
  const offset = (page - 1) * limit;
  const paginatedData = data.slice(offset, offset + limit);
  
  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total: data.length
    }
  };
};

// ========================================
// 錯誤處理工具
// ========================================

/**
 * 包裝服務函數以統一錯誤處理
 * @param serviceFunction 服務函數
 * @returns 包裝後的函數
 */
export const withErrorHandling = <TArgs extends unknown[], TReturn>(
  serviceFunction: (...args: TArgs) => TReturn | Promise<TReturn>
) => {
  return async (...args: TArgs): Promise<ApiResponse<TReturn>> => {
    try {
      const result = await serviceFunction(...args);
      return createSuccessResponse(result);
    } catch (error) {
      console.error('Service function error:', error);
      
      if (error instanceof ApiServiceError) {
        return createErrorResponse(error.code, error.message, error.details);
      }
      
      return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, '系統發生未預期錯誤');
    }
  };
};

/**
 * API 服務錯誤類別
 */
export class ApiServiceError extends Error {
  public code: ApiErrorCode;
  public details?: Record<string, unknown>;
  
  constructor(
    code: ApiErrorCode,
    message?: string,
    details?: Record<string, unknown>
  ) {
    super(message || ERROR_MESSAGES[code]);
    this.name = 'ApiServiceError';
    this.code = code;
    this.details = details;
  }
}

// ========================================
// 資料驗證工具
// ========================================

/**
 * 驗證必填欄位
 * @param data 資料物件
 * @param requiredFields 必填欄位列表
 * @throws ApiServiceError 當驗證失敗時
 */
export const validateRequiredFields = (
  data: Record<string, unknown>,
  requiredFields: string[]
): void => {
  const missingFields = requiredFields.filter(field => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });
  
  if (missingFields.length > 0) {
    throw new ApiServiceError(
      ApiErrorCode.VALIDATION_ERROR,
      `缺少必填欄位: ${missingFields.join(', ')}`,
      { missing_fields: missingFields }
    );
  }
};

/**
 * 驗證電子郵件格式
 * @param email 電子郵件
 * @throws ApiServiceError 當驗證失敗時
 */
export const validateEmail = (email: string): void => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiServiceError(
      ApiErrorCode.VALIDATION_ERROR,
      '電子郵件格式不正確'
    );
  }
};

/**
 * 驗證手機號碼格式
 * @param phone 手機號碼
 * @throws ApiServiceError 當驗證失敗時
 */
export const validatePhone = (phone: string): void => {
  const phoneRegex = /^09\d{8}$/;
  if (!phoneRegex.test(phone)) {
    throw new ApiServiceError(
      ApiErrorCode.VALIDATION_ERROR,
      '手機號碼格式不正確'
    );
  }
};

/**
 * 驗證日期格式
 * @param date 日期字串
 * @param format 日期格式（預設 YYYY-MM-DD）
 * @throws ApiServiceError 當驗證失敗時
 */
export const validateDate = (date: string, format: string = 'YYYY-MM-DD'): void => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new ApiServiceError(
      ApiErrorCode.VALIDATION_ERROR,
      `日期格式不正確，應為 ${format}`
    );
  }
  
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new ApiServiceError(
      ApiErrorCode.VALIDATION_ERROR,
      '日期無效'
    );
  }
};

// ========================================
// 查詢參數處理
// ========================================

/**
 * 解析查詢參數
 * @param searchParams URLSearchParams 物件
 * @returns 解析後的查詢參數
 */
export const parseQueryParams = (searchParams: URLSearchParams) => {
  const params = {
    page: Math.max(1, parseInt(searchParams.get('page') || '1')),
    limit: Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10'))),
    sort: searchParams.get('sort') || 'created_at',
    order: (searchParams.get('order') || 'desc').toLowerCase() as 'asc' | 'desc',
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    start_date: searchParams.get('start_date') || '',
    end_date: searchParams.get('end_date') || ''
  };
  
  // 驗證日期格式
  if (params.start_date) {
    validateDate(params.start_date);
  }
  if (params.end_date) {
    validateDate(params.end_date);
  }
  
  return params;
};

/**
 * 建構查詢條件
 * @param params 查詢參數
 * @returns 查詢條件物件
 */
export const buildQueryFilter = (params: ReturnType<typeof parseQueryParams>) => {
  const filter: Record<string, unknown> = {};
  
  if (params.search) {
    filter.search = params.search;
  }
  
  if (params.status) {
    filter.status = params.status;
  }
  
  if (params.start_date) {
    filter.start_date = params.start_date;
  }
  
  if (params.end_date) {
    filter.end_date = params.end_date;
  }
  
  return filter;
};

// ========================================
// 快取工具
// ========================================

/**
 * 簡單的記憶體快取
 */
class MemoryCache {
  private cache = new Map<string, { data: unknown; expiry: number }>();
  
  set(key: string, data: unknown, ttl: number = 300000): void { // 預設5分鐘
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
}

export const apiCache = new MemoryCache();

/**
 * 快取包裝器
 * @param cacheKey 快取鍵值
 * @param ttl 存活時間（毫秒）
 * @param fetchFunction 資料取得函數
 * @returns 快取包裝後的函數
 */
export const withCache = <T>(
  cacheKey: string,
  ttl: number = 300000, // 5分鐘
  fetchFunction: () => T | Promise<T>
) => {
  return async (): Promise<T> => {
    // 嘗試從快取取得
    const cachedData = apiCache.get<T>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // 快取中沒有資料，執行函數取得資料
    const data = await fetchFunction();
    
    // 儲存到快取
    apiCache.set(cacheKey, data, ttl);
    
    return data;
  };
};

// ========================================
// 工具函數
// ========================================

/**
 * 生成請求ID
 * @returns 請求ID
 */
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * 格式化錯誤物件
 * @param error 錯誤物件
 * @returns 格式化後的錯誤資訊
 */
export const formatError = (error: unknown): ApiError => {
  if (error instanceof ApiServiceError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details
    };
  }
  
  if (error instanceof Error) {
    return {
      code: ApiErrorCode.INTERNAL_ERROR,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }
  
  return {
    code: ApiErrorCode.INTERNAL_ERROR,
    message: '未知錯誤'
  };
};

// ========================================
// 預設匯出
// ========================================

export default {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  paginate,
  withErrorHandling,
  ApiServiceError,
  validateRequiredFields,
  validateEmail,
  validatePhone,
  validateDate,
  parseQueryParams,
  buildQueryFilter,
  apiCache,
  withCache,
  formatError,
  ApiErrorCode,
  ERROR_MESSAGES
};