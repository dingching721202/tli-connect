/**
 * 資料遷移腳本 - 將 localStorage 假資料遷移到 Supabase
 * Data Migration Script - Migrate localStorage mock data to Supabase
 * 
 * Phase 4.6: 實際資料遷移
 */

import { createClient } from '@supabase/supabase-js'
import { users } from '../src/data/users'
import { corporateMembers } from '../src/data/corporateMembers'

// 環境變數配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

// 使用 Service Role Key 創建 Supabase 客戶端（可繞過 RLS）
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('🚀 Starting data migration to Supabase...')
console.log(`📊 Database URL: ${supabaseUrl}`)

/**
 * 遷移用戶資料到 core_users 表
 */
async function migrateUsers() {
  console.log('\n👥 Migrating users data...')
  
  try {
    // 清理現有資料（測試環境）
    const { error: deleteError } = await supabase
      .from('core_users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all except dummy

    if (deleteError) {
      console.warn('⚠️ Warning cleaning existing users:', deleteError.message)
    }

    // 轉換並插入用戶資料
    const usersToInsert = users.map(user => ({
      id: `user-${user.id}`, // UUID 格式
      email: user.email,
      full_name: user.name,
      phone: user.phone,
      password_hash: user.password, // 已經是 hashed
      campus: user.campus,
      is_active: user.account_status === 'ACTIVE',
      email_verified: false,
      last_login: null,
      created_at: user.created_at,
      updated_at: user.updated_at || user.created_at
    }))

    const { data, error } = await supabase
      .from('core_users')
      .insert(usersToInsert)
      .select()

    if (error) {
      console.error('❌ Error migrating users:', error)
      return false
    }

    console.log(`✅ Successfully migrated ${data?.length || 0} users`)
    
    // 遷移用戶角色
    await migrateUserRoles()
    
    return true
  } catch (error) {
    console.error('❌ Unexpected error migrating users:', error)
    return false
  }
}

/**
 * 遷移用戶角色到 user_roles 表
 */
async function migrateUserRoles() {
  console.log('\n🎭 Migrating user roles...')
  
  try {
    // 清理現有角色資料
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .neq('id', 0) // Delete all

    if (deleteError) {
      console.warn('⚠️ Warning cleaning existing roles:', deleteError.message)
    }

    // 為每個用戶創建角色記錄
    const rolesToInsert = users.flatMap(user =>
      user.roles.map(role => ({
        user_id: `user-${user.id}`,
        role: role,
        organization_id: user.corp_id ? `org-${user.corp_id}` : null,
        is_primary: user.roles.indexOf(role) === 0, // 第一個角色為主要角色
        assigned_by: null,
        is_active: true
      }))
    )

    const { data, error } = await supabase
      .from('user_roles')
      .insert(rolesToInsert)
      .select()

    if (error) {
      console.error('❌ Error migrating user roles:', error)
      return false
    }

    console.log(`✅ Successfully migrated ${data?.length || 0} user roles`)
    return true
  } catch (error) {
    console.error('❌ Unexpected error migrating user roles:', error)
    return false
  }
}

/**
 * 遷移組織資料到 organizations 表
 */
async function migrateOrganizations() {
  console.log('\n🏢 Migrating organizations data...')
  
  try {
    // 清理現有資料
    const { error: deleteError } = await supabase
      .from('organizations')
      .delete()
      .neq('id', 'dummy-org')

    if (deleteError) {
      console.warn('⚠️ Warning cleaning existing organizations:', deleteError.message)
    }

    // 從企業會員資料推斷組織
    const uniqueOrgs = new Map()
    corporateMembers.forEach(member => {
      if (!uniqueOrgs.has(member.corp_id)) {
        uniqueOrgs.set(member.corp_id, {
          id: `org-${member.corp_id}`,
          name: member.company_name,
          contact_name: member.user_name,
          contact_email: member.user_email,
          contact_phone: null,
          address: null,
          industry: member.company_name.includes('台積電') ? '半導體' : 
                   member.company_name.includes('鴻海') ? '電子製造' : '其他',
          employee_count: '1000+',
          status: 'active',
          created_at: member.created_at,
          updated_at: member.updated_at
        })
      }
    })

    // 額外添加一些測試組織
    uniqueOrgs.set('test-1', {
      id: 'org-test-1',
      name: '測試科技有限公司',
      contact_name: 'John Doe',
      contact_email: 'contact@test.com',
      contact_phone: '02-1234-5678',
      address: '台北市信義區信義路五段7號',
      industry: '資訊科技',
      employee_count: '100-500',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    const orgsToInsert = Array.from(uniqueOrgs.values())

    const { data, error } = await supabase
      .from('organizations')
      .insert(orgsToInsert)
      .select()

    if (error) {
      console.error('❌ Error migrating organizations:', error)
      return false
    }

    console.log(`✅ Successfully migrated ${data?.length || 0} organizations`)
    return true
  } catch (error) {
    console.error('❌ Unexpected error migrating organizations:', error)
    return false
  }
}

/**
 * 遷移會員方案到 membership_plans 表
 */
async function migrateMembershipPlans() {
  console.log('\n📋 Migrating membership plans...')
  
  try {
    // 清理現有資料
    const { error: deleteError } = await supabase
      .from('membership_plans')
      .delete()
      .neq('id', 'dummy-plan')

    if (deleteError) {
      console.warn('⚠️ Warning cleaning existing plans:', deleteError.message)
    }

    // 創建標準會員方案
    const plansToInsert = [
      {
        id: 'plan-individual-season',
        name: '個人季度會員',
        type: 'INDIVIDUAL',
        duration_months: 3,
        price: 5000,
        campus: '羅斯福校',
        description: '個人季度會員方案，包含基礎課程預約權益',
        features: ['課程預約', '教材下載', '進度追蹤'],
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'plan-individual-annual',
        name: '個人年度會員',
        type: 'INDIVIDUAL',
        duration_months: 12,
        price: 18000,
        campus: '羅斯福校',
        description: '個人年度會員方案，包含完整課程預約權益',
        features: ['課程預約', '教材下載', '進度追蹤', '一對一諮詢'],
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'plan-corporate-annual',
        name: '企業年度方案',
        type: 'CORPORATE',
        duration_months: 12,
        price: 50000,
        campus: '羅斯福校',
        description: '企業年度會員方案，支援多位員工使用',
        features: ['批量課程預約', '企業專屬課程', '學習報告', '專屬客服'],
        is_active: true,
        created_at: new Date().toISOString()
      }
    ]

    const { data, error } = await supabase
      .from('membership_plans')
      .insert(plansToInsert)
      .select()

    if (error) {
      console.error('❌ Error migrating membership plans:', error)
      return false
    }

    console.log(`✅ Successfully migrated ${data?.length || 0} membership plans`)
    return true
  } catch (error) {
    console.error('❌ Unexpected error migrating membership plans:', error)
    return false
  }
}

/**
 * 遷移會員資格到 unified_memberships 表
 */
async function migrateMemberships() {
  console.log('\n🎫 Migrating memberships data...')
  
  try {
    // 清理現有資料
    const { error: deleteError } = await supabase
      .from('unified_memberships')
      .delete()
      .neq('id', 'dummy-membership')

    if (deleteError) {
      console.warn('⚠️ Warning cleaning existing memberships:', deleteError.message)
    }

    // 為激活狀態的用戶創建會員資格
    const activatedUsers = users.filter(user => user.membership_status === 'activated')
    const membershipsToInsert = activatedUsers.map((user, index) => ({
      id: `membership-${user.id}`,
      user_id: `user-${user.id}`,
      organization_id: user.corp_id ? `org-${user.corp_id}` : null,
      plan_id: user.corp_id ? 'plan-corporate-annual' : 'plan-individual-annual',
      type: user.corp_id ? 'CORPORATE' : 'INDIVIDUAL',
      status: 'ACTIVATED',
      card_number: `MC${String(1000 + index).padStart(6, '0')}`,
      purchased_at: user.created_at,
      activated_at: user.created_at,
      expires_at: new Date(new Date(user.created_at).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      campus: user.campus,
      price_paid: user.corp_id ? 50000 : 18000,
      auto_renewal: false,
      created_at: user.created_at,
      updated_at: user.updated_at || user.created_at
    }))

    if (membershipsToInsert.length === 0) {
      console.log('ℹ️  No activated users found, skipping memberships migration')
      return true
    }

    const { data, error } = await supabase
      .from('unified_memberships')
      .insert(membershipsToInsert)
      .select()

    if (error) {
      console.error('❌ Error migrating memberships:', error)
      return false
    }

    console.log(`✅ Successfully migrated ${data?.length || 0} memberships`)
    return true
  } catch (error) {
    console.error('❌ Unexpected error migrating memberships:', error)
    return false
  }
}

/**
 * 創建基礎課程模板
 */
async function migrateCourseTemplates() {
  console.log('\n📚 Migrating course templates...')
  
  try {
    // 清理現有資料
    const { error: deleteError } = await supabase
      .from('course_templates')
      .delete()
      .neq('id', 'dummy-template')

    if (deleteError) {
      console.warn('⚠️ Warning cleaning existing templates:', deleteError.message)
    }

    // 創建基礎課程模板
    const templatesToInsert = [
      {
        id: 'template-chinese-basic',
        title: '基礎中文會話',
        description: '適合中文初學者的基礎會話課程',
        category: '中文',
        level: '初級',
        format: 'GROUP',
        total_sessions: 12,
        session_duration_minutes: 90,
        default_capacity: 8,
        base_pricing: {
          member: 2000,
          non_member: 2400
        },
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'template-english-business',
        title: '商業英文溝通',
        description: '商業場合的英文溝通技巧訓練',
        category: '英文',
        level: '中級',
        format: 'GROUP',
        total_sessions: 16,
        session_duration_minutes: 120,
        default_capacity: 6,
        base_pricing: {
          member: 3200,
          non_member: 3800
        },
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'template-culture-intro',
        title: '台灣文化導覽',
        description: '深入了解台灣文化與社會',
        category: '文化',
        level: '不限',
        format: 'WORKSHOP',
        total_sessions: 6,
        session_duration_minutes: 180,
        default_capacity: 12,
        base_pricing: {
          member: 1500,
          non_member: 1800
        },
        is_active: true,
        created_at: new Date().toISOString()
      }
    ]

    const { data, error } = await supabase
      .from('course_templates')
      .insert(templatesToInsert)
      .select()

    if (error) {
      console.error('❌ Error migrating course templates:', error)
      return false
    }

    console.log(`✅ Successfully migrated ${data?.length || 0} course templates`)
    return true
  } catch (error) {
    console.error('❌ Unexpected error migrating course templates:', error)
    return false
  }
}

/**
 * 主遷移函數
 */
async function runMigration() {
  console.log('🎯 Phase 4.6: Data Migration - localStorage to Supabase')
  console.log('=' .repeat(60))
  
  const startTime = Date.now()
  let successCount = 0
  let totalTasks = 0

  const migrationTasks = [
    { name: 'Organizations', fn: migrateOrganizations },
    { name: 'Membership Plans', fn: migrateMembershipPlans },
    { name: 'Users', fn: migrateUsers },
    { name: 'Memberships', fn: migrateMemberships },
    { name: 'Course Templates', fn: migrateCourseTemplates }
  ]

  totalTasks = migrationTasks.length

  for (const task of migrationTasks) {
    const taskStart = Date.now()
    const success = await task.fn()
    const taskTime = Date.now() - taskStart
    
    if (success) {
      successCount++
      console.log(`⏱️  ${task.name} completed in ${taskTime}ms`)
    } else {
      console.error(`💥 ${task.name} failed after ${taskTime}ms`)
    }
  }

  const totalTime = Date.now() - startTime
  
  console.log('\n' + '=' .repeat(60))
  console.log('📊 Migration Summary:')
  console.log(`✅ Successful: ${successCount}/${totalTasks} tasks`)
  console.log(`⏱️  Total time: ${totalTime}ms`)
  console.log(`🎯 Success rate: ${Math.round(successCount / totalTasks * 100)}%`)
  
  if (successCount === totalTasks) {
    console.log('🎉 All migrations completed successfully!')
    console.log('🚀 System ready for testing with real data!')
  } else {
    console.log('⚠️  Some migrations failed. Please check the logs above.')
  }
}

// 執行遷移
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('\n🏁 Migration script finished.')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Migration script crashed:', error)
      process.exit(1)
    })
}

export { runMigration }