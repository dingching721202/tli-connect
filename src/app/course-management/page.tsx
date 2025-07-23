'use client';

import React from 'react';
import Navigation from '@/components/Navigation';
import NewCourseManagement from '@/components/NewCourseManagement';

export default function CourseManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <NewCourseManagement />
    </div>
  );
}