'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';
import { ConsultationType } from '@/types/consultation';

const {
  FiX, FiUser, FiBriefcase, FiUsers,
  FiCheck, FiSend
} = FiIcons;

interface CorporateInquiryFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  contactName: string;
  email: string;
  phone: string;
  companyName: string;
  contactTitle: string;
  trainingNeeds: string[];
  trainingSize: string;
  message: string;
}

const CorporateInquiryForm: React.FC<CorporateInquiryFormProps> = ({
  isOpen,
  onClose
}) => {
  const [formData, setFormData] = useState<FormData>({
    contactName: '',
    email: '',
    phone: '',
    companyName: '',
    contactTitle: '',
    trainingNeeds: [],
    trainingSize: '',
    message: ''
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 主要培訓需求選項
  const trainingOptions = [
    '中文',
    '英文',
    '文化',
    '商業',
    '師培'
  ];

  // 預計培訓人數選項
  const trainingSizeOptions = [
    '<50',
    '50–100',
    '100–300',
    '300–500',
    '500+'
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除該欄位的錯誤
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTrainingNeedsChange = (option: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      trainingNeeds: checked
        ? [...prev.trainingNeeds, option]
        : prev.trainingNeeds.filter(need => need !== option)
    }));
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};

    if (!formData.contactName.trim()) {
      newErrors.contactName = '請輸入姓名';
    }

    if (!formData.email.trim()) {
      newErrors.email = '請輸入電子郵件';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '請輸入有效的電子郵件格式';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = '請輸入企業名稱';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      
      // 創建企業諮詢表單
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: ConsultationType.CORPORATE,
          contactName: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          companyName: formData.companyName,
          contactTitle: formData.contactTitle,
          trainingNeeds: formData.trainingNeeds,
          trainingSize: formData.trainingSize,
          message: formData.message,
          source: 'corporate_form'
        }),
      });

      if (!response.ok) {
        throw new Error('提交失敗');
      }
      
      setIsSubmitted(true);
      
      // 3秒後關閉模態框
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setFormData({
          contactName: '',
          email: '',
          phone: '',
          companyName: '',
          contactTitle: '',
          trainingNeeds: [],
          trainingSize: '',
          message: ''
        });
      }, 3000);
      
    } catch (error) {
      console.error('提交表單失敗:', error);
      alert('提交失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiCheck} className="text-green-600 text-2xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">提交成功！</h3>
          <p className="text-gray-600 mb-4">
            感謝您的詢問，我們的專業顧問將於 48 小時內與您聯繫。
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              📧 確認信息已發送至您的 Email<br />
              📞 如有急件請直接致電客服專線
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={() => !isSubmitting && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <SafeIcon icon={FiBriefcase} className="text-blue-600 mr-3 text-xl" />
            <h2 className="text-2xl font-bold text-gray-900">企業培訓方案諮詢</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <SafeIcon icon={FiX} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* 基本資訊 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <SafeIcon icon={FiUser} className="mr-2 text-blue-600" />
                基本資訊
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    姓名 *
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.contactName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="請輸入您的姓名"
                  />
                  {errors.contactName && (
                    <p className="text-red-500 text-xs mt-1">{errors.contactName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電子郵件 *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your@company.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電話
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+886 2 1234 5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    職稱
                  </label>
                  <input
                    type="text"
                    value={formData.contactTitle}
                    onChange={(e) => handleInputChange('contactTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="如：人資主管、訓練經理"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  企業名稱 *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.companyName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="請輸入企業名稱"
                />
                {errors.companyName && (
                  <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
                )}
              </div>
            </div>

            {/* 培訓需求 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <SafeIcon icon={FiUsers} className="mr-2 text-blue-600" />
                培訓需求
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  主要培訓需求（可多選）
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {trainingOptions.map(option => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.trainingNeeds.includes(option)}
                        onChange={(e) => handleTrainingNeedsChange(option, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  預計培訓人數
                </label>
                <select
                  value={formData.trainingSize}
                  onChange={(e) => handleInputChange('trainingSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">請選擇培訓人數</option>
                  {trainingSizeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  簡述您的需求
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="請簡述您的培訓需求或其他要求..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <h4 className="font-medium text-blue-900 mb-2">我們將為您提供：</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 專業顧問免費諮詢</li>
                  <li>• 客製化培訓方案</li>
                  <li>• 詳細報價與時程安排</li>
                  <li>• 48小時內回覆</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="mr-3 px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center ${
                isSubmitting
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  提交中...
                </>
              ) : (
                <>
                  <SafeIcon icon={FiSend} className="mr-2" />
                  提交諮詢
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CorporateInquiryForm;