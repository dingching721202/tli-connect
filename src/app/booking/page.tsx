import { Suspense } from "react";
import Navigation from "@/components/Navigation";
import BookingSystem from "@/components/BookingSystem";

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div id="booking">
        <Suspense fallback={<div className="p-8 text-center">載入中...</div>}>
          <BookingSystem />
        </Suspense>
      </div>
    </div>
  );
}