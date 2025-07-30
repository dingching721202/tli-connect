// ========================================
// 錯誤處理系統 - Phase 3.2
// 實現完整的錯誤處理與用戶反饋
// ========================================

import { ApiErrorCode, ERROR_MESSAGES } from '@/services/apiService';

export interface ErrorInfo {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  stack?: string;
  user_action?: string;
}

export interface UserFriendlyError {
  title: string;
  message: string;
  action?: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  dismissible: boolean;
  autoHide?: number; // 自動隱藏時間（毫秒）
}

// ========================================
// 錯誤分類與對應
// ========================================

// 用戶友好錯誤訊息對應表
const USER_FRIENDLY_MESSAGES: Record<string, UserFriendlyError> = {
  // 認證相關錯誤
  [ApiErrorCode.UNAUTHORIZED]: {
    title: '請重新登入',
    message: '您的登入狀態已過期，請重新登入後繼續操作。',
    action: '前往登入頁面',
    severity: 'warning',
    dismissible: false
  },
  
  [ApiErrorCode.FORBIDDEN]: {
    title: '權限不足',
    message: '您沒有權限執行此操作，如有疑問請聯繫管理員。',
    severity: 'error',
    dismissible: true
  },
  
  [ApiErrorCode.INVALID_CREDENTIALS]: {
    title: '登入失敗',
    message: '帳號或密碼錯誤，請重新輸入。',
    severity: 'error',
    dismissible: true
  },
  
  [ApiErrorCode.ACCOUNT_SUSPENDED]: {
    title: '帳號已停用',
    message: '您的帳號已被停用，如有疑問請聯繫客服。',
    severity: 'error',
    dismissible: false
  },
  
  // 會員卡相關錯誤
  [ApiErrorCode.MEMBERSHIP_NOT_FOUND]: {
    title: '找不到會員卡',
    message: '您目前沒有有效的會員卡，請購買會員卡後再預約課程。',
    action: '購買會員卡',
    severity: 'warning',
    dismissible: true
  },
  
  [ApiErrorCode.MEMBERSHIP_EXPIRED]: {
    title: '會員卡已過期',
    message: '您的會員卡已過期，請續費後繼續使用。',
    action: '續費會員卡',
    severity: 'warning',
    dismissible: true
  },
  
  [ApiErrorCode.MEMBERSHIP_INSUFFICIENT_SESSIONS]: {
    title: '課程數不足',
    message: '您的會員卡剩餘課程數不足，請購買新的會員卡。',
    action: '購買會員卡',
    severity: 'warning',
    dismissible: true
  },
  
  [ApiErrorCode.MEMBERSHIP_ACTIVATION_EXPIRED]: {
    title: '啟用期限已過',
    message: '會員卡啟用期限已過，請聯繫客服處理。',
    severity: 'error',
    dismissible: true
  },
  
  // 預約相關錯誤
  [ApiErrorCode.COURSE_FULL]: {
    title: '課程已額滿',
    message: '此課程已額滿，請選擇其他時段或加入候補名單。',
    action: '查看其他時段',
    severity: 'warning',
    dismissible: true
  },
  
  [ApiErrorCode.BOOKING_ALREADY_EXISTS]: {
    title: '重複預約',
    message: '您已預約過此課程，請到「我的預約」查看詳情。',
    action: '查看我的預約',
    severity: 'info',
    dismissible: true
  },
  
  [ApiErrorCode.CANCELLATION_DEADLINE_PASSED]: {
    title: '無法取消',
    message: '已超過課程開始前24小時，無法取消預約。',
    severity: 'error',
    dismissible: true
  },
  
  [ApiErrorCode.COURSE_NOT_AVAILABLE]: {
    title: '課程不可預約',
    message: '此課程目前不開放預約，請稍後再試。',
    severity: 'warning',
    dismissible: true
  },
  
  // 資料驗證錯誤
  [ApiErrorCode.VALIDATION_ERROR]: {
    title: '資料格式錯誤',
    message: '請檢查輸入資料是否正確完整。',
    severity: 'error',
    dismissible: true
  },
  
  [ApiErrorCode.NOT_FOUND]: {
    title: '找不到資料',
    message: '您要查找的資料不存在或已被刪除。',
    severity: 'error',
    dismissible: true
  },
  
  // 系統錯誤
  [ApiErrorCode.INTERNAL_ERROR]: {
    title: '系統錯誤',
    message: '系統發生內部錯誤，請稍後再試。如問題持續發生，請聯繫客服。',
    severity: 'error',
    dismissible: true,
    autoHide: 5000
  },
  
  [ApiErrorCode.INVALID_REQUEST]: {
    title: '請求錯誤',
    message: '請求格式不正確，請重新操作。',
    severity: 'error',
    dismissible: true
  }
};

