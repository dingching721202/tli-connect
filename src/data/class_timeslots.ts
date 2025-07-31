import { courseSessions, getCourseSessionById, getCourseSessionsByScheduleId } from './courseSessions';

// ========================================
// 課程時段資料 - 已清空
// ========================================

export const classTimeslots: unknown[] = [];

// ========================================
// 輔助函數
// ========================================

// 根據ID獲取時段
export const getTimeslotById = (id: number) => {
  return classTimeslots.find(slot => slot.id === id);
};

// 獲取統計
export const getTimeslotStatistics = () => {
  return {
    total: classTimeslots.length
  };
};

// 向下相容的預設匯出
export default classTimeslots;