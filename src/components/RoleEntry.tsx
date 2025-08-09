'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';

interface RoleEntryProps {
  requiredRole: 'STUDENT' | 'TEACHER' | 'STAFF' | 'ADMIN' | 'AGENT' | 'CORPORATE_CONTACT';
  children: React.ReactNode;
}

const RoleEntry: React.FC<RoleEntryProps> = ({ requiredRole, children }) => {
  const { isAuthenticated, loading, setRoleLock, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      // 未登入，導向角色專用登入頁面
      const roleLoginPath = getRoleLoginPath(requiredRole);
      router.push(roleLoginPath);
      return;
    }

    if (!hasRole(requiredRole)) {
      // 用戶沒有此角色權限，導向一般儀表板
      router.push('/dashboard');
      return;
    }

    // 用戶有此角色權限，鎖定到此角色
    setRoleLock(requiredRole);
  }, [isAuthenticated, loading, hasRole, requiredRole, router, setRoleLock]);

  const getRoleLoginPath = (role: string) => {
    const rolePathMap = {
      'STUDENT': '/student/login',
      'TEACHER': '/teacher/login',
      'STAFF': '/staff/login',
      'ADMIN': '/admin/login',
      'AGENT': '/agent/login',
      'CORPORATE_CONTACT': '/corporate/login'
    };
    return rolePathMap[role as keyof typeof rolePathMap] || '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">重新導向至登入頁面...</p>
        </div>
      </div>
    );
  }

  if (!hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">您沒有權限存取此頁面，正在重新導向...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        {children}
      </main>
    </div>
  );
};

export default RoleEntry;