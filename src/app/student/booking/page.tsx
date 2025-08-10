'use client';

import { Suspense } from "react";
import RoleEntry from '@/components/RoleEntry';
import BookingSystem from "@/components/BookingSystem";

export default function StudentBookingPage() {
  return (
    <RoleEntry requiredRole="STUDENT">
      <div className="px-4 py-8" id="booking">
        <Suspense fallback={<div className="p-8 text-center">載入中...</div>}>
          <BookingSystem />
        </Suspense>
      </div>
    </RoleEntry>
  );
}