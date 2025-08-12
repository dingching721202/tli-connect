'use client';

import React from 'react';
import Navigation from '@/components/Navigation';
import ConsultationManagementSimple from '@/components/ConsultationManagementSimple';

const ConsultationManagementPage: React.FC = () => {
  return (
    <div className="main-layout">
      <Navigation />
      <div className="page-container">
        <ConsultationManagementSimple />
      </div>
    </div>
  );
};

export default ConsultationManagementPage;