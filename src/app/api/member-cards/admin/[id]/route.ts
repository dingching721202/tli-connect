import { NextRequest, NextResponse } from 'next/server';
import { memberCardStore } from '@/lib/memberCardStore';

// PUT - 更新會員卡
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const cardId = parseInt(params.id);
    
    if (isNaN(cardId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid card ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    console.log('🔄 API 更新會員卡請求:', {
      cardId,
      requestBody: body
    });
    
    const updatedCard = await memberCardStore.updateCard(cardId, body);
    
    if (!updatedCard) {
      console.log('❌ 會員卡未找到:', cardId);
      return NextResponse.json(
        { success: false, error: 'Member card not found' },
        { status: 404 }
      );
    }

    console.log('✅ API 更新成功:', updatedCard);
    
    return NextResponse.json({
      success: true,
      data: updatedCard
    });
  } catch (error) {
    console.error('❌ API 更新會員卡錯誤:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update member card' },
      { status: 500 }
    );
  }
}

// DELETE - 刪除會員卡
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const cardId = parseInt(params.id);
    
    const success = await memberCardStore.deleteCard(cardId);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Member card not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Member card deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting member card:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete member card' },
      { status: 500 }
    );
  }
}