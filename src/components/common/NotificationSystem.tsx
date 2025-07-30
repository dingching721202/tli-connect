'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { UserFriendlyError } from '@/utils/errorHandler';

interface Notification extends UserFriendlyError {
  id: string;
  timestamp: number;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (notification: UserFriendlyError) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

/**
 * 通知系統 Provider
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showNotification = useCallback((notification: UserFriendlyError) => {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now()
    };

    setNotifications(prev => [...prev, newNotification]);

    // 自動隱藏
    if (notification.autoHide) {
      setTimeout(() => {
        dismissNotification(id);
      }, notification.autoHide);
    }
  }, [dismissNotification]);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      showNotification,
      dismissNotification,
      clearAllNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * 使用通知系統的 Hook
 */
export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

/**
 * 通知顯示組件
 */
export function NotificationContainer() {
  const { notifications, dismissNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={() => dismissNotification(notification.id)}
        />
      ))}
    </div>
  );
}

/**
 * 單個通知項目組件
 */
function NotificationItem({ 
  notification, 
  onDismiss 
}: { 
  notification: Notification; 
  onDismiss: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 動畫效果：延遲顯示
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300); // 等待動畫完成
  };

  const getSeverityStyles = (severity: UserFriendlyError['severity']) => {
    switch (severity) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200',
          icon: 'text-green-600',
          title: 'text-green-800',
          message: 'text-green-700',
          iconPath: 'M5 13l4 4L19 7'
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          title: 'text-red-800',
          message: 'text-red-700',
          iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
        };
      default: // info
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          message: 'text-blue-700',
          iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        };
    }
  };

  const styles = getSeverityStyles(notification.severity);

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${styles.container}
        border rounded-lg shadow-lg p-4 max-w-sm w-full
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg 
            className={`w-5 h-5 ${styles.icon}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={styles.iconPath} />
          </svg>
        </div>
        
        <div className="ml-3 flex-1">
          <h4 className={`text-sm font-medium ${styles.title}`}>
            {notification.title}
          </h4>
          
          <p className={`mt-1 text-sm ${styles.message} whitespace-pre-line`}>
            {notification.message}
          </p>
          
          {notification.action && (
            <div className="mt-3">
              <button
                className={`
                  text-sm font-medium underline hover:no-underline
                  ${notification.severity === 'error' ? 'text-red-700' :
                    notification.severity === 'warning' ? 'text-yellow-700' :
                    notification.severity === 'success' ? 'text-green-700' :
                    'text-blue-700'}
                `}
                onClick={() => {
                  // 這裡可以根據不同的 action 執行不同的操作
                  console.log('Action clicked:', notification.action);
                }}
              >
                {notification.action}
              </button>
            </div>
          )}
        </div>
        
        {notification.dismissible && (
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleDismiss}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 快捷方法：顯示成功通知
 */
export function useSuccessNotification() {
  const { showNotification } = useNotification();
  
  return useCallback((message: string, autoHide: number = 3000) => {
    showNotification({
      title: '操作成功',
      message,
      severity: 'success',
      dismissible: true,
      autoHide
    });
  }, [showNotification]);
}

/**
 * 快捷方法：顯示錯誤通知
 */
export function useErrorNotification() {
  const { showNotification } = useNotification();
  
  return useCallback((message: string, title: string = '發生錯誤') => {
    showNotification({
      title,
      message,
      severity: 'error',
      dismissible: true
    });
  }, [showNotification]);
}

/**
 * 快捷方法：顯示警告通知
 */
export function useWarningNotification() {
  const { showNotification } = useNotification();
  
  return useCallback((message: string, title: string = '注意', action?: string) => {
    showNotification({
      title,
      message,
      action,
      severity: 'warning',
      dismissible: true
    });
  }, [showNotification]);
}

/**
 * 快捷方法：顯示資訊通知
 */
export function useInfoNotification() {
  const { showNotification } = useNotification();
  
  return useCallback((message: string, title: string = '提示', autoHide: number = 5000) => {
    showNotification({
      title,
      message,
      severity: 'info',
      dismissible: true,
      autoHide
    });
  }, [showNotification]);
}