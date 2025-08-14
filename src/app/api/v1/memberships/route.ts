import { NextRequest, NextResponse } from 'next/server'
import { membershipsService } from '@/lib/supabase/services/memberships'
import { ApiResponse, MembershipType, MembershipStatus, Campus } from '@/lib/supabase/types'

interface CreateMembershipRequest {
  user_id: string
  organization_id?: string
  plan_id: string
  type: MembershipType
  campus: Campus
  auto_renew?: boolean
}

// GET /api/v1/memberships - List memberships with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      user_id: searchParams.get('user_id') || undefined,
      organization_id: searchParams.get('organization_id') || undefined,
      type: searchParams.get('type') as MembershipType,
      status: searchParams.get('status') as MembershipStatus,
      campus: searchParams.get('campus') as Campus,
      card_number: searchParams.get('card_number') || undefined
    }
    
    const pagination = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      orderBy: searchParams.get('sort_by') || 'created_at',
      ascending: searchParams.get('sort_order') === 'asc'
    }
    
    const result = await membershipsService.getMemberships(filters, pagination)
    
    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
      message: 'Memberships retrieved successfully'
    }
    
    return NextResponse.json(response)
  } catch (error) {
    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error: {
        code: 'MEMBERSHIP_001',
        message: 'Failed to retrieve memberships',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// POST /api/v1/memberships - Create new membership
export async function POST(request: NextRequest) {
  try {
    const body: CreateMembershipRequest = await request.json()
    
    // Validate required fields
    if (!body.user_id || !body.plan_id || !body.type || !body.campus) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        data: null,
        error: {
          code: 'MEMBERSHIP_002',
          message: 'Missing required fields',
          details: 'user_id, plan_id, type, and campus are required'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // For corporate memberships, organization_id is required
    if (body.type === 'CORPORATE' && !body.organization_id) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        data: null,
        error: {
          code: 'MEMBERSHIP_003',
          message: 'organization_id is required for corporate memberships',
          details: 'Corporate memberships must be associated with an organization'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    const { data: membership, error } = await membershipsService.createMembership({
      user_id: body.user_id,
      organization_id: body.organization_id,
      plan_id: body.plan_id,
      type: body.type,
      campus: body.campus,
      auto_renew: body.auto_renew
    })

    if (error || !membership) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        data: null,
        error: {
          code: 'MEMBERSHIP_004',
          message: 'Failed to create membership',
          details: error?.message || 'Membership creation failed'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }
    
    const response: ApiResponse<{ membership: typeof membership }> = {
      success: true,
      data: { membership },
      message: 'Membership created successfully'
    }
    
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error: {
        code: 'MEMBERSHIP_005',
        message: 'Failed to create membership',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}