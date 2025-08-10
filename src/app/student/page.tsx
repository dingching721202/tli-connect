'use client';

import React from 'react';
import RoleEntry from '@/components/RoleEntry';
import { FiBook, FiCalendar, FiUser, FiPlay, FiVideo, FiActivity } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const StudentDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();

  const studentFeatures = [
    {
      title: '課程預約',
      description: '預約一對一課程',
      icon: FiBook,
      href: '/student/booking',
      color: 'bg-blue-500'
    },
    {
      title: '我的預約',
      description: '查看已預約的課程',
      icon: FiCalendar,
      href: '/student/my-bookings',
      color: 'bg-green-500'
    },
    {
      title: '會員方案',
      description: '查看會員方案資訊',
      icon: FiUser,
      href: '/student/membership',
      color: 'bg-purple-500'
    },
    {
      title: '影音課程',
      description: '觀看線上影音課程',
      icon: FiPlay,
      href: '/student/video-courses',
      color: 'bg-red-500'
    },
    {
      title: '線上團課',
      description: '參加線上團體課程',
      icon: FiVideo,
      href: '/student/online-group-classes',
      color: 'bg-yellow-500'
    },
    {
      title: '活動',
      description: '參加各類學習活動',
      icon: FiActivity,
      href: '/student/events',
      color: 'bg-indigo-500'
    }
  ];

  return (
    <RoleEntry requiredRole="STUDENT">
      <div className="px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            學生專區
          </h1>
          <p className="text-gray-600">
            歡迎回來，{user?.name}！這是您的學習中心。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studentFeatures.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.href}
                onClick={() => router.push(feature.href)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6"
              >
                <div className="flex items-center mb-4">
                  <div className={`${feature.color} p-3 rounded-lg mr-4`}>
                    {IconComponent && <IconComponent className="h-6 w-6 text-white" />}
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

        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">
            學習提醒
          </h2>
          <p className="text-blue-700">
            您正在使用學生專用介面。所有功能都已針對學習體驗進行優化。
          </p>
        </div>
      </div>
    </RoleEntry>
  );
};

export default StudentDashboard;