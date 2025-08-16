'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { FiMenu, FiX, FiUser, FiLogOut, FiBook, FiUsers, FiSettings, FiBookOpen, FiUserPlus, FiShare2, FiBriefcase, FiClock, FiCalendar, FiUserCheck } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import SafeIcon from './common/SafeIcon';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRoleSelectorOpen, setIsRoleSelectorOpen] = useState(false);
  const roleSelectorRef = useRef<HTMLDivElement>(null);
  const { user, logout, isAuthenticated, currentRole, switchRole, availableRoles, isRoleLocked } = useAuth();

  const router = useRouter();
  const pathname = usePathname();

  // 處理角色切換和路由跳轉
  const handleRoleSwitch = (role: string) => {
    if (!availableRoles.includes(role) || isRoleLocked) return;
    
    switchRole(role);
    
    const rolePathMap: Record<string, string> = {
      'STUDENT': '/student',
      'TEACHER': '/teacher',
      'CORPORATE_CONTACT': '/corporate_contact',
      'AGENT': '/agent',
      'STAFF': '/staff',
      'ADMIN': '/admin'
    };
    
    const targetPath = rolePathMap[role];
    if (targetPath) {
      router.push(targetPath);
    }
  };

  // 根據角色動態生成路徑
  const getRolePath = (basePath: string) => {
    if (!currentRole) return basePath;
    const rolePathMap: Record<string, string> = {
      'STUDENT': '/student',
      'TEACHER': '/teacher', 
      'CORPORATE_CONTACT': '/corporate_contact',
      'AGENT': '/agent',
      'STAFF': '/staff',
      'ADMIN': '/admin'
    };
    return `${rolePathMap[currentRole]}${basePath}`;
  };

  // 左側導航項目 - 功能相關
  const leftNavigationItems = [
    { name: '儀表板', href: getRolePath(''), icon: FiUser, roles: ['STUDENT', 'TEACHER', 'CORPORATE_CONTACT', 'AGENT', 'STAFF', 'ADMIN'] },
    { name: '課程預約', href: getRolePath('/booking'), icon: FiBook, roles: ['STUDENT'] },
    { name: '會員管理', href: getRolePath('/member-management'), icon: FiUsers, roles: ['STAFF', 'ADMIN'] },
    { name: '教師管理', href: getRolePath('/teacher-management'), icon: FiUserCheck, roles: ['STAFF', 'ADMIN'] },
    { name: '請假管理', href: getRolePath('/leave-management'), icon: FiClock, roles: ['STAFF', 'ADMIN'] },
    { name: '會員方案', href: '/membership', icon: FiShare2, roles: ['guest'] },
    { name: '我的預約', href: getRolePath('/my-bookings'), icon: FiCalendar, roles: ['STUDENT', 'TEACHER'] },
    { name: '課程管理', href: getRolePath('/course-management'), icon: FiBookOpen, roles: ['STAFF', 'ADMIN'] },
    { name: '會員卡方案管理', href: getRolePath('/member-card-plan-management'), icon: FiSettings, roles: ['STAFF', 'ADMIN'] },
    { name: '諮詢管理', href: getRolePath('/consultation-management'), icon: FiBriefcase, roles: ['STAFF', 'ADMIN'] },
    { name: '代理管理', href: getRolePath('/agent-management'), icon: FiUserPlus, roles: ['STAFF', 'ADMIN'] },
    { name: '帳號管理', href: getRolePath('/account-management'), icon: FiUsers, roles: ['ADMIN'] },
    { name: '企業管理', href: getRolePath('/corporate-management'), icon: FiBriefcase, roles: ['CORPORATE_CONTACT'] },
    { name: '系統設定', href: getRolePath('/system-settings'), icon: FiSettings, roles: ['STAFF', 'ADMIN'] },
  ];

  // 右側導航項目 - 推薦及用戶相關
  const rightNavigationItems = [
    { name: '推薦', href: getRolePath('/referral'), icon: FiShare2, roles: ['STUDENT', 'TEACHER', 'CORPORATE_CONTACT', 'AGENT', 'STAFF', 'ADMIN'] },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const isActive = (href: string) => pathname === href;

  const canAccess = (allowedRoles: string[]) => {
    if (!isAuthenticated) {
      return allowedRoles.includes('guest');
    }
    // 如果有設置當前角色，只檢查當前角色
    if (currentRole) {
      return allowedRoles.includes(currentRole);
    }
    // 如果沒有設置當前角色，檢查用戶的所有角色
    return allowedRoles.some(role => user?.roles.includes(role as 'STUDENT' | 'TEACHER' | 'CORPORATE_CONTACT' | 'AGENT' | 'STAFF' | 'ADMIN'));
  };

  // Click outside handler for role selector
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleSelectorRef.current && !roleSelectorRef.current.contains(event.target as Node)) {
        setIsRoleSelectorOpen(false);
      }
    };

    if (isRoleSelectorOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRoleSelectorOpen]);

  const getUserDisplayName = () => {
    if (!user) return '';
    const maxLength = 10;
    return user.name.length > maxLength ? `${user.name.substring(0, maxLength)}...` : user.name;
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      'STUDENT': '學員',
      'TEACHER': '教師',
      'STAFF': '職員',
      'ADMIN': '管理員',
      'AGENT': '代理',
      'CORPORATE_CONTACT': '企業窗口'
    };
    return roleNames[role] || role;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="w-full pl-2 pr-2 sm:pl-4 sm:pr-4 lg:pl-4 lg:pr-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Image
              className="h-6 w-auto cursor-pointer"
              src="https://drive.google.com/thumbnail?id=1-eMGYDEmR20U0q9CurC0Z49jW6aTUcgO&sz=w400"
              alt="TLI Connect"
              width={90}
              height={24}
              onClick={() => router.push('/')}
              priority
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1 flex-1 justify-between">
            {/* Left Navigation Items */}
            <div className="flex items-center space-x-1">
              {leftNavigationItems.filter(item => canAccess(item.roles)).map((item) => (
                <motion.button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`
                    flex items-center space-x-1 px-2 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap
                    ${isActive(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title={item.name}
                >
                  <SafeIcon icon={item.icon} size={14} />
                  <span className="text-sm">{item.name}</span>
                </motion.button>
              ))}
            </div>
            
            {/* Right Navigation Items */}
            <div className="flex items-center space-x-1">
              {rightNavigationItems.filter(item => canAccess(item.roles)).map((item) => (
                <motion.button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`
                    flex items-center space-x-1 px-2 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap
                    ${isActive(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title={item.name}
                >
                  <SafeIcon icon={item.icon} size={14} />
                  <span className="text-sm">{item.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right Side Menu */}
          <div className="flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                
                {/* User Profile */}
                <motion.div 
                  className="flex-shrink-0 flex items-center cursor-pointer hover:bg-gray-50 rounded px-3 py-2 transition-colors"
                  onClick={() => handleNavigation(getRolePath('/profile'))}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={`查看個人資料 - ${user?.name || 'User'} (${currentRole})`}
                >
                  <Image
                    className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                    src={user?.avatar || 'https://www.gravatar.com/avatar/?d=mp&s=32'}
                    alt={user?.name || 'User Avatar'}
                    width={32}
                    height={32}
                  />
                  <div className="ml-2 hidden sm:block">
                    <div className="text-sm font-medium text-gray-900">{getUserDisplayName()}</div>
                    {currentRole && (
                      <div className="text-xs text-gray-500">{getRoleDisplayName(currentRole)}</div>
                    )}
                  </div>
                </motion.div>

                {/* Role Selector */}
                {availableRoles.length > 1 && !isRoleLocked && (
                  <div className="relative" ref={roleSelectorRef}>
                    <motion.button
                      onClick={() => setIsRoleSelectorOpen(!isRoleSelectorOpen)}
                      className="flex items-center text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-50 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="切換角色"
                    >
                      <SafeIcon icon={FiUser} size={16} />
                    </motion.button>

                    {isRoleSelectorOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50"
                      >
                        <div className="py-1">
                          {availableRoles.map((role) => (
                            <button
                              key={role}
                              onClick={() => {
                                handleRoleSwitch(role);
                                setIsRoleSelectorOpen(false);
                              }}
                              className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                                role === currentRole
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {getRoleDisplayName(role)}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Logout Button */}
                <motion.button
                  onClick={handleLogout}
                  className="flex items-center text-sm text-gray-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="登出"
                >
                  <SafeIcon icon={FiLogOut} size={16} />
                </motion.button>
              </>
            ) : (
              /* Login Button for guests */
              <motion.button
                onClick={() => handleNavigation('/login')}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SafeIcon icon={FiUser} size={16} />
                <span>登入</span>
              </motion.button>
            )}

            {/* Mobile menu button */}
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SafeIcon icon={isMenuOpen ? FiX : FiMenu} size={24} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden border-t border-gray-200 bg-white"
        >
          <div className="px-4 py-3 space-y-1">
            {/* Mobile Navigation Items */}
            {leftNavigationItems.filter(item => canAccess(item.roles)).map((item) => (
              <motion.button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SafeIcon icon={item.icon} size={18} />
                <span>{item.name}</span>
              </motion.button>
            ))}
            
            {/* Mobile Right Navigation Items */}
            {rightNavigationItems.filter(item => canAccess(item.roles)).map((item) => (
              <motion.button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SafeIcon icon={item.icon} size={18} />
                <span>{item.name}</span>
              </motion.button>
            ))}

            {/* Mobile User Section */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              {isAuthenticated ? (
                <div className="space-y-3">
                  
                  <motion.div 
                    className="flex items-center space-x-3 px-3 py-2 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => handleNavigation(getRolePath('/profile'))}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title="查看個人資料"
                  >
                    <Image
                      className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                      src={user?.avatar || 'https://www.gravatar.com/avatar/?d=mp&s=40'}
                      alt={user?.name || 'User'}
                      width={40}
                      height={40}
                    />
                    <div>
                      <div className="text-base font-medium text-gray-900">{user?.name || 'User'}</div>
                      {currentRole && (
                        <div className="text-sm text-gray-500">{getRoleDisplayName(currentRole)}</div>
                      )}
                    </div>
                  </motion.div>

                  {/* Mobile Role Selector */}
                  {availableRoles.length > 1 && !isRoleLocked && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900 px-3">切換角色</div>
                      {availableRoles.map((role) => (
                        <button
                          key={role}
                          onClick={() => {
                            handleRoleSwitch(role);
                            setIsMenuOpen(false);
                          }}
                          className={`w-full text-left px-6 py-2 text-sm transition-colors ${
                            role === currentRole
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {getRoleDisplayName(role)}
                        </button>
                      ))}
                    </div>
                  )}

                  <motion.button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <SafeIcon icon={FiLogOut} size={18} />
                    <span>登出</span>
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  onClick={() => handleNavigation('/login')}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-base font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SafeIcon icon={FiUser} size={18} />
                  <span>登入</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navigation;