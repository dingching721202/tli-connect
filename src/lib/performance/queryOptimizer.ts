/**
 * Query Performance Optimizer - Phase 4.4
 * 
 * 提供查詢效能優化和快取策略
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class QueryOptimizer {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5 minutes

  /**
   * 帶快取的查詢執行
   */
  async executeWithCache<T>(
    key: string,
    queryFn: () => Promise<T>,
    cacheTime: number = this.DEFAULT_CACHE_TIME
  ): Promise<T> {
    // 檢查快取
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.expiresIn) {
      console.log(`🚀 Cache hit for key: ${key}`);
      return cached.data;
    }

    // 執行查詢
    console.log(`📡 Executing query for key: ${key}`);
    const startTime = Date.now();
    
    try {
      const data = await queryFn();
      const endTime = Date.now();
      
      // 儲存至快取
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        expiresIn: cacheTime
      });

      console.log(`✅ Query completed in ${endTime - startTime}ms for key: ${key}`);
      return data;
    } catch (error) {
      console.error(`❌ Query failed for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * 批次查詢優化
   */
  async executeBatch<T>(
    queries: Array<{
      key: string;
      queryFn: () => Promise<T>;
      cacheTime?: number;
    }>
  ): Promise<T[]> {
    console.log(`🔄 Executing ${queries.length} queries in batch`);
    
    const promises = queries.map(({ key, queryFn, cacheTime }) =>
      this.executeWithCache(key, queryFn, cacheTime)
    );

    return Promise.all(promises);
  }

  /**
   * 預載查詢
   */
  async preload<T>(
    key: string,
    queryFn: () => Promise<T>,
    cacheTime?: number
  ): Promise<void> {
    try {
      await this.executeWithCache(key, queryFn, cacheTime);
      console.log(`🎯 Preloaded data for key: ${key}`);
    } catch (error) {
      console.warn(`⚠️ Preload failed for key: ${key}`, error);
    }
  }

  /**
   * 清除快取
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
      console.log(`🗑️ Cleared cache for key: ${key}`);
    } else {
      this.cache.clear();
      console.log(`🗑️ Cleared all cache`);
    }
  }

  /**
   * 獲取快取統計
   */
  getCacheStats() {
    const entries = Array.from(this.cache.entries());
    const now = Date.now();
    
    return {
      total: entries.length,
      active: entries.filter(([, entry]) => now - entry.timestamp < entry.expiresIn).length,
      expired: entries.filter(([, entry]) => now - entry.timestamp >= entry.expiresIn).length
    };
  }

  /**
   * 清理過期快取
   */
  cleanupExpiredCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= entry.expiresIn) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
    
    if (expiredKeys.length > 0) {
      console.log(`🧹 Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }
}

export const queryOptimizer = new QueryOptimizer();

// 自動清理過期快取 (每5分鐘)
if (typeof window !== 'undefined') {
  setInterval(() => {
    queryOptimizer.cleanupExpiredCache();
  }, 5 * 60 * 1000);
}