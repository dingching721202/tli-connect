'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiUser, FiLock, FiEye, FiEyeOff, FiLoader } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import SafeIcon from './common/SafeIcon';

const Login: React.FC = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, login } = useAuth();
  const router = useRouter();

  // 示範帳號 - 對應新的四個角色
  const demoAccounts = [
    { email: 'alice@example.com', name: 'Alice Wang', role: '學生 (STUDENT)' },
    { email: 'daisy@example.com', name: 'Daisy Hsu', role: '教師 (TEACHER)' },
    { email: 'frank@taiwantech.com', name: 'Frank Liu', role: '企業窗口 (CORPORATE_CONTACT)' },
    { email: 'olivia@example.com', name: 'Olivia Kao', role: '營運 (OPS)' },
    { email: 'admin@example.com', name: 'Admin User', role: '管理員 (ADMIN)' }
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
        // 根據用戶角色決定跳轉頁面
        if (result.user.role === 'OPS') {
          router.push('/dashboard');
        } else if (result.user.role === 'TEACHER') {
          router.push('/dashboard');
        } else {
          router.push('/dashboard'); // 學生跳轉到 dashboard
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* 登入卡片 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* 標題區域 */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiUser} size={32} className="text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {isRegisterMode ? '建立新帳戶' : '歡迎回來'}
              </h1>
              <p className="text-blue-100 text-sm sm:text-base">
                {isRegisterMode ? '註冊您的 TLI Connect 帳戶' : '登入您的 TLI Connect 帳戶'}
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

        {/* 示範帳號 - 只在登入模式顯示 */}
        {!isRegisterMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              快速測試帳號
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              點擊下方帳號即可快速填入登入資訊 (密碼：password)
            </p>
            <div className="grid gap-3">
              {demoAccounts.map((account, index) => (
                <motion.button
                  key={account.email}
                  onClick={() => fillDemoAccount(account.email)}
                  className="flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors text-left border border-gray-200 hover:border-blue-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div>
                    <div className="font-medium text-gray-900">{account.name}</div>
                    <div className="text-sm text-gray-500">{account.email}</div>
                  </div>
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${account.role === '管理員' 
                      ? 'bg-purple-100 text-purple-800' 
                      : account.role === '教師'
                      ? 'bg-green-100 text-green-800'
                      : account.role === '企業用戶'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
                    }
                  `}>
                    {account.role}
                  </span>
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

export default Login;