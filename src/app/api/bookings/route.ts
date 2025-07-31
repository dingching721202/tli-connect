import { NextRequest, NextResponse } from 'next/server';
import { bookingService } from '@/services/dataService';

// GET - 獲取預約列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const status = searchParams.get('status');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing user_id parameter' },
        { status: 400 }
      );
    }

    // 獲取用戶的預約記錄
    const bookings = await bookingService.getUserAppointments(parseInt(userId));
    
    // 根據狀態過濾
    let filteredBookings = bookings;
    if (status) {
      filteredBookings = bookings.filter(booking => booking.status === status);
    }
    
    return NextResponse.json({
      success: true,
      data: filteredBookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}