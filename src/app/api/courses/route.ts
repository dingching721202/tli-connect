import { NextRequest, NextResponse } from 'next/server';
import { generateBookingSessions } from '@/data/courseBookingIntegration';

// GET - 獲取課程列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const availableOnly = searchParams.get('available_only') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    
    // 從課程預約整合系統獲取課程時段
    const allSessions = generateBookingSessions();
    
    // 轉換為課程格式
    const courses = allSessions.map(session => ({
      id: session.id,
      title: session.courseTitle,
      teacher_name: session.teacherName,
      price: session.price || 0,
      currency: session.currency || 'TWD',
      date: session.date,
      start_time: session.startTime,
      end_time: session.endTime,
      max_students: session.maxStudents,
      current_students: session.currentStudents,
      available_slots: session.maxStudents - session.currentStudents,
      level: session.level || 'intermediate',
      language: session.language || 'english',
      description: session.description || '',
      is_available: (session.maxStudents - session.currentStudents) > 0
    }));
    
    // 根據參數過濾
    let filteredCourses = courses;
    
    if (availableOnly) {
      filteredCourses = courses.filter(course => course.is_available);
    }
    
    // 按日期排序
    filteredCourses.sort((a, b) => new Date(`${a.date} ${a.start_time}`).getTime() - new Date(`${b.date} ${b.start_time}`).getTime());
    
    // 限制返回數量
    if (limit) {
      filteredCourses = filteredCourses.slice(0, limit);
    }
    
    return NextResponse.json({
      success: true,
      data: filteredCourses,
      total: filteredCourses.length
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}