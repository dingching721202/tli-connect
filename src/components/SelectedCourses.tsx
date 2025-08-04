'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiCalendar, FiCheck, FiCreditCard, FiLogIn } from 'react-icons/fi';
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
import { useAuth } from '@/contexts/AuthContext';
import SafeIcon from './common/SafeIcon';
import { useRouter } from 'next/navigation';

interface SelectedCoursesProps {
  selectedCourses: BookingCourse[];
  onRemoveCourse: (course: BookingCourse) => void;
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
  const router = useRouter();

  // Group courses by date and sort
  const groupedCourses = selectedCourses.reduce((groups, course) => {
    const date = course.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(course);
    return groups;
  }, {} as Record<string, BookingCourse[]>);

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

  const handleRemoveCourse = (course: BookingCourse) => {
    onRemoveCourse(course);
  };

  const isUserEligible = () => {
    return user && (!user.roles.includes('STUDENT') || hasActiveMembership());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-1">已選課程</h3>
            <p className="text-blue-100 text-sm">
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
              <div className="text-blue-200 text-xs">
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
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {formatDate(date)}
                    </div>
                    <div className="h-px bg-gray-200 flex-1 ml-3"></div>
                  </div>

                  {/* Courses for this date */}
                  <div className="space-y-3">
                    {groupedCourses[date].map((course, index) => (
                      <motion.div
                        key={course.sessionId || `${course.id}-${course.timeslot_id}-${course.date}-${course.timeSlot}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="space-y-1 mb-2">
                              {/* 課程名稱 */}
                              <h5 className="font-semibold text-gray-900">
                                {course.courseTitle || course.title}
                              </h5>
                              {/* Lesson 編號 + 詳細標題 */}
                              {course.sessionTitle && (
                                <div className="text-sm text-gray-600">
                                  Lesson {course.sessionNumber || 1} - {course.sessionTitle}
                                </div>
                              )}
                              {/* 時間 */}
                              <div className="text-sm text-gray-600">
                                {course.timeSlot}
                              </div>
                              {/* 教師 */}
                              <div className="text-sm text-gray-600">
                                {course.teacher}
                              </div>
                            </div>

                            {showPrice && (
                              <div className="text-right">
                                <span className="text-lg font-bold text-blue-600">
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
              <span className="text-xl font-bold text-blue-600">
                NT$ {calculateTotal().toLocaleString()}
              </span>
            </div>
          )}

          {/* Membership Benefits Notice */}
          {user?.roles.includes('STUDENT') && hasActiveMembership() && (
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

          {/* Action Buttons */}
          {isUserEligible() ? (
            <motion.button
              onClick={onConfirmBooking}
              className="w-full py-3 px-6 rounded-lg font-semibold text-center transition-all bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              確認預約 {selectedCourses.length} 堂課程
            </motion.button>
          ) : !user ? (
            /* 訪客狀態 - 顯示購買會員和登入按鈕 */
            <div className="space-y-3">
              <motion.button
                onClick={() => router.push('/membership')}
                className="w-full py-3 px-6 rounded-lg font-semibold text-center transition-all bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SafeIcon icon={FiCreditCard} className="mr-2" />
                購買會員方案
              </motion.button>
              <motion.button
                onClick={() => router.push('/login')}
                className="w-full py-2 px-6 rounded-lg font-medium text-center transition-all bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SafeIcon icon={FiLogIn} className="mr-2" />
                已有帳號？登入
              </motion.button>
            </div>
          ) : (
            /* 已登入但無會員資格 - 顯示購買會員按鈕 */
            <motion.button
              onClick={() => router.push('/membership')}
              className="w-full py-3 px-6 rounded-lg font-semibold text-center transition-all bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SafeIcon icon={FiCreditCard} className="mr-2" />
              購買會員方案享受免費預約
            </motion.button>
          )}

          {/* Status Info */}
          {!isUserEligible() && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-blue-800 font-medium mb-1">
                  {!user 
                    ? '成為會員享受完整預約功能'
                    : '升級會員資格'
                  }
                </p>
                <p className="text-xs text-blue-600">
                  {!user 
                    ? '免費課程預約 • 專業師資指導 • 學習影片觀看'
                    : '立即購買會員方案，享受免費課程預約服務'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default SelectedCourses;