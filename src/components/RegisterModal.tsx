'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';
import { useAuth } from '@/contexts/AuthContext';
import { MemberCardPlan } from '@/data/member_card_plans';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: MemberCardPlan;
  onRegisterSuccess: () => void;
}

interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, plan, onRegisterSuccess }) => {
  const { register } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = '姓名為必填欄位';
    }

    if (!formData.email.trim()) {
      newErrors.email = '電子郵件為必填欄位';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '請輸入有效的電子郵件格式';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '電話為必填欄位';
    }

    if (!formData.password) {
      newErrors.password = '密碼為必填欄位';
    } else if (formData.password.length < 6) {
      newErrors.password = '密碼長度至少需要6個字元';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '請確認密碼';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '密碼確認不一致';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsProcessing(true);
      
      const result = await register(formData.email, formData.password, formData.name, formData.phone);
      
      if (result.success) {
        alert('註冊成功！');
        onClose();
        // 註冊成功後直接進行購買流程
        onRegisterSuccess();
      } else {
        let errorMessage = '註冊失敗，請稍後再試';
        
        // 翻譯錯誤訊息
        switch (result.error) {
          case 'EMAIL_ALREADY_EXISTS':
            errorMessage = '此電子郵件已被使用，請使用其他郵件地址';
            break;
          case 'MISSING_REQUIRED_FIELDS':
            errorMessage = '請填寫所有必填欄位';
            break;
          case 'INVALID_EMAIL_FORMAT':
            errorMessage = '請輸入有效的電子郵件格式';
            break;
          case 'REGISTRATION_FAILED':
            errorMessage = '註冊失敗，請檢查輸入資料';
            break;
          case 'INTERNAL_SERVER_ERROR':
            errorMessage = '伺服器錯誤，請稍後再試';
            break;
          default:
            errorMessage = result.error || '註冊失敗，請稍後再試';
        }
        
        setErrors({ general: errorMessage });
      }
    } catch (error) {
      console.error('註冊失敗:', error);
      setErrors({ general: '註冊失敗，請稍後再試' });
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
            <h2 className="text-xl font-bold text-gray-900">帳號註冊</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <SafeIcon icon={FiX} />
            </button>
          </div>

          {/* Plan Info */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">購買方案：{plan.title}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>有效期限: {formatDuration(plan.duration_days)}</p>
              {!plan.hide_price && (
                <p className="text-lg font-bold text-blue-600">
                  NT$ {parseInt(plan.sale_price, 10).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {errors.general}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                姓名 *
              </label>
              <div className="relative">
                <SafeIcon icon={FiUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="請輸入您的姓名"
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電子郵件 *
              </label>
              <div className="relative">
                <SafeIcon icon={FiMail} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="請輸入您的電子郵件"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話 *
              </label>
              <div className="relative">
                <SafeIcon icon={FiPhone} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="請輸入您的電話"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                密碼 *
              </label>
              <div className="relative">
                <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="請輸入密碼（至少6個字元）"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={showPassword ? FiEyeOff : FiEye} size={16} />
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                確認密碼 *
              </label>
              <div className="relative">
                <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="請再次輸入密碼"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={showConfirmPassword ? FiEyeOff : FiEye} size={16} />
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <SafeIcon icon={FiUser} />
                  <span>註冊並繼續購買</span>
                </>
              )}
            </button>
          </form>

          {/* Login Option */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              已有帳號？{' '}
              <button
                onClick={() => {
                  // 這裡可以觸發登入modal或跳轉到登入頁面
                  alert('請使用現有帳號登入');
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                立即登入
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RegisterModal;