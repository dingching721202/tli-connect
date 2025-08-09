'use client';

import React from 'react';
import Navigation from '@/components/Navigation';
import MemberManagement from '@/components/MemberManagement';

const MemberManagementPage: React.FC = () => {
  return (
    <div className="main-layout">
      <Navigation />
      <div className="page-container">
        <MemberManagement />
      </div>
    </div>
  );
};

export default MemberManagementPage;