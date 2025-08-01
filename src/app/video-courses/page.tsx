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
  category: string;
  duration: string;
  students: number;
  rating: number;
  price: number;
  thumbnail: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

const VideoCoursePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  // Mock data for video courses
  const videoCourses: VideoCourse[] = [
    {
      id: 1,
      title: '商務中文基礎',
      instructor: '王老師',
      category: 'chinese',
      duration: '12小時',
      students: 1250,
      rating: 4.8,
      price: 1200,
      thumbnail: '/api/placeholder/300/200',
      description: '專為商務人士設計的中文課程，涵蓋商務用語、談判技巧等核心內容',
      level: 'beginner',
      tags: ['商務', '基礎', '實用']
    },
    {
      id: 2,
      title: 'English for Business Communication',
      instructor: 'Sarah Johnson',
      category: 'foreign-language',
      duration: '15小時',
      students: 980,
      rating: 4.9,
      price: 1500,
      thumbnail: '/api/placeholder/300/200',
      description: 'Comprehensive business English course covering presentations, meetings, and negotiations',
      level: 'intermediate',
      tags: ['Business', 'Communication', 'Professional']
    },
    {
      id: 3,
      title: '台灣文化與歷史',
      instructor: '陳教授',
      category: 'culture',
      duration: '8小時',
      students: 650,
      rating: 4.7,
      price: 800,
      thumbnail: '/api/placeholder/300/200',
      description: '深入了解台灣豐富的文化傳統與歷史脈絡',
      level: 'beginner',
      tags: ['文化', '歷史', '台灣']
    },
    {
      id: 4,
      title: '國際貿易實務',
      instructor: '李經理',
      category: 'business',
      duration: '20小時',
      students: 420,
      rating: 4.6,
      price: 2000,
      thumbnail: '/api/placeholder/300/200',
      description: '從基礎到進階的國際貿易知識，包含實際案例分析',
      level: 'advanced',
      tags: ['貿易', '實務', '案例']
    },
    {
      id: 5,
      title: '語言教學法概論',
      instructor: '張博士',
      category: 'teacher-training',
      duration: '18小時',
      students: 320,
      rating: 4.9,
      price: 1800,
      thumbnail: '/api/placeholder/300/200',
      description: '現代語言教學理論與實踐方法的完整介紹',
      level: 'intermediate',
      tags: ['教學法', '理論', '實踐']
    },
    {
      id: 6,
      title: '日語入門會話',
      instructor: '田中老師',
      category: 'foreign-language',
      duration: '10小時',
      students: 1100,
      rating: 4.5,
      price: 900,
      thumbnail: '/api/placeholder/300/200',
      description: '從零開始學習日語會話，適合初學者',
      level: 'beginner',
      tags: ['日語', '會話', '入門']
    }
  ];

  const categories = [
    { id: 'all', name: '全部課程', count: videoCourses.length },
    { id: 'chinese', name: '中文', count: videoCourses.filter(c => c.category === 'chinese').length },
    { id: 'foreign-language', name: '外文', count: videoCourses.filter(c => c.category === 'foreign-language').length },
    { id: 'culture', name: '文化', count: videoCourses.filter(c => c.category === 'culture').length },
    { id: 'business', name: '商業', count: videoCourses.filter(c => c.category === 'business').length },
    { id: 'teacher-training', name: '師培', count: videoCourses.filter(c => c.category === 'teacher-training').length }
  ];

  const levels = [
    { id: 'all', name: '所有程度' },
    { id: 'beginner', name: '初級' },
    { id: 'intermediate', name: '中級' },
    { id: 'advanced', name: '高級' }
  ];

  const filteredCourses = videoCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              影音課程
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              豐富的線上學習資源，隨時隨地提升您的技能
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiPlay} size={20} />
                <span>高品質影音內容</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiUsers} size={20} />
                <span>專業師資團隊</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiBookmark} size={20} />
                <span>系統化學習路徑</span>
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
                  placeholder="搜尋課程名稱、講師或內容..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            找到 {filteredCourses.length} 門課程
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
              {/* Thumbnail */}
              <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <SafeIcon icon={FiPlay} size={48} className="text-white z-10 group-hover:scale-110 transition-transform" />
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(course.category)}`}>
                    {categories.find(c => c.id === course.category)?.name}
                  </span>
                </div>
              </div>

              {/* Content */}
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

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {course.tags.map((tag, i) => (
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
        {filteredCourses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <SafeIcon icon={FiSearch} size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">找不到符合條件的課程</h3>
            <p className="text-gray-500">請嘗試調整搜尋條件或瀏覽其他分類</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VideoCoursePage;