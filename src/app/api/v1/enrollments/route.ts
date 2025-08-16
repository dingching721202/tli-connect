import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/types/unified'

// Temporary type definitions until proper types are exported
type GetEnrollmentsRequest = {
  page: number
  limit: number
  user_id?: string
  session_id?: string
  schedule_id?: string
  campus?: '羅斯福校' | '士林校' | '台中校' | '高雄校' | '總部' | null
  status?: 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | null
  date_from?: string
  date_to?: string
  sort_by?: 'enrollment_date' | 'session_date' | 'status'
  sort_order?: 'asc' | 'desc'
}

type GetEnrollmentsResponse = {
  enrollments: unknown[]
  total: number
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

type CreateEnrollmentRequest = {
  user_id: number
  session_id: string
}

type CreateEnrollmentResponse = {
  enrollment: {
    id: string
    user_id: number
    session_id: string
    status: string
    enrolled_at: string
    created_at: string
  }
}

// GET /api/v1/enrollments - List course enrollments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters: GetEnrollmentsRequest = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      user_id: searchParams.get('user_id') || undefined,
      session_id: searchParams.get('session_id') || undefined,
      schedule_id: searchParams.get('schedule_id') || undefined,
      campus: searchParams.get('campus') as '羅斯福校' | '士林校' | '台中校' | '高雄校' | '總部' | null,
      status: searchParams.get('status') as 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | null,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      sort_by: (searchParams.get('sort_by') as 'enrollment_date' | 'session_date' | 'status') || 'enrollment_date',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc'
    }
    
    // TODO: Implement enrollment listing with Supabase
    // - Query course_enrollments table
    // - Join with course_sessions, schedules, templates for course details
    // - Join with core_users for student information
    // - Apply filters and pagination
    // - Apply RLS policies
    
    const response: ApiResponse<GetEnrollmentsResponse> = {
      success: true,
      data: {
        enrollments: [],
        total: 0,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: 0,
          total_pages: 0
        }
      }
    }
    
    return NextResponse.json(response)
  } catch (error) {
    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error: {
        code: 'ENROLLMENT_001',
        message: 'Failed to retrieve enrollments',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// POST /api/v1/enrollments - Create new enrollment
export async function POST(request: NextRequest) {
  try {
    const body: CreateEnrollmentRequest = await request.json()
    
    // TODO: Implement enrollment creation with Supabase
    // - Validate user exists and has active membership
    // - Validate session exists and has capacity
    // - Check for duplicate enrollments
    // - Verify user membership covers the session date
    // - Create record in course_enrollments table
    // - Update course_sessions.actual_capacity
    // - Log activity
    // - Apply RLS policies
    // - Send confirmation notification
    
    const response: ApiResponse<CreateEnrollmentResponse> = {
      success: true,
      data: {
        enrollment: {
          id: '',
          user_id: body.user_id,
          session_id: body.session_id,
          status: 'CONFIRMED',
          enrolled_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      }
    }
    
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error: {
        code: 'ENROLLMENT_002',
        message: 'Failed to create enrollment',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
    
    return NextResponse.json(errorResponse, { status: 400 })
  }
}

// TODO: Batch enrollment endpoint should be moved to /api/v1/enrollments/batch/route.ts