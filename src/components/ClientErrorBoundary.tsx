'use client';

import { ErrorBoundary } from '@/lib/performance/errorBoundary';

interface ClientErrorBoundaryProps {
  children: React.ReactNode;
}

export function ClientErrorBoundary({ children }: ClientErrorBoundaryProps) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // 錯誤追蹤和監控
        console.error('🚨 Root Error Boundary - Phase 4.4:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}