import type { Booking } from '@/types/business';

// ========================================
// 預約資料 - MECE架構
// 重新組織預約系統，對應新的課程架構
// ========================================

export const bookings: Booking[] = [
  // 學生1 (Alice Wang) 的預約
  {
    id: 1,
    user_id: 1,
    course_schedule_id: 1, // 基礎英文會話 - 8月班
    course_session_id: 1,  // 第一節課
    membership_id: 1,      // 使用標準方案會員卡
    booking_type: "SINGLE_SESSION",
    booking_date: "2025-07-20T10:30:00+00:00",
    session_date: "2025-08-01",
    session_time: "19:00-21:00",
    status: "CONFIRMED",
    payment_status: "PAID",
    payment_method: "MEMBERSHIP_DEDUCTION",
    notes: "學生主動預約第一堂英文課",
    cancellation_deadline: "2025-07-31T19:00:00+00:00",
    created_at: "2025-07-20T10:30:00+00:00",
    updated_at: "2025-07-20T10:30:00+00:00"
  },
  {
    id: 2,
    user_id: 1,
    course_schedule_id: 1, // 基礎英文會話 - 8月班
    course_session_id: 2,  // 第二節課
    membership_id: 1,
    booking_type: "SINGLE_SESSION",
    booking_date: "2025-07-22T14:20:00+00:00",
    session_date: "2025-08-03",
    session_time: "19:00-21:00",
    status: "CONFIRMED",
    payment_status: "PAID",
    payment_method: "MEMBERSHIP_DEDUCTION",
    notes: "",
    cancellation_deadline: "2025-08-02T19:00:00+00:00",
    created_at: "2025-07-22T14:20:00+00:00",
    updated_at: "2025-07-22T14:20:00+00:00"
  },

  // 學生2 (Bob Chen) 的預約 - 尚未啟用會員卡
  {
    id: 3,
    user_id: 2,
    course_schedule_id: 3, // 基礎中文會話 - 8月班
    course_session_id: 8,  // 第一節中文課
    membership_id: undefined, // 沒有使用會員卡
    booking_type: "SINGLE_SESSION",
    booking_date: "2025-07-25T16:45:00+00:00",
    session_date: "2025-08-06",
    session_time: "14:00-16:00",
    status: "PENDING_PAYMENT",
    payment_status: "PENDING",
    payment_method: "CREDIT_CARD",
    payment_amount: 400, // 單堂課程費用
    currency: "TWD",
    notes: "體驗課程，付費預約",
    cancellation_deadline: "2025-08-05T14:00:00+00:00",
    created_at: "2025-07-25T16:45:00+00:00",
    updated_at: "2025-07-25T16:45:00+00:00"
  },

  // 學生3 (Charlie Lin) 的多節課預約
  {
    id: 4,
    user_id: 3,
    course_schedule_id: 4, // 商務英語進階 - 8月班
    course_session_id: 4,  // 第一節商務英語課
    membership_id: 3,
    booking_type: "SINGLE_SESSION",
    booking_date: "2025-07-18T09:15:00+00:00",
    session_date: "2025-08-05",
    session_time: "20:00-22:00",
    status: "CONFIRMED",
    payment_status: "PAID",
    payment_method: "MEMBERSHIP_DEDUCTION",
    notes: "高階商務英語學習",
    cancellation_deadline: "2025-08-04T20:00:00+00:00",
    created_at: "2025-07-18T09:15:00+00:00",
    updated_at: "2025-07-18T09:15:00+00:00"
  },
  {
    id: 5,
    user_id: 3,
    course_schedule_id: 4, // 商務英語進階 - 8月班
    course_session_id: 5,  // 第二節商務英語課
    membership_id: 3,
    booking_type: "SINGLE_SESSION",
    booking_date: "2025-07-20T11:30:00+00:00",
    session_date: "2025-08-07",
    session_time: "20:00-22:00",
    status: "CONFIRMED",
    payment_status: "PAID",
    payment_method: "MEMBERSHIP_DEDUCTION",
    notes: "",
    cancellation_deadline: "2025-08-06T20:00:00+00:00",
    created_at: "2025-07-20T11:30:00+00:00",
    updated_at: "2025-07-20T11:30:00+00:00"
  },

  // 外國學生8 (David Wilson) 的試用課程預約
  {
    id: 6,
    user_id: 8,
    course_schedule_id: 3, // 基礎中文會話 - 8月班
    course_session_id: 8,  // 第一節中文課
    membership_id: 5,      // 使用試用方案
    booking_type: "SINGLE_SESSION",
    booking_date: "2025-07-21T13:20:00+00:00",
    session_date: "2025-08-06",
    session_time: "14:00-16:00",
    status: "CONFIRMED",
    payment_status: "PAID",
    payment_method: "MEMBERSHIP_DEDUCTION",
    notes: "外國學生中文入門課程",
    cancellation_deadline: "2025-08-05T14:00:00+00:00",
    created_at: "2025-07-21T13:20:00+00:00",
    updated_at: "2025-07-21T13:20:00+00:00"
  },

  // TOEIC 課程預約
  {
    id: 7,
    user_id: 3,
    course_schedule_id: 6, // TOEIC 衝刺班 - 8月班
    course_session_id: 6,  // 第一節TOEIC課
    membership_id: 3,
    booking_type: "SINGLE_SESSION",
    booking_date: "2025-07-28T15:45:00+00:00",
    session_date: "2025-08-03",
    session_time: "09:00-12:00",
    status: "CONFIRMED",
    payment_status: "PAID",
    payment_method: "MEMBERSHIP_DEDUCTION",
    notes: "TOEIC考試準備",
    cancellation_deadline: "2025-08-02T09:00:00+00:00",
    created_at: "2025-07-28T15:45:00+00:00",
    updated_at: "2025-07-28T15:45:00+00:00"
  },
  {
    id: 8,
    user_id: 1,
    course_schedule_id: 6, // TOEIC 衝刺班 - 8月班
    course_session_id: 7,  // 第二節TOEIC課
    membership_id: 1,
    booking_type: "SINGLE_SESSION",
    booking_date: "2025-07-29T10:20:00+00:00",
    session_date: "2025-08-04",
    session_time: "09:00-12:00",
    status: "CONFIRMED",
    payment_status: "PAID",
    payment_method: "MEMBERSHIP_DEDUCTION",
    notes: "聽力練習課程",
    cancellation_deadline: "2025-08-03T09:00:00+00:00",
    created_at: "2025-07-29T10:20:00+00:00",
    updated_at: "2025-07-29T10:20:00+00:00"
  },

  // 企業員工預約 (使用企業方案)
  {
    id: 9,
    user_id: 7, // Frank Liu - 企業聯絡人
    course_schedule_id: 4, // 商務英語進階 - 8月班
    course_session_id: 4,  // 第一節商務英語課
    membership_id: 6,      // 企業方案
    booking_type: "CORPORATE_SESSION",
    booking_date: "2025-07-15T08:30:00+00:00",
    session_date: "2025-08-05",
    session_time: "20:00-22:00",
    status: "CONFIRMED",
    payment_status: "PAID",
    payment_method: "CORPORATE_ACCOUNT",
    notes: "企業員工商務英語培訓",
    cancellation_deadline: "2025-08-04T20:00:00+00:00",
    created_at: "2025-07-15T08:30:00+00:00",
    updated_at: "2025-07-15T08:30:00+00:00"
  },

  // 取消的預約範例
  {
    id: 10,
    user_id: 1,
    course_schedule_id: 5, // 日語入門 - 8月班
    course_session_id: 11, // 第一節日語課
    membership_id: 1,
    booking_type: "SINGLE_SESSION",
    booking_date: "2025-07-26T12:00:00+00:00",
    session_date: "2025-08-02",
    session_time: "19:00-21:00",
    status: "CANCELLED",
    payment_status: "REFUNDED",
    payment_method: "MEMBERSHIP_DEDUCTION",
    notes: "學生主動取消",
    cancellation_reason: "時間衝突",
    cancelled_at: "2025-07-30T10:00:00+00:00",
    cancelled_by: 1, // 學生自己取消
    cancellation_deadline: "2025-08-01T19:00:00+00:00",
    created_at: "2025-07-26T12:00:00+00:00",
    updated_at: "2025-07-30T10:00:00+00:00"
  },

  // 候補預約
  {
    id: 11,
    user_id: 8,
    course_schedule_id: 6, // TOEIC 衝刺班 - 8月班 (已滿)
    course_session_id: 6,
    membership_id: 5,
    booking_type: "SINGLE_SESSION",
    booking_date: "2025-07-29T16:30:00+00:00",
    session_date: "2025-08-03",
    session_time: "09:00-12:00",
    status: "WAITLISTED",
    payment_status: "PENDING",
    payment_method: "MEMBERSHIP_DEDUCTION",
    notes: "候補名單，等待有人取消",
    waitlist_position: 1,
    cancellation_deadline: "2025-08-02T09:00:00+00:00",
    created_at: "2025-07-29T16:30:00+00:00",
    updated_at: "2025-07-29T16:30:00+00:00"
  },

  // 批次預約範例 (整個課程系列)
  {
    id: 12,
    user_id: 3,
    course_schedule_id: 7, // 雅思寫作專修 - 8月班
    course_session_id: undefined, // 批次預約不指定單一課程
    membership_id: 3,
    booking_type: "FULL_COURSE",
    booking_date: "2025-07-24T11:15:00+00:00",
    session_date: undefined, // 批次預約不指定單一日期
    session_time: undefined,
    status: "CONFIRMED",
    payment_status: "PAID",
    payment_method: "MEMBERSHIP_DEDUCTION",
    notes: "整個雅思寫作課程系列預約",
    total_sessions: 16,
    sessions_attended: 0,
    sessions_remaining: 16,
    cancellation_deadline: "2025-08-06T19:30:00+00:00", // 第一堂課前24小時
    created_at: "2025-07-24T11:15:00+00:00",
    updated_at: "2025-07-24T11:15:00+00:00"
  }
];

