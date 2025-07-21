'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { paymentService } from '@/services/paymentService';
import { PaymentRequest } from '@/types';
import { MembershipPlan, getPublishedMembershipPlans } from '@/data/membershipPlans';
import GuestPurchaseModal, { UserData } from '@/components/GuestPurchaseModal';
import { CreditCardData } from '@/components/CreditCardForm';
import CorporateInquiryForm from '@/components/CorporateInquiryForm';

const {
  FiCreditCard, FiCheck, FiUsers, FiStar, FiCalendar, FiVideo, FiAward
} = FiIcons;

function MembershipPageContent() {
  const { user, login } = useAuth();
  const router = useRouter();
  useSearchParams();
  const [activeTab, setActiveTab] = useState<'individual' | 'corporate'>('individual');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCorporateForm, setShowCorporateForm] = useState(false);
  const [paymentData, setPaymentData] = useState<{ title: string; price: number; duration_days: number; planId: string } | null>(null);
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  // 載入已發布的會員方案
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        const plans = getPublishedMembershipPlans(activeTab);
        setMembershipPlans(plans);
      } catch (error) {
        console.error('載入會員方案失敗:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, [activeTab]);

  const formatPrice = (price: number) => {
    return `NT$ ${price.toLocaleString()}`;
  };

  const handlePurchase = (plan: MembershipPlan) => {
    if (plan.type === 'corporate') {
      setShowCorporateForm(true);
    } else {
      setPaymentData({
        title: plan.name,
        price: plan.price,
        duration_days: plan.duration * 30, // 轉換月數為天數
        planId: plan.id
      });
      setShowPaymentModal(true);
    }
  };

  // 處理訪客購買（包含自動註冊）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleGuestPurchase = async (userData: UserData, _cardData: CreditCardData) => {
    if (!paymentData) return;

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
        // 步驟 4: 付款成功後自動註冊用戶
        console.log('付款成功，正在創建帳號...');
        
        const { authService } = await import('@/services/dataService');
        const registerResult = await authService.register(
          userData.email,
          userData.password,
          userData.name,
          userData.phone
        );
        
        if (registerResult.success) {
          // 步驟 5: 註冊成功後自動登入
          console.log('帳號創建成功，正在登入...');
          
          const loginResult = await login(userData.email, userData.password);
          
          if (loginResult.success) {
            alert(`🎉 購買成功！\n\n✅ 付款完成\n✅ 帳號已創建\n✅ 自動登入成功\n\n方案：${paymentData.title}\n金額：${formatPrice(paymentData.price)}\n付款 ID：${paymentResult.data.payment_id}\n\n會員資格已啟用，歡迎使用 TLI Connect！`);
            setShowPaymentModal(false);
            router.push('/dashboard');
          } else {
            alert(`✅ 付款和註冊成功！\n\n方案：${paymentData.title}\n帳號：${userData.email}\n\n請使用您設定的密碼登入系統。`);
            setShowPaymentModal(false);
            router.push('/login');
          }
        } else {
          // 註冊失敗（可能 Email 已存在）
          if (registerResult.error === 'EMAIL_ALREADY_EXISTS') {
            alert(`⚠️ 付款成功但此 Email 已有帳號\n\n付款 ID：${paymentResult.data.payment_id}\n\n請使用現有帳號登入，或聯繫客服處理付款事宜。`);
            router.push('/login');
          } else {
            alert(`❌ 付款成功但帳號創建失敗\n\n付款 ID：${paymentResult.data.payment_id}\n\n請聯繫客服處理。`);
          }
          setShowPaymentModal(false);
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

  // 處理已登入用戶的購買（統一使用 GuestPurchaseModal 的流程）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUserPurchase = async (_userData: UserData, _cardData: CreditCardData) => {
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
        alert(`🎉 付款成功！\n\n✅ 付款完成\n✅ 會員資格已啟用\n\n方案：${paymentData.title}\n金額：${formatPrice(paymentData.price)}\n付款 ID：${paymentResult.data.payment_id}\n\n歡迎使用 TLI Connect 會員服務！`);
        setShowPaymentModal(false);
        router.push('/dashboard');
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            選擇會員方案
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            加入 TLI Connect 會員，享受完整學習體驗，包含影片學習、線上課程、活動參與等豐富內容
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-12"
        >
          <div className="bg-gray-100 rounded-xl p-1 inline-flex">
            <button
              onClick={() => setActiveTab('individual')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center ${
                activeTab === 'individual'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <SafeIcon icon={FiUsers} className="mr-2" />
              個人方案
            </button>
            <button
              onClick={() => setActiveTab('corporate')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center ${
                activeTab === 'corporate'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <SafeIcon icon={FiUsers} className="mr-2" />
              企業方案
            </button>
          </div>
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
            className={`gap-8 mb-12 ${
              activeTab === 'corporate' 
                ? 'flex justify-center' 
                : 'grid md:grid-cols-2'
            }`}
          >
            {membershipPlans.map((plan, index) => {
              const isYearPlan = plan.duration === 12;
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 ${
                    isYearPlan
                      ? 'border-blue-200 shadow-lg hover:border-blue-400 hover:shadow-2xl'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-2xl'
                  } ${activeTab === 'corporate' ? 'max-w-lg w-full' : ''}`}
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
                        <h3 className="text-2xl font-bold text-gray-900 mr-3">{plan.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          plan.duration === 12
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {plan.duration === 12 ? '年方案' : '季方案'}
                        </span>
                      </div>
                      <div className="mb-4">
                        {plan.type === 'corporate' ? (
                          <>
                            <div className="text-center">
                              <span className="text-3xl font-bold text-blue-600">客製化報價</span>
                            </div>
                            <p className="text-gray-600 mt-2 text-center">
                              根據您的企業需求量身定制
                            </p>
                            <p className="text-gray-500 text-sm text-center">
                              專業顧問將為您提供詳細方案
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-center space-x-2">
                              <span className="text-4xl font-bold text-blue-600">{formatPrice(plan.price)}</span>
                              {plan.originalPrice > plan.price && (
                                <span className="text-2xl text-gray-500 line-through">{formatPrice(plan.originalPrice)}</span>
                              )}
                            </div>
                            <p className="text-gray-600 mt-2">
                              有效期限：{plan.duration} 個月
                            </p>
                            <p className="text-gray-500 text-sm">
                              平均每月 {formatPrice(Math.round(plan.price / plan.duration))}
                            </p>
                            {plan.originalPrice > plan.price && (
                              <p className="text-green-600 text-sm font-medium mt-1">
                                省 {Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100)}%
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <SafeIcon icon={FiCheck} className="text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      onClick={() => handlePurchase(plan)}
                      className="w-full py-3 px-6 rounded-xl font-bold transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                      <SafeIcon icon={plan.type === 'corporate' ? FiUsers : FiCreditCard} className="mr-2" />
                      {plan.type === 'corporate' ? '立即諮詢' : '立即購買'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
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
        {showPaymentModal && (
          <GuestPurchaseModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            paymentData={paymentData}
            onConfirmPurchase={user ? handleUserPurchase : handleGuestPurchase}
            isLoading={purchaseLoading}
            existingUser={user ? {
              name: user.name,
              email: user.email,
              phone: user.phone
            } : null}
          />
        )}

        {showCorporateForm && (
          <CorporateInquiryForm
            isOpen={showCorporateForm}
            onClose={() => setShowCorporateForm(false)}
          />
        )}
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