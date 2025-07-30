// ========================================
// 向下相容性檔案
// 將舊的 class_appointments 對應到新的 bookings
// ========================================

import { bookings } from './bookings';
import type { Booking } from '@/types/business';

// 向下相容的別名
export const class_appointments = bookings;
export const classAppointments = bookings; // 另一個別名

// ========================================
// 向下相容的函數別名
// ========================================

// 根據用戶ID獲取預約
export const getAppointmentsByUserId = (userId: number): Booking[] => {
  return bookings.filter(booking => booking.user_id === userId);
};

// 根據課程節次ID獲取預約
export const getAppointmentsByTimeslotId = (timeslotId: number): Booking[] => {
  return bookings.filter(booking => booking.course_session_id === timeslotId);
};

// 根據ID獲取預約
export const getAppointmentById = (id: number): Booking | undefined => {
  return bookings.find(booking => booking.id === id);
};

// 根據狀態獲取預約
export const getAppointmentsByStatus = (status: string): Booking[] => {
  return bookings.filter(booking => booking.status === status);
};

// 預設匯出
export default bookings;