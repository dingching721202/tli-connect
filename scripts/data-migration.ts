import { createClient } from '@supabase/supabase-js';

// 導入本地數據
import { users } from '../src/data/users';
import { memberships } from '../src/data/memberships';
import { courses } from '../src/data/courses';
import { getAllCorporateClients, getCompanies } from '../src/data/corporateData';
import { agents } from '../src/data/agents';
import { classAppointments } from '../src/data/class_appointments';

// Supabase 配置
const supabaseUrl = 'https://krkpmnlxklfhcijqpgdo.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 數據轉換函數
function transformUserData(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    password_hash: user.password, // 注意：實際環境中需要重新加密
    roles: user.roles,
    membership_status: user.membership_status,
    account_status: user.account_status,
    campus: user.campus,
    corp_id: user.corp_id || null,
    created_at: user.created_at,
    updated_at: user.updated_at || user.created_at
  };
}

function transformCompanyData(company: any) {
  return {
    id: company.id,
    name: company.companyName || company.name,
    contact_name: company.contactName,
    contact_email: company.contactEmail,
    contact_phone: company.contactPhone,
    address: company.address || '',
    industry: company.industry,
    employee_count: company.employeeCount,
    status: company.status,
    created_at: company.createdAt,
    updated_at: company.updatedAt || company.createdAt
  };
}

function transformMembershipData(membership: any) {
  return {
    id: membership.id,
    user_id: membership.user_id,
    user_name: membership.user_name,
    user_email: membership.user_email,
    membership_type: membership.membership_type,
    plan_id: membership.plan_id,
    member_card_id: membership.member_card_id,
    order_id: membership.order_id,
    status: membership.status,
    purchase_date: membership.purchase_date,
    activation_date: membership.activation_date,
    expiry_date: membership.expiry_date,
    activation_deadline: membership.activation_deadline,
    amount_paid: membership.amount_paid,
    auto_renewal: membership.auto_renewal || false,
    company_name: membership.company_name || null,
    plan_title: membership.plan_title,
    plan_type: membership.plan_type,
    duration_type: membership.duration_type,
    duration_days: membership.duration_days,
    created_at: membership.created_at,
    updated_at: membership.updated_at
  };
}

function transformCourseData(course: any) {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    teacher: course.teacher,
    teacher_id: course.teacher_id,
    duration: course.duration,
    price: course.price,
    original_price: course.original_price,
    currency: course.currency,
    cover_image_url: course.cover_image_url,
    categories: course.categories,
    language: course.language,
    level: course.level,
    capacity: course.capacity,
    current_students: course.current_students,
    rating: course.rating,
    total_sessions: course.total_sessions,
    session_duration: course.session_duration,
    location: course.location,
    is_active: course.is_active,
    status: course.status,
    tags: course.tags,
    prerequisites: course.prerequisites,
    material_links: course.material_link,
    classroom_link: course.classroom_link,
    refund_policy: course.refund_policy,
    start_date: course.start_date,
    end_date: course.end_date,
    enrollment_deadline: course.enrollment_deadline,
    recurring: course.recurring,
    recurring_type: course.recurring_type,
    recurring_days: course.recurring_days,
    waitlist_enabled: course.waitlist_enabled,
    created_at: course.created_at,
    updated_at: course.updated_at
  };
}

function transformAgentData(agent: any) {
  return {
    id: agent.id,
    user_id: agent.user_id,
    agent_code: agent.agent_code,
    agent_name: agent.agent_name,
    email: agent.email,
    phone: agent.phone,
    commission_rate: agent.commission_rate,
    status: agent.status,
    region: agent.region,
    manager_id: agent.manager_id,
    created_at: agent.created_at,
    updated_at: agent.updated_at
  };
}

function transformAppointmentData(appointment: any) {
  return {
    id: appointment.id,
    class_timeslot_id: appointment.class_timeslot_id,
    user_id: appointment.user_id,
    status: appointment.status,
    booking_time: appointment.booking_time,
    created_at: appointment.created_at
  };
}

