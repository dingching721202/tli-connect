'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import { useAuth } from '@/contexts/AuthContext';
import ReferralSystem from './ReferralSystem';
import MembershipCard from './MembershipCard';
import { dashboardService } from '@/services/dataService';
import { Membership, ClassAppointment, ClassTimeslot, Class, Course as CourseType } from '@/types';

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
  FiUserCheck,
  FiMessageSquare,
  FiUser
} = FiIcons;

interface Course {
  id: number;
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
}

const Dashboard = () => {
  const { user, hasActiveMembership } = useAuth();
  const [dashboardData, setDashboardData] = useState<{
    membership: Membership | null;
    upcomingClasses: {
      appointment: ClassAppointment;
      timeslot: ClassTimeslot;
      class: Class | undefined;
      course: CourseType | undefined;
    }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // 載入 Dashboard 資料 (US09)
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user || user.role !== 'STUDENT') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await dashboardService.getDashboardData(user.id);
        setDashboardData(data);
      } catch (error) {
        console.error('載入 Dashboard 資料失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);
  
  // 權限檢查函數
  const [courseTab, setCourseTab] = useState('upcoming'); // 'upcoming' or 'completed'
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [leaveForm, setLeaveForm] = useState({
    reason: '',
    note: ''
  });



  const getQuickStats = () => {
    if (user?.role === 'STUDENT') {
      if (!dashboardData || loading) {
        return [
          { label: '已預約課程', value: '-', icon: FiBook },
          { label: '本月課程', value: '-', icon: FiCalendar },
          { label: '學習時數', value: '-', icon: FiClock },
          { label: '會員狀態', value: '-', icon: FiTrendingUp }
        ];
      }
      const allCourses = getBookedCourses();
      const upcomingCourses = allCourses.filter(c => c.status === 'upcoming');
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

    if (user?.role === 'TEACHER') {
      return [
        { label: '教授課程', value: '15', icon: FiBook },
        { label: '學生人數', value: '48', icon: FiUsers },
        { label: '本月課程', value: '22', icon: FiCalendar },
        { label: '評分', value: '4.8', icon: FiAward }
      ];
    }


    if (user?.role === 'OPS' || user?.role === 'ADMIN') {
      return [
        { label: '總用戶數', value: '1,234', icon: FiUsers },
        { label: '總課程數', value: '156', icon: FiBook },
        { label: '本月預約', value: '89', icon: FiCalendar },
        { label: '系統使用率', value: '92%', icon: FiBarChart }
      ];
    } else if (user?.role === 'CORPORATE_CONTACT') {
      return [
        { label: '企業員工數', value: '45', icon: FiUsers },
        { label: '已用名額', value: '32/50', icon: FiUserCheck },
        { label: '本月課程', value: '28', icon: FiCalendar },
        { label: '方案狀態', value: '已啟用', icon: FiCheckCircle }
      ];
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
    switch (user?.role) {
      case 'STUDENT': return '歡迎使用 TLI Connect 課程預約系統，開始您的學習之旅！';
      case 'TEACHER': return '歡迎回到教師管理面板，管理您的課程與學生。';
      case 'OPS': return '歡迎使用營運面板，管理系統設定與用戶。';
      case 'ADMIN': return '歡迎使用管理員面板，您擁有系統最高權限。';
      case 'CORPORATE_CONTACT': return '歡迎使用企業窗口管理面板，管理您的企業會員與課程安排。';
      default: return '歡迎使用 TLI Connect 系統！';
    }
  };

  // 使用真實數據 - 學生預約的課程 (US09)
  const getBookedCourses = (): Course[] => {
    if (!dashboardData?.upcomingClasses || loading) return [];
    
    const courses = dashboardData.upcomingClasses.map(item => {
      const startTime = new Date(item.timeslot.start_time);
      const endTime = new Date(item.timeslot.end_time);
      const now = new Date();
      const daysFromNow = Math.ceil((startTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      let status: 'upcoming' | 'completed' | 'cancelled';
      if (item.appointment.status === 'CANCELED') {
        status = 'cancelled';
      } else if (startTime < now) {
        status = 'completed';
      } else {
        status = 'upcoming';
      }
      
      return {
        id: item.appointment.id,
        title: `課程 ${item.timeslot.id}`, // 可以後續改為實際課程名稱
        teacher: '老師', // 可以後續改為實際老師名稱
        date: startTime.toISOString().split('T')[0],
        time: `${startTime.toTimeString().slice(0, 5)}-${endTime.toTimeString().slice(0, 5)}`,
        status,
        classroom: 'https://meet.google.com/virtual-classroom',
        materials: 'https://drive.google.com/materials',
        daysFromNow
      };
    });

    // Sort by date (upcoming first, then by closest date)
    return courses.sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return a.daysFromNow - b.daysFromNow;
    });
  };

  // Mock teacher courses data (similar to student booking system)
  const getTeacherCourses = (): Course[] => {
    const courses: Course[] = [
      {
        id: 1,
        title: '商務華語會話',
        students: '25 位學生',
        date: '2025-01-20',
        time: '09:00-10:30',
        status: 'upcoming',
        classroom: 'https://meet.google.com/abc-def-ghi',
        materials: 'https://drive.google.com/file/d/example1',
        daysFromNow: 1
      },
      {
        id: 2,
        title: '華語文法精修',
        students: '18 位學生',
        date: '2025-01-22',
        time: '14:00-15:30',
        status: 'upcoming',
        classroom: 'https://meet.google.com/def-ghi-jkl',
        materials: 'https://drive.google.com/file/d/example2',
        daysFromNow: 3
      },
      {
        id: 3,
        title: '華語聽力強化',
        students: '22 位學生',
        date: '2025-01-25',
        time: '10:00-11:30',
        status: 'upcoming',
        classroom: 'https://meet.google.com/ghi-jkl-mno',
        materials: 'https://drive.google.com/file/d/example3',
        daysFromNow: 6
      },
      {
        id: 4,
        title: '日常華語對話',
        students: '20 位學生',
        date: '2025-01-18',
        time: '15:00-16:30',
        status: 'completed',
        classroom: 'https://meet.google.com/jkl-mno-pqr',
        materials: 'https://drive.google.com/file/d/example4',
        daysFromNow: -1
      },
      {
        id: 5,
        title: '華語發音矯正',
        students: '15 位學生',
        date: '2025-01-10',
        time: '16:00-17:30',
        status: 'completed',
        classroom: 'https://meet.google.com/mno-pqr-stu',
        materials: 'https://drive.google.com/file/d/example5',
        daysFromNow: -9
      }
    ];

    return courses.sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return a.daysFromNow - b.daysFromNow;
    });
  };

  // 企業窗口專用：企業員工課程數據
  const getCorporateCourses = (): Course[] => {
    return [
      {
        id: 1,
        studentName: '張小明',
        studentEmail: 'zhang@taiwantech.com',
        courseName: '商務華語會話',
        teacher: '張老師',
        date: '2025-01-15',
        time: '14:00-15:30',
        status: 'upcoming' as const,
        classroom: '教室A',
        materials: '商務會話教材',
        daysFromNow: 3,
        membershipType: 'corporate' as const,
        companyName: '台灣科技股份有限公司'
      },
      {
        id: 2,
        studentName: '李小華',
        studentEmail: 'li@taiwantech.com',
        courseName: '華語文法精修',
        teacher: '王老師',
        date: '2025-01-16',
        time: '10:00-11:30',
        status: 'upcoming' as const,
        classroom: '教室B',
        materials: '文法練習本',
        daysFromNow: 4,
        membershipType: 'corporate' as const,
        companyName: '台灣科技股份有限公司'
      },
      {
        id: 3,
        studentName: '王小美',
        studentEmail: 'wang@taiwantech.com',
        courseName: '華語聽力強化',
        teacher: '陳老師',
        date: '2025-01-17',
        time: '16:00-17:30',
        status: 'upcoming' as const,
        classroom: '教室C',
        materials: '聽力訓練CD',
        daysFromNow: 5,
        membershipType: 'corporate' as const,
        companyName: '台灣科技股份有限公司'
      },
      {
        id: 4,
        studentName: '林設計師',
        studentEmail: 'lin@taiwantech.com',
        courseName: '商務華語會話',
        teacher: '張老師',
        date: '2025-01-10',
        time: '14:00-15:30',
        status: 'completed' as const,
        classroom: '教室A',
        materials: '商務會話教材',
        daysFromNow: -2,
        membershipType: 'corporate' as const,
        companyName: '台灣科技股份有限公司'
      }
    ];
  };

  // 管理員專用：全體會員預約數據
  const getAllMemberBookings = (): Course[] => {
    const bookings: Course[] = [
      // Individual member bookings
      {
        id: 1,
        studentName: '王小明',
        studentEmail: 'student1@example.com',
        courseName: '華語文法精修',
        teacher: '王老師',
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
        id: 2,
        studentName: '林小雅',
        studentEmail: 'student2@example.com',
        courseName: '華語文法精修',
        teacher: '王老師',
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
        id: 3,
        studentName: '王小明',
        studentEmail: 'user1@taiwantech.com',
        courseName: '商務華語會話',
        teacher: '張老師',
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
        id: 4,
        studentName: '李小華',
        studentEmail: 'user2@taiwantech.com',
        courseName: '華語文法精修',
        teacher: '王老師',
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
        id: 5,
        studentName: '程式設計師A',
        studentEmail: 'dev1@innovation.com',
        courseName: '華語聽力強化',
        teacher: '張老師',
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
        id: 6,
        studentName: '業務經理A',
        studentEmail: 'sales1@globaltrade.com',
        courseName: '華語聽力強化',
        teacher: '張老師',
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
        id: 7,
        studentName: '行銷專員',
        studentEmail: 'marketing@globaltrade.com',
        courseName: '商務華語會話',
        teacher: '張老師',
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
        id: 8,
        studentName: '王小明',
        studentEmail: 'student1@example.com',
        courseName: '商務華語會話',
        teacher: '張老師',
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
        id: 9,
        studentName: '李小華',
        studentEmail: 'user2@taiwantech.com',
        courseName: '華語文法精修',
        instructor: '王老師',
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

  const handleCancelBooking = (courseId: number, courseName: string) => {
    if (confirm(`確定要取消預約「${courseName}」嗎？`)) {
      alert('✅ 課程預約已成功取消！');
      // Here you would update the state to remove the course
    }
  };

  const handleRequestLeave = (courseId: number) => {
    const course = allTeacherCourses.find(c => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      setShowLeaveModal(true);
    }
  };

  const handleSubmitLeave = () => {
    if (!leaveForm.reason.trim()) {
      alert('請填寫請假原因');
      return;
    }

    if (selectedCourse) {
      // Create leave request data
      const leaveRequest = {
        id: Date.now().toString(),
        teacherName: user?.name || '未知教師',
        teacherEmail: user?.email || '',
        courseName: selectedCourse.title || '未知課程',
        courseDate: selectedCourse.date,
        courseTime: selectedCourse.time,
        leaveReason: leaveForm.reason,
        requestDate: new Date().toISOString().split('T')[0],
        status: 'pending' as const,
        studentCount: parseInt(selectedCourse.students?.split(' ')[0] || '0'),
        classroom: selectedCourse.classroom,
        note: leaveForm.note
      };
      console.log('Leave request submitted:', leaveRequest);

      alert(`✅ 請假申請已提交！
      
課程：${selectedCourse.title}
時間：${selectedCourse.date} ${selectedCourse.time}
原因：${leaveForm.reason}

系統管理員將會審核您的申請，並安排代課老師。
您可以在「我的請假記錄」中查看申請狀態。`);

      // Reset form and close modal
      setLeaveForm({ reason: '', note: '' });
      setShowLeaveModal(false);
      setSelectedCourse(null);
    }
  };

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
      case 'upcoming': return 'text-blue-700 bg-blue-50';
      case 'completed': return 'text-gray-600 bg-gray-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return '預約中';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  };


  const quickStats = getQuickStats();
  const allBookedCourses = user?.role === 'STUDENT' ? getBookedCourses() : [];
  const allTeacherCourses = user?.role === 'TEACHER' ? getTeacherCourses() : [];
  const allMemberBookings = (user?.role === 'OPS' || user?.role === 'ADMIN') ? getAllMemberBookings() : [];
  const allCorporateCourses = user?.role === 'CORPORATE_CONTACT' ? getCorporateCourses() : [];

  // Filter courses based on selected tab
  const filteredCourses = user?.role === 'STUDENT'
    ? allBookedCourses.filter(course => {
        if (courseTab === 'upcoming') {
          return course.status === 'upcoming';
        } else {
          return course.status === 'completed';
        }
      })
    : user?.role === 'TEACHER'
    ? allTeacherCourses.filter(course => {
        if (courseTab === 'upcoming') {
          return course.status === 'upcoming';
        } else {
          return course.status === 'completed';
        }
      })
    : user?.role === 'CORPORATE_CONTACT'
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

  const upcomingCount = user?.role === 'STUDENT'
    ? allBookedCourses.filter(c => c.status === 'upcoming').length
    : user?.role === 'TEACHER'
    ? allTeacherCourses.filter(c => c.status === 'upcoming').length
    : user?.role === 'CORPORATE_CONTACT'
    ? allCorporateCourses.filter(c => c.status === 'upcoming').length
    : (user?.role === 'OPS' || user?.role === 'ADMIN')
    ? allMemberBookings.filter(b => b.status === 'upcoming').length
    : 0;

  const completedCount = user?.role === 'STUDENT'
    ? allBookedCourses.filter(c => c.status === 'completed').length
    : user?.role === 'TEACHER'
    ? allTeacherCourses.filter(c => c.status === 'completed').length
    : user?.role === 'CORPORATE_CONTACT'
    ? allCorporateCourses.filter(c => c.status === 'completed').length
    : (user?.role === 'OPS' || user?.role === 'ADMIN')
    ? allMemberBookings.filter(b => b.status === 'completed').length
    : 0;

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
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
          {user?.role === 'STUDENT' && dashboardData?.membership && (
            <div className="w-full sm:w-auto text-left sm:text-right bg-green-50 border border-green-200 rounded-lg p-3 sm:p-0 sm:bg-transparent sm:border-none">
              <div className="text-sm text-gray-600">會員到期日</div>
              <div className="text-base sm:text-lg font-bold text-green-600">
                {dashboardData.membership.expire_time ? new Date(dashboardData.membership.expire_time).toLocaleDateString('zh-TW') : 'N/A'}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                狀態：{dashboardData.membership.status === 'ACTIVE' ? '已啟用' : '未啟用'}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Corporate Management for Corporate Contact */}
      {user?.role === 'CORPORATE_CONTACT' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">企業方案管理</h2>
            <Link 
              href="/corporate-management"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
            >
              <span>查看詳細</span>
              <SafeIcon icon={FiExternalLink} size={14} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">企業資訊</h3>
              <div className="space-y-2 text-sm text-blue-700">
                <div>公司名稱：台灣科技股份有限公司</div>
                <div>方案類型：企業方案 (50人)</div>
                <div>方案狀態：<span className="text-green-600 font-medium">已啟用</span></div>
                <div>到期日期：2025-07-01</div>
              </div>
            </div>
            
            {/* Usage Stats */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">使用統計</h3>
              <div className="space-y-2 text-sm text-green-700">
                <div>已註冊員工：32/50 人</div>
                <div>本月課程：28 堂</div>
                <div>使用率：64%</div>
                <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '64%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Membership Card Management for Students */}
      {user?.role === 'STUDENT' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 sm:mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">會員卡管理</h2>
          <MembershipCard />
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
            {quickStats.map((stat, index) => (
              <motion.div
                key={index}
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
      {(user?.role === 'STUDENT' || user?.role === 'TEACHER' || user?.role === 'OPS' || user?.role === 'CORPORATE_CONTACT' || user?.role === 'ADMIN') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100/60 p-4 sm:p-6"
        >
          {/* Header with Tabs - 手機優化 */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {user?.role === 'STUDENT'
                ? '我的課程預約'
                : user?.role === 'TEACHER'
                ? '我的課程預約'
                : user?.role === 'CORPORATE_CONTACT'
                ? '企業員工課程預約'
                : user?.role === 'ADMIN'
                ? '全體會員預約 (管理員)'
                : '全體會員預約'}
            </h2>
            {/* Tab Buttons - 手機優化 */}
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
                  className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 ${
                    course.status === 'upcoming'
                      ? 'border-blue-200 bg-blue-50/50'
                      : 'border-gray-200 bg-gray-50/50'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Course Title and Status - 手機優化 */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                          {(user?.role === 'OPS' || user?.role === 'CORPORATE_CONTACT' || user?.role === 'ADMIN') ? course.courseName : course.title}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status)}`}>
                          {getStatusText(course.status)}
                        </span>
                        {/* Admin and Corporate view: Show membership type badges */}
                        {(user?.role === 'OPS' || user?.role === 'CORPORATE_CONTACT' || user?.role === 'ADMIN') && (
                          <>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              course.membershipType === 'corporate' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {course.membershipType === 'corporate' ? '企業會員' : '個人會員'}
                            </span>
                            {course.companyName && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                                {course.companyName}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Course Details - 手機優化為垂直排列 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <SafeIcon icon={(user?.role === 'OPS' || user?.role === 'CORPORATE_CONTACT' || user?.role === 'ADMIN') ? FiUser : (user?.role === 'STUDENT' ? FiUserCheck : FiUsers)} className="text-xs" />
                        <span>
                          {(user?.role === 'OPS' || user?.role === 'CORPORATE_CONTACT' || user?.role === 'ADMIN')
                            ? `${course.studentName}${user?.role === 'CORPORATE_CONTACT' && course.studentEmail ? ` (${course.studentEmail})` : ''}`
                            : user?.role === 'STUDENT'
                            ? course.teacher
                            : course.students}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <SafeIcon icon={FiCalendar} className="text-xs" />
                        <span>{formatDate(course.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <SafeIcon icon={FiClock} className="text-xs" />
                        <span>{course.time}</span>
                      </div>
                      {/* Admin view: Show teacher */}
                      {(user?.role === 'OPS' || user?.role === 'ADMIN') && (
                        <div className="flex items-center space-x-1">
                          <SafeIcon icon={FiUserCheck} className="text-xs" />
                          <span>教師：{course.teacher}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons - 手機優化 */}
                    <div className="flex flex-wrap gap-2">
                      {course.status === 'upcoming' && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.open(course.classroom, '_blank')}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs font-medium"
                            title="進入教室"
                          >
                            <SafeIcon icon={FiExternalLink} className="text-xs" />
                            <span>教室</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.open(course.materials, '_blank')}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium"
                            title="檢視教材"
                          >
                            <SafeIcon icon={FiEye} className="text-xs" />
                            <span>教材</span>
                          </motion.button>
                          {user?.role === 'STUDENT' ? (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleCancelBooking(course.id, course.title || course.courseName || '未知課程')}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium"
                              title="取消預約"
                            >
                              <SafeIcon icon={FiX} className="text-xs" />
                              <span>取消</span>
                            </motion.button>
                          ) : user?.role === 'TEACHER' ? (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRequestLeave(course.id)}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-xs font-medium"
                              title="申請請假"
                            >
                              <SafeIcon icon={FiClock} className="text-xs" />
                              <span>請假</span>
                            </motion.button>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => alert(`📧 發送訊息給 ${course.studentName}`)}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-xs font-medium"
                              title="聯絡學生"
                            >
                              <SafeIcon icon={FiMessageSquare} className="text-xs" />
                              <span>聯絡</span>
                            </motion.button>
                          )}
                        </>
                      )}
                      {course.status === 'completed' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => window.open(course.materials, '_blank')}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium"
                          title="檢視教材"
                        >
                          <SafeIcon icon={FiEye} className="text-xs" />
                          <span>教材</span>
                        </motion.button>
                      )}
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
                    user?.role === 'STUDENT'
                      ? '立即前往課程預約頁面，開始您的學習之旅'
                      : user?.role === 'TEACHER'
                      ? '您的即將開始課程會顯示在這裡'
                      : '全體會員的即將開始課程會顯示在這裡'
                  ) : (
                    '完成更多課程後，這裡會顯示' + (
                      user?.role === 'STUDENT'
                        ? '您的學習紀錄'
                        : user?.role === 'TEACHER'
                        ? '您的教學紀錄'
                        : '全體會員的課程紀錄'
                    )
                  )}
                </p>
                {courseTab === 'upcoming' && user?.role === 'STUDENT' && (
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
              <h3 className="text-xl font-bold">申請請假</h3>
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
                <select
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">請選擇請假原因</option>
                  <option value="身體不適">身體不適</option>
                  <option value="家庭緊急事務">家庭緊急事務</option>
                  <option value="參加學術會議">參加學術會議</option>
                  <option value="參加研習課程">參加研習課程</option>
                  <option value="個人事務">個人事務</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  詳細說明
                </label>
                <textarea
                  value={leaveForm.note}
                  onChange={(e) => setLeaveForm({...leaveForm, note: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="請詳細說明請假原因..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;