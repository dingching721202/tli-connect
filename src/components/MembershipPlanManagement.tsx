'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import {
  MembershipPlan,
  getMembershipPlans,
  createMembershipPlan,
  updateMembershipPlan,
  deleteMembershipPlan,
  duplicateMembershipPlan
} from '@/data/membershipPlans';

const {
  FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiEye, FiEyeOff, FiCopy,
  FiCheck, FiAlertTriangle, FiInfo, FiDollarSign, FiCalendar,
  FiUsers, FiBuilding, FiStar, FiToggleLeft, FiToggleRight
} = FiIcons;


const MembershipPlanManagement = () => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [filter, setFilter] = useState<'all' | 'individual' | 'corporate'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');

  // 表單狀態
  const [formData, setFormData] = useState<Partial<MembershipPlan>>({
    name: '',
    type: 'individual',
    duration: 1,
    price: 0,
    originalPrice: 0,
    popular: false,
    features: [''],
    status: 'draft'
  });

  // 載入方案數據
  useEffect(() => {
    const loadPlans = () => {
      const allPlans = getMembershipPlans();
      setPlans(allPlans);
    };
    loadPlans();
  }, []);

  const handleOpenModal = (plan?: MembershipPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({ ...plan });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        type: 'individual',
        duration: 1,
        price: 0,
        originalPrice: 0,
        popular: false,
        features: [''],
        status: 'draft'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPlan(null);
    setFormData({
      name: '',
      type: 'individual',
      duration: 1,
      price: 0,
      originalPrice: 0,
      popular: false,
      features: [''],
      status: 'draft'
    });
  };

  const handleSavePlan = () => {
    if (!formData.name || !formData.price) {
      alert('請填寫必要欄位');
      return;
    }
    
    if (editingPlan) {
      // 更新現有方案
      const updatedPlan = updateMembershipPlan(editingPlan.id, formData);
      if (updatedPlan) {
        setPlans(prev => prev.map(plan => 
          plan.id === editingPlan.id ? updatedPlan : plan
        ));
      }
    } else {
      // 創建新方案
      const newPlan = createMembershipPlan(formData as Omit<MembershipPlan, 'id' | 'createdAt' | 'updatedAt'>);
      setPlans(prev => [...prev, newPlan]);
    }

    handleCloseModal();
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm('確定要刪除此方案嗎？')) {
      const success = deleteMembershipPlan(planId);
      if (success) {
        setPlans(prev => prev.filter(plan => plan.id !== planId));
      }
    }
  };

  const handleDuplicatePlan = (plan: MembershipPlan) => {
    const duplicatedPlan = duplicateMembershipPlan(plan.id);
    if (duplicatedPlan) {
      setPlans(prev => [...prev, duplicatedPlan]);
    }
  };

  const handleToggleStatus = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      const newStatus = plan.status === 'draft' ? 'published' : 'draft';
      const updatedPlan = updateMembershipPlan(planId, { status: newStatus });
      if (updatedPlan) {
        setPlans(prev => prev.map(p => p.id === planId ? updatedPlan : p));
      }
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const handleAddFeature = () => {
    setFormData(prev => ({ 
      ...prev, 
      features: [...(prev.features || []), ''] 
    }));
  };

  const handleRemoveFeature = (index: number) => {
    const newFeatures = (formData.features || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const filteredPlans = plans.filter(plan => {
    const typeMatch = filter === 'all' || plan.type === filter;
    const statusMatch = statusFilter === 'all' || plan.status === statusFilter;
    return typeMatch && statusMatch;
  });

  const formatPrice = (price: number) => {
    return `NT$ ${price.toLocaleString()}`;
  };

  const calculateDiscount = (price: number, originalPrice: number) => {
    if (originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">會員方案管理</h2>
          <p className="text-gray-600 mt-1">管理系統中的會員方案設定</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <SafeIcon icon={FiPlus} />
          <span>新增方案</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">方案類型：</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
          >
            <option value="all">全部</option>
            <option value="individual">個人方案</option>
            <option value="corporate">企業方案</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">狀態：</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
          >
            <option value="all">全部</option>
            <option value="draft">草稿</option>
            <option value="published">已發布</option>
          </select>
        </div>
      </div>

      {/* Plans List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ scale: 1.02 }}
            className={`border rounded-xl p-6 relative ${
              plan.status === 'published' ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
            }`}
          >
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                plan.status === 'published' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {plan.status === 'published' ? '已發布' : '草稿'}
              </span>
            </div>

            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute top-4 left-4">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                  <SafeIcon icon={FiStar} className="text-xs" />
                  <span>熱門</span>
                </span>
              </div>
            )}

            {/* Plan Info */}
            <div className="mt-8">
              <div className="flex items-center space-x-2 mb-2">
                <SafeIcon icon={plan.type === 'individual' ? FiUsers : FiBuilding} className="text-gray-600" />
                <span className="text-sm text-gray-600">
                  {plan.type === 'individual' ? '個人方案' : '企業方案'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="flex items-center space-x-2 mb-4">
                <SafeIcon icon={FiCalendar} className="text-gray-500" />
                <span className="text-sm text-gray-600">{plan.duration} 個月</span>
              </div>
              
              {/* Pricing */}
              <div className="mb-4">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-gray-900">{formatPrice(plan.price)}</span>
                  {plan.originalPrice > plan.price && (
                    <span className="text-lg text-gray-500 line-through">{formatPrice(plan.originalPrice)}</span>
                  )}
                </div>
                {plan.originalPrice > plan.price && (
                  <span className="text-sm text-green-600 font-medium">
                    省 {calculateDiscount(plan.price, plan.originalPrice)}%
                  </span>
                )}
              </div>

              {/* Features */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">功能特色：</h4>
                <ul className="space-y-1">
                  {plan.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <SafeIcon icon={FiCheck} className="text-green-500 text-xs" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.features.length > 3 && (
                    <li className="text-sm text-gray-500">
                      還有 {plan.features.length - 3} 項功能...
                    </li>
                  )}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenModal(plan)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="編輯"
                  >
                    <SafeIcon icon={FiEdit2} />
                  </button>
                  <button
                    onClick={() => handleDuplicatePlan(plan)}
                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                    title="複製"
                  >
                    <SafeIcon icon={FiCopy} />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="刪除"
                  >
                    <SafeIcon icon={FiTrash2} />
                  </button>
                </div>
                <button
                  onClick={() => handleToggleStatus(plan.id)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    plan.status === 'published'
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {plan.status === 'published' ? '設為草稿' : '發布'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPlans.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiInfo} className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">沒有找到方案</h3>
          <p className="text-gray-500 mb-4">請調整篩選條件或新增方案</p>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            新增第一個方案
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingPlan ? '編輯方案' : '新增方案'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
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
                      value={formData.name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例：季方案"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      方案類型
                    </label>
                    <select
                      value={formData.type || 'individual'}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="individual">個人方案</option>
                      <option value="corporate">企業方案</option>
                    </select>
                  </div>
                </div>

                {/* Duration and Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      期間（月）*
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.duration || 1}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      售價 *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.price || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      原價
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.originalPrice || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: parseInt(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.popular || false}
                      onChange={(e) => setFormData(prev => ({ ...prev, popular: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">熱門方案</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">狀態：</label>
                    <select
                      value={formData.status || 'draft'}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                    >
                      <option value="draft">草稿</option>
                      <option value="published">發布</option>
                    </select>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    功能特色
                  </label>
                  <div className="space-y-2">
                    {(formData.features || []).map((feature, index) => (
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

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSavePlan}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <SafeIcon icon={FiSave} />
                    <span>{editingPlan ? '更新' : '儲存'}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MembershipPlanManagement;