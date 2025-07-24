import { NextResponse } from 'next/server';
import { memberCardPlanStore } from '@/lib/memberCardPlanStore';

export async function GET() {
  try {

    // 只返回已發布的方案，按照 USER STORY 02 規格
    const publishedPlans = memberCardPlanStore.getPublishedPlans();

    return NextResponse.json({
      success: true,
      data: publishedPlans
    });
  } catch (error) {
    console.error('Error fetching member card plans:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch member card plans' 
      },
      { status: 500 }
    );
  }
}