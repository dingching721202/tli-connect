'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import RoleEntry from '@/components/RoleEntry';
import { FiVideo, FiClock, FiUsers, FiStar, FiCalendar, FiSearch, FiMic, FiCamera, FiMonitor } from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';

interface OnlineGroupClass {
  id: number;
  title: string;
  instructor: string;
  category: string;
  duration: string;
  maxStudents: number;
  currentStudents: number;
  rating: number;
  price: number;
  schedule: string;
  nextSession: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  features: string[];
}

const StudentOnlineGroupClassesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  // Mock data for online group classes
  const onlineGroupClasses: OnlineGroupClass[] = [
    {
      id: 1,
      title: '商務中文實戰班',
      instructor: '王老師',
      category: 'chinese',
      duration: '8週課程',
      maxStudents: 12,
      currentStudents: 8,
      rating: 4.9,
      price: 3200,
      schedule: '每週二、四 19:00-20:30',
      nextSession: '2025-08-05 19:00',
      description: '小班制商務中文團課，互動式學習，提升職場中文溝通能力',
      level: 'intermediate',
      tags: ['商務', '互動', '小班制'],
      features: ['即時互動', '課後錄影', '個人指導']
    },
    {
      id: 2,
      title: 'English Conversation Circle',
      instructor: 'Sarah Johnson',
      category: 'foreign-language',
      duration: '12週課程',
      maxStudents: 15,
      currentStudents: 12,
      rating: 4.8,
      price: 2800,
      schedule: '每週一、三、五 18:00-19:00',
      nextSession: '2025-08-03 18:00',
      description: 'Interactive English conversation practice with native speaker',
      level: 'intermediate',
      tags: ['會話', '互動', '母語教師'],
      features: ['Native Speaker', 'Group Discussion', 'Cultural Exchange']
    },
    {
      id: 3,
      title: '日語生活會話班',
      instructor: '田中老師',
      category: 'foreign-language',
      duration: '10週課程',
      maxStudents: 10,
      currentStudents: 7,
      rating: 4.7,
      price: 2500,
      schedule: '每週六 10:00-12:00',
      nextSession: '2025-08-07 10:00',
      description: '日常生活日語會話練習，適合初學者的團體課程',
      level: 'beginner',
      tags: ['日語', '生活', '初學者'],
      features: ['小組練習', '情境對話', '文化介紹']
    },
    {
      id: 4,
      title: '台灣文化探索團',
      instructor: '陳教授',
      category: 'culture',
      duration: '6週課程',
      maxStudents: 20,
      currentStudents: 15,
      rating: 4.6,
      price: 1800,
      schedule: '每週日 14:00-16:00',
      nextSession: '2025-08-08 14:00',
      description: '深度探索台灣文化，透過互動討論了解在地特色',
      level: 'beginner',
      tags: ['台灣', '文化', '討論'],
      features: ['文化體驗', '小組討論', '實地分享']
    },
    {
      id: 5,
      title: '數位行銷策略工作坊',
      instructor: '李總監',
      category: 'business',
      duration: '4週課程',
      maxStudents: 8,
      currentStudents: 6,
      rating: 4.9,
      price: 4500,
      schedule: '每週三 20:00-22:00',
      nextSession: '2025-08-04 20:00',
      description: '專業數位行銷團課，實戰案例分析與策略制定',
      level: 'advanced',
      tags: ['行銷', '工作坊', '案例'],
      features: ['實戰案例', '策略制定', '專業指導']
    }
  ];

  const categories = [
    { id: 'all', name: '全部課程', count: onlineGroupClasses.length },
    { id: 'chinese', name: '中文', count: onlineGroupClasses.filter(c => c.category === 'chinese').length },
    { id: 'foreign-language', name: '外文', count: onlineGroupClasses.filter(c => c.category === 'foreign-language').length },
    { id: 'culture', name: '文化', count: onlineGroupClasses.filter(c => c.category === 'culture').length },
    { id: 'business', name: '商業', count: onlineGroupClasses.filter(c => c.category === 'business').length }
  ];

  const levels = [
    { id: 'all', name: '所有程度' },
    { id: 'beginner', name: '初級' },
    { id: 'intermediate', name: '中級' },
    { id: 'advanced', name: '高級' }
  ];

  const filteredClasses = onlineGroupClasses.filter(classItem => {
    const matchesSearch = classItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || classItem.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || classItem.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'chinese': return 'bg-blue-100 text-blue-800';
      case 'foreign-language': return 'bg-green-100 text-green-800';
      case 'culture': return 'bg-purple-100 text-purple-800';
      case 'business': return 'bg-orange-100 text-orange-800';
      case 'teacher-training': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio < 0.5) return 'text-green-600';
    if (ratio < 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <RoleEntry requiredRole="STUDENT">
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                線上團課
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-green-100">
                小班制互動學習，與同學一起成長進步
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiVideo} size={20} />
                  <span>即時視訊互動</span>
                </div>
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiUsers} size={20} />
                  <span>小班制教學</span>
                </div>
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiMic} size={20} />
                  <span>語音討論交流</span>
                </div>
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiMonitor} size={20} />
                  <span>螢幕共享學習</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="搜尋團課名稱、講師或內容..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="lg:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Level Filter */}
              <div className="lg:w-40">
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {levels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              找到 {filteredClasses.length} 門團課
            </div>
          </motion.div>

          {/* Class Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClasses.map((classItem, index) => (
              <motion.div
                key={classItem.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                {/* Header */}
                <div className="relative h-48 bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <SafeIcon icon={FiVideo} size={48} className="text-white z-10 group-hover:scale-110 transition-transform" />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(classItem.category)}`}>
                      {categories.find(c => c.id === classItem.category)?.name}
                    </span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <div className="bg-white bg-opacity-90 rounded-full p-2">
                      <SafeIcon icon={FiCamera} size={16} className="text-green-600" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                      {classItem.title}
                    </h3>
                    <div className="flex items-center text-yellow-500">
                      <SafeIcon icon={FiStar} size={16} />
                      <span className="ml-1 text-sm font-medium text-gray-700">{classItem.rating}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {classItem.description}
                  </p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-gray-500">講師：{classItem.instructor}</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(classItem.level)}`}>
                        {levels.find(l => l.id === classItem.level)?.name}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <SafeIcon icon={FiClock} size={14} className="mr-2" />
                      <span>{classItem.duration}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <SafeIcon icon={FiUsers} size={14} className="mr-2" />
                        <span className={getAvailabilityColor(classItem.currentStudents, classItem.maxStudents)}>
                          {classItem.currentStudents}/{classItem.maxStudents} 人
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {classItem.maxStudents - classItem.currentStudents > 0 
                          ? `還有 ${classItem.maxStudents - classItem.currentStudents} 個名額`
                          : '額滿'
                        }
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <SafeIcon icon={FiCalendar} size={14} className="mr-2" />
                      <span>{classItem.schedule}</span>
                    </div>

                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-xs text-green-600 font-medium mb-1">下次上課</div>
                      <div className="text-sm font-semibold text-green-800">{classItem.nextSession}</div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {classItem.features.map((feature, i) => (
                        <span key={i} className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-green-600">
                      NT$ {classItem.price}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={classItem.currentStudents >= classItem.maxStudents}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                        classItem.currentStudents >= classItem.maxStudents
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      <SafeIcon icon={FiVideo} size={16} />
                      <span>{classItem.currentStudents >= classItem.maxStudents ? '已額滿' : '立即報名'}</span>
                    </motion.button>
                  </div>

                  {/* Tags */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {classItem.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredClasses.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <SafeIcon icon={FiSearch} size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">找不到符合條件的團課</h3>
              <p className="text-gray-500">請嘗試調整搜尋條件或瀏覽其他分類</p>
            </motion.div>
          )}
        </div>
      </div>
    </RoleEntry>
  );
};

export default StudentOnlineGroupClassesPage;