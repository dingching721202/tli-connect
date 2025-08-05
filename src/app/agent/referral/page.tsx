'use client';

import React from 'react';
import RoleSubPage from '@/components/RoleSubPage';
import { FiShare2 } from 'react-icons/fi';

const AgentReferralPage = () => {
  return (
    <RoleSubPage
      requiredRole="AGENT"
      roleDisplayName="代理商"
      rolePath="agent"
      pageTitle="推薦系統"
      pageDescription="管理推薦業務"
      pageIcon={FiShare2}
      colorTheme="text-yellow-600"
    />
  );
};

export default AgentReferralPage;