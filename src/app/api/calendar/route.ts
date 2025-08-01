import { NextRequest, NextResponse } from 'next/server';
import { classTimeslots } from '@/data/class_timeslots';
import { classes } from '@/data/classes';
import { courses } from '@/data/courses';
import { memberships } from '@/data/memberships';
import { memberCards } from '@/data/member_cards';

interface CalendarTimeslot {
  id: number;
  class_id: number;
  lesson_id: number;
  session_number: number;
  start_time: string;
  end_time: string;
  status: 'AVAILABLE' | 'CREATED' | 'CANCELED';
  location: string;
  capacity: number;
  reserved_count: number;
  course_title: string;
  course_id: number;
  teacher_name: string;
  teacher_id: string;
  booking_status: 'available' | 'full' | 'locked' | 'cancelled';
  disabled_reason?: string;
}

// GET - 獲取學員可預約的課程日曆時段
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // 驗證必要參數
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing user_id parameter' },
        { status: 400 }
      );
    }

    // 檢查學員的會員資格
    const userMemberships = memberships.filter(
      membership => membership.user_id === parseInt(userId) && 
      membership.status === 'ACTIVE' && 
      membership.activated
    );

    if (userMemberships.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No active membership found for this user'
      });
    }

    // 獲取學員有權益的課程ID
    const availableCourseIds = new Set<number>();
    
    for (const membership of userMemberships) {
      const memberCard = memberCards.find(card => card.id === membership.member_card_id);
      if (memberCard) {
        memberCard.available_course_ids.forEach(courseId => {
          if (typeof courseId === 'number') {
            availableCourseIds.add(courseId);
          }
        });
      }
    }

    if (availableCourseIds.size === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No courses available for your membership plan'
      });
    }

    // 過濾時段條件
    const currentTime = new Date();
    const twentyFourHoursFromNow = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);

    const filteredTimeslots = classTimeslots.filter(timeslot => {
      // 1. 僅列出 status = CREATED 的時段
      if (timeslot.status !== 'CREATED') {
        return false;
      }

      // 獲取班級和課程信息
      const classInfo = classes.find(c => c.id === timeslot.class_id);
      if (!classInfo) return false;

      const course = courses.find(c => c.id === classInfo.course_id);
      if (!course) return false;

      // 2. 檢查課程是否在學員的權益範圍內
      if (!availableCourseIds.has(course.id)) {
        return false;
      }

      // 日期範圍過濾（如果提供）
      if (startDate && endDate) {
        const timeslotDate = new Date(timeslot.start_time);
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (timeslotDate < start || timeslotDate > end) {
          return false;
        }
      }

      return true;
    });

    // 轉換為前端需要的格式並加上預約狀態
    const calendarTimeslots: CalendarTimeslot[] = filteredTimeslots.map(timeslot => {
      const classInfo = classes.find(c => c.id === timeslot.class_id);
      const course = courses.find(c => c.id === classInfo!.course_id);
      const timeslotStartTime = new Date(timeslot.start_time);
      
      // 判斷預約狀態
      let bookingStatus: 'available' | 'full' | 'locked' | 'cancelled' = 'available';
      let disabledReason: string | undefined;

      // 3. 距離開課 < 24h 的時段鎖定
      if (timeslotStartTime <= twentyFourHoursFromNow) {
        bookingStatus = 'locked';
        disabledReason = '距離開課少於24小時，無法預約';
      }
      // 2. 額滿時段設為 full 狀態
      else if (timeslot.reserved_count >= timeslot.capacity) {
        bookingStatus = 'full';
        disabledReason = '課程已額滿';
      }

      return {
        id: timeslot.id,
        class_id: timeslot.class_id,
        lesson_id: timeslot.lesson_id,
        session_number: timeslot.session_number,
        start_time: timeslot.start_time,
        end_time: timeslot.end_time,
        status: timeslot.status,
        location: timeslot.location,
        capacity: timeslot.capacity,
        reserved_count: timeslot.reserved_count,
        course_title: course!.title,
        course_id: course!.id,
        teacher_name: course!.teacher,
        teacher_id: course!.teacher_id,
        booking_status: bookingStatus,
        disabled_reason: disabledReason
      };
    });

    // 按開始時間排序
    calendarTimeslots.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    return NextResponse.json({
      success: true,
      data: calendarTimeslots,
      meta: {
        total_timeslots: calendarTimeslots.length,
        available_timeslots: calendarTimeslots.filter(t => t.booking_status === 'available').length,
        full_timeslots: calendarTimeslots.filter(t => t.booking_status === 'full').length,
        locked_timeslots: calendarTimeslots.filter(t => t.booking_status === 'locked').length,
        user_membership_courses: Array.from(availableCourseIds)
      }
    });

  } catch (error) {
    console.error('Error fetching calendar timeslots:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch calendar timeslots' },
      { status: 500 }
    );
  }
}