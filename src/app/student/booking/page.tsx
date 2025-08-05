'use client';

import { Suspense } from "react";
import RoleEntry from '@/components/RoleEntry';
import BookingSystem from "@/components/BookingSystem";

export default function StudentBookingPage() {
  return (
    <RoleEntry requiredRole="STUDENT">
      <div id="booking">
        <Suspense fallback={<div className="p-8 text-center">載入中...</div>}>
          <BookingSystem />
        </Suspense>
      </div>
    </RoleEntry>
  );
}