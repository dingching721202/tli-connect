'use client';

import React, { Suspense } from 'react';
import Navigation from '@/components/Navigation';
import MembershipPlans from '@/components/MembershipPlans';

function MembershipPageContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />
      <div className="py-8">
        <MembershipPlans />
      </div>
    </div>
  );
}

export default function MembershipPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">載入中...</p>
      </div>
    </div>}>
      <MembershipPageContent />
    </Suspense>
  );
}