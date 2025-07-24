import { NextResponse } from 'next/server';
import { membershipService } from '@/services/dataService';

// 會員方案 API - 僅回傳已發布的方案 (US02)
export async function GET() {
  try {
    // 獲取所有已發布的會員方案
    const publishedPlans = await membershipService.getPublishedPlans();
    
    // 轉換為指定的 API 格式
    const formattedPlans = publishedPlans.map(plan => ({
      plan_id: plan.id,
      title: plan.name,
      type: plan.type, // SEASON | YEAR | CORPORATE
      duration_days: plan.duration * 30, // 將月份轉換為天數 (簡化計算)
      price: parseFloat(plan.price),
      original_price: parseFloat(plan.original_price),
      features: plan.features,
      plan_type: plan.plan_type,
      category: plan.category
    }));

    return NextResponse.json({
      success: true,
      data: formattedPlans,
      count: formattedPlans.length
    });

  } catch (error) {
    console.error('Get member card plans error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'INTERNAL_SERVER_ERROR',
        message: '無法獲取會員方案資料'
      },
      { status: 500 }
    );
  }
}