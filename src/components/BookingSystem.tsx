'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Calendar from './Calendar';
import CourseSelection from './CourseSelection';
import SelectedCourses from './SelectedCourses';
import { Course } from '@/data/mockCourses';
import { convertToBookingCourses, getCoursesByDate } from '@/data/courseData';
import { useAuth } from '@/contexts/AuthContext';

const BookingSystem: React.FC = () => {
  const { user, hasActiveMembership } = useAuth();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 1)); // June 2025
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [showCourseSelection, setShowCourseSelection] = useState(false);
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  // 載入課程數據
  React.useEffect(() => {
    const loadCourses = () => {
      const courses = convertToBookingCourses();
      setAllCourses(courses);
    };
    loadCourses();
  }, []);

  const handleDateSelect = (date: Date, specificCourse?: Course) => {
    setSelectedDate(date);
    const dateStr = date.toISOString().split('T')[0];
    const coursesForDate = getCoursesByDate(dateStr);
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

  const handleConfirmBooking = () => {
    // Check if user is logged in
    if (!user) {
      alert('請先登入才能預約課程！');
      router.push('/login');
      return;
    }

    // Check if user has membership for booking
    if (user.role === 'student' && !hasActiveMembership()) {
      alert('您需要有效的會員資格才能預約課程！\n\n即將跳轉到會員方案頁面...');
      router.push('/membership');
      return;
    }

    // Proceed with booking
    alert(`🎉 已成功預約 ${selectedCourses.length} 門課程！\n\n📚 感謝您的選擇，期待與您在課堂上見面！`);
    setSelectedCourses([]);
    setShowCourseSelection(false);
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
          className="text-3xl sm:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4 tracking-tight"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          課程預約系統
        </motion.h1>
        <motion.p
          className="text-base sm:text-lg text-gray-600 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          瀏覽課程內容，{user && hasActiveMembership() ? '免費預約您感興趣的課程' : '加入會員開始學習之旅'} ✨
        </motion.p>

        {/* Membership Status */}
        {user?.role === 'student' && (
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

      {/* Main Content */}
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

      {/* Non-member Notice */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-2">想要預約課程？</h3>
          <p className="text-blue-700 mb-4">
            登入並加入會員即可享受完整學習體驗，包含免費課程預約、學習影片觀看等豐富內容
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/login')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              立即登入
            </button>
            <button
              onClick={() => router.push('/membership')}
              className="bg-white text-blue-600 px-6 py-2 rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors"
            >
              查看會員方案
            </button>
          </div>
        </motion.div>
      )}

      {/* Student without membership notice */}
      {user?.role === 'student' && !hasActiveMembership() && (
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