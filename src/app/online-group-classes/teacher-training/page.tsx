'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { FiVideo, FiClock, FiUsers, FiStar, FiCalendar, FiSearch, FiUser, FiBookOpen } from 'react-icons/fi';
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
  subject: string;
  tags: string[];
  features: string[];
}

const TeacherTrainingOnlineGroupClassesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Mock data for Teacher Training online group classes
  const teacherTrainingOnlineGroupClasses: OnlineGroupClass[] = [
    {
      id: 1,
      title: '線上教學技巧培訓',
      instructor: '張博士',
      duration: '6週課程',
      maxStudents: 12,
      currentStudents: 9,
      rating: 4.8,
      price: 3600,
      schedule: '每週五 19:30-21:30',
      nextSession: '2025-08-06 19:30',
      description: '提升線上教學技能，掌握數位教學工具與方法',
      level: 'intermediate',
      subject: '數位教學',
      tags: ['教學', '數位', '培訓'],
      features: ['工具教學', '實作練習', '同儕交流']
    },
    {
      id: 2,
      title: '語言教學法進階班',
      instructor: '李教授',
      duration: '8週課程',
      maxStudents: 10,
      currentStudents: 7,
      rating: 4.9,
      price: 4200,
      schedule: '每週三 18:00-20:00',
      nextSession: '2025-08-04 18:00',
      description: '現代語言教學理論與實踐方法的深度探討',
      level: 'advanced',
      subject: '語言教學',
      tags: ['語言', '教學法', '理論'],
      features: ['理論應用', '案例分析', '教學設計']
    },
    {
      id: 3,
      title: '中文教學工作坊',
      instructor: '王老師',
      duration: '4週課程',
      maxStudents: 8,
      currentStudents: 6,
      rating: 4.7,
      price: 2800,
      schedule: '每週六 14:00-17:00',
      nextSession: '2025-08-07 14:00',
      description: '針對中文教學的專業技巧與策略分享',
      level: 'intermediate',
      subject: '中文教學',
      tags: ['中文', '工作坊', '技巧'],
      features: ['實務分享', '教材設計', '課堂管理']
    },
    {
      id: 4,
      title: '課程設計與評量',
      instructor: '陳教授',
      duration: '10週課程',
      maxStudents: 15,
      currentStudents: 12,
      rating: 4.6,
      price: 3800,
      schedule: '每週二 19:00-21:00',
      nextSession: '2025-08-05 19:00',
      description: '系統性的課程設計原理與多元評量方法',
      level: 'intermediate',
      subject: '課程設計',
      tags: ['設計', '評量', '系統'],
      features: ['設計原理', '評量工具', '實作演練']
    },
    {
      id: 5,
      title: '特殊教育需求研習',
      instructor: '劉博士',
      duration: '6週課程',
      maxStudents: 12,
      currentStudents: 8,
      rating: 4.8,
      price: 3200,
      schedule: '每週日 10:00-12:30',
      nextSession: '2025-08-08 10:00',
      description: '針對特殊需求學生的教學調整與支援策略',
      level: 'advanced',
      subject: '特殊教育',
      tags: ['特殊教育', '需求', '支援'],
      features: ['個案研討', '調整策略', '資源整合']
    },
    {
      id: 6,
      title: '教師專業成長社群',
      instructor: '楊主任',
      duration: '12週課程',
      maxStudents: 20,
      currentStudents: 16,
      rating: 4.5,
      price: 2400,
      schedule: '每週四 20:00-21:30',
      nextSession: '2025-08-06 20:00',
      description: '教師職涯發展與持續專業成長的交流平台',
      level: 'beginner',
      subject: '專業發展',
      tags: ['專業', '發展', '社群'],
      features: ['經驗分享', '成長規劃', '網絡建立']
    }
  ];

  const levels = [
    { id: 'all', name: '所有程度' },
    { id: 'beginner', name: '初級' },
    { id: 'intermediate', name: '中級' },
    { id: 'advanced', name: '高級' }
  ];

  const subjects = [
    { id: 'all', name: '所有領域' },
    { id: '數位教學', name: '數位教學' },
    { id: '語言教學', name: '語言教學' },
    { id: '中文教學', name: '中文教學' },
    { id: '課程設計', name: '課程設計' },
    { id: '特殊教育', name: '特殊教育' },
    { id: '專業發展', name: '專業發展' }
  ];

  const filteredClasses = teacherTrainingOnlineGroupClasses.filter(classItem => {
    const matchesSearch = classItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || classItem.level === selectedLevel;
    const matchesSubject = selectedSubject === 'all' || classItem.subject === selectedSubject;
    
    return matchesSearch && matchesLevel && matchesSubject;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors = [
      'bg-red-100 text-red-800',
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800'
    ];
    const index = Math.abs(subject.charCodeAt(0)) % colors.length;
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
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              師培線上團課
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-red-100">
              專業師資培訓，提升教學品質
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiUser} size={20} />
                <span>專業師資培訓</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiBookOpen} size={20} />
                <span>實用教學技巧</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiUsers} size={20} />
                <span>同儕交流成長</span>
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
                  placeholder="搜尋師培團課..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="lg:w-48">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:w-40">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
            找到 {filteredClasses.length} 門師培團課
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
              <div className="relative h-48 bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <SafeIcon icon={FiVideo} size={48} className="text-white z-10 group-hover:scale-110 transition-transform" />
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(classItem.subject)}`}>
                    {classItem.subject}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">
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

                  <div className="bg-red-50 rounded-lg p-3">
                    <div className="text-xs text-red-600 font-medium mb-1">下次上課</div>
                    <div className="text-sm font-semibold text-red-800">{classItem.nextSession}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {classItem.features.map((feature, i) => (
                      <span key={i} className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-red-600">
                    NT$ {classItem.price}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={classItem.currentStudents >= classItem.maxStudents}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                      classItem.currentStudents >= classItem.maxStudents
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">找不到符合條件的師培團課</h3>
            <p className="text-gray-500">請嘗試調整搜尋條件</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TeacherTrainingOnlineGroupClassesPage;