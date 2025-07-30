// ========================================
// 向下相容性檔案
// 將舊的 class_timeslots 對應到新的 courseSessions
// ========================================

import { courseSessions, getCourseSessionById, getCourseSessionsByScheduleId } from './courseSessions';

// 向下相容的別名
export const class_timeslots = courseSessions;
export const classTimeslots = courseSessions; // 另一個別名

// 向下相容的函數別名
export const getTimeslotById = getCourseSessionById;
export const getTimeslotsByClassId = getCourseSessionsByScheduleId;

// 預設匯出
export default courseSessions;