'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import type { User, UserMembership, CourseSchedule, Booking } from '@/types';

interface StudentDashboardData {
  user: User;
  activeMembership?: UserMembership;
  upcomingBookings: Booking[];
  availableCourses: CourseSchedule[];
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
  }>;
}

export default function StudentPortal() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    
    // 檢查用戶角色權限
    if (!user || user.role !== 'STUDENT') {
      router.push('/login');
      return;
    }

    // 載入學生儀表板資料
    loadStudentDashboard();
  }, [user, loading, router, loadStudentDashboard]);

  const loadStudentDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 並行載入所有資料
      const [membershipRes, bookingsRes, coursesRes] = await Promise.all([
        fetch(`/api/member-cards?user_id=${user?.id}`),
        fetch(`/api/bookings?user_id=${user?.id}&status=CONFIRMED`),
        fetch('/api/courses?available_only=true&limit=10')
      ]);

      const [memberships, bookings, courses] = await Promise.all([
        membershipRes.json(),
        bookingsRes.json(), 
        coursesRes.json()
      ]);

      const activeMembership = memberships.data?.find((m: UserMembership) => m.status === 'ACTIVE');

      setDashboardData({
        user: user!,
        activeMembership,
        upcomingBookings: bookings.data || [],
        availableCourses: courses.data || [],
        recentActivity: []
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入學生門戶...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* 歡迎區塊 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                歡迎回來，{dashboardData?.user.name}！
              </h1>
              <p className="text-gray-600 mt-2">
                {dashboardData?.activeMembership 
                  ? `您的會員卡狀態：${dashboardData.activeMembership.status}` 
                  : '您目前沒有有效的會員卡'}
              </p>
            </div>
            <div className="text-right">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                學生門戶
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側：我的會員卡狀態 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">會員卡狀態</h2>
              
              {dashboardData?.activeMembership ? (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-green-800 font-medium">有效會員</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        {dashboardData.activeMembership.status}
                      </span>
                    </div>
                    <p className="text-green-600 text-sm mt-2">
                      到期日：{dashboardData.activeMembership.end_date}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">剩餘課程</span>
                    <span className="font-bold text-blue-600">
                      {dashboardData.activeMembership.remaining_sessions}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                    <p className="text-yellow-800">您還沒有有效的會員卡</p>
                  </div>
                  <button
                    onClick={() => router.push('/membership')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    購買會員卡
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 右側：即將到來的課程 & 可選課程 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 即將到來的課程 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">即將到來的課程</h2>
              
              {dashboardData?.upcomingBookings.length ? (
                <div className="space-y-3">
                  {dashboardData.upcomingBookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-800">課程名稱</h3>
                          <p className="text-gray-600 text-sm">時間 | 地點</p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>目前沒有即將到來的課程</p>
                  <button
                    onClick={() => router.push('/booking')}
                    className="mt-4 text-blue-600 hover:text-blue-700"
                  >
                    立即預約課程 →
                  </button>
                </div>
              )}
            </div>

            {/* 推薦課程 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">推薦課程</h2>
              
              {dashboardData?.availableCourses.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboardData.availableCourses.slice(0, 4).map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer">
                      <h3 className="font-medium text-gray-800">{course.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">教師：{course.teacher_name}</p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-blue-600 font-bold">{course.currency} {course.price}</span>
                        <span className="text-green-600 text-sm">
                          {course.max_students - course.current_students} 個名額
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>目前沒有可用課程</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">快速操作</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/booking')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <span className="text-2xl mb-2">📅</span>
              <span className="text-sm font-medium">預約課程</span>
            </button>
            
            <button
              onClick={() => router.push('/my-bookings')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <span className="text-2xl mb-2">📋</span>
              <span className="text-sm font-medium">我的預約</span>
            </button>
            
            <button
              onClick={() => router.push('/membership')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <span className="text-2xl mb-2">💳</span>
              <span className="text-sm font-medium">會員服務</span>
            </button>
            
            <button
              onClick={() => router.push('/profile')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <span className="text-2xl mb-2">👤</span>
              <span className="text-sm font-medium">個人資料</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}