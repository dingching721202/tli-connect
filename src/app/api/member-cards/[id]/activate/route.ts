import { NextRequest, NextResponse } from 'next/server';
import { memberCardService } from '@/services/dataService';
import { jwtUtils } from '@/lib/jwt';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 驗證 JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwtUtils.verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const membershipId = parseInt(params.id);
    if (isNaN(membershipId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid membership ID' },
        { status: 400 }
      );
    }

    // 呼叫會員卡啟用服務
    const result = await memberCardService.activateMemberCard(decoded.userId, membershipId);

    if (!result.success) {
      // 根據錯誤類型返回適當的狀態碼
      if (result.error === 'ACTIVE_CARD_EXISTS') {
        return NextResponse.json(
          { success: false, error: 'ACTIVE_CARD_EXISTS', message: '您已有啟用中的會員卡' },
          { status: 422 }
        );
      }
      
      if (result.error === 'Membership not found or not purchased') {
        return NextResponse.json(
          { success: false, error: 'MEMBERSHIP_NOT_FOUND', message: '找不到可啟用的會員卡' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result.data!.id,
        status: result.data!.status,
        activated_at: result.data!.start_time,
        expire_at: result.data!.expire_time,
        duration_days: result.data!.duration_in_days
      },
      message: '會員卡啟用成功'
    });

  } catch (error) {
    console.error('Error activating member card:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}