// ========================================
// 錯誤處理函數
// ========================================

/**
 * 記錄錯誤到控制台和可能的外部服務
 * @param error 錯誤資訊
 */
export const logError = (error: ErrorInfo): void => {
  // 控制台記錄
  console.error('Error logged:', {
    code: error.code,
    message: error.message,
    timestamp: error.timestamp,
    details: error.details
  });
  
  // 在生產環境中，這裡可以發送到錯誤追蹤服務
  if (process.env.NODE_ENV === 'production') {
    // 例如發送到 Sentry, LogRocket 等服務
    // sendToErrorService(error);
  }
  
  // 如果是開發環境，顯示 stack trace
  if (process.env.NODE_ENV === 'development' && error.stack) {
    console.error('Stack trace:', error.stack);
  }
};

/**
 * 將錯誤轉換為用戶友好的訊息
 * @param error 錯誤物件或錯誤代碼
 * @param customMessage 自訂訊息
 * @returns 用戶友好的錯誤訊息
 */
export const getErrorMessage = (
  error: string | Error | { code?: string; message?: string },
  customMessage?: string
): UserFriendlyError => {
  let errorCode: string;
  let originalMessage: string;
  
  // 解析錯誤類型
  if (typeof error === 'string') {
    errorCode = error;
    originalMessage = ERROR_MESSAGES[error as ApiErrorCode] || error;
  } else if (error instanceof Error) {
    errorCode = ApiErrorCode.INTERNAL_ERROR;
    originalMessage = error.message;
  } else if (error && typeof error === 'object') {
    errorCode = error.code || ApiErrorCode.INTERNAL_ERROR;
    originalMessage = error.message || '未知錯誤';
  } else {
    errorCode = ApiErrorCode.INTERNAL_ERROR;
    originalMessage = '發生未預期的錯誤';
  }
  
  // 取得用戶友好訊息
  const friendlyError = USER_FRIENDLY_MESSAGES[errorCode];
  
  if (friendlyError) {
    return {
      ...friendlyError,
      message: customMessage || friendlyError.message
    };
  }
  
  // 如果沒有對應的友好訊息，返回通用錯誤
  return {
    title: '發生錯誤',
    message: customMessage || originalMessage || '系統發生錯誤，請稍後再試',
    severity: 'error',
    dismissible: true
  };
};

/**
 * 處理 API 回應錯誤
 * @param response API 回應
 * @returns 用戶友好的錯誤訊息
 */
export const handleApiError = (response: { 
  success: boolean; 
  error_code?: string; 
  message?: string;
  data?: unknown;
}): UserFriendlyError | null => {
  if (response.success) return null;
  
  const errorInfo: ErrorInfo = {
    code: response.error_code || ApiErrorCode.INTERNAL_ERROR,
    message: response.message || '未知錯誤',
    details: response.data as Record<string, unknown>,
    timestamp: new Date().toISOString()
  };
  
  // 記錄錯誤
  logError(errorInfo);
  
  // 返回用戶友好訊息
  return getErrorMessage(errorInfo.code, errorInfo.message);
};

/**
 * 處理表單驗證錯誤
 * @param validationErrors 驗證錯誤物件
 * @returns 用戶友好的錯誤訊息
 */
export const handleValidationErrors = (
  validationErrors: Record<string, string[]>
): UserFriendlyError => {
  const fieldMessages = Object.entries(validationErrors)
    .map(([field, errors]) => `${getFieldDisplayName(field)}: ${errors.join(', ')}`)
    .join('\n');
  
  return {
    title: '資料驗證失敗',
    message: `請修正以下錯誤：\n${fieldMessages}`,
    severity: 'error',
    dismissible: true
  };
};

