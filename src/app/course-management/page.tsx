'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CourseManagement from '@/components/CourseManagement';
import TimeslotManagement from '@/components/TimeslotManagement';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function CourseManagementPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'courses' | 'timeslots'>('courses');

  // 檢查是否為課務人員，顯示時段管理標籤
  const showTimeslotTab = user?.role === 'OPS';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* 標籤導航 */}
        {showTimeslotTab && (
          <div className="mb-6">
            <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1 w-fit">
              <motion.button
                onClick={() => setActiveTab('courses')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'courses'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                課程管理
              </motion.button>
              <motion.button
                onClick={() => setActiveTab('timeslots')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'timeslots'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                時段管理
              </motion.button>
            </div>
          </div>
        )}

        {/* 內容區域 */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'courses' ? <CourseManagement /> : <TimeslotManagement />}
        </motion.div>
      </div>
    </div>
  );
}