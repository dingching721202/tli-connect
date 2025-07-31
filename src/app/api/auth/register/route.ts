import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/dataService';
import type { ApiResponse, NewLoginResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone } = await request.json();

    // 驗證必填欄位
    if (!email || !password || !name || !phone) {
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

    // 調用註冊服務
    const result = await authService.register(email, password, name, phone);

    if (!result.success) {
      // 檢查是否為 Email 已存在錯誤
      if (result.error === 'EMAIL_ALREADY_EXISTS') {
        const response: ApiResponse<never> = {
          success: false,
          message: 'Email already exists',
          error_code: 'EMAIL_ALREADY_EXISTS',
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID()
        };
        return NextResponse.json(response, { status: 409 });
      }

      const response: ApiResponse<never> = {
        success: false,
        message: 'Registration failed',
        error_code: 'REGISTRATION_FAILED',
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID()
      };
      return NextResponse.json(response, { status: 400 });
    }

    // 註冊成功，返回新格式的響應
    const registerData: NewLoginResponse = {
      access_token: result.jwt!,
      refresh_token: result.jwt!, // 暫時使用同一個token
      expires_in: 3600, // 1小時
      user: {
        id: result.user_id!,
        name: name,
        email: email,
        role: 'STUDENT' // 新註冊用戶預設為學生
      }
    };

    const response: ApiResponse<NewLoginResponse> = {
      success: true,
      data: registerData,
      message: 'Registration successful',
      timestamp: new Date().toISOString(),
      request_id: crypto.randomUUID()
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Registration error:', error);
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