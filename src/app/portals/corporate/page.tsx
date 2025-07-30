'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import type { User, CorporateClient, CorporateSubscription, CorporateEmployee } from '@/types';

interface CorporateDashboardData {
  user: User;
  corporate: CorporateClient;
  subscription: CorporateSubscription;
  employees: CorporateEmployee[];
  usage: {
    totalEmployees: number;
    activeEmployees: number;
    monthlyUsage: number;
    remainingQuota: number;
    coursesCompleted: number;
    averageProgress: number;
  };
  recentActivities: Array<{
    id: string;
    employee: string;
    action: string;
    course?: string;
    timestamp: string;
    type: 'enrollment' | 'completion' | 'progress' | 'login';
  }>;
}

export default function CorporatePortal() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<CorporateDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    
    // 檢查用戶角色權限
    if (!user || user.role !== 'CORPORATE_CONTACT') {
      router.push('/login');
      return;
    }

    // 載入企業儀表板資料
    loadCorporateDashboard();
  }, [user, loading, router]);

  const loadCorporateDashboard = async () => {
    try {
      setIsLoading(true);
      
      // 模擬載入企業資料
      setDashboardData({
        user: user!,
        corporate: {
          id: 1,
          company_name: 'ABC科技股份有限公司',
          registration_number: '12345678',
          industry: '科技業',
          company_size: '100-500人',
          address: '台北市信義區信義路五段7號',
          primary_contact: {
            name: user!.name,
            position: '人力資源總監',
            email: user!.email,
            phone: user!.phone,
            department: '人力資源部'
          },
          billing_contact: {
            name: '財務部',
            position: '財務經理',
            email: 'finance@abc.com',
            phone: '02-1234-5678',
            department: '財務部'
          },
          contract_terms: {
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            auto_renewal: true,
            payment_terms: 'NET_30',
            discount_rate: 15,
            minimum_commitment: 50
          },
          status: 'ACTIVE',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z'
        },
        subscription: {
          id: 1,
          corporate_client_id: 1,
          plan_name: '企業標準方案',
          employee_limit: 100,
          course_access: [1, 2, 3, 4, 5],
          monthly_fee: 25000,
          setup_fee: 10000,
          status: 'ACTIVE',
          billing_cycle: 'MONTHLY',
          next_billing_date: '2024-02-01',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z'
        },
        employees: [],
        usage: {
          totalEmployees: 75,
          activeEmployees: 68,
          monthlyUsage: 245,
          remainingQuota: 155,
          coursesCompleted: 128,
          averageProgress: 72.5
        },
        recentActivities: [
          {
            id: '1',
            employee: '張小明',
            action: '完成課程',
            course: '商業英文會話',
            timestamp: '2024-01-15T14:30:00Z',
            type: 'completion'
          },
          {
            id: '2',
            employee: '李美華',
            action: '開始學習',
            course: '簡報技巧提升',
            timestamp: '2024-01-15T13:20:00Z',
            type: 'enrollment'
          },
          {
            id: '3',
            employee: '王大雄',
            action: '更新學習進度',
            course: '專案管理基礎',
            timestamp: '2024-01-15T11:45:00Z',
            type: 'progress'
          }
        ]
      });
    } catch (error) {
      console.error('Failed to load corporate dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment': return '📚';
      case 'completion': return '🎓';
      case 'progress': return '📈';
      case 'login': return '🔐';
      default: return '📝';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入企業門戶...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* 歡迎區塊 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {dashboardData?.corporate.company_name}
              </h1>
              <p className="text-gray-600 mt-2">
                企業學習管理平台 - {dashboardData?.user.name}
              </p>
            </div>
            <div className="text-right">
              <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                企業門戶
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  dashboardData?.subscription.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                <span>訂閱狀態：{dashboardData?.subscription.status === 'ACTIVE' ? '有效' : '無效'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 使用統計 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">員工總數</p>
                <p className="text-2xl font-bold text-gray-800">
                  {dashboardData?.usage.totalEmployees}
                </p>
                <p className="text-xs text-gray-500">
                  / {dashboardData?.subscription.employee_limit} 授權
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">活躍用戶</p>
                <p className="text-2xl font-bold text-gray-800">
                  {dashboardData?.usage.activeEmployees}
                </p>
                <p className="text-xs text-green-600">
                  {((dashboardData?.usage.activeEmployees || 0) / (dashboardData?.usage.totalEmployees || 1) * 100).toFixed(1)}% 參與率
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">完成課程</p>
                <p className="text-2xl font-bold text-gray-800">
                  {dashboardData?.usage.coursesCompleted}
                </p>
                <p className="text-xs text-gray-500">本月總計</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">平均進度</p>
                <p className="text-2xl font-bold text-gray-800">
                  {dashboardData?.usage.averageProgress}%
                </p>
                <p className="text-xs text-gray-500">所有員工</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 訂閱資訊 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">訂閱資訊</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">方案名稱</span>
                  <span className="font-medium">{dashboardData?.subscription.plan_name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">月費</span>
                  <span className="font-medium">NT$ {dashboardData?.subscription.monthly_fee?.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">下次計費</span>
                  <span className="font-medium">
                    {dashboardData?.subscription.next_billing_date && 
                     new Date(dashboardData.subscription.next_billing_date).toLocaleDateString('zh-TW')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">員工限制</span>
                  <span className="font-medium">
                    {dashboardData?.usage.totalEmployees} / {dashboardData?.subscription.employee_limit}
                  </span>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>本月使用量</span>
                    <span>{dashboardData?.usage.monthlyUsage} / 400 小時</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${((dashboardData?.usage.monthlyUsage || 0) / 400) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 合約資訊 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">合約資訊</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">合約期間</span>
                  <span>{dashboardData?.corporate.contract_terms.start_date} - {dashboardData?.corporate.contract_terms.end_date}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">付款條件</span>
                  <span>{dashboardData?.corporate.contract_terms.payment_terms}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">折扣率</span>
                  <span>{dashboardData?.corporate.contract_terms.discount_rate}%</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">自動續約</span>
                  <span>{dashboardData?.corporate.contract_terms.auto_renewal ? '是' : '否'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 員工學習活動 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">員工學習活動</h2>
              
              <div className="space-y-4">
                {dashboardData?.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{activity.employee}</p>
                      <p className="text-sm text-gray-600">
                        {activity.action} {activity.course && `「${activity.course}」`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString('zh-TW')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 學習進度圖表區域 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">學習統計</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="font-medium text-gray-800">課程完成率</h3>
                  <p className="text-2xl font-bold text-blue-600">85%</p>
                  <p className="text-sm text-gray-500">較上月 +12%</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">⏱️</span>
                  </div>
                  <h3 className="font-medium text-gray-800">平均學習時間</h3>
                  <p className="text-2xl font-bold text-green-600">3.2小時</p>
                  <p className="text-sm text-gray-500">每週人均</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="font-medium text-gray-800">目標達成率</h3>
                  <p className="text-2xl font-bold text-purple-600">78%</p>
                  <p className="text-sm text-gray-500">季度目標</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">管理功能</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/corporate-management')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <span className="text-2xl mb-2">👥</span>
              <span className="text-sm font-medium">員工管理</span>
            </button>
            
            <button
              onClick={() => router.push('/course-management')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <span className="text-2xl mb-2">📚</span>
              <span className="text-sm font-medium">課程分配</span>
            </button>
            
            <button
              onClick={() => router.push('/corporate-inquiries')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <span className="text-2xl mb-2">📈</span>
              <span className="text-sm font-medium">學習報表</span>
            </button>
            
            <button
              onClick={() => router.push('/profile')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <span className="text-2xl mb-2">⚙️</span>
              <span className="text-sm font-medium">帳戶設定</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}