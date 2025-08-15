import { NextRequest, NextResponse } from 'next/server'
import { usersService } from '@/lib/supabase/services/users'
import { ApiResponse, Role, Campus } from '@/lib/supabase/types'

interface _GetUsersRequest {
  page: number
  limit: number
  campus?: Campus
  role?: Role
  is_active?: boolean
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

interface CreateUserRequest {
  email: string
  password: string
  full_name: string
  phone?: string
  campus: Campus
  avatar_url?: string
}

// GET /api/v1/users - List users with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      campus: searchParams.get('campus') as Campus,
      role: searchParams.get('role') as Role,
      is_active: searchParams.get('is_active') === 'true' ? true : undefined,
      search: searchParams.get('search') || undefined
    }
    
    const pagination = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      orderBy: searchParams.get('sort_by') || 'full_name',
      ascending: searchParams.get('sort_order') === 'asc'
    }
    
    const result = await usersService.getUsers(filters, pagination)
    
    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
      message: 'Users retrieved successfully'
    }
    
    return NextResponse.json(response)
  } catch (error) {
    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error: {
        code: 'USER_001',
        message: 'Failed to retrieve users',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// POST /api/v1/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body: CreateUserRequest = await request.json()
    
    // Validate required fields
    if (!body.email || !body.password || !body.full_name || !body.campus) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        data: null,
        error: {
          code: 'USER_002',
          message: 'Missing required fields',
          details: 'email, password, full_name, and campus are required'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    const { data: user, error } = await usersService.createUser({
      email: body.email,
      password: body.password,
      full_name: body.full_name,
      phone: body.phone,
      campus: body.campus,
      avatar_url: body.avatar_url
    })

    if (error || !user) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        data: null,
        error: {
          code: 'USER_003',
          message: 'Failed to create user',
          details: error?.message || 'User creation failed'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Get roles for the created user
    const { data: roles } = await usersService.getUserRoles(user.id)

    const response: ApiResponse<{
      user: typeof user & { roles: Role[] }
    }> = {
      success: true,
      data: {
        user: {
          ...user,
          roles: roles || []
        }
      },
      message: 'User created successfully'
    }
    
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error: {
        code: 'USER_003',
        message: 'Failed to create user',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}