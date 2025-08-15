/**
 * Loading State Manager - Phase 4.4
 * 
 * 統一管理所有載入狀態，提供更好的用戶體驗
 */

import { useState, useCallback, useRef } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  data: unknown;
}

interface LoadingOptions {
  minLoadingTime?: number; // 最小載入時間，防止閃爍
  timeout?: number; // 超時時間
  retryCount?: number; // 重試次數
  retryDelay?: number; // 重試延遲
}

class LoadingManager {
  private states = new Map<string, LoadingState>();
  private timeouts = new Map<string, NodeJS.Timeout>();

  /**
   * 設定載入狀態
   */
  setLoading(key: string, isLoading: boolean, error: string | null = null): void {
    const currentState = this.states.get(key) || { isLoading: false, error: null, data: null };
    
    this.states.set(key, {
      ...currentState,
      isLoading,
      error
    });

    // 廣播狀態變更
    this.notifyStateChange(key);
  }

  /**
   * 獲取載入狀態
   */
  getState(key: string): LoadingState {
    return this.states.get(key) || { isLoading: false, error: null, data: null };
  }

  /**
   * 執行帶載入狀態的異步操作
   */
  async executeWithLoading<T>(
    key: string,
    operation: () => Promise<T>,
    options: LoadingOptions = {}
  ): Promise<T> {
    const {
      minLoadingTime = 300,
      timeout = 30000,
      retryCount = 2,
      retryDelay = 1000
    } = options;

    const startTime = Date.now();
    this.setLoading(key, true);

    try {
      // 設定超時
      const timeoutPromise = new Promise<never>((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`Operation timed out after ${timeout}ms`));
        }, timeout);
        this.timeouts.set(key, timeoutId);
      });

      // 執行操作
      const result = await Promise.race([
        this.executeWithRetry(operation, retryCount, retryDelay),
        timeoutPromise
      ]);

      // 確保最小載入時間
      const elapsed = Date.now() - startTime;
      if (elapsed < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed));
      }

      this.setLoading(key, false);
      this.clearTimeout(key);

      // 儲存結果
      const currentState = this.states.get(key)!;
      this.states.set(key, { ...currentState, data: result });

      return result;
    } catch (error) {
      this.setLoading(key, false, error instanceof Error ? error.message : String(error));
      this.clearTimeout(key);
      throw error;
    }
  }

  /**
   * 帶重試的操作執行
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    retryCount: number,
    retryDelay: number
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i <= retryCount; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (i < retryCount) {
          console.warn(`🔄 Retry ${i + 1}/${retryCount} after ${retryDelay}ms:`, lastError.message);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    throw lastError!;
  }

  /**
   * 清除超時
   */
  private clearTimeout(key: string): void {
    const timeoutId = this.timeouts.get(key);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(key);
    }
  }

  /**
   * 狀態變更通知 (可以擴展為事件系統)
   */
  private notifyStateChange(key: string): void {
    // 這裡可以實現事件發射器模式
    console.log(`📊 Loading state changed for ${key}:`, this.getState(key));
  }

  /**
   * 清除狀態
   */
  clearState(key: string): void {
    this.states.delete(key);
    this.clearTimeout(key);
  }

  /**
   * 獲取所有狀態統計
   */
  getStats() {
    const states = Array.from(this.states.values());
    return {
      total: states.length,
      loading: states.filter(s => s.isLoading).length,
      errors: states.filter(s => s.error).length,
      completed: states.filter(s => !s.isLoading && !s.error).length
    };
  }
}

export const loadingManager = new LoadingManager();

/**
 * React Hook for loading states
 */
export function useLoadingState(key: string, options: LoadingOptions = {}) {
  const [state, setState] = useState(() => loadingManager.getState(key));
  const mountedRef = useRef(true);

  const execute = useCallback(async <T>(operation: () => Promise<T>): Promise<T> => {
    try {
      const result = await loadingManager.executeWithLoading(key, operation, options);
      if (mountedRef.current) {
        setState(loadingManager.getState(key));
      }
      return result;
    } catch (error) {
      if (mountedRef.current) {
        setState(loadingManager.getState(key));
      }
      throw error;
    }
  }, [key, options]);

  const clearState = useCallback(() => {
    loadingManager.clearState(key);
    if (mountedRef.current) {
      setState({ isLoading: false, error: null, data: null });
    }
  }, [key]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    execute,
    clearState
  };
}

// React import for useEffect
import React from 'react';