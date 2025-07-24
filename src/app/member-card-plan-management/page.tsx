'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiSave, FiX, FiStar, FiUsers, FiCalendar, FiClock, FiUpload, FiDownload } from 'react-icons/fi';
import Navigation from '@/components/Navigation';
import SafeIcon from '@/components/common/SafeIcon';

interface MemberCardPlan {
  id: number;
  title: string;
  user_type: 'individual' | 'corporate';
  duration_type: 'season' | 'annual';
  duration_days: number;
  original_price: string;
  sale_price: string;
  features: string[];
  status: 'DRAFT' | 'PUBLISHED';
  popular?: boolean;
  description?: string;
  created_at: string;
  member_card_id: number;
  hide_price?: boolean;
  cta_options?: {
    show_payment: boolean;
    show_contact: boolean;
  };
}

interface FormData {
  title: string;
  user_type: 'individual' | 'corporate';
  duration_type: 'season' | 'annual';
  duration_days: number;
  original_price: string;
  sale_price: string;
  features: string[];
  status: 'DRAFT' | 'PUBLISHED';
  popular: boolean;
  description: string;
  hide_price: boolean;
  cta_options: {
    show_payment: boolean;
    show_contact: boolean;
  };
}

const MemberCardPlanManagement: React.FC = () => {
  const [plans, setPlans] = useState<MemberCardPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MemberCardPlan | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    user_type: 'individual',
    duration_type: 'season',
    duration_days: 90,
    original_price: '',
    sale_price: '',
    features: [''],
    status: 'DRAFT',
    popular: false,
    description: '',
    hide_price: false,
    cta_options: {
      show_payment: true,
      show_contact: false
    }
  });

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    if (formData.cta_options.show_payment) {
      setFormData(prev => ({ ...prev, hide_price: false }));
    }
  }, [formData.cta_options.show_payment]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/member-card-plans/admin');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.data || []);
      }
    } catch (error) {
      console.error('載入會員卡方案失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (plan?: MemberCardPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        title: plan.title,
        user_type: plan.user_type,
        duration_type: plan.duration_type,
        duration_days: plan.duration_days,
        original_price: plan.original_price,
        sale_price: plan.sale_price,
        features: plan.features,
        status: plan.status,
        popular: plan.popular || false,
        description: plan.description || '',
        hide_price: plan.hide_price || false,
        cta_options: plan.cta_options || {
          show_payment: true,
          show_contact: false
        }
      });
    } else {
      setEditingPlan(null);
      setFormData({
        title: '',
        user_type: 'individual',
        duration_type: 'season',
        duration_days: 90,
        original_price: '',
        sale_price: '',
        features: [''],
        status: 'DRAFT',
        popular: false,
        description: '',
        hide_price: false,
        cta_options: {
          show_payment: true,
          show_contact: false
        }
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPlan(null);
  };

  const handleSave = async () => {
    try {
      const planData = {
        ...formData,
        original_price: formData.original_price.toString(),
        sale_price: formData.sale_price.toString(),
        features: formData.features.filter(f => f.trim() !== ''),
        cta_options: formData.cta_options
      };

      let response;
      if (editingPlan) {
        response = await fetch(`/api/member-card-plans/admin/${editingPlan.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(planData)
        });
      } else {
        response = await fetch('/api/member-card-plans/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(planData)
        });
      }

      if (response.ok) {
        await loadPlans();
        handleCloseModal();
      }
    } catch (error) {
      console.error('儲存方案失敗:', error);
    }
  };

  const handleDelete = async (planId: number) => {
    if (!confirm('確定要刪除此會員卡方案嗎？')) return;

    try {
      const response = await fetch(`/api/member-card-plans/admin/${planId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadPlans();
      }
    } catch (error) {
      console.error('刪除方案失敗:', error);
    }
  };

  const toggleStatus = async (plan: MemberCardPlan) => {
    try {
      const newStatus = plan.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      
      // 如果要取消發布，顯示確認對話框
      if (plan.status === 'PUBLISHED') {
        const confirmed = confirm(
          `確定要取消發布「${plan.title}」嗎？\n\n取消發布後，此方案將變成草稿狀態，用戶將無法看到或購買此方案。`
        );
        if (!confirmed) return;
      }
      
      const response = await fetch(`/api/member-card-plans/admin/${plan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await loadPlans();
        // 顯示成功訊息
        const action = newStatus === 'PUBLISHED' ? '發布' : '取消發布';
        alert(`方案「${plan.title}」已成功${action}！`);
      } else {
        throw new Error('API 請求失敗');
      }
    } catch (error) {
      console.error('更新狀態失敗:', error);
      alert('操作失敗，請稍後再試。');
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const handleAddFeature = () => {
    setFormData({ 
      ...formData, 
      features: [...formData.features, ''] 
    });
  };

  const handleRemoveFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const getPlanTypeConfig = (userType: string, durationType: string) => {
    if (userType === 'individual' && durationType === 'season') {
      return {
        label: '個人季度',
        icon: FiUsers,
        color: 'bg-blue-100 text-blue-800',
        borderColor: 'border-blue-200',
        gradient: 'from-blue-50 to-blue-100'
      };
    }
    if (userType === 'individual' && durationType === 'annual') {
      return {
        label: '個人年度',
        icon: FiCalendar,
        color: 'bg-green-100 text-green-800',
        borderColor: 'border-green-200',
        gradient: 'from-green-50 to-green-100'
      };
    }
    if (userType === 'corporate' && durationType === 'season') {
      return {
        label: '企業季度',
        icon: FiClock,
        color: 'bg-purple-100 text-purple-800',
        borderColor: 'border-purple-200',
        gradient: 'from-purple-50 to-purple-100'
      };
    }
    if (userType === 'corporate' && durationType === 'annual') {
      return {
        label: '企業年度',
        icon: FiStar,
        color: 'bg-yellow-100 text-yellow-800',
        borderColor: 'border-yellow-200',
        gradient: 'from-yellow-50 to-yellow-100'
      };
    }
    return {
      label: '方案',
      icon: FiUsers,
      color: 'bg-gray-100 text-gray-800',
      borderColor: 'border-gray-200',
      gradient: 'from-gray-50 to-gray-100'
    };
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

  const calculateDiscount = (original: string, sale: string) => {
    const originalPrice = parseFloat(original);
    const salePrice = parseFloat(sale);
    if (originalPrice <= salePrice) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">載入中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">會員卡方案管理</h1>
            <p className="text-gray-600 mt-2">管理所有會員卡方案，包括個人和企業方案</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={FiPlus} />
            <span>新增方案</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <SafeIcon icon={FiUsers} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">總方案數</p>
                <p className="text-2xl font-bold text-gray-900">{plans.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <SafeIcon icon={FiEye} className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已發布</p>
                <p className="text-2xl font-bold text-gray-900">
                  {plans.filter(p => p.status === 'PUBLISHED').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <SafeIcon icon={FiEyeOff} className="text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">草稿</p>
                <p className="text-2xl font-bold text-gray-900">
                  {plans.filter(p => p.status === 'DRAFT').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <SafeIcon icon={FiStar} className="text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">熱門方案</p>
                <p className="text-2xl font-bold text-gray-900">
                  {plans.filter(p => p.popular).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const config = getPlanTypeConfig(plan.user_type, plan.duration_type);
            const Icon = config.icon;
            const discount = calculateDiscount(plan.original_price, plan.sale_price);

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative bg-gradient-to-br ${config.gradient} rounded-2xl border-2 ${config.borderColor} p-6 hover:shadow-xl transition-all duration-300`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    熱門
                  </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                    <Icon className="w-4 h-4" />
                    <span>{config.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleStatus(plan)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1 ${
                        plan.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'
                      }`}
                      title={plan.status === 'PUBLISHED' ? '點擊取消發布，變成草稿' : '點擊發布方案'}
                    >
                      <SafeIcon 
                        icon={plan.status === 'PUBLISHED' ? FiDownload : FiUpload} 
                        size={12}
                      />
                      <span>{plan.status === 'PUBLISHED' ? '取消發布' : '發布'}</span>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                <p className="text-gray-600 mb-4">有效期限：{formatDuration(plan.duration_days)}</p>
                
                {/* Pricing */}
                <div className="mb-6">
                  {plan.hide_price ? (
                    <div className="text-center py-6">
                      <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl py-8 px-6 border-2 border-dashed border-blue-200">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                            專案報價
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-blue-700 mb-2">
                          💼 客製化方案
                        </div>
                        <p className="text-blue-600 text-sm font-medium mb-3">
                          依您的需求量身打造
                        </p>
                        <div className="text-xs text-blue-500 bg-blue-50 rounded-lg py-2 px-3 inline-block">
                          點擊「聯繫我們」獲取專屬報價
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-gray-900">
                          NT$ {parseFloat(plan.sale_price).toLocaleString()}
                        </span>
                        {discount > 0 && (
                          <span className="text-lg text-gray-500 line-through">
                            NT$ {parseFloat(plan.original_price).toLocaleString()}
                          </span>
                        )}
                      </div>
                      {discount > 0 && (
                        <div className="text-sm text-red-600 font-medium">
                          省下 {discount}%
                        </div>
                      )}
                      <p className="text-gray-600 mt-1 text-sm">
                        平均每天 NT$ {Math.round(parseFloat(plan.sale_price) / plan.duration_days)}
                      </p>
                    </>
                  )}
                </div>

                {/* Features Preview */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">功能特色：</p>
                  <div className="space-y-1">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="truncate">{feature}</span>
                      </div>
                    ))}
                    {plan.features.length > 3 && (
                      <p className="text-xs text-gray-500 pl-3">
                        還有 {plan.features.length - 3} 項功能...
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-4 flex items-center flex-wrap gap-2">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    plan.status === 'PUBLISHED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {plan.status === 'PUBLISHED' ? '已發布' : '草稿'}
                  </span>
                  {plan.hide_price && (
                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      🔒 隱藏價格
                    </span>
                  )}
                  
                  {/* CTA Options Display */}
                  <div className="flex items-center space-x-1">
                    {plan.cta_options?.show_payment && (
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        💳 付款
                      </span>
                    )}
                    {plan.cta_options?.show_contact && (
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        📞 聯繫
                      </span>
                    )}
                  </div>
                </div>

                {/* CTA Actions Preview */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-600 mb-2">用戶可見的按鈕：</p>
                  <div className="flex space-x-2">
                    {plan.cta_options?.show_payment && (
                      <button
                        disabled
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium opacity-75 cursor-not-allowed"
                      >
                        💳 購買方案
                      </button>
                    )}
                    {plan.cta_options?.show_contact && (
                      <button
                        disabled
                        className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium opacity-75 cursor-not-allowed"
                      >
                        📞 聯繫我們
                      </button>
                    )}
                  </div>
                </div>

                {/* Management Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleStatus(plan)}
                    className={`flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm font-medium ${
                      plan.status === 'PUBLISHED'
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    <SafeIcon 
                      icon={plan.status === 'PUBLISHED' ? FiDownload : FiUpload} 
                      size={14} 
                    />
                    <span>{plan.status === 'PUBLISHED' ? '取消發布' : '發布'}</span>
                  </button>
                  <button
                    onClick={() => handleOpenModal(plan)}
                    className="bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <SafeIcon icon={FiEdit2} size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <SafeIcon icon={FiTrash2} size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {plans.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">尚未建立任何會員卡方案</p>
            <button
              onClick={() => handleOpenModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              建立第一個方案
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingPlan ? '編輯會員卡方案' : '新增會員卡方案'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={FiX} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      方案名稱 *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="請輸入方案名稱"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      用戶類型 *
                    </label>
                    <select
                      value={formData.user_type}
                      onChange={(e) => setFormData({ ...formData, user_type: e.target.value as 'individual' | 'corporate' })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="individual">個人</option>
                      <option value="corporate">企業</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      期限類型 *
                    </label>
                    <select
                      value={formData.duration_type}
                      onChange={(e) => {
                        const durationType = e.target.value as 'season' | 'annual';
                        setFormData({ 
                          ...formData, 
                          duration_type: durationType,
                          duration_days: durationType === 'season' ? 90 : 365
                        });
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="season">季方案</option>
                      <option value="annual">年方案</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      有效天數 *
                    </label>
                    <input
                      type="number"
                      value={formData.duration_days}
                      onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="請輸入有效天數"
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      原價 (NT$) *
                    </label>
                    <input
                      type="number"
                      value={formData.original_price}
                      onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="請輸入原價"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      售價 (NT$) *
                    </label>
                    <input
                      type="number"
                      value={formData.sale_price}
                      onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="請輸入售價"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    方案描述
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="請輸入方案描述"
                  />
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    功能特色
                  </label>
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleFeatureChange(index, e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="輸入功能描述"
                        />
                        <button
                          onClick={() => handleRemoveFeature(index)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <SafeIcon icon={FiX} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={handleAddFeature}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <SafeIcon icon={FiPlus} />
                      <span className="text-sm">新增功能</span>
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      狀態
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'DRAFT' | 'PUBLISHED' })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="DRAFT">草稿</option>
                      <option value="PUBLISHED">已發布</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.popular}
                        onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">設為熱門方案</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.hide_price}
                        disabled={formData.cta_options.show_payment}
                        onChange={(e) => setFormData({ ...formData, hide_price: e.target.checked })}
                        className={`rounded border-gray-300 shadow-sm focus:ring focus:ring-opacity-50 ${
                          !formData.cta_options.show_payment
                            ? 'text-orange-600 focus:border-orange-300 focus:ring-orange-200'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                      />
                      <span className={`ml-2 text-sm ${
                        !formData.cta_options.show_payment ? 'text-gray-700' : 'text-gray-400'
                      }`}>
                        隱藏價格（顯示"價格請洽詢"）
                      </span>
                    </label>
                    {formData.cta_options.show_payment && (
                      <p className="text-xs text-gray-500 ml-6 mt-1">
                        選擇「立即付款」時不可隱藏價格
                      </p>
                    )}
                  </div>
                </div>
                
                {/* CTA Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    CTA 按鈕選項（至少選擇一個）
                  </label>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.cta_options.show_payment}
                        onChange={(e) => {
                          const show_payment = e.target.checked;
                          const newCta = {
                            ...formData.cta_options,
                            show_payment
                          };
                          // 確保至少有一個選項被選中
                          if (!newCta.show_payment && !newCta.show_contact) {
                            newCta.show_contact = true;
                          }
                          setFormData({
                            ...formData,
                            cta_options: newCta,
                          });
                        }}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">顯示「立即付款」按鈕</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.cta_options.show_contact}
                        onChange={(e) => {
                          const newCta = {
                            ...formData.cta_options,
                            show_contact: e.target.checked
                          };
                          // 確保至少有一個選項被選中
                          if (!newCta.show_payment && !newCta.show_contact) {
                            newCta.show_payment = true;
                          }
                          setFormData({ ...formData, cta_options: newCta });
                        }}
                        className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">顯示「聯繫我們」按鈕</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    選中的按鈕將顯示在會員方案卡片中，用戶可以點擊進行相應操作
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <SafeIcon icon={FiSave} />
                  <span>儲存</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemberCardPlanManagement;