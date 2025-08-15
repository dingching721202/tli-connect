/**
 * Performance Optimization Library - Phase 4.4
 * 
 * 統一匯出所有效能優化工具
 */

export { queryOptimizer } from './queryOptimizer';
export { loadingManager, useLoadingState } from './loadingManager';
export { 
  ErrorBoundary, 
  withErrorBoundary, 
  useErrorHandler,
  getStoredErrorReports,
  clearStoredErrorReports 
} from './errorBoundary';

// 效能監控工具
export class PerformanceMonitor {
  private static metrics = new Map<string, number[]>();

  /**
   * 記錄效能指標
   */
  static recordMetric(key: string, value: number): void {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    
    const values = this.metrics.get(key)!;
    values.push(value);
    
    // 保持最近100個記錄
    if (values.length > 100) {
      values.shift();
    }
  }

  /**
   * 獲取效能統計
   */
  static getStats(key: string) {
    const values = this.metrics.get(key) || [];
    if (values.length === 0) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: values.reduce((sum, v) => sum + v, 0) / values.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p90: sorted[Math.floor(sorted.length * 0.9)],
      p95: sorted[Math.floor(sorted.length * 0.95)]
    };
  }

  /**
   * 獲取所有指標統計
   */
  static getAllStats() {
    const result: Record<string, ReturnType<typeof PerformanceMonitor.getStats>> = {};
    for (const key of this.metrics.keys()) {
      result[key] = this.getStats(key);
    }
    return result;
  }

  /**
   * 清除指標
   */
  static clearMetrics(key?: string): void {
    if (key) {
      this.metrics.delete(key);
    } else {
      this.metrics.clear();
    }
  }
}

/**
 * 效能測量裝飾器
 */
export function measurePerformance(metricKey: string) {
  return function (target: unknown, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const startTime = performance.now();
      
      try {
        const result = await method.apply(this, args);
        const endTime = performance.now();
        
        PerformanceMonitor.recordMetric(metricKey, endTime - startTime);
        console.log(`📊 ${metricKey}: ${(endTime - startTime).toFixed(2)}ms`);
        
        return result;
      } catch (error) {
        const endTime = performance.now();
        PerformanceMonitor.recordMetric(`${metricKey}_error`, endTime - startTime);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * 頁面載入效能追蹤
 */
export function trackPagePerformance(pageName: string) {
  if (typeof window === 'undefined') return;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (navigation) {
    const metrics = {
      DNS: navigation.domainLookupEnd - navigation.domainLookupStart,
      TCP: navigation.connectEnd - navigation.connectStart,
      TTFB: navigation.responseStart - navigation.requestStart,
      Download: navigation.responseEnd - navigation.responseStart,
      DOMParse: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      Total: navigation.loadEventEnd - navigation.navigationStart
    };

    Object.entries(metrics).forEach(([key, value]) => {
      PerformanceMonitor.recordMetric(`page_${pageName}_${key}`, value);
    });

    console.log(`📈 Page Performance for ${pageName}:`, metrics);
  }
}