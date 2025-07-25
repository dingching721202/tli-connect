'use client';

import React from 'react';
import Navigation from '@/components/Navigation';
import NewCourseManagement from '@/components/NewCourseManagement';
import { useAuth } from '@/contexts/AuthContext';

export default function CourseManagementPage() {
  const { user } = useAuth();

  // 權限檢查：只有管理員和運營可以訪問
  if (!user || !['OPS', 'ADMIN'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">存取被拒</h1>
            <p className="text-gray-600">此頁面僅供管理員和運營人員使用。</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <NewCourseManagement />
    </div>
  );
}