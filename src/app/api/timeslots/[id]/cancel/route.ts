import { NextRequest, NextResponse } from 'next/server';
import { staffService } from '@/services/dataService';

// POST /api/timeslots/[id]/cancel - 課務取消課程時段 (US08)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const timeslotId = parseInt(params.id);
    
    if (isNaN(timeslotId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid timeslot ID' },
        { status: 400 }
      );
    }

    const result = await staffService.cancelTimeslot(timeslotId);
    
    if (!result.success) {
      if (result.error === 'Timeslot not found') {
        return NextResponse.json(
          { success: false, error: 'Timeslot not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Timeslot canceled successfully'
    });

  } catch (error) {
    console.error('Error canceling timeslot:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}