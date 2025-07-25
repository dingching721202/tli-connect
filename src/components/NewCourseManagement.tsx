'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import CourseTemplateManagement from './CourseTemplateManagement';
import CourseScheduleManagement from './CourseScheduleManagement';
import TimeslotManagement from './TimeslotManagement';

const { FiBook, FiCalendar, FiClock, FiInfo } = FiIcons;

type TabType = 'template' | 'schedule' | 'timeslot';

const NewCourseManagement = () => {
  const [activeTab, setActiveTab] = useState<TabType>('template');

  const tabs = [
    {
      id: 'template' as TabType,
      label: '課程模組',
      icon: FiBook,
      description: '建立和管理課程模板',
      color: 'blue'
    },
    {
      id: 'schedule' as TabType,
      label: '日曆排程',
      icon: FiCalendar,
      description: '為課程安排上課時間',
      color: 'purple'
    },
    {
      id: 'timeslot' as TabType,
      label: '時段管理',
      icon: FiClock,
      description: '管理課程時段與取消課程',
      color: 'red'
    }
  ];

  const getTabColor = (tabId: TabType, isActive: boolean) => {
    const colors = {
      template: {
        active: 'bg-blue-600 text-white border-blue-600',
        inactive: 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
      },
      schedule: {
        active: 'bg-purple-600 text-white border-purple-600',
        inactive: 'bg-white text-purple-600 border-purple-200 hover:bg-purple-50'
      },
      timeslot: {
        active: 'bg-red-600 text-white border-red-600',
        inactive: 'bg-white text-red-600 border-red-200 hover:bg-red-50'
      }
    };
    
    return colors[tabId][isActive ? 'active' : 'inactive'];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">課程系統管理</h1>
              <p className="text-sm text-gray-600">
                {activeTab === 'template' ? '建立課程內容與結構' : 
                 activeTab === 'schedule' ? '安排課程時間與教師' : 
                 '管理課程時段與處理課程取消'}
              </p>
            </div>
            
            {/* Info Badge */}
            <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
              <SafeIcon icon={FiInfo} className="text-blue-600 text-sm" />
              <span className="text-xs text-blue-700">
                {activeTab === 'timeslot' ? '課務人員可在此取消課程時段並通知學員' :
                 '先在「課程模組」發布課程，再到「日曆排程」安排時間'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 py-4">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-xl border-2 font-medium transition-all duration-200 ${
                  getTabColor(tab.id, activeTab === tab.id)
                }`}
              >
                <SafeIcon icon={tab.icon} className="text-lg" />
                <div className="text-left">
                  <div className="text-base font-semibold">{tab.label}</div>
                  <div className={`text-xs ${
                    activeTab === tab.id ? 
                      (tab.id === 'template' ? 'text-blue-100' : 
                       tab.id === 'schedule' ? 'text-purple-100' : 'text-red-100') 
                      : 'text-gray-500'
                  }`}>
                    {tab.description}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'template' && <CourseTemplateManagement />}
          {activeTab === 'schedule' && <CourseScheduleManagement />}
          {activeTab === 'timeslot' && <TimeslotManagement />}
        </motion.div>
      </div>
    </div>
  );
};

export default NewCourseManagement;