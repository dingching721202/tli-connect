'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiClock, FiUser, FiMapPin, FiCheck, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';

interface BookingCourse {
  id: number;
  title: string;
  courseTitle?: string;
  sessionTitle?: string;
  sessionNumber?: number;
  date: string;
  timeSlot: string;
  teacher: string;
  price: number;
  description: string;
  capacity: number | undefined;
  reserved_count: number | undefined;
  status: 'CREATED' | 'CANCELED' | 'AVAILABLE';
  timeslot_id: number;
  bookingStatus?: 'available' | 'full' | 'locked' | 'cancelled' | 'booked';
  disabledReason?: string;
  sessionId?: string;
}

interface CourseListViewProps {
  courses: BookingCourse[];
  selectedCourses: BookingCourse[];
  onCourseToggle: (course: BookingCourse) => void;
  onDateSelect: (date: Date, course?: BookingCourse) => void;
}

const CourseListView: React.FC<CourseListViewProps> = ({
  courses,
  selectedCourses,
  onCourseToggle,
  onDateSelect
}) => {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  // 按日期分組課程
  const coursesByDate = useMemo(() => {
    const grouped = courses.reduce((acc, course) => {
      if (!acc[course.date]) {
        acc[course.date] = [];
      }
      acc[course.date].push(course);
      return acc;
    }, {} as Record<string, BookingCourse[]>);

    // 按日期排序
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .reduce((acc, [date, courses]) => {
        // 每個日期內的課程按時間排序
        acc[date] = courses.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
        return acc;
      }, {} as Record<string, BookingCourse[]>);
  }, [courses]);

  const toggleDateExpansion = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const handleCourseClick = (course: BookingCourse, date: string) => {
    if (course.bookingStatus !== 'available') {
      return;
    }

    const isCourseSelected = selectedCourses.some(
      sc => (sc.sessionId || `${sc.id}-${sc.timeSlot}`) === (course.sessionId || `${course.id}-${course.timeSlot}`)
    );

    if (isCourseSelected) {
      onCourseToggle(course);
    } else {
      const dateObj = new Date(date);
      onDateSelect(dateObj, course);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const dayNames = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    const dayOfWeek = dayNames[date.getDay()];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const isToday = date.toDateString() === today.toDateString();
    
    return {
      formatted: `${month}月${day}日 ${dayOfWeek}`,
      isToday
    };
  };

  const getCourseColor = (course: BookingCourse) => {
    if (course.bookingStatus === 'booked') {
      return 'bg-green-50 border-green-200 text-green-900';
    }
    if (course.bookingStatus === 'full') {
      return 'bg-gray-50 border-gray-200 text-gray-500';
    }
    if (course.bookingStatus === 'locked') {
      return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    }
    if (course.bookingStatus === 'cancelled') {
      return 'bg-red-50 border-red-200 text-red-500';
    }

    const isSelected = selectedCourses.some(sc => 
      (sc.sessionId || `${sc.id}-${sc.timeSlot}`) === (course.sessionId || `${course.id}-${course.timeSlot}`)
    );

    return isSelected 
      ? 'bg-blue-50 border-blue-200 text-blue-900 ring-2 ring-blue-300' 
      : 'bg-white border-gray-200 text-gray-900 hover:bg-blue-50 hover:border-blue-200';
  };

  const getStatusIcon = (course: BookingCourse) => {
    if (course.bookingStatus === 'booked') {
      return <span className="text-green-600 text-sm font-medium">✓ 已預約</span>;
    }
    if (course.bookingStatus === 'full') {
      return <span className="text-gray-500 text-sm">額滿</span>;
    }
    if (course.bookingStatus === 'locked') {
      return <span className="text-yellow-600 text-sm">🔒 鎖定</span>;
    }
    if (course.bookingStatus === 'cancelled') {
      return <span className="text-red-500 text-sm line-through">已取消</span>;
    }

    const isSelected = selectedCourses.some(sc => 
      (sc.sessionId || `${sc.id}-${sc.timeSlot}`) === (course.sessionId || `${course.id}-${course.timeSlot}`)
    );

    return isSelected ? (
      <span className="text-blue-600 text-sm font-medium">✓ 已選擇</span>
    ) : (
      <span className="text-gray-400 text-sm">點擊選擇</span>
    );
  };

  if (Object.keys(coursesByDate).length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center"
      >
        <SafeIcon icon={FiCalendar} className="text-gray-400 text-6xl mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">沒有可用的課程</h3>
        <p className="text-gray-600">目前沒有符合篩選條件的課程，請調整篩選設定或稍後再試。</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center">
          <SafeIcon icon={FiCalendar} size={24} className="mr-2" />
          課程列表
        </h2>
        <p className="text-blue-100 mt-1">共 {courses.length} 個課程時段</p>
      </div>

      {/* Course List */}
      <div className="max-h-[600px] overflow-y-auto">
        {Object.entries(coursesByDate).map(([date, dateCourses], index) => {
          const { formatted: dateFormatted, isToday } = formatDate(date);
          const isExpanded = expandedDates.has(date);
          const courseCount = dateCourses.length;

          return (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border-b border-gray-100 last:border-b-0"
            >
              {/* Date Header */}
              <button
                onClick={() => toggleDateExpansion(date)}
                className={`w-full px-4 sm:px-6 py-4 text-left hover:bg-gray-50 transition-colors ${
                  isToday ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${isToday ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <h3 className={`font-semibold ${isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                        {dateFormatted}
                        {isToday && <span className="ml-2 text-blue-600 text-sm">(今天)</span>}
                      </h3>
                      <p className="text-sm text-gray-600">{courseCount} 個課程時段</p>
                    </div>
                  </div>
                  <SafeIcon 
                    icon={isExpanded ? FiChevronUp : FiChevronDown} 
                    className="text-gray-400" 
                  />
                </div>
              </button>

              {/* Course Items */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="pb-4"
                  >
                    {dateCourses.map((course, courseIndex) => (
                      <motion.div
                        key={course.sessionId || `${course.id}-${course.timeSlot}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: courseIndex * 0.05 }}
                        className={`mx-4 sm:mx-6 mb-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${getCourseColor(course)} ${
                          course.bookingStatus === 'available' ? 'hover:scale-[1.01]' : 'cursor-not-allowed'
                        }`}
                        onClick={() => handleCourseClick(course, date)}
                        whileHover={course.bookingStatus === 'available' ? { scale: 1.01 } : {}}
                        whileTap={course.bookingStatus === 'available' ? { scale: 0.99 } : {}}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            {/* Course Title */}
                            <h4 className="font-semibold text-lg leading-tight mb-2">
                              {course.courseTitle || course.title}
                            </h4>
                            
                            {/* Session Info */}
                            <div className="flex items-center space-x-4 text-sm mb-3">
                              <div className="flex items-center space-x-1">
                                <SafeIcon icon={FiCalendar} size={14} />
                                <span>Lesson {course.sessionNumber || 1}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <SafeIcon icon={FiClock} size={14} />
                                <span>{course.timeSlot}</span>
                              </div>
                              {course.teacher && course.teacher !== '老師' && course.teacher !== '未指定' && (
                                <div className="flex items-center space-x-1">
                                  <SafeIcon icon={FiUser} size={14} />
                                  <span>{course.teacher}</span>
                                </div>
                              )}
                            </div>

                            {/* Capacity Info */}
                            {course.capacity && (
                              <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                                <SafeIcon icon={FiMapPin} size={14} />
                                <span>
                                  {course.reserved_count || 0}/{course.capacity} 人
                                  {course.bookingStatus === 'full' && ' (已額滿)'}
                                </span>
                              </div>
                            )}

                            {/* Disabled Reason */}
                            {course.disabledReason && course.bookingStatus !== 'available' && (
                              <p className="text-sm text-gray-500 italic">
                                {course.disabledReason}
                              </p>
                            )}
                          </div>

                          {/* Status and Selection */}
                          <div className="flex flex-col items-end space-y-2 ml-4">
                            {getStatusIcon(course)}
                            {course.bookingStatus === 'available' && (
                              <div className="w-6 h-6 rounded-full border-2 border-blue-300 flex items-center justify-center">
                                {selectedCourses.some(sc => 
                                  (sc.sessionId || `${sc.id}-${sc.timeSlot}`) === (course.sessionId || `${course.id}-${course.timeSlot}`)
                                ) && (
                                  <SafeIcon icon={FiCheck} size={14} className="text-blue-600" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>今日</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded-md"></div>
            <span>可預約</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-50 border-2 border-blue-300 rounded-md"></div>
            <span>已選課程</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-50 border border-green-300 rounded-md"></div>
            <span>已預約</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-50 border border-gray-300 rounded-md"></div>
            <span>已額滿</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseListView;