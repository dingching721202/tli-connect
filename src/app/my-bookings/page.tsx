'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';

const {
  FiCalendar, FiClock, FiUser, FiUsers, FiMapPin, FiExternalLink,
  FiX, FiEye, FiCheckCircle, FiAlertCircle, FiBook, FiMail, FiBriefcase
} = FiIcons;

interface Booking {
  id: string;
  courseName: string;
  courseDate: string;
  courseTime: string;
  status: 'upcoming' | 'completed' | 'cancelled';
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
}

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'completed' | 'cancelled' | 'all'>('upcoming');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelForm, setCancelForm] = useState({
    reason: '',
    note: ''
  });

  // Check if user is student or instructor
  if (!user || !['student', 'instructor'].includes(user.role)) {
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

  // Mock data for students (their booked courses)
  const studentBookings: Booking[] = [
    {
      id: '1',
      courseName: '商務華語會話',
      courseDate: '2025-01-25',
      courseTime: '09:00-10:30',
      status: 'upcoming',
      classroom: 'https://meet.google.com/abc-def-ghi',
      materials: 'https://drive.google.com/file/d/example1',
      instructorName: '張老師',
      instructorEmail: 'teacher.zhang@tli.com',
      daysFromNow: 2,
      bookingDate: '2025-01-20',
      note: '第一次上課，請提前10分鐘進入教室'
    },
    {
      id: '2',
      courseName: '華語文法精修',
      courseDate: '2025-01-28',
      courseTime: '14:00-15:30',
      status: 'upcoming',
      classroom: 'https://meet.google.com/def-ghi-jkl',
      materials: 'https://drive.google.com/file/d/example2',
      instructorName: '王老師',
      instructorEmail: 'teacher.wang@tli.com',
      daysFromNow: 5,
      bookingDate: '2025-01-18'
    },
    {
      id: '3',
      courseName: '日常華語對話',
      courseDate: '2025-01-18',
      courseTime: '15:00-16:30',
      status: 'completed',
      classroom: 'https://meet.google.com/ghi-jkl-mno',
      materials: 'https://drive.google.com/file/d/example3',
      instructorName: '陳老師',
      instructorEmail: 'teacher.chen@tli.com',
      daysFromNow: -5,
      bookingDate: '2025-01-15'
    }
  ];

  // Mock data for teachers (courses booked by students)
  const teacherBookings: Booking[] = [
    {
      id: '1',
      courseName: '商務華語會話',
      courseDate: '2025-01-25',
      courseTime: '09:00-10:30',
      status: 'upcoming',
      classroom: 'https://meet.google.com/abc-def-ghi',
      materials: 'https://drive.google.com/file/d/example1',
      studentName: '王小明',
      studentEmail: 'student1@example.com',
      studentPhone: '0912-345-678',
      membershipType: 'individual',
      daysFromNow: 2,
      bookingDate: '2025-01-20'
    },
    {
      id: '2',
      courseName: '華語文法精修',
      courseDate: '2025-01-26',
      courseTime: '14:00-15:30',
      status: 'upcoming',
      classroom: 'https://meet.google.com/def-ghi-jkl',
      materials: 'https://drive.google.com/file/d/example2',
      studentName: '李小華',
      studentEmail: 'user2@taiwantech.com',
      studentPhone: '0923-456-789',
      membershipType: 'corporate',
      companyName: '台灣科技股份有限公司',
      daysFromNow: 3,
      bookingDate: '2025-01-18'
    },
    {
      id: '3',
      courseName: '商務華語會話',
      courseDate: '2025-01-28',
      courseTime: '10:00-11:30',
      status: 'upcoming',
      classroom: 'https://meet.google.com/ghi-jkl-mno',
      materials: 'https://drive.google.com/file/d/example3',
      studentName: '程式設計師A',
      studentEmail: 'dev1@innovation.com',
      membershipType: 'corporate',
      companyName: '創新軟體有限公司',
      daysFromNow: 5,
      bookingDate: '2025-01-19'
    },
    {
      id: '4',
      courseName: '日常華語對話',
      courseDate: '2025-01-18',
      courseTime: '15:00-16:30',
      status: 'completed',
      classroom: 'https://meet.google.com/jkl-mno-pqr',
      materials: 'https://drive.google.com/file/d/example4',
      studentName: '林小雅',
      studentEmail: 'student2@example.com',
      studentPhone: '0934-567-890',
      membershipType: 'individual',
      daysFromNow: -5,
      bookingDate: '2025-01-15'
    }
  ];

  // Use appropriate data based on user role
  const bookings = user.role === 'student' ? studentBookings : teacherBookings;

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
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return '即將開始';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  };


  const handleCancelBooking = (bookingId: string, courseName: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setShowCancelModal(true);
    }
  };

  const handleSubmitCancel = () => {
    if (!cancelForm.reason.trim()) {
      alert('請填寫取消原因');
      return;
    }

    if (selectedBooking) {
      // Create cancellation record
      const cancellationRecord = {
        id: Date.now().toString(),
        bookingId: selectedBooking.id,
        studentName: user?.name || '未知學生',
        studentEmail: user?.email || '',
        courseName: selectedBooking.courseName,
        courseDate: selectedBooking.courseDate,
        courseTime: selectedBooking.courseTime,
        instructorName: selectedBooking.instructorName,
        cancelReason: cancelForm.reason,
        cancelNote: cancelForm.note,
        cancelDate: new Date().toISOString().split('T')[0],
        membershipType: selectedBooking.membershipType || 'individual',
        companyName: selectedBooking.companyName
      };

      alert(`✅ 預約已取消！
      
課程：${selectedBooking.courseName}
時間：${selectedBooking.courseDate} ${selectedBooking.courseTime}
取消原因：${cancelForm.reason}

取消記錄已發送給管理員處理。`);

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
                <div className="flex justify-between">
                  <span className="text-gray-600">課程名稱：</span>
                  <span className="font-medium">{selectedBooking.courseName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">上課時間：</span>
                  <span>{formatDate(selectedBooking.courseDate)} {selectedBooking.courseTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">預約日期：</span>
                  <span>{formatDate(selectedBooking.bookingDate)}</span>
                </div>
              </div>
            </div>

            {/* 人員資訊 */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-3 text-blue-900">
                {user?.role === 'student' ? '教師資訊' : '學生資訊'}
              </h4>
              <div className="space-y-2 text-sm">
                {user?.role === 'student' ? (
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">我的預約</h1>
          <p className="text-gray-600">
            {user?.role === 'student' 
              ? '查看您預約的課程和上課詳情' 
              : '查看學生預約您的課程情況'}
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
              count: bookings.filter(b => b.status === 'upcoming').length,
              color: 'text-blue-600 bg-blue-50 border-blue-200',
              icon: FiClock
            },
            { 
              label: '已完成', 
              count: bookings.filter(b => b.status === 'completed').length,
              color: 'text-green-600 bg-green-50 border-green-200',
              icon: FiCheckCircle
            },
            { 
              label: '已取消', 
              count: bookings.filter(b => b.status === 'cancelled').length,
              color: 'text-red-600 bg-red-50 border-red-200',
              icon: FiX
            },
            { 
              label: '總計', 
              count: bookings.length,
              color: 'text-purple-600 bg-purple-50 border-purple-200',
              icon: FiBook
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
          {filteredBookings.length > 0 ? (
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
                            <SafeIcon icon={user?.role === 'student' ? FiUser : FiUsers} className="text-xs" />
                            <span>
                              {user?.role === 'student' 
                                ? booking.instructorName 
                                : booking.studentName}
                            </span>
                          </div>
                          {user?.role === 'instructor' && booking.membershipType && (
                            <div className="flex items-center space-x-1">
                              <SafeIcon icon={FiMapPin} className="text-xs" />
                              <span>{booking.membershipType === 'corporate' ? '企業會員' : '個人會員'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>

                    {/* Company Info for Corporate Members */}
                    {user?.role === 'instructor' && booking.companyName && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center space-x-2 text-purple-800">
                          <SafeIcon icon={FiBriefcase} className="text-sm" />
                          <span className="font-medium">企業：{booking.companyName}</span>
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
                      
                      {booking.status === 'upcoming' && (
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
                          
                          {user?.role === 'student' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleCancelBooking(booking.id, booking.courseName)}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                            >
                              <SafeIcon icon={FiX} className="text-xs" />
                              <span>取消預約</span>
                            </motion.button>
                          )}
                          
                          {user?.role === 'instructor' && booking.studentEmail && (
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
                 selectedTab === 'cancelled' ? '暫無已取消的預約' : '暫無預約記錄'}
              </h3>
              <p className="text-gray-600">
                {user?.role === 'student' 
                  ? '您的課程預約記錄會顯示在這裡' 
                  : '學生的課程預約記錄會顯示在這裡'}
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
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  確認取消
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
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