'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import type { User, CourseSchedule, Booking, Teacher } from '@/types';

interface TeacherDashboardData {
  user: User;
  teacher: Teacher;
  todaySchedule: Array<{
    schedule: CourseSchedule;
    bookings: Booking[];
    attendance: number;
  }>;
  upcomingClasses: Array<{
    schedule: CourseSchedule;
    date: string;
    time: string;
    enrolledStudents: number;
  }>;
  monthlyStats: {
    totalClasses: number;
    totalStudents: number;
    completionRate: number;
    averageRating: number;
  };
}

export default function TeacherPortal() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<TeacherDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadTeacherDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 載入教師相關資料
      // 模擬資料載入
      setDashboardData({
        user: user!,
        teacher: {
          id: user!.id,
          user_id: user!.id,
          specializations: ['英文會話', '商業英文'],
          languages: ['English', 'Chinese'],
          certifications: [],
          hourly_rate: 800,
          currency: 'TWD',
          max_students_per_class: 15,
          bio: '經驗豐富的英文教師',
          years_of_experience: 5,
          rating: 4.8,
          total_reviews: 124,
          is_available: true,
          status: 'ACTIVE',
          hired_at: '2020-01-01',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        todaySchedule: [],
        upcomingClasses: [],
        monthlyStats: {
          totalClasses: 32,
          totalStudents: 156,
          completionRate: 95.2,
          averageRating: 4.8
        }
      });
    } catch (error) {
      console.error('Failed to load teacher dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (loading) return;
    
    // 檢查用戶角色權限
    if (!user || user.role !== 'TEACHER') {
      router.push('/login');
      return;
    }

    // 載入教師儀表板資料
    loadTeacherDashboard();
  }, [user, loading, router, loadTeacherDashboard]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入教師門戶...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* 歡迎區塊 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {dashboardData?.user.name} 老師，您好！
              </h1>
              <p className="text-gray-600 mt-2">
                專業領域：{dashboardData?.teacher.specializations.join('、')}
              </p>
            </div>
            <div className="text-right">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                教師門戶
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-yellow-500">⭐</span>
                <span className="ml-1">{dashboardData?.teacher.rating}</span>
                <span className="ml-1">({dashboardData?.teacher.total_reviews} 評價)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">本月授課</p>
                <p className="text-2xl font-bold text-gray-800">
                  {dashboardData?.monthlyStats.totalClasses}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">教授學生</p>
                <p className="text-2xl font-bold text-gray-800">
                  {dashboardData?.monthlyStats.totalStudents}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">完課率</p>
                <p className="text-2xl font-bold text-gray-800">
                  {dashboardData?.monthlyStats.completionRate}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">平均評分</p>
                <p className="text-2xl font-bold text-gray-800">
                  {dashboardData?.monthlyStats.averageRating}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 今日課程 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">今日課程</h2>
            
            {dashboardData?.todaySchedule.length ? (
              <div className="space-y-4">
                {dashboardData.todaySchedule.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800">{item.schedule.title}</h3>
                        <p className="text-gray-600 text-sm">
                          學生數：{item.bookings.length} / {item.schedule.max_students}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500">出席率</span>
                        <p className="font-bold text-green-600">{item.attendance}%</p>
                      </div>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <button className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded">
                        點名
                      </button>
                      <button className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded">
                        教材
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>今日沒有安排課程</p>
                <button
                  onClick={() => router.push('/teacher-management')}
                  className="mt-4 text-green-600 hover:text-green-700"
                >
                  查看課表 →
                </button>
              </div>
            )}
          </div>

          {/* 即將到來的課程 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">即將到來的課程</h2>
            
            {dashboardData?.upcomingClasses.length ? (
              <div className="space-y-4">
                {dashboardData.upcomingClasses.slice(0, 5).map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800">{item.schedule.title}</h3>
                        <p className="text-gray-600 text-sm">{item.date} {item.time}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        {item.enrolledStudents} 人報名
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>近期沒有安排課程</p>
              </div>
            )}
          </div>
        </div>

        {/* 快速操作 */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">快速操作</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/teacher-management')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <span className="text-2xl mb-2">📅</span>
              <span className="text-sm font-medium">我的課表</span>
            </button>
            
            <button
              onClick={() => router.push('/leave-management')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <span className="text-2xl mb-2">🏖️</span>
              <span className="text-sm font-medium">請假申請</span>
            </button>
            
            <button
              onClick={() => router.push('/course-management')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <span className="text-2xl mb-2">📚</span>
              <span className="text-sm font-medium">課程管理</span>
            </button>
            
            <button
              onClick={() => router.push('/profile')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
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