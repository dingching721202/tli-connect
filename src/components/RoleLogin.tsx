'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { FiUser, FiLock, FiEye, FiEyeOff, FiLoader } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import SafeIcon from './common/SafeIcon';

interface RoleLoginProps {
  requiredRole: 'STUDENT' | 'TEACHER' | 'STAFF' | 'ADMIN' | 'AGENT' | 'CORPORATE_CONTACT';
  roleDisplayName: string;
  roleColor: string;
  redirectPath: string;
}

const RoleLogin: React.FC<RoleLoginProps> = ({ 
  requiredRole, 
  roleDisplayName, 
  roleColor, 
  redirectPath 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, loading, setRoleLock, switchRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // 移除自動跳轉邏輯，讓用戶手動登入

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('🔐 RoleLogin - 開始登入，email:', email, 'requiredRole:', requiredRole);
      const result = await login(email, password);
      console.log('📋 RoleLogin - 登入結果:', result);
      
      if (result.success && result.user) {
        // 保存登入來源頁面
        localStorage.setItem('loginSource', pathname);
        
        // 檢查是否有所需角色
        if (result.user.roles.includes(requiredRole)) {
          // 登入成功且有權限，先切換角色
          switchRole(requiredRole);
          // 只有單一角色的用戶才設置角色鎖定，多角色用戶保持可切換
          if (result.user.roles.length === 1) {
            setRoleLock(requiredRole);
          }
          // 使用 window.location.href 進行完整的頁面重新加載
          window.location.href = redirectPath;
        } else {
          // 沒有該角色權限，跳轉到通用登入頁面
          alert(`您的帳號沒有${roleDisplayName}權限，將跳轉到通用登入頁面`);
          router.push('/login');
        }
      } else {
        // 處理錯誤碼
        let errorMessage = result.error || '登入失敗';
        
        if (result.error === 'INVALID_CREDENTIALS') {
          errorMessage = '帳號或密碼錯誤，請重新輸入';
        }
        
        setError(errorMessage);
      }
    } catch {
      setError('登入過程中發生錯誤，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password');
    setError('');
  };

  // 取得該角色的測試帳號
  const getTestAccounts = () => {
    const testAccounts = [
      { email: 'admin@example.com', name: 'Admin User', roles: ['ADMIN'] },
      { email: 'staff@example.com', name: 'Olivia Kao', roles: ['STAFF'] }, 
      { email: 'teacher@example.com', name: '王老師', roles: ['TEACHER'] },
      { email: 'alice@example.com', name: 'Alice Wang', roles: ['STUDENT'] },
      { email: 'agent@example.com', name: '張代理', roles: ['AGENT'] },
      { email: 'consultant@example.com', name: '王顧問', roles: ['AGENT'] },
      { email: 'corporate_contact@example.com', name: 'Frank Liu', roles: ['CORPORATE_CONTACT'] }
    ];

    return testAccounts.filter(account => account.roles.includes(requiredRole));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* 登入卡片 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* 標題區域 */}
          <div className={`bg-gradient-to-r ${roleColor} px-6 py-8 text-center`}>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-white"
            >
              <h1 className="text-2xl font-bold mb-2" style={{color: 'white'}}>TLI Connect</h1>
              <p style={{color: 'white'}}>{roleDisplayName}專用登入</p>
            </motion.div>
          </div>

          {/* 表單區域 */}
          <div className="px-6 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email 輸入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  電子信箱
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SafeIcon icon={FiUser} size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    style={{ paddingLeft: '2.5rem', paddingRight: '0.75rem', height: '52px' }}
                    placeholder="請輸入電子信箱"
                    required
                  />
                </div>
              </div>

              {/* 密碼輸入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密碼
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SafeIcon icon={FiLock} size={20} className="text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    style={{ paddingLeft: '2.5rem', paddingRight: '3rem', height: '52px' }}
                    placeholder="請輸入密碼"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <SafeIcon 
                      icon={showPassword ? FiEyeOff : FiEye} 
                      size={20} 
                      className="text-gray-400 hover:text-gray-600 transition-colors" 
                    />
                  </button>
                </div>
              </div>

              {/* 錯誤訊息 */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* 登入按鈕 */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-gradient-to-r ${roleColor} text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]`}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <SafeIcon icon={FiLoader} className="animate-spin h-5 w-5 mr-2" />
                    登入中...
                  </div>
                ) : (
                  `登入${roleDisplayName}專區`
                )}
              </motion.button>
            </form>

            {/* 測試帳號 */}
            <div className="mt-8">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">測試帳號</p>
                <div className="space-y-2">
                  {getTestAccounts().map((account) => (
                    <button
                      key={account.email}
                      onClick={() => fillDemoAccount(account.email)}
                      className="block w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                    >
                      <div className="font-medium">{account.name}</div>
                      <div className="text-gray-500">{account.email}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">密碼：password</p>
              </div>
            </div>

            {/* 返回通用登入 */}
            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/login')}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                返回通用登入頁面
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleLogin;