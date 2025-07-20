'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService, timeslotService } from '@/services/dataService';
import { ClassAppointment, ClassTimeslot } from '@/types';

const {
  FiCalendar, FiClock, FiUser, FiUsers, FiMapPin, FiExternalLink,
  FiX, FiEye, FiCheckCircle, FiAlertCircle, FiBook, FiMail, FiBriefcase,
  FiUserCheck, FiMessageSquare
} = FiIcons;

interface Booking {
  id: string;
  courseName: string;
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

export default function MyBookingsPage() {
  const { user } = useAuth();
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

  // 載入用戶預約資料
  useEffect(() => {
    const loadUserBookings = async () => {
      if (!user || user.role !== 'STUDENT') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const appointments = await bookingService.getUserAppointments(user.id);
        const timeslots = await timeslotService.getAllTimeslots();
        
        // 轉換為 UI 格式
        const bookingData = await Promise.all(
          appointments.map(async (appointment) => {
            const timeslot = timeslots.find(t => t.id === appointment.class_timeslot_id);
            if (!timeslot) return null;
            
            const startTime = new Date(timeslot.start_time);
            const endTime = new Date(timeslot.end_time);
            const now = new Date();
            const daysFromNow = Math.ceil((startTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            // 決定狀態
            let status: 'upcoming' | 'completed' | 'cancelled';
            if (appointment.status === 'CANCELED') {
              status = 'cancelled';
            } else if (startTime < now) {
              status = 'completed';
            } else {
              status = 'upcoming';
            }
            
            return {
              id: appointment.id.toString(),
              courseName: `課程 ${timeslot.id}`, // 可以後續改為實際課程名稱
              courseDate: startTime.toISOString().split('T')[0],
              courseTime: `${startTime.toTimeString().slice(0, 5)}-${endTime.toTimeString().slice(0, 5)}`,
              status,
              classroom: 'https://meet.google.com/virtual-classroom',
              instructorName: '老師', // 可以後續改為實際老師名稱
              instructorEmail: 'teacher@tli.com',
              daysFromNow,
              bookingDate: appointment.created_at.split('T')[0],
              note: '線上課程',
              // 新增取消相關資訊
              canCancel: status === 'upcoming' && daysFromNow > 1, // 超過24小時才能取消
              appointmentId: appointment.id,
              timeslotId: timeslot.id
            } as Booking & { canCancel: boolean; appointmentId: number; timeslotId: number };
          })
        );
        
        const validBookings = bookingData.filter(Boolean) as Booking[];
        setBookings(validBookings);
      } catch (error) {
        console.error('載入預約資料失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserBookings();
  }, [user]);

  // Check if user is student or instructor
  if (!user || !['STUDENT', 'TEACHER'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">存取被拒</h1>
            <p className="text-gray-600">此頁面僅供學生和教師使用。</p>
          </div>
        </div>
      </div>
    );
  }



  const filteredBookings = bookings.filter(booking => {
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

  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
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

  const handleCancelRequest = (requestId: string, courseName: string) => {
    const request = bookings.find(req => req.id === requestId);
    if (request && request.status === 'pending') {
      if (confirm(`確定要取消「${courseName}」的請假申請嗎？`)) {
        alert('✅ 請假申請已取消');
        // Here you would update the request status
      }
    }
  };

  const handleCancelBooking = (bookingId: string, courseName: string) => {
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
          alert(`✅ 預約已成功取消！

課程：${selectedBooking.courseName}
時間：${selectedBooking.courseDate} ${selectedBooking.courseTime}
取消原因：${cancelForm.reason}`);
          
          // 重新載入預約資料
          const appointments = await bookingService.getUserAppointments(user.id);
          const timeslots = await timeslotService.getAllTimeslots();
          
          const bookingData = await Promise.all(
            appointments.map(async (appointment) => {
              const timeslot = timeslots.find(t => t.id === appointment.class_timeslot_id);
              if (!timeslot) return null;
              
              const startTime = new Date(timeslot.start_time);
              const endTime = new Date(timeslot.end_time);
              const now = new Date();
              const daysFromNow = Math.ceil((startTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              
              let status: 'upcoming' | 'completed' | 'cancelled';
              if (appointment.status === 'CANCELED') {
                status = 'cancelled';
              } else if (startTime < now) {
                status = 'completed';
              } else {
                status = 'upcoming';
              }
              
              return {
                id: appointment.id.toString(),
                courseName: `課程 ${timeslot.id}`,
                courseDate: startTime.toISOString().split('T')[0],
                courseTime: `${startTime.toTimeString().slice(0, 5)}-${endTime.toTimeString().slice(0, 5)}`,
                status,
                classroom: 'https://meet.google.com/virtual-classroom',
                instructorName: '老師',
                instructorEmail: 'teacher@tli.com',
                daysFromNow,
                bookingDate: appointment.created_at.split('T')[0],
                note: '線上課程',
                canCancel: status === 'upcoming' && daysFromNow > 1,
                appointmentId: appointment.id,
                timeslotId: timeslot.id
              } as Booking & { canCancel: boolean; appointmentId: number; timeslotId: number };
            })
          );
          
          const validBookings = bookingData.filter(Boolean) as Booking[];
          setBookings(validBookings);
          
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
          <h3 className="text-xl font-bold">{selectedBooking?.leaveReason ? '請假申請詳情' : '預約詳情'}</h3>
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
                <div className="flex justify-between">
                  <span className="text-gray-600">課程名稱：</span>
                  <span className="font-medium">{selectedBooking.courseName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">上課時間：</span>
                  <span>{formatDate(selectedBooking.courseDate)} {selectedBooking.courseTime}</span>
                </div>
                {selectedBooking.leaveReason ? (
                  <div className="flex justify-between">
                    <span className="text-gray-600">學生人數：</span>
                    <span>{selectedBooking.studentCount} 位</span>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-gray-600">預約日期：</span>
                    <span>{formatDate(selectedBooking.bookingDate)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 人員資訊 / 請假資訊 */}
            {selectedBooking.leaveReason ? (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-3 text-blue-900">請假資訊</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-600">申請日期：</span>
                    <span>{formatDate(selectedBooking.requestDate!)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">請假原因：</span>
                    <span className="font-medium">{selectedBooking.leaveReason}</span>
                  </div>
                  {selectedBooking.note && (
                    <div className="mt-2">
                      <div className="text-blue-600 mb-1">詳細說明：</div>
                      <div className="text-gray-700 bg-white p-2 rounded border">
                        {selectedBooking.note}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-3 text-blue-900">
                  {user?.role === 'STUDENT' ? '教師資訊' : '學生資訊'}
                </h4>
                <div className="space-y-2 text-sm">
                  {user?.role === 'STUDENT' ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-blue-600">教師姓名：</span>
                        <span className="font-medium">{selectedBooking.instructorName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600">聯絡信箱：</span>
                        <span>{selectedBooking.instructorEmail}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-blue-600">學生姓名：</span>
                        <span className="font-medium">{selectedBooking.studentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600">聯絡信箱：</span>
                        <span>{selectedBooking.studentEmail}</span>
                      </div>
                      {selectedBooking.studentPhone && (
                        <div className="flex justify-between">
                          <span className="text-blue-600">聯絡電話：</span>
                          <span>{selectedBooking.studentPhone}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-blue-600">會員類型：</span>
                        <span>{selectedBooking.membershipType === 'corporate' ? '企業會員' : '個人會員'}</span>
                      </div>
                      {selectedBooking.companyName && (
                        <div className="flex justify-between">
                          <span className="text-blue-600">公司名稱：</span>
                          <span>{selectedBooking.companyName}</span>
                        </div>
                      )}
                    </>
                  )}
                  {selectedBooking.note && !selectedBooking.leaveReason && (
                    <div className="mt-3">
                      <div className="text-blue-600 mb-1">備註：</div>
                      <div className="text-gray-700 bg-white p-2 rounded border">
                        {selectedBooking.note}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 審核狀態 (for leave requests) */}
            {selectedBooking.leaveReason && (
              <div className={`p-4 rounded-lg ${
                selectedBooking.status === 'approved' ? 'bg-green-50' :
                selectedBooking.status === 'rejected' ? 'bg-red-50' : 'bg-yellow-50'
              }`}>
                <div className="flex items-center space-x-2 mb-3">
                  <SafeIcon 
                    icon={getStatusIcon(selectedBooking.status)} 
                    className={`text-lg ${
                      selectedBooking.status === 'approved' ? 'text-green-600' :
                      selectedBooking.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                    }`} 
                  />
                  <h4 className={`font-medium ${
                    selectedBooking.status === 'approved' ? 'text-green-900' :
                    selectedBooking.status === 'rejected' ? 'text-red-900' : 'text-yellow-900'
                  }`}>
                    審核狀態：{getStatusText(selectedBooking.status)}
                  </h4>
                </div>
                
                {selectedBooking.status === 'approved' && selectedBooking.substituteTeacher && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-600">代課老師：</span>
                      <span className="font-medium">{selectedBooking.substituteTeacher.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">聯絡信箱：</span>
                      <span>{selectedBooking.substituteTeacher.email}</span>
                    </div>
                  </div>
                )}
                
                {selectedBooking.adminNote && (
                  <div className="mt-3">
                    <div className={`mb-1 font-medium ${
                      selectedBooking.status === 'approved' ? 'text-green-600' :
                      selectedBooking.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      管理員備註：
                    </div>
                    <div className="text-gray-700 bg-white p-2 rounded border">
                      {selectedBooking.adminNote}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 課程連結 (for non-leave requests) */}
            {!selectedBooking.leaveReason && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium mb-3 text-green-900">課程連結</h4>
                <div className="space-y-3">
                  <button
                    onClick={() => window.open(selectedBooking.classroom, '_blank')}
                    className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <SafeIcon icon={FiExternalLink} />
                    <span>進入線上教室</span>
                  </button>
                  {selectedBooking.materials && (
                    <button
                      onClick={() => window.open(selectedBooking.materials, '_blank')}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <SafeIcon icon={FiEye} />
                      <span>查看課程教材</span>
                    </button>
                  )}
                </div>
              </div>
            )}

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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">我的預約與請假</h1>
          <p className="text-gray-600">
            {user?.role === 'STUDENT' 
              ? '查看您預約的課程和上課詳情' 
              : '查看學生預約您的課程情況與您的請假記錄'}
          </p>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          {[
            { 
              label: '即將開始', 
              count: bookings.filter(b => b.status === 'upcoming' && !b.leaveReason).length,
              color: 'text-blue-600 bg-blue-50 border-blue-200',
              icon: FiClock
            },
            { 
              label: '已完成', 
              count: bookings.filter(b => b.status === 'completed' && !b.leaveReason).length,
              color: 'text-green-600 bg-green-50 border-green-200',
              icon: FiCheckCircle
            },
            { 
              label: '已取消', 
              count: bookings.filter(b => b.status === 'cancelled' && !b.leaveReason).length,
              color: 'text-red-600 bg-red-50 border-red-200',
              icon: FiX
            },
            { 
              label: '待審核請假', 
              count: bookings.filter(b => b.status === 'pending' && b.leaveReason).length,
              color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
              icon: FiMessageSquare
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
            {user?.role === 'STUDENT' ? (
              [
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
              ))
            ) : (
              [
                { key: 'upcoming', label: '即將開課', count: bookings.filter(b => b.status === 'upcoming' && !b.leaveReason).length },
                { key: 'completed', label: '已完成課程', count: bookings.filter(b => b.status === 'completed' && !b.leaveReason).length },
                { key: 'pending', label: '待審核請假', count: bookings.filter(b => b.status === 'pending' && b.leaveReason).length },
                { key: 'approved', label: '已批准請假', count: bookings.filter(b => b.status === 'approved' && b.leaveReason).length },
                { key: 'rejected', label: '已拒絕請假', count: bookings.filter(b => b.status === 'rejected' && b.leaveReason).length },
                { key: 'all', label: '全部', count: bookings.length }
              ].map((tab) => (
                <motion.button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key as 'upcoming' | 'completed' | 'cancelled' | 'all' | 'pending' | 'approved' | 'rejected')}
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
              ))
            )}
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {booking.courseName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <SafeIcon icon={FiCalendar} className="text-xs" />
                            <span>{formatDate(booking.courseDate)} {booking.courseTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <SafeIcon icon={user?.role === 'STUDENT' ? FiUser : (booking.leaveReason ? FiUserCheck : FiUsers)} className="text-xs" />
                            <span>
                              {user?.role === 'STUDENT' 
                                ? booking.instructorName 
                                : (booking.leaveReason ? `${booking.studentCount} 位學生` : booking.studentName)}
                            </span>
                          </div>
                          {user?.role === 'TEACHER' && !booking.leaveReason && booking.membershipType && (
                            <div className="flex items-center space-x-1">
                              <SafeIcon icon={FiMapPin} className="text-xs" />
                              <span>{booking.membershipType === 'corporate' ? '企業會員' : '個人會員'}</span>
                            </div>
                          )}
                          {user?.role === 'TEACHER' && booking.leaveReason && (
                            <div className="flex items-center space-x-1">
                              <SafeIcon icon={FiMessageSquare} className="text-xs" />
                              <span>{booking.leaveReason}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>

                    {/* Company Info for Corporate Members */}
                    {user?.role === 'TEACHER' && !booking.leaveReason && booking.companyName && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center space-x-2 text-purple-800">
                          <SafeIcon icon={FiBriefcase} className="text-sm" />
                          <span className="font-medium">企業：{booking.companyName}</span>
                        </div>
                      </div>
                    )}

                    {/* Substitute Teacher Info */}
                    {user?.role === 'TEACHER' && booking.leaveReason && booking.substituteTeacher && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center space-x-2 text-green-800">
                          <SafeIcon icon={FiUserCheck} className="text-sm" />
                          <span className="font-medium">代課老師：{booking.substituteTeacher.name}</span>
                        </div>
                      </div>
                    )}

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
                      
                      {booking.status === 'upcoming' && !booking.leaveReason && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.open(booking.classroom, '_blank')}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                          >
                            <SafeIcon icon={FiExternalLink} className="text-xs" />
                            <span>進入教室</span>
                          </motion.button>
                          
                          {user?.role === 'STUDENT' && (() => {
                            const bookingWithExtras = booking as Booking & { canCancel: boolean };
                            return bookingWithExtras.canCancel && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCancelBooking(booking.id, booking.courseName)}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                              >
                                <SafeIcon icon={FiX} className="text-xs" />
                                <span>取消預約</span>
                              </motion.button>
                            );
                          })()}
                          
                          {user?.role === 'TEACHER' && booking.studentEmail && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => window.open(`mailto:${booking.studentEmail}`, '_blank')}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                            >
                              <SafeIcon icon={FiMail} className="text-xs" />
                              <span>聯絡學生</span>
                            </motion.button>
                          )}
                        </>
                      )}

                      {user?.role === 'TEACHER' && booking.status === 'pending' && booking.leaveReason && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCancelRequest(booking.id, booking.courseName)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                        >
                          <SafeIcon icon={FiX} className="text-xs" />
                          <span>取消申請</span>
                        </motion.button>
                      )}
                      
                      {booking.materials && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => window.open(booking.materials, '_blank')}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        >
                          <SafeIcon icon={FiBook} className="text-xs" />
                          <span>教材</span>
                        </motion.button>
                      )}
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
                 selectedTab === 'cancelled' ? '暫無已取消的預約' : 
                 selectedTab === 'pending' ? '暫無待審核申請' :
                 selectedTab === 'approved' ? '暫無已批准申請' :
                 selectedTab === 'rejected' ? '暫無已拒絕申請' : '暫無記錄'}
              </h3>
              <p className="text-gray-600">
                {user?.role === 'STUDENT' 
                  ? '您的課程預約記錄會顯示在這裡' 
                  : '學生的課程預約記錄與您的請假記錄會顯示在這裡'}
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
                  <select
                    value={cancelForm.reason}
                    onChange={(e) => setCancelForm({...cancelForm, reason: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">請選擇取消原因</option>
                    <option value="臨時有事">臨時有事</option>
                    <option value="身體不適">身體不適</option>
                    <option value="工作衝突">工作衝突</option>
                    <option value="家庭因素">家庭因素</option>
                    <option value="時間不合適">時間不合適</option>
                    <option value="其他個人因素">其他個人因素</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    詳細說明
                  </label>
                  <textarea
                    value={cancelForm.note}
                    onChange={(e) => setCancelForm({...cancelForm, note: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="請詳細說明取消原因（選填）..."
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
    </div>
  );
}