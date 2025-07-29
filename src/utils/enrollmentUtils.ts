// 預約數據計算工具模組 - 提供統一的預約數量計算邏輯

// Hash function for generating consistent timeslot IDs
export const hashString = (str: string): number => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// 計算特定時段的實際預約數量
export const getActualEnrollmentCount = (timeslotId: number): number => {
  if (typeof localStorage === 'undefined') return 0;
  
  try {
    const appointments = JSON.parse(localStorage.getItem('classAppointments') || '[]');
    return appointments.filter((appointment: { 
      class_timeslot_id: number; 
      status: string 
    }) => 
      appointment.class_timeslot_id === timeslotId && 
      appointment.status === 'CONFIRMED'
    ).length;
  } catch (error) {
    console.error('計算預約數量時發生錯誤:', error);
    return 0;
  }
};

// 根據 session ID 計算預約數量
export const getEnrollmentCountBySessionId = (sessionId: string): number => {
  const timeslotId = hashString(sessionId);
  return getActualEnrollmentCount(timeslotId);
};

// 檢查特定用戶是否已預約指定時段
export const checkUserBooking = (userId: number, timeslotId: number): boolean => {
  if (typeof localStorage === 'undefined') return false;
  
  try {
    const appointments = JSON.parse(localStorage.getItem('classAppointments') || '[]');
    return appointments.some((appointment: { 
      user_id: number; 
      class_timeslot_id: number; 
      status: string 
    }) => 
      appointment.user_id === userId && 
      appointment.class_timeslot_id === timeslotId && 
      appointment.status === 'CONFIRMED'
    );
  } catch (error) {
    console.error('檢查用戶預約狀態時發生錯誤:', error);
    return false;
  }
};

// 獲取特定時段的所有預約詳情
export const getTimeslotAppointments = (timeslotId: number) => {
  if (typeof localStorage === 'undefined') return [];
  
  try {
    const appointments = JSON.parse(localStorage.getItem('classAppointments') || '[]');
    return appointments.filter((appointment: { 
      class_timeslot_id: number; 
      status: string 
    }) => 
      appointment.class_timeslot_id === timeslotId && 
      appointment.status === 'CONFIRMED'
    );
  } catch (error) {
    console.error('獲取預約詳情時發生錯誤:', error);
    return [];
  }
};

// 獲取用戶的所有預約
export const getUserAppointments = (userId: number) => {
  if (typeof localStorage === 'undefined') return [];
  
  try {
    const appointments = JSON.parse(localStorage.getItem('classAppointments') || '[]');
    return appointments.filter((appointment: { 
      user_id: number; 
      status: string 
    }) => 
      appointment.user_id === userId && 
      appointment.status === 'CONFIRMED'
    );
  } catch (error) {
    console.error('獲取用戶預約時發生錯誤:', error);
    return [];
  }
};

// 預約統計信息
export const getEnrollmentStats = () => {
  if (typeof localStorage === 'undefined') return { total: 0, confirmed: 0, cancelled: 0 };
  
  try {
    const appointments = JSON.parse(localStorage.getItem('classAppointments') || '[]');
    const confirmed = appointments.filter((a: { status: string }) => a.status === 'CONFIRMED').length;
    const cancelled = appointments.filter((a: { status: string }) => a.status === 'CANCELED').length;
    
    return {
      total: appointments.length,
      confirmed,
      cancelled
    };
  } catch (error) {
    console.error('獲取預約統計時發生錯誤:', error);
    return { total: 0, confirmed: 0, cancelled: 0 };
  }
};

// 檢查課程是否額滿
export const isCourseFullBySessionId = (sessionId: string, capacity: number): boolean => {
  const enrollmentCount = getEnrollmentCountBySessionId(sessionId);
  return enrollmentCount >= capacity;
};

// 檢查課程是否額滿（直接使用 timeslot ID）
export const isCourseFull = (timeslotId: number, capacity: number): boolean => {
  const enrollmentCount = getActualEnrollmentCount(timeslotId);
  return enrollmentCount >= capacity;
};