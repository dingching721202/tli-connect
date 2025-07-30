// ========================================
// API響應輔助工具
// ========================================

import type { ApiResponse, ErrorCode } from '@/types/api';
import { v4 as uuidv4 } from 'uuid';

// 建立成功響應的輔助函數
export function createSuccessResponse<T>(data: T, message = 'Operation successful'): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    request_id: generateRequestId()
  };
}

// 建立錯誤響應的輔助函數
export function createErrorResponse(
  errorCode: ErrorCode,
  message: string,
  validationErrors?: Array<{ field: string; message: string; code: string }>
): ApiResponse<never> {
  return {
    success: false,
    message,
    error_code: errorCode,
    timestamp: new Date().toISOString(),
    request_id: generateRequestId(),
    ...(validationErrors && { validation_errors: validationErrors })
  };
}

// 向後相容的響應建構器 - 用於現有服務層
export function createLegacyResponse<T>(success: boolean, data?: T, error?: string): {
  success: boolean;
  data?: T;
  error?: string;
} {
  return { success, data, error };
}

// 將舊格式轉換為新格式
export function convertLegacyResponse<T>(
  legacyResponse: { success: boolean; data?: T; error?: string; message?: string },
  defaultMessage = 'Operation completed'
): ApiResponse<T> {
  if (legacyResponse.success && legacyResponse.data !== undefined) {
    return createSuccessResponse(legacyResponse.data, legacyResponse.message || defaultMessage);
  } else {
    return createErrorResponse(
      'INTERNAL_SERVER_ERROR', // 預設錯誤代碼
      legacyResponse.error || legacyResponse.message || 'Operation failed'
    );
  }
}

// 生成請求ID
function generateRequestId(): string {
  // 如果沒有uuid可用，使用簡單的隨機字串
  try {
    return uuidv4();
  } catch {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 錯誤代碼對應表 - 將舊的錯誤訊息轉換為新的錯誤代碼
const ERROR_MESSAGE_TO_CODE_MAP: Record<string, ErrorCode> = {
  'EMAIL_ALREADY_EXISTS': 'EMAIL_ALREADY_EXISTS',
  'INVALID_CREDENTIALS': 'INVALID_CREDENTIALS',
  'ACTIVE_CARD_EXISTS': 'MEMBERSHIP_ALREADY_EXISTS',
  'CANNOT_CANCEL_WITHIN_24H': 'CANNOT_CANCEL_WITHIN_24H',
  'MEMBERSHIP_EXPIRED': 'MEMBERSHIP_EXPIRED',
  'TIMESLOT_FULL': 'TIMESLOT_FULL',
  'TIMESLOT_WITHIN_24H': 'BOOKING_WITHIN_24H',
  'Timeslot not found': 'COURSE_SESSION_NOT_FOUND',
  'Membership not found or not purchased': 'MEMBERSHIP_NOT_FOUND',
  'User not found': 'USER_NOT_FOUND',
  'Order not found': 'ORDER_NOT_FOUND',
  'Plan not found': 'MEMBER_CARD_PLAN_NOT_FOUND'
};

// 將錯誤訊息轉換為錯誤代碼
export function mapErrorMessageToCode(errorMessage: string): ErrorCode {
  return ERROR_MESSAGE_TO_CODE_MAP[errorMessage] || 'INTERNAL_SERVER_ERROR';
}

// 建構標準化的API錯誤響應
export function createStandardErrorResponse(
  errorMessage?: string,
  defaultErrorCode: ErrorCode = 'INTERNAL_SERVER_ERROR'
): ApiResponse<never> {
  const errorCode = errorMessage ? mapErrorMessageToCode(errorMessage) : defaultErrorCode;
  return createErrorResponse(errorCode, errorMessage || 'An error occurred');
}