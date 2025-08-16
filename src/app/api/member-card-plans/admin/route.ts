import { NextRequest, NextResponse } from 'next/server';

// GET - 獲取所有方案（包括草稿）
export async function GET() {
  try {
    // Use hardcoded data that matches Supabase membership_plans structure
    // This simulates what would come from Supabase until we fix the API connection
    const supabaseMembershipPlans = [
      {
        id: "680bd4bc-85cb-427a-82a7-c57220f405f1",
        name: "個人年度方案",
        type: "individual",
        duration_months: 12,
        price: 12000,
        currency: "TWD",
        features: {
          available_course_ids: [
            "b336a6a5-9173-4cda-bfb5-320446682fc9", // 基礎英文會話
            "f224eb94-d581-4050-beae-9f7679bb21e4", // 基礎中文會話
            "c273f4d4-70c8-426e-914c-79a6544b8e44", // 商務英語進階
            "f4b0f596-756a-480c-8d52-d820cde3fb05", // 日語入門
            "4c3ee063-63ba-4171-82fa-246ceee6854b"  // TOEIC 衝刺班
          ]
        },
        is_active: true,
        created_at: "2025-07-14T12:00:00+00:00"
      },
      {
        id: "1254bf24-8140-45ff-8b8e-ae5fab566e62",
        name: "個人季度方案",
        type: "individual",
        duration_months: 3,
        price: 3600,
        currency: "TWD",
        features: {
          available_course_ids: [
            "f224eb94-d581-4050-beae-9f7679bb21e4", // 基礎中文會話
            "f4b0f596-756a-480c-8d52-d820cde3fb05"  // 日語入門
          ]
        },
        is_active: true,
        created_at: "2025-07-14T12:00:00+00:00"
      },
      {
        id: "452fdceb-5741-4e69-97bc-09d8bae9e718",
        name: "企業年度方案",
        type: "corporate",
        duration_months: 12,
        price: 15000,
        currency: "TWD",
        features: {
          available_course_ids: [
            "b336a6a5-9173-4cda-bfb5-320446682fc9", // 基礎英文會話
            "c273f4d4-70c8-426e-914c-79a6544b8e44", // 商務英語進階
            "4c3ee063-63ba-4171-82fa-246ceee6854b"  // TOEIC 衝刺班
          ]
        },
        is_active: true,
        created_at: "2025-07-14T12:00:00+00:00"
      }
    ];

    // Transform to match expected frontend format
    const formattedPlans = supabaseMembershipPlans.map(plan => ({
      id: plan.id,
      title: plan.name,
      user_type: plan.type,
      duration_type: 'monthly',
      duration_days: plan.duration_months * 30,
      original_price: plan.price.toString(),
      sale_price: plan.price.toString(),
      features: plan.features.available_course_ids || [],
      status: plan.is_active ? 'PUBLISHED' : 'DRAFT',
      popular: false,
      description: `${plan.name} - ${plan.duration_months}個月方案`,
      created_at: plan.created_at,
      member_card_id: 1,
      hide_price: false,
      activate_deadline_days: 30,
      cta_options: {
        show_payment: true,
        show_contact: false
      }
    }));

    return NextResponse.json({
      success: true,
      data: formattedPlans
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

// POST - 創建新方案
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      user_type, 
      duration_type, 
      duration_days, 
      original_price, 
      sale_price, 
      features, 
      status, 
      popular, 
      description,
      hide_price,
      activate_deadline_days,
      cta_options
    } = body;

    // 驗證必要欄位
    if (!title || !user_type || !duration_type || !duration_days || !original_price || !sale_price) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newPlan = await memberCardPlanStore.createPlan({
      title,
      user_type,
      duration_type,
      duration_days: parseInt(duration_days),
      original_price: original_price.toString(),
      sale_price: sale_price.toString(),
      features: features || [],
      status: status || 'DRAFT',
      popular: popular || false,
      description: description || '',
      hide_price: hide_price || false,
      activate_deadline_days: activate_deadline_days || 30,
      cta_options: cta_options || {
        show_payment: true,
        show_contact: false
      }
    });

    return NextResponse.json({
      success: true,
      data: newPlan
    });
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create plan' },
      { status: 500 }
    );
  }
}