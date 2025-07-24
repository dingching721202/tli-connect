'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Calendar from './Calendar';
import CourseSelection from './CourseSelection';
import SelectedCourses from './SelectedCourses';

interface BookingCourse {
  id: number;
  title: string;
  date: string;
  timeSlot: string;
  teacher: string;
  price: number;
  description: string;
  capacity: number | undefined;
  reserved_count: number | undefined;
  status: 'CREATED' | 'CANCELED' | 'AVAILABLE';
  timeslot_id: number;
}
import { bookingService } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import SafeIcon from './common/SafeIcon';
import { FiLoader, FiFilter, FiCheck } from 'react-icons/fi';
import { 
  generateBookingSessions, 
  getCourseFilters, 
  filterBookingSessions,
  CourseFilter,
  BookingCourseSession
} from '@/data/courseBookingIntegration';

const BookingSystem: React.FC = () => {
  const { user, hasActiveMembership } = useAuth();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 1)); // July 2025
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<BookingCourse[]>([]);
  const [availableCourses, setAvailableCourses] = useState<BookingCourse[]>([]);
  
  // 新增課程篩選相關狀態
  const [courseFilters, setCourseFilters] = useState<CourseFilter[]>([]);
  const [managedCourseSessions, setManagedCourseSessions] = useState<BookingCourseSession[]>([]);
  const [showCourseSelection, setShowCourseSelection] = useState(false);
  const [loading, setLoading] = useState(true);

  // 載入課程時段資料 (US05)
  useEffect(() => {
    const loadTimeslots = async () => {
      try {
        setLoading(true);
        
        // 只載入課程模組的數據
        const managedSessions = generateBookingSessions();
        const filters = getCourseFilters();
        
        // 載入課程模組的數據
        setManagedCourseSessions(managedSessions);
        setCourseFilters(filters);
      } catch (error) {
        console.error('載入課程時段失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTimeslots();
  }, []);


  // 將課程模組的 BookingCourseSession 轉換為 BookingCourse 格式
  const convertManagedSessionsToCourses = (sessions: BookingCourseSession[]): BookingCourse[] => {
    return sessions.map(session => ({
      id: parseInt(session.id.split('_')[0]) || 0,
      title: `${session.courseTitle} ${session.sessionTitle}`,
      date: session.date,
      timeSlot: `${session.startTime}-${session.endTime}`,
      teacher: session.teacherName,
      price: session.price,
      description: `${session.courseTitle} - 第${session.sessionNumber}課`,
      capacity: session.capacity,
      reserved_count: session.currentEnrollments,
      status: session.status === 'available' ? 'CREATED' : 'CANCELED',
      timeslot_id: parseInt(session.id.replace(/\D/g, '')) || 0
    }));
  };

  // 處理課程篩選
  const handleCourseFilterToggle = (courseId: string) => {
    setCourseFilters(prev => 
      prev.map(filter => 
        filter.id === courseId 
          ? { ...filter, selected: !filter.selected }
          : filter
      )
    );
  };

  // 獲取篩選後的課程
  const getFilteredCourses = () => {
    const selectedCourseIds = courseFilters
      .filter(filter => filter.selected)
      .map(filter => filter.id);
    
    const filteredManagedSessions = filterBookingSessions(managedCourseSessions, selectedCourseIds);
    const filteredManagedCourses = convertManagedSessionsToCourses(filteredManagedSessions);
    
    return filteredManagedCourses;
  };

  const handleDateSelect = (date: Date, specificCourse?: BookingCourse) => {
    setSelectedDate(date);
    const dateStr = date.toISOString().split('T')[0];
    
    // 篩選該日期的可預約課程時段 (US05)
    const filteredCourses = getFilteredCourses();
    const coursesForDate = filteredCourses.filter(course => {
      if (course.date !== dateStr) return false;
      
      const courseWithStatus = course;
      
      // 檢查時段狀態和容量 (US05.1)
      if (courseWithStatus.status !== 'CREATED') return false;
      if ((courseWithStatus.reserved_count || 0) >= (courseWithStatus.capacity || 0)) return false;
      
      // 檢查是否在24小時內 (US05.3)
      const courseDateTime = new Date(`${course.date} ${course.timeSlot.split('-')[0]}`);
      const now = new Date();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (courseDateTime.getTime() - now.getTime() <= twentyFourHours) return false;
      
      return true;
    });
    
    setAvailableCourses(coursesForDate);
    setShowCourseSelection(coursesForDate.length > 0);

    // If a specific course was clicked, auto-select it
    if (specificCourse) {
      const courseKey = `${specificCourse.id}-${specificCourse.timeSlot}`;
      const isSelected = selectedCourses.some(c => `${c.id}-${c.timeSlot}` === courseKey);
      
      if (!isSelected) {
        setSelectedCourses(prev => [...prev, specificCourse]);
      }
    }
  };

  const handleCourseSelect = (course: BookingCourse) => {
    const courseKey = `${course.id}-${course.timeSlot}`;
    const isSelected = selectedCourses.some(c => `${c.id}-${c.timeSlot}` === courseKey);
    
    if (isSelected) {
      setSelectedCourses(prev => prev.filter(c => `${c.id}-${c.timeSlot}` !== courseKey));
    } else {
      setSelectedCourses(prev => [...prev, course]);
    }
  };

  const handleCourseToggle = (course: BookingCourse) => {
    const courseKey = `${course.id}-${course.timeSlot}`;
    setSelectedCourses(prev => prev.filter(c => `${c.id}-${c.timeSlot}` !== courseKey));
  };

  const handleRemoveCourse = (courseToRemove: BookingCourse) => {
    const courseKey = `${courseToRemove.id}-${courseToRemove.timeSlot}`;
    setSelectedCourses(prev => prev.filter(c => `${c.id}-${c.timeSlot}` !== courseKey));
  };

  // 批量預約功能 (US06)
  const handleConfirmBooking = async () => {
    // Check if user is logged in
    if (!user) {
      alert('歡迎來到 TLI Connect！\n\n加入會員即可享受免費課程預約服務\n即將跳轉到會員方案頁面...');
      router.push('/membership');
      return;
    }

    // Check if user has membership for booking (US06.2)
    if (user.role === 'STUDENT' && !hasActiveMembership()) {
      alert('您需要有效的會員資格才能預約課程！\n\n即將跳轉到會員方案頁面...');
      router.push('/membership');
      return;
    }

    if (selectedCourses.length === 0) {
      alert('請選擇要預約的課程！');
      return;
    }

    try {
      
      // 提取 timeslot IDs (US06.1)
      const timeslotIds = selectedCourses.map(course => {
        const courseWithStatus = course;
        return courseWithStatus.timeslot_id;
      });

      // 呼叫批量預約 API (US06)
      const result = await bookingService.batchBooking(user.id, timeslotIds);
      
      // 顯示預約結果 (US06.6)
      let resultMessage = '';
      
      if (result.success.length > 0) {
        resultMessage += `🎉 成功預約 ${result.success.length} 堂課程：\n`;
        result.success.forEach(booking => {
          const course = selectedCourses.find(c => {
            const courseWithStatus = c;
            return courseWithStatus.timeslot_id === booking.timeslot_id;
          });
          if (course) {
            resultMessage += `✅ ${course.title} (${course.timeSlot})\n`;
          }
        });
      }

      if (result.failed.length > 0) {
        resultMessage += `\n❌ 無法預約 ${result.failed.length} 堂課程：\n`;
        result.failed.forEach(failure => {
          const course = selectedCourses.find(c => {
            const courseWithStatus = c;
            return courseWithStatus.timeslot_id === failure.timeslot_id;
          });
          if (course) {
            let reason = '';
            switch (failure.reason) {
              case 'FULL':
                reason = '已額滿';
                break;
              case 'WITHIN_24H':
                reason = '距開課少於24小時';
                break;
              case 'MEMBERSHIP_EXPIRED':
                reason = '會員資格已過期';
                break;
            }
            resultMessage += `❌ ${course.title} (${course.timeSlot}) - ${reason}\n`;
          }
        });
      }

      alert(resultMessage);

      // 清空已選課程並重新載入資料
      setSelectedCourses([]);
      setShowCourseSelection(false);
      
      // 重新載入課程模組資料以更新狀態
      const updatedManagedSessions = generateBookingSessions();
      setManagedCourseSessions(updatedManagedSessions);

    } catch (error) {
      console.error('預約失敗:', error);
      alert('預約過程中發生錯誤，請稍後再試');
    } finally {
    }
  };

  const handleCloseCourseSelection = () => {
    setShowCourseSelection(false);
    setSelectedDate(null);
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 sm:mb-10"
      >
        <motion.h1
          className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-3 tracking-tight"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          課程預約系統
        </motion.h1>
        <motion.p
          className="text-sm sm:text-base text-gray-600 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          瀏覽課程內容，{user && hasActiveMembership() ? '免費預約您感興趣的課程' : '加入會員開始學習之旅'} ✨
        </motion.p>

        {/* Membership Status */}
        {user?.role === 'STUDENT' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4"
          >
            {hasActiveMembership() ? (
              <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">會員資格有效 - 可免費預約課程</span>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-full border border-yellow-200">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">需要會員資格才能預約課程</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Stats bar */}
        {selectedCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 inline-flex items-center space-x-4 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-gray-200/60"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">已選擇 {selectedCourses.length} 門課程</span>
            </div>
            {user && hasActiveMembership() && (
              <div className="text-sm font-bold text-emerald-600">
                免費預約
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <SafeIcon icon={FiLoader} className="animate-spin text-blue-600 text-4xl mx-auto mb-4" />
          <p className="text-gray-600">載入課程時段中...</p>
        </div>
      ) : (
        /* Main Content */
        <div className="space-y-6">
          {/* 課程篩選界面 */}
          {courseFilters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <SafeIcon icon={FiFilter} className="mr-2 text-blue-600" />
                  課程篩選
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCourseFilters(prev => prev.map(f => ({ ...f, selected: true })))}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    全選
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => setCourseFilters(prev => prev.map(f => ({ ...f, selected: false })))}
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                  >
                    全不選
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {courseFilters.map(filter => (
                  <motion.div
                    key={filter.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCourseFilterToggle(filter.id)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      filter.selected
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{filter.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                            filter.category === '中文' ? 'bg-blue-100 text-blue-800' :
                            filter.category === '英文' ? 'bg-green-100 text-green-800' :
                            filter.category === '文化' ? 'bg-purple-100 text-purple-800' :
                            filter.category === '商業' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {filter.category}
                          </span>
                          <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                            filter.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                            filter.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {filter.difficulty === 'beginner' ? '初級' :
                             filter.difficulty === 'intermediate' ? '中級' : '高級'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-2">
                        {filter.selected ? (
                          <SafeIcon icon={FiCheck} className="text-blue-600" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                已選擇 {courseFilters.filter(f => f.selected).length} / {courseFilters.length} 門課程
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Calendar - Takes 2 columns on xl screens */}
            <div className="xl:col-span-2">
              <Calendar
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                onDateSelect={handleDateSelect}
                courses={getFilteredCourses()}
                selectedCourses={selectedCourses}
                onCourseToggle={handleCourseToggle}
              />
            </div>

        {/* Right Panel - Takes 1 column on xl screens */}
        <div className="space-y-6">
          {/* Course Selection Panel */}
          {showCourseSelection && (
            <CourseSelection
              selectedDate={selectedDate}
              availableCourses={availableCourses}
              selectedCourses={selectedCourses}
              onCourseSelect={handleCourseSelect}
              onClose={handleCloseCourseSelection}
            />
          )}

          {/* Selected Courses Panel */}
          <SelectedCourses
            selectedCourses={selectedCourses}
            onRemoveCourse={handleRemoveCourse}
            onConfirmBooking={handleConfirmBooking}
            showPrice={false} // Don't show price since courses are free for members
          />
        </div>
      </div>
        </div>
      )}

      {/* Student without membership notice */}
      {user?.role === 'STUDENT' && !hasActiveMembership() && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center"
        >
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">需要會員資格</h3>
          <p className="text-yellow-700 mb-4">
            您需要有效的會員資格才能預約課程。加入會員享受完整學習體驗！
          </p>
          <button
            onClick={() => router.push('/membership')}
            className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            選擇會員方案
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default BookingSystem;