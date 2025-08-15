/**
 * 數據遷移執行腳本
 * 這是一個簡化的 JavaScript 版本，可以直接在 Node.js 中運行
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase 配置
const supabaseUrl = 'https://krkpmnlxklfhcijqpgdo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtya3Btbmx4a2xmaGNpanFwZ2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NzY4MzEsImV4cCI6MjA3MDU1MjgzMX0.QphJeGfsE6MbYzsKppeuvdtjgVDVS6Wgsvl1Ed0258M';

const supabase = createClient(supabaseUrl, supabaseKey);

// 模擬數據（簡化版）
const userData = [
  {
    id: 1,
    name: "Alice Wang",
    email: "alice@example.com",
    phone: "0900-111-222",
    password_hash: "hashed_pw1",
    roles: ["STUDENT"],
    membership_status: "activated",
    account_status: "ACTIVE",
    campus: "羅斯福校",
    created_at: "2025-07-14T12:00:00+00:00"
  },
  {
    id: 2,
    name: "Bob Chen",
    email: "user2@example.com",
    phone: "0900-333-444",
    password_hash: "hashed_pw2",
    roles: ["STUDENT"],
    membership_status: "activated",
    account_status: "ACTIVE",
    campus: "士林校",
    created_at: "2025-07-14T12:00:00+00:00"
  },
  {
    id: 3,
    name: "Charlie Lin",
    email: "charlie@example.com",
    phone: "0900-555-666",
    password_hash: "hashed_pw3",
    roles: ["STUDENT"],
    membership_status: "activated",
    account_status: "ACTIVE",
    campus: "台中校",
    created_at: "2025-07-14T12:00:00+00:00"
  },
  {
    id: 4,
    name: "王老師",
    email: "teacher@example.com",
    phone: "0900-777-888",
    password_hash: "password",
    roles: ["TEACHER"],
    membership_status: "non_member",
    account_status: "ACTIVE",
    campus: "羅斯福校",
    created_at: "2025-07-14T12:00:00+00:00"
  },
  {
    id: 6,
    name: "Admin User",
    email: "admin@example.com",
    phone: "0900-888-999",
    password_hash: "password",
    roles: ["ADMIN", "STUDENT"],
    membership_status: "non_member",
    account_status: "ACTIVE",
    campus: "總部",
    created_at: "2025-07-14T12:00:00+00:00"
  }
];

const companyData = [
  {
    id: "1",
    name: "台積電股份有限公司",
    contact_name: "張經理",
    contact_email: "manager.zhang@tsmc.com",
    contact_phone: "+886-3-568-2301",
    address: "新竹科學園區",
    industry: "科技業",
    employee_count: "1000人以上",
    status: "activated",
    created_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    name: "富邦金融控股股份有限公司",
    contact_name: "李主管",
    contact_email: "supervisor.li@fubon.com",
    contact_phone: "+886-2-8771-6699",
    address: "台北市信義區",
    industry: "金融服務",
    employee_count: "500-1000人",
    status: "activated",
    created_at: "2024-03-01T00:00:00Z"
  }
];

const membershipData = [
  {
    id: 1,
    user_id: 1,
    user_name: "Alice Wang",
    user_email: "alice@example.com",
    membership_type: "individual",
    plan_id: 1,
    member_card_id: 1,
    order_id: 1001,
    status: "activated",
    purchase_date: "2024-11-01T09:00:00Z",
    activation_date: "2024-11-02T10:00:00Z",
    expiry_date: "2025-09-30T23:59:59Z",
    activation_deadline: "2024-12-01T23:59:59Z",
    amount_paid: 3000,
    auto_renewal: false,
    plan_title: "個人季度方案",
    plan_type: "individual",
    duration_type: "season",
    duration_days: 90,
    created_at: "2024-11-01T09:00:00Z"
  },
  {
    id: 3,
    user_id: 2,
    user_name: "李美華",
    user_email: "meihua.li@example.com",
    membership_type: "individual",
    plan_id: 2,
    member_card_id: 2,
    order_id: 2,
    status: "inactive",
    purchase_date: "2024-12-15T14:30:00Z",
    activation_deadline: "2025-01-14T23:59:59Z",
    amount_paid: 30000,
    auto_renewal: true,
    plan_title: "個人年度方案",
    plan_type: "individual",
    duration_type: "annual",
    duration_days: 365,
    created_at: "2024-12-15T14:30:00Z"
  }
];

const courseData = [
  {
    id: 1,
    title: "基礎英文會話",
    description: "適合初學者的英文會話課程，重點培養日常對話能力",
    teacher: "Jennifer Smith",
    teacher_id: "teacher_001",
    duration: "8週",
    price: 3200,
    original_price: 3200,
    currency: "TWD",
    cover_image_url: "/images/courses/basic-english.jpg",
    categories: ["語言學習", "英文"],
    language: "english",
    level: "beginner",
    capacity: 15,
    current_students: 12,
    rating: 4.8,
    total_sessions: 16,
    session_duration: 120,
    location: "線上",
    is_active: true,
    status: "active",
    tags: ["英文", "會話", "初學者", "小班制"],
    prerequisites: "無",
    material_links: ["英文會話教材", "聽力練習CD"],
    classroom_link: "https://meet.google.com/english-class",
    refund_policy: "開課前7天可全額退費",
    start_date: "2025-08-01",
    end_date: "2025-09-26",
    enrollment_deadline: "2025-07-25",
    recurring: true,
    recurring_type: "weekly",
    recurring_days: ["Tuesday", "Thursday"],
    waitlist_enabled: true,
    created_at: "2025-07-14T12:00:00+00:00"
  },
  {
    id: 2,
    title: "基礎中文會話",
    description: "專為外國學生設計的中文會話課程，從基礎發音開始",
    teacher: "王小明",
    teacher_id: "teacher_002",
    duration: "10週",
    price: 4200,
    original_price: 4200,
    currency: "TWD",
    cover_image_url: "/images/courses/chinese-conversation.jpg",
    categories: ["語言學習", "中文"],
    language: "chinese",
    level: "beginner",
    capacity: 12,
    current_students: 8,
    rating: 4.7,
    total_sessions: 20,
    session_duration: 120,
    location: "台北教室",
    is_active: true,
    status: "active",
    tags: ["中文", "會話", "初學者", "發音訓練"],
    prerequisites: "無",
    material_links: ["中文會話教材", "聽力練習CD"],
    classroom_link: "https://meet.google.com/chinese-class",
    refund_policy: "開課前5天可退費80%",
    start_date: "2025-08-06",
    end_date: "2025-10-08",
    enrollment_deadline: "2025-08-01",
    recurring: true,
    recurring_type: "weekly",
    recurring_days: ["Tuesday", "Saturday"],
    waitlist_enabled: false,
    created_at: "2025-07-14T12:00:00+00:00"
  }
];

// 遷移函數
async function migrateUsers() {
  console.log('📊 遷移用戶數據...');
  
  const { data, error } = await supabase
    .from('core_users')
    .upsert(userData, { onConflict: 'id' });
  
  if (error) {
    console.error('❌ 用戶數據遷移失敗:', error);
    return false;
  } else {
    console.log(`✅ 成功遷移 ${userData.length} 個用戶`);
    return true;
  }
}

async function migrateCompanies() {
  console.log('🏢 遷移公司數據...');
  
  const { data, error } = await supabase
    .from('organizations')
    .upsert(companyData, { onConflict: 'id' });
  
  if (error) {
    console.error('❌ 公司數據遷移失敗:', error);
    return false;
  } else {
    console.log(`✅ 成功遷移 ${companyData.length} 個公司`);
    return true;
  }
}

async function migrateMemberships() {
  console.log('💳 遷移會員數據...');
  
  const { data, error } = await supabase
    .from('unified_memberships')
    .upsert(membershipData, { onConflict: 'id' });
  
  if (error) {
    console.error('❌ 會員數據遷移失敗:', error);
    return false;
  } else {
    console.log(`✅ 成功遷移 ${membershipData.length} 個會員資格`);
    return true;
  }
}

async function migrateCourses() {
  console.log('📚 遷移課程數據...');
  
  const { data, error } = await supabase
    .from('course_templates')
    .upsert(courseData, { onConflict: 'id' });
  
  if (error) {
    console.error('❌ 課程數據遷移失敗:', error);
    return false;
  } else {
    console.log(`✅ 成功遷移 ${courseData.length} 個課程`);
    return true;
  }
}

async function validateMigration() {
  console.log('🔍 驗證數據遷移完整性...');
  
  const tables = [
    { name: 'core_users', localCount: userData.length },
    { name: 'organizations', localCount: companyData.length },
    { name: 'unified_memberships', localCount: membershipData.length },
    { name: 'course_templates', localCount: courseData.length }
  ];
  
  let allValid = true;
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table.name)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error(`❌ 檢查 ${table.name} 表失敗:`, error);
      allValid = false;
    } else {
      const isValid = count === table.localCount;
      console.log(`${table.name}: 本地 ${table.localCount} → Supabase ${count} ${isValid ? '✅' : '❌'}`);
      if (!isValid) allValid = false;
    }
  }
  
  console.log(allValid ? '🎉 數據遷移驗證通過！' : '⚠️  數據遷移驗證發現問題');
  return allValid;
}

// 主執行函數
async function main() {
  console.log('🚀 開始執行數據遷移...');
  
  try {
    // 執行所有遷移
    const userSuccess = await migrateUsers();
    const companySuccess = await migrateCompanies();
    const membershipSuccess = await migrateMemberships();
    const courseSuccess = await migrateCourses();
    
    const allSuccess = userSuccess && companySuccess && membershipSuccess && courseSuccess;
    
    if (allSuccess) {
      console.log('🎉 所有數據遷移完成！');
      
      // 驗證遷移結果
      await validateMigration();
    } else {
      console.log('⚠️  部分數據遷移失敗，請檢查錯誤信息');
    }
    
  } catch (error) {
    console.error('❌ 遷移過程中發生未預期錯誤:', error);
  }
}

// 執行遷移
main();