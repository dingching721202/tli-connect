import { NextRequest, NextResponse } from 'next/server';
import MemberCardStorage from '@/lib/memberCardStorage';

// GET - 獲取所有會員卡
export async function GET() {
  try {
    const storage = MemberCardStorage.getInstance();
    const memberCards = storage.getAllCards();
    
    return NextResponse.json({
      success: true,
      data: memberCards
    });
  } catch (error) {
    console.error('獲取會員卡失敗:', error);
    return NextResponse.json(
      { success: false, error: '獲取會員卡失敗' },
      { status: 500 }
    );
  }
}

// POST - 創建新會員卡
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, available_course_ids } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: '會員卡名稱不能為空' },
        { status: 400 }
      );
    }

    if (!available_course_ids || available_course_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: '必須選擇至少一個課程' },
        { status: 400 }
      );
    }

    const storage = MemberCardStorage.getInstance();
    const newCard = storage.addCard({
      name,
      available_course_ids
    });

    return NextResponse.json({
      success: true,
      data: newCard,
      message: '會員卡創建成功'
    });

  } catch (error) {
    console.error('創建會員卡失敗:', error);
    return NextResponse.json(
      { success: false, error: '創建會員卡失敗' },
      { status: 500 }
    );
  }
}