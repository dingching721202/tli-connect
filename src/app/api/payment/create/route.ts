import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/services/paymentService';
import { orderStore } from '@/lib/orderStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, amount, description, return_url } = body;

    // 驗證必要欄位
    if (!order_id || !amount || !description || !return_url) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 驗證訂單存在且狀態為 CREATED
    const order = orderStore.getOrderById(order_id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status !== 'CREATED') {
      return NextResponse.json(
        { success: false, error: 'Order is not in valid state for payment' },
        { status: 400 }
      );
    }

    // 檢查訂單是否過期
    if (new Date() > new Date(order.expires_at)) {
      // 將過期訂單標記為取消
      orderStore.updateOrderStatus(order_id, 'CANCELED');
      return NextResponse.json(
        { success: false, error: 'Order has expired' },
        { status: 400 }
      );
    }

    // 模擬第三方金流 - 創建付款請求
    const paymentResult = await paymentService.createPayment({
      order_id: order_id.toString(),
      amount,
      description,
      return_url
    });

    if (paymentResult.success && paymentResult.data) {
      // 模擬金流成功，更新訂單狀態
      const updatedOrder = orderStore.updateOrderStatus(
        order_id, 
        'COMPLETED', 
        paymentResult.data.payment_id
      );

      return NextResponse.json({
        success: true,
        data: {
          payment_id: paymentResult.data.payment_id,
          payment_url: `${return_url}?payment_id=${paymentResult.data.payment_id}&status=${paymentResult.data.status}&order_id=${order_id}`,
          order_id: order_id,
          amount: amount,
          status: paymentResult.data.status
        }
      });
    } else {
      // 付款失敗，更新訂單狀態
      orderStore.updateOrderStatus(order_id, 'CANCELED');
      
      return NextResponse.json({
        success: false,
        error: paymentResult.error || 'Payment failed',
        data: {
          payment_id: paymentResult.data?.payment_id,
          order_id: order_id,
          status: 'failed'
        }
      });
    }

  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}