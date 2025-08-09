import { NextResponse } from 'next/server';
import MemberCardStorage from '@/lib/memberCardStorage';

// POST - 重置會員卡資料到初始狀態（開發用）
export async function POST() {
  try {
    const storage = MemberCardStorage.getInstance();
    storage.resetData();
    
    return NextResponse.json({
      success: true,
      message: '會員卡資料已重置為初始狀態',
      data: storage.getAllCards()
    });

  } catch (error) {
    console.error('重置會員卡資料失敗:', error);
    return NextResponse.json(
      { success: false, error: '重置會員卡資料失敗' },
      { status: 500 }
    );
  }
}