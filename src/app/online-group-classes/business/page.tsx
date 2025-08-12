'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { FiVideo, FiClock, FiUsers, FiStar, FiCalendar, FiSearch, FiBriefcase, FiTrendingUp } from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';

interface OnlineGroupClass {
  id: number;
  title: string;
  instructor: string;
  duration: string;
  maxStudents: number;
  currentStudents: number;
  rating: number;
  price: number;
  schedule: string;
  nextSession: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  features: string[];
}

const BusinessOnlineGroupClassesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data for Business online group classes
  const businessOnlineGroupClasses: OnlineGroupClass[] = [
    {
      id: 1,
      title: '數位行銷策略工作坊',
      instructor: '李總監',
      duration: '4週課程',
      maxStudents: 8,
      currentStudents: 6,
      rating: 4.9,
      price: 4500,
      schedule: '每週三 20:00-22:00',
      nextSession: '2025-08-04 20:00',
      description: '專業數位行銷團課，實戰案例分析與策略制定',
      level: 'advanced',
      category: '行銷',
      tags: ['行銷', '工作坊', '案例'],
      features: ['實戰案例', '策略制定', '專業指導']
    },
    {
      id: 2,
      title: '創業入門指導班',
      instructor: '張創辦人',
      duration: '8週課程',
      maxStudents: 12,
      currentStudents: 9,
      rating: 4.7,
      price: 3600,
      schedule: '每週六 14:00-16:30',
      nextSession: '2025-08-07 14:00',
      description: '從構想到實現，創業全程指導與經驗分享',
      level: 'beginner',
      category: '創業',
      tags: ['創業', '指導', '經驗'],
      features: ['導師指導', '同儕交流', '實作練習']
    },
    {
      id: 3,
      title: '國際貿易實務班',
      instructor: '王經理',
      duration: '10週課程',
      maxStudents: 10,
      currentStudents: 7,
      rating: 4.8,
      price: 5200,
      schedule: '每週四 19:00-21:00',
      nextSession: '2025-08-06 19:00',
      description: '從基礎到進階的國際貿易知識與實務操作',
      level: 'intermediate',
      category: '貿易',
      tags: ['貿易', '實務', '國際'],
      features: ['文件操作', '法規解析', '案例研討']
    },
    {
      id: 4,
      title: '財務管理精進班',
      instructor: '陳會計師',
      duration: '6週課程',
      maxStudents: 15,
      currentStudents: 12,
      rating: 4.6,
      price: 3200,
      schedule: '每週二 18:30-20:30',
      nextSession: '2025-08-05 18:30',
      description: '企業財務管理核心技能與分析工具應用',
      level: 'intermediate',
      category: '財務',
      tags: ['財務', '管理', '分析'],
      features: ['工具應用', '案例分析', '實務操作']
    },
    {
      id: 5,
      title: '商業談判技巧班',
      instructor: '劉顧問',
      duration: '4週課程',
      maxStudents: 8,
      currentStudents: 5,
      rating: 4.9,
      price: 2800,
      schedule: '每週五 19:30-21:30',
      nextSession: '2025-08-06 19:30',
      description: '掌握商業談判心理學與實戰技巧',
      level: 'advanced',
      category: '談判',
      tags: ['談判', '技巧', '心理'],
      features: ['角色扮演', '心理分析', '實戰演練']
    },
    {
      id: 6,
      title: '專案管理認證班',
      instructor: '吳PM',
      duration: '12週課程',
      maxStudents: 16,
      currentStudents: 13,
      rating: 4.5,
      price: 4800,
      schedule: '每週日 09:00-12:00',
      nextSession: '2025-08-08 09:00',
      description: '系統化專案管理知識與工具應用',
      level: 'intermediate',
      category: '專案管理',
      tags: ['專案', '管理', '認證'],
      features: ['認證輔導', '工具操作', '團隊協作']
    }
  ];

  const levels = [
    { id: 'all', name: '所有程度' },
    { id: 'beginner', name: '初級' },
    { id: 'intermediate', name: '中級' },
    { id: 'advanced', name: '高級' }
  ];

  const categories = [
    { id: 'all', name: '所有類別' },
    { id: '行銷', name: '數位行銷' },
    { id: '創業', name: '創業指導' },
    { id: '貿易', name: '國際貿易' },
    { id: '財務', name: '財務管理' },
    { id: '談判', name: '商業談判' },
    { id: '專案管理', name: '專案管理' }
  ];

  const filteredClasses = businessOnlineGroupClasses.filter(classItem => {
    const matchesSearch = classItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || classItem.level === selectedLevel;
    const matchesCategory = selectedCategory === 'all' || classItem.category === selectedCategory;
    
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = [
      'bg-orange-100 text-orange-800',
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800'
    ];
    const index = Math.abs(category.charCodeAt(0)) % colors.length;
    return colors[index];
  };

  const getAvailabilityColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio < 0.5) return 'text-green-600';
    if (ratio < 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              商業線上團課
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-100">
              提升商業技能，掌握市場先機
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiBriefcase} size={20} />
                <span>實戰商業技能</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiTrendingUp} size={20} />
                <span>市場趨勢分析</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiUsers} size={20} />
                <span>專業小班制</span>
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
            <div className="flex-1">
              <div className="relative">
                <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                <input
                  type="text"
                  placeholder="搜尋商業團課..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="lg:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:w-40">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
            找到 {filteredClasses.length} 門商業團課
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
              <div className="relative h-48 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <SafeIcon icon={FiVideo} size={48} className="text-white z-10 group-hover:scale-110 transition-transform" />
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(classItem.category)}`}>
                    {classItem.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
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

                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="text-xs text-orange-600 font-medium mb-1">下次上課</div>
                    <div className="text-sm font-semibold text-orange-800">{classItem.nextSession}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {classItem.features.map((feature, i) => (
                      <span key={i} className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-orange-600">
                    NT$ {classItem.price}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={classItem.currentStudents >= classItem.maxStudents}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                      classItem.currentStudents >= classItem.maxStudents
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
                  >
                    <SafeIcon icon={FiVideo} size={16} />
                    <span>{classItem.currentStudents >= classItem.maxStudents ? '已額滿' : '立即報名'}</span>
                  </motion.button>
                </div>

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

        {filteredClasses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <SafeIcon icon={FiSearch} size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">找不到符合條件的商業團課</h3>
            <p className="text-gray-500">請嘗試調整搜尋條件</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BusinessOnlineGroupClassesPage;