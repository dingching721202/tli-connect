import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/dataService';
import type { ApiResponse, NewLoginResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 驗證必填欄位
    if (!email || !password) {
      const response: ApiResponse<never> = {
        success: false,
        message: 'Missing required fields',
        error_code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID()
      };
      return NextResponse.json(response, { status: 400 });
    }

    // 驗證 Email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const response: ApiResponse<never> = {
        success: false,
        message: 'Invalid email format',
        error_code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID()
      };
      return NextResponse.json(response, { status: 400 });
    }

    // 調用登入服務 (使用舊的LoginResponse型別)
    const result = await authService.login(email, password);

    if (!result.success) {
      // 檢查是否為認證失敗錯誤
      if (result.error === 'INVALID_CREDENTIALS') {
        const response: ApiResponse<never> = {
          success: false,
          message: 'Invalid email or password',
          error_code: 'INVALID_CREDENTIALS',
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID()
        };
        return NextResponse.json(response, { status: 401 });
      }

      const response: ApiResponse<never> = {
        success: false,
        message: 'Login failed',
        error_code: 'UNAUTHORIZED',
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID()
      };
      return NextResponse.json(response, { status: 400 });
    }

    // 登入成功，返回新格式的響應
    const loginData: NewLoginResponse = {
      access_token: result.jwt!,
      refresh_token: result.jwt!, // 暫時使用同一個token
      expires_in: 3600, // 1小時
      user: {
        id: result.user_id!,
        name: '', // 需要從用戶資料中獲取
        email: email,
        role: 'STUDENT' // 預設值，實際應從用戶資料獲取
      }
    };

    const response: ApiResponse<NewLoginResponse> = {
      success: true,
      data: loginData,
      message: 'Login successful',
      timestamp: new Date().toISOString(),
      request_id: crypto.randomUUID()
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    const response: ApiResponse<never> = {
      success: false,
      message: 'Internal server error',
      error_code: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString(),
      request_id: crypto.randomUUID()
    };
    return NextResponse.json(response, { status: 500 });
  }
}