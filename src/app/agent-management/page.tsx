'use client';

import React from 'react';
import Navigation from '@/components/Navigation';
import AgentManagement from '@/components/AgentManagement';

const AgentManagementPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <AgentManagement />
      </div>
    </div>
  );
};

export default AgentManagementPage;