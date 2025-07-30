import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/services/paymentService';
import { orderStore } from '@/lib/orderStore';
import { memberCardPlanStore } from '@/lib/memberCardPlanStore';
import { memberships } from '@/data/memberships';

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

      // 付款成功後自動創建會員卡（PURCHASED 狀態，需要手動啟用）
      if (updatedOrder && updatedOrder.plan_id) {
        try {
          // 根據訂單中的 plan_id 獲取會員方案
          const plan = memberCardPlanStore.getPlanById(updatedOrder.plan_id);
          
          if (plan) {
            // 生成新的會員卡ID
            const newMembershipId = Math.max(...memberships.map(m => m.id), 0) + 1;
            
            // 創建對應的會員資格記錄 - 狀態為 PURCHASED，需要手動啟用
            const activateDeadlineDays = plan.activate_deadline_days || 30; // 使用方案設定的啟用期限，預設30天
            const newMembership = {
              id: newMembershipId,
              created_at: new Date().toISOString(),
              member_card_id: plan.member_card_id,
              duration_in_days: plan.duration_days,
              start_time: undefined,  // 等待用戶啟用
              expire_time: undefined,
              activated: false,
              activate_expire_time: new Date(Date.now() + activateDeadlineDays * 24 * 60 * 60 * 1000).toISOString(),
              user_id: updatedOrder.user_id || 999, // 暫時用戶ID，實際應用中需要真實用戶ID
              status: 'PURCHASED' as const
            };
            
            // 保存會員資格記錄
            memberships.push(newMembership);
            
            console.log('💳 會員卡創建成功 (PURCHASED 狀態):', newMembership);
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