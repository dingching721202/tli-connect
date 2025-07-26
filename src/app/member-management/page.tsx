'use client';

import React from 'react';
import Navigation from '@/components/Navigation';
import MemberManagement from '@/components/MemberManagement';

const MemberManagementPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <MemberManagement />
      </div>
    </div>
  );
};

export default MemberManagementPage;