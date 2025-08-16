'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import { useAuth } from '@/contexts/AuthContext';

const { FiUsers } = FiIcons;

export default function AgentManagement() {
  const { user } = useAuth();

  // Show unauthorized message for non-admin users
  if (!user || !user.roles.includes('ADMIN')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <SafeIcon icon={FiUsers} className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">權限不足</h3>
          <p className="mt-1 text-sm text-gray-500">
            您需要管理員權限才能訪問代理管理功能。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">代理管理</h1>
          <p className="text-gray-600">管理代理商資訊和銷售數據</p>
        </div>
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div className="p-6">
          <div className="text-center py-12">
            <SafeIcon icon={FiUsers} className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">代理管理功能重新設計中</h3>
            <p className="mt-1 text-sm text-gray-500">
              代理管理組件需要更新以配合新的數據結構。
              <br />
              此功能將在後續版本中重新實現。
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}