'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';

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

  // Mock data for teachers (courses booked by students and leave requests)
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
    },
    // Leave requests for teachers
    {
      id: 'leave-1',
      courseName: '商務華語會話',
      courseDate: '2025-01-25',
      courseTime: '09:00-10:30',
      leaveReason: '身體不適',
      note: '突然發燒，不適宜上課',
      requestDate: '2025-01-20',
      status: 'pending',
      studentCount: 12,
      classroom: 'https://meet.google.com/abc-def-ghi',
      daysFromNow: 2,
      bookingDate: '2025-01-20' // Using bookingDate for consistency, though it's requestDate for leave
    },
    {
      id: 'leave-2',
      courseName: '華語文法精修',
      courseDate: '2025-01-28',
      courseTime: '14:00-15:30',
      leaveReason: '參加學術會議',
      note: '參加台灣華語教學研討會',
      requestDate: '2025-01-18',
      status: 'approved',
      studentCount: 8,
      classroom: 'https://meet.google.com/def-ghi-jkl',
      substituteTeacher: {
        name: '陳老師',
        email: 'teacher.chen@tli.com'
      },
      adminNote: '已安排陳老師代課，請提前準備教材交接。',
      daysFromNow: 5,
      bookingDate: '2025-01-18'
    },
    {
      id: 'leave-3',
      courseName: '華語聽力強化',
      courseDate: '2025-01-22',
      courseTime: '10:00-11:30',
      leaveReason: '家庭緊急事務',
      note: '家人住院需要照顧',
      requestDate: '2025-01-19',
      status: 'rejected',
      studentCount: 15,
      classroom: 'https://meet.google.com/ghi-jkl-mno',
      adminNote: '此時段無可用代課老師，建議調整課程時間或提前安排。',
      daysFromNow: -1,
      bookingDate: '2025-01-19'
    },
    {
      id: 'leave-4',
      courseName: '商務華語寫作',
      courseDate: '2025-01-15',
      courseTime: '15:00-16:30',
      leaveReason: '個人事務',
      note: '需要處理重要個人事務',
      requestDate: '2025-01-10',
      status: 'approved',
      studentCount: 10,
      classroom: 'https://meet.google.com/jkl-mno-pqr',
      substituteTeacher: {
        name: '劉老師',
        email: 'teacher.liu@tli.com'
      },
      daysFromNow: -8,
      bookingDate: '2025-01-10'
    }
  ];

  // Use appropriate data based on user role
  const bookings = user?.role === 'student' ? studentBookings : teacherBookings;

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
            {user?.role === 'student' 
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
            {user?.role === 'student' ? (
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
                            <SafeIcon icon={user?.role === 'student' ? FiUser : (booking.leaveReason ? FiUserCheck : FiUsers)} className="text-xs" />
                            <span>
                              {user?.role === 'student' 
                                ? booking.instructorName 
                                : (booking.leaveReason ? `${booking.studentCount} 位學生` : booking.studentName)}
                            </span>
                          </div>
                          {user?.role === 'instructor' && !booking.leaveReason && booking.membershipType && (
                            <div className="flex items-center space-x-1">
                              <SafeIcon icon={FiMapPin} className="text-xs" />
                              <span>{booking.membershipType === 'corporate' ? '企業會員' : '個人會員'}</span>
                            </div>
                          )}
                          {user?.role === 'instructor' && booking.leaveReason && (
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
                    {user?.role === 'instructor' && !booking.leaveReason && booking.companyName && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center space-x-2 text-purple-800">
                          <SafeIcon icon={FiBriefcase} className="text-sm" />
                          <span className="font-medium">企業：{booking.companyName}</span>
                        </div>
                      </div>
                    )}

                    {/* Substitute Teacher Info */}
                    {user?.role === 'instructor' && booking.leaveReason && booking.substituteTeacher && (
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

                      {user?.role === 'instructor' && booking.status === 'pending' && booking.leaveReason && (
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
                {user?.role === 'student' 
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