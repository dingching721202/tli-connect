import { NextResponse } from 'next/server';
import { memberCardPlanStore } from '@/lib/memberCardPlanStore';

export async function GET() {
  try {
    // 只返回已發布的方案，按照 USER STORY 02 規格
    const publishedPlans = memberCardPlanStore.getPublishedPlans();

    // 轉換為 US02 指定的格式
    const formattedPlans = publishedPlans.map(plan => ({
      plan_id: plan.id,
      title: plan.title,
      type: plan.duration_type === 'season' ? 'SEASON' : 'YEAR',
      duration_days: plan.duration_days,
      price: parseFloat(plan.sale_price),
      // 保留原有欄位以便前端使用
      id: plan.id,
      user_type: plan.user_type,
      duration_type: plan.duration_type,
      original_price: plan.original_price,
      sale_price: plan.sale_price,
      features: plan.features,
      popular: plan.popular,
      description: plan.description,
      hide_price: plan.hide_price,
      cta_options: plan.cta_options
    }));

    return NextResponse.json({
      success: true,
      data: formattedPlans
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