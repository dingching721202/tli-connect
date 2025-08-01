'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { FiVideo, FiClock, FiUsers, FiStar, FiCalendar, FiSearch, FiMic, FiBookOpen } from 'react-icons/fi';
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
  tags: string[];
  features: string[];
}

const ChineseOnlineGroupClassesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');

  // Mock data for Chinese online group classes
  const chineseOnlineGroupClasses: OnlineGroupClass[] = [
    {
      id: 1,
      title: '商務中文實戰班',
      instructor: '王老師',
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
      title: '中文寫作進階班',
      instructor: '李教授',
      duration: '10週課程',
      maxStudents: 10,
      currentStudents: 7,
      rating: 4.8,
      price: 2800,
      schedule: '每週六 14:00-16:00',
      nextSession: '2025-08-07 14:00',
      description: '提升中文寫作技巧，包含商務文書、創意寫作等多種文體練習',
      level: 'advanced',
      tags: ['寫作', '文體', '進階'],
      features: ['作品評析', '個別指導', '同儕互評']
    },
    {
      id: 3,
      title: '中文會話練習班',
      instructor: '陳老師',
      duration: '6週課程',
      maxStudents: 15,
      currentStudents: 12,
      rating: 4.7,
      price: 2200,
      schedule: '每週一、三 18:30-19:30',
      nextSession: '2025-08-03 18:30',
      description: '日常生活中文會話練習，提升口語表達流暢度',
      level: 'intermediate',
      tags: ['會話', '口語', '日常'],
      features: ['情境對話', '發音矯正', '小組討論']
    },
    {
      id: 4,
      title: '中文發音基礎班',
      instructor: '張老師',
      duration: '4週課程',
      maxStudents: 8,
      currentStudents: 6,
      rating: 4.9,
      price: 1800,
      schedule: '每週五 19:00-20:30',
      nextSession: '2025-08-06 19:00',
      description: '專業中文發音指導，從基礎聲母韻母到語調練習',
      level: 'beginner',
      tags: ['發音', '基礎', '聲調'],
      features: ['一對一指導', '發音矯正', '語調練習']
    },
    {
      id: 5,
      title: '中文閱讀理解班',
      instructor: '劉教授',
      duration: '8週課程',
      maxStudents: 12,
      currentStudents: 9,
      rating: 4.6,
      price: 2600,
      schedule: '每週日 10:00-12:00',
      nextSession: '2025-08-08 10:00',
      description: '提升中文閱讀理解能力，涵蓋各類文章分析技巧',
      level: 'intermediate',
      tags: ['閱讀', '理解', '分析'],
      features: ['文章分析', '討論交流', '思辨訓練']
    },
    {
      id: 6,
      title: '古典中文入門班',
      instructor: '楊博士',
      duration: '12週課程',
      maxStudents: 8,
      currentStudents: 5,
      rating: 4.8,
      price: 3600,
      schedule: '每週三 20:00-21:30',
      nextSession: '2025-08-04 20:00',
      description: '深入淺出介紹古典中文，培養文言文閱讀能力',
      level: 'advanced',
      tags: ['古典', '文言文', '文學'],
      features: ['經典選讀', '注釋講解', '文化背景']
    }
  ];

  const levels = [
    { id: 'all', name: '所有程度' },
    { id: 'beginner', name: '初級' },
    { id: 'intermediate', name: '中級' },
    { id: 'advanced', name: '高級' }
  ];

  const filteredClasses = chineseOnlineGroupClasses.filter(classItem => {
    const matchesSearch = classItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || classItem.level === selectedLevel;
    
    return matchesSearch && matchesLevel;
  });

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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              中文線上團課
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              專業中文教學，小班制互動學習
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiBookOpen} size={20} />
                <span>系統化學習</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiMic} size={20} />
                <span>口語練習</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiUsers} size={20} />
                <span>小組討論</span>
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
                <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="搜尋中文團課..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="lg:w-40">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            找到 {filteredClasses.length} 門中文團課
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
              <div className="relative h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <SafeIcon icon={FiVideo} size={48} className="text-white z-10 group-hover:scale-110 transition-transform" />
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    中文
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
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

                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-xs text-blue-600 font-medium mb-1">下次上課</div>
                    <div className="text-sm font-semibold text-blue-800">{classItem.nextSession}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {classItem.features.map((feature, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-blue-600">
                    NT$ {classItem.price}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={classItem.currentStudents >= classItem.maxStudents}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                      classItem.currentStudents >= classItem.maxStudents
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">找不到符合條件的中文團課</h3>
            <p className="text-gray-500">請嘗試調整搜尋條件</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChineseOnlineGroupClassesPage;