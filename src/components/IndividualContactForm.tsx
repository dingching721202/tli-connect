'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';

const {
  FiX, FiUser, FiMail, FiPhone,
  FiCheck, FiSend
} = FiIcons;

interface IndividualContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string; // 允許指定來源
}

interface FormData {
  name: string;
  email: string;
  phone: string;
}

const IndividualContactForm: React.FC<IndividualContactFormProps> = ({
  isOpen,
  onClose,
  source = 'individual_form'
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: ''
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除該欄位的錯誤
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = '請輸入姓名';
    }

    if (!formData.email.trim()) {
      newErrors.email = '請輸入 Email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '請輸入有效的 Email 格式';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      
      // 創建個人諮詢表單
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'individual',
          contactName: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: '來自個人方案諮詢表單',
          source: source
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        
        // 3秒後關閉模態框
        setTimeout(() => {
          onClose();
          setIsSubmitted(false);
          setFormData({
            name: '',
            email: '',
            phone: ''
          });
        }, 3000);
      } else {
        throw new Error('提交失敗');
      }
      
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
        className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <SafeIcon icon={FiUser} className="text-blue-600 mr-3 text-xl" />
            <h2 className="text-2xl font-bold text-gray-900">個人方案諮詢</h2>
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <SafeIcon icon={FiUser} className="mr-2 text-blue-600" />
              聯絡資訊
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                姓名 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="請輸入您的姓名"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
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
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                電話
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+886 912 345 678"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h4 className="font-medium text-blue-900 mb-2">我們將為您提供：</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 專業顧問免費諮詢</li>
                <li>• 個人化學習方案建議</li>
                <li>• 詳細方案說明</li>
                <li>• 48小時內回覆</li>
              </ul>
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
              disabled={isSubmitting || !formData.name.trim() || !formData.email.trim()}
              className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center ${
                isSubmitting || !formData.name.trim() || !formData.email.trim()
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

export default IndividualContactForm;