/**
 * 創建成功訊息
 * @param message 成功訊息
 * @param autoHide 自動隱藏時間
 * @returns 成功訊息物件
 */
export const createSuccessMessage = (
  message: string,
  autoHide: number = 3000
): UserFriendlyError => {
  return {
    title: '操作成功',
    message,
    severity: 'success',
    dismissible: true,
    autoHide
  };
};

/**
 * 創建警告訊息
 * @param message 警告訊息
 * @param action 建議操作
 * @returns 警告訊息物件
 */
export const createWarningMessage = (
  message: string,
  action?: string
): UserFriendlyError => {
  return {
    title: '注意',
    message,
    action,
    severity: 'warning',
    dismissible: true
  };
};

/**
 * 創建資訊訊息
 * @param message 資訊訊息
 * @param autoHide 自動隱藏時間
 * @returns 資訊訊息物件
 */
export const createInfoMessage = (
  message: string,
  autoHide: number = 5000
): UserFriendlyError => {
  return {
    title: '提示',
    message,
    severity: 'info',
    dismissible: true,
    autoHide
  };
};

// ========================================
// 錯誤邊界處理
// ========================================

/**
 * React 錯誤邊界的錯誤處理
 * @param error 錯誤物件
 * @param errorInfo React 錯誤資訊
 */
export const handleReactError = (error: Error, errorInfo: { componentStack: string }): void => {
  const errorData: ErrorInfo = {
    code: 'REACT_ERROR',
    message: error.message,
    details: {
      componentStack: errorInfo.componentStack,
      name: error.name
    },
    timestamp: new Date().toISOString(),
    stack: error.stack,
    user_action: 'Component render error'
  };
  
  logError(errorData);
};

/**
 * 處理未捕獲的 Promise 拒絕
 * @param event PromiseRejectionEvent
 */
export const handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
  const errorData: ErrorInfo = {
    code: 'UNHANDLED_PROMISE_REJECTION',
    message: typeof event.reason === 'string' ? event.reason : 'Unhandled promise rejection',
    details: {
      reason: event.reason
    },
    timestamp: new Date().toISOString(),
    user_action: 'Unhandled promise rejection'
  };
  
  logError(errorData);
  
  // 防止錯誤在控制台中顯示
  event.preventDefault();
};

// ========================================
// 輔助函數
// ========================================

/**
 * 獲取欄位的顯示名稱
 * @param fieldName 欄位名稱
 * @returns 中文顯示名稱
 */
const getFieldDisplayName = (fieldName: string): string => {
  const fieldNameMap: Record<string, string> = {
    name: '姓名',
    email: '電子郵件',
    phone: '手機號碼',
    password: '密碼',
    title: '標題',
    description: '描述',
    start_date: '開始日期',
    end_date: '結束日期',
    capacity: '容量',
    price: '價格'
  };
  
  return fieldNameMap[fieldName] || fieldName;
};

/**
 * 檢查錯誤是否為網路錯誤
 * @param error 錯誤物件
 * @returns 是否為網路錯誤
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.message.includes('Failed to fetch') || 
           error.message.includes('Network Error') ||
           error.message.includes('ERR_NETWORK');
  }
  return false;
};

/**
 * 檢查錯誤是否為超時錯誤
 * @param error 錯誤物件
 * @returns 是否為超時錯誤
 */
export const isTimeoutError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.message.includes('timeout') || 
           error.message.includes('TIMEOUT');
  }
  return false;
};

/**
 * 獲取錯誤的重試建議
 * @param error 錯誤物件
 * @returns 重試建議
 */
export const getRetryAdvice = (error: unknown): string | null => {
  if (isNetworkError(error)) {
    return '請檢查網路連線後重試';
  }
  
  if (isTimeoutError(error)) {
    return '請求超時，請稍後重試';
  }
  
  return null;
};

// ========================================
// 預設匯出
// ========================================

export default {
  logError,
  getErrorMessage,
  handleApiError,
  handleValidationErrors,
  createSuccessMessage,
  createWarningMessage,
  createInfoMessage,
  handleReactError,
  handleUnhandledRejection,
  isNetworkError,
  isTimeoutError,
  getRetryAdvice,
  USER_FRIENDLY_MESSAGES
};