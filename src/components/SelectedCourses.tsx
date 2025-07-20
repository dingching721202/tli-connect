'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiCalendar, FiClock, FiUser, FiCheck } from 'react-icons/fi';
import { Course } from '@/data/mockCourses';
import { useAuth } from '@/contexts/AuthContext';
import SafeIcon from './common/SafeIcon';

interface SelectedCoursesProps {
  selectedCourses: Course[];
  onRemoveCourse: (course: Course) => void;
  onConfirmBooking: () => void;
  showPrice?: boolean;
}

const SelectedCourses: React.FC<SelectedCoursesProps> = ({
  selectedCourses,
  onRemoveCourse,
  onConfirmBooking,
  showPrice = false
}) => {
  const { user, hasActiveMembership } = useAuth();

  // Group courses by date and sort
  const groupedCourses = selectedCourses.reduce((groups, course) => {
    const date = course.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(course);
    return groups;
  }, {} as Record<string, Course[]>);

  // Sort dates and courses within each date
  const sortedDates = Object.keys(groupedCourses).sort();
  
  sortedDates.forEach(date => {
    groupedCourses[date].sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatLongDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const calculateTotal = () => {
    if (!showPrice || hasActiveMembership()) return 0;
    return selectedCourses.reduce((total, course) => total + course.price, 0);
  };

  const handleRemoveCourse = (course: Course) => {
    onRemoveCourse(course);
  };

  const isUserEligible = () => {
    return user && (user.role !== 'student' || hasActiveMembership());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-1">已選課程</h3>
            <p className="text-purple-100 text-sm">
              {selectedCourses.length === 0 
                ? '尚未選擇任何課程' 
                : `已選擇 ${selectedCourses.length} 堂課程`
              }
            </p>
          </div>
          
          {selectedCourses.length > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold">
                {selectedCourses.length}
              </div>
              <div className="text-purple-200 text-xs">
                堂課程
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Course List */}
      <div className="max-h-96 overflow-y-auto">
        {selectedCourses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 px-6"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiCalendar} size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium mb-2">尚未選擇課程</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              點擊日曆中的課程<br />
              或選擇日期後從課程清單中選擇
            </p>
          </motion.div>
        ) : (
          <div className="p-4 sm:p-6">
            <AnimatePresence>
              {sortedDates.map((date) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6 last:mb-0"
                >
                  {/* Date Header */}
                  <div className="flex items-center mb-3">
                    <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      {formatDate(date)}
                    </div>
                    <div className="h-px bg-gray-200 flex-1 ml-3"></div>
                  </div>

                  {/* Courses for this date */}
                  <div className="space-y-3">
                    {groupedCourses[date].map((course, index) => (
                      <motion.div
                        key={`${course.id}-${course.timeSlot}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 mb-2">
                              {course.title}
                            </h5>
                            
                            <div className="space-y-1 mb-3">
                              <div className="flex items-center text-sm text-gray-600">
                                <SafeIcon icon={FiClock} size={14} className="mr-2" />
                                <span>{course.timeSlot}</span>
                              </div>
                              
                              <div className="flex items-center text-sm text-gray-600">
                                <SafeIcon icon={FiUser} size={14} className="mr-2" />
                                <span>{course.instructor}</span>
                              </div>
                            </div>

                            {showPrice && (
                              <div className="text-right">
                                <span className="text-lg font-bold text-purple-600">
                                  {course.price === 0 || hasActiveMembership() 
                                    ? '免費' 
                                    : `NT$ ${course.price.toLocaleString()}`
                                  }
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Remove Button */}
                          <motion.button
                            onClick={() => handleRemoveCourse(course)}
                            className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            title="移除課程"
                          >
                            <SafeIcon icon={FiTrash2} size={16} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer / Booking Summary */}
      {selectedCourses.length > 0 && (
        <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
          {/* Total Price (if applicable) */}
          {showPrice && calculateTotal() > 0 && (
            <div className="flex items-center justify-between mb-4 p-3 bg-white rounded-lg border">
              <span className="text-sm font-medium text-gray-600">總計</span>
              <span className="text-xl font-bold text-purple-600">
                NT$ {calculateTotal().toLocaleString()}
              </span>
            </div>
          )}

          {/* Membership Benefits Notice */}
          {user?.role === 'student' && hasActiveMembership() && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center text-green-800">
                <SafeIcon icon={FiCheck} size={16} className="mr-2" />
                <span className="text-sm font-medium">
                  會員福利：所有課程免費預約
                </span>
              </div>
            </div>
          )}

          {/* Course Summary */}
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">預約摘要：</div>
            <div className="space-y-1">
              {sortedDates.map(date => (
                <div key={date} className="text-sm text-gray-800">
                  <span className="font-medium">{formatLongDate(date)}：</span>
                  <span className="ml-1">{groupedCourses[date].length} 堂課程</span>
                </div>
              ))}
            </div>
          </div>

          {/* Confirm Button */}
          <motion.button
            onClick={onConfirmBooking}
            disabled={!isUserEligible()}
            className={`
              w-full py-3 px-6 rounded-lg font-semibold text-center transition-all
              ${isUserEligible()
                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
            whileHover={isUserEligible() ? { scale: 1.02 } : {}}
            whileTap={isUserEligible() ? { scale: 0.98 } : {}}
          >
            {!user 
              ? '請先登入以完成預約' 
              : user.role === 'student' && !hasActiveMembership()
                ? '需要會員資格才能預約'
                : `確認預約 ${selectedCourses.length} 堂課程`
            }
          </motion.button>

          {/* User Status Info */}
          {!isUserEligible() && (
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">
                {!user 
                  ? '登入後即可享受完整預約功能'
                  : '購買會員方案享受免費課程預約'
                }
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default SelectedCourses;