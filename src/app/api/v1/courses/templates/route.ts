import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/types/unified'

// Temporary type definitions until proper types are exported
type GetCourseTemplatesRequest = {
  page: number
  limit: number
  campus?: string | null
  category?: string
  level?: string
  is_active: boolean
  search?: string
  sort_by?: string
  sort_order?: string
}

type GetCourseTemplatesResponse = {
  templates: unknown[]
  total: number
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}


type CreateCourseTemplateRequest = {
  title: string
  description: string
  category?: string
  level?: string
  session_duration_minutes?: number
  max_capacity?: number
}

type CreateCourseTemplateResponse = {
  template: {
    id: string
    name: string
    description: string | null
    level: string | null
    category: string | null
    duration_minutes: number
    max_capacity: number
    is_active: boolean
    created_at: string
    updated_at: string
  }
}

// GET /api/v1/courses/templates - List course templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters: GetCourseTemplatesRequest = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      campus: searchParams.get('campus') as '羅斯福校' | '士林校' | '台中校' | '高雄校' | '總部' | null,
      category: searchParams.get('category') || undefined,
      level: searchParams.get('level') || undefined,
      is_active: searchParams.get('is_active') === 'true',
      search: searchParams.get('search') || undefined,
      sort_by: (searchParams.get('sort_by') as 'created_at' | 'name' | 'category' | 'level') || 'created_at',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc'
    }
    
    // TODO: Implement course template listing with Supabase
    // - Query course_templates table
    // - Apply filters and pagination
    // - Include usage statistics (schedule count, session count)
    // - Apply RLS policies
    
    const response: ApiResponse<GetCourseTemplatesResponse> = {
      success: true,
      data: {
        templates: [],
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
        code: 'COURSE_001',
        message: 'Failed to retrieve course templates',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// POST /api/v1/courses/templates - Create new course template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateCourseTemplateRequest
    
    // TODO: Implement course template creation with Supabase
    // - Validate required fields
    // - Create record in course_templates table
    // - Log activity
    // - Apply RLS policies
    
    const response: ApiResponse<CreateCourseTemplateResponse> = {
      success: true,
      data: {
        template: {
          id: '',
          name: body.title,
          description: body.description || null,
          category: body.category || null,
          level: body.level || null,
          duration_minutes: body.session_duration_minutes || 60,
          max_capacity: body.max_capacity || 20,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    }
    
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error: {
        code: 'COURSE_002',
        message: 'Failed to create course template',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
    
    return NextResponse.json(errorResponse, { status: 400 })
  }
}