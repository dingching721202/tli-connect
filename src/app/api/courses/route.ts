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
      title: session.schedule?.title || session.topic || `第${session.session_number}堂課`,
      teacher_name: 'TBD',
      price: 0,
      currency: 'TWD',
      date: session.start_time?.split('T')[0] || '',
      start_time: session.start_time || '',
      end_time: session.end_time || '',
      max_students: session.capacity || 0,
      current_students: session.reserved_count || 0,
      available_slots: (session.capacity || 0) - (session.reserved_count || 0),
      level: 'intermediate',
      language: 'english',
      description: session.notes || '',
      is_available: ((session.capacity || 0) - (session.reserved_count || 0)) > 0
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