'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';
import RoleEntry from '@/components/RoleEntry';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService, dashboardService, leaveService } from '@/services/dataService';
import { } from '@/types';
import { getCourseLinksFromBooking } from '@/utils/courseLinksUtils';

const {
  FiCalendar, FiClock, FiUser, FiUsers, FiExternalLink,
  FiX, FiEye, FiCheckCircle, FiAlertCircle, FiBook, FiBriefcase,
  FiUserCheck, FiMessageSquare
} = FiIcons;

interface Booking {
  id: string;
  courseName: string;
  courseTitle?: string;  // 班名
  sessionTitle?: string; // 課名
  sessionNumber?: number; // 課次編號
  courseDate: string;
  courseTime: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'pending' | 'approved' | 'rejected'; // Added leave request statuses
  classroom: string;
  materials?: string;
  // For students
  instructorName?: string;
  instructorEmail?: string;
  // For teachers
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  studentCount?: number;
  membershipType?: 'individual' | 'corporate';
  companyName?: string;
  daysFromNow: number;
  bookingDate: string;
  note?: string;
  // For leave requests
  leaveReason?: string;
  requestDate?: string;
  substituteTeacher?: {
    name: string;
    email: string;
  } | null;
  adminNote?: string;
}

export default function StudentMyBookingsPage() {
  const { user } = useAuth();
  const [selectedMainTab, setSelectedMainTab] = useState<'bookings' | 'leave'>('bookings');
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'completed' | 'cancelled' | 'all' | 'pending' | 'approved' | 'rejected'>('upcoming');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelForm, setCancelForm] = useState({
    reason: '',
    note: ''
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [studentList, setStudentList] = useState<Array<{name: string; email: string; phone?: string}>>([]);
  
  // 請假相關狀態
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    reason: ''
  });

  // 轉換預約資料為 UI 格式的通用函數
  const convertBookingData = useCallback((dashboardData: { upcomingClasses: Array<{ appointment?: { id: number; status: string; class_timeslot_id: number; created_at: string } | null; session: { id: string; date: string; startTime: string; endTime: string; courseTitle: string; sessionTitle: string; teacherName: string; classroom?: string; materials?: string } }> }): (Booking & { canCancel: boolean; appointmentId: number; timeslotId: number })[] => {
    console.log('🔍 轉換預約資料，總數:', dashboardData.upcomingClasses.length);
    
    const convertedData = dashboardData.upcomingClasses.map((item, index) => {
      // 使用課程預約日曆系統的真實資料
      const startTime = new Date(`${item.session.date} ${item.session.startTime}`);
      const now = new Date();
      const daysFromNow = Math.ceil((startTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      let status: 'upcoming' | 'completed' | 'cancelled';
      if (item.appointment?.status === 'CANCELED') {
        status = 'cancelled';
        console.log('📅 發現已取消課程:', item.session.courseTitle, '- 預約狀態:', item.appointment.status);
      } else {
        // 使用課程結束時間來判斷是否已完成
        const endTime = new Date(`${item.session.date} ${item.session.endTime}`);
        if (endTime < now) {
          status = 'completed';
        } else {
          status = 'upcoming';
        }
      }
      
      const converted = {
        id: `student-${item.appointment?.id || item.session.id}-${index}`,
        courseName: `${item.session.courseTitle} - Lesson ${1 || 1} - ${item.session.sessionTitle}`,
        courseTitle: item.session.courseTitle,
        sessionTitle: item.session.sessionTitle,
        sessionNumber: 1,
        courseDate: item.session.date,
        courseTime: `${item.session.startTime}-${item.session.endTime}`,
        status,
        classroom: item.session.classroom,
        materials: item.session.materials,
        instructorName: item.session.teacherName,
        instructorEmail: 'teacher@tli.com', // 可以後續從老師資料獲取
        daysFromNow,
        bookingDate: item.appointment?.created_at?.split('T')[0] || item.session.date,
        note: '真實課程預約',
        // 新增取消相關資訊
        canCancel: status === 'upcoming' && daysFromNow > 1,
        appointmentId: item.appointment?.id,
        timeslotId: item.appointment?.class_timeslot_id
      } as Booking & { canCancel: boolean; appointmentId: number; timeslotId: number };
      
      console.log('✅ 轉換課程:', converted.courseName, '狀態:', converted.status);
      return converted;
    });
    
    // 統計各種狀態的數量
    const statusCounts = {
      upcoming: convertedData.filter(item => item.status === 'upcoming').length,
      completed: convertedData.filter(item => item.status === 'completed').length,
      cancelled: convertedData.filter(item => item.status === 'cancelled').length
    };
    console.log('📊 狀態統計:', statusCounts);
    
    // 详细显示已取消的课程
    const cancelledCourses = convertedData.filter(item => item.status === 'cancelled');
    if (cancelledCourses.length > 0) {
      console.log('❌ 已取消的課程詳情:', cancelledCourses.map(c => ({
        id: c.id,
        courseName: c.courseName,
        appointmentId: c.appointmentId,
        status: c.status
      })));
    }
    
    return convertedData;
  }, []);

  // 載入用戶預約資料的通用函數
  const loadUserBookings = useCallback(async (showLoading = true) => {
    if (!user || !user?.roles.some(role => ['STUDENT'].includes(role))) {
      if (showLoading) setLoading(false);
      return;
    }

    try {
      if (showLoading) setLoading(true);
      
      console.log('📥 開始載入用戶預約資料 - 用戶ID:', user.id, '角色:', user?.roles[0]);
      
      // 學生：使用原有邏輯
      const dashboardData = await dashboardService.getDashboardData(user.id);
      
      console.log('📋 Dashboard原始資料:', dashboardData);
      console.log('📅 upcomingClasses數量:', dashboardData.upcomingClasses.length);
      
      // 轉換為 UI 格式
      const bookingData = convertBookingData(dashboardData);
      console.log('🔄 設置預約資料，總數:', bookingData.length);
      setBookings(bookingData);
    } catch (error) {
      console.error('載入預約資料失敗:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [user, convertBookingData]);

  // 載入用戶預約資料 - 使用與Dashboard相同的資料源
  useEffect(() => {
    loadUserBookings();
  }, [loadUserBookings]);

  // 監聽頁面焦點變化和 localStorage 變化，重新載入資料
  useEffect(() => {
    const handleFocus = () => {
      // 當用戶從課程預約頁面返回時重新載入資料
      console.log('🔄 頁面重新獲得焦點，重新載入預約資料');
      loadUserBookings(false);
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'classAppointments') {
        handleFocus(); // 重新載入資料
      }
    };

    const handleBookingsUpdated = () => {
      handleFocus(); // 重新載入資料
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bookingsUpdated', handleBookingsUpdated);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bookingsUpdated', handleBookingsUpdated);
    };
  }, [loadUserBookings]);

  const filteredBookings = bookings.filter(booking => {
    // 學生的邏輯
    if (selectedTab === 'all') return true;
    return booking.status === selectedTab;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const getStatusColor = (status: string, booking?: { studentCount: number; leaveReason?: string; leaveStatus?: string }) => {
    switch (status) {
      case 'upcoming': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'completed': return 'text-green-700 bg-green-50 border-green-200';
      case 'cancelled': return 'text-red-700 bg-red-50 border-red-200';
      case 'pending': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'approved': return 'text-green-700 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string, booking?: { studentCount: number; leaveReason?: string; leaveStatus?: string }) => {
    switch (status) {
      case 'upcoming': return '即將開始';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      case 'pending': return '待審核';
      case 'approved': return '已批准';
      case 'rejected': return '已拒絕';
      default: return '未知';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return FiClock;
      case 'approved': return FiCheckCircle;
      case 'rejected': return FiX;
      case 'cancelled': return FiX;
      case 'upcoming': return FiClock;
      case 'completed': return FiCheckCircle;
      default: return FiAlertCircle;
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      const bookingWithExtras = booking as Booking & { canCancel: boolean; appointmentId: number };
      
      // 檢查是否能取消 (US07.3)
      if (!bookingWithExtras.canCancel) {
        alert('無法取消預約：距離開課時間不足24小時，無法取消預約。');
        return;
      }
      
      setSelectedBooking(booking);
      setShowCancelModal(true);
    }
  };

  const handleSubmitCancel = async () => {
    if (!cancelForm.reason.trim()) {
      alert('請填寫取消原因');
      return;
    }

    if (selectedBooking && user) {
      try {
        setCancelling(true);
        
        const bookingWithExtras = selectedBooking as Booking & { appointmentId: number };
        
        // 呼叫取消 API (US07)
        const result = await bookingService.cancelBooking(user.id, bookingWithExtras.appointmentId);
        
        if (result.success) {
          console.log('✅ 取消預約成功，準備重新載入資料');
          
          // 重新載入預約資料 - 使用統一的載入函數
          console.log('🔄 開始重新載入預約資料...');
          await loadUserBookings(false);
          console.log('✅ 預約資料重新載入完成');
          
          alert(`✅ 預約已成功取消！

課程：${selectedBooking.courseName}
時間：${selectedBooking.courseDate} ${selectedBooking.courseTime}
取消原因：${cancelForm.reason}`);
          
        } else {
          // 處理錯誤情況
          let errorMessage = '取消預約失敗';
          
          if (result.error === 'CANNOT_CANCEL_WITHIN_24H') {
            errorMessage = '無法取消預約：距離開課時間不足24小時，無法取消預約。';
          } else if (result.error === 'Appointment not found') {
            errorMessage = '找不到預約記錄或預約已被取消。';
          }
          
          alert(`❌ ${errorMessage}`);
        }
        
      } catch (error) {
        console.error('取消預約錯誤:', error);
        alert('取消預約過程中發生錯誤，請稍後再試');
      } finally {
        setCancelling(false);
      }
      
      // Reset form and close modal
      setCancelForm({ reason: '', note: '' });
      setShowCancelModal(false);
      setSelectedBooking(null);
    }
  };

  const DetailModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowDetailModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">預約詳情</h3>
          <button
            onClick={() => setShowDetailModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <SafeIcon icon={FiX} className="text-xl" />
          </button>
        </div>

        {selectedBooking && (
          <div className="space-y-6">
            {/* 課程資訊 */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3 text-gray-900">課程資訊</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">課程名稱：</span>
                  <div className="font-medium mt-1 break-words">{selectedBooking.courseName}</div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">上課時間：</span>
                  <span>{formatDate(selectedBooking.courseDate)} {selectedBooking.courseTime}</span>
                </div>
              </div>
            </div>

            {/* 教師資訊 */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-3 text-blue-900">教師資訊</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-600">教師姓名：</span>
                  <span className="font-medium">{selectedBooking.instructorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">聯絡信箱：</span>
                  <span>{selectedBooking.instructorEmail}</span>
                </div>
                {selectedBooking.note && (
                  <div className="mt-3">
                    <div className="text-blue-600 mb-1">備註：</div>
                    <div className="text-gray-700 bg-white p-2 rounded border">
                      {selectedBooking.note}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 課程連結 */}
            {(() => {
              // 動態獲取課程連結：根據課程名稱和Lesson編號從課程模組中查找
              const courseLinks = getCourseLinksFromBooking(selectedBooking);
              
              return (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium mb-3 text-green-900">課程連結</h4>
                  <div className="space-y-3">
                    {courseLinks.hasValidClassroom ? (
                      <button
                        onClick={() => {
                          console.log(`🚀 進入教室: ${courseLinks.classroom}`);
                          if (courseLinks.classroom) window.open(courseLinks.classroom, '_blank');
                        }}
                        className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <SafeIcon icon={FiExternalLink} />
                        <span>進入線上教室</span>
                      </button>
                    ) : (
                      <div className="w-full flex items-center justify-center space-x-2 bg-gray-400 text-white py-2 px-4 rounded-lg cursor-not-allowed">
                        <SafeIcon icon={FiExternalLink} />
                        <span>教室連結未設置</span>
                      </div>
                    )}
                    
                    {courseLinks.hasValidMaterials ? (
                      <button
                        onClick={() => {
                          console.log(`📄 查看教材: ${courseLinks.materials}`);
                          if (courseLinks.materials) window.open(courseLinks.materials, '_blank');
                        }}
                        className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <SafeIcon icon={FiEye} />
                        <span>查看課程教材</span>
                      </button>
                    ) : (
                      <div className="w-full flex items-center justify-center space-x-2 bg-gray-400 text-white py-2 px-4 rounded-lg cursor-not-allowed">
                        <SafeIcon icon={FiEye} />
                        <span>教材連結未設置</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            <button
              onClick={() => setShowDetailModal(false)}
              className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              關閉
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  return (
    <RoleEntry requiredRole="STUDENT">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">我的預約</h1>
          <p className="text-gray-600">
            查看您預約的課程和上課詳情
          </p>
        </motion.div>

        {/* Statistics Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
        >
          {[
            { 
              label: '即將開始', 
              count: bookings.filter(b => b.status === 'upcoming').length,
              color: 'text-blue-600 bg-blue-50 border-blue-200',
              icon: FiClock
            },
            { 
              label: '已完成', 
              count: bookings.filter(b => b.status === 'completed').length,
              color: 'text-green-600 bg-green-50 border-green-200',
              icon: FiCheckCircle
            }
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`p-4 rounded-xl border ${stat.color}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stat.count}</div>
                  <div className="text-sm font-medium">{stat.label}</div>
                </div>
                <SafeIcon icon={stat.icon} className="text-2xl" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            {[
              { key: 'upcoming', label: '即將開始', count: bookings.filter(b => b.status === 'upcoming').length },
              { key: 'completed', label: '已完成', count: bookings.filter(b => b.status === 'completed').length },
              { key: 'cancelled', label: '已取消', count: bookings.filter(b => b.status === 'cancelled').length },
              { key: 'all', label: '全部', count: bookings.length }
            ].map((tab) => (
              <motion.button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key as 'upcoming' | 'completed' | 'cancelled' | 'all')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  selectedTab === tab.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {tab.label} ({tab.count})
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Bookings List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {loading ? (
            <div className="text-center py-12">
              <SafeIcon icon={FiClock} className="text-6xl text-gray-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">載入中...</h3>
              <p className="text-gray-600">正在載入您的預約記錄</p>
            </div>
          ) : filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                  {/* Left Side - Course Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {booking.courseTitle || booking.courseName.split(' - ')[0]}
                          </h3>
                          {booking.sessionTitle && (
                            <div className="text-sm text-gray-600 mt-1">
                              Lesson {booking.sessionNumber || 1} - {booking.sessionTitle}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <SafeIcon icon={FiCalendar} className="text-xs" />
                            <span>{formatDate(booking.courseDate)} {booking.courseTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <SafeIcon icon={FiUser} className="text-xs" />
                            <span>{booking.instructorName}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(booking.status, { ...booking, studentCount: booking.studentCount || 0 })}`}>
                        {getStatusText(booking.status, { ...booking, studentCount: booking.studentCount || 0 })}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowDetailModal(true);
                        }}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                      >
                        <SafeIcon icon={FiEye} className="text-xs" />
                        <span>查看詳情</span>
                      </motion.button>
                      
                      {booking.status === 'upcoming' && (() => {
                        // 獲取課程連結
                        const courseLinks = getCourseLinksFromBooking(booking);
                        
                        return (
                          <>
                            {courseLinks.hasValidClassroom ? (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { if (courseLinks.classroom) window.open(courseLinks.classroom, '_blank'); }}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                              >
                                <SafeIcon icon={FiExternalLink} className="text-xs" />
                                <span>進入教室</span>
                              </motion.button>
                            ) : (
                              <div className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-sm cursor-not-allowed">
                                <SafeIcon icon={FiExternalLink} className="text-xs" />
                                <span>教室未設置</span>
                              </div>
                            )}
                            
                            {courseLinks.hasValidMaterials ? (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { if (courseLinks.materials) window.open(courseLinks.materials, '_blank'); }}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                              >
                                <SafeIcon icon={FiBook} className="text-xs" />
                                <span>查看教材</span>
                              </motion.button>
                            ) : (
                              <div className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-sm cursor-not-allowed">
                                <SafeIcon icon={FiBook} className="text-xs" />
                                <span>教材未設置</span>
                              </div>
                            )}
                          </>
                        );
                      })()}
                          
                      {(() => {
                        const bookingWithExtras = booking as Booking & { canCancel: boolean };
                        return bookingWithExtras.canCancel && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCancelBooking(booking.id)}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                          >
                            <SafeIcon icon={FiX} className="text-xs" />
                            <span>取消預約</span>
                          </motion.button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <SafeIcon icon={FiCalendar} className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedTab === 'upcoming' ? '暫無即將開始的預約' : 
                 selectedTab === 'completed' ? '暫無已完成的預約' :
                 selectedTab === 'cancelled' ? '暫無已取消的預約' : '暫無記錄'}
              </h3>
              <p className="text-gray-600">
                您的課程預約記錄會顯示在這裡
              </p>
            </div>
          )}
        </motion.div>

        {/* Detail Modal */}
        {showDetailModal && <DetailModal />}

        {/* Cancel Booking Modal */}
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">取消預約</h3>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <SafeIcon icon={FiX} className="text-xl" />
                </button>
              </div>

              {selectedBooking && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">課程資訊</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>課程：{selectedBooking.courseName}</div>
                    <div>時間：{formatDate(selectedBooking.courseDate)} {selectedBooking.courseTime}</div>
                    <div>教師：{selectedBooking.instructorName}</div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    取消原因 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={cancelForm.reason}
                    onChange={(e) => setCancelForm({...cancelForm, reason: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="請詳細說明取消預約的原因..."
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleSubmitCancel}
                  disabled={cancelling}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {cancelling ? '取消中...' : '確認取消'}
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:cursor-not-allowed"
                >
                  保留預約
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </RoleEntry>
  );
}