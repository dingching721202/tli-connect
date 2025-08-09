'use client';

import React from 'react';
import Navigation from '@/components/Navigation';
import SystemSettings from '@/components/SystemSettings';

const SystemSettingsPage: React.FC = () => {
  return (
    <div className="main-layout">
      <Navigation />
      <div className="page-container">
        <SystemSettings />
      </div>
    </div>
  );
};

export default SystemSettingsPage;