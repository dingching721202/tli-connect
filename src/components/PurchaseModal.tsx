'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCreditCard, FiUser, FiMail, FiPhone, FiBriefcase, FiGlobe, FiMessageSquare } from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';
import { MemberCardPlan } from '@/data/member_card_plans';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: MemberCardPlan;
  mode?: 'purchase' | 'contact';
}

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company_name: string;
  industry: string;
  learning_subjects: string[];
  requirements: string;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ isOpen, onClose, plan, mode = 'purchase' }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showContactForm, setShowContactForm] = useState(
    mode === 'contact' || plan.hide_price || (plan.cta_options?.show_contact && !plan.cta_options?.show_payment)
  );
  const [contactData, setContactData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    industry: '',
    learning_subjects: [],
    requirements: ''
  });

  const industries = [
    '科技業',
    '金融業',
    '製造業',
    '教育業',
    '醫療業',
    '零售業',
    '服務業',
    '其他'
  ];

  const learningSubjects = [
    '中文',
    '英文', 
    '文化',
    '商業',
    '師培'
  ];

  const handleLearningSubjectChange = (subject: string, checked: boolean) => {
    if (checked) {
      setContactData({
        ...contactData,
        learning_subjects: [...contactData.learning_subjects, subject]
      });
    } else {
      setContactData({
        ...contactData,
        learning_subjects: contactData.learning_subjects.filter(s => s !== subject)
      });
    }
  };

  const handlePurchase = async () => {
    try {
      setIsProcessing(true);
      
      // 1. 創建訂單
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: plan.id,
          user_email: 'guest@example.com', // 臨時email，實際應用中可從用戶輸入獲取
          user_name: 'Guest User'
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('創建訂單失敗');
      }

      const orderData = await orderResponse.json();
      const orderId = orderData.data.id;

      // 2. 發起付款
      const paymentResponse = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          amount: parseInt(plan.sale_price, 10),
          description: `購買會員方案: ${plan.title}`,
          return_url: `${window.location.origin}/payment-result`,
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error('發起付款失敗');
      }

      const paymentData = await paymentResponse.json();
      
      // 3. 跳轉到付款頁面
      if (paymentData.data.payment_url) {
        window.location.href = paymentData.data.payment_url;
      }

    } catch (error) {
      console.error('購買失敗:', error);
      alert('購買失敗，請稍後再試');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContactSubmit = async () => {
    try {
      setIsProcessing(true);
      
      // 提交聯繫表單
      const response = await fetch('/api/contact-inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...contactData,
          plan_id: plan.id,
          plan_title: plan.title,
        }),
      });

      if (response.ok) {
        alert('您的詢問已送出，我們會盡快與您聯繫！');
        onClose();
      } else {
        throw new Error('提交失敗');
      }
    } catch (error) {
      console.error('提交聯繫表單失敗:', error);
      alert('提交失敗，請稍後再試');
    } finally {
      setIsProcessing(false);
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {mode === 'contact' || plan.hide_price ? '聯繫我們' : '購買會員方案'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <SafeIcon icon={FiX} />
            </button>
          </div>

          {/* Plan Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{plan.title}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>類型: {plan.duration_type === 'season' ? '季方案' : '年方案'}</p>
              <p>有效期限: {formatDuration(plan.duration_days)}</p>
              {!plan.hide_price && (
                <p className="text-lg font-bold text-blue-600">
                  NT$ {parseInt(plan.sale_price, 10).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Contact Form or Purchase Button */}
          {plan.hide_price || showContactForm ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">請留下您的聯繫資訊</h3>
              
              {/* Basic Info */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    姓名 *
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={contactData.name}
                      onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="請輸入您的姓名"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    電子郵件 *
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiMail} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="email"
                      value={contactData.email}
                      onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="請輸入您的電子郵件"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    電話 *
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiPhone} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="tel"
                      value={contactData.phone}
                      onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="請輸入您的電話"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    企業名稱
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiBriefcase} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={contactData.company_name}
                      onChange={(e) => setContactData({ ...contactData, company_name: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="請輸入企業名稱"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Info */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    產業別
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiBriefcase} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <select
                      value={contactData.industry}
                      onChange={(e) => setContactData({ ...contactData, industry: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">請選擇產業別</option>
                      {industries.map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    想學習的項目 (可複選)
                  </label>
                  <div className="space-y-2">
                    {learningSubjects.map((subject) => (
                      <label key={subject} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={contactData.learning_subjects.includes(subject)}
                          onChange={(e) => handleLearningSubjectChange(subject, e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-700">{subject}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    需求說明
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiMessageSquare} className="absolute left-3 top-3 text-gray-400" size={16} />
                    <textarea
                      value={contactData.requirements}
                      onChange={(e) => setContactData({ ...contactData, requirements: e.target.value })}
                      rows={3}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="請描述您的學習需求或其他要求"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleContactSubmit}
                disabled={isProcessing || !contactData.name || !contactData.email || !contactData.phone}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <SafeIcon icon={FiMail} />
                    <span>送出詢問</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Purchase Button */}
              <button
                onClick={handlePurchase}
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <SafeIcon icon={FiCreditCard} />
                    <span>立即付款</span>
                  </>
                )}
              </button>

              {/* Contact Option */}
              {plan.cta_options?.show_contact && plan.cta_options?.show_payment && (
                <button
                  onClick={() => setShowContactForm(true)}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <SafeIcon icon={FiUser} />
                  <span>或 聯繫我們</span>
                </button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PurchaseModal;