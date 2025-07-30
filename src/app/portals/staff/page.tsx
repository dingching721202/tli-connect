'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import type { User, ContactInquiry, Booking } from '@/types';

interface StaffDashboardData {
  user: User;
  workload: {
    assignedInquiries: number;
    resolvedToday: number;
    pendingApprovals: number;
    scheduledCalls: number;
  };
  assignedTasks: Array<{
    id: string;
    type: 'inquiry' | 'booking_issue' | 'membership_support' | 'course_coordination';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    deadline: string;
    status: 'new' | 'in_progress' | 'pending_review' | 'completed';
  }>;
  recentActivities: Array<{
    id: string;
    action: string;
    target: string;
    timestamp: string;
    result: 'success' | 'pending' | 'failed';
  }>;
}

export default function StaffPortal() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<StaffDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    
    // 檢查用戶角色權限 - 員工或管理員都可以進入
    if (!user || !['STAFF', 'ADMIN'].includes(user.role)) {
      router.push('/login');
      return;
    }

    // 載入員工儀表板資料
    loadStaffDashboard();
  }, [user, loading, router]);

  const loadStaffDashboard = async () => {
    try {
      setIsLoading(true);
      
      // 模擬載入員工工作資料
      setDashboardData({
        user: user!,
        workload: {
          assignedInquiries: 12,
          resolvedToday: 8,
          pendingApprovals: 3,
          scheduledCalls: 5
        },
        assignedTasks: [
          {
            id: '1',
            type: 'inquiry',
            title: '企業客戶詢問',
            description: 'ABC公司詢問企業方案詳情',
            priority: 'high',
            deadline: '2024-01-16T17:00:00Z',
            status: 'new'
          },
          {
            id: '2',
            type: 'booking_issue',
            title: '預約問題處理',
            description: '學生王小明的課程預約衝突',
            priority: 'medium',
            deadline: '2024-01-16T15:00:00Z',
            status: 'in_progress'
          },
          {
            id: '3',
            type: 'membership_support',
            title: '會員卡啟用支援',
            description: '協助客戶啟用年度會員卡',
            priority: 'low',
            deadline: '2024-01-17T12:00:00Z',
            status: 'pending_review'
          }
        ],
        recentActivities: [
          {
            id: '1',
            action: '回覆客戶詢問',
            target: '詢問 #INQ-2024-001',
            timestamp: '2024-01-15T14:30:00Z',
            result: 'success'
          },
          {
            id: '2',
            action: '處理預約取消',
            target: '預約 #BK-2024-156',
            timestamp: '2024-01-15T13:45:00Z',
            result: 'success'
          },
          {
            id: '3',
            action: '協助會員啟用',
            target: '會員 #MB-2024-089',
            timestamp: '2024-01-15T11:20:00Z',
            result: 'pending'
          }
        ]
      });
    } catch (error) {
      console.error('Failed to load staff dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending_review': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'inquiry': return '💬';
      case 'booking_issue': return '📅';
      case 'membership_support': return '💳';
      case 'course_coordination': return '📚';
      default: return '📝';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入員工門戶...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* 歡迎區塊 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                員工工作台
              </h1>
              <p className="text-gray-600 mt-2">
                {dashboardData?.user.name}，今天有 {dashboardData?.assignedTasks.filter(t => t.status === 'new').length} 項新任務待處理
              </p>
            </div>
            <div className="text-right">
              <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                員工門戶
              </div>
              <div className="text-sm text-gray-600">
                今日已完成：{dashboardData?.workload.resolvedToday} 項任務
              </div>
            </div>
          </div>
        </div>

        {/* 工作統計 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-2xl">💬</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">分配詢問</p>
                <p className="text-2xl font-bold text-gray-800">
                  {dashboardData?.workload.assignedInquiries}
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
                <p className="text-sm text-gray-600">今日完成</p>
                <p className="text-2xl font-bold text-gray-800">
                  {dashboardData?.workload.resolvedToday}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">待審核</p>
                <p className="text-2xl font-bold text-gray-800">
                  {dashboardData?.workload.pendingApprovals}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <span className="text-2xl">📞</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">預約通話</p>
                <p className="text-2xl font-bold text-gray-800">
                  {dashboardData?.workload.scheduledCalls}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 分配的任務 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">我的任務</h2>
            
            <div className="space-y-4">
              {dashboardData?.assignedTasks.map((task) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{getTaskIcon(task.type)}</span>
                      <div>
                        <h3 className="font-medium text-gray-800">{task.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          截止：{new Date(task.deadline).toLocaleString('zh-TW')}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'urgent' ? '緊急' : 
                         task.priority === 'high' ? '高' :
                         task.priority === 'medium' ? '中' : '低'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status === 'new' ? '新任務' :
                         task.status === 'in_progress' ? '進行中' :
                         task.status === 'pending_review' ? '待審核' : '已完成'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex space-x-2">
                    {task.status === 'new' && (
                      <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                        開始處理
                      </button>
                    )}
                    {task.status === 'in_progress' && (
                      <button className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                        標記完成
                      </button>
                    )}
                    <button className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded hover:bg-gray-200">
                      查看詳情
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 最近活動 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">最近活動</h2>
            
            <div className="space-y-4">
              {dashboardData?.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${
                    activity.result === 'success' ? 'bg-green-500' :
                    activity.result === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                    <p className="text-xs text-gray-600">{activity.target}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString('zh-TW')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">快速操作</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/corporate-inquiries')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
            >
              <span className="text-2xl mb-2">📝</span>
              <span className="text-sm font-medium">客戶詢問</span>
            </button>
            
            <button
              onClick={() => router.push('/my-bookings')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
            >
              <span className="text-2xl mb-2">📅</span>
              <span className="text-sm font-medium">預約管理</span>
            </button>
            
            <button
              onClick={() => router.push('/member-management')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
            >
              <span className="text-2xl mb-2">👥</span>
              <span className="text-sm font-medium">會員支援</span>
            </button>
            
            <button
              onClick={() => router.push('/course-management')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
            >
              <span className="text-2xl mb-2">📚</span>
              <span className="text-sm font-medium">課程協調</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}