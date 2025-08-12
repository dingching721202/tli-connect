'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { FiPlay, FiClock, FiUsers, FiStar, FiSearch, FiBriefcase, FiTrendingUp } from 'react-icons/fi';
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
  category: string;
  tags: string[];
}

const BusinessCoursePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data for Business courses
  const businessCourses: VideoCourse[] = [
    {
      id: 1,
      title: '國際貿易實務',
      instructor: '李經理',
      duration: '20小時',
      students: 420,
      rating: 4.6,
      price: 2000,
      description: '從基礎到進階的國際貿易知識，包含實際案例分析',
      level: 'advanced',
      category: '貿易',
      tags: ['貿易', '實務', '案例']
    },
    {
      id: 2,
      title: '數位行銷策略',
      instructor: '張總監',
      duration: '16小時',
      students: 890,
      rating: 4.8,
      price: 1800,
      description: '現代數位行銷的核心策略與實戰技巧',
      level: 'intermediate',
      category: '行銷',
      tags: ['數位', '行銷', '策略']
    },
    {
      id: 3,
      title: '財務管理基礎',
      instructor: '王會計師',
      duration: '14小時',
      students: 650,
      rating: 4.5,
      price: 1500,
      description: '企業財務管理的基本概念與實用工具',
      level: 'beginner',
      category: '財務',
      tags: ['財務', '管理', '基礎']
    },
    {
      id: 4,
      title: '商業談判技巧',
      instructor: '陳顧問',
      duration: '12小時',
      students: 720,
      rating: 4.7,
      price: 1600,
      description: '掌握商業談判的心理學與實戰技巧',
      level: 'intermediate',
      category: '談判',
      tags: ['談判', '技巧', '心理']
    },
    {
      id: 5,
      title: '創業與新創管理',
      instructor: 'Dr. Johnson',
      duration: '18小時',
      students: 540,
      rating: 4.9,
      price: 2200,
      description: '從創業構想到營運管理的完整指南',
      level: 'advanced',
      category: '創業',
      tags: ['創業', '管理', '新創']
    },
    {
      id: 6,
      title: '跨文化商務溝通',
      instructor: '林教授',
      duration: '10小時',
      students: 480,
      rating: 4.4,
      price: 1200,
      description: '在全球化環境中的有效商務溝通策略',
      level: 'intermediate',
      category: '溝通',
      tags: ['跨文化', '溝通', '商務']
    },
    {
      id: 7,
      title: '供應鏈管理',
      instructor: '劉經理',
      duration: '15小時',
      students: 380,
      rating: 4.6,
      price: 1700,
      description: '現代供應鏈管理的理論與實務應用',
      level: 'advanced',
      category: '供應鏈',
      tags: ['供應鏈', '管理', '物流']
    },
    {
      id: 8,
      title: '專案管理入門',
      instructor: '吳顧問',
      duration: '12小時',
      students: 950,
      rating: 4.5,
      price: 1300,
      description: '專案管理的基本框架與實用工具',
      level: 'beginner',
      category: '專案管理',
      tags: ['專案', '管理', '工具']
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
    { id: '貿易', name: '國際貿易' },
    { id: '行銷', name: '行銷策略' },
    { id: '財務', name: '財務管理' },
    { id: '談判', name: '商業談判' },
    { id: '創業', name: '創業管理' },
    { id: '溝通', name: '商務溝通' },
    { id: '供應鏈', name: '供應鏈管理' },
    { id: '專案管理', name: '專案管理' }
  ];

  const filteredCourses = businessCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    
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
      'bg-indigo-100 text-indigo-800',
      'bg-yellow-100 text-yellow-800',
      'bg-red-100 text-red-800'
    ];
    const index = Math.abs(category.charCodeAt(0)) % colors.length;
    return colors[index];
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
              商業課程
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
                <span>業界專家授課</span>
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
                  placeholder="搜尋商業課程..."
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
            找到 {filteredCourses.length} 門商業課程
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
              <div className="relative h-48 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <SafeIcon icon={FiPlay} size={48} className="text-white z-10 group-hover:scale-110 transition-transform" />
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(course.category)}`}>
                    {course.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
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
                  <div className="text-2xl font-bold text-orange-600">
                    NT$ {course.price}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                  >
                    <SafeIcon icon={FiPlay} size={16} />
                    <span>開始學習</span>
                  </motion.button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {course.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">找不到符合條件的商業課程</h3>
            <p className="text-gray-500">請嘗試調整搜尋條件</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BusinessCoursePage;