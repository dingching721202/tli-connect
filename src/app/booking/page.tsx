'use client';

import { Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import BookingSystem from "@/components/BookingSystem";

export default function BookingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !user?.roles.includes('STUDENT'))) {
      // 如果用戶未登入或不是學生，重定向到登入頁面
      router.push('/login');
    }
  }, [user, loading, router]);

  // 載入中顯示
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  // 如果用戶未登入或不是學生，不渲染內容
  if (!user || !user?.roles.includes('STUDENT')) {
    return null;
  }

  return (
    <div className="main-layout">
      <Navigation />
      <div id="booking" className="page-container">
        <Suspense fallback={<div className="p-8 text-center">載入中...</div>}>
          <BookingSystem />
        </Suspense>
      </div>
    </div>
  );
}