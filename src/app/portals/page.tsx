'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/types';

/**
 * 門戶路由器 - 根據用戶角色自動重導向到對應的門戶
 * 這是多門戶架構的核心路由組件
 */
export default function PortalRouter() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // 未登入用戶重導向到登入頁面
      router.push('/login');
      return;
    }

    // 根據用戶角色重導向到對應門戶
    const portalRoutes: Record<UserRole, string> = {
      STUDENT: '/portals/student',
      TEACHER: '/portals/teacher', 
      ADMIN: '/portals/admin',
      STAFF: '/portals/staff',
      CORPORATE_CONTACT: '/portals/corporate',
      AGENT: '/portals/agent'
    };

    const targetRoute = portalRoutes[user.role];
    if (targetRoute) {
      router.push(targetRoute);
    } else {
      // 未知角色，重導向到預設頁面
      console.warn(`Unknown user role: ${user.role}`);
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // 載入中的畫面
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
        <h2 className="mt-4 text-xl font-semibold text-gray-800">正在為您準備專屬門戶...</h2>
        <p className="mt-2 text-gray-600">
          {loading ? '驗證身份中' : user ? `重導向到${user.role}門戶` : '準備登入'}
        </p>
        
        {/* 門戶說明 */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">TLI Connect 多門戶系統</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🎓</span>
                <span className="text-gray-700">學生門戶</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">👨‍🏫</span>
                <span className="text-gray-700">教師門戶</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⚙️</span>
                <span className="text-gray-700">管理門戶</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">👥</span>
                <span className="text-gray-700">員工門戶</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🏢</span>
                <span className="text-gray-700">企業門戶</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🤝</span>
                <span className="text-gray-700">代理商門戶</span>
              </div>
            </div>
            
            <p className="mt-4 text-xs text-gray-500">
              每個門戶都針對不同角色的需求進行優化，提供專屬的功能和介面
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}