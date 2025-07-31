import { bookings } from './bookings';

// ========================================
// 課程預約資料 - 已清空
// ========================================

export const classAppointments: unknown[] = [];

// ========================================
// 輔助函數
// ========================================

// 根據ID獲取預約
export const getAppointmentById = (id: number) => {
  return classAppointments.find(appointment => appointment.id === id);
};

// 獲取統計
export const getAppointmentStatistics = () => {
  return {
    total: classAppointments.length
  };
};

// 向下相容的預設匯出
export default classAppointments;