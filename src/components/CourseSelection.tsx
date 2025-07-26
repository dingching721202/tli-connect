'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiClock, FiUser, FiBook } from 'react-icons/fi';
interface BookingCourse {
  id: number;
  title: string;
  courseTitle?: string;   // 課程名稱（班名）
  sessionTitle?: string;  // 課次標題
  sessionNumber?: number; // 課次編號（Lesson N 的 N）
  date: string;
  timeSlot: string;
  teacher: string;
  price: number;
  description: string;
  capacity: number | undefined;
  reserved_count: number | undefined;
  status: 'CREATED' | 'CANCELED' | 'AVAILABLE';
  timeslot_id: number;
  bookingStatus?: 'available' | 'full' | 'locked' | 'cancelled' | 'booked'; // US05新增：預約狀態，US06新增：已預約狀態
  disabledReason?: string; // US05新增：不可預約原因
  sessionId?: string; // 完整的session ID用於選擇邏輯
}
import SafeIcon from './common/SafeIcon';

interface CourseSelectionProps {
  selectedDate: Date | null;
  availableCourses: BookingCourse[];
  selectedCourses: BookingCourse[];
  onCourseSelect: (course: BookingCourse) => void;
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

  const isCourseSelected = (course: BookingCourse) => {
    return selectedCourses.some(sc => 
      (sc.sessionId || `${sc.id}-${sc.timeslot_id}-${sc.date}-${sc.timeSlot}`) === (course.sessionId || `${course.id}-${course.timeslot_id}-${course.date}-${course.timeSlot}`)
    );
  };

  const handleCourseClick = (course: BookingCourse) => {
    // 只允許選擇可預約的課程 (US05)
    if (course.bookingStatus !== 'available') {
      return;
    }
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
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-1">選擇課程</h3>
              <p className="text-blue-100 text-sm">
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
                課程列表 ({availableCourses.length}堂)
              </h4>
              {availableCourses.map((course, index) => {
                const isSelected = isCourseSelected(course);
                const isDisabled = course.bookingStatus !== 'available';
                
                // 根據課程狀態設置樣式 (US05, US06)
                const getCardStyle = () => {
                  if (course.bookingStatus === 'booked') {
                    // US06: 已預約的課程顯示為綠色
                    return 'border-green-400 bg-green-100 cursor-not-allowed';
                  } else if (isDisabled) {
                    return 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60';
                  }
                  return isSelected 
                    ? 'border-blue-500 bg-blue-50 cursor-pointer' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer';
                };
                
                return (
                  <motion.div
                    key={course.sessionId || `${course.id}-${course.timeslot_id}-${course.date}-${course.timeSlot}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-200
                      ${getCardStyle()}
                    `}
                    onClick={() => handleCourseClick(course)}
                    whileHover={!isDisabled ? { scale: 1.02 } : {}}
                    whileTap={!isDisabled ? { scale: 0.98 } : {}}
                    title={isDisabled ? course.disabledReason : undefined}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="space-y-1">
                            {/* 課程名稱 */}
                            <h5 className={`
                              font-semibold text-base
                              ${isSelected ? 'text-blue-800' : isDisabled ? 'text-gray-500' : 'text-gray-900'}
                            `}>
                              {course.courseTitle || course.title}
                            </h5>
                            {/* Lesson 編號 + 詳細標題 */}
                            {course.sessionTitle && (
                              <div className={`
                                text-sm
                                ${isSelected ? 'text-blue-700' : isDisabled ? 'text-gray-400' : 'text-gray-600'}
                              `}>
                                Lesson {course.sessionNumber || 1} - {course.sessionTitle}
                              </div>
                            )}
                          </div>
                          {/* US05: 狀態標誌 */}
                          {course.bookingStatus && course.bookingStatus !== 'available' && (
                            <span className={`
                              text-xs px-2 py-1 rounded-full font-medium
                              ${course.bookingStatus === 'full' ? 'bg-gray-200 text-gray-600' :
                                course.bookingStatus === 'locked' ? 'bg-gray-300 text-gray-700' :
                                'bg-red-200 text-red-600'}
                            `}>
                              {course.bookingStatus === 'full' ? '已額滿' :
                               course.bookingStatus === 'locked' ? '24h鎖定' :
                               '已取消'}
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <SafeIcon icon={FiClock} size={14} className="mr-2" />
                            <span>{course.timeSlot}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <SafeIcon icon={FiUser} size={14} className="mr-2" />
                            <span>{course.teacher}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Selection Indicator - 只有可預約的課程顯示 (US05) */}
                      {!isDisabled && (
                        <div className={`
                          ml-4 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center
                          ${isSelected 
                            ? 'border-blue-500 bg-blue-500' 
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
                      )}
                    </div>
                    
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

      </motion.div>
    </AnimatePresence>
  );
};

export default CourseSelection;