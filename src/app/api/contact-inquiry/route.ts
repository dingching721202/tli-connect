import { NextRequest, NextResponse } from 'next/server';

interface ContactInquiry {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company_name: string;
  job_title?: string;
  training_needs?: string[];
  training_size?: string;
  requirements?: string;
  plan_id?: number;
  plan_title?: string;
  created_at: string;
}

// 模擬資料庫存儲
const contactInquiries: ContactInquiry[] = [];
let nextId = 1;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      phone, 
      company_name,
      job_title,
      training_needs,
      training_size,
      requirements, 
      plan_id, 
      plan_title 
    } = body;

    // 驗證必要欄位
    if (!name || !email || !company_name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, email, company_name' },
        { status: 400 }
      );
    }

    // 驗證 email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // 創建聯繫詢問記錄
    const newInquiry: ContactInquiry = {
      id: nextId++,
      name,
      email,
      phone: phone || '',
      company_name,
      job_title: job_title || '',
      training_needs: training_needs || [],
      training_size: training_size || '',
      requirements: requirements || '',
      plan_id: plan_id || null,
      plan_title: plan_title || '',
      created_at: new Date().toISOString()
    };

    contactInquiries.push(newInquiry);

    // 模擬發送通知郵件給業務團隊
    console.log('New Contact Inquiry:', {
      inquiry: newInquiry,
      notification: 'Email sent to sales team'
    });

    return NextResponse.json({
      success: true,
      data: {
        inquiry_id: newInquiry.id,
        message: 'Contact inquiry submitted successfully'
      }
    });

  } catch (error) {
    console.error('Error creating contact inquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit contact inquiry' },
      { status: 500 }
    );
  }
}

// GET - 獲取聯繫詢問列表 (管理員用)
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: contactInquiries
    });
  } catch (error) {
    console.error('Error fetching contact inquiries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contact inquiries' },
      { status: 500 }
    );
  }
}