// 主要遷移函數
export async function migrateAllData() {
  console.log('🚀 開始數據遷移...');
  
  try {
    // 1. 遷移用戶數據
    console.log('📊 遷移用戶數據...');
    const transformedUsers = users.map(transformUserData);
    const userResult = await supabase
      .from('users')
      .upsert(transformedUsers, { onConflict: 'id' });
    
    if (userResult.error) {
      console.error('❌ 用戶數據遷移失敗:', userResult.error);
    } else {
      console.log(`✅ 成功遷移 ${transformedUsers.length} 個用戶`);
    }

    // 2. 遷移公司數據
    console.log('🏢 遷移公司數據...');
    const corporateClients = getAllCorporateClients();
    const transformedCompanies = corporateClients.map(transformCompanyData);
    const companyResult = await supabase
      .from('companies')
      .upsert(transformedCompanies, { onConflict: 'id' });
    
    if (companyResult.error) {
      console.error('❌ 公司數據遷移失敗:', companyResult.error);
    } else {
      console.log(`✅ 成功遷移 ${transformedCompanies.length} 個公司`);
    }

    // 3. 遷移會員數據
    console.log('💳 遷移會員數據...');
    const transformedMemberships = memberships.map(transformMembershipData);
    const membershipResult = await supabase
      .from('memberships')
      .upsert(transformedMemberships, { onConflict: 'id' });
    
    if (membershipResult.error) {
      console.error('❌ 會員數據遷移失敗:', membershipResult.error);
    } else {
      console.log(`✅ 成功遷移 ${transformedMemberships.length} 個會員資格`);
    }

    // 4. 遷移課程數據
    console.log('📚 遷移課程數據...');
    const transformedCourses = courses.map(transformCourseData);
    const courseResult = await supabase
      .from('courses')
      .upsert(transformedCourses, { onConflict: 'id' });
    
    if (courseResult.error) {
      console.error('❌ 課程數據遷移失敗:', courseResult.error);
    } else {
      console.log(`✅ 成功遷移 ${transformedCourses.length} 個課程`);
    }

    // 5. 遷移代理數據
    console.log('🤝 遷移代理數據...');
    const transformedAgents = agents.map(transformAgentData);
    const agentResult = await supabase
      .from('agents')
      .upsert(transformedAgents, { onConflict: 'id' });
    
    if (agentResult.error) {
      console.error('❌ 代理數據遷移失敗:', agentResult.error);
    } else {
      console.log(`✅ 成功遷移 ${transformedAgents.length} 個代理`);
    }

    // 6. 遷移課程預約數據
    console.log('📅 遷移課程預約數據...');
    const transformedAppointments = classAppointments.map(transformAppointmentData);
    const appointmentResult = await supabase
      .from('class_appointments')
      .upsert(transformedAppointments, { onConflict: 'id' });
    
    if (appointmentResult.error) {
      console.error('❌ 課程預約數據遷移失敗:', appointmentResult.error);
    } else {
      console.log(`✅ 成功遷移 ${transformedAppointments.length} 個課程預約`);
    }

    console.log('🎉 數據遷移完成！');
    return true;

  } catch (error) {
    console.error('❌ 數據遷移過程中發生錯誤:', error);
    return false;
  }
}

// 驗證遷移完整性
export async function validateMigration() {
  console.log('🔍 驗證數據遷移完整性...');
  
  try {
    // 檢查各表的記錄數量
    const tables = ['users', 'companies', 'memberships', 'courses', 'agents', 'class_appointments'];
    const results = [];

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`❌ 檢查 ${table} 表失敗:`, error);
        results.push({ table, count: 0, error: error.message });
      } else {
        console.log(`✅ ${table} 表: ${count} 條記錄`);
        results.push({ table, count, error: null });
      }
    }

    // 檢查本地數據數量
    const localCounts = {
      users: users.length,
      companies: getAllCorporateClients().length,
      memberships: memberships.length,
      courses: courses.length,
      agents: agents.length,
      class_appointments: classAppointments.length
    };

    console.log('\n📊 遷移驗證報告:');
    console.log('====================');
    
    let allValid = true;
    for (const result of results) {
      const localCount = localCounts[result.table as keyof typeof localCounts] || 0;
      const isValid = result.count === localCount;
      
      if (!isValid) allValid = false;
      
      console.log(`${result.table}: 本地 ${localCount} → Supabase ${result.count} ${isValid ? '✅' : '❌'}`);
    }

    console.log('====================');
    console.log(allValid ? '🎉 數據遷移驗證通過！' : '⚠️  數據遷移驗證發現問題');
    
    return { success: allValid, results, localCounts };

  } catch (error) {
    console.error('❌ 驗證過程中發生錯誤:', error);
    return { success: false, error: error.message };
  }
}

// 清理函數（謹慎使用）
export async function cleanupTables() {
  console.log('🧹 清理 Supabase 表格...');
  
  const tables = ['class_appointments', 'agents', 'courses', 'memberships', 'companies', 'users'];
  
  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .neq('id', 0); // 刪除所有記錄
    
    if (error) {
      console.error(`❌ 清理 ${table} 表失敗:`, error);
    } else {
      console.log(`✅ 已清理 ${table} 表`);
    }
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  async function main() {
    console.log('🚀 開始執行數據遷移腳本...');
    
    // 先清理現有數據（可選）
    // await cleanupTables();
    
    // 執行遷移
    const success = await migrateAllData();
    
    if (success) {
      // 驗證遷移
      await validateMigration();
    }
  }
  
  main().catch(console.error);
}