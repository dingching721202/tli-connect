'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import { useAuth } from '@/contexts/AuthContext';
import ReferralSystem from './ReferralSystem';

const {
  FiCalendar,
  FiSettings,
  FiTrendingUp,
  FiClock,
  FiUsers,
  FiBarChart,
  FiBookOpen,
  FiAward,
  FiCreditCard,
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
  instructor?: string;
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
  const { user, hasPermission, hasActiveMembership, getMembershipDaysRemaining, isMembershipExpiringSoon } = useAuth();
  const router = useRouter();
  const [courseTab, setCourseTab] = useState('upcoming'); // 'upcoming' or 'completed'
  const [isReferralOpen, setIsReferralOpen] = useState(false);

  // 追蹤哪個功能面板被點擊
  const [activePanel, setActivePanel] = useState<string | null>(null);

  const getDashboardCards = () => {
    const baseCards = [
      {
        title: '課程預約',
        description: '瀏覽並預約您感興趣的課程',
        icon: FiCalendar,
        link: '/booking',
        color: 'from-blue-500 to-blue-600',
        permission: 'book_courses',
        id: 'booking'
      }
    ];

    // Add role-specific cards for consultant
    if (user?.role === 'consultant') {
      baseCards.length = 0; // Clear the base cards for consultant
      baseCards.push(
        {
          title: '推薦系統',
          description: '管理推薦代碼與查看收益統計',
          icon: FiUserCheck,
          link: '#',
          color: 'from-blue-500 to-blue-600',
          permission: 'manage_referrals',
          id: 'referrals',
          action: 'openReferral'
        },
        {
          title: '課程瀏覽',
          description: '瀏覽課程資訊以便向客戶推薦',
          icon: FiBookOpen,
          link: '/',
          color: 'from-indigo-500 to-indigo-600',
          permission: 'view_courses',
          id: 'courses'
        }
      );
    }

    // Add role-specific cards for admin
    if (hasPermission('admin_access')) {
      baseCards.length = 0; // Clear the base cards for admin
      baseCards.push(
        {
          title: '用戶管理面板',
          description: '管理學生、教師和管理員帳戶',
          icon: FiUsers,
          link: '/admin?tab=users',
          color: 'from-blue-500 to-blue-600',
          permission: 'admin_access',
          id: 'users'
        },
        {
          title: '課程管理面板',
          description: '管理所有課程，新增、編輯和刪除課程',
          icon: FiBookOpen,
          link: '/admin?tab=courses',
          color: 'from-green-500 to-green-600',
          permission: 'admin_access',
          id: 'courses'
        },
        {
          title: '請假管理面板',
          description: '處理教師請假申請和安排代課',
          icon: FiClock,
          link: '/admin?tab=leave',
          color: 'from-yellow-500 to-orange-600',
          permission: 'admin_access',
          id: 'leave'
        },
        {
          title: '代理管理面板',
          description: '管理代理夥伴、分紅設定與銷售追蹤',
          icon: FiTrendingUp,
          link: '/admin?tab=agents',
          color: 'from-purple-500 to-indigo-600',
          permission: 'admin_access',
          id: 'agents'
        },
        {
          title: '系統設定面板',
          description: '配置系統參數和會員設定',
          icon: FiSettings,
          link: '/admin?tab=settings',
          color: 'from-red-500 to-red-600',
          permission: 'admin_access',
          id: 'settings'
        }
      );
    }

    if (hasPermission('manage_courses') && !hasPermission('admin_access')) {
      baseCards.push({
        title: '課程管理面板',
        description: '管理您的課程與學生',
        icon: FiBookOpen,
        link: '/instructor',
        color: 'from-green-500 to-green-600',
        permission: 'manage_courses',
        id: 'instructor'
      });
    }

    return baseCards.filter(card => !card.permission || hasPermission(card.permission));
  };

  const getQuickStats = () => {
    if (user?.role === 'student') {
      return [
        { label: '已預約課程', value: '12', icon: FiBook },
        { label: '本月課程', value: '8', icon: FiCalendar },
        { label: '學習時數', value: '24', icon: FiClock },
        { label: '完成率', value: '95%', icon: FiTrendingUp }
      ];
    }

    if (user?.role === 'instructor') {
      return [
        { label: '教授課程', value: '15', icon: FiBook },
        { label: '學生人數', value: '48', icon: FiUsers },
        { label: '本月課程', value: '22', icon: FiCalendar },
        { label: '評分', value: '4.8', icon: FiAward }
      ];
    }

    if (user?.role === 'consultant') {
      return [
        { label: '本月推薦', value: '8', icon: FiUserCheck },
        { label: '總推薦數', value: '45', icon: FiUsers },
        { label: '本月佣金', value: 'NT$12,500', icon: FiCreditCard },
        { label: '成功率', value: '78%', icon: FiTrendingUp }
      ];
    }

    if (user?.role === 'admin') {
      return [
        { label: '總用戶數', value: '1,234', icon: FiUsers },
        { label: '總課程數', value: '156', icon: FiBook },
        { label: '本月預約', value: '89', icon: FiCalendar },
        { label: '系統使用率', value: '92%', icon: FiBarChart }
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
      case 'student': return '歡迎使用 TLI Connect 課程預約系統，開始您的學習之旅！';
      case 'instructor': return '歡迎回到教師管理面板，管理您的課程與學生。';
      case 'consultant': return '歡迎使用顧問管理面板，管理您的推薦業務與佣金收益。';
      case 'admin': return '歡迎使用管理員面板，管理系統設定與用戶。';
      default: return '歡迎使用 TLI Connect 系統！';
    }
  };

  // Mock booked courses data for students
  const getBookedCourses = (): Course[] => {
    const courses: Course[] = [
      {
        id: 1,
        title: '商務華語會話',
        instructor: '張老師',
        date: '2025-01-20',
        time: '09:00-10:30',
        status: 'upcoming',
        classroom: 'https://meet.google.com/abc-def-ghi',
        materials: 'https://drive.google.com/file/d/example1',
        daysFromNow: 1
      },
      {
        id: 2,
        title: '華語文寫作班',
        instructor: '王老師',
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
        instructor: '李老師',
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
        instructor: '陳老師',
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
        instructor: '劉老師',
        date: '2025-01-10',
        time: '16:00-17:30',
        status: 'completed',
        classroom: 'https://meet.google.com/mno-pqr-stu',
        materials: 'https://drive.google.com/file/d/example5',
        daysFromNow: -9
      }
    ];

    // Sort by date (upcoming first, then by closest date)
    return courses.sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return a.daysFromNow - b.daysFromNow;
    });
  };

  // Mock instructor courses data (similar to student booking system)
  const getInstructorCourses = (): Course[] => {
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

  // 管理員專用：全體會員預約數據
  const getAllMemberBookings = (): Course[] => {
    const bookings: Course[] = [
      // Individual member bookings
      {
        id: 1,
        studentName: '王小明',
        studentEmail: 'student1@example.com',
        courseName: '商務華語會話',
        instructor: '張老師',
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
        instructor: '王老師',
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
        instructor: '張老師',
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
        instructor: '王老師',
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
        courseName: '商務華語會話',
        instructor: '張老師',
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
        courseName: '華語文法精修',
        instructor: '王老師',
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
        instructor: '張老師',
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
        instructor: '張老師',
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

  const handleRequestLeave = (courseId: number, courseName: string) => {
    if (confirm(`確定要為「${courseName}」申請請假嗎？`)) {
      alert('✅ 請假申請已提交！\n\n系統管理員將安排代課老師。');
      // Here you would update the course status or create a leave request
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

  // 處理功能面板點擊
  const handlePanelClick = (card: { id: string; link: string; action?: string }) => {
    setActivePanel(card.id);
    
    // 如果是推薦系統，打開推薦彈窗
    if (card.action === 'openReferral') {
      setTimeout(() => {
        setIsReferralOpen(true);
        setActivePanel(null);
      }, 150);
      return;
    }
    
    // 其他卡片正常導航
    setTimeout(() => {
      router.push(card.link);
      setActivePanel(null); // 重置狀態
    }, 150);
  };

  const dashboardCards = getDashboardCards();
  const quickStats = getQuickStats();
  const allBookedCourses = user?.role === 'student' ? getBookedCourses() : [];
  const allInstructorCourses = user?.role === 'instructor' ? getInstructorCourses() : [];
  const allMemberBookings = user?.role === 'admin' ? getAllMemberBookings() : [];

  // Filter courses based on selected tab
  const filteredCourses = user?.role === 'student'
    ? allBookedCourses.filter(course => {
        if (courseTab === 'upcoming') {
          return course.status === 'upcoming';
        } else {
          return course.status === 'completed';
        }
      })
    : user?.role === 'instructor'
    ? allInstructorCourses.filter(course => {
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

  const upcomingCount = user?.role === 'student'
    ? allBookedCourses.filter(c => c.status === 'upcoming').length
    : user?.role === 'instructor'
    ? allInstructorCourses.filter(c => c.status === 'upcoming').length
    : allMemberBookings.filter(b => b.status === 'upcoming').length;

  const completedCount = user?.role === 'student'
    ? allBookedCourses.filter(c => c.status === 'completed').length
    : user?.role === 'instructor'
    ? allInstructorCourses.filter(c => c.status === 'completed').length
    : allMemberBookings.filter(b => b.status === 'completed').length;

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

          {/* Membership Status for Students - 手機優化 */}
          {user?.role === 'student' && hasActiveMembership() && (
            <div className="w-full sm:w-auto text-left sm:text-right bg-green-50 border border-green-200 rounded-lg p-3 sm:p-0 sm:bg-transparent sm:border-none">
              <div className="text-sm text-gray-600">會員到期日</div>
              <div className={`text-base sm:text-lg font-bold ${
                isMembershipExpiringSoon() ? 'text-yellow-600' : 'text-green-600'
              }`}>
                2025-11-01
              </div>
              <div className={`text-xs sm:text-sm ${
                isMembershipExpiringSoon() ? 'text-yellow-600' : 'text-gray-600'
              }`}>
                剩餘有效期：{getMembershipDaysRemaining()} 天
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Membership Alert for Students without membership - 手機優化 */}
      {user?.role === 'student' && !hasActiveMembership() && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 sm:mb-8"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
              <div className="w-full sm:w-auto">
                <div className="flex items-center space-x-2 mb-2">
                  <SafeIcon icon={FiCreditCard} className="text-blue-600" />
                  <span className="font-medium text-blue-800">加入會員享受完整體驗</span>
                </div>
                <p className="text-blue-700 text-sm">
                  立即加入會員，享受免費課程預約、學習影片觀看等豐富內容
                </p>
              </div>
              <Link href="/membership" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors whitespace-nowrap">
                  選擇方案
                </button>
              </Link>
            </div>
          </div>
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

      {/* Main Actions - 功能面板 手機優化 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 sm:mb-8"
      >
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">功能面板</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {dashboardCards.map((card) => (
            <motion.div
              key={card.id}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePanelClick(card)}
              className={`cursor-pointer bg-white rounded-xl p-4 sm:p-6 shadow-lg border transition-all duration-300 hover:shadow-xl ${
                activePanel === card.id
                  ? 'border-blue-500 shadow-blue-500/20 bg-blue-50'
                  : 'border-gray-100/60'
              }`}
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${card.color} rounded-lg flex items-center justify-center mb-3 sm:mb-4 ${
                activePanel === card.id ? 'shadow-lg' : ''
              }`}>
                <SafeIcon icon={card.icon} className="text-white text-lg sm:text-xl" />
              </div>
              <h3 className={`text-base sm:text-lg font-semibold mb-2 ${
                activePanel === card.id ? 'text-blue-800' : 'text-gray-900'
              }`}>
                {card.title}
              </h3>
              <p className={`text-sm ${
                activePanel === card.id ? 'text-blue-700' : 'text-gray-600'
              }`}>
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Course Bookings Dashboard - 手機優化 */}
      {(user?.role === 'student' || user?.role === 'instructor' || user?.role === 'admin') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100/60 p-4 sm:p-6"
        >
          {/* Header with Tabs - 手機優化 */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {user?.role === 'student'
                ? '我的課程預約'
                : user?.role === 'instructor'
                ? '我的課程預約'
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
                          {user?.role === 'admin' ? course.courseName : course.title}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status)}`}>
                          {getStatusText(course.status)}
                        </span>
                        {/* Admin view: Show membership type badges */}
                        {user?.role === 'admin' && (
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
                        <SafeIcon icon={user?.role === 'admin' ? FiUser : (user?.role === 'student' ? FiUserCheck : FiUsers)} className="text-xs" />
                        <span>
                          {user?.role === 'admin'
                            ? course.studentName
                            : user?.role === 'student'
                            ? course.instructor
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
                      {/* Admin view: Show instructor */}
                      {user?.role === 'admin' && (
                        <div className="flex items-center space-x-1">
                          <SafeIcon icon={FiUserCheck} className="text-xs" />
                          <span>教師：{course.instructor}</span>
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
                          {user?.role === 'student' ? (
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
                          ) : user?.role === 'instructor' ? (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRequestLeave(course.id, course.title || course.courseName || '未知課程')}
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
                    user?.role === 'student'
                      ? '立即前往課程預約頁面，開始您的學習之旅'
                      : user?.role === 'instructor'
                      ? '您的即將開始課程會顯示在這裡'
                      : '全體會員的即將開始課程會顯示在這裡'
                  ) : (
                    '完成更多課程後，這裡會顯示' + (
                      user?.role === 'student'
                        ? '您的學習紀錄'
                        : user?.role === 'instructor'
                        ? '您的教學紀錄'
                        : '全體會員的課程紀錄'
                    )
                  )}
                </p>
                {courseTab === 'upcoming' && user?.role === 'student' && (
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
    </div>
  );
};

export default Dashboard;