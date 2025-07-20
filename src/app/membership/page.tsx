'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { membershipService, orderService } from '@/services/dataService';
import { paymentService } from '@/services/paymentService';
import { MemberCardPlan, PaymentRequest } from '@/types';

const {
  FiCreditCard, FiCheck, FiUsers, FiStar, FiCalendar, FiVideo, FiAward
} = FiIcons;

function MembershipPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState<{ title: string; price: number; duration_days: number; planId: number } | null>(null);
  const [memberCardPlans, setMemberCardPlans] = useState<MemberCardPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  // 載入已發布的會員方案
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        const plans = await membershipService.getPublishedPlans();
        setMemberCardPlans(plans);
      } catch (error) {
        console.error('載入會員方案失敗:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  const formatPrice = (price: number) => {
    return `NT$ ${price.toLocaleString()}`;
  };

  const handleSelectPlan = (plan: MemberCardPlan) => {
    setSelectedPlan(plan.id);
  };

  const handlePurchase = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    const plan = memberCardPlans.find(p => p.id === selectedPlan);
    if (!plan) return;

    setPaymentData({
      title: plan.title || `${plan.type === 'SEASON' ? '季度' : '年度'}會員方案`,
      price: typeof plan.price === 'string' ? parseFloat(plan.price) : plan.price,
      duration_days: plan.duration_days || (plan.type === 'SEASON' ? 90 : 365),
      planId: plan.id
    });
    setShowPaymentModal(true);
  };

  // 處理實際購買
  const handleConfirmPurchase = async () => {
    if (!user || !paymentData) return;

    try {
      setPurchaseLoading(true);
      
      // 步驟 1: 生成訂單 ID
      const orderId = paymentService.generateOrderId('ord');
      
      // 步驟 2: 建立付款請求
      const paymentRequest: PaymentRequest = {
        order_id: orderId,
        amount: paymentData.price,
        description: `${paymentData.title} - 會員方案`,
        return_url: `${window.location.origin}/payment-result`
      };

      console.log('正在處理付款...', paymentRequest);
      
      // 步驟 3: 呼叫付款服務
      const paymentResult = await paymentService.createPayment(paymentRequest);
      
      if (paymentResult.success && paymentResult.data?.status === 'successful') {
        // 步驟 4: 付款成功後建立訂單
        const orderResult = await orderService.createOrder(user.id, paymentData.planId);
        
        if (orderResult.success) {
          alert(`🎉 付款成功！\n\n方案：${paymentData.title}\n金額：${formatPrice(paymentData.price)}\n付款 ID：${paymentResult.data.payment_id}\n\n會員卡已生成，請前往會員中心啟用！`);
          setShowPaymentModal(false);
          router.push('/dashboard');
        } else {
          alert('付款成功但訂單建立失敗：' + orderResult.error + '\n請聯繫客服處理');
        }
      } else {
        // 付款失敗
        const errorMessage = paymentResult.error || '付款處理失敗';
        alert(`❌ 付款失敗\n\n${errorMessage}\n\n請檢查付款資訊後重試`);
      }
    } catch (error) {
      console.error('購買失敗:', error);
      alert('購買過程中發生錯誤，請稍後再試');
    } finally {
      setPurchaseLoading(false);
    }
  };


  const PaymentModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={() => !purchaseLoading && setShowPaymentModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center mb-4">
          <SafeIcon icon={FiCreditCard} className="text-blue-600 mr-2" />
          <h3 className="text-xl font-bold">確認付款</h3>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-800 mb-3">訂單詳情</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">方案：</span>
              <span className="font-medium">{paymentData?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">有效期限：</span>
              <span className="font-medium">{paymentData?.duration_days} 天</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">付款金額：</span>
                <span className="font-bold text-lg text-blue-600">{formatPrice(paymentData?.price || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <div className="flex items-start">
            <SafeIcon icon={FiCheck} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">安全付款保障</p>
              <p>本系統使用安全的付款處理服務，您的付款資訊將被加密保護。</p>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleConfirmPurchase}
            disabled={purchaseLoading}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              purchaseLoading 
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
{purchaseLoading ? '付款處理中...' : '確認付款'}
          </button>
          <button
            onClick={() => setShowPaymentModal(false)}
            disabled={purchaseLoading}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
          >
            取消
          </button>
        </div>
      </motion.div>
    </motion.div>
  );


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            選擇會員方案
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            加入 TLI Connect 會員，享受完整學習體驗，包含影片學習、線上課程、活動參與等豐富內容
          </p>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">載入會員方案中...</p>
          </div>
        ) : (
          /* Member Card Plans */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-8 mb-12"
          >
            {memberCardPlans.map((plan, index) => {
              const isSelected = selectedPlan === plan.id;
              const isYearPlan = plan.type === 'YEAR';
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 ${
                    isSelected
                      ? 'border-blue-500 shadow-2xl scale-105'
                      : isYearPlan
                      ? 'border-blue-200 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
                  }`}
                >
                  {isYearPlan && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center">
                        <SafeIcon icon={FiStar} className="mr-1" />
                        最划算
                      </div>
                    </div>
                  )}
                  
                  <div className="p-8">
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center mb-3">
                        <h3 className="text-2xl font-bold text-gray-900 mr-3">{plan.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          plan.type === 'YEAR'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {plan.type === 'YEAR' ? '年方案' : '季方案'}
                        </span>
                      </div>
                      <div className="mb-4">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-4xl font-bold text-blue-600">{formatPrice(typeof plan.price === 'string' ? parseFloat(plan.price) : plan.price)}</span>
                        </div>
                        <p className="text-gray-600 mt-2">
                          有效期限：{plan.duration_days} 天
                        </p>
                        <p className="text-gray-500 text-sm">
                          平均每月 {formatPrice(Math.round((typeof plan.price === 'string' ? parseFloat(plan.price) : plan.price) / ((plan.duration_days || 90) / 30)))}
                        </p>
                      </div>
                    </div>
                    
                    <ul className="space-y-3 mb-8">
                      {[
                        '觀看所有學習影片',
                        '參加線上團體課程',
                        '免費預約課程',
                        '參加活動及研討會',
                        '專屬學習資源',
                        '學習進度追蹤',
                        ...(isYearPlan ? ['優先客服支援', '限定會員活動'] : [])
                      ].map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <SafeIcon icon={FiCheck} className="text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-3 px-6 rounded-xl font-bold transition-all duration-300 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      {isSelected ? '已選擇' : '選擇方案'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Purchase Button */}
        {!loading && selectedPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <button
              onClick={handlePurchase}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-300 flex items-center mx-auto"
            >
              <SafeIcon icon={FiCreditCard} className="mr-2" />
              立即購買
            </button>
            <p className="text-gray-600 text-sm mt-4">
              🔒 安全付款 • 💯 滿意保證 • 📞 24/7 客服支援
            </p>
          </motion.div>
        )}

        {/* Benefits Section */}
        <div className="mt-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">會員專屬權益</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FiVideo, title: '學習影片', desc: '無限觀看所有課程影片' },
              { icon: FiUsers, title: '線上課程', desc: '參加即時線上團體課程' },
              { icon: FiCalendar, title: '免費預約', desc: '免費預約所有課程活動' },
              { icon: FiAward, title: '專屬活動', desc: '參加會員限定活動' }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -4 }}
                className="text-center bg-white rounded-xl p-6 shadow-md"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <SafeIcon icon={benefit.icon} className="text-blue-600 text-xl" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
        </div>

        {/* Modals */}
        {showPaymentModal && <PaymentModal />}
      </div>
    </div>
  );
}

export default function MembershipPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">載入中...</p>
      </div>
    </div>}>
      <MembershipPageContent />
    </Suspense>
  );
}