'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { FiMenu, FiX, FiUser, FiLogOut, FiBook, FiUsers, FiSettings, FiBookOpen, FiUserPlus, FiShare2, FiBriefcase, FiClock, FiCalendar, FiUserCheck } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import SafeIcon from './common/SafeIcon';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems = [
    { name: '儀表板', href: '/dashboard', icon: FiUser, roles: ['STUDENT', 'TEACHER', 'OPS', 'CORPORATE_CONTACT', 'ADMIN'] },
    { name: '會員管理', href: '/member-management', icon: FiUsers, roles: ['OPS', 'ADMIN'] },
    { name: '教師管理', href: '/teacher-management', icon: FiUserCheck, roles: ['OPS', 'ADMIN'] },
    { name: '請假管理', href: '/leave-management', icon: FiClock, roles: ['OPS', 'ADMIN'] },
    { name: '課程預約', href: '/', icon: FiBook, roles: ['guest', 'STUDENT'] },
    { name: '會員方案', href: '/membership', icon: FiShare2, roles: ['guest', 'STUDENT'] },
    { name: '我的預約', href: '/my-bookings', icon: FiCalendar, roles: ['STUDENT', 'TEACHER'] },
    { name: '課程管理', href: '/course-management', icon: FiBookOpen, roles: ['OPS', 'ADMIN'] },
    { name: '會員卡方案管理', href: '/member-card-plan-management', icon: FiSettings, roles: ['OPS', 'ADMIN'] },
    { name: '企業詢價管理', href: '/corporate-inquiries', icon: FiBriefcase, roles: ['OPS', 'ADMIN'] },
    { name: '代理管理', href: '/agent-management', icon: FiUserPlus, roles: ['OPS', 'ADMIN'] },
    { name: '企業管理', href: '/corporate-management', icon: FiBriefcase, roles: ['CORPORATE_CONTACT'] },
    { name: '系統設定', href: '/system-settings', icon: FiSettings, roles: ['OPS', 'ADMIN'] },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    router.push('/');
  };

  const isActive = (href: string) => pathname === href;

  const canAccess = (roles: string[]) => {
    if (roles.includes('all')) return true;
    if (!user) return roles.includes('guest');
    return roles.includes(user.role);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 xl:h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-shrink-0 cursor-pointer"
            onClick={() => handleNavigation('/')}
          >
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              TLI Connect
            </h1>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-1 xl:space-x-2">
              {navigationItems.map((item) => (
                canAccess(item.roles) && (
                  <motion.button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={`
                      flex items-center space-x-1 px-2 py-1.5 rounded-md text-xs xl:text-sm font-medium transition-colors whitespace-nowrap
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
                    <span className="hidden xl:inline">{item.name}</span>
                    <span className="xl:hidden text-[10px]">{item.name.slice(0, 2)}</span>
                  </motion.button>
                )
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden lg:block">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                {/* Referral System Button */}
                <motion.button
                  onClick={() => handleNavigation('/referral')}
                  className={`flex items-center space-x-1 px-2 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors ${
                    isActive('/referral')
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title="推薦系統"
                >
                  <SafeIcon icon={FiShare2} size={14} />
                  <span className="hidden xl:inline">推薦</span>
                </motion.button>
                
                <motion.div 
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded-lg p-1.5 transition-colors"
                  onClick={() => handleNavigation('/profile')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title="查看個人資料"
                >
                  <Image
                    className="h-7 w-7 xl:h-8 xl:w-8 rounded-full object-cover"
                    src={user?.avatar || 'https://www.gravatar.com/avatar/?d=mp&s=32'}
                    alt={user?.name || 'User'}
                    width={32}
                    height={32}
                  />
                  <div className="hidden xl:block text-xs">
                    <div className="font-medium text-gray-900 truncate max-w-20">{user?.name}</div>
                    <div className="text-gray-500 capitalize text-[10px]">{user?.role}</div>
                  </div>
                </motion.div>
                <motion.button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-2 py-1.5 text-xs xl:text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title="登出"
                >
                  <SafeIcon icon={FiLogOut} size={14} />
                  <span className="hidden xl:inline">登出</span>
                </motion.button>
              </div>
            ) : (
              <motion.button
                onClick={() => handleNavigation('/login')}
                className="bg-blue-600 text-white px-3 py-1.5 xl:px-4 xl:py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs xl:text-sm font-medium flex items-center space-x-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SafeIcon icon={FiUser} size={14} />
                <span className="hidden xl:inline">登入</span>
              </motion.button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <SafeIcon icon={isMenuOpen ? FiX : FiMenu} size={24} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                canAccess(item.roles) && (
                  <motion.button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors
                      ${isActive(item.href)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <SafeIcon icon={item.icon} size={18} />
                    <span>{item.name}</span>
                  </motion.button>
                )
              ))}

              {/* Mobile User Section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    {/* Mobile Referral Button */}
                    <motion.button
                      onClick={() => handleNavigation('/referral')}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-base font-medium rounded-md transition-colors ${
                        isActive('/referral')
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <SafeIcon icon={FiShare2} size={18} />
                      <span>推薦系統</span>
                    </motion.button>
                    
                    <motion.div 
                      className="flex items-center space-x-3 px-3 py-2 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => handleNavigation('/profile')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      title="查看個人資料"
                    >
                      <Image
                        className="h-10 w-10 rounded-full object-cover"
                        src={user?.avatar || 'https://www.gravatar.com/avatar/?d=mp&s=40'}
                        alt={user?.name || 'User'}
                        width={40}
                        height={40}
                      />
                      <div>
                        <div className="font-medium text-gray-900">{user?.name}</div>
                        <div className="text-sm text-gray-500 capitalize">{user?.role}</div>
                      </div>
                    </motion.div>
                    <motion.button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-base font-medium"
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
      </AnimatePresence>

    </nav>
  );
};

export default Navigation;