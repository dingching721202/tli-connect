'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { FiMenu, FiX, FiUser, FiLogOut, FiBook, FiUsers, FiSettings, FiBookOpen, FiUserPlus, FiShare2, FiBriefcase, FiClock, FiCalendar, FiUserCheck, FiPlay, FiChevronDown, FiVideo, FiActivity } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import SafeIcon from './common/SafeIcon';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVideoCoursesOpen, setIsVideoCoursesOpen] = useState(false);
  const [isOnlineGroupClassesOpen, setIsOnlineGroupClassesOpen] = useState(false);
  const [isEventsOpen, setIsEventsOpen] = useState(false);
  const [isRoleSelectorOpen, setIsRoleSelectorOpen] = useState(false);
  const roleSelectorRef = useRef<HTMLDivElement>(null);
  const { user, logout, isAuthenticated, currentRole, switchRole, availableRoles } = useAuth();

  // 點擊外部關閉角色選擇器
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
  const router = useRouter();
  const pathname = usePathname();

  const videoCourseCategories = [
    { name: '中文', href: '/video-courses/chinese' },
    { name: '外文', href: '/video-courses/foreign-language' },
    { name: '文化', href: '/video-courses/culture' },
    { name: '商業', href: '/video-courses/business' },
    { name: '師培', href: '/video-courses/teacher-training' },
  ];

  const onlineGroupClassCategories = [
    { name: '中文', href: '/online-group-classes/chinese' },
    { name: '外文', href: '/online-group-classes/foreign-language' },
    { name: '文化', href: '/online-group-classes/culture' },
    { name: '商業', href: '/online-group-classes/business' },
    { name: '師培', href: '/online-group-classes/teacher-training' },
  ];

  const eventCategories = [
    { name: '中文', href: '/events/chinese' },
    { name: '外文', href: '/events/foreign-language' },
    { name: '文化', href: '/events/culture' },
    { name: '商業', href: '/events/business' },
    { name: '師培', href: '/events/teacher-training' },
  ];

  const navigationItems = [
    { name: '儀表板', href: '/dashboard', icon: FiUser, roles: ['STUDENT', 'TEACHER', 'CORPORATE_CONTACT', 'AGENT', 'OPS', 'ADMIN'] },
    { name: '課程預約', href: '/booking', icon: FiBook, roles: ['STUDENT'] },
    { name: '會員管理', href: '/member-management', icon: FiUsers, roles: ['OPS', 'ADMIN'] },
    { name: '教師管理', href: '/teacher-management', icon: FiUserCheck, roles: ['OPS', 'ADMIN'] },
    { name: '請假管理', href: '/leave-management', icon: FiClock, roles: ['OPS', 'ADMIN'] },
    { name: '會員方案', href: '/membership', icon: FiShare2, roles: ['guest', 'STUDENT'] },
    { name: '我的預約', href: '/my-bookings', icon: FiCalendar, roles: ['STUDENT', 'TEACHER'] },
    { name: '課程管理', href: '/course-management', icon: FiBookOpen, roles: ['OPS', 'ADMIN'] },
    { name: '會員卡方案管理', href: '/member-card-plan-management', icon: FiSettings, roles: ['OPS', 'ADMIN'] },
    { name: '諮詢管理', href: '/consultation-management', icon: FiBriefcase, roles: ['OPS', 'ADMIN'] },
    { name: '代理管理', href: '/agent-management', icon: FiUserPlus, roles: ['OPS', 'ADMIN'] },
    { name: '帳號管理', href: '/account-management', icon: FiUsers, roles: ['ADMIN'] },
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
    
    // 檢查當前角色
    if (currentRole && roles.includes(currentRole)) return true;
    
    // 檢查所有角色
    if (user.roles && user.roles.some(role => roles.includes(role))) return true;
    
    return false;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center h-12 xl:h-14">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-shrink-0 cursor-pointer"
            onClick={() => handleNavigation('/')}
          >
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              TLI Connect
            </h1>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-1 justify-start px-6">
            <div className="flex items-center space-x-1 xl:space-x-2">
              {/* Video Courses Dropdown - Only for STUDENT */}
              {canAccess(['STUDENT']) && (
                <div className="relative"
                  onMouseEnter={() => setIsVideoCoursesOpen(true)}
                  onMouseLeave={() => setIsVideoCoursesOpen(false)}
                >
                  <motion.button
                    className={`
                      flex items-center space-x-1 px-1.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap
                      ${pathname.startsWith('/video-courses')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title="影音課程"
                  >
                    <SafeIcon icon={FiPlay} size={12} />
                    <span className="hidden xl:inline text-xs">影音課程</span>
                    <span className="xl:hidden text-[10px]">影音</span>
                    <SafeIcon icon={FiChevronDown} size={10} className={`transition-transform duration-200 ${isVideoCoursesOpen ? 'rotate-180' : ''}`} />
                  </motion.button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isVideoCoursesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                      >
                        <motion.button
                          onClick={() => handleNavigation('/video-courses')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                        >
                          所有課程
                        </motion.button>
                        <div className="border-t border-gray-100 my-1"></div>
                        {videoCourseCategories.map((category) => (
                          <motion.button
                            key={category.name}
                            onClick={() => handleNavigation(category.href)}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              isActive(category.href)
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                            whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                          >
                            {category.name}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Online Group Classes Dropdown - Only for STUDENT */}
              {canAccess(['STUDENT']) && (
                <div className="relative"
                  onMouseEnter={() => setIsOnlineGroupClassesOpen(true)}
                  onMouseLeave={() => setIsOnlineGroupClassesOpen(false)}
                >
                  <motion.button
                    className={`
                      flex items-center space-x-1 px-1.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap
                      ${pathname.startsWith('/online-group-classes')
                        ? 'text-green-600 bg-green-50'
                        : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title="線上團課"
                  >
                    <SafeIcon icon={FiVideo} size={12} />
                    <span className="hidden xl:inline text-xs">線上團課</span>
                    <span className="xl:hidden text-[10px]">團課</span>
                    <SafeIcon icon={FiChevronDown} size={10} className={`transition-transform duration-200 ${isOnlineGroupClassesOpen ? 'rotate-180' : ''}`} />
                  </motion.button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isOnlineGroupClassesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                      >
                        <motion.button
                          onClick={() => handleNavigation('/online-group-classes')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                          whileHover={{ backgroundColor: 'rgba(34, 197, 94, 0.05)' }}
                        >
                          所有課程
                        </motion.button>
                        <div className="border-t border-gray-100 my-1"></div>
                        {onlineGroupClassCategories.map((category) => (
                          <motion.button
                            key={category.name}
                            onClick={() => handleNavigation(category.href)}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              isActive(category.href)
                                ? 'bg-green-50 text-green-600'
                                : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
                            }`}
                            whileHover={{ backgroundColor: 'rgba(34, 197, 94, 0.05)' }}
                          >
                            {category.name}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Events Dropdown - Only for STUDENT */}
              {canAccess(['STUDENT']) && (
                <div className="relative"
                  onMouseEnter={() => setIsEventsOpen(true)}
                  onMouseLeave={() => setIsEventsOpen(false)}
                >
                  <motion.button
                    className={`
                      flex items-center space-x-1 px-1.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap
                      ${pathname.startsWith('/events')
                        ? 'text-orange-600 bg-orange-50'
                        : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title="活動"
                  >
                    <SafeIcon icon={FiActivity} size={12} />
                    <span className="hidden xl:inline text-xs">活動</span>
                    <span className="xl:hidden text-[10px]">活動</span>
                    <SafeIcon icon={FiChevronDown} size={10} className={`transition-transform duration-200 ${isEventsOpen ? 'rotate-180' : ''}`} />
                  </motion.button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isEventsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                      >
                        <motion.button
                          onClick={() => handleNavigation('/events')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          whileHover={{ backgroundColor: 'rgba(251, 146, 60, 0.05)' }}
                        >
                          所有活動
                        </motion.button>
                        <div className="border-t border-gray-100 my-1"></div>
                        {eventCategories.map((category) => (
                          <motion.button
                            key={category.name}
                            onClick={() => handleNavigation(category.href)}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              isActive(category.href)
                                ? 'bg-orange-50 text-orange-600'
                                : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                            }`}
                            whileHover={{ backgroundColor: 'rgba(251, 146, 60, 0.05)' }}
                          >
                            {category.name}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {navigationItems.filter(item => canAccess(item.roles)).map((item) => (
                <motion.button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`
                    flex items-center space-x-1 px-1.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap
                    ${isActive(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title={item.name}
                >
                  <SafeIcon icon={item.icon} size={12} />
                  <span className="hidden xl:inline text-xs">{item.name}</span>
                  <span className="xl:hidden text-[10px]">{item.name.slice(0, 2)}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden lg:block">
            {isAuthenticated ? (
              <div className="flex items-center space-x-1">
                {/* 推薦系統按鈕 - 小巧設計 */}
                <motion.button
                  onClick={() => handleNavigation('/referral')}
                  className={`flex-shrink-0 flex items-center justify-center w-7 h-7 xl:w-auto xl:h-auto xl:px-1.5 xl:py-1 xl:space-x-1 text-xs font-medium rounded transition-colors ${
                    isActive('/referral')
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title="推薦系統"
                >
                  <SafeIcon icon={FiShare2} size={12} />
                  <span className="hidden xl:inline text-xs">推薦</span>
                </motion.button>
                
                {/* 用戶頭像和信息 - 小巧設計 */}
                <motion.div 
                  className="flex-shrink-0 flex items-center cursor-pointer hover:bg-gray-50 rounded p-0.5 xl:p-1 transition-colors"
                  onClick={() => handleNavigation('/profile')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title="查看個人資料"
                >
                  <Image
                    className="h-6 w-6 xl:h-7 xl:w-7 rounded-full object-cover flex-shrink-0"
                    src={user?.avatar || 'https://www.gravatar.com/avatar/?d=mp&s=28'}
                    alt={user?.name || 'User'}
                    width={28}
                    height={28}
                  />
                  <div className="hidden xl:block text-xs ml-1.5 min-w-0">
                    <div className="font-medium text-gray-900 truncate w-14 text-[11px]">{user?.name}</div>
                    <div className="text-gray-500 capitalize text-[9px] w-14 truncate">{currentRole}</div>
                  </div>
                </motion.div>
                
                {/* 角色選擇器 - 小巧設計 */}
                <div className="relative flex-shrink-0" ref={roleSelectorRef}>
                  <motion.button
                    onClick={() => {
                      if (availableRoles.length > 1) {
                        setIsRoleSelectorOpen(!isRoleSelectorOpen);
                      }
                    }}
                    className={`flex items-center justify-center w-6 h-6 xl:w-7 xl:h-7 text-xs font-medium transition-colors rounded ${
                      availableRoles.length > 1 
                        ? 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer' 
                        : 'text-gray-300 cursor-default'
                    }`}
                    whileHover={availableRoles.length > 1 ? { scale: 1.1 } : {}}
                    whileTap={availableRoles.length > 1 ? { scale: 0.95 } : {}}
                    title={availableRoles.length > 1 ? "切換角色" : "當前角色"}
                  >
                    <SafeIcon 
                      icon={FiChevronDown} 
                      size={10} 
                      className={`transition-transform duration-200 ${isRoleSelectorOpen ? 'rotate-180' : ''} ${
                        availableRoles.length > 1 ? '' : 'opacity-30'
                      }`}
                    />
                  </motion.button>
                  
                  <AnimatePresence>
                    {isRoleSelectorOpen && availableRoles.length > 1 && (
                      <motion.div
                        initial={{ opacity: 0, scaleY: 0.8, y: -5 }}
                        animate={{ opacity: 1, scaleY: 1, y: 0 }}
                        exit={{ opacity: 0, scaleY: 0.8, y: -5 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 top-full mt-1 w-24 xl:w-28 bg-white rounded-md shadow-md ring-1 ring-black ring-opacity-5 z-50 origin-top"
                      >
                        <div className="py-1">
                          {availableRoles.map((role) => (
                            <motion.button
                              key={role}
                              onClick={() => {
                                switchRole(role);
                                setIsRoleSelectorOpen(false);
                              }}
                              className={`block w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 transition-colors truncate ${
                                currentRole === role 
                                  ? 'bg-blue-50 text-blue-600 font-medium' 
                                  : 'text-gray-700'
                              }`}
                              whileHover={{ backgroundColor: "rgb(249 250 251)" }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <span className="truncate">{role}</span>
                              {currentRole === role && (
                                <span className="ml-1 text-blue-500 text-[10px]">●</span>
                              )}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* 登出按鈕 - 小巧設計 */}
                <motion.button
                  onClick={handleLogout}
                  className="flex-shrink-0 flex items-center justify-center w-7 h-7 xl:w-auto xl:h-auto xl:px-1.5 xl:py-1 xl:space-x-1 text-xs font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title="登出"
                >
                  <SafeIcon icon={FiLogOut} size={12} />
                  <span className="hidden xl:inline text-xs">登出</span>
                </motion.button>
              </div>
            ) : (
              <motion.button
                onClick={() => handleNavigation('/login')}
                className="bg-blue-600 text-white px-2.5 py-1 xl:px-3 xl:py-1.5 rounded hover:bg-blue-700 transition-colors text-xs font-medium flex items-center space-x-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SafeIcon icon={FiUser} size={12} />
                <span className="hidden xl:inline text-xs">登入</span>
              </motion.button>
            )}
          </div>

          {/* Mobile menu button - 小巧設計 */}
          <div className="lg:hidden">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <SafeIcon icon={isMenuOpen ? FiX : FiMenu} size={20} />
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
              {/* Mobile Video Courses - Only for STUDENT */}
              {canAccess(['STUDENT']) && (
                <div className="space-y-1">
                  <motion.button
                    onClick={() => handleNavigation('/video-courses')}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors
                      ${pathname.startsWith('/video-courses')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <SafeIcon icon={FiPlay} size={18} />
                    <span>影音課程</span>
                  </motion.button>
                  
                  {/* Mobile Video Course Categories */}
                  <div className="pl-6 space-y-1">
                    {videoCourseCategories.map((category) => (
                      <motion.button
                        key={category.name}
                        onClick={() => handleNavigation(category.href)}
                        className={`
                          w-full flex items-center space-x-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                          ${isActive(category.href)
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                          }
                        `}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>{category.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Online Group Classes - Only for STUDENT */}
              {canAccess(['STUDENT']) && (
                <div className="space-y-1">
                  <motion.button
                    onClick={() => handleNavigation('/online-group-classes')}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors
                      ${pathname.startsWith('/online-group-classes')
                        ? 'text-green-600 bg-green-50'
                        : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <SafeIcon icon={FiVideo} size={18} />
                    <span>線上團課</span>
                  </motion.button>
                  
                  {/* Mobile Online Group Class Categories */}
                  <div className="pl-6 space-y-1">
                    {onlineGroupClassCategories.map((category) => (
                      <motion.button
                        key={category.name}
                        onClick={() => handleNavigation(category.href)}
                        className={`
                          w-full flex items-center space-x-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                          ${isActive(category.href)
                            ? 'text-green-600 bg-green-50'
                            : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
                          }
                        `}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>{category.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Events - Only for STUDENT */}
              {canAccess(['STUDENT']) && (
                <div className="space-y-1">
                  <motion.button
                    onClick={() => handleNavigation('/events')}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors
                      ${pathname.startsWith('/events')
                        ? 'text-orange-600 bg-orange-50'
                        : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <SafeIcon icon={FiActivity} size={18} />
                    <span>活動</span>
                  </motion.button>
                  
                  {/* Mobile Event Categories */}
                  <div className="pl-6 space-y-1">
                    {eventCategories.map((category) => (
                      <motion.button
                        key={category.name}
                        onClick={() => handleNavigation(category.href)}
                        className={`
                          w-full flex items-center space-x-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                          ${isActive(category.href)
                            ? 'text-orange-600 bg-orange-50'
                            : 'text-gray-600 hover:text-orange-600 hover:bg-gray-50'
                          }
                        `}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>{category.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {navigationItems.filter(item => canAccess(item.roles)).map((item) => (
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
                        className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                        src={user?.avatar || 'https://www.gravatar.com/avatar/?d=mp&s=40'}
                        alt={user?.name || 'User'}
                        width={40}
                        height={40}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 truncate">{user?.name}</div>
                        <div className="text-sm text-gray-500 capitalize truncate w-20">{currentRole}</div>
                      </div>
                    </motion.div>
                    
                    {/* 手機版角色選擇器 - 固定佈局 */}
                    <div className="space-y-2 px-3">
                      <div className="text-sm font-medium text-gray-700 h-5 flex items-center">
                        {availableRoles.length > 1 ? '切換視角：' : '當前角色：'}
                      </div>
                      <div className="grid grid-cols-2 gap-2 min-h-[2.5rem]">
                        {availableRoles.map((role) => (
                          <motion.button
                            key={role}
                            onClick={() => {
                              if (availableRoles.length > 1) {
                                switchRole(role);
                              }
                            }}
                            className={`px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-center h-10 ${
                              currentRole === role 
                                ? 'bg-blue-600 text-white font-medium' 
                                : availableRoles.length > 1
                                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'
                                  : 'bg-gray-100 text-gray-400 cursor-default'
                            }`}
                            whileHover={availableRoles.length > 1 ? { scale: 1.02 } : {}}
                            whileTap={availableRoles.length > 1 ? { scale: 0.98 } : {}}
                          >
                            <span className="truncate">{role}</span>
                          </motion.button>
                        ))}
                        {/* 如果只有一個角色，填充第二個位置以保持佈局 */}
                        {availableRoles.length === 1 && (
                          <div className="bg-gray-50 rounded-md h-10 opacity-30"></div>
                        )}
                      </div>
                    </div>
                    
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