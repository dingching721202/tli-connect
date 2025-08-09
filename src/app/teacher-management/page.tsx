'use client';

import React from 'react';
import Navigation from '@/components/Navigation';
import TeacherManagement from '@/components/TeacherManagement';

const TeacherManagementPage: React.FC = () => {
  return (
    <div className="main-layout">
      <Navigation />
      <div className="page-container">
        <TeacherManagement />
      </div>
    </div>
  );
};

export default TeacherManagementPage;