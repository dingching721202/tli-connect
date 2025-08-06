'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import { corporateSubscriptionStore } from '@/lib/corporateSubscriptionStore';
import { corporateMemberStore } from '@/lib/corporateMemberStore';
import { CorporateSubscription, CorporateMember, LearningRecord, ReservationRecord } from '@/types/corporateSubscription';
import { getCompanies, Company } from '@/data/corporateData';

const {
  FiUsers, FiUserCheck, FiUserPlus, FiSearch,
  FiX, FiClock, FiCheckCircle, FiChevronDown, FiChevronRight,
  FiEye, FiBook, FiCalendar, FiEdit2, FiTrash2, FiPlay, FiPause
} = FiIcons;

interface CorporateData extends Company {
  subscriptions: CorporateSubscription[];
  members: CorporateMember[];
}

const CorporateMemberManagement = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [corporateData, setCorporateData] = useState<CorporateData[]>([]);
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string | number>>(new Set());
  const [expandedSubscriptions, setExpandedSubscriptions] = useState<Set<number>>(new Set());
  const [selectedMember, setSelectedMember] = useState<CorporateMember | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showMemberDetailModal, setShowMemberDetailModal] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<number | null>(null);
  
  // 視圖模式控制
  const [viewMode, setViewMode] = useState<'hierarchy' | 'list'>('hierarchy');
  
  // 企業會員列表（扁平化）
  const [allCorporateMembers, setAllCorporateMembers] = useState<CorporateMember[]>([]);
  
  // 編輯功能
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [editingMember, setEditingMember] = useState<CorporateMember | null>(null);
  
  // 新增會員表單
  const [newMember, setNewMember] = useState({
    user_name: '',
    user_email: ''
  });
  
  // 統計數據
  const [statistics, setStatistics] = useState({
    totalCompanies: 0,
    totalSubscriptions: 0,
    totalMembers: 0,
    activatedMembers: 0,
    issuedMembers: 0,
    expiredMembers: 0
  });

  // 載入企業會員數據
  const loadCorporateData = async () => {
    try {
      setLoading(true);
      const companies = getCompanies();
      const subscriptions = await corporateSubscriptionStore.getAllSubscriptions();
      const members = await corporateMemberStore.getAllMembers();
      const memberStats = await corporateMemberStore.getMemberStatistics();
      
      // 組合企業數據
      const combinedData: CorporateData[] = companies.map(company => ({
        ...company,
        subscriptions: subscriptions.filter(sub => sub.company_id === company.id),
        members: members.filter(member => member.company_id === company.id)
      }));
      
      setCorporateData(combinedData);
      setAllCorporateMembers(members); // 設置扁平化的企業會員列表
      
      // 計算統計數據
      setStatistics({
        totalCompanies: companies.length,
        totalSubscriptions: subscriptions.length,
        totalMembers: memberStats.totalMembers,
        activatedMembers: memberStats.activatedMembers,
        issuedMembers: memberStats.issuedMembers,
        expiredMembers: memberStats.expiredMembers
      });
      
    } catch (error) {
      console.error('載入企業會員數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCorporateData();
  }, []);

  // 過濾企業數據
  const getFilteredCorporateData = (): CorporateData[] => {
    if (!searchTerm) return corporateData;
    
    return corporateData.filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.members.some(member => 
        member.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.user_email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  // 切換企業展開狀態
  const toggleCompanyExpansion = (companyId: string | number) => {
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(companyId)) {
      newExpanded.delete(companyId);
    } else {
      newExpanded.add(companyId);
    }
    setExpandedCompanies(newExpanded);
  };

  // 切換訂閱展開狀態
  const toggleSubscriptionExpansion = (subscriptionId: number) => {
    const newExpanded = new Set(expandedSubscriptions);
    if (newExpanded.has(subscriptionId)) {
      newExpanded.delete(subscriptionId);
    } else {
      newExpanded.add(subscriptionId);
    }
    setExpandedSubscriptions(newExpanded);
  };

  // 格式化金額
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // 格式化日期
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // 安全的日期轉換為輸入框格式 (避免時區問題)
  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      // 使用本地時間來避免時區轉換問題
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  // 獲取會員卡狀態顏色
  const getMemberStatusColor = (status: CorporateMember['card_status']): string => {
    switch (status) {
      case 'purchased': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'issued': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'activated': return 'text-green-700 bg-green-50 border-green-200';
      case 'expired': return 'text-red-700 bg-red-50 border-red-200';
      case 'cancelled': return 'text-gray-700 bg-gray-50 border-gray-200';
      case 'test': return 'text-purple-700 bg-purple-50 border-purple-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  // 獲取會員卡狀態文字
  const getMemberStatusText = (status: CorporateMember['card_status']): string => {
    switch (status) {
      case 'purchased': return '已購買未開啟';
      case 'issued': return '已發放未啟用';
      case 'activated': return '已啟用';
      case 'expired': return '已過期';
      case 'cancelled': return '已取消';
      case 'test': return '測試';
      default: return '未知';
    }
  };

  // 新增企業會員
  const handleAddMember = async () => {
    if (!selectedSubscriptionId) return;
    
    try {
      if (!newMember.user_name.trim() || !newMember.user_email.trim()) {
        alert('請填寫姓名和電子郵件');
        return;
      }

      const subscription = corporateData
        .flatMap(company => company.subscriptions)
        .find(sub => sub.id === selectedSubscriptionId);

      if (!subscription) {
        alert('找不到對應的企業訂閱');
        return;
      }

      if (subscription.seats_used >= subscription.seats_total) {
        alert('席次已滿，無法新增會員');
        return;
      }

      await corporateMemberStore.createMember({
        subscription_id: selectedSubscriptionId,
        user_name: newMember.user_name,
        user_email: newMember.user_email,
        company_id: subscription.company_id,
        company_name: subscription.company_name || '',
        plan_title: subscription.plan_title || '',
        duration_type: subscription.duration_type || 'annual',
        duration_days: subscription.duration_days || 365,
        purchase_date: subscription.purchase_date,
        redemption_deadline: subscription.activation_deadline
      });

      // 更新企業訂閱的席次使用數
      await corporateSubscriptionStore.updateSubscription(selectedSubscriptionId, {
        seats_used: subscription.seats_used + 1,
        seats_available: subscription.seats_available - 1
      });

      // 重置表單
      setNewMember({ user_name: '', user_email: '' });
      setShowAddMemberModal(false);
      setSelectedSubscriptionId(null);
      
      // 重新載入數據
      await loadCorporateData();
      alert('✅ 企業會員已成功新增！');
    } catch (error) {
      console.error('新增企業會員失敗:', error);
      alert('❌ 新增企業會員失敗：' + (error as Error).message);
    }
  };

  // 刪除企業會員
  const handleDeleteMember = async (memberId: number, memberName: string) => {
    try {
      const confirmMessage = `確定要刪除企業會員「${memberName}」嗎？此操作無法復原。`;
      if (!confirm(confirmMessage)) return;

      // 獲取會員信息以更新席次
      const member = await corporateMemberStore.getMemberById(memberId);
      if (member) {
        // 更新企業訂閱的席次使用數
        const subscription = corporateData
          .flatMap(company => company.subscriptions)
          .find(sub => sub.id === member.subscription_id);

        if (subscription) {
          await corporateSubscriptionStore.updateSubscription(member.subscription_id, {
            seats_used: Math.max(0, subscription.seats_used - 1),
            seats_available: subscription.seats_available + 1
          });
        }
      }

      await corporateMemberStore.deleteMember(memberId);
      await loadCorporateData();
      alert('✅ 企業會員已成功刪除！');
    } catch (error) {
      console.error('刪除企業會員失敗:', error);
      alert('❌ 刪除企業會員失敗：' + (error as Error).message);
    }
  };

  // 編輯會員功能
  const handleEditMember = (member: CorporateMember) => {
    setEditingMemberId(member.id);
    setEditingMember({ ...member });
  };

  const handleSaveMember = async () => {
    if (!editingMember) return;

    try {
      await corporateMemberStore.updateMember(editingMember.id, editingMember);
      setEditingMemberId(null);
      setEditingMember(null);
      await loadCorporateData();
      alert('✅ 會員資訊已更新！');
    } catch (error) {
      console.error('更新會員失敗:', error);
      alert('❌ 更新會員失敗：' + (error as Error).message);
    }
  };

  const handleCancelEdit = () => {
    setEditingMemberId(null);
    setEditingMember(null);
  };

  // 啟用/停用會員功能
  const handleToggleMemberStatus = async (member: CorporateMember) => {
    try {
      if (member.card_status === 'purchased' || member.card_status === 'issued') {
        // 啟用會員卡
        await corporateMemberStore.activateMemberCard(member.id);
        alert('✅ 會員卡已成功啟用！');
      } else if (member.card_status === 'activated') {
        // 停用會員卡（設為過期）
        await corporateMemberStore.updateMember(member.id, {
          card_status: 'expired'
        });
        alert('✅ 會員卡已停用！');
      } else if (member.card_status === 'expired') {
        // 重新啟用已過期的會員卡
        await corporateMemberStore.activateMemberCard(member.id);
        alert('✅ 會員卡已重新啟用！');
      }
      await loadCorporateData();
    } catch (error) {
      console.error('切換會員卡片狀態失敗:', error);
      alert('❌ 操作失敗：' + (error as Error).message);
    }
  };

  // 獲取狀態顏色和圖標
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'purchased': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'issued': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'activated': return 'text-green-700 bg-green-50 border-green-200';
      case 'expired': return 'text-red-700 bg-red-50 border-red-200';
      case 'cancelled': return 'text-gray-700 bg-gray-50 border-gray-200';
      case 'test': return 'text-purple-700 bg-purple-50 border-purple-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'purchased': return '已購買未開啟';
      case 'issued': return '已發放未啟用';
      case 'activated': return '已啟用';
      case 'expired': return '已過期';
      case 'cancelled': return '已取消';
      case 'test': return '測試';
      default: return status;
    }
  };

  // 查看會員詳情
  const handleViewMemberDetail = (member: CorporateMember) => {
    setSelectedMember(member);
    setShowMemberDetailModal(true);
  };

  const filteredData = getFilteredCorporateData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <SafeIcon icon={FiUsers} className="text-6xl text-gray-400 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">載入中...</h3>
          <p className="text-gray-600">正在載入企業會員資料</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 企業統計儀表板 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6"
      >
        {[
          { 
            label: '企業總數', 
            count: statistics.totalCompanies,
            color: 'text-purple-600 bg-purple-50 border-purple-200',
            icon: FiUsers
          },
          { 
            label: '訂閱總數', 
            count: statistics.totalSubscriptions,
            color: 'text-blue-600 bg-blue-50 border-blue-200',
            icon: FiUsers
          },
          { 
            label: '會員總數', 
            count: statistics.totalMembers,
            color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
            icon: FiUserCheck
          },
          { 
            label: '已啟用', 
            count: statistics.activatedMembers,
            color: 'text-green-600 bg-green-50 border-green-200',
            icon: FiCheckCircle
          },
          { 
            label: '已發放', 
            count: statistics.issuedMembers,
            color: 'text-orange-600 bg-orange-50 border-orange-200',
            icon: FiClock
          },
          { 
            label: '已過期', 
            count: statistics.expiredMembers,
            color: 'text-red-600 bg-red-50 border-red-200',
            icon: FiX
          }
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`p-4 rounded-xl border ${stat.color}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stat.count}</div>
                <div className="text-sm font-medium">{stat.label}</div>
              </div>
              <SafeIcon icon={stat.icon} className="text-2xl" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* 搜尋控制項與視圖切換 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜尋企業、會員名稱或信箱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* 視圖模式切換 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('hierarchy')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'hierarchy'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <SafeIcon icon={FiUsers} className="inline mr-2" />
              分層視圖
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <SafeIcon icon={FiEye} className="inline mr-2" />
              列表視圖
            </button>
          </div>
        </div>
      </motion.div>

      {/* 企業列表 - 根據視圖模式顯示 */}
      {viewMode === 'hierarchy' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {filteredData.length > 0 ? (
          filteredData.map((company) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* 企業標題行 */}
              <div 
                className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                onClick={() => toggleCompanyExpansion(company.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <SafeIcon 
                      icon={expandedCompanies.has(company.id) ? FiChevronDown : FiChevronRight}
                      className="text-gray-400"
                    />
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <SafeIcon icon={FiUsers} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                      <p className="text-sm text-gray-600">
                        {company.contactName} • {company.contactEmail} • {company.industry}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      訂閱: {company.subscriptions.length} | 會員: {company.members.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* 企業詳情（展開時顯示） */}
              <AnimatePresence>
                {expandedCompanies.has(company.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-gray-50"
                  >
                    {/* 企業訂閱列表 */}
                    <div className="space-y-4">
                      {company.subscriptions.map((subscription) => {
                        const subscriptionMembers = company.members.filter(m => m.subscription_id === subscription.id);
                        return (
                          <div key={subscription.id} className="bg-white p-4 rounded-lg border border-gray-200">
                            <div 
                              className="cursor-pointer"
                              onClick={() => toggleSubscriptionExpansion(subscription.id)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <SafeIcon 
                                    icon={expandedSubscriptions.has(subscription.id) ? FiChevronDown : FiChevronRight}
                                    className="text-gray-400 text-sm"
                                  />
                                  <h5 className="font-medium text-gray-900">{subscription.plan_title}</h5>
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                    {subscription.duration_type === 'annual' ? '年度方案' : '季度方案'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-600">
                                    席次: {subscription.seats_used}/{subscription.seats_total}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedSubscriptionId(subscription.id);
                                      setShowAddMemberModal(true);
                                    }}
                                    className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs"
                                  >
                                    <SafeIcon icon={FiUserPlus} className="text-xs" />
                                    <span>新增會員</span>
                                  </button>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                                <div>購買日期: {formatDate(subscription.purchase_date)}</div>
                                <div>兌換期限: {formatDate(subscription.activation_deadline)}</div>
                                <div>金額: {formatAmount(subscription.amount_paid)}</div>
                              </div>
                            </div>

                            {/* 會員列表（展開時顯示） */}
                            <AnimatePresence>
                              {expandedSubscriptions.has(subscription.id) && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-4 pt-4 border-t border-gray-100"
                                >
                                  <h6 className="text-sm font-medium text-gray-700 mb-3">企業會員列表</h6>
                                  {subscriptionMembers.length > 0 ? (
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow-sm">
                                        <thead className="bg-gray-50">
                                          <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              會員資訊
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              卡片狀態
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              發放日期
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              啟用期限
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              開始日期
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              結束日期
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              操作
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                          {subscriptionMembers.map((member) => (
                                            <tr key={member.id} className="hover:bg-gray-50">
                                              {/* 會員資訊 */}
                                              <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center">
                                                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                                                    <SafeIcon icon={FiUsers} className="text-white text-xs" />
                                                  </div>
                                                  <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                      {editingMemberId === member.id ? (
                                                        <input
                                                          type="text"
                                                          value={editingMember?.user_name || ''}
                                                          onChange={(e) => setEditingMember(prev => prev ? {...prev, user_name: e.target.value} : null)}
                                                          className="px-2 py-0.5 border border-gray-300 rounded text-sm w-[140px] h-6"
                                                        />
                                                      ) : (
                                                        member.user_name
                                                      )}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                      {editingMemberId === member.id ? (
                                                        <input
                                                          type="email"
                                                          value={editingMember?.user_email || ''}
                                                          onChange={(e) => setEditingMember(prev => prev ? {...prev, user_email: e.target.value} : null)}
                                                          className="px-2 py-0.5 border border-gray-300 rounded text-sm mt-1 w-[100px] h-6"
                                                        />
                                                      ) : (
                                                        member.user_email
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              </td>

                                              {/* 卡片狀態 */}
                                              <td className="px-4 py-3 whitespace-nowrap">
                                                {editingMemberId === member.id ? (
                                                  <select
                                                    value={editingMember?.card_status || ''}
                                                    onChange={(e) => setEditingMember(prev => prev ? {...prev, card_status: e.target.value as CorporateMember['card_status']} : null)}
                                                    className="px-2 py-0.5 border border-gray-300 rounded text-sm w-[120px] h-6"
                                                  >
                                                    <option value="purchased">已購買未開啟</option>
                                                    <option value="issued">已發放未啟用</option>
                                                    <option value="activated">已啟用</option>
                                                    <option value="expired">已過期</option>
                                                    <option value="cancelled">已取消</option>
                                                    <option value="test">測試</option>
                                                  </select>
                                                ) : (
                                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.card_status)}`}>
                                                    {getStatusText(member.card_status)}
                                                  </span>
                                                )}
                                              </td>

                                              {/* 發放日期 */}
                                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {editingMemberId === member.id ? (
                                                  <input
                                                    type="date"
                                                    value={formatDateForInput(editingMember?.issued_date)}
                                                    onChange={(e) => setEditingMember(prev => prev ? {...prev, issued_date: e.target.value} : null)}
                                                    className="px-2 py-0.5 border border-gray-300 rounded text-sm w-[130px] h-6 appearance-none cursor-pointer"
                                                    style={{ colorScheme: 'light' }}
                                                  />
                                                ) : (
                                                  formatDate(member.issued_date)
                                                )}
                                              </td>

                                              {/* 啟用期限 */}
                                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {editingMemberId === member.id ? (
                                                  <input
                                                    type="date"
                                                    value={formatDateForInput(editingMember?.activation_deadline)}
                                                    onChange={(e) => setEditingMember(prev => prev ? {...prev, activation_deadline: e.target.value} : null)}
                                                    className="px-2 py-0.5 border border-gray-300 rounded text-sm w-[130px] h-6 appearance-none cursor-pointer"
                                                    style={{ colorScheme: 'light' }}
                                                  />
                                                ) : (
                                                  formatDate(member.activation_deadline)
                                                )}
                                              </td>

                                              {/* 開始日期 */}
                                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {editingMemberId === member.id ? (
                                                  <input
                                                    type="date"
                                                    value={formatDateForInput(editingMember?.start_date)}
                                                    onChange={(e) => setEditingMember(prev => prev ? {...prev, start_date: e.target.value} : null)}
                                                    className="px-2 py-0.5 border border-gray-300 rounded text-sm w-[130px] h-6 appearance-none cursor-pointer"
                                                    style={{ colorScheme: 'light' }}
                                                  />
                                                ) : (
                                                  formatDate(member.start_date)
                                                )}
                                              </td>

                                              {/* 結束日期 */}
                                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {editingMemberId === member.id ? (
                                                  <input
                                                    type="date"
                                                    value={formatDateForInput(editingMember?.end_date)}
                                                    onChange={(e) => setEditingMember(prev => prev ? {...prev, end_date: e.target.value} : null)}
                                                    className="px-2 py-0.5 border border-gray-300 rounded text-sm w-[130px] h-6 appearance-none cursor-pointer"
                                                    style={{ colorScheme: 'light' }}
                                                  />
                                                ) : (
                                                  formatDate(member.end_date)
                                                )}
                                              </td>

                                              {/* 操作 */}
                                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-1">
                                                  {editingMemberId === member.id ? (
                                                    <>
                                                      <button
                                                        onClick={handleSaveMember}
                                                        className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-2 py-1 rounded text-xs"
                                                      >
                                                        儲存
                                                      </button>
                                                      <button
                                                        onClick={handleCancelEdit}
                                                        className="text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded text-xs"
                                                      >
                                                        取消
                                                      </button>
                                                    </>
                                                  ) : (
                                                    <>
                                                      {/* 查看 */}
                                                      <button
                                                        onClick={() => handleViewMemberDetail(member)}
                                                        title="查看詳情"
                                                        className="text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-1.5 rounded text-xs"
                                                      >
                                                        <SafeIcon icon={FiEye} className="text-sm" />
                                                      </button>
                                                      {/* 編輯 */}
                                                      <button
                                                        onClick={() => handleEditMember(member)}
                                                        title="編輯會員"
                                                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-1.5 rounded text-xs"
                                                      >
                                                        <SafeIcon icon={FiEdit2} className="text-sm" />
                                                      </button>
                                                      {/* 刪除 */}
                                                      <button
                                                        onClick={() => handleDeleteMember(member.id, member.user_name)}
                                                        title="刪除會員"
                                                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-1.5 rounded text-xs"
                                                      >
                                                        <SafeIcon icon={FiTrash2} className="text-sm" />
                                                      </button>
                                                      {/* 啟用/停用 */}
                                                      <button
                                                        onClick={() => handleToggleMemberStatus(member)}
                                                        title={member.card_status === 'activated' ? '停用' : '啟用'}
                                                        className={`p-1.5 rounded text-xs ${
                                                          member.card_status === 'activated'
                                                            ? 'text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100'
                                                            : 'text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100'
                                                        }`}
                                                      >
                                                        <SafeIcon icon={member.card_status === 'activated' ? FiPause : FiPlay} className="text-sm" />
                                                      </button>
                                                    </>
                                                  )}
                                                </div>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <div className="text-center py-8 text-gray-500 bg-white rounded-lg">
                                      <SafeIcon icon={FiUsers} className="text-4xl mx-auto mb-2" />
                                      <p className="text-sm">此訂閱尚無會員</p>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                      
                      {company.subscriptions.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <SafeIcon icon={FiUsers} className="text-4xl mx-auto mb-2" />
                          <p>此企業尚無訂閱方案</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-12">
            <div className="text-center">
              <SafeIcon icon={FiUsers} className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? '找不到符合條件的企業' : '暫無企業記錄'}
              </h3>
              <p className="text-gray-600">
                {searchTerm ? '請嘗試調整搜尋條件' : '企業註冊後，記錄會顯示在這裡'}
              </p>
            </div>
          </div>
        )}
        </motion.div>
      ) : (
        // 企業會員列表視圖
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          {allCorporateMembers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      會員資訊
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      企業 / 方案
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      卡片狀態
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      發放日期
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      啟用期限
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      開始日期
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      結束日期
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allCorporateMembers
                    .filter(member => 
                      !searchTerm || 
                      member.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      member.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      member.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      {/* 會員資訊 */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4 w-[160px]">
                            <div className="text-sm font-medium text-gray-900 h-5 flex items-center">
                              {editingMemberId === member.id ? (
                                <input
                                  type="text"
                                  value={editingMember?.user_name || ''}
                                  onChange={(e) => setEditingMember(prev => prev ? {...prev, user_name: e.target.value} : null)}
                                  className="w-[140px] px-2 py-0.5 border border-gray-300 rounded text-sm h-6"
                                />
                              ) : (
                                <span className="truncate" title={member.user_name}>{member.user_name}</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 h-5 flex items-center mt-1">
                              {editingMemberId === member.id ? (
                                <input
                                  type="email"
                                  value={editingMember?.user_email || ''}
                                  onChange={(e) => setEditingMember(prev => prev ? {...prev, user_email: e.target.value} : null)}
                                  className="w-[140px] px-2 py-0.5 border border-gray-300 rounded text-sm h-6"
                                />
                              ) : (
                                <span className="truncate" title={member.user_email}>{member.user_email}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 企業 / 方案 */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.company_name}</div>
                        <div className="text-sm text-gray-500">{member.plan_title}</div>
                      </td>

                      {/* 卡片狀態 */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="min-w-[120px] h-6 flex items-center">
                          {editingMemberId === member.id ? (
                            <select
                              value={editingMember?.card_status || ''}
                              onChange={(e) => setEditingMember(prev => prev ? {...prev, card_status: e.target.value as CorporateMember['card_status']} : null)}
                              className="w-[120px] px-2 py-0.5 border border-gray-300 rounded text-sm h-6"
                            >
                              <option value="purchased">已購買未開啟</option>
                              <option value="issued">已發放未啟用</option>
                              <option value="activated">已啟用</option>
                              <option value="expired">已過期</option>
                              <option value="cancelled">已取消</option>
                              <option value="test">測試</option>
                            </select>
                          ) : (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.card_status)}`}>
                              {getStatusText(member.card_status)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 發放日期 */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="min-w-[100px] h-6 flex items-center">
                          {editingMemberId === member.id ? (
                            <input
                              type="date"
                              value={formatDateForInput(editingMember?.issued_date)}
                              onChange={(e) => setEditingMember(prev => prev ? {...prev, issued_date: e.target.value} : null)}
                              className="w-[130px] px-2 py-0.5 border border-gray-300 rounded text-sm h-6 appearance-none cursor-pointer"
                              style={{ colorScheme: 'light' }}
                            />
                          ) : (
                            <span>{formatDate(member.issued_date)}</span>
                          )}
                        </div>
                      </td>

                      {/* 啟用期限 */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="min-w-[100px] h-6 flex items-center">
                          {editingMemberId === member.id ? (
                            <input
                              type="date"
                              value={formatDateForInput(editingMember?.activation_deadline)}
                              onChange={(e) => setEditingMember(prev => prev ? {...prev, activation_deadline: e.target.value} : null)}
                              className="w-[130px] px-2 py-0.5 border border-gray-300 rounded text-sm h-6 appearance-none cursor-pointer"
                              style={{ colorScheme: 'light' }}
                            />
                          ) : (
                            <span>{formatDate(member.activation_deadline)}</span>
                          )}
                        </div>
                      </td>

                      {/* 開始日期 */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="min-w-[100px] h-6 flex items-center">
                          {editingMemberId === member.id ? (
                            <input
                              type="date"
                              value={formatDateForInput(editingMember?.start_date)}
                              onChange={(e) => setEditingMember(prev => prev ? {...prev, start_date: e.target.value} : null)}
                              className="w-[130px] px-2 py-0.5 border border-gray-300 rounded text-sm h-6 appearance-none cursor-pointer"
                              style={{ colorScheme: 'light' }}
                            />
                          ) : (
                            <span>{formatDate(member.start_date)}</span>
                          )}
                        </div>
                      </td>

                      {/* 結束日期 */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="min-w-[100px] h-6 flex items-center">
                          {editingMemberId === member.id ? (
                            <input
                              type="date"
                              value={formatDateForInput(editingMember?.end_date)}
                              onChange={(e) => setEditingMember(prev => prev ? {...prev, end_date: e.target.value} : null)}
                              className="w-[130px] px-2 py-0.5 border border-gray-300 rounded text-sm h-6 appearance-none cursor-pointer"
                              style={{ colorScheme: 'light' }}
                            />
                          ) : (
                            <span>{formatDate(member.end_date)}</span>
                          )}
                        </div>
                      </td>

                      {/* 操作 */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2 min-w-[140px] h-6">
                          {editingMemberId === member.id ? (
                            <>
                              <button
                                onClick={handleSaveMember}
                                className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-2 py-1 rounded text-xs h-6 flex items-center"
                              >
                                儲存
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded text-xs h-6 flex items-center"
                              >
                                取消
                              </button>
                            </>
                          ) : (
                            <>
                              {/* 查看 */}
                              <button
                                onClick={() => handleViewMemberDetail(member)}
                                title="查看詳情"
                                className="text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-1 rounded text-xs h-6 w-6 flex items-center justify-center"
                              >
                                <SafeIcon icon={FiEye} className="text-sm" />
                              </button>
                              {/* 編輯 */}
                              <button
                                onClick={() => handleEditMember(member)}
                                title="編輯會員"
                                className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-1 rounded text-xs h-6 w-6 flex items-center justify-center"
                              >
                                <SafeIcon icon={FiEdit2} className="text-sm" />
                              </button>
                              {/* 刪除 */}
                              <button
                                onClick={() => handleDeleteMember(member.id, member.user_name)}
                                title="刪除會員"
                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-1 rounded text-xs h-6 w-6 flex items-center justify-center"
                              >
                                <SafeIcon icon={FiTrash2} className="text-sm" />
                              </button>
                              {/* 啟用/停用 */}
                              <button
                                onClick={() => handleToggleMemberStatus(member)}
                                title={member.card_status === 'activated' ? '停用' : '啟用'}
                                className={`p-1 rounded text-xs h-6 w-6 flex items-center justify-center ${
                                  member.card_status === 'activated'
                                    ? 'text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100'
                                    : 'text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100'
                                }`}
                              >
                                <SafeIcon icon={member.card_status === 'activated' ? FiPause : FiPlay} className="text-sm" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <SafeIcon icon={FiUsers} className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暫無企業會員</h3>
              <p className="text-gray-600">企業會員創建後，會顯示在這裡</p>
            </div>
          )}
        </motion.div>
      )}

      {/* 新增會員 Modal */}
      <AnimatePresence>
        {showAddMemberModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddMemberModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">新增企業會員</h3>
                <button
                  onClick={() => setShowAddMemberModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <SafeIcon icon={FiX} className="text-xl" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMember.user_name}
                    onChange={(e) => setNewMember({...newMember, user_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="輸入會員姓名"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電子郵件 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newMember.user_email}
                    onChange={(e) => setNewMember({...newMember, user_email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="輸入電子郵件地址"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleAddMember}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  新增會員
                </button>
                <button
                  onClick={() => setShowAddMemberModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  取消
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 會員詳情 Modal */}
      <AnimatePresence>
        {showMemberDetailModal && selectedMember && (
          <MemberDetailModal 
            member={selectedMember}
            onClose={() => {
              setShowMemberDetailModal(false);
              setSelectedMember(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// 會員詳情 Modal 組件
const MemberDetailModal = ({ member, onClose }: { member: CorporateMember, onClose: () => void }) => {
  // 獲取會員卡狀態顏色
  const getMemberStatusColor = (status: CorporateMember['card_status']): string => {
    switch (status) {
      case 'purchased': return 'bg-blue-100 text-blue-700';
      case 'issued': return 'bg-orange-100 text-orange-700';
      case 'activated': return 'bg-green-100 text-green-700';
      case 'expired': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      case 'test': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // 獲取會員卡狀態文字
  const getMemberStatusText = (status: CorporateMember['card_status']): string => {
    switch (status) {
      case 'purchased': return '已購買未開啟';
      case 'issued': return '已發放未啟用';
      case 'activated': return '已啟用';
      case 'expired': return '已過期';
      case 'cancelled': return '已取消';
      case 'test': return '測試';
      default: return '未知';
    }
  };
  const [learningRecords, setLearningRecords] = useState<LearningRecord[]>([]);
  const [reservationRecords, setReservationRecords] = useState<ReservationRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'learning' | 'reservations'>('info');

  useEffect(() => {
    const loadMemberDetails = async () => {
      const learning = await corporateMemberStore.getLearningRecords(member.id);
      const reservations = await corporateMemberStore.getReservationRecords(member.id);
      setLearningRecords(learning);
      setReservationRecords(reservations);
    };
    
    loadMemberDetails();
  }, [member.id]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">會員詳情 - {member.user_name}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <SafeIcon icon={FiX} className="text-xl" />
          </button>
        </div>

        {/* Tab 切換 */}
        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'info', label: '基本資訊', icon: FiUsers },
            { id: 'learning', label: '學習記錄', icon: FiBook },
            { id: 'reservations', label: '預約記錄', icon: FiCalendar }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'info' | 'learning' | 'reservations')}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <SafeIcon icon={tab.icon} className="text-sm" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 內容 */}
        <div className="space-y-4">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">會員資訊</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">姓名:</span> {member.user_name}</div>
                  <div><span className="text-gray-600">電子郵件:</span> {member.user_email}</div>
                  <div><span className="text-gray-600">企業:</span> {member.company_name}</div>
                  <div><span className="text-gray-600">方案:</span> {member.plan_title}</div>
                  <div><span className="text-gray-600">卡片狀態:</span> 
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getMemberStatusColor(member.card_status)}`}>
                      {getMemberStatusText(member.card_status)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">時間資訊</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">發放日期:</span> {formatDate(member.issued_date)}</div>
                  <div><span className="text-gray-600">啟用期限:</span> {formatDate(member.activation_deadline)}</div>
                  {member.activation_date && (
                    <div><span className="text-gray-600">啟用日期:</span> {formatDate(member.activation_date)}</div>
                  )}
                  {member.start_date && (
                    <div><span className="text-gray-600">開始日期:</span> {formatDate(member.start_date)}</div>
                  )}
                  {member.end_date && (
                    <div><span className="text-gray-600">結束日期:</span> {formatDate(member.end_date)}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'learning' && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">學習記錄</h4>
              {learningRecords.length > 0 ? (
                <div className="space-y-3">
                  {learningRecords.map((record) => (
                    <div key={record.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-gray-900">{record.course_title}</h5>
                        <span className="text-xs text-gray-500">{formatDate(record.activity_date)}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>類型: {
                          record.activity_type === 'course_complete' ? '課程完成' :
                          record.activity_type === 'course_view' ? '課程觀看' :
                          record.activity_type === 'reservation' ? '預約' : '出席'
                        }</span>
                        {record.duration_minutes && (
                          <span>時間: {record.duration_minutes} 分鐘</span>
                        )}
                        {record.completion_rate && (
                          <span>完成度: {record.completion_rate}%</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <SafeIcon icon={FiBook} className="text-4xl mx-auto mb-2" />
                  <p>暫無學習記錄</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reservations' && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">預約記錄</h4>
              {reservationRecords.length > 0 ? (
                <div className="space-y-3">
                  {reservationRecords.map((record) => (
                    <div key={record.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-gray-900">{record.event_title}</h5>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          record.status === 'attended' ? 'bg-green-100 text-green-700' :
                          record.status === 'reserved' ? 'bg-blue-100 text-blue-700' :
                          record.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {record.status === 'attended' ? '已出席' :
                           record.status === 'reserved' ? '已預約' :
                           record.status === 'cancelled' ? '已取消' : '未出席'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>活動日期: {formatDate(record.event_date)}</span>
                        <span>預約日期: {formatDate(record.reservation_date)}</span>
                      </div>
                      {record.notes && (
                        <div className="mt-2 text-sm text-gray-600">備註: {record.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <SafeIcon icon={FiCalendar} className="text-4xl mx-auto mb-2" />
                  <p>暫無預約記錄</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CorporateMemberManagement;