'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Calendar from './Calendar';
import CourseSelection from './CourseSelection';
import SelectedCourses from './SelectedCourses';
import { Course } from '@/data/mockCourses';
import { timeslotService, bookingService } from '@/services/dataService';
import { ClassTimeslot } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import SafeIcon from './common/SafeIcon';
import { FiLoader } from 'react-icons/fi';

const BookingSystem: React.FC = () => {
  const { user, hasActiveMembership } = useAuth();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 1)); // July 2025
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [showCourseSelection, setShowCourseSelection] = useState(false);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  useState<ClassTimeslot[]>([]);
  const [loading, setLoading] = useState(true);
  useState(false);

  // 載入課程時段資料 (US05)
  useEffect(() => {
    const loadTimeslots = async () => {
      try {
        setLoading(true);
        const timeslots = await timeslotService.getAllTimeslots();
        
        // 轉換為現有的 Course 格式以保持相容性
        const courses = await convertTimeslotsToCourses(timeslots);
        setAllCourses(courses);
      } catch (error) {
        console.error('載入課程時段失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTimeslots();
  }, []);

  // 將 ClassTimeslot 轉換為 Course 格式
  const convertTimeslotsToCourses = async (timeslots: ClassTimeslot[]): Promise<Course[]> => {
    return timeslots.map(timeslot => {
      const startTime = new Date(timeslot.start_time);
      const endTime = new Date(timeslot.end_time);
      
      return {
        id: timeslot.id,
        title: `課程 ${timeslot.id}`, // 可以後續從關聯的課程資料取得
        date: startTime.toISOString().split('T')[0],
        timeSlot: `${startTime.toTimeString().slice(0, 5)}-${endTime.toTimeString().slice(0, 5)}`,
        instructor: '老師', // 可以後續從關聯的課程資料取得
        price: 0,
        description: `課程時段 ${timeslot.id}`,
        // 新增時段狀態資訊
        capacity: timeslot.capacity,
        reserved_count: timeslot.reserved_count,
        status: timeslot.status,
        timeslot_id: timeslot.id
      } as Course & { capacity: number; reserved_count: number; status: string; timeslot_id: number };
    });
  };

  const handleDateSelect = (date: Date, specificCourse?: Course) => {
    setSelectedDate(date);
    const dateStr = date.toISOString().split('T')[0];
    
    // 篩選該日期的可預約課程時段 (US05)
    const coursesForDate = allCourses.filter(course => {
      if (course.date !== dateStr) return false;
      
      const courseWithStatus = course as Course & { capacity: number; reserved_count: number; status: string; timeslot_id: number };
      
      // 檢查時段狀態和容量 (US05.1)
      if (courseWithStatus.status !== 'CREATED') return false;
      if (courseWithStatus.reserved_count >= courseWithStatus.capacity) return false;
      
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

  const handleCourseSelect = (course: Course) => {
    const courseKey = `${course.id}-${course.timeSlot}`;
    const isSelected = selectedCourses.some(c => `${c.id}-${c.timeSlot}` === courseKey);
    
    if (isSelected) {
      setSelectedCourses(prev => prev.filter(c => `${c.id}-${c.timeSlot}` !== courseKey));
    } else {
      setSelectedCourses(prev => [...prev, course]);
    }
  };

  const handleCourseToggle = (course: Course) => {
    const courseKey = `${course.id}-${course.timeSlot}`;
    setSelectedCourses(prev => prev.filter(c => `${c.id}-${c.timeSlot}` !== courseKey));
  };

  const handleRemoveCourse = (courseToRemove: Course) => {
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
        const courseWithStatus = course as Course & { timeslot_id: number };
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
            const courseWithStatus = c as Course & { timeslot_id: number };
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
            const courseWithStatus = c as Course & { timeslot_id: number };
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
      
      // 重新載入時段資料以更新狀態
      const timeslots = await timeslotService.getAllTimeslots();
      const courses = await convertTimeslotsToCourses(timeslots);
      setAllCourses(courses);

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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Calendar - Takes 2 columns on xl screens */}
          <div className="xl:col-span-2">
            <Calendar
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onDateSelect={handleDateSelect}
              courses={allCourses}
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