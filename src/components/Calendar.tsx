'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';
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

interface CalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onDateSelect: (date: Date, course?: BookingCourse) => void;
  courses: BookingCourse[];
  selectedCourses: BookingCourse[];
  onCourseToggle: (course: BookingCourse) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  currentDate,
  onDateChange,
  onDateSelect,
  courses,
  selectedCourses,
  onCourseToggle
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const today = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const startOfCalendar = new Date(startOfMonth);
  startOfCalendar.setDate(startOfCalendar.getDate() - startOfCalendar.getDay());

  const calendarDates = [];
  const current = new Date(startOfCalendar);
  
  for (let i = 0; i < 42; i++) {
    calendarDates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentMonth - 1);
    } else {
      newDate.setMonth(currentMonth + 1);
    }
    onDateChange(newDate);
  };

  const getCoursesByDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return courses.filter(course => course.date === dateStr);
  };

  const isDateToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isDateInCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth;
  };


  const handleDateClick = (date: Date, event: React.MouseEvent) => {
    // Check if clicking on empty space, date number, or the cell itself
    if (event.target === event.currentTarget || 
        (event.target as HTMLElement).closest('.date-number') || 
        (event.target as HTMLElement).closest('.cell-empty-area')) {
      const coursesForDate = getCoursesByDate(date);
      if (coursesForDate.length > 0) {
        onDateSelect(date);
      }
    }
  };

  const handleCourseClick = (course: BookingCourse, date: Date, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // 不可預約的課程和已預約的課程不允許點擊 (US05, US06)
    if (course.bookingStatus !== 'available') {
      return;
    }
    
    // Check if course is already selected
    const isCourseSelected = selectedCourses.some(
      sc => (sc.sessionId || `${sc.id}-${sc.timeSlot}`) === (course.sessionId || `${course.id}-${course.timeSlot}`)
    );
    
    if (isCourseSelected) {
      // If selected, toggle (remove) it directly
      onCourseToggle(course);
    } else {
      // If not selected, open course selection panel and auto-select
      onDateSelect(date, course);
    }
  };

  const handleMoreClick = (date: Date, event: React.MouseEvent) => {
    event.stopPropagation();
    onDateSelect(date);
  };

  const renderCourseItem = (course: BookingCourse, date: Date, index: number) => {
    const isSelected = selectedCourses.some(sc => 
      (sc.sessionId || `${sc.id}-${sc.timeSlot}`) === (course.sessionId || `${course.id}-${course.timeSlot}`)
    );

    // 直接使用分離的欄位顯示課程信息
    const courseName = course.courseTitle || course.title;

    // 根據課程狀態設置統一顏色 (US05, US06)
    const getCourseColor = () => {
      // US06.7: 已預約的課程顯示為綠色
      if (course.bookingStatus === 'booked') {
        return 'bg-green-500 text-white cursor-default';
      }
      
      // US05.2 & US05.3: 不可預約的課程顯示為灰色
      if (course.bookingStatus === 'full') {
        return 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60';
      } else if (course.bookingStatus === 'locked') {
        return 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-70';
      } else if (course.bookingStatus === 'cancelled') {
        return 'bg-red-200 text-red-600 cursor-not-allowed line-through opacity-50';
      }
      
      // 可預約的課程統一使用藍色系
      return isSelected 
        ? 'bg-blue-500 text-white' 
        : 'bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer';
    };

    return (
      <motion.div
        key={course.sessionId || `${course.id}-${course.timeslot_id}-${course.date}-${course.timeSlot}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`
          text-xs px-2 py-2 rounded-md transition-all duration-200 flex flex-col 
          ${getCourseColor()}
          ${isMobile ? 'mb-1' : 'mb-0.5'}
          shadow-sm border border-opacity-20 border-gray-400
        `}
        onClick={(e) => handleCourseClick(course, date, e)}
        whileHover={course.bookingStatus === 'available' ? { scale: 1.02 } : {}}
        whileTap={course.bookingStatus === 'available' ? { scale: 0.98 } : {}}
        title={
          course.bookingStatus !== 'available' 
            ? `${course.title} - ${course.teacher} - ${course.timeSlot} (${course.disabledReason || '不可預約'})`
            : `${course.title} - ${course.teacher} - ${course.timeSlot}`
        }
      >
        {/* 課程名稱（班名） */}
        <div className="font-medium text-xs leading-tight mb-1">
          {courseName}
        </div>
        
        {/* Lesson 編號 */}
        <div className="text-xs opacity-90 leading-tight mb-1">
          Lesson {course.sessionNumber || 1}
        </div>
        
        {/* 時間 */}
        <div className="text-xs opacity-80 font-medium mb-1">
          {course.timeSlot}
        </div>
        
        {/* 教師 */}
        {course.teacher && course.teacher !== '老師' && course.teacher !== '未指定' && course.teacher !== '未指定教師' && (
          <div className="text-xs opacity-70 leading-tight mb-1">
            {course.teacher}
          </div>
        )}
        
        {/* 狀態指示器 */}
        <div className="flex items-center justify-end space-x-1 mt-auto">
          {course.bookingStatus === 'booked' && (
            <span className="text-xs bg-green-700 text-white px-1 rounded" title="已預約">✓</span>
          )}
          {course.bookingStatus === 'full' && (
            <span className="text-xs bg-gray-500 text-white px-1 rounded" title="課程已額滿">滿</span>
          )}
          {course.bookingStatus === 'locked' && (
            <span className="text-xs bg-gray-600 text-white px-1 rounded" title="距開課少於24小時">🔒</span>
          )}
          {course.bookingStatus === 'cancelled' && (
            <span className="text-xs bg-red-500 text-white px-1 rounded" title="課程已取消">取消</span>
          )}
          {isSelected && course.bookingStatus === 'available' && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-white"
            >
              ✓
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderDateCell = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayCourses = getCoursesByDate(date);
    const isToday = isDateToday(date);
    const isCurrentMonth = isDateInCurrentMonth(date);
    const maxDisplayCourses = isMobile ? 2 : 3;

    return (
      <motion.div
        key={dateStr}
        className={`
          relative p-2 min-h-[120px] border border-gray-200 cursor-pointer
          transition-all duration-200 hover:bg-gray-50
          ${isToday ? 'bg-blue-50 border-blue-300' : ''}
          ${!isCurrentMonth ? 'text-gray-400 bg-gray-50' : ''}
        `}
        onClick={(e) => handleDateClick(date, e)}
        whileHover={{ scale: 1.01 }}
        layout
      >
        <div className={`
          date-number text-sm font-medium mb-1
          ${isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
        `}>
          {date.getDate()}
          {isToday && (
            <div className="absolute top-1 right-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
          )}
        </div>

        {dayCourses.length > 0 && (
          <div className="space-y-0.5">
            {dayCourses.slice(0, maxDisplayCourses).map((course, index) =>
              renderCourseItem(course, date, index)
            )}
            
            {dayCourses.length > maxDisplayCourses && (
              <motion.div
                className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 font-medium"
                onClick={(e) => handleMoreClick(date, e)}
                whileHover={{ scale: 1.05 }}
              >
                +{dayCourses.length - maxDisplayCourses} 更多
              </motion.div>
            )}
          </div>
        )}

        {/* Empty clickable area - fills remaining space */}
        <div className="cell-empty-area flex-1 min-h-0"></div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
    >
      {/* Calendar Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <motion.button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <SafeIcon icon={FiChevronLeft} size={20} />
          </motion.button>
          
          <motion.div 
            className="text-center"
            key={`${currentYear}-${currentMonth}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <div className="flex items-center justify-center mt-1 text-blue-100">
              <SafeIcon icon={FiCalendar} size={16} className="mr-1" />
              <span className="text-sm">課程預約日曆</span>
            </div>
          </motion.div>
          
          <motion.button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <SafeIcon icon={FiChevronRight} size={20} />
          </motion.button>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 bg-gray-50">
        {weekDays.map((day) => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 border-r border-gray-200 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDates.map((date) => renderDateCell(date))}
      </div>

      {/* Legend (US05, US06) */}
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
            <div className="w-3 h-3 bg-blue-500 rounded-md"></div>
            <span>已選課程</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-md"></div>
            <span>已預約</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded-md"></div>
            <span>已額滿</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-md"></div>
            <span>24h內鎖定</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-200 rounded-md"></div>
            <span>已取消</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Calendar;