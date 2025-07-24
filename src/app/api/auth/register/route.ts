import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/dataService';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone } = await request.json();

    // 驗證必填欄位
    if (!email || !password || !name || !phone) {
      return NextResponse.json(
        { success: false, error: 'MISSING_REQUIRED_FIELDS' },
        { status: 400 }
      );
    }

    // 驗證 Email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_EMAIL_FORMAT' },
        { status: 400 }
      );
    }

    // 調用註冊服務
    const result = await authService.register(email, password, name, phone);

    if (!result.success) {
      // 檢查是否為 Email 已存在錯誤
      if (result.error === 'EMAIL_ALREADY_EXISTS') {
        return NextResponse.json(
          { success: false, error: 'EMAIL_ALREADY_EXISTS' },
          { status: 409 } // HTTP 409 Conflict
        );
      }

      return NextResponse.json(
        { success: false, error: result.error || 'REGISTRATION_FAILED' },
        { status: 400 }
      );
    }

    // 註冊成功，返回 user_id 和 JWT
    return NextResponse.json(
      {
        success: true,
        user_id: result.user_id,
        jwt: result.jwt
      },
      { status: 200 } // HTTP 200 OK
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}