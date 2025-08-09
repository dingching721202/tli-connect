'use client';

import React from 'react';
import Navigation from '@/components/Navigation';
import AgentManagement from '@/components/AgentManagement';

const AgentManagementPage: React.FC = () => {
  return (
    <div className="main-layout">
      <Navigation />
      <div className="page-container">
        <AgentManagement />
      </div>
    </div>
  );
};

export default AgentManagementPage;