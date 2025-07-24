'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';
import { createCorporateInquiry, CorporateInquiry } from '@/data/corporateInquiry';

const {
  FiX, FiUser, FiBriefcase, FiUsers,
  FiCheck, FiSend
} = FiIcons;

interface CorporateInquiryFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  companyName: string;
  contactName: string;
  contactTitle: string;
  email: string;
  phone: string;
  employeeCount: string;
  industry: string;
  enterpriseName: string;
  trainingNeeds: string[];
  budget: string;
  timeline: string;
  message: string;
}

const CorporateInquiryForm: React.FC<CorporateInquiryFormProps> = ({
  isOpen,
  onClose
}) => {
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    contactName: '',
    contactTitle: '',
    email: '',
    phone: '',
    employeeCount: '',
    industry: '',
    enterpriseName: '',
    trainingNeeds: [],
    budget: '',
    timeline: '',
    message: ''
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 訓練需求選項
  const trainingOptions = [
    '英語會話訓練',
    '商務英語培訓',
    '技術培訓課程',
    '領導力發展',
    '團隊建設',
    '專業技能認證',
    '客製化課程',
    '線上學習平台'
  ];

  // 員工規模選項
  const employeeCountOptions = [
    '1-10人',
    '11-50人',
    '51-100人',
    '101-500人',
    '500-1000人',
    '1000人以上'
  ];

  // 預算範圍選項
  const budgetOptions = [
    '50萬以下',
    '50-100萬',
    '100-300萬',
    '300-500萬',
    '500萬以上',
    '需要討論'
  ];

  // 時間期限選項
  const timelineOptions = [
    '立即開始',
    '1個月內',
    '2-3個月內',
    '半年內',
    '年內',
    '需要討論'
  ];

  // 行業選項
  const industryOptions = [
    '科技業',
    '製造業',
    '金融服務',
    '醫療保健',
    '教育',
    '零售業',
    '建築工程',
    '政府機關',
    '其他'
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

    if (!formData.companyName.trim()) {
      newErrors.companyName = '請輸入公司名稱';
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = '請輸入聯絡人姓名';
    }

    if (!formData.email.trim()) {
      newErrors.email = '請輸入 Email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '請輸入有效的 Email 格式';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '請輸入聯絡電話';
    }

    if (!formData.employeeCount) {
      newErrors.employeeCount = '請選擇員工規模';
    }

    if (!formData.industry) {
      newErrors.industry = '請選擇行業別';
    }

    if (formData.trainingNeeds.length === 0) {
      newErrors.trainingNeeds = ['請至少選擇一項培訓需求'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      
      // 創建企業詢價表單
      const inquiryData: Omit<CorporateInquiry, 'id' | 'submittedAt' | 'updatedAt'> = {
        ...formData,
        status: 'pending'
      };

      await createCorporateInquiry(inquiryData);
      
      setIsSubmitted(true);
      
      // 3秒後關閉模態框
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setFormData({
          companyName: '',
          contactName: '',
          contactTitle: '',
          email: '',
          phone: '',
          employeeCount: '',
          industry: '',
          enterpriseName: '',
          trainingNeeds: [],
          budget: '',
          timeline: '',
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
            感謝您的詢問，我們的專業顧問將於 24 小時內與您聯繫。
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左側：公司資訊 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <SafeIcon icon={FiBriefcase} className="mr-2 text-blue-600" />
                公司資訊
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  公司名稱 *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.companyName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="請輸入公司完整名稱"
                />
                {errors.companyName && (
                  <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    員工規模 *
                  </label>
                  <select
                    value={formData.employeeCount}
                    onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.employeeCount ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">請選擇</option>
                    {employeeCountOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {errors.employeeCount && (
                    <p className="text-red-500 text-xs mt-1">{errors.employeeCount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    企業名稱
                  </label>
                  <input
                    type="text"
                    value={formData.enterpriseName}
                    onChange={(e) => handleInputChange('enterpriseName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="請輸入企業名稱"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  行業別 *
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.industry ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">請選擇</option>
                  {industryOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.industry && (
                  <p className="text-red-500 text-xs mt-1">{errors.industry}</p>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-8 flex items-center">
                <SafeIcon icon={FiUser} className="mr-2 text-blue-600" />
                聯絡人資訊
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    聯絡人姓名 *
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.contactName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="請輸入聯絡人姓名"
                  />
                  {errors.contactName && (
                    <p className="text-red-500 text-xs mt-1">{errors.contactName}</p>
                  )}
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
                  Email *
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  聯絡電話 *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+886 2 1234 5678"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* 右側：需求資訊 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <SafeIcon icon={FiUsers} className="mr-2 text-blue-600" />
                培訓需求
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  培訓項目 * (可多選)
                </label>
                <div className="grid grid-cols-1 gap-2">
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
                {errors.trainingNeeds && (
                  <p className="text-red-500 text-xs mt-1">{errors.trainingNeeds[0]}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    預算範圍
                  </label>
                  <select
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">請選擇</option>
                    {budgetOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    預計開始時間
                  </label>
                  <select
                    value={formData.timeline}
                    onChange={(e) => handleInputChange('timeline', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">請選擇</option>
                    {timelineOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  其他需求說明
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="請詳細描述您的培訓需求、特殊要求或其他相關資訊..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <h4 className="font-medium text-blue-900 mb-2">我們將為您提供：</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 專業顧問免費諮詢</li>
                  <li>• 客製化培訓方案</li>
                  <li>• 詳細報價與時程安排</li>
                  <li>• 24小時內回覆</li>
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