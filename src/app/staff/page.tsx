'use client';

import React from 'react';
import RoleEntry from '@/components/RoleEntry';
import { FiUser, FiUsers, FiUserCheck, FiClock, FiBookOpen, FiSettings, FiBriefcase, FiUserPlus } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const StaffDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();

  const staffFeatures = [
    {
      title: '儀表板',
      description: '管理概況總覽',
      icon: FiUser,
      href: '/dashboard',
      color: 'bg-blue-500'
    },
    {
      title: '會員管理',
      description: '管理學員資料',
      icon: FiUsers,
      href: '/member-management',
      color: 'bg-green-500'
    },
    {
      title: '教師管理',
      description: '管理教師資料',
      icon: FiUserCheck,
      href: '/teacher-management',
      color: 'bg-purple-500'
    },
    {
      title: '請假管理',
      description: '處理請假申請',
      icon: FiClock,
      href: '/leave-management',
      color: 'bg-orange-500'
    },
    {
      title: '課程管理',
      description: '管理課程內容',
      icon: FiBookOpen,
      href: '/course-management',
      color: 'bg-red-500'
    },
    {
      title: '會員卡方案管理',
      description: '管理會員方案',
      icon: FiSettings,
      href: '/member-card-plan-management',
      color: 'bg-indigo-500'
    },
    {
      title: '諮詢管理',
      description: '處理學員諮詢',
      icon: FiBriefcase,
      href: '/consultation-management',
      color: 'bg-pink-500'
    },
    {
      title: '代理管理',
      description: '管理代理商',
      icon: FiUserPlus,
      href: '/agent-management',
      color: 'bg-cyan-500'
    },
    {
      title: '系統設定',
      description: '系統參數設定',
      icon: FiSettings,
      href: '/system-settings',
      color: 'bg-gray-500'
    }
  ];

  return (
    <RoleEntry requiredRole="STAFF">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            職員管理專區
          </h1>
          <p className="text-gray-600">
            歡迎回來，{user?.name}！這是您的職員管理中心。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffFeatures.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.href}
                onClick={() => router.push(feature.href)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6"
              >
                <div className="flex items-center mb-4">
                  <div className={`${feature.color} p-3 rounded-lg mr-4`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                  </div>
                </div>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-purple-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-purple-900 mb-2">
            職員提醒
          </h2>
          <p className="text-purple-700">
            您正在使用職員專用介面。這裡包含所有職員管理功能。
          </p>
        </div>
      </div>
    </RoleEntry>
  );
};

export default StaffDashboard;