'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiCheck, FiLoader, FiCalendar, FiTrendingUp, FiAward } from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import { useAuth } from '@/contexts/AuthContext';

interface MembershipPlan {
  plan_id: number;
  title: string;
  type: 'SEASON' | 'YEAR' | 'CORPORATE';
  duration_days: number;
  price: number;
  original_price: number;
  features: string[];
  plan_type: 'individual' | 'corporate';
  category: string;
}

const MembershipPlans: React.FC = () => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  // 載入會員方案
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/member-card-plans');
        const data = await response.json();

        if (data.success) {
          setPlans(data.data);
        } else {
          setError(data.message || '無法載入會員方案');
        }
      } catch (error) {
        console.error('Failed to fetch membership plans:', error);
        setError('載入會員方案失敗，請稍後再試');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // 獲取方案類型的樣式和圖示
  const getPlanTypeConfig = (type: string) => {
    switch (type) {
      case 'SEASON':
        return {
          label: '季度方案',
          icon: FiCalendar,
          gradient: 'from-blue-500 to-cyan-500',
          bgGradient: 'from-blue-50 to-cyan-50',
          borderColor: 'border-blue-200',
          tagColor: 'bg-blue-100 text-blue-800'
        };
      case 'YEAR':
        return {
          label: '年度方案',
          icon: FiAward,
          gradient: 'from-purple-500 to-pink-500',
          bgGradient: 'from-purple-50 to-pink-50',
          borderColor: 'border-purple-200',
          tagColor: 'bg-purple-100 text-purple-800',
          isPopular: true
        };
      case 'CORPORATE':
        return {
          label: '企業方案',
          icon: FiTrendingUp,
          gradient: 'from-orange-500 to-red-500',
          bgGradient: 'from-orange-50 to-red-50',
          borderColor: 'border-orange-200',
          tagColor: 'bg-orange-100 text-orange-800'
        };
      default:
        return {
          label: '方案',
          icon: FiStar,
          gradient: 'from-gray-500 to-gray-600',
          bgGradient: 'from-gray-50 to-gray-100',
          borderColor: 'border-gray-200',
          tagColor: 'bg-gray-100 text-gray-800'
        };
    }
  };

  // 計算節省金額
  const getSavings = (price: number, originalPrice: number) => {
    if (originalPrice > price) {
      const savings = originalPrice - price;
      const percentage = Math.round((savings / originalPrice) * 100);
      return { savings, percentage };
    }
    return null;
  };

  // 格式化持續時間
  const formatDuration = (days: number) => {
    if (days >= 365) {
      const years = Math.floor(days / 365);
      return `${years} 年`;
    } else if (days >= 30) {
      const months = Math.floor(days / 30);
      return `${months} 個月`;
    } else {
      return `${days} 天`;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <SafeIcon icon={FiLoader} className="animate-spin text-blue-600 text-4xl mx-auto mb-4" />
        <p className="text-gray-600">載入會員方案中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-xl mb-4">⚠️</div>
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  // 按類型排序：季度 → 年度 → 企業
  const sortedPlans = [...plans].sort((a, b) => {
    const order = { 'SEASON': 1, 'YEAR': 2, 'CORPORATE': 3 };
    return order[a.type] - order[b.type];
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 標題區域 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          選擇最適合您的會員方案
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          無論您是個人學習者還是企業團隊，我們都有完美的方案為您服務
        </p>
        {!isAuthenticated && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200 max-w-md mx-auto">
            <p className="text-yellow-800 text-sm">
              💡 登入後即可選購方案並享受完整會員服務
            </p>
          </div>
        )}
      </motion.div>

      {/* 方案卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {sortedPlans.map((plan, index) => {
          const config = getPlanTypeConfig(plan.type);
          const savings = getSavings(plan.price, plan.original_price);

          return (
            <motion.div
              key={plan.plan_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-gradient-to-br ${config.bgGradient} rounded-2xl border-2 ${config.borderColor} overflow-hidden hover:shadow-xl transition-all duration-300 ${
                config.isPopular ? 'transform hover:scale-105' : 'hover:scale-102'
              }`}
            >
              {/* 熱門標籤 */}
              {config.isPopular && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                    <SafeIcon icon={FiStar} />
                    <span>最受歡迎</span>
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* 方案標題和類型 */}
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${config.gradient}`}>
                      <SafeIcon icon={config.icon} className="text-white text-xl" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.tagColor}`}>
                      {config.label}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.title}
                  </h3>
                  <p className="text-gray-600">
                    有效期限：{formatDuration(plan.duration_days)}
                  </p>
                </div>

                {/* 價格區域 */}
                <div className="mb-8">
                  {plan.type === 'CORPORATE' ? (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        客製化報價
                      </div>
                      <p className="text-gray-600">請聯繫我們獲取企業專屬報價</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <span className="text-4xl font-bold text-gray-900">
                          NT$ {plan.price.toLocaleString()}
                        </span>
                        {savings && (
                          <span className="text-lg text-gray-500 line-through">
                            NT$ {plan.original_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {savings && (
                        <div className="text-green-600 font-medium">
                          立即節省 NT$ {savings.savings.toLocaleString()} ({savings.percentage}% OFF)
                        </div>
                      )}
                      <p className="text-gray-600 mt-2">
                        平均每月 NT$ {Math.round(plan.price / (plan.duration_days / 30)).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* 功能清單 */}
                <div className="mb-8">
                  <h4 className="font-semibold text-gray-900 mb-4">方案包含：</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <SafeIcon 
                          icon={FiCheck} 
                          className="text-green-500 mt-0.5 flex-shrink-0" 
                        />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 選擇按鈕 */}
                <button
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r ${config.gradient} hover:shadow-lg transform hover:scale-105 transition-all duration-200 ${
                    !isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={!isAuthenticated}
                  onClick={() => {
                    if (isAuthenticated) {
                      // TODO: 導向購買流程
                      console.log('選擇方案:', plan.plan_id);
                    }
                  }}
                >
                  {!isAuthenticated 
                    ? '請先登入' 
                    : plan.type === 'CORPORATE' 
                      ? '聯繫我們' 
                      : '選擇此方案'
                  }
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 底部說明 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center py-8 border-t border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          為什麼選擇 TLI Connect 會員？
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <SafeIcon icon={FiStar} className="text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">專業師資</h4>
            <p className="text-gray-600 text-sm">經驗豐富的專業教師團隊</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <SafeIcon icon={FiCheck} className="text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">彈性學習</h4>
            <p className="text-gray-600 text-sm">隨時隨地，自由安排學習時間</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <SafeIcon icon={FiTrendingUp} className="text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">學習追蹤</h4>
            <p className="text-gray-600 text-sm">完整的學習進度分析和建議</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MembershipPlans;