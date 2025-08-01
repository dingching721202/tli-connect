'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { FiPlay, FiClock, FiUsers, FiStar, FiSearch, FiUser, FiBookOpen } from 'react-icons/fi';
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
  subject: string;
  tags: string[];
}

const TeacherTrainingCoursePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Mock data for Teacher Training courses
  const teacherTrainingCourses: VideoCourse[] = [
    {
      id: 1,
      title: '語言教學法概論',
      instructor: '張博士',
      duration: '18小時',
      students: 320,
      rating: 4.9,
      price: 1800,
      description: '現代語言教學理論與實踐方法的完整介紹',
      level: 'intermediate',
      subject: '語言教學',
      tags: ['教學法', '理論', '實踐']
    },
    {
      id: 2,
      title: '中文教學技巧與策略',
      instructor: '李教授',
      duration: '16小時',
      students: 450,
      rating: 4.8,
      price: 1600,
      description: '針對中文教學的專業技巧與有效策略',
      level: 'intermediate',
      subject: '中文教學',
      tags: ['中文', '技巧', '策略']
    },
    {
      id: 3,
      title: '數位教學工具應用',
      instructor: '王老師',
      duration: '12小時',
      students: 680,
      rating: 4.7,
      price: 1200,
      description: '掌握現代數位教學工具的使用與整合',
      level: 'beginner',
      subject: '數位教學',
      tags: ['數位', '工具', '科技']
    },
    {
      id: 4,
      title: '課程設計與評量',
      instructor: '陳教授',
      duration: '20小時',
      students: 280,
      rating: 4.9,
      price: 2000,
      description: '系統性的課程設計原理與多元評量方法',
      level: 'advanced',
      subject: '課程設計',
      tags: ['設計', '評量', '系統']
    },
    {
      id: 5,
      title: '跨文化教學適應',
      instructor: 'Dr. Smith',
      duration: '14小時',
      students: 380,
      rating: 4.6,
      price: 1500,
      description: '在多元文化環境中的教學調適策略',
      level: 'intermediate',
      subject: '跨文化教學',
      tags: ['跨文化', '適應', '多元']
    },
    {
      id: 6,
      title: '兒童語言發展與教學',
      instructor: '劉博士',
      duration: '15小時',
      students: 520,
      rating: 4.8,
      price: 1700,
      description: '兒童語言發展階段與相應教學方法',
      level: 'advanced',
      subject: '兒童教學',
      tags: ['兒童', '發展', '語言']
    },
    {
      id: 7,
      title: '教師專業發展',
      instructor: '楊教授',
      duration: '10小時',
      students: 750,
      rating: 4.5,
      price: 1000,
      description: '教師職涯發展與持續專業成長',
      level: 'beginner',
      subject: '專業發展',
      tags: ['專業', '發展', '成長']
    },
    {
      id: 8,
      title: '特殊教育需求學生教學',
      instructor: '孫老師',
      duration: '16小時',
      students: 420,
      rating: 4.7,
      price: 1800,
      description: '針對特殊需求學生的教學調整與支援',
      level: 'advanced',
      subject: '特殊教育',
      tags: ['特殊教育', '需求', '支援']
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
    { id: '語言教學', name: '語言教學' },
    { id: '中文教學', name: '中文教學' },
    { id: '數位教學', name: '數位教學' },
    { id: '課程設計', name: '課程設計' },
    { id: '跨文化教學', name: '跨文化教學' },
    { id: '兒童教學', name: '兒童教學' },
    { id: '專業發展', name: '專業發展' },
    { id: '特殊教育', name: '特殊教育' }
  ];

  const filteredCourses = teacherTrainingCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    const matchesSubject = selectedSubject === 'all' || course.subject === selectedSubject;
    
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
      'bg-indigo-100 text-indigo-800',
      'bg-yellow-100 text-yellow-800',
      'bg-orange-100 text-orange-800'
    ];
    const index = Math.abs(subject.charCodeAt(0)) % colors.length;
    return colors[index];
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
              師培課程
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-red-100">
              專業師資培訓，提升教學品質與技能
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
                <span>資深教育專家</span>
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
                  placeholder="搜尋師培課程..."
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
            找到 {filteredCourses.length} 門師培課程
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
              <div className="relative h-48 bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <SafeIcon icon={FiPlay} size={48} className="text-white z-10 group-hover:scale-110 transition-transform" />
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(course.subject)}`}>
                    {course.subject}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">
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
                  <div className="text-2xl font-bold text-red-600">
                    NT$ {course.price}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <SafeIcon icon={FiPlay} size={16} />
                    <span>開始學習</span>
                  </motion.button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {course.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">找不到符合條件的師培課程</h3>
            <p className="text-gray-500">請嘗試調整搜尋條件</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TeacherTrainingCoursePage;