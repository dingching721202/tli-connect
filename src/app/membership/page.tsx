'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiStar, FiClock, FiUsers, FiShoppingCart, FiCalendar, FiDollarSign } from 'react-icons/fi';
import Navigation from '@/components/Navigation';
import SafeIcon from '@/components/common/SafeIcon';
import PurchaseModal from '@/components/PurchaseModal';
import RegisterModal from '@/components/RegisterModal';
import CorporateInquiryForm from '@/components/CorporateInquiryForm';
import IndividualContactForm from '@/components/IndividualContactForm';
import { MemberCardPlan } from '@/data/member_card_plans';
import { useAuth } from '@/contexts/AuthContext';

const MembershipPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<MemberCardPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'individual' | 'corporate'>('individual');
  const [selectedPlan, setSelectedPlan] = useState<MemberCardPlan | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showCorporateForm, setShowCorporateForm] = useState(false);
  const [showIndividualForm, setShowIndividualForm] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/member-card-plans', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPlans(data.data || []);
      }
    } catch (error) {
      console.error('載入會員方案失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (days: number) => {
    if (days >= 365) {
      return `${Math.round(days / 365)} 年`;
    } else if (days >= 30) {
      return `${Math.round(days / 30)} 個月`;
    } else {
      return `${days} 天`;
    }
  };

  const getPlanTypeConfig = (userType: string, durationType: string) => {
    if (userType === 'individual' && durationType === 'season') {
      return {
        label: '個人季度',
        icon: FiUsers,
        color: 'bg-blue-100 text-blue-800',
        borderColor: 'border-blue-200',
        gradient: 'from-blue-50 to-blue-100'
      };
    }
    if (userType === 'individual' && durationType === 'annual') {
      return {
        label: '個人年度',
        icon: FiCalendar,
        color: 'bg-green-100 text-green-800',
        borderColor: 'border-green-200',
        gradient: 'from-green-50 to-green-100'
      };
    }
    if (userType === 'corporate' && durationType === 'season') {
      return {
        label: '企業季度',
        icon: FiClock,
        color: 'bg-purple-100 text-purple-800',
        borderColor: 'border-purple-200',
        gradient: 'from-purple-50 to-purple-100'
      };
    }
    if (userType === 'corporate' && durationType === 'annual') {
      return {
        label: '企業年度',
        icon: FiStar,
        color: 'bg-yellow-100 text-yellow-800',
        borderColor: 'border-yellow-200',
        gradient: 'from-yellow-50 to-yellow-100'
      };
    }
    return {
      label: '方案',
      icon: FiUsers,
      color: 'bg-gray-100 text-gray-800',
      borderColor: 'border-gray-200',
      gradient: 'from-gray-50 to-gray-100'
    };
  };


  const handlePurchaseClick = async (plan: MemberCardPlan) => {
    // 檢查是否已登入
    if (!isAuthenticated || !user) {
      // 未登入，顯示註冊表單
      setSelectedPlan(plan);
      setShowRegisterModal(true);
      return;
    }

    // 已登入，直接進入付款流程
    try {
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: plan.id,
          user_email: user.email,
          user_name: user.name
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('創建訂單失敗');
      }

      const orderData = await orderResponse.json();
      const orderId = orderData.data.id;

      // 使用正確的付款 API 端點
      const paymentResponse = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          amount: parseInt(plan.sale_price, 10),
          description: `購買會員方案: ${plan.title}`,
          return_url: `${window.location.origin}/payment-result`
        }),
      });

      if (!paymentResponse.ok) {
        // 付款請求失敗，更新訂單狀態為 CANCELED
        await fetch(`/api/orders/${orderId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'CANCELED'
          }),
        });
        throw new Error('發起付款失敗');
      }

      const paymentData = await paymentResponse.json();
      
      if (paymentData.success && paymentData.data.payment_url) {
        // 付款請求成功，跳轉到付款頁面
        window.location.href = paymentData.data.payment_url;
      } else {
        // 付款請求失敗，更新訂單狀態為 CANCELED
        await fetch(`/api/orders/${orderId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'CANCELED'
          }),
        });
        throw new Error('付款請求失敗');
      }
    } catch (error) {
      console.error('購買失敗:', error);
      alert('購買失敗，請稍後再試');
    }
  };

  const handleContactClick = (plan: MemberCardPlan) => {
    setSelectedPlan(plan);
    if (plan.user_type === 'individual') {
      setShowIndividualForm(true);
    } else {
      setShowCorporateForm(true);
    }
  };

  const handleCloseContactModal = () => {
    setShowContactModal(false);
    setSelectedPlan(null);
  };

  const handleCloseCorporateForm = () => {
    setShowCorporateForm(false);
    setSelectedPlan(null);
  };

  const handleCloseIndividualForm = () => {
    setShowIndividualForm(false);
    setSelectedPlan(null);
  };

  const handleCloseRegisterModal = () => {
    setShowRegisterModal(false);
    setSelectedPlan(null);
  };

  const handleRegisterSuccess = async () => {
    // 註冊成功後，給予一些時間讓AuthContext更新狀態
    setTimeout(async () => {
      if (selectedPlan && user) {
        console.log('註冊成功，直接進入付款流程');
        try {
          const orderResponse = await fetch('/api/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              plan_id: selectedPlan.id,
              user_email: user.email,
              user_name: user.name
            }),
          });

          if (!orderResponse.ok) {
            throw new Error('創建訂單失敗');
          }

          const orderData = await orderResponse.json();
          const orderId = orderData.data.id;

          // 使用正確的付款 API 端點
          const paymentResponse = await fetch('/api/payment/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              order_id: orderId,
              amount: parseInt(selectedPlan.sale_price, 10),
              description: `購買會員方案: ${selectedPlan.title}`,
              return_url: `${window.location.origin}/payment-result`
            }),
          });

          if (!paymentResponse.ok) {
            await fetch(`/api/orders/${orderId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                status: 'CANCELED'
              }),
            });
            throw new Error('發起付款失敗');
          }

          const paymentData = await paymentResponse.json();
          
          if (paymentData.success && paymentData.data.payment_url) {
            // 付款請求成功，跳轉到付款頁面
            window.location.href = paymentData.data.payment_url;
          } else {
            // 付款請求失敗，更新訂單狀態為 CANCELED
            await fetch(`/api/orders/${orderId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                status: 'CANCELED'
              }),
            });
            throw new Error('付款請求失敗');
          }
        } catch (error) {
          console.error('購買失敗:', error);
          alert('購買失敗，請稍後再試');
        }
      } else {
        console.error('註冊成功但用戶資料未更新或方案遺失');
        alert('註冊成功！請重新點擊購買按鈕。');
        setShowRegisterModal(false);
        setSelectedPlan(null);
      }
    }, 1000); // 等待1秒讓AuthContext狀態更新
  };


  const filteredPlans = plans.filter(plan => {
    return plan.user_type === selectedFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">載入中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-layout">
      <Navigation />
      
      <div className="page-container py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">選擇您的會員方案</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            加入我們的會員計劃，享受專屬學習體驗和優質服務
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setSelectedFilter('individual')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedFilter === 'individual'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              個人方案
            </button>
            <button
              onClick={() => setSelectedFilter('corporate')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedFilter === 'corporate'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              企業方案
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
          {filteredPlans.map((plan) => {
            const config = getPlanTypeConfig(plan.user_type, plan.duration_type);
            const Icon = config.icon;
            const isPopular = plan.popular || false;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative bg-gradient-to-br ${config.gradient} rounded-2xl border-2 ${config.borderColor} p-8 hover:shadow-xl transition-all duration-300 w-full max-w-sm ${
                  isPopular ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                      <SafeIcon icon={FiStar} size={12} />
                      <span>最受歡迎</span>
                    </div>
                  </div>
                )}

                {/* Plan Type Badge */}
                <div className="flex justify-between items-start mb-6">
                  <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${config.color}`}>
                    <Icon className="w-4 h-4" />
                    <span>{config.label}</span>
                  </div>
                </div>

                {/* Plan Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                {/* Duration */}
                <p className="text-gray-600 mb-6 flex items-center space-x-2">
                  <SafeIcon icon={FiClock} className="text-gray-500" size={16} />
                  <span>有效期限：{formatDuration(plan.duration_days)}</span>
                </p>

                {/* Price */}
                <div className="mb-8">
                  {plan.hide_price ? (
                    <div className="text-center py-4">
                      <div className="text-lg font-medium text-gray-600 bg-gray-100 rounded-lg py-3 px-4 flex items-center justify-center space-x-2">
                        <SafeIcon icon={FiDollarSign} />
                        <span>價格請洽詢</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        請聯繫我們獲取詳細報價
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900">
                          NT$ {parseInt(plan.sale_price, 10).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-2">
                        平均每天 NT$ {Math.round(parseInt(plan.sale_price, 10) / plan.duration_days)}
                      </p>
                    </>
                  )}
                </div>

                {/* Features */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">方案特色</h4>
                  <div className="space-y-3">
                    {(plan.features ?? []).slice(0, 5).map((feature, index) => (
                      <div key={`feature-${feature}-${index}`} className="flex items-center space-x-3">
                        <SafeIcon icon={FiCheck} className="text-green-500 w-5 h-5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                    {(plan.features?.length ?? 0) > 5 && (
                      <p className="text-xs text-gray-500 pl-8">
                        還有 {(plan.features?.length ?? 0) - 5} 項功能...
                      </p>
                    )}
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="mt-auto pt-6">
                  <div className="space-y-3">
                    {plan.hide_price ? (
                      <button
                        onClick={() => handleContactClick(plan)}
                        className="w-full py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 font-semibold bg-green-600 text-white hover:bg-green-700"
                      >
                        <SafeIcon icon={FiUsers} />
                        <span>聯繫我們</span>
                      </button>
                    ) : (
                      <>
                        {plan.cta_options?.show_payment && (
                          <button
                            onClick={() => handlePurchaseClick(plan)}
                            className="w-full py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 font-semibold bg-blue-600 text-white hover:bg-blue-700"
                          >
                            <SafeIcon icon={FiShoppingCart} />
                            <span>立即購買</span>
                          </button>
                        )}
                        {plan.cta_options?.show_contact && (
                          <button
                            onClick={() => handleContactClick(plan)}
                            className="w-full py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 font-semibold bg-green-600 text-white hover:bg-green-700"
                          >
                            <SafeIcon icon={FiUsers} />
                            <span>聯繫我們</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredPlans.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">目前沒有可用的會員方案</p>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {selectedPlan && (
        <PurchaseModal
          isOpen={showContactModal}
          onClose={handleCloseContactModal}
          plan={selectedPlan}
          mode="contact"
        />
      )}

      {/* Register Modal */}
      {selectedPlan && (
        <RegisterModal
          isOpen={showRegisterModal}
          onClose={handleCloseRegisterModal}
          plan={selectedPlan}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}

      {/* Individual Contact Form */}
      <IndividualContactForm
        isOpen={showIndividualForm}
        onClose={handleCloseIndividualForm}
        source="individual_form"
      />

      {/* Corporate Contact Form */}
      <CorporateInquiryForm
        isOpen={showCorporateForm}
        onClose={handleCloseCorporateForm}
      />
    </div>
  );
};

export default MembershipPage;