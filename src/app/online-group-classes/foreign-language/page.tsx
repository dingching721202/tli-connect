'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { FiVideo, FiClock, FiUsers, FiStar, FiCalendar, FiSearch, FiGlobe, FiMessageCircle } from 'react-icons/fi';
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
  language: string;
  tags: string[];
  features: string[];
}

const ForeignLanguageOnlineGroupClassesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  // Mock data for Foreign Language online group classes
  const foreignLanguageOnlineGroupClasses: OnlineGroupClass[] = [
    {
      id: 1,
      title: 'English Conversation Circle',
      instructor: 'Sarah Johnson',
      duration: '12週課程',
      maxStudents: 15,
      currentStudents: 12,
      rating: 4.8,
      price: 2800,
      schedule: '每週一、三、五 18:00-19:00',
      nextSession: '2025-08-03 18:00',
      description: 'Interactive English conversation practice with native speaker',
      level: 'intermediate',
      language: 'English',
      tags: ['會話', '互動', '母語教師'],
      features: ['Native Speaker', 'Group Discussion', 'Cultural Exchange']
    },
    {
      id: 2,
      title: '日語生活會話班',
      instructor: '田中老師',
      duration: '10週課程',
      maxStudents: 10,
      currentStudents: 7,
      rating: 4.7,
      price: 2500,
      schedule: '每週六 10:00-12:00',
      nextSession: '2025-08-07 10:00',
      description: '日常生活日語會話練習，適合初學者的團體課程',
      level: 'beginner',
      language: 'Japanese',
      tags: ['日語', '生活', '初學者'],
      features: ['小組練習', '情境對話', '文化介紹']
    },
    {
      id: 3,
      title: 'Business English Workshop',
      instructor: 'Michael Brown',
      duration: '8週課程',
      maxStudents: 12,
      currentStudents: 9,
      rating: 4.9,
      price: 3500,
      schedule: '每週二、四 19:30-21:00',
      nextSession: '2025-08-05 19:30',
      description: 'Professional business English for workplace communication',
      level: 'advanced',
      language: 'English',
      tags: ['商務', '職場', '進階'],
      features: ['Case Studies', 'Presentation Skills', 'Email Writing']
    },
    {
      id: 4,
      title: '韓語入門會話班',
      instructor: '金老師',
      duration: '8週課程',
      maxStudents: 12,
      currentStudents: 8,
      rating: 4.6,
      price: 2200,
      schedule: '每週日 14:00-16:00',
      nextSession: '2025-08-08 14:00',
      description: '韓語基礎發音和日常會話練習',
      level: 'beginner',
      language: 'Korean',
      tags: ['韓語', '發音', '基礎'],
      features: ['發音練習', '文字學習', 'K-文化']
    },
    {
      id: 5,
      title: '西班牙語旅行會話',
      instructor: 'Maria García',
      duration: '6週課程',
      maxStudents: 8,
      currentStudents: 5,
      rating: 4.5,
      price: 1800,
      schedule: '每週三 18:00-19:30',
      nextSession: '2025-08-04 18:00',
      description: '實用的旅行西班牙語會話，適合旅遊愛好者',
      level: 'beginner',
      language: 'Spanish',
      tags: ['西班牙語', '旅行', '實用'],
      features: ['旅遊情境', '實用短語', '文化介紹']
    },
    {
      id: 6,
      title: 'French Literature Reading Circle',
      instructor: 'Pierre Laurent',
      duration: '10週課程',
      maxStudents: 8,
      currentStudents: 6,
      rating: 4.8,
      price: 3200,
      schedule: '每週五 20:00-21:30',
      nextSession: '2025-08-06 20:00',
      description: '法語文學閱讀與討論，提升語言與文化理解',
      level: 'advanced',
      language: 'French',
      tags: ['法語', '文學', '討論'],
      features: ['經典作品', '深度討論', '文化背景']
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

  const filteredClasses = foreignLanguageOnlineGroupClasses.filter(classItem => {
    const matchesSearch = classItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || classItem.level === selectedLevel;
    const matchesLanguage = selectedLanguage === 'all' || classItem.language === selectedLanguage;
    
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
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              外文線上團課
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100">
              多語言學習，與世界接軌
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiGlobe} size={20} />
                <span>多語言選擇</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiMessageCircle} size={20} />
                <span>會話練習</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiUsers} size={20} />
                <span>國際化學習</span>
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
                  placeholder="搜尋外語團課..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
            找到 {filteredClasses.length} 門外語團課
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
              <div className="relative h-48 bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <SafeIcon icon={FiVideo} size={48} className="text-white z-10 group-hover:scale-110 transition-transform" />
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLanguageColor(classItem.language)}`}>
                    {classItem.language}
                  </span>
                </div>
              </div>

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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">找不到符合條件的外語團課</h3>
            <p className="text-gray-500">請嘗試調整搜尋條件</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ForeignLanguageOnlineGroupClassesPage;