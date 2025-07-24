import { NextRequest, NextResponse } from 'next/server';
import { validateJWT } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // 從 Authorization header 中驗證 JWT
    const payload = validateJWT(request);
    
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    // Token 有效，返回用戶資訊
    return NextResponse.json(
      {
        success: true,
        user: {
          userId: payload.userId,
          email: payload.email,
          role: payload.role
        },
        token_info: {
          issued_at: new Date(payload.iat * 1000).toISOString(),
          expires_at: new Date(payload.exp * 1000).toISOString()
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}