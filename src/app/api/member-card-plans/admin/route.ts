import { NextRequest, NextResponse } from 'next/server';
import { memberCardPlanStore } from '@/lib/memberCardPlanStore';

// GET - 獲取所有方案（包括草稿）
export async function GET() {
  try {
    const allPlans = memberCardPlanStore.getAllPlans();
    
    const formattedPlans = allPlans.map(plan => ({
      id: plan.id,
      title: plan.title,
      user_type: plan.user_type,
      duration_type: plan.duration_type,
      duration_days: plan.duration_days,
      original_price: plan.original_price,
      sale_price: plan.sale_price,
      features: plan.features,
      status: plan.status,
      popular: plan.popular,
      description: plan.description,
      created_at: plan.created_at,
      member_card_id: plan.member_card_id,
      hide_price: plan.hide_price
    }));

    return NextResponse.json({
      success: true,
      data: formattedPlans
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

// POST - 創建新方案
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      user_type, 
      duration_type, 
      duration_days, 
      original_price, 
      sale_price, 
      features, 
      status, 
      popular, 
      description,
      hide_price 
    } = body;

    // 驗證必要欄位
    if (!title || !user_type || !duration_type || !duration_days || !original_price || !sale_price) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newPlan = memberCardPlanStore.createPlan({
      title,
      user_type,
      duration_type,
      duration_days: parseInt(duration_days),
      original_price: original_price.toString(),
      sale_price: sale_price.toString(),
      features: features || [],
      status: status || 'DRAFT',
      popular: popular || false,
      description: description || '',
      hide_price: hide_price || false
    });

    return NextResponse.json({
      success: true,
      data: newPlan
    });
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create plan' },
      { status: 500 }
    );
  }
}