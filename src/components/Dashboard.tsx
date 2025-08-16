'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import { useAuth } from '@/contexts/AuthContext';
import ReferralSystem from './ReferralSystem';
import MembershipCard from './MembershipCard';
import { dashboardService, leaveService, bookingService } from '@/services/dataService';
import { teacherDataService } from '@/data/teachers';
import { Membership, ClassAppointment } from '@/types';
import { getCourseLinksFromBooking } from '@/utils/courseLinksUtils';
import { corporateMemberStore } from '@/lib/corporateMemberStore';
// 調試工具已移除

interface BookedCourse {
  appointment: ClassAppointment;
  session: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    courseTitle: string;
    sessionTitle: string;
    sessionNumber?: number;
    teacherName: string;
    courseId: string;
    capacity: number;
    currentEnrollments: number;
    classroom?: string;
    materials?: string;
    status?: string;
  };
  timeslot: {
    id: number;
    start_time: string;
    end_time: string;
    class_id: string;
  };
  class: {
    id: string;
    course_id: string;
  };
  course: {
    id: string;
    title: string;
  };
}

const {
  FiCalendar,
  FiTrendingUp,
  FiClock,
  FiUsers,
  FiBarChart,
  FiAward,
  FiExternalLink,
  FiEye,
  FiX,
  FiCheckCircle,
  FiBook,
  FiUser
} = FiIcons;

interface Course {
  id: number | string;
  title?: string;
  courseName?: string;
  teacher?: string;
  students?: string;
  studentName?: string;
  studentEmail?: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  classroom: string;
  materials: string;
  daysFromNow: number;
  membershipType?: 'individual' | 'corporate';
  companyName?: string | null;
  // 新增學生相關欄位
  appointmentId?: number;
  timeslotId?: number;
  canCancel?: boolean;
  // 新增老師相關欄位
  sessionId?: string;
  studentList?: Array<{
    id: number;
    name: string;
    email: string;
  }>;
}

