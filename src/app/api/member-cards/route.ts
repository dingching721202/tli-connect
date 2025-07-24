import { NextRequest, NextResponse } from 'next/server';
import { memberCardService } from '@/services/dataService';
import { orderStore } from '@/lib/orderStore';
import { memberCardPlanStore } from '@/lib/memberCardPlanStore';

// POST - 創建會員卡 (僅限COMPLETED狀態的訂單)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, plan_id, user_email, user_name, user_id } = body;

    // 驗證必要欄位
    if (!order_id || !plan_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: order_id, plan_id' },
        { status: 400 }
      );
    }

    // 檢查訂單是否存在且狀態為 COMPLETED
    const order = orderStore.getOrderById(parseInt(order_id));
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status !== 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: 'Order status must be COMPLETED to generate member card' },
        { status: 400 }
      );
    }

    // 檢查方案是否存在
    const plan = memberCardPlanStore.getPlanById(plan_id);
    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }

    // 檢查是否已經為此訂單創建過會員卡
    const existingCards = memberCardService.getAllCards().filter(card => 
      card.plan_id === plan_id && 
      card.user_email === user_email &&
      card.order_id === order_id
    );

    if (existingCards.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Member card already exists for this order' },
        { status: 409 }
      );
    }

    // 計算到期日
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.duration_days);

    // 創建會員卡
    const newMemberCard = memberCardService.createCard({
      plan_id: plan_id,
      user_email: user_email || '',
      user_name: user_name || '',
      user_id: user_id,
      order_id: parseInt(order_id),
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      status: 'ACTIVE'
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newMemberCard.id,
        plan_id: newMemberCard.plan_id,
        user_email: newMemberCard.user_email,
        user_name: newMemberCard.user_name,
        order_id: newMemberCard.order_id,
        start_date: newMemberCard.start_date,
        end_date: newMemberCard.end_date,
        status: newMemberCard.status,
        created_at: newMemberCard.created_at
      }
    });
  } catch (error) {
    console.error('Error creating member card:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create member card' },
      { status: 500 }
    );
  }
}

// GET - 獲取會員卡列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('user_email');
    const userId = searchParams.get('user_id');
    
    let cards = memberCardService.getAllCards();
    
    // 過濾會員卡
    if (userEmail) {
      cards = cards.filter(card => card.user_email === userEmail);
    }
    
    if (userId) {
      cards = cards.filter(card => card.user_id === parseInt(userId));
    }
    
    return NextResponse.json({
      success: true,
      data: cards
    });
  } catch (error) {
    console.error('Error fetching member cards:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch member cards' },
      { status: 500 }
    );
  }
}