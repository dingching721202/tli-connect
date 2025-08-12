'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { FiPlay, FiClock, FiUsers, FiStar, FiBookmark, FiSearch, FiGlobe } from 'react-icons/fi';
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
  language: string;
  tags: string[];
}

const ForeignLanguageCoursePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  // Mock data for Foreign Language courses
  const foreignLanguageCourses: VideoCourse[] = [
    {
      id: 1,
      title: 'English for Business Communication',
      instructor: 'Sarah Johnson',
      duration: '15小時',
      students: 980,
      rating: 4.9,
      price: 1500,
      description: 'Comprehensive business English course covering presentations, meetings, and negotiations',
      level: 'intermediate',
      language: 'English',
      tags: ['Business', 'Communication', 'Professional']
    },
    {
      id: 2,
      title: '日語入門會話',
      instructor: '田中老師',
      duration: '10小時',
      students: 1100,
      rating: 4.5,
      price: 900,
      description: '從零開始學習日語會話，適合初學者',
      level: 'beginner',
      language: 'Japanese',
      tags: ['日語', '會話', '入門']
    },
    {
      id: 3,
      title: 'Korean Language Fundamentals',
      instructor: '金老師',
      duration: '12小時',
      students: 750,
      rating: 4.7,
      price: 1000,
      description: '韓語基礎課程，包含發音、語法和基本會話',
      level: 'beginner',
      language: 'Korean',
      tags: ['韓語', '基礎', '發音']
    },
    {
      id: 4,
      title: 'Advanced English Writing',
      instructor: 'Michael Brown',
      duration: '18小時',
      students: 420,
      rating: 4.8,
      price: 1800,
      description: 'Advanced English writing techniques for academic and professional purposes',
      level: 'advanced',
      language: 'English',
      tags: ['Writing', 'Academic', 'Advanced']
    },
    {
      id: 5,
      title: '西班牙語會話實踐',
      instructor: 'Maria García',
      duration: '14小時',
      students: 520,
      rating: 4.6,
      price: 1200,
      description: '西班牙語會話練習，提升口語表達能力',
      level: 'intermediate',
      language: 'Spanish',
      tags: ['西班牙語', '會話', '口語']
    },
    {
      id: 6,
      title: '法語基礎入門',
      instructor: 'Pierre Laurent',
      duration: '16小時',
      students: 680,
      rating: 4.4,
      price: 1300,
      description: '法語基礎課程，涵蓋日常用語和基本語法',
      level: 'beginner',
      language: 'French',
      tags: ['法語', '基礎', '語法']
    }
  ];

  const levels = [
    { id: 'all', name: '所有程度' },
    { id: 'beginner', name: '初級' },
    { id: 'intermediate', name: '中級' },
    { id: 'advanced', name: '高級' }
  ];

  const languages = [
    { id: 'all', name: '所有語言' },
    { id: 'English', name: '英語' },
    { id: 'Japanese', name: '日語' },
    { id: 'Korean', name: '韓語' },
    { id: 'Spanish', name: '西班牙語' },
    { id: 'French', name: '法語' }
  ];

  const filteredCourses = foreignLanguageCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    const matchesLanguage = selectedLanguage === 'all' || course.language === selectedLanguage;
    
    return matchesSearch && matchesLevel && matchesLanguage;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLanguageColor = (language: string) => {
    switch (language) {
      case 'English': return 'bg-blue-100 text-blue-800';
      case 'Japanese': return 'bg-pink-100 text-pink-800';
      case 'Korean': return 'bg-purple-100 text-purple-800';
      case 'Spanish': return 'bg-orange-100 text-orange-800';
      case 'French': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              外文課程
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100">
              豐富的外語學習資源，掌握全球溝通技能
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiGlobe} size={20} />
                <span>多種語言選擇</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiUsers} size={20} />
                <span>外籍專業教師</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiBookmark} size={20} />
                <span>實用對話練習</span>
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
                  placeholder="搜尋外語課程..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="lg:w-40">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {languages.map(language => (
                  <option key={language.id} value={language.id}>
                    {language.name}
                  </option>
                ))}
              </select>
            </div>

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
            找到 {filteredCourses.length} 門外語課程
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
              <div className="relative h-48 bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <SafeIcon icon={FiPlay} size={48} className="text-white z-10 group-hover:scale-110 transition-transform" />
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLanguageColor(course.language)}`}>
                    {course.language}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
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
                  <div className="text-2xl font-bold text-green-600">
                    NT$ {course.price}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <SafeIcon icon={FiPlay} size={16} />
                    <span>開始學習</span>
                  </motion.button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {course.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">找不到符合條件的外語課程</h3>
            <p className="text-gray-500">請嘗試調整搜尋條件</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ForeignLanguageCoursePage;