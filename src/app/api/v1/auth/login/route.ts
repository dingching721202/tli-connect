import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'
import { usersService } from '@/lib/supabase/services/users'
import { ApiResponse } from '@/lib/supabase/types'

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  user: {
    id: string
    email: string
    full_name: string
    avatar_url: string | null
    campus: string
    roles: string[]
    permissions: string[]
  }
  access_token: string
  refresh_token: string
  expires_in: number
  session_id: string
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const supabase = createServerSupabaseClient()
    
    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password
    })

    if (authError) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        data: null,
        error: {
          code: 'AUTH_001',
          message: 'Invalid credentials',
          details: authError.message
        }
      }
      return NextResponse.json(errorResponse, { status: 401 })
    }

    if (!authData.user || !authData.session) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        data: null,
        error: {
          code: 'AUTH_002',
          message: 'Authentication failed',
          details: 'No user or session returned'
        }
      }
      return NextResponse.json(errorResponse, { status: 401 })
    }

    // Get user profile and roles
    const { data: userProfile, error: profileError } = await usersService.getUserById(authData.user.id)
    const { data: roles } = await usersService.getUserRoles(authData.user.id)

    if (profileError || !userProfile) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        data: null,
        error: {
          code: 'AUTH_003',
          message: 'Failed to load user profile',
          details: profileError?.message
        }
      }
      return NextResponse.json(errorResponse, { status: 500 })
    }

    // Update last login
    await usersService.updateLastLogin(authData.user.id)

    const response: ApiResponse<LoginResponse> = {
      success: true,
      data: {
        user: {
          id: userProfile.id,
          email: userProfile.email,
          full_name: userProfile.full_name,
          avatar_url: userProfile.avatar_url,
          campus: userProfile.campus,
          roles: roles || [],
          permissions: [] // TODO: Implement permissions logic
        },
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_in: authData.session.expires_in || 3600,
        session_id: authData.session.user.id
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
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}