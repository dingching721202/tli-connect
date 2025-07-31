import type { Booking } from '@/types/business';
import { bookings, getBookingById, getBookingsByUserId, getBookingsBySessionId } from '@/data/bookings';
import { getCourseSessionById } from '@/data/courseSessions';
import { canBookCourse, consumeMembershipSession } from './membershipService';

// ========================================
// 批次預約服務 - Phase 2.2
// 實現批次預約功能與24小時取消規則
// ========================================

export interface BookingValidationResult {
  isValid: boolean;
  reason?: string;
  session?: CourseSession;
}

export interface BatchBookingRequest {
  user_id: number;
  course_session_ids: number[];
  notes?: string;
}

export interface BatchBookingResult {
  success: boolean;
  total_requested: number;
  successful_bookings: Booking[];
  failed_bookings: {
    session_id: number;
    reason: string;
  }[];
  message: string;
}

export interface CancellationResult {
  success: boolean;
  message: string;
  booking?: Booking;
}

export interface BookingStats {
  total: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  no_show: number;
}

// ========================================
// 單次預約功能
// ========================================

/**
 * 驗證單次預約
 * @param userId 用戶ID
 * @param sessionId 課程節ID
 * @returns 驗證結果
 */
export const validateSingleBooking = (userId: number, sessionId: number): BookingValidationResult => {
  const session = getCourseSessionById(sessionId);
  
  if (!session) {
    return { isValid: false, reason: '課程節不存在' };
  }
  
  // 檢查課程狀態
  if (session.status !== 'SCHEDULED') {
    return { isValid: false, reason: '課程狀態不正確，無法預約' };
  }
  
  // 檢查容量
  const existingBookings = getBookingsBySessionId(sessionId);
  const confirmedBookings = existingBookings.filter(b => b.status === 'CONFIRMED');
  
  if (confirmedBookings.length >= session.capacity) {
    return { isValid: false, reason: '課程已滿額' };
  }
  
  // 檢查是否已預約過
  const userBooking = existingBookings.find(b => b.user_id === userId);
  if (userBooking && userBooking.status === 'CONFIRMED') {
    return { isValid: false, reason: '您已預約過此課程' };
  }
  
  // 檢查開始時間是否已過
  const now = new Date();
  const sessionStart = new Date(session.start_datetime);
  if (now >= sessionStart) {
    return { isValid: false, reason: '課程已開始，無法預約' };
  }
  
  // 檢查會員卡權限
  const membershipValidation = canBookCourse(userId, sessionId);
  if (!membershipValidation.isValid) {
    return { isValid: false, reason: membershipValidation.reason };
  }
  
  return { isValid: true, session };
};

/**
 * 創建單次預約
 * @param userId 用戶ID
 * @param sessionId 課程節ID
 * @param notes 備註
 * @returns 預約結果
 */
export const createSingleBooking = (userId: number, sessionId: number, notes?: string): BatchBookingResult => {
  const validation = validateSingleBooking(userId, sessionId);
  
  if (!validation.isValid) {
    return {
      success: false,
      total_requested: 1,
      successful_bookings: [],
      failed_bookings: [{ session_id: sessionId, reason: validation.reason || '預約失敗' }],
      message: validation.reason || '預約失敗'
    };
  }
  
  // 使用會員卡課程
  const membershipUsage = consumeMembershipSession(userId);
  if (!membershipUsage.isValid) {
    return {
      success: false,
      total_requested: 1,
      successful_bookings: [],
      failed_bookings: [{ session_id: sessionId, reason: membershipUsage.reason || '會員卡使用失敗' }],
      message: membershipUsage.reason || '會員卡使用失敗'
    };
  }
  
  const now = new Date();
  const newBooking: Booking = {
    id: Math.max(...bookings.map(b => b.id), 0) + 1,
    user_id: userId,
    course_session_id: sessionId,
    membership_id: membershipUsage.membership!.id,
    status: 'CONFIRMED',
    booking_type: 'REGULAR',
    notes: notes || '',
    created_at: now.toISOString(),
    updated_at: now.toISOString()
  };
  
  bookings.push(newBooking);
  
  return {
    success: true,
    total_requested: 1,
    successful_bookings: [newBooking],
    failed_bookings: [],
    message: '預約成功'
  };
};

// ========================================
// 批次預約功能
// ========================================

