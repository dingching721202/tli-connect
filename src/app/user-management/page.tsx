'use client';

import React from 'react';
import Navigation from '@/components/Navigation';
import UserManagement from '@/components/UserManagement';

const UserManagementPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <UserManagement />
      </div>
    </div>
  );
};

export default UserManagementPage;