const Dashboard = () => {
  const { user, hasActiveMembership } = useAuth();
  const [dashboardData, setDashboardData] = useState<{
    membership: Membership | null;
    upcomingClasses: BookedCourse[];
  } | null>(null);
  // 移除不再使用的 teacherCourses state，教師現在使用 dashboardData
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Course | null>(null);
  const [studentList, setStudentList] = useState<Array<{name: string; email: string; phone?: string}>>([]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  // Get student list for a booking - 根據實際預約資料獲取學生清單
  const getStudentListForBooking = (course: Course) => {
    if (!course || (course as { studentCount?: number }).studentCount === 0) {
      return []; // 待開課課程沒有學生
    }
    
    // 🔧 對於已開課的課程，從課程資料中提取學生資訊
    const courseAny = course as { studentName?: string; studentEmail?: string; studentPhone?: string };
    if (courseAny.studentName && 
        courseAny.studentEmail && 
        courseAny.studentName !== '待開課' && 
        courseAny.studentName !== '未安排學生') {
      return [{
        name: courseAny.studentName,
        email: courseAny.studentEmail,
        phone: courseAny.studentPhone || ''
      }];
    }
    
    return []; // 如果沒有有效學生資訊則返回空陣列
  };

  // 載入 Dashboard 資料 (US09)
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        if (user.roles.includes('STUDENT')) {
          const data = await dashboardService.getDashboardData(user.id);
          setDashboardData(data as { membership: Membership | null; upcomingClasses: BookedCourse[] });
        } else if (user.roles.includes('TEACHER')) {
          // 🔧 教師也使用 getDashboardData，與我的預約頁面保持一致
          const data = await dashboardService.getDashboardData(user.id, 'TEACHER');
          setDashboardData(data as { membership: Membership | null; upcomingClasses: BookedCourse[] });
        } else if (user.roles.includes('CORPORATE_CONTACT')) {
          // 載入當前企業的會員統計數據（假設企業窗口用戶有corp_id）
          const userCorpId = user.corp_id || '1'; // 假設默認為台積電
          
          // 只獲取當前企業的會員數據
          const companyMembers = await corporateMemberStore.getMembersByCompany(userCorpId);
          
          // 計算各狀態的會員數量
          const activeMembers = companyMembers.filter(m => m.card_status === 'activated').length;
          const inactiveMembers = companyMembers.filter(m => m.card_status === 'inactive').length;
          const expiredMembers = companyMembers.filter(m => m.card_status === 'expired').length;
          const cancelledMembers = companyMembers.filter(m => m.card_status === 'cancelled').length;
          const testMembers = companyMembers.filter(m => m.card_status === 'test').length;
          
          setCorporateStats({
            activePlans: 1, // 當前企業的方案數量（可以從企業訂閱數據獲取）
            totalMembers: companyMembers.length,
            testMembers,
            inactiveMembers,
            activeMembers,
            expiredMembers,
            cancelledMembers
          });
        }
      } catch (error) {
        console.error('載入 Dashboard 資料失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // 監聽頁面焦點變化和 localStorage 變化，重新載入資料
  useEffect(() => {
    const handleFocus = () => {
      // 當用戶從課程預約頁面返回時重新載入資料
      if (user?.roles.includes('STUDENT')) {
        dashboardService.getDashboardData(user.id).then(data => {
          setDashboardData(data as any);
        });
      } else if (user?.roles.includes('TEACHER')) {
        // 🔧 教師也使用相同的數據載入方式
        dashboardService.getDashboardData(user.id, 'TEACHER').then(data => {
          setDashboardData(data as any);
        });
      }
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
  }, [user]);
  
  // 權限檢查函數
  const [courseTab, setCourseTab] = useState('upcoming'); // 'upcoming' or 'completed'
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showCourseDetailsModal, setShowCourseDetailsModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [leaveForm, setLeaveForm] = useState({
    reason: ''
  });
  const [isViewMode, setIsViewMode] = useState(false);
  
  // 企業儀表板篩選狀態 (預留未來使用)
  // const [corporateFilters, setCorporateFilters] = useState({
  //   company: '',
  //   plan: '',
  //   status: ''
  // });
  
  // 企業會員統計數據（只顯示當前企業的數據）
  const [corporateStats, setCorporateStats] = useState({
    activePlans: 1, // 當前企業的方案數量
    totalMembers: 50, // 當前企業的總會員數
    testMembers: 2, // 當前企業的測試會員
    inactiveMembers: 15, // 當前企業未啟用會員
    activeMembers: 25, // 當前企業啟用會員
    expiredMembers: 5, // 當前企業過期會員
    cancelledMembers: 3 // 當前企業取消會員
  });
  
  // 取消預約相關狀態
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedCancelBooking, setSelectedCancelBooking] = useState<Course | null>(null);
  const [cancelForm, setCancelForm] = useState({
    reason: ''
  });
  const [cancelling, setCancelling] = useState(false);

  // 會員卡啟用處理函數 (US04)
  const handleActivateMembership = async (membershipId: number) => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        alert('請先登入');
        return;
      }

      const response = await fetch(`/api/member-cards/${membershipId}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        // 立即更新本地狀態，不等待 API 重新載入
        if (dashboardData?.membership) {
          const updatedMembership = {
            ...dashboardData.membership,
            status: 'activated' as const,
            activated: true,
            activation_date: new Date().toISOString(),
            expiry_date: new Date(Date.now() + (dashboardData.membership.duration_days || 365) * 24 * 60 * 60 * 1000).toISOString()
          };
          
          setDashboardData({
            ...dashboardData,
            membership: updatedMembership
          });
          
          console.log('✅ 本地狀態已立即更新:', updatedMembership);
        }
        
        alert('會員卡啟用成功！');
        
        // 延遲重新載入 Dashboard 資料以確保後端狀態同步
        setTimeout(async () => {
          if (user) {
            try {
              const data = await dashboardService.getDashboardData(user.id);
              console.log('🔄 後端重新載入的資料:', data);
              
              // 只有當後端資料確實是 ACTIVE 狀態時才更新
              if (data.membership && data.membership.status === 'activated') {
                setDashboardData(data as any);
                console.log('✅ Dashboard 資料已從後端重新載入 (ACTIVE):', data);
              } else {
                console.log('⚠️ 後端資料狀態不是 ACTIVE，保持本地狀態');
              }
            } catch (error) {
              console.error('❌ 重新載入 Dashboard 資料失敗:', error);
            }
          }
        }, 1000);
      } else {
        if (result.error === 'ACTIVE_CARD_EXISTS') {
          alert('您已有啟用中的會員卡，無法重複啟用');
        } else if (result.error === 'MEMBERSHIP_NOT_FOUND') {
          alert('找不到可啟用的會員卡');
        } else {
          alert(`啟用失敗：${result.message || result.error}`);
        }
      }
    } catch (error) {
      console.error('啟用會員卡時發生錯誤:', error);
      alert('啟用失敗，請稍後再試');
    }
  };



  const getQuickStats = () => {
    if (user?.roles.includes('STUDENT')) {
      if (!dashboardData || loading) {
        return [
          { label: '已預約課程', value: '-', icon: FiBook },
          { label: '本月課程', value: '-', icon: FiCalendar },
          { label: '學習時數', value: '-', icon: FiClock },
          { label: '會員狀態', value: '-', icon: FiTrendingUp }
        ];
      }
      const allCourses = getBookedCourses();
      const upcomingCourses = allCourses.filter(c => c.status === 'upcoming' && (c as any).leaveStatus !== 'approved');
      const completedCourses = allCourses.filter(c => c.status === 'completed');
      
      // 計算本月課程
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonthCourses = allCourses.filter(c => {
        const courseDate = new Date(c.date);
        return courseDate.getMonth() === currentMonth && courseDate.getFullYear() === currentYear;
      });

      // 計算學習時數 (假設每堂課1.5小時)
      const totalHours = completedCourses.length * 1.5;

      return [
        { label: '已預約課程', value: upcomingCourses.length.toString(), icon: FiBook },
        { label: '本月課程', value: thisMonthCourses.length.toString(), icon: FiCalendar },
        { label: '學習時數', value: `${totalHours}h`, icon: FiClock },
        { label: '會員狀態', value: hasActiveMembership() ? '已啟用' : '未啟用', icon: FiTrendingUp }
      ];
    }

    if (user?.roles.includes('TEACHER')) {
      // 🔧 使用教師管理系統的真實數據
      const teacherInSystem = teacherDataService.getTeacherByEmail(user.email);
      
      // 從教師課程數據計算統計（如果已載入）
      const allCourses = getTeacherCourses() || [];
      
      // 計算本月課程
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonthCourses = allCourses.filter(c => {
        const courseDate = new Date(c.date);
        return courseDate.getMonth() === currentMonth && courseDate.getFullYear() === currentYear;
      });
      
      // 計算總學生人數（從課程中的學生列表去重）
      const allStudentEmails = new Set();
      allCourses.forEach(course => {
        if (course.studentList && Array.isArray(course.studentList)) {
          course.studentList.forEach(student => {
            if (student.email) allStudentEmails.add(student.email);
          });
        }
      });
      
      return [
        { label: '教授課程', value: allCourses.length.toString(), icon: FiBook },
        { label: '學生人數', value: allStudentEmails.size.toString(), icon: FiUsers },
        { label: '本月課程', value: thisMonthCourses.length.toString(), icon: FiCalendar },
        { label: '評分', value: teacherInSystem?.rating?.toFixed(1) || '0.0', icon: FiAward }
      ];
    }


    if (user?.roles.includes('STAFF') || user?.roles.includes('ADMIN')) {
      return [
        { label: '總用戶數', value: '1,234', icon: FiUsers },
        { label: '總課程數', value: '156', icon: FiBook },
        { label: '本月預約', value: '89', icon: FiCalendar },
        { label: '系統使用率', value: '92%', icon: FiBarChart }
      ];
    } else if (user?.roles.includes('CORPORATE_CONTACT')) {
      return []; // 企業窗口不顯示快速統計區塊
    }

    return [];
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = '您好';
    if (hour < 12) greeting = '早安';
    else if (hour < 18) greeting = '午安';
    else greeting = '晚安';

    return `${greeting}，${user?.name}！`;
  };

  const getRoleDescription = () => {
    switch (user?.roles[0]) {
      case 'STUDENT': return '歡迎使用 TLI Connect，開始您的學習之旅！';
      case 'TEACHER': return '歡迎回到教師管理面板，管理您的課程與學生。';
      case 'STAFF': return '歡迎使用職員面板，管理系統設定與用戶。';
      case 'ADMIN': return '歡迎使用管理員面板，您擁有系統最高權限。';
      case 'CORPORATE_CONTACT': return '歡迎使用企業窗口管理面板，管理您的企業會員與課程安排。';
      default: return '歡迎使用 TLI Connect 系統！';
    }
  };

  // 使用真實數據 - 學生預約的課程（從課程預約日曆系統）
  const getBookedCourses = (): Course[] => {
    if (!dashboardData?.upcomingClasses || loading) return [];
    
    console.log('📊 Dashboard getBookedCourses - 原始資料數量:', dashboardData.upcomingClasses.length);
    
    // 只處理 CONFIRMED 狀態的預約，過濾掉已取消的預約
    const confirmedAppointments = dashboardData.upcomingClasses.filter(item => 
      !item.appointment || item.appointment.status === 'CONFIRMED'
    );
    
    console.log('📊 過濾後的 CONFIRMED 預約數量:', confirmedAppointments.length);
    
    const courses = confirmedAppointments.map((item) => {
      // 使用課程預約日曆系統的真實資料
      const startTime = new Date(`${item.session.date} ${item.session.startTime}`);
      const now = new Date();
      const daysFromNow = Math.ceil((startTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      let status: 'upcoming' | 'completed' | 'cancelled';
      
      // 由於已經過濾了 CANCELED 預約，這裡只需要判斷 upcoming 還是 completed
      const endTime = new Date(`${item.session.date} ${item.session.endTime}`);
      if (endTime < now) {
        status = 'completed';
      } else {
        status = 'upcoming';
      }
      
      // 創建唯一的課程ID，結合appointment ID和session信息
      const uniqueId = item.appointment?.id 
        ? `student-appointment-${item.appointment.id}` 
        : `student-session-${item.session.id}-${item.session.date}-${item.session.startTime}`;
      
      const courseData = {
        id: uniqueId,
        title: `${item.session.courseTitle} - Lesson ${item.session.sessionNumber || 1} - ${item.session.sessionTitle}`,
        courseTitle: item.session.courseTitle,
        sessionTitle: item.session.sessionTitle,
        sessionNumber: item.session.sessionNumber,
        teacher: item.session.teacherName,
        date: item.session.date,
        time: `${item.session.startTime}-${item.session.endTime}`,
        status,
        classroom: item.session.classroom || '待安排',
        materials: item.session.materials || '待公佈',
        daysFromNow,
        // 新增學生需要的額外資訊
        appointmentId: item.appointment?.id,
        timeslotId: item.appointment?.class_timeslot_id,
        canCancel: status === 'upcoming' && daysFromNow > 1 && item.appointment?.status === 'CONFIRMED'
      };
      
      // 調試：檢查appointmentId和appointment狀態
      console.log('🔍 Dashboard課程資料:', {
        courseTitle: courseData.title,
        appointmentId: courseData.appointmentId,
        appointmentIdType: typeof courseData.appointmentId,
        appointmentStatus: item.appointment?.status,
        canCancel: courseData.canCancel,
        sessionId: item.session.id,
        fullAppointment: item.appointment,
        appointmentKeys: item.appointment ? Object.keys(item.appointment) : 'no appointment'
      });
      
      return courseData;
    });

    // Sort by date (upcoming first, then by closest date)
    return courses.sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return a.daysFromNow - b.daysFromNow;
    });
  };

  // 🔧 使用與「我的預約」頁面相同的數據源
  const getTeacherCourses = (): Course[] => {
    if (!dashboardData || loading) return [];

    // 獲取請假狀態
    const getLeaveStatus = (courseName: string, courseDate: string, courseTime: string) => {
      try {
        const leaveRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
        const matchingRequest = leaveRequests.find((request: {
          teacherId: number;
          courseName: string;
          courseDate: string;
          courseTime: string;
          status: string;
        }) => 
          request.teacherId === user?.id &&
          request.courseName.includes(courseName.split(' - ')[0]) &&
          request.courseDate === courseDate &&
          request.courseTime === courseTime
        );
        return matchingRequest ? matchingRequest.status : null;
      } catch {
        return null;
      }
    };
    
    // 使用與 my-bookings 頁面相同的數據轉換邏輯
    const convertTeacherData = (data: { upcomingClasses?: Array<{ session: { date: string; startTime: string; endTime: string }; studentCount: number; course: { name: string }; classId: string }> }) => {
      if (!data.upcomingClasses) return [];
      
      return data.upcomingClasses.map((item, index) => {
        const startTime = new Date(`${item.session.date} ${item.session.startTime}`);
        const now = new Date();
        const daysFromNow = Math.ceil((startTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        let status: 'upcoming' | 'completed' | 'cancelled';
        if ((item as any).appointment?.status === 'CANCELED') {
          status = 'cancelled';
        } else {
          const endTime = new Date(`${item.session.date} ${item.session.endTime}`);
          // 🔧 修改：只有已開課的課程結束後才變成已完成
          if (endTime < now && (item.session as any).bookingStatus === 'opened') {
            status = 'completed';
          } else {
            status = 'upcoming';
          }
        }
        
        const courseTime = `${item.session.startTime}-${item.session.endTime}`;
        const leaveStatus = getLeaveStatus((item.session as any).courseTitle, item.session.date, courseTime);
        
        return {
          id: `teacher-${(item as any).appointment?.id || (item.session as any).id}-${index}`,
          title: `${(item.session as any).courseTitle} - Lesson ${(item.session as any).sessionNumber || 1} - ${(item.session as any).sessionTitle}`,
          courseTitle: (item.session as any).courseTitle,
          sessionTitle: (item.session as any).sessionTitle,
          sessionNumber: (item.session as any).sessionNumber,
          students: (item.session as any).bookingStatus === 'opened' ? '1 位學生' : '0 位學生', // 🔧 顯示學生數字
          date: item.session.date,
          time: courseTime,
          status,
          classroom: (item.session as any).classroom || '線上教室',
          materials: (item.session as any).materials || '待公佈',
          daysFromNow,
          // 教師專用欄位
          studentName: (item as any).student?.name || ((item.session as any).bookingStatus === 'pending' ? '待開課' : '未安排學生'),
          studentEmail: (item as any).student?.email || '',
          studentCount: (item.session as any).bookingStatus === 'opened' ? 1 : 0, // 🔧 根據狀態設定學生數量
          appointmentId: (item as any).appointment?.id || 0,
          // 請假狀態
          leaveStatus: leaveStatus
        };
      });
    };

    const courses = convertTeacherData(dashboardData as any);

    // Sort by date (upcoming first, then by closest date)
    return courses.sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return a.daysFromNow - b.daysFromNow;
    });
  };

  // 企業窗口專用：企業員工課程數據
  const getCorporateCourses = (): Course[] => {
    // 🔧 使用教師管理系統獲取教師資料
    const teachers = teacherDataService.getAllTeachers();
    
    // 只有當前企業窗口用戶所屬公司的課程資料
    if (!user?.corp_id) {
      return []; // 如果沒有公司ID，返回空數組
    }
    
    // 根據公司ID獲取公司資料
    const corpId = user.corp_id;
    let companyName = '';
    let courseData: Course[] = [];
    
    // 根據公司ID設定對應的課程資料
    if (corpId === '1') {
      companyName = '台積電股份有限公司';
      courseData = [
        {
          id: 'tsmc-1',
          studentName: '張工程師',
          studentEmail: 'zhang.engineer@tsmc.com',
          courseName: '商務華語會話',
          teacher: teachers[0]?.name || '王老師',
          date: '2025-01-15',
          time: '14:00-15:30',
          status: 'upcoming' as const,
          classroom: '教室A',
          materials: '商務會話教材',
          daysFromNow: 3,
          membershipType: 'corporate' as const,
          companyName
        },
        {
          id: 'tsmc-2',
          studentName: '李主任',
          studentEmail: 'li.director@tsmc.com',
          courseName: '華語文法精修',
          teacher: teachers[1]?.name || '李老師',
          date: '2025-01-16',
          time: '10:00-11:30',
          status: 'upcoming' as const,
          classroom: '教室B',
          materials: '文法練習本',
          daysFromNow: 4,
          membershipType: 'corporate' as const,
          companyName
        },
        {
          id: 'tsmc-3',
          studentName: '王協理',
          studentEmail: 'wang.manager@tsmc.com',
          courseName: '華語聽力強化',
          teacher: teachers[2]?.name || '張老師',
          date: '2025-01-17',
          time: '16:00-17:30',
          status: 'upcoming' as const,
          classroom: '教室C',
          materials: '聽力訓練CD',
          daysFromNow: 5,
          membershipType: 'corporate' as const,
          companyName
        },
        {
          id: 'tsmc-4',
          studentName: '林經理',
          studentEmail: 'lin.manager@tsmc.com',
          courseName: '商務華語會話',
          teacher: teachers[0]?.name || '王老師',
          date: '2025-01-10',
          time: '14:00-15:30',
          status: 'completed' as const,
          classroom: '教室A',
          materials: '商務會話教材',
          daysFromNow: -2,
          membershipType: 'corporate' as const,
          companyName
        }
      ];
    } else if (corpId === '2') {
      companyName = '富邦金融控股股份有限公司';
      courseData = [
        {
          id: 'fubon-1',
          studentName: '陳襄理',
          studentEmail: 'chen.assistant@fubon.com',
          courseName: '金融華語專班',
          teacher: teachers[0]?.name || '王老師',
          date: '2025-01-18',
          time: '09:00-10:30',
          status: 'upcoming' as const,
          classroom: '教室D',
          materials: '金融華語教材',
          daysFromNow: 6,
          membershipType: 'corporate' as const,
          companyName
        }
      ];
    } else if (corpId === '3') {
      companyName = '中華電信股份有限公司';
      courseData = [
        {
          id: 'cht-1',
          studentName: '黃專員',
          studentEmail: 'huang.specialist@cht.com.tw',
          courseName: '電信華語課程',
          teacher: teachers[1]?.name || '李老師',
          date: '2025-01-19',
          time: '15:00-16:30',
          status: 'upcoming' as const,
          classroom: '教室E',
          materials: '電信專業華語',
          daysFromNow: 7,
          membershipType: 'corporate' as const,
          companyName
        }
      ];
    }
    
    return courseData;
  };

  // 管理員專用：全體會員預約數據
  const getAllMemberBookings = (): Course[] => {
    // 🔧 使用教師管理系統獲取教師資料
    const teachers = teacherDataService.getAllTeachers();
    
    const bookings: Course[] = [
      // Individual member bookings
      {
        id: 'admin-1',
        studentName: '王小明',
        studentEmail: 'student1@example.com',
        courseName: '華語文法精修',
        teacher: teachers[0]?.name || '王老師',
        date: '2025-01-20',
        time: '09:00-10:30',
        status: 'upcoming',
        classroom: 'https://meet.google.com/abc-def-ghi',
        materials: 'https://drive.google.com/file/d/example1',
        daysFromNow: 1,
        membershipType: 'individual',
        companyName: null
      },
      {
        id: 'admin-2',
        studentName: '林小雅',
        studentEmail: 'student2@example.com',
        courseName: '華語文法精修',
        teacher: teachers[0]?.name || '王老師',
        date: '2025-01-22',
        time: '14:00-15:30',
        status: 'upcoming',
        classroom: 'https://meet.google.com/def-ghi-jkl',
        materials: 'https://drive.google.com/file/d/example2',
        daysFromNow: 3,
        membershipType: 'individual',
        companyName: null
      },
      // Corporate member bookings - 台灣科技股份有限公司
      {
        id: 'admin-3',
        studentName: '王小明',
        studentEmail: 'user1@taiwantech.com',
        courseName: '商務華語會話',
        teacher: teachers[2]?.name || '張老師',
        date: '2025-01-21',
        time: '10:00-11:30',
        status: 'upcoming',
        classroom: 'https://meet.google.com/ghi-jkl-mno',
        materials: 'https://drive.google.com/file/d/example3',
        daysFromNow: 2,
        membershipType: 'corporate',
        companyName: '台灣科技股份有限公司'
      },
      {
        id: 'admin-4',
        studentName: '李小華',
        studentEmail: 'user2@taiwantech.com',
        courseName: '華語文法精修',
        teacher: teachers[0]?.name || '王老師',
        date: '2025-01-23',
        time: '15:00-16:30',
        status: 'upcoming',
        classroom: 'https://meet.google.com/jkl-mno-pqr',
        materials: 'https://drive.google.com/file/d/example4',
        daysFromNow: 4,
        membershipType: 'corporate',
        companyName: '台灣科技股份有限公司'
      },
      // Corporate member bookings - 創新軟體有限公司
      {
        id: 'admin-5',
        studentName: '程式設計師A',
        studentEmail: 'dev1@innovation.com',
        courseName: '華語聽力強化',
        teacher: teachers[2]?.name || '張老師',
        date: '2025-01-24',
        time: '11:00-12:30',
        status: 'upcoming',
        classroom: 'https://meet.google.com/mno-pqr-stu',
        materials: 'https://drive.google.com/file/d/example5',
        daysFromNow: 5,
        membershipType: 'corporate',
        companyName: '創新軟體有限公司'
      },
      // Corporate member bookings - 全球貿易集團
      {
        id: 'admin-6',
        studentName: '業務經理A',
        studentEmail: 'sales1@globaltrade.com',
        courseName: '華語聽力強化',
        teacher: teachers[2]?.name || '張老師',
        date: '2025-01-25',
        time: '09:00-10:30',
        status: 'upcoming',
        classroom: 'https://meet.google.com/pqr-stu-vwx',
        materials: 'https://drive.google.com/file/d/example6',
        daysFromNow: 6,
        membershipType: 'corporate',
        companyName: '全球貿易集團'
      },
      {
        id: 'admin-7',
        studentName: '行銷專員',
        studentEmail: 'marketing@globaltrade.com',
        courseName: '商務華語會話',
        teacher: teachers[2]?.name || '張老師',
        date: '2025-01-26',
        time: '14:00-15:30',
        status: 'upcoming',
        classroom: 'https://meet.google.com/stu-vwx-yzq',
        materials: 'https://drive.google.com/file/d/example7',
        daysFromNow: 7,
        membershipType: 'corporate',
        companyName: '全球貿易集團'
      },
      // Completed bookings
      {
        id: 'admin-8',
        studentName: '王小明',
        studentEmail: 'student1@example.com',
        courseName: '商務華語會話',
        teacher: teachers[2]?.name || '張老師',
        date: '2025-01-15',
        time: '09:00-10:30',
        status: 'completed',
        classroom: 'https://meet.google.com/abc-def-ghi',
        materials: 'https://drive.google.com/file/d/example8',
        daysFromNow: -4,
        membershipType: 'individual',
        companyName: null
      },
      {
        id: 'admin-9',
        studentName: '李小華',
        studentEmail: 'user2@taiwantech.com',
        courseName: '華語文法精修',
        teacher: teachers[0]?.name || '王老師',
        date: '2025-01-10',
        time: '14:00-15:30',
        status: 'completed',
        classroom: 'https://meet.google.com/def-ghi-jkl',
        materials: 'https://drive.google.com/file/d/example9',
        daysFromNow: -9,
        membershipType: 'corporate',
        companyName: '台灣科技股份有限公司'
      }
    ];

    return bookings.sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return a.daysFromNow - b.daysFromNow;
    });
  };




  const handleSubmitLeave = async () => {
    if (!leaveForm.reason.trim()) {
      alert('請填寫請假原因');
      return;
    }

    if (selectedCourse && user) {
      try {
        // 創建請假申請資料
        const requestData = {
          teacherId: user.id,
          teacherName: user.name || '未知教師',
          teacherEmail: user.email || '',
          sessionId: selectedCourse.sessionId || selectedCourse.id.toString(),
          courseName: selectedCourse.title || '未知課程',
          courseDate: selectedCourse.date,
          courseTime: selectedCourse.time,
          reason: leaveForm.reason,
          studentCount: (selectedCourse as any).studentCount || 0,
          classroom: (selectedCourse as any).classroom || '線上教室'
        };

        // 提交請假申請到系統
        const result = await leaveService.createLeaveRequest(requestData);

        if (result.success && result.data) {
          alert(`✅ 請假申請已提交成功！

課程：${selectedCourse.title}
時間：${selectedCourse.date} ${selectedCourse.time}
原因：${leaveForm.reason}

申請編號：${result.data.id}

系統管理員將會審核您的申請，並安排代課老師。
您可以在管理員的「請假管理」頁面查看申請狀態。`);

          // Reset form and close modal
          setLeaveForm({ reason: '' });
          setShowLeaveModal(false);
          setSelectedCourse(null);
          
          // 重新載入 Dashboard 資料以反映新的請假狀態
          if (user) {
            const data = await dashboardService.getDashboardData(user.id);
            setDashboardData(data as any);
          }
        } else {
          alert('❌ 提交請假申請失敗，請稍後再試。');
        }
      } catch (error) {
        console.error('提交請假申請失敗:', error);
        alert('❌ 提交請假申請失敗，請稍後再試。');
      }
    }
  };

  // 處理取消預約
  const handleCancelBooking = (courseId: string | number) => {
    console.log('🔍 handleCancelBooking - 搜索課程ID:', courseId);
    console.log('📚 所有預約課程:', allBookedCourses.map(c => ({
      id: c.id,
      title: c.title,
      appointmentId: c.appointmentId,
      appointmentIdType: typeof c.appointmentId
    })));
    
    const course = allBookedCourses.find(c => c.id === courseId);
    console.log('🎯 找到的課程:', course);
    
    if (course) {
      console.log('✅ 設定選中的預約:', {
        courseId: course.id,
        appointmentId: course.appointmentId,
        appointmentIdType: typeof course.appointmentId,
        hasAppointmentId: !!course.appointmentId
      });
      setSelectedCancelBooking(course);
      setShowCancelModal(true);
    } else {
      console.error('❌ 找不到對應的課程:', courseId);
    }
  };

  const handleSubmitCancel = async () => {
    if (!cancelForm.reason.trim()) {
      alert('請填寫取消原因');
      return;
    }

    if (selectedCancelBooking && user) {
      try {
        setCancelling(true);
        
        console.log('🔍 開始取消預約，選中的課程:', selectedCancelBooking);
        
        // 檢查appointmentId是否存在
        if (!selectedCancelBooking.appointmentId) {
          console.error('❌ 缺少 appointmentId:', selectedCancelBooking);
          alert('❌ 預約資料不完整，無法取消預約。請重新整理頁面後再試。');
          setCancelling(false);
          return;
        }
        
        console.log('📋 準備取消預約 - appointmentId:', selectedCancelBooking.appointmentId, 'type:', typeof selectedCancelBooking.appointmentId);
        console.log('📋 用戶ID:', user.id, 'type:', typeof user.id);
        
        // 確保數據類型正確
        const appointmentIdNumber = Number(selectedCancelBooking.appointmentId);
        const userIdNumber = Number(user.id);
        
        console.log('📋 轉換後的數據:', {
          appointmentId: appointmentIdNumber,
          userId: userIdNumber,
          appointmentIdType: typeof appointmentIdNumber,
          userIdType: typeof userIdNumber
        });
        
        // 呼叫取消 API
        const result = await bookingService.cancelBooking(userIdNumber, appointmentIdNumber);
        
        if (result.success) {
          alert(`✅ 預約已成功取消！

課程：${selectedBooking?.title}
時間：${selectedBooking?.date} ${selectedBooking?.time}
取消原因：${cancelForm.reason}`);
          
          // 重新載入 Dashboard 資料
          if (user) {
            const data = await dashboardService.getDashboardData(user.id);
            setDashboardData(data as any);
          }
          
        } else {
          // 處理錯誤情況
          console.error('❌ 取消預約失敗:', result);
          let errorMessage = '取消預約失敗';
          
          if (result.error === 'CANNOT_CANCEL_WITHIN_24H') {
            errorMessage = '無法取消預約：距離開課時間不足24小時，無法取消預約。';
          } else if (result.error === 'Appointment not found') {
            errorMessage = `找不到預約記錄或預約已被取消。

調試資訊：
- 課程：${selectedBooking?.title}
- AppointmentId: ${selectedBooking?.appointmentId}
- TimeslotId: ${selectedBooking?.timeslotId}

請重新整理頁面後再試，或聯繫技術支援。`;
          } else {
            errorMessage = `取消預約失敗：${result.error || '未知錯誤'}

調試資訊：
- 課程：${selectedBooking?.title}
- AppointmentId: ${selectedBooking?.appointmentId}

請重新整理頁面後再試。`;
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
      setCancelForm({ reason: '' });
      setShowCancelModal(false);
      setSelectedBooking(null);
    }
  };

  const getStatusColor = (status: string, course?: { studentCount: number; leaveStatus?: string }) => {
    // 優先顯示請假狀態
    if (course?.leaveStatus) {
      switch (course.leaveStatus) {
        case 'pending': return 'text-pink-700 bg-pink-50 border-pink-200';     // 待審核請假 - 淺粉紅色
        case 'approved': return 'text-purple-700 bg-purple-50 border-purple-200'; // 已批准請假 - 淺紫色
        case 'rejected': return 'text-red-700 bg-red-50 border-red-200';       // 已拒絕請假 - 淺紅色
      }
    }
    
    switch (status) {
      case 'upcoming': 
        // 🔧 教師看到：根據學生數量顯示不同顏色
        if (user?.roles.includes('TEACHER') && course) {
          return course.studentCount > 0 
            ? 'text-green-700 bg-green-50 border-green-200'  // 已開課 - 淺綠色
            : 'text-red-700 bg-red-50 border-red-200';       // 待開課 - 淺紅色
        }
        return 'text-blue-700 bg-blue-50';
      case 'completed': return 'text-gray-600 bg-gray-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string, course?: { studentCount: number; leaveStatus?: string }) => {
    // 優先顯示請假狀態
    if (course?.leaveStatus) {
      switch (course.leaveStatus) {
        case 'pending': return '待審核請假';
        case 'approved': return '已批准請假';
        case 'rejected': return '已拒絕請假';
      }
    }
    
    switch (status) {
      case 'upcoming': 
        // 🔧 教師看到：根據學生數量顯示"待開課"或"已開課"
        if (user?.roles.includes('TEACHER') && course) {
          return course.studentCount > 0 ? '已開課' : '待開課';
        }
        return '預約中';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  };


  const quickStats = getQuickStats();
  const allBookedCourses = user?.roles.includes('STUDENT') ? getBookedCourses() : [];
  const allTeacherCourses = user?.roles.includes('TEACHER') ? getTeacherCourses() : [];
  const allMemberBookings = (user?.roles.includes('STAFF') || user?.roles.includes('ADMIN')) ? getAllMemberBookings() : [];
  const allCorporateCourses = user?.roles.includes('CORPORATE_CONTACT') ? getCorporateCourses() : [];

  // Filter courses based on selected tab
  const filteredCourses = user?.roles.includes('STUDENT')
    ? allBookedCourses.filter(course => {
        if (courseTab === 'upcoming') {
          return course.status === 'upcoming';
        } else {
          return course.status === 'completed';
        }
      })
    : user?.roles.includes('TEACHER')
    ? allTeacherCourses.filter(course => {
        if (courseTab === 'upcoming') {
          return course.status === 'upcoming';
        } else {
          return course.status === 'completed';
        }
      })
    : user?.roles.includes('CORPORATE_CONTACT')
      ? allCorporateCourses.filter(course => {
          if (courseTab === 'upcoming') {
            return course.status === 'upcoming';
          } else {
            return course.status === 'completed';
          }
        })
      : allMemberBookings.filter(booking => {
          if (courseTab === 'upcoming') {
            return booking.status === 'upcoming';
          } else {
            return booking.status === 'completed';
          }
        });

  const upcomingCount = user?.roles.includes('STUDENT')
    ? allBookedCourses.filter(c => c.status === 'upcoming').length
    : user?.roles.includes('TEACHER')
    ? allTeacherCourses.filter(c => c.status === 'upcoming' && (c as any).leaveStatus !== 'approved').length
    : user?.roles.includes('CORPORATE_CONTACT')
    ? allCorporateCourses.filter(c => c.status === 'upcoming').length
    : (user?.roles.includes('STAFF') || user?.roles.includes('ADMIN'))
    ? allMemberBookings.filter(b => b.status === 'upcoming').length
    : 0;

  const completedCount = user?.roles.includes('STUDENT')
    ? allBookedCourses.filter(c => c.status === 'completed').length
    : user?.roles.includes('TEACHER')
    ? allTeacherCourses.filter(c => c.status === 'completed').length
    : user?.roles.includes('CORPORATE_CONTACT')
    ? allCorporateCourses.filter(c => c.status === 'completed').length
    : (user?.roles.includes('STAFF') || user?.roles.includes('ADMIN'))
    ? allMemberBookings.filter(b => b.status === 'completed').length
    : 0;

  return (
    <div>
      {/* Welcome Section - 手機優化 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start space-y-4 sm:space-y-0">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              {getWelcomeMessage()}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600">
              {getRoleDescription()}
            </p>
          </div>

          {/* Membership Status for Students - 手機優化 (US09) */}
          {user?.roles.includes('STUDENT') && dashboardData?.membership && (
            <div className="w-full sm:w-auto text-left sm:text-right bg-green-50 border border-green-200 rounded-lg p-3 sm:p-0 sm:bg-transparent sm:border-none">
              <div className="text-sm text-gray-600">結束日期</div>
              <div className="text-base sm:text-lg font-bold text-green-600">
                {dashboardData.membership.expiry_date ? new Date(dashboardData.membership.expiry_date).toLocaleDateString('zh-TW') : 'N/A'}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                狀態：{dashboardData.membership.status === 'activated' ? '已啟用' : '未啟用'}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Corporate Management for Corporate Contact - Updated Dashboard */}
      {user?.roles.includes('CORPORATE_CONTACT') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">會員管理儀表板</h2>
            <Link 
              href="/corporate_contact/corporate-management"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
            >
              <span>查看詳細</span>
              <SafeIcon icon={FiExternalLink} size={14} />
            </Link>
          </div>
          
          {/* Member Status Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {/* 方案 */}
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{corporateStats.activePlans}</div>
              <div className="text-sm text-green-800">方案</div>
            </div>
            
            {/* 會員 */}
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">{corporateStats.totalMembers}</div>
              <div className="text-sm text-purple-800">會員</div>
            </div>
            
            {/* 測試 */}
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">{corporateStats.testMembers}</div>
              <div className="text-sm text-orange-800">測試</div>
            </div>
          </div>
          
          {/* Member Status Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* 未啟用 */}
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-600 mb-1">{corporateStats.inactiveMembers}</div>
              <div className="text-sm text-gray-800">未啟用</div>
            </div>
            
            {/* 啟用 */}
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{corporateStats.activeMembers}</div>
              <div className="text-sm text-green-800">啟用</div>
            </div>
            
            {/* 過期 */}
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">{corporateStats.expiredMembers}</div>
              <div className="text-sm text-red-800">過期</div>
            </div>
            
            {/* 取消 */}
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">{corporateStats.cancelledMembers}</div>
              <div className="text-sm text-yellow-800">取消</div>
            </div>
          </div>
          
        </motion.div>
      )}

      {/* Membership Card Management for Students (US04) */}
      {user?.roles.includes('STUDENT') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 sm:mb-8"
        >
          <MembershipCard 
            dashboardData={dashboardData}
            onActivate={handleActivateMembership}
            loading={loading}
          />
        </motion.div>
      )}

      {/* Quick Stats - 手機優化 */}
      {quickStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 sm:mb-8"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">快速統計</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {quickStats.map((stat) => (
              <motion.div
                key={`stat-${stat.label}`}
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100/60"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2">
                  <SafeIcon icon={stat.icon} className="text-xl sm:text-2xl text-blue-600 mb-2 sm:mb-0" />
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}


      {/* Course Bookings Dashboard - 手機優化 */}
      {/* 學生和教師共用的預約區塊 */}
      {(user?.roles.includes('STUDENT') || user?.roles.includes('TEACHER')) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100/60 p-4 sm:p-6"
        >
          {/* Header with Tabs */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">我的預約</h2>
            <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCourseTab('upcoming')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  courseTab === 'upcoming'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                即將開始 ({upcomingCount})
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCourseTab('completed')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  courseTab === 'completed'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                已完成 ({completedCount})
              </motion.button>
            </div>
          </div>

          {/* Course List - 手機優化 */}
          <div className="space-y-3 sm:space-y-4">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course: Course) => (
                <motion.div
                  key={course.id}
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
                              {(course as any).courseTitle || course.title?.split(' - ')[0]}
                            </h3>
                            {(course as any).sessionTitle && (
                              <div className="text-sm text-gray-600 mt-1">
                                Lesson {(course as any).sessionNumber || 1} - {(course as any).sessionTitle}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <SafeIcon icon={FiCalendar} className="text-xs" />
                              <span>{formatDate(course.date)} {course.time}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <SafeIcon icon={user?.roles.includes('STUDENT') ? FiUser : FiUsers} className="text-xs" />
                              <span>
                                {user?.roles.includes('TEACHER') 
                                  ? course.students || '待安排學生' 
                                  : course.teacher
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(course.status, course as any)}`}>
                          {getStatusText(course.status, course as any)}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedBooking(course);
                            if (user?.roles.includes('TEACHER')) {
                              setStudentList(getStudentListForBooking(course));
                            }
                            setShowDetailModal(true);
                          }}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                        >
                          <SafeIcon icon={FiEye} className="text-xs" />
                          <span>查看詳情</span>
                        </motion.button>

                        {course.status === 'upcoming' && (
                          <>
                            {(() => {
                              // 獲取課程連結
                              const courseLinks = getCourseLinksFromBooking(course);
                              
                              return (
                                <>
                                  {courseLinks.hasValidClassroom ? (
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => courseLinks.classroom && window.open(courseLinks.classroom, '_blank')}
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
                                      onClick={() => courseLinks.materials && window.open(courseLinks.materials, '_blank')}
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

                            {user?.roles.includes('TEACHER') && (() => {
                              // 根據請假狀態顯示不同的按鈕
                              if ((course as any).leaveStatus === 'pending') {
                                // 待審核狀態：顯示取消請假按鈕
                                return (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={async () => {
                                      if (confirm('確定要取消這個請假申請嗎？')) {
                                        try {
                                          // 從 localStorage 找到對應的請假申請 ID
                                          const leaveRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
                                          const courseTime = course.time;
                                          const matchingRequest = leaveRequests.find((request: {
                                            teacherId: number;
                                            courseName: string;
                                            courseDate: string;
                                            courseTime: string;
                                            id: string;
                                          }) => 
                                            request.teacherId === user?.id &&
                                            request.courseName.includes((course as any).courseTitle) &&
                                            request.courseDate === course.date &&
                                            request.courseTime === courseTime
                                          );
                                          
                                          if (matchingRequest && user?.id) {
                                            const result = await leaveService.cancelLeaveRequest(matchingRequest.id, user.id);
                                            if (result.success) {
                                              alert('✅ 請假申請已取消');
                                              // 重新載入教師課程數據
                                              window.location.reload();
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
                                    }}
                                    className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                                  >
                                    <SafeIcon icon={FiX} className="text-xs" />
                                    <span>取消請假</span>
                                  </motion.button>
                                );
                              } else if ((course as any).leaveStatus === 'approved') {
                                // 已批准狀態：顯示查看請假按鈕
                                return (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                      setSelectedCourse(course);
                                      setIsViewMode(true);
                                      
                                      // 從 localStorage 獲取該課程的請假申請詳情
                                      try {
                                        const leaveRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
                                        const courseTime = course.time;
                                        const matchingRequest = leaveRequests.find((request: {
                                          teacherId: number;
                                          courseName: string;
                                          courseDate: string;
                                          courseTime: string;
                                          leaveReason: string;
                                        }) => 
                                          request.teacherId === user?.id &&
                                          request.courseName.includes((course as any).courseTitle) &&
                                          request.courseDate === course.date &&
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
                              } else if ((course as any).leaveStatus === 'rejected') {
                                // 已拒絕狀態：可以重新申請
                                return (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                      setSelectedCourse(course);
                                      setShowLeaveModal(true);
                                      setIsViewMode(false);
                                    }}
                                    className="flex items-center space-x-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm"
                                  >
                                    <SafeIcon icon={FiCalendar} className="text-xs" />
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
                                      setSelectedCourse(course);
                                      setShowLeaveModal(true);
                                      setIsViewMode(false);
                                    }}
                                    className="flex items-center space-x-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm"
                                  >
                                    <SafeIcon icon={FiCalendar} className="text-xs" />
                                    <span>申請請假</span>
                                  </motion.button>
                                );
                              }
                            })()}
                            
                            {course.canCancel && course.appointmentId && user?.roles.includes('STUDENT') && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCancelBooking(course.id)}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                              >
                                <SafeIcon icon={FiX} className="text-xs" />
                                <span>取消預約</span>
                              </motion.button>
                            )}
                          </>
                        )}
                        
                        {course.status === 'completed' && course.materials && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.open(course.materials, '_blank')}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                          >
                            <SafeIcon icon={FiEye} className="text-xs" />
                            <span>教材</span>
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <SafeIcon icon={courseTab === 'upcoming' ? FiCalendar : FiCheckCircle} className="text-4xl text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {courseTab === 'upcoming' ? '尚無即將開始課程' : '尚無已完成課程'}
                </h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base px-4">
                  {courseTab === 'upcoming' ? (
                    user?.roles.includes('STUDENT')
                      ? '立即前往課程預約頁面，開始您的學習之旅'
                      : user?.roles.includes('TEACHER')
                      ? '您的即將開始課程會顯示在這裡'
                      : '全體會員的即將開始課程會顯示在這裡'
                  ) : (
                    '完成更多課程後，這裡會顯示' + (
                      user?.roles.includes('STUDENT')
                        ? '您的學習紀錄'
                        : user?.roles.includes('TEACHER')
                        ? '您的教學紀錄'
                        : '全體會員的課程紀錄'
                    )
                  )}
                </p>
                {courseTab === 'upcoming' && user?.roles.includes('STUDENT') && (
                  <Link href="/booking">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      立即預約課程
                    </motion.button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Referral System Modal */}
      <ReferralSystem 
        isOpen={isReferralOpen} 
        onClose={() => setIsReferralOpen(false)} 
      />

      {/* Course Details Modal */}
      {showCourseDetailsModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCourseDetailsModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">課程詳情</h3>
              <button
                onClick={() => setShowCourseDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <SafeIcon icon={FiX} className="text-xl" />
              </button>
            </div>

            {selectedCourse && (
              <div className="space-y-6">
                {/* 課程資訊 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">課程資訊</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><span className="font-medium">課程名稱：</span>{selectedCourse.title}</div>
                    <div><span className="font-medium">日期：</span>{selectedCourse.date}</div>
                    <div><span className="font-medium">時間：</span>{selectedCourse.time}</div>
                    <div><span className="font-medium">教室：</span>{selectedCourse.classroom}</div>
                    <div className="md:col-span-2"><span className="font-medium">教材：</span>{selectedCourse.materials}</div>
                  </div>
                </div>

                {/* 學生列表 */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    預約學生列表 ({selectedCourse.studentList?.length || 0} 人)
                  </h4>
                  {selectedCourse.studentList && selectedCourse.studentList.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCourse.studentList.map((student, index) => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-600">{student.email}</div>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.open(`mailto:${student.email}`, '_blank')}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs"
                          >
                            聯絡
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <SafeIcon icon={FiUsers} className="text-3xl mx-auto mb-2" />
                      <p>目前尚無學生預約此課程</p>
                    </div>
                  )}
                </div>

                {/* 操作按鈕 */}
                <div className="space-y-4">
                  {/* 課程連結 */}
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium mb-3 text-green-900">課程連結</h4>
                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.open(selectedCourse?.classroom, '_blank')}
                        className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <SafeIcon icon={FiExternalLink} />
                        <span>進入線上教室</span>
                      </motion.button>
                      {selectedCourse?.materials && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => window.open(selectedCourse?.materials, '_blank')}
                          className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <SafeIcon icon={FiEye} />
                          <span>查看課程教材</span>
                        </motion.button>
                      )}
                    </div>
                  </div>
                  
                  {/* 關閉按鈕 */}
                  <div className="flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowCourseDetailsModal(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      關閉
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

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
                  <div>課程：{selectedBooking.title}</div>
                  <div>時間：{formatDate(selectedBooking.date)} {selectedBooking.time}</div>
                  <div>教師：{selectedBooking.teacher}</div>
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

            {selectedCourse && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">課程資訊</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>課程：{selectedCourse.title}</div>
                  <div>時間：{formatDate(selectedCourse.date)} {selectedCourse.time}</div>
                  <div>學生：{selectedCourse.students}</div>
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

      {/* Detail Modal - 與我的預約頁面一模一樣 */}
      {showDetailModal && (
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
                      <div className="font-medium mt-1 break-words">{selectedBooking.title}</div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">上課時間：</span>
                      <span>{formatDate(selectedBooking.date)} {selectedBooking.time}</span>
                    </div>
                  </div>
                </div>

                {/* 學生清單 (for teachers viewing bookings) */}
                {user?.roles.includes('TEACHER') && studentList.length > 0 && (
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

                {/* 課程連結 */}
                {(() => {
                  // 🔧 使用新的統一方法獲取課程連結
                  console.log(`🔗 Dashboard - 獲取預約詳情的課程連結:`, selectedBooking);
                  const courseLinks = getCourseLinksFromBooking(selectedBooking);
                  console.log(`🔗 Dashboard - 獲取到的連結:`, courseLinks);
                  
                  return (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium mb-3 text-green-900">課程連結</h4>
                      <div className="space-y-3">
                        {courseLinks.hasValidClassroom ? (
                          <button
                            onClick={() => {
                              console.log(`🚀 Dashboard - 進入教室: ${courseLinks.classroom}`);
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
                              console.log(`📄 Dashboard - 查看教材: ${courseLinks.materials}`);
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
      )}
    </div>
  );
};

export default Dashboard;