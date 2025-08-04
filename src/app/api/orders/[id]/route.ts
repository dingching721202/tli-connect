import { NextRequest, NextResponse } from 'next/server';
import { orderStore } from '@/lib/orderStore';
import { memberCardService } from '@/services/dataService';

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

    console.log(`🔄 更新訂單 ${orderId} 狀態為: ${status}`);

    // 驗證狀態值
    if (!status || !['COMPLETED', 'CANCELED'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be COMPLETED or CANCELED' },
        { status: 400 }
      );
    }

    // 獲取原始訂單
    const originalOrder = orderStore.getOrderById(orderId);
    if (!originalOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // 只能更新 CREATED 狀態的訂單
    if (originalOrder.status !== 'CREATED') {
      console.log(`❌ 訂單 ${orderId} 當前狀態為 ${originalOrder.status}，無法更新`);
      return NextResponse.json(
        { success: false, error: `Order status is ${originalOrder.status}, cannot be updated` },
        { status: 400 }
      );
    }

    // 更新訂單狀態
    const updatedOrder = orderStore.updateOrderStatus(orderId, status, payment_id);
    
    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: 'Failed to update order' },
        { status: 500 }
      );
    }

    console.log(`✅ 訂單 ${orderId} 狀態已更新為: ${status}`);

    // 如果付款成功且有用戶ID，創建會員卡
    if (status === 'COMPLETED' && updatedOrder.user_id) {
      try {
        console.log(`🎫 為用戶 ${updatedOrder.user_id} 創建會員卡...`);
        
        const memberCard = memberCardService.createCard({
          plan_id: updatedOrder.plan_id,
          user_email: updatedOrder.user_email || '',
          user_name: updatedOrder.user_name || '',
          user_id: updatedOrder.user_id,
          order_id: updatedOrder.id,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天有效期
          status: 'PURCHASED'
        });

        console.log(`✅ 會員卡已為訂單 ${orderId} 創建:`, memberCard.id);
      } catch (error) {
        console.error(`❌ 為訂單 ${orderId} 創建會員卡失敗:`, error);
        
        // 如果會員卡創建失敗，回滾訂單狀態
        orderStore.updateOrderStatus(orderId, 'CANCELED');
        
        return NextResponse.json(
          { 
            success: false, 
            error: 'Payment successful but failed to create membership card. Order has been canceled.' 
          },
          { status: 500 }
        );
      }
    } else if (status === 'COMPLETED' && !updatedOrder.user_id) {
      console.log(`⚠️ 訂單 ${orderId} 付款成功但無用戶ID，無法創建會員卡`);
    } else if (status === 'CANCELED') {
      console.log(`❌ 訂單 ${orderId} 已取消，不會創建會員卡`);
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