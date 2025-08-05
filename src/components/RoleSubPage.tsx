'use client';

import React from 'react';
import RoleEntry from '@/components/RoleEntry';
import { FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface RoleSubPageProps {
  requiredRole: 'STUDENT' | 'TEACHER' | 'STAFF' | 'ADMIN' | 'AGENT' | 'CORPORATE_CONTACT';
  roleDisplayName: string;
  rolePath: string;
  pageTitle: string;
  pageDescription: string;
  pageIcon: React.ComponentType<any>;
  colorTheme: string;
  children?: React.ReactNode;
}

const RoleSubPage: React.FC<RoleSubPageProps> = ({
  requiredRole,
  roleDisplayName,
  rolePath,
  pageTitle,
  pageDescription,
  pageIcon: IconComponent,
  colorTheme,
  children
}) => {
  const router = useRouter();

  return (
    <RoleEntry requiredRole={requiredRole}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push(`/${rolePath}`)}
            className={`flex items-center ${colorTheme} hover:opacity-80 mb-4`}
          >
            <FiArrowLeft className="mr-2" />
            返回{roleDisplayName}專區
          </button>
          <div className="flex items-center mb-4">
            <IconComponent className="mr-3 text-2xl text-gray-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              {pageTitle}
            </h1>
          </div>
          <p className="text-gray-600">
            在{roleDisplayName}專區中{pageDescription}
          </p>
        </div>

        <div className={`${colorTheme.replace('text-', 'bg-').replace('-600', '-50')} rounded-lg p-6`}>
          <h2 className={`text-xl font-semibold ${colorTheme.replace('-600', '-900')} mb-2`}>
            {roleDisplayName}專區 - {pageTitle}
          </h2>
          <p className={colorTheme.replace('-600', '-700')}>
            您正在{roleDisplayName}專區中使用{pageTitle}功能。
          </p>
        </div>

        {children && (
          <div className="mt-8">
            {children}
          </div>
        )}

        {/* 這裡可以整合原本的功能 */}
      </div>
    </RoleEntry>
  );
};

export default RoleSubPage;