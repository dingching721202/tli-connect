'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiUser, FiLock, FiEye, FiEyeOff, FiLoader, FiBookOpen, FiUsers, FiBriefcase, FiTrendingUp, FiSettings, FiShield } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import SafeIcon from './common/SafeIcon';
import { UserRole } from '@/types/user';

type LoginMode = 'selection' | 'student' | 'teacher' | 'corporate_contact' | 'agent' | 'staff' | 'admin';

const Login: React.FC = () => {
  const [loginMode, setLoginMode] = useState<LoginMode>('selection');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, login, setRoleLock, switchRole } = useAuth();
  const router = useRouter();
  

  // 角色配置
  const roleConfigs = [
    {
      id: 'student',
      title: '學員入口',
      subtitle: '學員登入',
      description: '查看課程、預約上課、管理會員卡',
      icon: FiBookOpen,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      accounts: [
        { email: 'alice@example.com', name: 'Alice Wang', status: '✅ 已啟用會員卡' },
        { email: 'user2@example.com', name: 'Bob Chen', status: '⏳ 待啟用會員卡' },
        { email: 'charlie@example.com', name: 'Charlie Lin', status: '✅ 已啟用會員卡' },
        { email: 'david@example.com', name: 'David Wilson', status: '🚫 無會員卡' }
      ]
    },
    {
      id: 'teacher',
      title: '教師入口',
      subtitle: '教師登入',
      description: '管理課程、查看學生預約、請假申請',
      icon: FiUsers,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      accounts: [
        { email: 'teacher@example.com', name: '王老師', status: '👨‍🏫 教師' }
      ]
    },
    {
      id: 'corporate_contact',
      title: '企業窗口',
      subtitle: '企業聯絡人',
      description: '管理企業會員、查看企業訂閱',
      icon: FiBriefcase,
      gradient: 'from-orange-500 to-red-600',
      bgGradient: 'from-orange-50 to-red-50',
      accounts: [
        { email: 'frank@taiwantech.com', name: 'Frank Liu', status: '🏢 企業窗口' }
      ]
    },
    {
      id: 'agent',
      title: '代理入口',
      subtitle: '代理商登入',
      description: '查看銷售業績、管理推廣客戶',
      icon: FiTrendingUp,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50',
      accounts: [
        { email: 'agent1@example.com', name: '張代理', status: '🎯 一般代理' },
        { email: 'consultant1@example.com', name: '王顧問', status: '💼 顧問代理' },
        { email: 'contact@innovation.com', name: '創新科技', status: '🏢 企業代理' }
      ]
    },
    {
      id: 'staff',
      title: '職員入口',
      subtitle: '職員登入',
      description: '課務管理、學員服務、系統維護',
      icon: FiSettings,
      gradient: 'from-purple-500 to-violet-600',
      bgGradient: 'from-purple-50 to-violet-50',
      accounts: [
        { email: 'olivia@example.com', name: 'Olivia Kao', status: '👩‍💼 職員' }
      ]
    },
    {
      id: 'admin',
      title: '管理員',
      subtitle: '系統管理',
      description: '用戶管理、系統設定、數據分析',
      icon: FiShield,
      gradient: 'from-red-500 to-pink-600',
      bgGradient: 'from-red-50 to-pink-50',
      accounts: [
        { email: 'admin@example.com', name: 'Admin User', status: '🔑 管理員' }
      ]
    }
  ];


  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let result;
      
      if (isRegisterMode) {
        // 註冊流程
        if (!name.trim() || !phone.trim()) {
          setError('請填寫完整資料');
          setIsLoading(false);
          return;
        }
        result = await register(email, password, name, phone);
      } else {
        // 登入流程
        result = await login(email, password);
      }
      
      if (result.success && result.user) {
        // 保存登入來源頁面
        if (loginMode !== 'selection') {
          localStorage.setItem('loginSource', `/${loginMode}/login`);
        } else {
          localStorage.setItem('loginSource', '/login');
        }
        
        // 登入成功後，根據選擇的角色導向正確的路徑
        if (loginMode !== 'selection') {
          // 從角色入口登入 - 設置角色鎖定並導向角色專區
          const rolePathMap = {
            'student': { role: 'STUDENT', path: '/student' },
            'teacher': { role: 'TEACHER', path: '/teacher' },
            'corporate_contact': { role: 'CORPORATE_CONTACT', path: '/corporate_contact' },
            'agent': { role: 'AGENT', path: '/agent' },
            'staff': { role: 'STAFF', path: '/staff' },
            'admin': { role: 'ADMIN', path: '/admin' }
          };
          
          const roleConfig = rolePathMap[loginMode as keyof typeof rolePathMap];
          if (roleConfig && result.user.roles.includes(roleConfig.role as UserRole)) {
            // 先切換到正確的角色，然後設置角色鎖定並導向角色專區
            switchRole(roleConfig.role);
            setRoleLock(roleConfig.role);
            // 直接跳轉，不需要延遲
            router.push(roleConfig.path);
          } else if (roleConfig) {
            // 沒有該角色權限
            setError(`您的帳號沒有${roleConfigs.find(r => r.id === loginMode)?.title}權限`);
            return;
          }
        }
      } else {
        // 處理錯誤碼
        let errorMessage = result.error || (isRegisterMode ? '註冊失敗' : '登入失敗');
        
        if (result.error === 'EMAIL_ALREADY_EXISTS') {
          errorMessage = '此 Email 已被註冊，請使用其他 Email 或直接登入';
        } else if (result.error === 'INVALID_CREDENTIALS') {
          errorMessage = '帳號或密碼錯誤，請重新輸入';
        }
        
        setError(errorMessage);
      }
    } catch {
      setError(isRegisterMode ? '註冊過程中發生錯誤，請稍後再試' : '登入過程中發生錯誤，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
  };


  const getCurrentRoleConfig = () => {
    return roleConfigs.find(config => config.id === loginMode);
  };

  // 角色選擇界面
  const renderRoleSelection = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl"
      >
        {/* 標題 */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            TLI Connect 登入系統
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600"
          >
            請選擇您的身份進行登入
          </motion.p>
        </div>

        {/* 角色選擇卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {roleConfigs.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                // 導向對應的角色登入頁面
                router.push(`/${role.id}/login`);
              }}
              className={`
                relative overflow-hidden rounded-2xl shadow-lg cursor-pointer
                bg-gradient-to-br ${role.bgGradient} border border-gray-200
                hover:shadow-xl transition-all duration-300
              `}
            >
              <div className="p-8">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${role.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                  <SafeIcon icon={role.icon} size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{role.description}</p>
                <div className="text-sm text-gray-500">
                  點擊進入 {role.subtitle}
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${role.gradient}`} />
            </motion.div>
          ))}
        </div>


        {/* 返回首頁 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            ← 返回首頁
          </button>
        </motion.div>
      </motion.div>
    </div>
  );

  // 登入表單界面
  const renderLoginForm = () => {
    const currentRole = getCurrentRoleConfig();
    
    return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* 返回按鈕 */}
        <div className="mb-6">
          <button
            onClick={() => setLoginMode('selection')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            ← 返回角色選擇
          </button>
        </div>

        {/* 登入卡片 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* 標題區域 */}
          <div className={`px-6 py-8 text-center bg-gradient-to-r ${currentRole?.gradient || 'from-blue-600 to-indigo-600'}`}>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <SafeIcon 
                  icon={currentRole?.icon || FiUser} 
                  size={32} 
                  className="text-white" 
                />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{color: 'white'}}>
                {isRegisterMode ? '建立新帳戶' : (currentRole?.title || '登入')}
              </h1>
              <p className="text-sm sm:text-base" style={{color: 'white'}}>
                {isRegisterMode 
                  ? '註冊您的 TLI Connect 帳戶' 
                  : (currentRole?.description || '登入您的帳戶')
                }
              </p>
            </motion.div>
          </div>

          {/* 錯誤訊息 */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </motion.div>
          )}

          {/* 登入/註冊表單 */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 註冊模式額外欄位 */}
              {isRegisterMode && (
                <>
                  {/* 姓名欄位 */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      姓名
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SafeIcon icon={FiUser} size={20} className="text-gray-400" />
                      </div>
                      <input
                        id="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="請輸入您的姓名"
                      />
                    </div>
                  </div>

                  {/* 電話欄位 */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      電話號碼
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SafeIcon icon={FiUser} size={20} className="text-gray-400" />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="請輸入電話號碼"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email 欄位 */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  電子郵件
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SafeIcon icon={FiUser} size={20} className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="請輸入電子郵件"
                  />
                </div>
              </div>

              {/* 密碼欄位 */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  密碼
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SafeIcon icon={FiLock} size={20} className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="請輸入密碼"
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

              {/* 登入/註冊按鈕 */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className={`
                  w-full flex justify-center items-center py-3 px-4 rounded-lg font-semibold text-white
                  transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                  ${isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                  }
                `}
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
              >
                {isLoading ? (
                  <>
                    <SafeIcon icon={FiLoader} size={20} className="animate-spin mr-2" />
                    {isRegisterMode ? '註冊中...' : '登入中...'}
                  </>
                ) : (
                  isRegisterMode ? '註冊' : '登入'
                )}
              </motion.button>

              {/* 模式切換 */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {isRegisterMode ? '已經有帳戶了？' : '還沒有帳戶？'}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="ml-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    {isRegisterMode ? '立即登入' : '立即註冊'}
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* 測試帳號 - 只在登入模式顯示 */}
        {!isRegisterMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
              {`${currentRole?.icon ? '' : '🎯'} ${currentRole?.title || '角色'} 測試帳號`}
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              點擊下方帳號即可快速填入登入資訊 (密碼：password)
            </p>
            
            {/* 角色專屬測試帳號 */}
            <div className="space-y-2">
              {(currentRole?.accounts || []).map((account, index) => (
                <motion.button
                  key={account.email}
                  onClick={() => fillDemoAccount(account.email)}
                  className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors text-left border border-gray-200 hover:border-blue-300"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{account.name}</span>
                      <span className="text-sm font-medium">{account.status}</span>
                    </div>
                    <div className="text-xs text-gray-500">{account.email}</div>
                    {'description' in account && (account as {description?: string}).description && (
                      <div className="text-xs text-gray-400 mt-1">{(account as {description?: string}).description}</div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

          </motion.div>
        )}

        {/* 返回首頁鏈接 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            ← 返回首頁
          </button>
        </motion.div>
      </motion.div>
    </div>
    );
  };

  // 主要渲染邏輯
  if (loginMode === 'selection') {
    return renderRoleSelection();
  }

  return renderLoginForm();
};

export default Login;