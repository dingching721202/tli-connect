import { NextRequest, NextResponse } from 'next/server';
import { orderStore } from '@/lib/orderStore';

// PUT - 更新訂單狀態 (金流回調用)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const orderId = parseInt(params.id);
    const body = await request.json();
    const { status, payment_id } = body;

    // 驗證必要欄位
    if (!status || !['COMPLETED', 'CANCELED'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    // 更新訂單狀態
    const updatedOrder = orderStore.updateOrderStatus(orderId, status, payment_id);

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        order_id: updatedOrder.id,
        status: updatedOrder.status,
        payment_id: updatedOrder.payment_id,
        updated_at: updatedOrder.updated_at
      }
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// PATCH - 更新訂單狀態 (前端用)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PUT(request, context);
}

// GET - 獲取單一訂單詳情
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const orderId = parseInt(params.id);
    
    // 清理過期訂單
    orderStore.cleanupExpiredOrders();
    
    const order = orderStore.getOrderById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}