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
    
    if (isNaN(planId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    console.log('🔄 API 更新方案請求:', {
      planId,
      requestBody: body
    });
    
    const updatedPlan = await memberCardPlanStore.updatePlan(planId, body);
    
    if (!updatedPlan) {
      console.log('❌ 方案未找到:', planId);
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }

    console.log('✅ API 更新成功:', updatedPlan);
    
    return NextResponse.json({
      success: true,
      data: updatedPlan
    });
  } catch (error) {
    console.error('❌ API 更新方案錯誤:', error);
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
    
    const success = await memberCardPlanStore.deletePlan(planId);
    
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