'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import type { User } from '@/types';

interface AdminDashboardData {
  user: User;
  systemStats: {
    totalUsers: number;
    activeMembers: number;
    totalCourses: number;
    monthlyRevenue: number;
    newUsersThisMonth: number;
    completedBookings: number;
    pendingInquiries: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
  };
  recentActivities: Array<{
    id: string;
    type: 'user_registration' | 'booking_created' | 'membership_purchased' | 'course_completed' | 'inquiry_received';
    message: string;
    timestamp: string;
    severity: 'info' | 'success' | 'warning' | 'error';
  }>;
  quickActions: Array<{
    title: string;
    description: string;
    icon: string;
    path: string;
    color: string;
  }>;
}

export default function AdminPortal() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    
    // 檢查用戶角色權限
    if (!user || user.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    // 載入管理員儀表板資料
    loadAdminDashboard();
  }, [user, loading, router, loadAdminDashboard]);

  const loadAdminDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 模擬載入管理員資料
      setDashboardData({
        user: user!,
        systemStats: {
          totalUsers: 2456,
          activeMembers: 1823,
          totalCourses: 156,
          monthlyRevenue: 980000,
          newUsersThisMonth: 234,
          completedBookings: 1567,
          pendingInquiries: 23,
          systemHealth: 'healthy'
        },
        recentActivities: [
          {
            id: '1',
            type: 'user_registration',
            message: '新用戶 王小明 註冊成功',
            timestamp: '2024-01-15T10:30:00Z',
            severity: 'success'
          },
          {
            id: '2', 
            type: 'membership_purchased',
            message: '用戶 李美華 購買年度會員卡',
            timestamp: '2024-01-15T10:15:00Z',
            severity: 'success'
          },
          {
            id: '3',
            type: 'inquiry_received',
            message: '收到企業客戶 ABC公司 的詢問',
            timestamp: '2024-01-15T09:45:00Z',
            severity: 'info'
          }
        ],
        quickActions: [
          {
            title: '用戶管理',
            description: '管理系統用戶、權限和狀態',
            icon: '👥',
            path: '/member-management',
            color: 'blue'
          },
          {
            title: '課程管理', 
            description: '創建和管理課程內容',
            icon: '📚',
            path: '/course-management',
            color: 'green'
          },
          {
            title: '會員卡管理',
            description: '管理會員卡方案和狀態',
            icon: '💳',
            path: '/member-card-plan-management',
            color: 'purple'
          },
          {
            title: '教師管理',
            description: '管理教師資料和排程',
            icon: '👨‍🏫',
            path: '/teacher-management',
            color: 'indigo'
          },
          {
            title: '企業客戶',
            description: '管理企業客戶和合約',
            icon: '🏢',
            path: '/corporate-management',
            color: 'orange'
          },
          {
            title: '代理商管理',
            description: '管理代理商和推薦系統',
            icon: '🤝',
            path: '/agent-management',
            color: 'teal'
          },
          {
            title: '系統設定',
            description: '系統參數和配置管理',
            icon: '⚙️',
            path: '/system-settings',
            color: 'gray'
          },
          {
            title: '資料分析',
            description: '查看系統使用統計',
            icon: '📊',
            path: '/analytics',
            color: 'pink'
          }
        ]
      });
    } catch (error) {
      console.error('Failed to load admin dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration': return '👤';
      case 'booking_created': return '📅';
      case 'membership_purchased': return '💳';
      case 'course_completed': return '🎓';
      case 'inquiry_received': return '💬';
      default: return '📝';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入管理員門戶...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* 歡迎區塊 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                管理控制台
              </h1>
              <p className="text-gray-600 mt-2">
                歡迎，{dashboardData?.user.name} 管理員
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                  管理員門戶
                </div>
                <div className={`px-2 py-1 rounded text-sm font-medium ${getHealthStatusColor(dashboardData?.systemStats.systemHealth || 'healthy')}`}>
                  系統狀態：{dashboardData?.systemStats.systemHealth === 'healthy' ? '正常' : '異常'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">總用戶數</p>
                <p className="text-2xl font-bold text-gray-800">
                  {dashboardData?.systemStats.totalUsers.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">
                  +{dashboardData?.systemStats.newUsersThisMonth} 本月新增
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-2xl">💳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">活躍會員</p>
                <p className="text-2xl font-bold text-gray-800">
                  {dashboardData?.systemStats.activeMembers.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  占總用戶 {((dashboardData?.systemStats.activeMembers || 0) / (dashboardData?.systemStats.totalUsers || 1) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">本月營收</p>
                <p className="text-2xl font-bold text-gray-800">
                  ${(dashboardData?.systemStats.monthlyRevenue || 0).toLocaleString()}
                </p>
                <p className="text-xs text-green-600">較上月成長 8.2%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full">
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">總課程數</p>
                <p className="text-2xl font-bold text-gray-800">
                  {dashboardData?.systemStats.totalCourses}
                </p>
                <p className="text-xs text-gray-500">
                  {dashboardData?.systemStats.completedBookings} 完成預約
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 快速操作 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">管理功能</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData?.quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => router.push(action.path)}
                    className={`flex items-center p-4 border border-gray-200 rounded-lg hover:border-${action.color}-300 hover:bg-${action.color}-50 transition-colors text-left`}
                  >
                    <span className="text-3xl mr-4">{action.icon}</span>
                    <div>
                      <h3 className="font-medium text-gray-800">{action.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 最近活動 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">最近活動</h2>
                {dashboardData?.systemStats.pendingInquiries ? (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                    {dashboardData.systemStats.pendingInquiries} 待處理
                  </span>
                ) : null}
              </div>
              
              <div className="space-y-4">
                {dashboardData?.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <span className="text-xl">{getActivityIcon(activity.type)}</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString('zh-TW')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium">
                查看所有活動 →
              </button>
            </div>
          </div>
        </div>

        {/* 系統監控 */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">系統概況</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-medium text-gray-800">服務可用性</h3>
              <p className="text-2xl font-bold text-green-600">99.9%</p>
              <p className="text-sm text-gray-500">過去30天</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-medium text-gray-800">平均響應時間</h3>
              <p className="text-2xl font-bold text-blue-600">240ms</p>
              <p className="text-sm text-gray-500">API 響應</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="font-medium text-gray-800">用戶滿意度</h3>
              <p className="text-2xl font-bold text-purple-600">4.8/5</p>
              <p className="text-sm text-gray-500">基於評價</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}