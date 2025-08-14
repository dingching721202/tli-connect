import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, LoginRequest, LoginResponse } from '@/types/unified'

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    
    // TODO: Implement authentication logic with Supabase
    // This is a placeholder for the unified authentication system
    
    const response: ApiResponse<LoginResponse> = {
      success: true,
      data: {
        user: {
          id: '',
          email: body.email,
          full_name: '',
          avatar_url: '',
          campus: 'TAIPEI',
          roles: [],
          permissions: []
        },
        access_token: '',
        refresh_token: '',
        expires_in: 3600,
        session_id: ''
      },
      message: 'Login successful'
    }
    
    return NextResponse.json(response)
  } catch (error) {
    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error: {
        code: 'AUTH_001',
        message: 'Authentication failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
    
    return NextResponse.json(errorResponse, { status: 401 })
  }
}