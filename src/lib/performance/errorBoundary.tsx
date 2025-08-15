/**
 * Error Boundary System - Phase 4.4
 * 
 * 提供全面的錯誤處理和用戶友好的錯誤顯示
 */

'use client';

import React from 'react';

interface ErrorInfo {
  componentStack: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  resetError: () => void;
  errorId: string;
}

/**
 * 全功能錯誤邊界組件
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Error Boundary caught an error:', error, errorInfo);

    this.setState({
      errorInfo
    });

    // 調用自定義錯誤處理器
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 錯誤報告 (可以發送到錯誤追蹤服務)
    this.reportError(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { hasError } = this.state;
    const { resetOnPropsChange, resetKeys } = this.props;

    // 自動重置錯誤狀態
    if (hasError && resetOnPropsChange) {
      if (resetKeys && resetKeys.length > 0) {
        const prevResetKeys = prevProps.resetKeys || [];
        const hasResetKeyChanged = resetKeys.some((key, idx) => prevResetKeys[idx] !== key);
        
        if (hasResetKeyChanged) {
          this.resetError();
        }
      }
    }
  }

  /**
   * 錯誤報告 (可擴展為發送到監控服務)
   */
  private reportError(error: Error, errorInfo: ErrorInfo): void {
    const errorReport = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // 這裡可以發送到錯誤追蹤服務
    console.log('📊 Error Report:', errorReport);
    
    // 儲存到本地儲存以供調試
    try {
      const existingErrors = JSON.parse(localStorage.getItem('error_reports') || '[]');
      existingErrors.push(errorReport);
      
      // 保持最近10個錯誤報告
      if (existingErrors.length > 10) {
        existingErrors.splice(0, existingErrors.length - 10);
      }
      
      localStorage.setItem('error_reports', JSON.stringify(existingErrors));
    } catch (e) {
      console.warn('Failed to save error report to localStorage:', e);
    }
  }

  /**
   * 重置錯誤狀態
   */
  resetError = (): void => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  /**
   * 延遲自動重置
   */
  scheduleReset = (delay: number = 5000): void => {
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetError();
    }, delay);
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error!}
          errorInfo={this.state.errorInfo!}
          resetError={this.resetError}
          errorId={this.state.errorId}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * 預設錯誤顯示組件
 */
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  errorInfo, 
  resetError, 
  errorId 
}) => {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-4">
            <h1 className="text-lg font-semibold text-gray-900">
              發生了意外錯誤
            </h1>
            <p className="text-sm text-gray-600">
              很抱歉，系統遇到了問題
            </p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-700 mb-2">
            錯誤 ID: <code className="bg-gray-100 px-1 rounded text-xs">{errorId}</code>
          </p>
          <p className="text-sm text-gray-600">
            {error.message}
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={resetError}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
          >
            重新嘗試
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
          >
            重新載入頁面
          </button>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          {showDetails ? '隱藏' : '顯示'} 技術詳情
        </button>

        {showDetails && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md text-xs">
            <div className="mb-2">
              <strong>錯誤堆疊:</strong>
              <pre className="mt-1 whitespace-pre-wrap break-all text-gray-700">
                {error.stack}
              </pre>
            </div>
            {errorInfo && (
              <div>
                <strong>組件堆疊:</strong>
                <pre className="mt-1 whitespace-pre-wrap break-all text-gray-700">
                  {errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 高階組件：為任何組件添加錯誤邊界
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * React Hook：在函數組件中使用錯誤處理
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    console.error('🚨 Error handled by useErrorHandler:', error);
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  // 如果有錯誤，拋出錯誤讓錯誤邊界捕獲
  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, clearError };
}

/**
 * 工具函數：獲取儲存的錯誤報告
 */
export function getStoredErrorReports() {
  try {
    return JSON.parse(localStorage.getItem('error_reports') || '[]');
  } catch {
    return [];
  }
}

/**
 * 工具函數：清除儲存的錯誤報告
 */
export function clearStoredErrorReports() {
  try {
    localStorage.removeItem('error_reports');
  } catch (e) {
    console.warn('Failed to clear error reports:', e);
  }
}