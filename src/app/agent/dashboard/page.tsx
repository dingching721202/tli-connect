'use client';

import React from 'react';
import RoleSubPage from '@/components/RoleSubPage';
import { FiBarChart } from 'react-icons/fi';

const AgentDashboardPage = () => {
  return (
    <RoleSubPage
      requiredRole="AGENT"
      roleDisplayName="代理商"
      rolePath="agent"
      pageTitle="儀表板"
      pageDescription="查看代理業務概況"
      pageIcon={FiBarChart}
      colorTheme="text-yellow-600"
    />
  );
};

export default AgentDashboardPage;