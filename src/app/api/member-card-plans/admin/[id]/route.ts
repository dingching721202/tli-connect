import { NextRequest, NextResponse } from 'next/server';
import { memberCardPlanStore } from '@/lib/memberCardPlanStore';

// PUT - 更新方案
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const planId = parseInt(params.id);
    const body = await request.json();
    
    const updatedPlan = memberCardPlanStore.updatePlan(planId, body);
    
    if (!updatedPlan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedPlan
    });
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}

// DELETE - 刪除方案
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const planId = parseInt(params.id);
    
    const success = memberCardPlanStore.deletePlan(planId);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete plan' },
      { status: 500 }
    );
  }
}