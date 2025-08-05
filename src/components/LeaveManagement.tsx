'use client';

import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';

const { FiCalendar } = FiIcons;

const LeaveManagement = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <SafeIcon icon={FiCalendar} className="h-8 w-8" />
          請假管理
        </h1>
        <p className="text-gray-600 mt-1">管理學生請假申請和記錄</p>
      </div>

      <div className="bg-white rounded-lg border p-8">
        <div className="text-center">
          <SafeIcon icon={FiCalendar} className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">請假管理功能開發中</h3>
          <p className="text-gray-500">此功能正在開發中，敬請期待</p>
        </div>
      </div>
    </div>
  );
};

export default LeaveManagement;