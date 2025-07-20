'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { getPublishedMembershipPlans, MembershipPlan } from '@/data/membershipPlans';
import { getReferralCodeByCode, recordReferralPurchase } from '@/data/referralData';

const {
  FiCreditCard, FiCheck, FiUsers, FiBuilding, FiStar, FiCalendar, FiVideo, FiUserCheck, FiAward,
  FiTrendingUp, FiX, FiMail, FiPhone
} = FiIcons;

export default function MembershipPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [planType, setPlanType] = useState<'individual' | 'corporate'>('individual');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [individualPlans, setIndividualPlans] = useState<MembershipPlan[]>([]);
  const [corporatePlans, setCorporatePlans] = useState<MembershipPlan[]>([]);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrerInfo, setReferrerInfo] = useState<{name: string, code: string} | null>(null);
  const [contactForm, setContactForm] = useState({
    companyName: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    employeeCount: '',
    message: ''
  });

  // 載入已發布的會員方案和處理推薦代碼
  useEffect(() => {
    const loadPlans = () => {
      const individualPlansData = getPublishedMembershipPlans('individual');
      const corporatePlansData = getPublishedMembershipPlans('corporate');
      setIndividualPlans(individualPlansData);
      setCorporatePlans(corporatePlansData);
    };
    loadPlans();

    // 檢查URL中的推薦代碼
    const refParam = searchParams.get('ref');
    if (refParam) {
      setReferralCode(refParam);
      // 根據推薦代碼查找推薦人信息
      const referralData = getReferralCodeByCode(refParam);
      if (referralData) {
        setReferrerInfo({
          name: referralData.userName,
          code: referralData.code
        });
      }
    }
  }, [searchParams]);

  const formatPrice = (price: number) => {
    return `NT$ ${price.toLocaleString()}`;
  };

  const calculateSavings = (price: number, originalPrice: number) => {
    const savings = originalPrice - price;
    const percentage = Math.round((savings / originalPrice) * 100);
    return { savings, percentage };
  };

  const handleSelectPlan = (plan: MembershipPlan) => {
    setSelectedPlan(plan.id);
  };

  const handlePurchase = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    const currentPlans = planType === 'individual' ? individualPlans : corporatePlans;
    const plan = currentPlans.find(p => p.id === selectedPlan);
    if (!plan) return;

    setPaymentData({
      name: plan.name,
      price: plan.price,
      duration: plan.duration,
      referralCode: referralCode,
      referrerInfo: referrerInfo
    });
    setShowPaymentModal(true);
  };

  const handleContactSubmit = () => {
    if (!contactForm.companyName || !contactForm.contactPerson || !contactForm.contactEmail) {
      alert('請填寫必要資訊：公司名稱、聯絡人、聯絡信箱');
      return;
    }

    // 模擬發送聯絡表單
    alert(`✅ 感謝您的詢問！\n\n我們已收到您的企業方案諮詢：\n公司：${contactForm.companyName}\n聯絡人：${contactForm.contactPerson}\n\n我們的業務專員將在 24 小時內與您聯繫，為您提供專屬的企業學習解決方案。\n\n聯絡電話：02-1234-5678\n業務信箱：business@tliconnect.com`);
    setShowContactModal(false);
    setContactForm({
      companyName: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      employeeCount: '',
      message: ''
    });
  };

  const PaymentModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowPaymentModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4">確認購買</h3>
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span>方案：</span>
            <span className="font-medium">{paymentData?.name}</span>
          </div>
          <div className="flex justify-between">
            <span>金額：</span>
            <span className="font-medium text-blue-600">{formatPrice(paymentData?.price || 0)}</span>
          </div>
          {paymentData?.referrerInfo && (
            <div className="bg-blue-50 rounded-lg p-3 mt-3">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">推薦人：</span>
                <span className="font-medium text-blue-800">{paymentData.referrerInfo.name}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-blue-700">推薦代碼：</span>
                <span className="font-mono text-blue-800">{paymentData.referrerInfo.code}</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              // 處理推薦記錄
              let successMessage = `🎉 購買成功！\n\n方案：${paymentData?.name}\n金額：${formatPrice(paymentData?.price)}`;
              
              if (paymentData?.referrerInfo && paymentData?.referralCode && user) {
                successMessage += `\n\n✨ 感謝 ${paymentData.referrerInfo.name} 的推薦！`;
                try {
                  // 記錄推薦購買
                  const selectedPlanData = (planType === 'individual' ? individualPlans : corporatePlans)
                    .find(p => p.id === selectedPlan);
                  
                  if (selectedPlanData) {
                    recordReferralPurchase(
                      paymentData.referralCode,
                      user.email,
                      user.name,
                      selectedPlanData.id,
                      selectedPlanData.name,
                      paymentData.price
                    );
                    console.log('推薦購買記錄成功');
                  }
                } catch (error) {
                  console.error('記錄推薦購買失敗:', error);
                }
              }
              
              successMessage += '\n\n會員資格已啟用，歡迎開始學習之旅！';
              alert(successMessage);
              setShowPaymentModal(false);
              router.push('/dashboard');
            }}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            確認購買
          </button>
          <button
            onClick={() => setShowPaymentModal(false)}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            取消
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  const ContactModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowContactModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">企業方案諮詢</h3>
          <button
            onClick={() => setShowContactModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <SafeIcon icon={FiX} className="text-xl" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              公司名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={contactForm.companyName}
              onChange={(e) => setContactForm({...contactForm, companyName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="請輸入公司名稱"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              聯絡人 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={contactForm.contactPerson}
              onChange={(e) => setContactForm({...contactForm, contactPerson: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="請輸入聯絡人姓名"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              聯絡信箱 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={contactForm.contactEmail}
              onChange={(e) => setContactForm({...contactForm, contactEmail: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="請輸入聯絡信箱"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">聯絡電話</label>
            <input
              type="tel"
              value={contactForm.contactPhone}
              onChange={(e) => setContactForm({...contactForm, contactPhone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="請輸入聯絡電話"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">預估員工人數</label>
            <select
              value={contactForm.employeeCount}
              onChange={(e) => setContactForm({...contactForm, employeeCount: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">請選擇</option>
              <option value="5-10">5-10 人</option>
              <option value="11-20">11-20 人</option>
              <option value="21-50">21-50 人</option>
              <option value="51-100">51-100 人</option>
              <option value="100+">100 人以上</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">需求說明</label>
            <textarea
              value={contactForm.message}
              onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="請描述您的企業學習需求..."
            />
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleContactSubmit}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            送出諮詢
          </button>
          <button
            onClick={() => setShowContactModal(false)}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
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
          {referrerInfo && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto"
            >
              <div className="flex items-center justify-center text-blue-800">
                <SafeIcon icon={FiUsers} className="mr-2" />
                <span className="font-medium">
                  由 <span className="font-bold">{referrerInfo.name}</span> 推薦
                </span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                推薦代碼：{referrerInfo.code}
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Plan Type Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white rounded-xl p-2 shadow-lg border border-gray-200">
            <button
              onClick={() => setPlanType('individual')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                planType === 'individual'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <SafeIcon icon={FiUsers} className="inline mr-2" />
              個人方案
            </button>
            <button
              onClick={() => setPlanType('corporate')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                planType === 'corporate'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <SafeIcon icon={FiBuilding} className="inline mr-2" />
              企業方案
            </button>
          </div>
        </motion.div>

        {/* Individual Plans */}
        {planType === 'individual' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid md:grid-cols-2 gap-8 mb-12"
          >
            {individualPlans.map((plan, index) => {
              const isSelected = selectedPlan === plan.id;
              const { savings, percentage } = calculateSavings(plan.price, plan.originalPrice);
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 ${
                    isSelected
                      ? 'border-blue-500 shadow-2xl scale-105'
                      : plan.popular
                      ? 'border-blue-200 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center">
                        <SafeIcon icon={FiStar} className="mr-1" />
                        最受歡迎
                      </div>
                    </div>
                  )}
                  
                  <div className="p-8">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-4xl font-bold text-blue-600">{formatPrice(plan.price)}</span>
                        </div>
                        {savings > 0 && (
                          <div className="mt-2">
                            <span className="text-gray-500 line-through text-lg">{formatPrice(plan.originalPrice)}</span>
                            <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                              省 {percentage}%
                            </span>
                          </div>
                        )}
                        <p className="text-gray-600 mt-2">
                          平均每月 {formatPrice(Math.round(plan.price / plan.duration))}
                        </p>
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

        {/* Corporate Plan */}
        {planType === 'corporate' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-4xl mx-auto mb-12"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8 text-center">
                <SafeIcon icon={FiBuilding} className="text-4xl mx-auto mb-4" />
                <h3 className="text-3xl font-bold mb-2">企業會員方案</h3>
                <p className="text-purple-100">為您的企業提供完整的學習解決方案</p>
              </div>
              
              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">企業專屬權益</h4>
                    <ul className="space-y-3">
                      {[
                        '所有個人方案功能',
                        '批量帳號管理',
                        '企業學習報表',
                        '專屬客戶經理',
                        '客製化課程內容',
                        '企業內訓服務',
                        '優先技術支援',
                        '彈性付款方案'
                      ].map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <SafeIcon icon={FiCheck} className="text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">方案特色</h4>
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <SafeIcon icon={FiUsers} className="text-blue-600 mr-2" />
                          <span className="font-medium text-blue-900">彈性人數</span>
                        </div>
                        <p className="text-blue-700 text-sm">根據企業規模提供最適合的方案</p>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <SafeIcon icon={FiAward} className="text-green-600 mr-2" />
                          <span className="font-medium text-green-900">專業服務</span>
                        </div>
                        <p className="text-green-700 text-sm">專屬客戶經理提供一對一服務</p>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <SafeIcon icon={FiTrendingUp} className="text-purple-600 mr-2" />
                          <span className="font-medium text-purple-900">學習分析</span>
                        </div>
                        <p className="text-purple-700 text-sm">詳細的學習成效報表與分析</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-300 flex items-center mx-auto"
                  >
                    <SafeIcon icon={FiMail} className="mr-2" />
                    聯繫我們獲取報價
                  </button>
                  <p className="text-gray-600 text-sm mt-4">
                    我們將在 24 小時內與您聯繫，提供專屬企業方案
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Purchase Button for Individual Plans */}
        {planType === 'individual' && selectedPlan && (
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
        {showContactModal && <ContactModal />}
      </div>
    </div>
  );
}