// ========================================
// 輔助函數
// ========================================

// 根據用戶ID獲取預約
export const getBookingsByUserId = (userId: number): Booking[] => {
  return bookings.filter(booking => booking.user_id === userId);
};

// 根據課程排程ID獲取預約
export const getBookingsByScheduleId = (scheduleId: number): Booking[] => {
  return bookings.filter(booking => booking.course_schedule_id === scheduleId);
};

// 根據課程節次ID獲取預約
export const getBookingsBySessionId = (sessionId: number): Booking[] => {
  return bookings.filter(booking => booking.course_session_id === sessionId);
};

// 根據狀態獲取預約
export const getBookingsByStatus = (status: string): Booking[] => {
  return bookings.filter(booking => booking.status === status);
};

// 根據預約類型獲取預約
export const getBookingsByType = (type: string): Booking[] => {
  return bookings.filter(booking => booking.booking_type === type);
};

// 根據ID獲取預約
export const getBookingById = (id: number): Booking | undefined => {
  return bookings.find(booking => booking.id === id);
};

// 獲取用戶的即將到來的預約 (未來7天)
export const getUpcomingBookings = (userId: number): Booking[] => {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return bookings
    .filter(booking => 
      booking.user_id === userId && 
      booking.status === 'CONFIRMED' &&
      booking.session_date &&
      new Date(booking.session_date) >= now &&
      new Date(booking.session_date) <= nextWeek
    )
    .sort((a, b) => {
      if (!a.session_date || !b.session_date) return 0;
      return new Date(a.session_date).getTime() - new Date(b.session_date).getTime();
    });
};

