// 課程連結工具 - 統一獲取課程連結的接口
import { generateBookingSessions } from '@/data/courseBookingIntegration';
import { hashString } from '@/utils/enrollmentUtils';

export interface CourseLinks {
  classroom: string | null;
  materials: string | null;
  hasValidClassroom: boolean;
  hasValidMaterials: boolean;
}

/**
 * 驗證連結是否有效
 */
function isValidLink(link: string | null): boolean {
  if (!link || link.trim() === '') return false;
  
  try {
    if (link.startsWith('http://') || link.startsWith('https://')) {
      new URL(link);
      return true;
    }
    if (link.startsWith('/') || link.startsWith('./') || link.startsWith('../')) {
      return true;
    }
    if (link.includes('.')) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * 從時段ID獲取課程連結（主要方法）
 * @param timeslotId 時段ID
 * @returns 課程連結對象
 */
export function getCourseLinksFromTimeslot(timeslotId: number): CourseLinks {
  console.log(`🔍 獲取課程連結: timeslotId=${timeslotId}`);
  
  try {
    const allSessions = generateBookingSessions();
    const session = allSessions.find(s => {
      const sessionHashId = hashString(s.id);
      return sessionHashId === timeslotId;
    });
    
    if (!session) {
      console.warn(`❌ 未找到時段: ${timeslotId}`);
      return { classroom: null, materials: null, hasValidClassroom: false, hasValidMaterials: false };
    }
    
    const classroom = session.classroom_link || session.classroom || null;
    const materials = session.material_link || session.materials || null;
    
    return {
      classroom: isValidLink(classroom) ? classroom : null,
      materials: isValidLink(materials) ? materials : null,
      hasValidClassroom: isValidLink(classroom),
      hasValidMaterials: isValidLink(materials)
    };
  } catch (error) {
    console.error('獲取課程連結時發生錯誤:', error);
    return { classroom: null, materials: null, hasValidClassroom: false, hasValidMaterials: false };
  }
}

/**
 * 從預約對象獲取課程連結（通用方法）
 * @param booking 預約對象
 * @returns 課程連結對象
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCourseLinksFromBooking(booking: Record<string, unknown> | any): CourseLinks {
  console.log(`🔍 從預約獲取課程連結:`, booking);
  
  // 方法1：使用時段ID
  if (booking.class_timeslot_id || booking.timeslot?.id || booking.timeslotId) {
    const timeslotId = booking.class_timeslot_id || booking.timeslot?.id || booking.timeslotId;
    return getCourseLinksFromTimeslot(timeslotId);
  }
  
  // 方法2：使用直接連結
  if (booking.classroom || booking.materials || booking.classroom_link || booking.material_link) {
    const classroom = booking.classroom_link || booking.classroom || null;
    const materials = booking.material_link || booking.materials || null;
    
    return {
      classroom: isValidLink(classroom) ? classroom : null,
      materials: isValidLink(materials) ? materials : null,
      hasValidClassroom: isValidLink(classroom),
      hasValidMaterials: isValidLink(materials)
    };
  }
  
  console.warn(`❌ 無法從預約對象獲取連結`);
  return { classroom: null, materials: null, hasValidClassroom: false, hasValidMaterials: false };
}

// 向後兼容的函數別名
export const getCourseLinksForLesson = getCourseLinksFromTimeslot;
export const getValidCourseLinks = getCourseLinksFromBooking;