/**
 * 批次預約課程
 * @param request 批次預約請求
 * @returns 批次預約結果
 */
export const createBatchBooking = (request: BatchBookingRequest): BatchBookingResult => {
  const { user_id, course_session_ids, notes } = request;
  const results: BatchBookingResult = {
    success: false,
    total_requested: course_session_ids.length,
    successful_bookings: [],
    failed_bookings: [],
    message: ''
  };
  
  // 預先驗證所有課程
  const validations = course_session_ids.map(sessionId => ({
    sessionId,
    validation: validateSingleBooking(user_id, sessionId)
  }));
  
  // 檢查會員卡是否有足夠的課程數
  const validSessionsCount = validations.filter(v => v.validation.isValid).length;
  if (validSessionsCount === 0) {
    results.failed_bookings = validations.map(v => ({
      session_id: v.sessionId,
      reason: v.validation.reason || '驗證失敗'
    }));
    results.message = '所有課程預約驗證失敗';
    return results;
  }
  
  // 逐一處理每個課程預約
  for (const { sessionId, validation } of validations) {
    if (!validation.isValid) {
      results.failed_bookings.push({
        session_id: sessionId,
        reason: validation.reason || '驗證失敗'
      });
      continue;
    }
    
    // 嘗試使用會員卡課程
    const membershipUsage = consumeMembershipSession(user_id);
    if (!membershipUsage.isValid) {
      results.failed_bookings.push({
        session_id: sessionId,
        reason: membershipUsage.reason || '會員卡使用失敗'
      });
      continue;
    }
    
    // 創建預約
    const now = new Date();
    const newBooking: Booking = {
      id: Math.max(...bookings.map(b => b.id), 0) + 1,
      user_id: user_id,
      course_session_id: sessionId,
      membership_id: membershipUsage.membership!.id,
      status: 'CONFIRMED',
      booking_type: 'BATCH',
      notes: notes || '',
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };
    
    bookings.push(newBooking);
    results.successful_bookings.push(newBooking);
  }
  
  // 設定結果狀態
  results.success = results.successful_bookings.length > 0;
  
  if (results.successful_bookings.length === results.total_requested) {
    results.message = '所有課程預約成功';
  } else if (results.successful_bookings.length > 0) {
    results.message = `部分預約成功：${results.successful_bookings.length}/${results.total_requested}`;
  } else {
    results.message = '所有課程預約失敗';
  }
  
  return results;
};

// ========================================
// 24小時取消規則
// ========================================

/**
 * 檢查預約是否可以取消（24小時規則）
 * @param bookingId 預約ID
 * @returns 是否可以取消
 */
export const canCancelBooking = (bookingId: number): BookingValidationResult => {
  const booking = getBookingById(bookingId);
  
  if (!booking) {
    return { isValid: false, reason: '預約記錄不存在' };
  }
  
  if (booking.status !== 'CONFIRMED') {
    return { isValid: false, reason: '只有已確認的預約可以取消' };
  }
  
  const session = getCourseSessionById(booking.course_session_id);
  if (!session) {
    return { isValid: false, reason: '找不到對應的課程節' };
  }
  
  // 檢查24小時取消規則
  const now = new Date();
  const sessionStart = new Date(session.start_datetime);
  const hoursDifference = (sessionStart.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursDifference < 24) {
    return { isValid: false, reason: '課程開始前24小時內無法取消' };
  }
  
  return { isValid: true, session };
};

/**
 * 取消預約
 * @param bookingId 預約ID
 * @param reason 取消原因
 * @returns 取消結果
 */
export const cancelBooking = (bookingId: number, reason?: string): CancellationResult => {
  const validation = canCancelBooking(bookingId);
  
  if (!validation.isValid) {
    return {
      success: false,
      message: validation.reason || '取消失敗'
    };
  }
  
  const booking = getBookingById(bookingId)!;
  const now = new Date();
  
  // 更新預約狀態
  booking.status = 'CANCELLED';
  booking.notes = `${booking.notes}${booking.notes ? '; ' : ''}取消原因: ${reason || '用戶主動取消'}`;
  booking.updated_at = now.toISOString();
  
  // 返還會員卡課程數（如果需要的話）
  // 這裡可以實現課程數返還邏輯
  
  return {
    success: true,
    message: '預約已成功取消',
    booking
  };
};

