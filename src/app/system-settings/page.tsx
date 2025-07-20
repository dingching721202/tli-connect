'use client';

import React from 'react';
import Navigation from '@/components/Navigation';
import SystemSettings from '@/components/SystemSettings';

const SystemSettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <SystemSettings />
      </div>
    </div>
  );
};

export default SystemSettingsPage;