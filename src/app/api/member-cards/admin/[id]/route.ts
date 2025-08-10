import { NextRequest, NextResponse } from 'next/server';
import MemberCardStorage from '@/lib/memberCardStorage';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT - 更新會員卡
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const cardId = parseInt(id);
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
    const updatedCard = storage.updateCard(cardId, {
      name,
      available_course_ids
    });

    if (!updatedCard) {
      return NextResponse.json(
        { success: false, error: '會員卡不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedCard,
      message: '會員卡更新成功'
    });

  } catch (error) {
    console.error('更新會員卡失敗:', error);
    return NextResponse.json(
      { success: false, error: '更新會員卡失敗' },
      { status: 500 }
    );
  }
}

// DELETE - 刪除會員卡
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const cardId = parseInt(id);

    const storage = MemberCardStorage.getInstance();
    const deletedCard = storage.deleteCard(cardId);

    if (!deletedCard) {
      return NextResponse.json(
        { success: false, error: '會員卡不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: deletedCard,
      message: '會員卡刪除成功'
    });

  } catch (error) {
    console.error('刪除會員卡失敗:', error);
    return NextResponse.json(
      { success: false, error: '刪除會員卡失敗' },
      { status: 500 }
    );
  }
}