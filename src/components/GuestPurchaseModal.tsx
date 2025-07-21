'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';
import CreditCardForm, { CreditCardData } from './CreditCardForm';

const { 
  FiX, FiUser, FiLock, FiCreditCard, 
  FiCheck, FiChevronLeft, FiChevronRight, FiEye, FiEyeOff 
} = FiIcons;

interface GuestPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: {
    title: string;
    price: number;
    duration_days: number;
    planId: string;
  } | null;
  onConfirmPurchase: (userData: UserData, cardData: CreditCardData) => void;
  isLoading: boolean;
  existingUser?: {
    name: string;
    email: string;
    phone: string;
  } | null;
}

export interface UserData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

const GuestPurchaseModal: React.FC<GuestPurchaseModalProps> = ({
  isOpen,
  onClose,
  paymentData,
  onConfirmPurchase,
  isLoading,
  existingUser
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const [cardData, setCardData] = useState<CreditCardData>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: ''
  });

  const [errors, setErrors] = useState<{
    [key in keyof UserData]?: string;
  }>({});

  // 重置表單當模態框關閉時或預填用戶資訊
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setUserData({ name: '', email: '', phone: '', password: '' });
      setCardData({ cardNumber: '', expiryMonth: '', expiryYear: '', cvv: '', cardholderName: '' });
      setErrors({});
    } else if (existingUser) {
      // 如果是已登入用戶，預填資訊並跳過第一步
      setUserData({
        name: existingUser.name,
        email: existingUser.email,
        phone: existingUser.phone,
        password: '' // 已登入用戶不需要密碼
      });
      setCurrentStep(2); // 直接跳到信用卡步驟
    }
  }, [isOpen, existingUser]);

  const formatPrice = (price: number) => {
    return `NT$ ${price.toLocaleString()}`;
  };

  // 驗證個人資訊
  const validateUserData = () => {
    const newErrors: { [key in keyof UserData]?: string } = {};

    if (!userData.name.trim()) {
      newErrors.name = '請輸入姓名';
    } else if (userData.name.length < 2) {
      newErrors.name = '姓名至少需要 2 個字元';
    }

    if (!userData.email.trim()) {
      newErrors.email = '請輸入 Email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      newErrors.email = '請輸入有效的 Email 格式';
    }

    if (!userData.phone.trim()) {
      newErrors.phone = '請輸入手機號碼';
    } else if (userData.phone.replace(/[- +()]/g, '').length < 8) {
      newErrors.phone = '請輸入有效的手機號碼';
    }

    if (!userData.password) {
      newErrors.password = '請輸入密碼';
    } else if (userData.password.length < 6) {
      newErrors.password = '密碼至少需要 6 個字元';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 驗證信用卡資料是否完整
  const isCardDataValid = () => {
    return cardData.cardNumber && 
           cardData.expiryMonth && 
           cardData.expiryYear && 
           cardData.cvv && 
           cardData.cardholderName;
  };

  const handleUserDataChange = (field: keyof UserData, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    
    // 清除該欄位的錯誤
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (existingUser || validateUserData()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (isCardDataValid()) {
        setCurrentStep(3);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      // 已登入用戶不能回到第一步（個人資訊步驟）
      if (existingUser && currentStep === 2) {
        return;
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirm = () => {
    if ((existingUser || validateUserData()) && isCardDataValid()) {
      onConfirmPurchase(userData, cardData);
    }
  };

  if (!isOpen || !paymentData) return null;

  const steps = existingUser ? [
    { number: 2, title: '付款資訊', icon: FiCreditCard },
    { number: 3, title: '確認訂單', icon: FiCheck }
  ] : [
    { number: 1, title: '個人資訊', icon: FiUser },
    { number: 2, title: '付款資訊', icon: FiCreditCard },
    { number: 3, title: '確認訂單', icon: FiCheck }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={() => !isLoading && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {existingUser ? '會員方案購買' : '會員方案購買'}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <SafeIcon icon={FiX} className="text-gray-500" />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                  currentStep >= step.number
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step.number ? (
                    <SafeIcon icon={FiCheck} />
                  ) : (
                    <SafeIcon icon={step.icon} />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-px mx-4 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Step 1: 個人資訊 */}
          {currentStep === 1 && !existingUser && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center mb-4">
                <SafeIcon icon={FiUser} className="text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">個人資訊</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    姓名 *
                  </label>
                  <input
                    type="text"
                    value={userData.name}
                    onChange={(e) => handleUserDataChange('name', e.target.value)}
                    placeholder="請輸入您的姓名"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    手機號碼 *
                  </label>
                  <input
                    type="tel"
                    value={userData.phone}
                    onChange={(e) => handleUserDataChange('phone', e.target.value)}
                    placeholder="+886 912 345 678"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => handleUserDataChange('email', e.target.value)}
                  placeholder="your@email.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  設定密碼 *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={userData.password}
                    onChange={(e) => handleUserDataChange('password', e.target.value)}
                    placeholder="至少 6 個字元"
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <SafeIcon icon={showPassword ? FiEyeOff : FiEye} />
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <div className="flex items-start">
                  <SafeIcon icon={FiLock} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">購買完成後將自動建立帳號</p>
                    <p>您可以使用此 Email 和密碼登入系統享受會員服務。</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: 付款資訊 */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <CreditCardForm onCardDataChange={setCardData} />
            </motion.div>
          )}

          {/* Step 3: 確認訂單 */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center mb-4">
                <SafeIcon icon={FiCheck} className="text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">訂單確認</h3>
              </div>

              {/* 會員方案詳情 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3">會員方案</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">方案：</span>
                    <span className="font-medium">{paymentData.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">有效期限：</span>
                    <span className="font-medium">{Math.round(paymentData.duration_days / 30)} 個月</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">付款金額：</span>
                      <span className="font-bold text-lg text-blue-600">{formatPrice(paymentData.price)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 個人資訊確認 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3">
                  {existingUser ? '會員資訊' : '個人資訊'}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">姓名：</span>
                    <span className="font-medium">{userData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email：</span>
                    <span className="font-medium">{userData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">手機：</span>
                    <span className="font-medium">{userData.phone}</span>
                  </div>
                  {existingUser && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center text-green-600">
                        <SafeIcon icon={FiCheck} className="mr-2" />
                        <span className="text-xs">已登入會員，資訊已確認</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 付款方式確認 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3">付款方式</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">持卡人：</span>
                    <span className="font-medium">{cardData.cardholderName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">卡號：</span>
                    <span className="font-medium">**** **** **** {cardData.cardNumber.slice(-4)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start">
                  <SafeIcon icon={FiCheck} className="text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">付款完成後</p>
                    <p>
                      {existingUser 
                        ? '系統將自動啟用您的會員資格，您可以立即開始使用所有會員服務。'
                        : '系統將自動為您建立帳號並啟用會員資格，您可以立即開始使用所有會員服務。'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex space-x-3">
            {currentStep > (existingUser ? 2 : 1) && (
              <button
                onClick={handlePrevStep}
                disabled={isLoading}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                <SafeIcon icon={FiChevronLeft} className="mr-1" />
                上一步
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            {currentStep < 3 ? (
              <button
                onClick={handleNextStep}
                disabled={isLoading}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                下一步
                <SafeIcon icon={FiChevronRight} className="ml-1" />
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isLoading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLoading ? '處理中...' : '確認付款'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GuestPurchaseModal;