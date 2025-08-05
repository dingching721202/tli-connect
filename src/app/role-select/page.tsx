'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiUser, FiUsers, FiShield, FiBriefcase, FiUserCheck, FiShare2 } from 'react-icons/fi';

const RoleSelectPage = () => {
  const router = useRouter();

  const roles = [
    {
      id: 'STUDENT',
      name: '學生',
      description: '學習課程、預約課程、查看進度',
      icon: FiUser,
      color: 'from-blue-600 to-indigo-600',
      path: '/student/login'
    },
    {
      id: 'TEACHER',
      name: '教師',
      description: '管理教學、查看學生預約',
      icon: FiUserCheck,
      color: 'from-green-600 to-emerald-600',
      path: '/teacher/login'
    },
    {
      id: 'OPS',
      name: '營運人員',
      description: '管理會員、教師、課程等營運事務',
      icon: FiUsers,
      color: 'from-purple-600 to-violet-600',
      path: '/ops/login'
    },
    {
      id: 'ADMIN',
      name: '系統管理員',
      description: '完整系統管理權限',
      icon: FiShield,
      color: 'from-red-600 to-rose-600',
      path: '/admin/login'
    },
    {
      id: 'AGENT',
      name: '代理商',
      description: '管理推薦業務',
      icon: FiShare2,
      color: 'from-yellow-600 to-amber-600',
      path: '/agent/login'
    },
    {
      id: 'CORPORATE_CONTACT',
      name: '企業窗口',
      description: '管理企業合作事務',
      icon: FiBriefcase,
      color: 'from-cyan-600 to-teal-600',
      path: '/corporate/login'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            TLI Connect
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            選擇您的身份以進入專屬功能
          </p>
          <p className="text-sm text-gray-500">
            每個角色都有專屬的介面和功能
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {roles.map((role, index) => {
            const IconComponent = role.icon;
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => router.push(role.path)}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 overflow-hidden"
              >
                <div className={`bg-gradient-to-r ${role.color} p-6 text-center`}>
                  <IconComponent className="h-12 w-12 text-white mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    {role.name}
                  </h3>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {role.description}
                  </p>
                  
                  <motion.button
                    className={`w-full bg-gradient-to-r ${role.color} text-white py-2 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    進入{role.name}專區
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => router.push('/login')}
            className="text-gray-500 hover:text-gray-700 underline text-sm"
          >
            或使用通用登入頁面
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectPage;