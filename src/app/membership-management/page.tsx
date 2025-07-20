'use client';

import React from 'react';
import Navigation from '@/components/Navigation';
import MembershipPlanManagement from '@/components/MembershipPlanManagement';

export default function MembershipManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <MembershipPlanManagement />
    </div>
  );
}