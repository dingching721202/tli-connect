'use client';

import React from 'react';
import Navigation from '@/components/Navigation';
import TeacherManagement from '@/components/TeacherManagement';

const TeacherManagementPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <TeacherManagement />
      </div>
    </div>
  );
};

export default TeacherManagementPage;