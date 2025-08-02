'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';
import Navigation from '@/components/Navigation';
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

export default function MyBookingsPage() {
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
  const convertBookingData = useCallback((dashboardData: { upcomingClasses: Array<{ appointment?: { id: number; status: string; class_timeslot_id: number; created_at: string }; session: { id: string; date: string; startTime: string; endTime: string; courseTitle: string; sessionTitle: string; teacherName: string; classroom?: string; materials?: string } }> }): (Booking & { canCancel: boolean; appointmentId: number; timeslotId: number })[] => {
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

  // 轉換教師預約資料為 UI 格式的函數
  const convertTeacherBookingData = useCallback((dashboardData: { upcomingClasses: Array<{ appointment: { id: number; status: string; class_timeslot_id: number; created_at: string }; session: { id: string; date: string; startTime: string; endTime: string; courseTitle: string; sessionTitle: string; teacherName: string; classroom?: string; materials?: string }; student: { id: number; name: string; email: string; phone: string } | null }> }): (Booking & { canCancel: boolean; appointmentId: number; timeslotId: number })[] => {
    console.log('🔍 轉換教師預約資料，總數:', dashboardData.upcomingClasses.length);
    
    const convertedData = dashboardData.upcomingClasses.map((item, index) => {
      const startTime = new Date(`${item.session.date} ${item.session.startTime}`);
      const now = new Date();
      const daysFromNow = Math.ceil((startTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      let status: 'upcoming' | 'completed' | 'cancelled';
      if (item.appointment?.status === 'CANCELED') {
        status = 'cancelled';
      } else {
        const endTime = new Date(`${item.session.date} ${item.session.endTime}`);
        // 🔧 修改：只有已開課的課程結束後才變成已完成
        if (endTime < now) {
          status = 'completed';
        } else {
          status = 'upcoming';
        }
      }
      
      const converted = {
        id: `teacher-${item.appointment?.id || item.session.id}-${index}`,
        courseName: `${item.session.courseTitle} - Lesson ${1 || 1} - ${item.session.sessionTitle}`,
        courseTitle: item.session.courseTitle,
        sessionTitle: item.session.sessionTitle,
        sessionNumber: 1,
        courseDate: item.session.date,
        courseTime: `${item.session.startTime}-${item.session.endTime}`,
        status,
        classroom: item.session.classroom || '線上教室',
        materials: item.session.materials,
        // 教師視角：顯示學生資訊
        studentName: item.student?.name || ('學生'),
        studentEmail: item.student?.email || '',
        studentPhone: item.student?.phone || '',
        studentCount: 1, // 🔧 根據狀態設定學生數量
        membershipType: 'individual' as const, // 可以後續擴展
        daysFromNow,
        bookingDate: item.appointment?.created_at || '',
        // UI 控制
        canCancel: false, // 教師通常不能直接取消學生的預約
        appointmentId: item.appointment?.id || 0,
        timeslotId: item.appointment?.class_timeslot_id || 0
      };
      
      console.log('👨‍🏫 轉換教師預約項目:', {
        courseName: converted.courseName,
        studentName: converted.studentName,
        status: converted.status,
        daysFromNow: converted.daysFromNow
      });
      
      return converted;
    });
    
    console.log('👥 教師預約資料轉換完成，總數:', convertedData.length);
    return convertedData;
  }, []);

  // 載入用戶預約資料的通用函數
  const loadUserBookings = useCallback(async (showLoading = true) => {
    if (!user || !['STUDENT', 'TEACHER'].includes(user.role)) {
      if (showLoading) setLoading(false);
      return;
    }

    try {
      if (showLoading) setLoading(true);
      
      console.log('📥 開始載入用戶預約資料 - 用戶ID:', user.id, '角色:', user.role);
      
      if (user.role === 'TEACHER') {
        // 教師：載入學生預約其課程的資料
        const dashboardData = await dashboardService.getDashboardData(user.id, 'TEACHER');
        console.log('👨‍🏫 教師 Dashboard 原始資料:', dashboardData);
        
        // 轉換教師預約資料為UI格式
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const teacherBookingData = convertTeacherBookingData(dashboardData as any);
        
        // 載入並整合請假記錄到現有預約中
        const leaveResult = await leaveService.getAllLeaveRequests();
        let enhancedBookings = [...teacherBookingData];
        
        if (leaveResult.success && leaveResult.data) {
          // 過濾出這個教師的請假記錄
          const teacherLeaveRequests = leaveResult.data.filter((request: {
            teacherId: number;
            id: string;
            courseName: string;
            courseDate: string;
            courseTime: string;
            status: string;
            classroom?: string;
            teacherName: string;
            teacherEmail: string;
            studentCount?: number;
            leaveReason: string;
            requestDate: string;
            note?: string;
            substituteTeacher?: { name: string; email: string } | null;
          }) => 
            request.teacherId === user.id
          );
          
          // 在現有預約記錄上添加請假狀態，而不是創建新記錄
          enhancedBookings = teacherBookingData.map(booking => {
            // 尋找對應的請假記錄
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const matchingLeaveRequest = teacherLeaveRequests.find((request: any) => 
              request.courseName.includes(booking.courseName.split(' - ')[0]) &&
              request.courseDate === booking.courseDate &&
              request.courseTime === booking.courseTime
            );
            
            if (matchingLeaveRequest) {
              // 如果有對應的請假記錄，添加請假狀態到原預約記錄
              return {
                ...booking,
                // 請假相關欄位
                leaveStatus: matchingLeaveRequest.status,
                leaveReason: matchingLeaveRequest.leaveReason,
                requestDate: matchingLeaveRequest.requestDate,
                substituteTeacher: matchingLeaveRequest.substituteTeacher || null,
                leaveId: matchingLeaveRequest.id
              };
            }
            
            return booking;
          });
          
          // 添加那些沒有對應預約記錄的請假記錄（以防萬一）
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const unmatchedLeaveRequests = teacherLeaveRequests.filter((request: any) => 
            !enhancedBookings.some(booking => 
              request.courseName.includes(booking.courseName.split(' - ')[0]) &&
              request.courseDate === booking.courseDate &&
              request.courseTime === booking.courseTime
            )
          );
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const additionalLeaveBookings = unmatchedLeaveRequests.map((request: any) => ({
            id: `leave-${request.id}`,
            courseName: request.courseName,
            courseDate: request.courseDate,
            courseTime: request.courseTime,
            status: 'upcoming' as const,
            classroom: request.classroom || '線上教室',
            materials: '',
            instructorName: request.teacherName,
            instructorEmail: request.teacherEmail,
            studentCount: request.studentCount || 0,
            studentName: `${request.studentCount || 0}位學生`,
            studentEmail: '',
            // 請假特有欄位
            leaveStatus: request.status,
            leaveReason: request.leaveReason,
            requestDate: request.requestDate,
            note: request.note,
            substituteTeacher: request.substituteTeacher || null,
            leaveId: request.id,
            // UI 計算欄位
            daysFromNow: Math.ceil((new Date(`${request.courseDate} ${request.courseTime.split('-')[0]}`).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          }));
          
          enhancedBookings = [...enhancedBookings, ...additionalLeaveBookings];
        }
        
        console.log('🔄 設置教師預約+請假狀態資料，總數:', enhancedBookings.length);
        setBookings(enhancedBookings);
      } else {
        // 學生：使用原有邏輯
        const dashboardData = await dashboardService.getDashboardData(user.id);
        
        console.log('📋 Dashboard原始資料:', dashboardData);
        console.log('📅 upcomingClasses數量:', dashboardData.upcomingClasses.length);
        
        // 轉換為 UI 格式
        const bookingData = convertBookingData(dashboardData);
        console.log('🔄 設置預約資料，總數:', bookingData.length);
        setBookings(bookingData);
      }
    } catch (error) {
      console.error('載入預約資料失敗:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [user, convertBookingData, convertTeacherBookingData]);

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
    // First filter by main tab (for teachers)
    if (user?.role === 'TEACHER') {
      if (selectedMainTab === 'bookings') {
        // 預約分頁：顯示所有預約記錄（包括有請假狀態的）
        // 但排除純請假記錄（那些沒有對應預約的請假申請）
        const isBookingRecord = !booking.id.startsWith('leave-');
        if (!isBookingRecord) return false;
        
        // 在預約分頁中，根據子分頁過濾
        if (selectedTab === 'all') return true;
        return booking.status === selectedTab;
      }
      if (selectedMainTab === 'leave') {
        // 請假分頁：顯示所有有請假狀態的記錄（包括有對應預約的和純請假記錄）
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hasLeaveStatus = (booking as any).leaveStatus || (booking as any).leaveReason;
        if (!hasLeaveStatus) return false;
        
        // 在請假分頁中，根據子分頁過濾（使用 leaveStatus）
        if (selectedTab === 'all') return true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (booking as any).leaveStatus === selectedTab;
      }
    }
    
    // 學生的邏輯保持不變
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
    // 優先檢查請假狀態
    if (booking?.leaveStatus) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      switch ((booking as any).leaveStatus) {
        case 'pending': return 'text-pink-700 bg-pink-50 border-pink-200';     // 待審核請假 - 淺粉紅色
        case 'approved': return 'text-purple-700 bg-purple-50 border-purple-200'; // 已批准請假 - 淺紫色
        case 'rejected': return 'text-red-700 bg-red-50 border-red-200';       // 已拒絕請假 - 淺紅色
        default: return 'text-gray-700 bg-gray-50 border-gray-200';
      }
    }
    
    // 回退：如果有請假原因但沒有明確的請假狀態，使用原邏輯
    if (booking?.leaveReason && !booking?.leaveStatus) {
      switch (status) {
        case 'pending': return 'text-pink-700 bg-pink-50 border-pink-200';     // 待審核請假 - 淺粉紅色
        case 'approved': return 'text-purple-700 bg-purple-50 border-purple-200'; // 已批准請假 - 淺紫色
        case 'rejected': return 'text-red-700 bg-red-50 border-red-200';       // 已拒絕請假 - 淺紅色
        default: return 'text-gray-700 bg-gray-50 border-gray-200';
      }
    }
    
    switch (status) {
      case 'upcoming': 
        // 🔧 教師看到：根據學生數量顯示不同顏色
        if (user?.role === 'TEACHER' && booking) {
          return booking.studentCount > 0 
            ? 'text-green-700 bg-green-50 border-green-200'  // 已開課 - 淺綠色
            : 'text-red-700 bg-red-50 border-red-200';       // 待開課 - 淺紅色
        }
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'completed': return 'text-green-700 bg-green-50 border-green-200';
      case 'cancelled': return 'text-red-700 bg-red-50 border-red-200';
      case 'pending': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'approved': return 'text-green-700 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string, booking?: { studentCount: number; leaveReason?: string; leaveStatus?: string }) => {
    // 優先檢查請假狀態
    if (booking?.leaveStatus) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      switch ((booking as any).leaveStatus) {
        case 'pending': return '待審核請假';
        case 'approved': return '已批准請假';
        case 'rejected': return '已拒絕請假';
        default: return '未知狀態';
      }
    }
    
    // 回退：如果有請假原因但沒有明確的請假狀態，使用原邏輯
    if (booking?.leaveReason && !booking?.leaveStatus) {
      switch (status) {
        case 'pending': return '待審核請假';
        case 'approved': return '已批准請假';
        case 'rejected': return '已拒絕請假';
        default: return '未知狀態';
      }
    }
    
    switch (status) {
      case 'upcoming': 
        // 🔧 教師看到：根據學生數量顯示"待開課"或"已開課"
        if (user?.role === 'TEACHER' && booking) {
          return booking.studentCount > 0 ? '已開課' : '待開課';
        }
        return '即將開始';
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

  const handleCancelRequest = async (requestId: string, courseName: string) => {
    const booking = bookings.find(req => req.id === requestId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (booking && (booking as any).leaveStatus === 'pending') {
      if (confirm(`確定要取消「${courseName}」的請假申請嗎？`)) {
        try {
          // 從 localStorage 找到對應的請假申請 ID
          const leaveRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
          const matchingRequest = leaveRequests.find((request: {
            teacherId: number;
            courseName: string;
            courseDate: string;
            courseTime: string;
            id: string;
          }) => 
            request.teacherId === user?.id &&
            request.courseName.includes(booking.courseTitle || booking.courseName) &&
            request.courseDate === booking.courseDate &&
            request.courseTime === booking.courseTime
          );
          
          if (matchingRequest && user?.id) {
            const result = await leaveService.cancelLeaveRequest(matchingRequest.id, user.id);
            if (result.success) {
              alert('✅ 請假申請已取消');
              // 重新載入數據
              loadUserBookings();
            } else {
              alert('❌ 取消請假申請失敗');
            }
          } else {
            alert('❌ 找不到對應的請假申請');
          }
        } catch (error) {
          console.error('取消請假申請失敗:', error);
          alert('❌ 取消請假申請失敗');
        }
      }
    }
  };

  // 處理請假申請提交
  const handleSubmitLeave = async () => {
    if (!leaveForm.reason.trim()) {
      alert('請填寫請假原因');
      return;
    }

    if (selectedBooking && user) {
      try {
        // 創建請假申請資料
        const requestData = {
          teacherId: user.id,
          teacherName: user.name || '未知教師',
          teacherEmail: user.email || '',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sessionId: (selectedBooking as any).sessionId || selectedBooking.id.toString(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          courseName: (selectedBooking as any).title || selectedBooking.courseName,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          courseDate: (selectedBooking as any).date || selectedBooking.courseDate,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          courseTime: (selectedBooking as any).time || selectedBooking.courseTime,
          reason: leaveForm.reason,
          studentCount: selectedBooking.studentCount || 0,
          classroom: selectedBooking.classroom || '線上教室'
        };

        // 提交請假申請到系統
        const result = await leaveService.createLeaveRequest(requestData);

        if (result.success && result.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const courseTitle = (selectedBooking as any).title || selectedBooking.courseName;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const courseDate = (selectedBooking as any).date || selectedBooking.courseDate;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const courseTime = (selectedBooking as any).time || selectedBooking.courseTime;
          
          alert(`✅ 請假申請已提交成功！

課程：${courseTitle}
時間：${courseDate} ${courseTime}
原因：${leaveForm.reason}

申請編號：${result.data.id}

系統管理員將會審核您的申請，並安排代課老師。
您可以在管理員的「請假管理」頁面查看申請狀態。`);

          // Reset form and close modal
          setLeaveForm({ reason: '' });
          setShowLeaveModal(false);
          setSelectedBooking(null);
          
          // 重新加載數據以反映變更
          loadUserBookings();
        } else {
          alert('❌ 提交請假申請失敗，請稍後再試。');
        }
      } catch (error) {
        console.error('提交請假申請失敗:', error);
        alert('❌ 提交請假申請失敗，請稍後再試。');
      }
    }
  };

  // Get student list for a booking - 根據實際預約資料獲取學生清單
  const getStudentListForBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!booking || booking.studentCount === 0) {
      return []; // 待開課課程沒有學生
    }
    
    // 🔧 對於已開課的課程，從 booking 資料中提取學生資訊
    // 確保 studentName 不是狀態文字（如"待開課"、"未知學生"）
    if (booking.studentName && 
        booking.studentEmail && 
        booking.studentName !== '待開課' && 
        booking.studentName !== '未知學生') {
      return [{
        name: booking.studentName,
        email: booking.studentEmail,
        phone: booking.studentPhone || ''
      }];
    }
    
    return []; // 如果沒有有效學生資訊則返回空陣列
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
                <div>
                  <span className="text-gray-600">課程名稱：</span>
                  <div className="font-medium mt-1 break-words">{selectedBooking.courseName}</div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">上課時間：</span>
                  <span>{formatDate(selectedBooking.courseDate)} {selectedBooking.courseTime}</span>
                </div>
                {selectedBooking.leaveReason && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">學生人數：</span>
                    <span>{selectedBooking.studentCount} 位</span>
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
            ) : user?.role === 'STUDENT' && (
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

            {/* 學生清單 (for teachers viewing bookings) */}
            {user?.role === 'TEACHER' && !selectedBooking.leaveReason && studentList.length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-green-900">學生名單</h4>
                  <span className="text-sm text-green-700">學生人數：{studentList.length}人</span>
                </div>
                <div className="space-y-3">
                  {studentList.map((student, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-600">{student.email}</div>
                          {student.phone && (
                            <div className="text-sm text-gray-600">{student.phone}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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
                    審核狀態：{getStatusText(selectedBooking.status, { ...selectedBooking, studentCount: selectedBooking.studentCount || 0 })}
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
            {!selectedBooking.leaveReason && (() => {
              // 🔧 動態獲取課程連結：根據課程名稱和Lesson編號從課程模組中查找
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{user?.role === 'TEACHER' ? '我的預約' : '我的預約與請假'}</h1>
          <p className="text-gray-600">
            {user?.role === 'STUDENT' 
              ? '查看您預約的課程和上課詳情' 
              : '查看學生預約您的課程情況與您的請假記錄'}
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
              count: user?.role === 'STUDENT' 
                ? bookings.filter(b => b.status === 'upcoming').length
                : bookings.filter(b => b.status === 'upcoming').length,
              color: 'text-blue-600 bg-blue-50 border-blue-200',
              icon: FiClock
            },
            { 
              label: '已完成', 
              count: user?.role === 'STUDENT' 
                ? bookings.filter(b => b.status === 'completed').length
                : bookings.filter(b => b.status === 'completed' && !b.leaveReason).length,
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


        {/* Main Tab Navigation for Teachers */}
        {user?.role === 'TEACHER' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
              <motion.button
                onClick={() => {
                  setSelectedMainTab('bookings');
                  setSelectedTab('upcoming');
                }}
                className={`flex-1 px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  selectedMainTab === 'bookings'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                預約
              </motion.button>
              <motion.button
                onClick={() => {
                  setSelectedMainTab('leave');
                  setSelectedTab('pending');
                }}
                className={`flex-1 px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  selectedMainTab === 'leave'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                請假
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Sub Tab Navigation */}
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
              // Teacher tabs - show different tabs based on selectedMainTab
              selectedMainTab === 'bookings' ? [
                { key: 'upcoming', label: '即將開始', count: bookings.filter(b => b.status === 'upcoming' && !b.id.startsWith('leave-')).length },
                { key: 'completed', label: '已完成', count: bookings.filter(b => b.status === 'completed' && !b.id.startsWith('leave-')).length },
                { key: 'cancelled', label: '已取消', count: bookings.filter(b => b.status === 'cancelled' && !b.id.startsWith('leave-')).length },
                { key: 'all', label: '全部', count: bookings.filter(b => !b.id.startsWith('leave-')).length }
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
              )) : [
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                { key: 'pending', label: '待審核請假', count: bookings.filter(b => (b as any).leaveStatus === 'pending').length },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any  
                { key: 'approved', label: '已批准請假', count: bookings.filter(b => (b as any).leaveStatus === 'approved').length },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                { key: 'rejected', label: '已拒絕請假', count: bookings.filter(b => (b as any).leaveStatus === 'rejected').length },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                { key: 'all', label: '全部', count: bookings.filter(b => (b as any).leaveStatus || (b as any).leaveReason).length }
              ].map((tab) => (
                <motion.button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key as 'pending' | 'approved' | 'rejected' | 'all')}
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
                            <SafeIcon icon={user?.role === 'STUDENT' ? FiUser : (booking.leaveReason ? FiUserCheck : FiUsers)} className="text-xs" />
                            <span>
                              {user?.role === 'STUDENT' 
                                ? booking.instructorName 
                                : `${booking.studentCount} 位學生`}
                            </span>
                          </div>
                          {/* 移除會員類型顯示 */}
                          {user?.role === 'TEACHER' && booking.leaveReason && (
                            <div className="flex items-center space-x-1">
                              <SafeIcon icon={FiMessageSquare} className="text-xs" />
                              <span>{booking.leaveReason}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(booking.status, { ...booking, studentCount: booking.studentCount || 0 })}`}>
                        {getStatusText(booking.status, { ...booking, studentCount: booking.studentCount || 0 })}
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
                      {user?.role === 'TEACHER' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedBooking(booking);
                            if (user?.role === 'TEACHER' && !booking.leaveReason) {
                              setStudentList(getStudentListForBooking(booking.id));
                            }
                            setShowDetailModal(true);
                          }}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                        >
                          <SafeIcon icon={FiEye} className="text-xs" />
                          <span>查看詳情</span>
                        </motion.button>
                      )}
                      
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
                          
                      {user?.role === 'STUDENT' && (() => {
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
                          
                      {user?.role === 'TEACHER' && (() => {
                        // 根據請假狀態顯示不同的按鈕
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        if ((booking as any).leaveStatus === 'pending') {
                          // 待審核狀態：顯示取消請假按鈕
                          return (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleCancelRequest(booking.id, booking.courseName)}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                            >
                              <SafeIcon icon={FiX} className="text-xs" />
                              <span>取消請假</span>
                            </motion.button>
                          );
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        } else if ((booking as any).leaveStatus === 'approved') {
                          // 已批准狀態：顯示查看請假按鈕
                          return (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                const courseForLeave = {
                                  id: booking.id,
                                  title: booking.courseName,
                                  courseTitle: booking.courseTitle,
                                  date: booking.courseDate,
                                  time: booking.courseTime,
                                  studentCount: booking.studentCount || 0,
                                  classroom: booking.classroom || '線上教室'
                                };
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                setSelectedBooking(courseForLeave as any);
                                setIsViewMode(true);
                                
                                // 從 localStorage 獲取該課程的請假申請詳情
                                try {
                                  const leaveRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
                                  const courseTime = booking.courseTime;
                                  const matchingRequest = leaveRequests.find((request: {
                                    teacherId: number;
                                    courseName: string;
                                    courseDate: string;
                                    courseTime: string;
                                    leaveReason: string;
                                  }) => 
                                    request.teacherId === user?.id &&
                                    request.courseName.includes(booking.courseTitle || booking.courseName) &&
                                    request.courseDate === booking.courseDate &&
                                    request.courseTime === courseTime
                                  );
                                  
                                  if (matchingRequest) {
                                    setLeaveForm({
                                      reason: matchingRequest.leaveReason || ''
                                    });
                                  }
                                } catch (error) {
                                  console.error('獲取請假詳情失敗:', error);
                                  setLeaveForm({ reason: '' });
                                }
                                
                                setShowLeaveModal(true);
                              }}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                            >
                              <SafeIcon icon={FiEye} className="text-xs" />
                              <span>查看請假</span>
                            </motion.button>
                          );
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        } else if ((booking as any).leaveStatus === 'rejected') {
                          // 已拒絕狀態：可以重新申請
                          return (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                const courseForLeave = {
                                  id: booking.id,
                                  title: booking.courseName,
                                  date: booking.courseDate,
                                  time: booking.courseTime,
                                  studentCount: booking.studentCount || 0,
                                  classroom: booking.classroom || '線上教室'
                                };
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                setSelectedBooking(courseForLeave as any);
                                setIsViewMode(false);
                                setLeaveForm({ reason: '' }); // 清空表單重新申請
                                setShowLeaveModal(true);
                              }}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm"
                            >
                              <SafeIcon icon={FiMessageSquare} className="text-xs" />
                              <span>重新申請</span>
                            </motion.button>
                          );
                        } else {
                          // 沒有請假狀態：顯示申請請假按鈕
                          return (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                const courseForLeave = {
                                  id: booking.id,
                                  title: booking.courseName,
                                  date: booking.courseDate,
                                  time: booking.courseTime,
                                  studentCount: booking.studentCount || 0,
                                  classroom: booking.classroom || '線上教室'
                                };
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                setSelectedBooking(courseForLeave as any);
                                setIsViewMode(false);
                                setLeaveForm({ reason: '' });
                                setShowLeaveModal(true);
                              }}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm"
                            >
                              <SafeIcon icon={FiMessageSquare} className="text-xs" />
                              <span>申請請假</span>
                            </motion.button>
                          );
                        }
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

        {/* Leave Request Modal */}
        {showLeaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowLeaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{isViewMode ? '查看請假' : '申請請假'}</h3>
                <button
                  onClick={() => setShowLeaveModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <SafeIcon icon={FiX} className="text-xl" />
                </button>
              </div>

              {selectedBooking && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">課程資訊</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <div>課程：{(selectedBooking as any).title || selectedBooking.courseName}</div>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <div>時間：{formatDate((selectedBooking as any).date || selectedBooking.courseDate)} {(selectedBooking as any).time || selectedBooking.courseTime}</div>
                    <div>學生：{selectedBooking.studentCount || 0} 位</div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    請假原因 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={leaveForm.reason}
                    onChange={isViewMode ? undefined : (e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                    rows={4}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                      isViewMode 
                        ? 'bg-gray-100 cursor-not-allowed' 
                        : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    placeholder={isViewMode ? '' : "請詳細說明請假原因..."}
                    disabled={isViewMode}
                    readOnly={isViewMode}
                    required={!isViewMode}
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                {isViewMode ? (
                  <button
                    onClick={() => setShowLeaveModal(false)}
                    className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    關閉
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSubmitLeave}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      提交申請
                    </button>
                    <button
                      onClick={() => setShowLeaveModal(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      取消
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}