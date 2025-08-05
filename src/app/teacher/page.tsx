'use client';

import React from 'react';
import RoleEntry from '@/components/RoleEntry';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const TeacherDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();

  const teacherFeatures = [
    {
      title: '儀表板',
      description: '查看教學概況',
      icon: FiUser,
      href: '/dashboard',
      color: 'bg-blue-500'
    },
    {
      title: '我的預約',
      description: '管理教學時段',
      icon: FiCalendar,
      href: '/my-bookings',
      color: 'bg-green-500'
    }
  ];

  return (
    <RoleEntry requiredRole="TEACHER">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            教師專區
          </h1>
          <p className="text-gray-600">
            歡迎回來，{user?.name} 老師！這是您的教學管理中心。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teacherFeatures.map((feature) => {
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

        <div className="mt-8 bg-green-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-900 mb-2">
            教學提醒
          </h2>
          <p className="text-green-700">
            您正在使用教師專用介面。這裡只顯示與教學相關的功能。
          </p>
        </div>
      </div>
    </RoleEntry>
  );
};

export default TeacherDashboard;