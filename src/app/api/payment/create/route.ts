import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/services/paymentService';
import { orderStore } from '@/lib/orderStore';
import { memberCardPlanStore } from '@/lib/memberCardPlanStore';
import { memberCardStore } from '@/lib/memberCardStore';

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

    if (paymentResult.success && paymentResult.payment) {
      // 模擬金流成功，更新訂單狀態
      const updatedOrder = orderStore.updateOrderStatus(
        order_id, 
        'COMPLETED', 
        paymentResult.payment.payment_id
      );

      // 付款成功後自動創建會員卡（PURCHASED 狀態，需要手動啟用）
      if (updatedOrder && updatedOrder.plan_id) {
        try {
          // 根據訂單中的 plan_id 獲取會員方案
          const plan = await memberCardPlanStore.getPlanById(updatedOrder.plan_id);
          
          if (plan) {
            // 使用統一的 memberCardStore 創建會員記錄
            await memberCardStore.createUserMembership({
              user_id: updatedOrder.user_id || 999, // 暫時用戶ID，實際應用中需要真實用戶ID
              user_name: updatedOrder.user_name || 'Unknown User',
              user_email: updatedOrder.user_email || `user${updatedOrder.user_id}@example.com`,
              plan_id: updatedOrder.plan_id,
              order_id: updatedOrder.id,
              amount_paid: updatedOrder.amount,
              auto_renewal: false
            });
            
            console.log('💳 會員卡創建成功 (PURCHASED 狀態) - 已使用統一存儲系統');
          } else {
            console.error('❌ 找不到會員方案:', updatedOrder.plan_id);
          }
        } catch (membershipError) {
          console.error('❌ 創建會員卡失敗:', membershipError);
          // 即使會員卡創建失敗，付款依然成功，不影響主流程
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          payment_id: paymentResult.payment.payment_id,
          payment_url: `${return_url}?payment_id=${paymentResult.payment.payment_id}&status=${paymentResult.payment.status}&order_id=${order_id}`,
          order_id: order_id,
          amount: amount,
          status: paymentResult.payment.status
        }
      });
    } else {
      // 付款失敗，更新訂單狀態
      orderStore.updateOrderStatus(order_id, 'CANCELED');
      
      return NextResponse.json({
        success: false,
        error: paymentResult.error || 'Payment failed',
        data: {
          payment_id: paymentResult.payment?.payment_id,
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