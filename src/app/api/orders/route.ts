import { NextRequest, NextResponse } from 'next/server';
import { orderStore } from '@/lib/orderStore';
import { memberCardPlanStore } from '@/lib/memberCardPlanStore';

// POST - 創建新訂單
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan_id, user_email, user_name, user_id } = body;

    // 驗證必要欄位
    if (!plan_id) {
      return NextResponse.json(
        { success: false, error: 'Missing plan_id' },
        { status: 400 }
      );
    }

    // 對於非登入用戶，不強制要求email (在購買流程中會收集)
    // 但如果提供了user_id，則必須是有效的登入用戶

    // 獲取方案資訊
    const plan = memberCardPlanStore.getPlanById(plan_id);
    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }

    // 檢查方案是否已發布
    if (plan.status !== 'PUBLISHED') {
      return NextResponse.json(
        { success: false, error: 'Plan is not available for purchase' },
        { status: 400 }
      );
    }

    // 清理過期訂單
    orderStore.cleanupExpiredOrders();

    // 創建訂單
    const newOrder = orderStore.createOrder({
      plan_id,
      user_email,
      user_name,
      user_id,
      amount: parseFloat(plan.sale_price)
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newOrder.id,
        order_id: newOrder.id,
        plan_id: newOrder.plan_id,
        amount: newOrder.amount,
        status: newOrder.status,
        expires_at: newOrder.expires_at,
        created_at: newOrder.created_at
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// GET - 獲取訂單列表 (管理員用)
export async function GET() {
  try {
    // 清理過期訂單
    orderStore.cleanupExpiredOrders();
    
    const allOrders = orderStore.getAllOrders();
    
    return NextResponse.json({
      success: true,
      data: allOrders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}