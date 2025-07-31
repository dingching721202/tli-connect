import type { Booking } from '@/types/business';

// ========================================
// 預約資料 - MECE架構
// 管理課程預約紀錄
// ========================================

export const bookings: Booking[] = [];

// ========================================
// 輔助函數
// ========================================

// 根據用戶ID獲取預約
export const getBookingsByUserId = (userId: number): Booking[] => {
  return bookings.filter(booking => booking.user_id === userId);
};

// 根據課程節次ID獲取預約
export const getBookingsBySessionId = (sessionId: number): Booking[] => {
  return bookings.filter(booking => booking.course_session_id === sessionId);
};

// 根據狀態獲取預約
export const getBookingsByStatus = (status: Booking['status']): Booking[] => {
  return bookings.filter(booking => booking.status === status);
};

// 根據ID獲取預約
export const getBookingById = (id: number): Booking | undefined => {
  return bookings.find(booking => booking.id === id);
};

// 預約統計
export const getBookingStatistics = () => {
  const total = bookings.length;
  const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;
  const pending = bookings.filter(b => b.status === 'PENDING').length;
  const cancelled = bookings.filter(b => b.status === 'CANCELLED').length;
  const completed = bookings.filter(b => b.status === 'COMPLETED').length;
  
  return {
    total,
    by_status: { confirmed, pending, cancelled, completed }
  };
};

// 向下相容的預設匯出
export default bookings;