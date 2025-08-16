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
  const { isAuthenticated, loading, setRoleLock, hasRole, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('🔍 RoleEntry 權限檢查 - loading:', loading, 'isAuthenticated:', isAuthenticated, 'requiredRole:', requiredRole);
    console.log('👤 當前用戶:', user);
    console.log('🎭 用戶角色:', user?.roles);
    console.log('✅ hasRole result:', hasRole(requiredRole));
    
    if (loading) {
      console.log('⏳ 還在載入中，等待...');
      return;
    }

    if (!isAuthenticated) {
      console.log('❌ 未登入，跳轉到登入頁面');
      // 未登入，導向角色專用登入頁面
      const roleLoginPath = getRoleLoginPath(requiredRole);
      router.push(roleLoginPath);
      return;
    }

    if (!hasRole(requiredRole)) {
      console.log('❌ 用戶沒有所需角色權限:', requiredRole);
      // 用戶沒有此角色權限，導向首頁
      router.push('/');
      return;
    }

    // 用戶有此角色權限，但不自動設置角色鎖定
    // 讓用戶手動選擇要使用的角色
    console.log('✅ RoleEntry 檢查通過 - 用戶有權限訪問此頁面:', requiredRole);
  }, [isAuthenticated, loading, hasRole, requiredRole, router, setRoleLock, user]);

  const getRoleLoginPath = (role: string) => {
    const rolePathMap = {
      'STUDENT': '/student/login',
      'TEACHER': '/teacher/login',
      'STAFF': '/staff/login',
      'ADMIN': '/admin/login',
      'AGENT': '/agent/login',
      'CORPORATE_CONTACT': '/corporate_contact/login'
    };
    return rolePathMap[role as keyof typeof rolePathMap] || '/login';
  };

  if (loading) {
    return (
      <div className="main-layout">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">載入中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="main-layout">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-gray-600">重新導向至登入頁面...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasRole(requiredRole)) {
    return (
      <div className="main-layout">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-gray-600">您沒有權限存取此頁面，正在重新導向...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-layout">
      <Navigation />
      <main className="page-container pt-20">
        {children}
      </main>
    </div>
  );
};

export default RoleEntry;