/**
 * 批次取消預約
 * @param bookingIds 預約ID列表
 * @param reason 取消原因
 * @returns 批次取消結果
 */
export const cancelBatchBookings = (bookingIds: number[], reason?: string): {
  successful_cancellations: Booking[];
  failed_cancellations: { booking_id: number; reason: string; }[];
  message: string;
} => {
  const results = {
    successful_cancellations: [] as Booking[],
    failed_cancellations: [] as { booking_id: number; reason: string; }[],
    message: ''
  };
  
  for (const bookingId of bookingIds) {
    const cancellationResult = cancelBooking(bookingId, reason);
    
    if (cancellationResult.success && cancellationResult.booking) {
      results.successful_cancellations.push(cancellationResult.booking);
    } else {
      results.failed_cancellations.push({
        booking_id: bookingId,
        reason: cancellationResult.message
      });
    }
  }
  
  if (results.successful_cancellations.length === bookingIds.length) {
    results.message = '所有預約已成功取消';
  } else if (results.successful_cancellations.length > 0) {
    results.message = `部分預約取消成功：${results.successful_cancellations.length}/${bookingIds.length}`;
  } else {
    results.message = '所有預約取消失敗';
  }
  
  return results;
};

// ========================================
// 容量檢查機制
// ========================================

/**
 * 檢查課程容量
 * @param sessionId 課程節ID
 * @returns 容量資訊
 */
export const checkSessionCapacity = (sessionId: number) => {
  const session = getCourseSessionById(sessionId);
  if (!session) {
    return null;
  }
  
  const existingBookings = getBookingsBySessionId(sessionId);
  const confirmedBookings = existingBookings.filter(b => b.status === 'CONFIRMED');
  
  return {
    total_capacity: session.capacity,
    booked_count: confirmedBookings.length,
    available_spots: session.capacity - confirmedBookings.length,
    is_full: confirmedBookings.length >= session.capacity,
    waiting_list_count: 0 // 可以擴展等候名單功能
  };
};

/**
 * 獲取所有課程的容量狀態
 * @param sessionIds 課程節ID列表
 * @returns 容量狀態映射
 */
export const getBatchCapacityStatus = (sessionIds: number[]) => {
  const capacityMap = new Map();
  
  sessionIds.forEach(sessionId => {
    const capacity = checkSessionCapacity(sessionId);
    if (capacity) {
      capacityMap.set(sessionId, capacity);
    }
  });
  
  return capacityMap;
};

// ========================================
// 預約統計功能
// ========================================

/**
 * 獲取預約統計資料
 * @param userId 用戶ID（可選）
 * @returns 統計資料
 */
export const getBookingStatistics = (userId?: number): BookingStats => {
  let targetBookings = bookings;
  
  if (userId) {
    targetBookings = getBookingsByUserId(userId);
  }
  
  const stats: BookingStats = {
    total: targetBookings.length,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
    no_show: 0
  };
  
  targetBookings.forEach(booking => {
    switch (booking.status) {
      case 'CONFIRMED':
        stats.confirmed++;
        break;
      case 'CANCELLED':
        stats.cancelled++;
        break;
      case 'COMPLETED':
        stats.completed++;
        break;
      case 'NO_SHOW':
        stats.no_show++;
        break;
    }
  });
  
  return stats;
};

/**
 * 獲取用戶即將開始的預約
 * @param userId 用戶ID
 * @param hours 小時數（預設24小時內）
 * @returns 即將開始的預約列表
 */
export const getUpcomingBookings = (userId: number, hours: number = 24): Booking[] => {
  const userBookings = getBookingsByUserId(userId);
  const now = new Date();
  const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
  
  return userBookings.filter(booking => {
    if (booking.status !== 'CONFIRMED') return false;
    
    const session = getCourseSessionById(booking.course_session_id);
    if (!session) return false;
    
    const sessionStart = new Date(session.start_datetime);
    return sessionStart >= now && sessionStart <= futureTime;
  });
};

// ========================================
// 預設匯出
// ========================================

const bookingServiceModule = {
  validateSingleBooking,
  createSingleBooking,
  createBatchBooking,
  canCancelBooking,
  cancelBooking,
  cancelBatchBookings,
  checkSessionCapacity,
  getBatchCapacityStatus,
  getBookingStatistics,
  getUpcomingBookings
};

export default bookingServiceModule;