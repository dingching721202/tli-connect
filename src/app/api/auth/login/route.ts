import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/dataService';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 驗證必填欄位
    if (!email || !password) {
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

    // 調用登入服務
    const result = await authService.login(email, password);

    if (!result.success) {
      // 檢查是否為認證失敗錯誤
      if (result.error === 'INVALID_CREDENTIALS') {
        return NextResponse.json(
          { success: false, error: 'INVALID_CREDENTIALS' },
          { status: 401 } // HTTP 401 Unauthorized
        );
      }

      return NextResponse.json(
        { success: false, error: result.error || 'LOGIN_FAILED' },
        { status: 400 }
      );
    }

    // 登入成功，返回 user_id 和 JWT
    return NextResponse.json(
      {
        success: true,
        user_id: result.user_id,
        jwt: result.jwt
      },
      { status: 200 } // HTTP 200 OK
    );

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}