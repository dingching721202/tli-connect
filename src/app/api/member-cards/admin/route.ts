import { NextRequest, NextResponse } from 'next/server';
import { memberCardStore } from '@/lib/memberCardStore';

// GET - 獲取所有會員卡（管理員用）
export async function GET() {
  try {
    const allCards = await memberCardStore.getAllCards();
    
    return NextResponse.json({
      success: true,
      data: allCards
    });
  } catch (error) {
    console.error('Error fetching member cards:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch member cards' },
      { status: 500 }
    );
  }
}

// POST - 創建新會員卡
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, available_course_ids } = body;

    // 驗證必要欄位
    if (!name || !available_course_ids) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, available_course_ids' },
        { status: 400 }
      );
    }

    const newCard = await memberCardStore.createCard({
      name,
      available_course_ids
    });

    return NextResponse.json({
      success: true,
      data: newCard
    });
  } catch (error) {
    console.error('Error creating member card:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create member card' },
      { status: 500 }
    );
  }
}