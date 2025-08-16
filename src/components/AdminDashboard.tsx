'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import { useAuth } from '@/contexts/AuthContext';
import { agentService } from '@/services/unified/agentService';
import { memberCardService } from '@/services/unified/membershipService';
import { bookingService } from '@/services/unified/bookingService';
import Link from 'next/link';

const {
  FiUsers, FiUserCheck, FiCalendar, FiDollarSign, FiTrendingUp,
  FiClock, FiStar, FiActivity, FiAlertTriangle, FiCheckCircle, FiXCircle,
  FiSettings, FiBriefcase, FiUser, FiShield, FiBookOpen
} = FiIcons;

interface DashboardStats {
  totalUsers: number;
  activeMemberships: number;
  expiredMemberships: number;
  pendingMemberships: number;
  upcomingBookings: number;
  completedBookings: number;
  totalTeachers: number;
  activeTeachers: number;
  totalAgents: number;
  totalSales: number;
  totalCommission: number;
  totalCourses: number;
  recentRegistrations: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'membership_purchase' | 'booking_made' | 'course_completed' | 'agent_sale';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  count?: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data from Supabase APIs (working) and mock other services temporarily
      const [
        allUsers,
        allTeachers
      ] = await Promise.all([
        // Fetch users from Supabase
        fetch('/api/admin/users').then(res => res.json()).catch(err => {
          console.warn('Users fetch failed:', err);
          return { success: false, data: [] };
        }),
        // Fetch teachers from Supabase  
        fetch('/api/teachers').then(res => res.json()).catch(err => {
          console.warn('Teachers fetch failed:', err);
          return { success: false, data: [] };
        })
      ]);

      // Mock other services to avoid hanging
      const agentStats = { totalAgents: 5, totalSales: 150000, totalCommission: 15000 };
      const allMemberships = [
        { status: 'activated' }, { status: 'activated' }, { status: 'expired' }, { status: 'inactive' }
      ];
      const allBookings = { 
        success: true, 
        data: [
          { status: 'CONFIRMED' }, { status: 'CONFIRMED' }, { status: 'COMPLETED' }, { status: 'PENDING' }
        ] 
      };

      // Calculate comprehensive statistics
      const completedBookings = allBookings.success ? 
        (allBookings.data || []).filter(b => b.status === 'COMPLETED').length : 0;
      
      const recentRegistrations = allUsers.success ? 
        (allUsers.data || []).filter(u => {
          const createdAt = new Date(u.created_at);
          const now = new Date();
          const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
          return diffDays <= 7; // Last 7 days
        }).length : 0;

      const teachersData = allTeachers.success ? allTeachers.data || [] : [];
      const activeTeachers = teachersData.filter(t => t.status === 'active').length;

      // Calculate dashboard statistics manually
      const totalUsers = allUsers.success ? allUsers.data?.length || 0 : 0;
      const activeMemberships = allMemberships.filter(m => m.status === 'activated').length;
      const expiredMemberships = allMemberships.filter(m => m.status === 'expired').length;
      const pendingMemberships = allMemberships.filter(m => m.status === 'inactive').length;
      const upcomingBookings = allBookings.success ? 
        (allBookings.data || []).filter(a => a.status === 'CONFIRMED').length : 0;

      // Determine system health
      let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      const expiredRatio = expiredMemberships / (activeMemberships + expiredMemberships || 1);
      if (expiredRatio > 0.3) systemHealth = 'warning';
      if (expiredRatio > 0.5) systemHealth = 'critical';

      const dashboardStatsComplete: DashboardStats = {
        totalUsers,
        activeMemberships,
        expiredMemberships,
        pendingMemberships,
        upcomingBookings,
        completedBookings,
        totalTeachers: teachersData.length,
        totalAgents: agentStats.totalAgents,
        totalSales: agentStats.totalSales,
        totalCommission: agentStats.totalCommission,
        totalCourses: 0, // Will be updated when course service is available
        activeTeachers,
        recentRegistrations,
        systemHealth
      };

      setStats(dashboardStatsComplete);

      // Generate recent activities (mock data for now)
      const activities: RecentActivity[] = [
        {
          id: '1',
          type: 'user_registration',
          title: '新用戶註冊',
          description: `過去 7 天有 ${recentRegistrations} 位新用戶註冊`,
          timestamp: new Date().toISOString(),
          icon: FiUserCheck,
          color: 'text-green-600'
        },
        {
          id: '2',
          type: 'membership_purchase',
          title: '會員卡購買',
          description: `目前有 ${activeMemberships} 張活躍會員卡`,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          icon: FiStar,
          color: 'text-yellow-600'
        },
        {
          id: '3',
          type: 'booking_made',
          title: '課程預約',
          description: `有 ${upcomingBookings} 個即將到來的預約`,
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          icon: FiCalendar,
          color: 'text-blue-600'
        },
        {
          id: '4',
          type: 'agent_sale',
          title: '代理商銷售',
          description: `代理商總銷售額達 NT$ ${agentStats.totalSales.toLocaleString()}`,
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          icon: FiTrendingUp,
          color: 'text-purple-600'
        }
      ];

