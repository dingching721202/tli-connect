'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiCheck, FiLoader, FiCalendar, FiTrendingUp, FiAward, FiUser, FiUsers } from 'react-icons/fi';
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
  const [activeTab, setActiveTab] = useState<'individual' | 'corporate'>('individual');
  const { isAuthenticated } = useAuth();

  // 載入會員方案
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        console.log('📡 開始載入會員方案...');
        
        const response = await fetch('/api/member-card-plans');
        const data = await response.json();
        
        console.log('📦 API 返回資料:', data);

        if (data.success) {
          console.log('✅ 成功載入', data.count, '個方案');
          setPlans(data.data);
          setError('');
        } else {
          console.error('❌ API 返回錯誤:', data.message);
          setError(data.message || '無法載入會員方案');
        }
      } catch (error) {
        console.error('❌ 載入會員方案失敗:', error);
        setError('載入會員方案失敗，請稍後再試');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();

    // 監聽管理端的方案更新事件
    const handlePlansUpdate = () => {
      console.log('🔄 收到方案更新事件，重新載入資料...');
      fetchPlans();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('membershipPlansUpdated', handlePlansUpdate);
      
      return () => {
        window.removeEventListener('membershipPlansUpdated', handlePlansUpdate);
      };
    }
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

  // 根據分頁過濾方案
  const filteredPlans = plans.filter(plan => {
    if (activeTab === 'individual') {
      return plan.plan_type === 'individual';
    } else {
      return plan.plan_type === 'corporate';
    }
  });

  // 按類型排序：季度 → 年度 → 企業
  const sortedPlans = [...filteredPlans].sort((a, b) => {
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
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-md mx-auto">
          <p className="text-blue-800 text-sm">
            🎯 立即選購方案，開始您的學習之旅！
          </p>
        </div>
      </motion.div>

      {/* 分頁切換按鈕 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center mb-8"
      >
        <div className="bg-white rounded-xl shadow-lg p-2 border border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('individual')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'individual'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <SafeIcon icon={FiUser} />
              <span>個人方案</span>
            </button>
            <button
              onClick={() => setActiveTab('corporate')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'corporate'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              <SafeIcon icon={FiUsers} />
              <span>企業方案</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 方案卡片 */}
      {sortedPlans.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">
            {activeTab === 'individual' ? '👤' : '🏢'}
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {activeTab === 'individual' ? '暫無個人方案' : '暫無企業方案'}
          </h3>
          <p className="text-gray-500 mb-6">
            {activeTab === 'individual' 
              ? '目前沒有可用的個人會員方案，請稍後再來查看或聯繫客服。'
              : '目前沒有可用的企業方案，請聯繫我們獲取客製化企業解決方案。'
            }
          </p>
          <button
            onClick={() => setActiveTab(activeTab === 'individual' ? 'corporate' : 'individual')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            查看{activeTab === 'individual' ? '企業' : '個人'}方案
          </button>
        </motion.div>
      ) : (
        <div className={`grid gap-8 mb-12 ${
          sortedPlans.length === 1 
            ? 'grid-cols-1 max-w-md mx-auto' 
            : sortedPlans.length === 2 
              ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
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
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r ${config.gradient} hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
                  onClick={() => {
                    // TODO: 導向購買流程
                    console.log('選擇方案:', plan.plan_id);
                    if (plan.type === 'CORPORATE') {
                      // 企業方案導向聯繫頁面
                      window.location.href = '/corporate-inquiries';
                    } else {
                      // 個人方案導向購買流程
                      // 可以導向購買頁面或顯示購買彈窗
                      alert(`即將購買：${plan.title}\n價格：NT$ ${plan.price.toLocaleString()}\n\n購買功能開發中...`);
                    }
                  }}
                >
                  {plan.type === 'CORPORATE' 
                    ? '聯繫我們' 
                    : '立即購買'
                  }
                </button>
              </div>
            </motion.div>
          );
        })}
        </div>
      )}

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