// 獲取用戶的歷史預約
export const getHistoricalBookings = (userId: number): Booking[] => {
  const now = new Date();
  
  return bookings
    .filter(booking => 
      booking.user_id === userId &&
      booking.session_date &&
      new Date(booking.session_date) < now
    )
    .sort((a, b) => {
      if (!a.session_date || !b.session_date) return 0;
      return new Date(b.session_date).getTime() - new Date(a.session_date).getTime();
    });
};

// 檢查預約是否可以取消
export const canCancelBooking = (booking: Booking): boolean => {
  if (!booking.cancellation_deadline) return false;
  
  const now = new Date();
  const deadline = new Date(booking.cancellation_deadline);
  
  return now <= deadline && 
         (booking.status === 'CONFIRMED' || booking.status === 'PENDING_PAYMENT');
};

// 檢查課程節次是否已滿
export const isSessionFull = (sessionId: number, maxCapacity: number = 25): boolean => {
  const sessionBookings = getBookingsBySessionId(sessionId);
  const confirmedBookings = sessionBookings.filter(b => b.status === 'CONFIRMED');
  return confirmedBookings.length >= maxCapacity;
};

// 獲取課程節次的預約統計
export const getSessionBookingStats = (sessionId: number) => {
  const sessionBookings = getBookingsBySessionId(sessionId);
  
  return {
    total: sessionBookings.length,
    confirmed: sessionBookings.filter(b => b.status === 'CONFIRMED').length,
    pending: sessionBookings.filter(b => b.status === 'PENDING_PAYMENT').length,
    waitlisted: sessionBookings.filter(b => b.status === 'WAITLISTED').length,
    cancelled: sessionBookings.filter(b => b.status === 'CANCELLED').length
  };
};

// 獲取候補名單
export const getWaitlistBookings = (sessionId: number): Booking[] => {
  return bookings
    .filter(booking => 
      booking.course_session_id === sessionId && 
      booking.status === 'WAITLISTED'
    )
    .sort((a, b) => (a.waitlist_position || 0) - (b.waitlist_position || 0));
};

// 獲取需要付款的預約
export const getPendingPaymentBookings = (userId: number): Booking[] => {
  return bookings.filter(booking => 
    booking.user_id === userId && 
    booking.payment_status === 'PENDING'
  );
};

// 檢查用戶是否已預約某課程節次
export const hasUserBookedSession = (userId: number, sessionId: number): boolean => {
  return bookings.some(booking => 
    booking.user_id === userId && 
    booking.course_session_id === sessionId &&
    (booking.status === 'CONFIRMED' || booking.status === 'WAITLISTED')
  );
};

// 獲取即將到期的取消期限預約
export const getBookingsNearCancellationDeadline = (hours: number = 24): Booking[] => {
  const now = new Date();
  const deadline = new Date(now.getTime() + hours * 60 * 60 * 1000);
  
  return bookings.filter(booking => 
    booking.status === 'CONFIRMED' &&
    booking.cancellation_deadline &&
    new Date(booking.cancellation_deadline) <= deadline &&
    new Date(booking.cancellation_deadline) > now
  );
};

// 計算用戶的出席率
export const getUserAttendanceRate = (userId: number): number => {
  const historicalBookings = getHistoricalBookings(userId);
  const attendedBookings = historicalBookings.filter(b => 
    b.status === 'CONFIRMED' // 假設CONFIRMED且已過期表示出席
  );
  
  if (historicalBookings.length === 0) return 100;
  return Math.round((attendedBookings.length / historicalBookings.length) * 100);
};

// 向下相容的預設匯出
export default bookings;