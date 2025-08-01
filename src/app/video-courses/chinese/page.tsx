'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { FiPlay, FiClock, FiUsers, FiStar, FiBookmark, FiSearch } from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';

interface VideoCourse {
  id: number;
  title: string;
  instructor: string;
  duration: string;
  students: number;
  rating: number;
  price: number;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

const ChineseCoursePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');

  // Mock data for Chinese courses
  const chineseCourses: VideoCourse[] = [
    {
      id: 1,
      title: '商務中文基礎',
      instructor: '王老師',
      duration: '12小時',
      students: 1250,
      rating: 4.8,
      price: 1200,
      description: '專為商務人士設計的中文課程，涵蓋商務用語、談判技巧等核心內容',
      level: 'beginner',
      tags: ['商務', '基礎', '實用']
    },
    {
      id: 2,
      title: '中文寫作進階',
      instructor: '李教授',
      duration: '16小時',
      students: 820,
      rating: 4.9,
      price: 1500,
      description: '提升中文寫作能力，包含公文寫作、創意寫作等多種文體',
      level: 'advanced',
      tags: ['寫作', '進階', '文體']
    },
    {
      id: 3,
      title: '中文會話實踐',
      instructor: '陳老師',
      duration: '10小時',
      students: 1100,
      rating: 4.7,
      price: 900,
      description: '日常生活中文會話練習，提升口語表達能力',
      level: 'intermediate',
      tags: ['會話', '口語', '日常']
    },
    {
      id: 4,
      title: '中文閱讀理解',
      instructor: '張教授',
      duration: '14小時',
      students: 650,
      rating: 4.6,
      price: 1100,
      description: '提升中文閱讀理解能力，涵蓋各類文章分析技巧',
      level: 'intermediate',
      tags: ['閱讀', '理解', '分析']
    },
    {
      id: 5,
      title: '中文發音矯正',
      instructor: '劉老師',
      duration: '8小時',
      students: 920,
      rating: 4.8,
      price: 800,
      description: '專業中文發音指導，幫助學習者改善發音問題',
      level: 'beginner',
      tags: ['發音', '矯正', '指導']
    },
    {
      id: 6,
      title: '古典中文導讀',
      instructor: '楊博士',
      duration: '20小時',
      students: 380,
      rating: 4.9,
      price: 1800,
      description: '深入淺出介紹古典中文，培養文言文閱讀能力',
      level: 'advanced',
      tags: ['古典', '文言文', '文學']
    }
  ];

  const levels = [
    { id: 'all', name: '所有程度' },
    { id: 'beginner', name: '初級' },
    { id: 'intermediate', name: '中級' },
    { id: 'advanced', name: '高級' }
  ];

  const filteredCourses = chineseCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    
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
              中文課程
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              專業的中文學習課程，提升您的中文能力
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiPlay} size={20} />
                <span>系統化學習</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiUsers} size={20} />
                <span>專業中文教師</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiBookmark} size={20} />
                <span>實用內容</span>
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
                  placeholder="搜尋中文課程..."
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
            找到 {filteredCourses.length} 門中文課程
          </div>
        </motion.div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
            >
              <div className="relative h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <SafeIcon icon={FiPlay} size={48} className="text-white z-10 group-hover:scale-110 transition-transform" />
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    中文
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>
                  <div className="flex items-center text-yellow-500">
                    <SafeIcon icon={FiStar} size={16} />
                    <span className="ml-1 text-sm font-medium text-gray-700">{course.rating}</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-500">
                    講師：{course.instructor}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                    {levels.find(l => l.id === course.level)?.name}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <SafeIcon icon={FiClock} size={14} className="mr-1" />
                      {course.duration}
                    </div>
                    <div className="flex items-center">
                      <SafeIcon icon={FiUsers} size={14} className="mr-1" />
                      {course.students}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-blue-600">
                    NT$ {course.price}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <SafeIcon icon={FiPlay} size={16} />
                    <span>開始學習</span>
                  </motion.button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {course.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <SafeIcon icon={FiSearch} size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">找不到符合條件的中文課程</h3>
            <p className="text-gray-500">請嘗試調整搜尋條件</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChineseCoursePage;