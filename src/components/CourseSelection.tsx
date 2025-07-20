'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiClock, FiUser, FiBook } from 'react-icons/fi';
import { Course } from '@/data/mockCourses';
import SafeIcon from './common/SafeIcon';

interface CourseSelectionProps {
  selectedDate: Date | null;
  availableCourses: Course[];
  selectedCourses: Course[];
  onCourseSelect: (course: Course) => void;
  onClose: () => void;
}

const CourseSelection: React.FC<CourseSelectionProps> = ({
  selectedDate,
  availableCourses,
  selectedCourses,
  onCourseSelect,
  onClose
}) => {
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const isCourseSelected = (course: Course) => {
    return selectedCourses.some(sc => 
      `${sc.id}-${sc.timeSlot}` === `${course.id}-${course.timeSlot}`
    );
  };

  const handleCourseClick = (course: Course) => {
    onCourseSelect(course);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-1">選擇課程</h3>
              <p className="text-emerald-100 text-sm">
                {formatDate(selectedDate)}
              </p>
            </div>
            <motion.button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <SafeIcon icon={FiX} size={20} />
            </motion.button>
          </div>
        </div>

        {/* Course List */}
        <div className="p-4 sm:p-6">
          {availableCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiBook} size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium mb-2">此日期沒有可用課程</p>
              <p className="text-gray-400 text-sm">請選擇其他日期查看課程</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-600 mb-4">
                可用課程 ({availableCourses.length}堂)
              </h4>
              {availableCourses.map((course, index) => {
                const isSelected = isCourseSelected(course);
                
                return (
                  <motion.div
                    key={`${course.id}-${course.timeSlot}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                      }
                    `}
                    onClick={() => handleCourseClick(course)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className={`
                          font-semibold text-base mb-2
                          ${isSelected ? 'text-emerald-800' : 'text-gray-900'}
                        `}>
                          {course.title}
                        </h5>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <SafeIcon icon={FiClock} size={14} className="mr-2" />
                            <span>{course.timeSlot}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <SafeIcon icon={FiUser} size={14} className="mr-2" />
                            <span>{course.instructor}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                          {course.description}
                        </p>
                      </div>
                      
                      {/* Selection Indicator */}
                      <div className={`
                        ml-4 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center
                        ${isSelected 
                          ? 'border-emerald-500 bg-emerald-500' 
                          : 'border-gray-300'
                        }
                      `}>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-3 h-3 bg-white rounded-full"
                          />
                        )}
                      </div>
                    </div>
                    
                    {/* Course Price Display (even if free) */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">課程費用</span>
                        <span className={`
                          text-lg font-bold
                          ${isSelected ? 'text-emerald-600' : 'text-gray-900'}
                        `}>
                          {course.price === 0 ? '會員免費' : `NT$ ${course.price.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {availableCourses.length > 0 && (
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="bg-emerald-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-800">
                    已選擇 {selectedCourses.filter(sc => 
                      availableCourses.some(ac => 
                        `${ac.id}-${ac.timeSlot}` === `${sc.id}-${sc.timeSlot}`
                      )
                    ).length} / {availableCourses.length} 堂課程
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    點擊課程卡片來選擇或取消選擇
                  </p>
                </div>
                <motion.button
                  onClick={onClose}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  完成選擇
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default CourseSelection;