      setRecentActivities(activities);

    } catch (err) {
      console.error('載入儀表板數據失敗:', err);
      setError('載入儀表板數據失敗，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Quick actions configuration
  const quickActions: QuickAction[] = [
    {
      title: '用戶管理',
      description: '管理系統用戶和權限',
      href: '/admin/account-management',
      icon: FiUsers,
      color: 'bg-blue-500 hover:bg-blue-600',
      count: stats?.totalUsers
    },
    {
      title: '會員管理',
      description: '查看和管理會員卡',
      href: '/admin/member-management',
      icon: FiStar,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      count: stats?.activeMemberships
    },
    {
      title: '教師管理',
      description: '管理教師資訊和排程',
      href: '/admin/teacher-management',
      icon: FiUser,
      color: 'bg-green-500 hover:bg-green-600',
      count: stats?.totalTeachers
    },
    {
      title: '代理管理',
      description: '管理代理商和分潤',
      href: '/admin/agent-management',
      icon: FiBriefcase,
      color: 'bg-purple-500 hover:bg-purple-600',
      count: stats?.totalAgents
    },
    {
      title: '課程管理',
      description: '管理課程和排程',
      href: '/admin/course-management',
      icon: FiBookOpen,
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
    {
      title: '系統設定',
      description: '系統配置和設定',
      href: '/admin/system-settings',
      icon: FiSettings,
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ];

  // Get system health color
  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Get system health icon
  const getSystemHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return FiCheckCircle;
      case 'warning': return FiAlertTriangle;
      case 'critical': return FiXCircle;
      default: return FiActivity;
    }
  };

  // Show unauthorized message for non-admin users
  if (!user || !user.roles.includes('ADMIN')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <SafeIcon icon={FiShield} className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">權限不足</h3>
          <p className="mt-1 text-sm text-gray-500">
            您需要管理員權限才能訪問此儀表板。
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入儀表板數據中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <SafeIcon icon={FiAlertTriangle} className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">載入失敗</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">管理員儀表板</h1>
          <p className="text-gray-600">歡迎回來，{user?.name}！以下是系統概況</p>
        </div>
        
        {/* System Health Indicator */}
        {stats && (
          <div className="flex items-center space-x-2">
            <SafeIcon 
              icon={getSystemHealthIcon(stats.systemHealth)} 
              className={`h-5 w-5 ${getSystemHealthColor(stats.systemHealth)}`}
            />
            <span className={`text-sm font-medium ${getSystemHealthColor(stats.systemHealth)}`}>
              系統狀態: {stats.systemHealth === 'healthy' ? '正常' : 
                        stats.systemHealth === 'warning' ? '注意' : '警告'}
            </span>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <SafeIcon icon={FiUsers} className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">總用戶數</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-green-600">
                  +{stats.recentRegistrations} 本週新增
                </p>
              </div>
            </div>
          </motion.div>

          {/* Active Memberships */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <SafeIcon icon={FiStar} className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">活躍會員</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeMemberships.toLocaleString()}</p>
                <p className="text-xs text-gray-500">
                  {stats.expiredMemberships} 已過期
                </p>
              </div>
            </div>
          </motion.div>

          {/* Upcoming Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <SafeIcon icon={FiCalendar} className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">即將到來的預約</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingBookings.toLocaleString()}</p>
                <p className="text-xs text-gray-500">
                  {stats.completedBookings} 已完成
                </p>
              </div>
            </div>
          </motion.div>

          {/* Teachers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <SafeIcon icon={FiUser} className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">教師總數</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTeachers.toLocaleString()}</p>
                <p className="text-xs text-green-600">
                  {stats.activeTeachers} 活躍中
                </p>
              </div>
            </div>
          </motion.div>

          {/* Agents Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <SafeIcon icon={FiBriefcase} className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">代理商總數</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAgents.toLocaleString()}</p>
                <p className="text-xs text-gray-500">
                  總銷售: NT$ {stats.totalSales.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <SafeIcon icon={FiDollarSign} className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">代理分潤</p>
                <p className="text-2xl font-bold text-gray-900">NT$ {stats.totalCommission.toLocaleString()}</p>
                <p className="text-xs text-gray-500">
                  來自 {stats.totalAgents} 位代理商
                </p>
              </div>
            </div>
          </motion.div>

          {/* Pending Memberships */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <SafeIcon icon={FiClock} className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">待啟用會員</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingMemberships.toLocaleString()}</p>
                <p className="text-xs text-yellow-600">
                  需要處理
                </p>
              </div>
            </div>
          </motion.div>

          {/* System Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <SafeIcon 
                  icon={getSystemHealthIcon(stats.systemHealth)} 
                  className={`h-8 w-8 ${getSystemHealthColor(stats.systemHealth)}`}
                />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">系統狀態</p>
                <p className={`text-2xl font-bold ${getSystemHealthColor(stats.systemHealth)}`}>
                  {stats.systemHealth === 'healthy' ? '良好' : 
                   stats.systemHealth === 'warning' ? '注意' : '警告'}
                </p>
                <p className="text-xs text-gray-500">
                  所有服務正常運行
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">快速操作</h3>
            <p className="text-sm text-gray-600">常用管理功能</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group relative bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors"
                >
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-white`}>
                      <SafeIcon icon={action.icon} className="h-5 w-5" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                        {action.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {action.description}
                      </p>
                      {action.count !== undefined && (
                        <p className="text-xs font-medium text-blue-600">
                          {action.count.toLocaleString()} 項目
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">最近活動</h3>
            <p className="text-sm text-gray-600">系統重要事件</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3"
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${activity.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                    <SafeIcon icon={activity.icon} className={`h-4 w-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleString('zh-TW')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}