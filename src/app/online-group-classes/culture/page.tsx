'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { FiVideo, FiClock, FiUsers, FiStar, FiCalendar, FiSearch, FiCompass, FiBook } from 'react-icons/fi';
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
  region: string;
  tags: string[];
  features: string[];
}

const CultureOnlineGroupClassesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');

  // Mock data for Culture online group classes
  const cultureOnlineGroupClasses: OnlineGroupClass[] = [
    {
      id: 1,
      title: '台灣文化探索團',
      instructor: '陳教授',
      duration: '6週課程',
      maxStudents: 20,
      currentStudents: 15,
      rating: 4.6,
      price: 1800,
      schedule: '每週日 14:00-16:00',
      nextSession: '2025-08-08 14:00',
      description: '深度探索台灣文化，透過互動討論了解在地特色',
      level: 'beginner',
      region: '台灣',
      tags: ['台灣', '文化', '討論'],
      features: ['文化體驗', '小組討論', '實地分享']
    },
    {
      id: 2,
      title: '中華傳統節慶解析',
      instructor: '李老師',
      duration: '8週課程',
      maxStudents: 15,
      currentStudents: 11,
      rating: 4.8,
      price: 2200,
      schedule: '每週三 19:00-20:30',
      nextSession: '2025-08-04 19:00',
      description: '探索中華傳統節慶的由來、習俗與現代意義',
      level: 'intermediate',
      region: '中華',
      tags: ['節慶', '傳統', '習俗'],
      features: ['歷史脈絡', '文化比較', '現代適應']
    },
    {
      id: 3,
      title: '日本文化深度遊',
      instructor: '山田老師',
      duration: '10週課程',
      maxStudents: 12,
      currentStudents: 8,
      rating: 4.7,
      price: 2800,
      schedule: '每週二 18:30-20:00',
      nextSession: '2025-08-05 18:30',
      description: '從傳統到現代，全面了解日本文化的多樣面貌',
      level: 'intermediate',
      region: '日本',
      tags: ['日本', '傳統', '現代'],
      features: ['文化體驗', '語言學習', '歷史背景']
    },
    {
      id: 4,
      title: '韓國文化與K-潮流',
      instructor: '金教授',
      duration: '6週課程',
      maxStudents: 18,
      currentStudents: 14,
      rating: 4.5,
      price: 2000,
      schedule: '每週六 15:00-17:00',
      nextSession: '2025-08-07 15:00',
      description: '了解韓國傳統文化與現代韓流文化的融合',
      level: 'beginner',
      region: '韓國',
      tags: ['韓國', 'K-pop', '現代'],
      features: ['流行文化', '傳統對比', '社會現象']
    },
    {
      id: 5,
      title: '東南亞文化萬花筒',
      instructor: 'Dr. Singh',
      duration: '12週課程',
      maxStudents: 16,
      currentStudents: 10,
      rating: 4.9,
      price: 3600,
      schedule: '每週四 19:30-21:00',
      nextSession: '2025-08-06 19:30',
      description: '探索東南亞各國豐富多元的文化特色與歷史',
      level: 'advanced',
      region: '東南亞',
      tags: ['東南亞', '多元', '歷史'],
      features: ['跨國比較', '宗教文化', '現代發展']
    },
    {
      id: 6,
      title: '歐洲藝術文化之旅',
      instructor: 'Prof. Smith',
      duration: '10週課程',
      maxStudents: 12,
      currentStudents: 7,
      rating: 4.8,
      price: 3200,
      schedule: '每週五 20:00-21:30',
      nextSession: '2025-08-06 20:00',
      description: '從古典到現代的歐洲藝術文化發展歷程',
      level: 'advanced',
      region: '歐洲',
      tags: ['藝術', '歐洲', '歷史'],
      features: ['藝術賞析', '歷史脈絡', '文化影響']
    }
  ];

  const levels = [
    { id: 'all', name: '所有程度' },
    { id: 'beginner', name: '初級' },
    { id: 'intermediate', name: '中級' },
    { id: 'advanced', name: '高級' }
  ];

  const regions = [
    { id: 'all', name: '所有地區' },
    { id: '台灣', name: '台灣' },
    { id: '中華', name: '中華' },
    { id: '日本', name: '日本' },
    { id: '韓國', name: '韓國' },
    { id: '東南亞', name: '東南亞' },
    { id: '歐洲', name: '歐洲' }
  ];

  const filteredClasses = cultureOnlineGroupClasses.filter(classItem => {
    const matchesSearch = classItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || classItem.level === selectedLevel;
    const matchesRegion = selectedRegion === 'all' || classItem.region === selectedRegion;
    
    return matchesSearch && matchesLevel && matchesRegion;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRegionColor = (region: string) => {
    switch (region) {
      case '台灣': return 'bg-blue-100 text-blue-800';
      case '中華': return 'bg-red-100 text-red-800';
      case '日本': return 'bg-pink-100 text-pink-800';
      case '韓國': return 'bg-purple-100 text-purple-800';
      case '東南亞': return 'bg-green-100 text-green-800';
      case '歐洲': return 'bg-indigo-100 text-indigo-800';
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
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              文化線上團課
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-purple-100">
              探索世界文化，開拓國際視野
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiCompass} size={20} />
                <span>文化探索</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiBook} size={20} />
                <span>深度學習</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiUsers} size={20} />
                <span>互動討論</span>
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
                  placeholder="搜尋文化團課..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="lg:w-40">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {regions.map(region => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:w-40">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            找到 {filteredClasses.length} 門文化團課
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
              <div className="relative h-48 bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <SafeIcon icon={FiVideo} size={48} className="text-white z-10 group-hover:scale-110 transition-transform" />
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRegionColor(classItem.region)}`}>
                    {classItem.region}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
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

                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-xs text-purple-600 font-medium mb-1">下次上課</div>
                    <div className="text-sm font-semibold text-purple-800">{classItem.nextSession}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {classItem.features.map((feature, i) => (
                      <span key={i} className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-purple-600">
                    NT$ {classItem.price}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={classItem.currentStudents >= classItem.maxStudents}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                      classItem.currentStudents >= classItem.maxStudents
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">找不到符合條件的文化團課</h3>
            <p className="text-gray-500">請嘗試調整搜尋條件</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CultureOnlineGroupClassesPage;