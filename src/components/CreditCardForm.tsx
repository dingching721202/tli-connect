'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';

const { FiCreditCard, FiCalendar, FiLock } = FiIcons;

interface CreditCardFormProps {
  onCardDataChange: (cardData: CreditCardData) => void;
}

export interface CreditCardData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({ onCardDataChange }) => {
  const [cardData, setCardData] = useState<CreditCardData>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: ''
  });

  const [errors, setErrors] = useState<Partial<CreditCardData>>({});

  // 格式化信用卡號碼 (每4位加空格)
  const formatCardNumber = (value: string) => {
    const cleanValue = value.replace(/\s/g, '').replace(/\D/g, '');
    const formattedValue = cleanValue.replace(/(.{4})/g, '$1 ').trim();
    return formattedValue.substring(0, 19); // 最多16位數字 + 3個空格
  };

  // 驗證信用卡號碼 (簡單的 Luhn 算法)
  const validateCardNumber = (cardNumber: string) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  // 獲取信用卡類型圖標
  const getCardTypeIcon = (cardNumber: string) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    if (cleanNumber.startsWith('4')) return '💳'; // Visa
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return '💳'; // Mastercard
    if (cleanNumber.startsWith('3')) return '💳'; // American Express
    
    return '💳';
  };

  const handleInputChange = (field: keyof CreditCardData, value: string) => {
    let formattedValue = value;
    let newErrors = { ...errors };

    switch (field) {
      case 'cardNumber':
        formattedValue = formatCardNumber(value);
        if (formattedValue && !validateCardNumber(formattedValue)) {
          newErrors.cardNumber = '請輸入有效的信用卡號碼';
        } else {
          delete newErrors.cardNumber;
        }
        break;
      
      case 'expiryMonth':
        formattedValue = value.replace(/\D/g, '').substring(0, 2);
        const month = parseInt(formattedValue);
        if (formattedValue && (month < 1 || month > 12)) {
          newErrors.expiryMonth = '請輸入有效月份 (01-12)';
        } else {
          delete newErrors.expiryMonth;
        }
        break;
      
      case 'expiryYear':
        formattedValue = value.replace(/\D/g, '').substring(0, 4);
        const year = parseInt(formattedValue);
        const currentYear = new Date().getFullYear();
        if (formattedValue && formattedValue.length === 4 && (year < currentYear || year > currentYear + 20)) {
          newErrors.expiryYear = '請輸入有效年份';
        } else {
          delete newErrors.expiryYear;
        }
        break;
      
      case 'cvv':
        formattedValue = value.replace(/\D/g, '').substring(0, 4);
        if (formattedValue && (formattedValue.length < 3 || formattedValue.length > 4)) {
          newErrors.cvv = '請輸入 3-4 位安全碼';
        } else {
          delete newErrors.cvv;
        }
        break;
      
      case 'cardholderName':
        if (formattedValue && formattedValue.length < 2) {
          newErrors.cardholderName = '請輸入持卡人姓名';
        } else {
          delete newErrors.cardholderName;
        }
        break;
    }

    const updatedCardData = { ...cardData, [field]: formattedValue };
    setCardData(updatedCardData);
    setErrors(newErrors);
    onCardDataChange(updatedCardData);
  };

  const isFormValid = () => {
    return Object.keys(errors).length === 0 && 
           cardData.cardNumber && 
           cardData.expiryMonth && 
           cardData.expiryYear && 
           cardData.cvv && 
           cardData.cardholderName;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <SafeIcon icon={FiCreditCard} className="text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">信用卡資訊</h3>
        <div className="ml-auto flex items-center text-sm text-gray-500">
          <SafeIcon icon={FiLock} className="mr-1" />
          安全加密
        </div>
      </div>

      {/* 持卡人姓名 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          持卡人姓名 *
        </label>
        <input
          type="text"
          value={cardData.cardholderName}
          onChange={(e) => handleInputChange('cardholderName', e.target.value)}
          placeholder="如卡片上所示"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.cardholderName ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.cardholderName && (
          <p className="text-red-500 text-xs mt-1">{errors.cardholderName}</p>
        )}
      </div>

      {/* 信用卡號碼 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          信用卡號碼 *
        </label>
        <div className="relative">
          <input
            type="text"
            value={cardData.cardNumber}
            onChange={(e) => handleInputChange('cardNumber', e.target.value)}
            placeholder="1234 5678 9012 3456"
            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.cardNumber ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <span className="text-lg">{getCardTypeIcon(cardData.cardNumber)}</span>
          </div>
        </div>
        {errors.cardNumber && (
          <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
        )}
      </div>

      {/* 到期日期和安全碼 */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            月份 *
          </label>
          <div className="relative">
            <input
              type="text"
              value={cardData.expiryMonth}
              onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
              placeholder="MM"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.expiryMonth ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.expiryMonth && (
            <p className="text-red-500 text-xs mt-1">{errors.expiryMonth}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            年份 *
          </label>
          <input
            type="text"
            value={cardData.expiryYear}
            onChange={(e) => handleInputChange('expiryYear', e.target.value)}
            placeholder="YYYY"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.expiryYear ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.expiryYear && (
            <p className="text-red-500 text-xs mt-1">{errors.expiryYear}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            安全碼 *
          </label>
          <input
            type="text"
            value={cardData.cvv}
            onChange={(e) => handleInputChange('cvv', e.target.value)}
            placeholder="123"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.cvv ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.cvv && (
            <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>
          )}
        </div>
      </div>

      {/* 安全提示 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
        <div className="flex items-start">
          <SafeIcon icon={FiLock} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">安全保障</p>
            <p>您的信用卡資訊將採用 SSL 加密技術保護，我們不會儲存您的完整卡號或安全碼。</p>
          </div>
        </div>
      </div>

      {/* 表單驗證狀態 */}
      {isFormValid() && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center text-green-600 text-sm"
        >
          <SafeIcon icon={FiCalendar} className="mr-2" />
          信用卡資訊已完成
        </motion.div>
      )}
    </div>
  );
};

export default CreditCardForm;