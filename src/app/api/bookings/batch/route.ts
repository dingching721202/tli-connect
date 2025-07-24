import { NextRequest, NextResponse } from 'next/server';
import { bookingService } from '@/services/dataService';
import { jwtUtils } from '@/lib/jwt';

// USER STORY 06: 批量預約多堂課程
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { timeslot_ids } = body;

    // 驗證請求參數
    if (!timeslot_ids || !Array.isArray(timeslot_ids) || timeslot_ids.length === 0) {
      return NextResponse.json(
        { error: 'timeslot_ids is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    // 驗證 JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwtUtils.verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // 呼叫批量預約服務
    const result = await bookingService.batchBooking(decoded.userId, timeslot_ids);

    // 返回符合 USER STORY 06 要求的格式
    return NextResponse.json({
      success: result.success,
      failed: result.failed
    });

  } catch (error) {
    console.error('批量預約 API 錯誤:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}