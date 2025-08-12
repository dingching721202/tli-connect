'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import { memberCardStore } from '@/lib/memberCardStore';
import { Membership } from '@/types/membership';
import { memberCardPlans } from '@/data/member_card_plans';
import { users } from '@/data/users';
import { MembershipStatus } from '@/types/user';
import CorporateMemberManagement from './CorporateMemberManagement';
import { corporateStore } from '@/lib/corporateStore';
import { Company } from '@/data/corporateData';


// 組織分層視圖組件
const OrganizationHierarchyView = () => {
  return <CorporateMemberManagement />;
};

const {
  FiUsers, FiUser, FiBriefcase, FiUserPlus, FiTrash2, FiSearch,
  FiX, FiClock, FiCheckCircle, FiEdit2, FiSave
} = FiIcons;

interface MemberWithCard extends Membership {
  daysUntilExpiry?: number;
  isExpiringSoon?: boolean;
  user_membership_status?: MembershipStatus;
  user_account_status?: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
}

interface NewMember {
  name: string;
  email: string;
  plan_id: number;
  auto_activation: boolean;
  company_name?: string;
}

const MemberManagementReal = () => {
  const [memberCards, setMemberCards] = useState<MemberWithCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'individual' | 'corporate' | 'non_member' | 'inactive' | 'activated' | 'expired' | 'cancelled' | 'test'>('all');
  const [memberTypeTab, setMemberTypeTab] = useState<'all' | 'individual' | 'corporate' | 'organization'>('all');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);

  // 根據當前分頁動態計算統計數據
  const getDisplayStatistics = () => {
    let baseData = memberCards;
    
    // 根據分頁篩選基礎數據
    if (memberTypeTab === 'individual') {
      baseData = memberCards.filter(card => card.plan_type === 'individual');
    } else if (memberTypeTab === 'corporate') {
      baseData = memberCards.filter(card => card.plan_type === 'corporate');
    }
    
    return {
      total: baseData.length,
      active: baseData.filter(c => c.status === 'activated').length,
      inactive: baseData.filter(c => c.status === 'inactive').length,
      nonMember: baseData.filter(c => c.status === 'non_member').length,
      expired: baseData.filter(c => c.status === 'expired').length,
      cancelled: baseData.filter(c => c.status === 'cancelled').length,
      test: baseData.filter(c => c.status === 'test').length,
      individual: memberCards.filter(card => card.plan_type === 'individual').length,
      corporate: memberCards.filter(card => card.plan_type === 'corporate').length
    };
  };

  const displayStats = getDisplayStatistics();

  // 編輯模式相關狀態
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);

  const [editingMember, setEditingMember] = useState<Partial<Membership> | null>(null);

  // 新增會員表單狀態
  const [newMember, setNewMember] = useState<NewMember>({
    name: '',
    email: '',
    plan_id: 1,
    auto_activation: false
  });

  // 載入會員卡資料
  const loadMemberCards = async () => {
    try {
      setLoading(true);
      const cards = await memberCardStore.getAllMemberships();
      
      // 調試：檢查企業會員數據
      console.log('載入的會員數據:', cards);
      const corporateMembers = cards.filter(c => c.plan_type === 'corporate');
      console.log('企業會員:', corporateMembers);
      corporateMembers.forEach(member => {
        console.log(`企業會員 ${member.user_name}: company_name = ${member.company_name}`);
      });
      
      // 獲取所有有會員狀態的用戶（包括沒有會員卡的會員）
      const memberUsers = users.filter(user => 
        user.membership_status === 'activated' || 
        user.membership_status === 'expired' || 
        user.membership_status === 'test'
      );
      
      // 創建會員卡用戶ID集合
      const cardUserIds = new Set(cards.map(card => card.user_id));
      
      // 為沒有會員卡但有會員狀態的用戶創建虛擬記錄
      const virtualMemberCards: MemberWithCard[] = memberUsers
        .filter(user => !cardUserIds.has(user.id))
        .map(user => ({
          id: -user.id, // 使用負數ID避免衝突
          user_id: user.id,
          user_name: user.name,
          user_email: user.email,
          membership_type: 'individual' as const,
          member_card_id: 0,
          plan_id: 0,
          status: 'test' as const, // 沒有會員卡但有會員狀態
          purchase_date: user.created_at,
          activation_deadline: user.created_at,
          amount_paid: 0,
          auto_renewal: false,
          created_at: user.created_at,
          updated_at: user.updated_at || user.created_at,
          plan_title: '無會員卡',
          plan_type: 'individual' as const,
          duration_type: 'season' as const,
          duration_days: 0,
          user_membership_status: user.membership_status as MembershipStatus,
          user_account_status: user.account_status,
          daysUntilExpiry: undefined,
          isExpiringSoon: false
        }));
      
      // 計算到期天數和即將到期狀態，並添加用戶會員狀態
      const cardsWithExpiry = cards.map(card => {
        let daysUntilExpiry: number | undefined;
        let isExpiringSoon = false;

        if (card.status === 'activated' && card.expiry_date) {
          const expiryDate = new Date(card.expiry_date);
          const today = new Date();
          daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
        } else if (card.status === 'inactive' && card.activation_deadline) {
          const deadline = new Date(card.activation_deadline);
          const today = new Date();
          daysUntilExpiry = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;
        }

        // 查找對應的用戶資料以獲取會員狀態
        const userData = users.find(u => u.id === card.user_id);
        
        // 根據會員卡狀態自動更新用戶會員狀態
        let userMembershipStatus: MembershipStatus = 'non_member';
        if (card.status === 'activated') {
          userMembershipStatus = 'activated';
        } else if (card.status === 'expired') {
          userMembershipStatus = 'expired';
        } else if (card.status === 'inactive') {
          userMembershipStatus = 'inactive';
        } else if (card.status === 'test') {
          userMembershipStatus = 'test';
        } else if (userData?.membership_status) {
          userMembershipStatus = userData.membership_status as MembershipStatus;
        }

        return {
          ...card,
          daysUntilExpiry,
          isExpiringSoon,
          user_membership_status: userMembershipStatus,
          user_account_status: userData?.account_status
        };
      });

      // 合併實際會員卡和虛擬記錄
      const allMemberRecords = [...cardsWithExpiry, ...virtualMemberCards];
      
      setMemberCards(allMemberRecords);
    } catch (error) {
      console.error('載入會員卡資料失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemberCards();
    loadCompanies();
  }, []);

  // 載入企業列表
  const loadCompanies = async () => {
    try {
      const companiesList = await corporateStore.getAllCompanies();
      setCompanies(companiesList);
    } catch (error) {
      console.error('載入企業列表失敗:', error);
    }
  };

  // 過濾會員資料
  const getFilteredMembers = (): MemberWithCard[] => {
    return memberCards.filter(card => {
      // 搜尋過濾
      const matchesSearch = card.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           card.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (card.plan_title && card.plan_title.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchesSearch) return false;

      // 分頁篩選（始終生效）
      if (memberTypeTab !== 'all' && card.plan_type !== memberTypeTab) return false;

      // 狀態篩選（基於卡片點擊）
      if (activeFilter !== 'all') {
        // 會員類型篩選（僅在全部分頁有效）
        if (activeFilter === 'individual' || activeFilter === 'corporate') {
          if (memberTypeTab === 'all' && card.plan_type !== activeFilter) return false;
        } 
        // 會員狀態篩選
        else {
          if (card.status !== activeFilter) return false;
        }
      }

      return true;
    });
  };

  // 格式化日期
  const formatDate = (dateString: string): string => {
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

  // 格式化金額
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };


  // 獲取狀態顏色
  const getStatusColor = (status: Membership['status']): string => {
    switch (status) {
      case 'non_member': return 'text-gray-700 bg-gray-50 border-gray-200';
      case 'inactive': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'activated': return 'text-green-700 bg-green-50 border-green-200';
      case 'expired': return 'text-red-700 bg-red-50 border-red-200';
      case 'cancelled': return 'text-gray-700 bg-gray-50 border-gray-200';
      case 'test': return 'text-blue-700 bg-blue-50 border-blue-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };


  // 獲取狀態文字
  const getStatusText = (status: Membership['status']): string => {
    switch (status) {
      case 'non_member': return '非會員';
      case 'inactive': return '未啟用';
      case 'activated': return '啟用';
      case 'expired': return '過期';
      case 'cancelled': return '取消';
      case 'test': return '測試';
      default: return '未知';
    }
  };

  // 獲取狀態圖示
  const getStatusIcon = (status: Membership['status']) => {
    switch (status) {
      case 'non_member': return FiUser;
      case 'inactive': return FiClock;
      case 'activated': return FiCheckCircle;
      case 'expired': return FiX;
      case 'cancelled': return FiX;
      case 'test': return FiUser;
      default: return FiUser;
    }
  };

  // 手動添加會員
  const handleAddMember = async () => {
    try {
      if (!newMember.name.trim() || !newMember.email.trim()) {
        alert('請填寫姓名和電子郵件');
        return;
      }

      // 企業分頁需要驗證企業名稱
      if (memberTypeTab === 'corporate' && !newMember.company_name?.trim()) {
        alert('請填寫企業名稱');
        return;
      }

      // 檢查email格式
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(newMember.email)) {
        alert('電子郵件格式不正確');
        return;
      }

      // 檢查email是否已存在
      const existingMember = memberCards.find(card => card.user_email === newMember.email);
      if (existingMember) {
        alert('此電子郵件已被使用');
        return;
      }

      await memberCardStore.manuallyAddMember({
        user_name: newMember.name,
        user_email: newMember.email,
        plan_id: newMember.plan_id,
        auto_activation: newMember.auto_activation,
        company_name: newMember.company_name
      });

      // 重置表單
      setNewMember({
        name: '',
        email: '',
        plan_id: 1,
        auto_activation: false,
        company_name: ''
      });
      setShowAddMemberModal(false);
      
      // 重新載入資料
      await loadMemberCards();
      alert('✅ 會員已成功新增！');
    } catch (error) {
      console.error('新增會員失敗:', error);
      alert('❌ 新增會員失敗：' + (error as Error).message);
    }
  };

  // 開啟會員卡
  const handleActivateMemberCard = async (cardId: number) => {
    try {
      const confirmMessage = '確定要開啟這張會員卡嗎？開啟後將開始計算有效期。';
      if (!confirm(confirmMessage)) return;

      await memberCardStore.activateMemberCard(cardId);
      await loadMemberCards();
      alert('✅ 會員卡已成功開啟！');
    } catch (error) {
      console.error('開啟會員卡失敗:', error);
      alert('❌ 開啟會員卡失敗：' + (error as Error).message);
    }
  };


  // 處理方案變更，自動更新金額
  const handlePlanChange = (planId: number) => {
    if (editingMember) {
      if (planId === 0) {
        // 清除方案選擇
        setEditingMember(prev => prev ? {
          ...prev,
          plan_id: 0,
          amount_paid: 0
        } : null);
      } else {
        const selectedPlan = memberCardPlans.find(plan => plan.id === planId);
        if (selectedPlan) {
          setEditingMember(prev => prev ? {
            ...prev,
            plan_id: planId,
            amount_paid: parseFloat(selectedPlan.sale_price)
          } : null);
        }
      }
    }
  };

  // 開始編輯會員
  const handleEditMember = (member: MemberWithCard) => {
    setEditingMemberId(member.id);
    setEditingMember({
      user_name: member.user_name,
      user_email: member.user_email,
      plan_id: member.plan_id,
      amount_paid: member.amount_paid,
      status: member.status,
      purchase_date: member.purchase_date,
      activation_deadline: member.activation_deadline || '',
      activation_date: member.activation_date || '',
      expiry_date: member.expiry_date || ''
    });
  };

  // 取消編輯
  const handleCancelEdit = () => {
    setEditingMemberId(null);
    setEditingMember(null);
  };

  // 保存編輯
  const handleSaveEdit = async (memberId: number) => {
    if (!editingMember) return;

    try {
      // 驗證必填欄位
      if (!editingMember.user_name?.trim() || !editingMember.user_email?.trim()) {
        alert('姓名和電子郵件不能為空');
        return;
      }

      // 驗證電子郵件格式
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(editingMember.user_email)) {
        alert('電子郵件格式不正確');
        return;
      }

      // 驗證日期格式
      const dateFields = ['purchase_date', 'activation_deadline', 'activation_date', 'expiry_date'];
      for (const field of dateFields) {
        const value = editingMember[field as keyof typeof editingMember];
        if (value && typeof value === 'string') {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            alert(`${field === 'purchase_date' ? '購買日期' : 
                     field === 'activation_deadline' ? '兌換期限' :
                     field === 'activation_date' ? '開始日期' : '結束日期'} 格式不正確`);
            return;
          }
        }
      }

      const currentMember = memberCards.find(m => m.id === memberId);
      
      // 區分真實會員卡和虛擬記錄
      if (memberId > 0) {
        // 真實會員卡記錄，調用 store 方法
        await memberCardStore.updateMemberInfo(memberId, {
          user_name: editingMember.user_name,
          user_email: editingMember.user_email
        });

        // 更新會員卡方案（如果有變更）
        if (currentMember && editingMember.plan_id !== currentMember.plan_id) {
          await memberCardStore.updateMemberPlan(memberId, editingMember.plan_id!);
        }

        // 更新狀態（如果有變更）
        if (currentMember && editingMember.status !== currentMember.status) {
          await memberCardStore.updateMemberCardStatus(memberId, editingMember.status!);
        }

        // 更新日期
        await memberCardStore.updateMemberCardDates(memberId, {
          purchase_date: editingMember.purchase_date || '',
          activation_deadline: editingMember.activation_deadline || '',
          activation_date: editingMember.activation_date || '',
          expiry_date: editingMember.expiry_date || ''
        });
      } else {
        // 虛擬記錄（無會員卡），只更新本地狀態
        if (currentMember) {
          // 如果選擇了會員卡方案，獲取方案信息
          let planInfo = {};
          if (editingMember.plan_id && editingMember.plan_id > 0) {
            const plan = memberCardPlans.find(p => p.id === editingMember.plan_id);
            if (plan) {
              planInfo = {
                plan_id: editingMember.plan_id,
                plan_title: plan.title,
                plan_type: plan.user_type,
                duration_type: plan.duration_type,
                duration_days: plan.duration_days,
                amount_paid: parseFloat(plan.sale_price),
                member_card_id: plan.member_card_id
              };
            }
          }
          
          const updatedMember = {
            ...currentMember,
            user_name: editingMember.user_name,
            user_email: editingMember.user_email,
            status: editingMember.status || currentMember.status,
            ...planInfo,
            updated_at: new Date().toISOString()
          };
          
          // 更新本地記錄和統計
          const updatedMembers = memberCards.map(m => m.id === memberId ? updatedMember : m);
          setMemberCards(updatedMembers);
          
        }
      }

      // 只有真實會員卡才重新載入資料
      if (memberId > 0) {
        await loadMemberCards();
      }
      setEditingMemberId(null);
      setEditingMember(null);
      alert('✅ 會員資料已成功更新！');
    } catch (error) {
      console.error('更新會員失敗:', error);
      alert('❌ 更新會員失敗：' + (error as Error).message);
    }
  };

  // 刪除會員
  const handleDeleteMember = async (memberId: number, memberName: string) => {
    try {
      const confirmMessage = `確定要刪除會員「${memberName}」嗎？此操作無法復原。`;
      if (!confirm(confirmMessage)) return;

      await memberCardStore.deleteMembership(memberId);
      await loadMemberCards();
      alert('✅ 會員已成功刪除！');
    } catch (error) {
      console.error('刪除會員失敗:', error);
      alert('❌ 刪除會員失敗：' + (error as Error).message);
    }
  };

  const filteredMembers = getFilteredMembers();

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <SafeIcon icon={FiUsers} className="text-6xl text-gray-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">載入中...</h3>
            <p className="text-gray-600">正在載入會員資料</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <SafeIcon icon={FiUsers} className="mr-3 text-2xl text-gray-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              會員管理
            </h1>
          </div>
          
          {/* Member Type Tabs */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            {[
              { id: 'all', label: '全部' },
              { id: 'individual', label: '個人' },
              { id: 'corporate', label: '企業' },
              { id: 'organization', label: '組織' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setMemberTypeTab(tab.id as 'all' | 'individual' | 'corporate' | 'organization');
                  // 根據分頁自動設置對應的篩選
                  if (tab.id === 'all') {
                    setActiveFilter('all');
                  } else if (tab.id === 'individual') {
                    setActiveFilter('individual');
                  } else if (tab.id === 'corporate') {
                    setActiveFilter('corporate');
                  }
                  // organization 分頁不設置篩選，因為它有特殊的顯示邏輯
                }}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  memberTypeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-gray-600">
          管理基於會員卡購買記錄的真實會員資料
        </p>
      </motion.div>

      {/* 根據選中的分頁顯示不同內容 */}
      {memberTypeTab === 'organization' ? (
        <OrganizationHierarchyView />
      ) : (
        <>
          {/* Statistics Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`grid gap-4 mb-6 ${
              memberTypeTab === 'individual' || memberTypeTab === 'corporate'
                ? 'grid-cols-1 md:grid-cols-4 lg:grid-cols-7' 
                : 'grid-cols-1 md:grid-cols-4 lg:grid-cols-9'
            }`}
          >
            {/* 總會員 - 只在全部分頁顯示 */}
            {memberTypeTab === 'all' && (
              <div 
                className={`bg-white p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-all ${
                  activeFilter === 'all' ? 'ring-2 ring-blue-500 shadow-lg' : ''
                }`}
                onClick={() => {
                  setActiveFilter('all');
                  setSearchTerm('');
                }}
              >
                <div className="flex items-center">
                  <SafeIcon icon={FiUsers} className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">總會員</p>
                    <p className="text-2xl font-semibold text-gray-900">{displayStats.total}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 個人會員 - 在個人分頁顯示在第一位，在企業分頁也顯示 */}
            {memberTypeTab === 'individual' && (
              <div 
                className={`bg-white p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-all ${
                  activeFilter === 'all' ? 'ring-2 ring-blue-500 shadow-lg' : ''
                }`}
                onClick={() => {
                  setActiveFilter('all');
                  setSearchTerm('');
                }}
              >
                <div className="flex items-center">
                  <SafeIcon icon={FiUser} className="h-8 w-8 text-indigo-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">個人</p>
                    <p className="text-2xl font-semibold text-gray-900">{displayStats.total}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 企業會員 - 在企業分頁顯示在第一位 */}
            {memberTypeTab === 'corporate' && (
              <div 
                className={`bg-white p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-all ${
                  activeFilter === 'all' ? 'ring-2 ring-blue-500 shadow-lg' : ''
                }`}
                onClick={() => {
                  setActiveFilter('all');
                  setSearchTerm('');
                }}
              >
                <div className="flex items-center">
                  <SafeIcon icon={FiBriefcase} className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">企業</p>
                    <p className="text-2xl font-semibold text-gray-900">{displayStats.total}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 個人會員 - 只在全部分頁顯示 */}
            {memberTypeTab === 'all' && (
              <div 
                className={`bg-white p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-all ${
                  activeFilter === 'individual' ? 'ring-2 ring-blue-500 shadow-lg' : ''
                }`}
                onClick={() => {
                  setActiveFilter(activeFilter === 'individual' ? 'all' : 'individual');
                  setSearchTerm('');
                }}
              >
                <div className="flex items-center">
                  <SafeIcon icon={FiUser} className="h-8 w-8 text-indigo-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">個人</p>
                    <p className="text-2xl font-semibold text-gray-900">{displayStats.individual}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 企業會員 - 只在全部分頁顯示 */}
            {memberTypeTab === 'all' && (
              <div 
                className={`bg-white p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-all ${
                  activeFilter === 'corporate' ? 'ring-2 ring-blue-500 shadow-lg' : ''
                }`}
                onClick={() => {
                  setActiveFilter(activeFilter === 'corporate' ? 'all' : 'corporate');
                  setSearchTerm('');
                }}
              >
                <div className="flex items-center">
                  <SafeIcon icon={FiBriefcase} className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">企業</p>
                    <p className="text-2xl font-semibold text-gray-900">{displayStats.corporate}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 非會員 */}
            <div 
              className={`bg-white p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-all ${
                activeFilter === 'non_member' ? 'ring-2 ring-blue-500 shadow-lg' : ''
              }`}
              onClick={() => {
                setActiveFilter(activeFilter === 'non_member' ? 'all' : 'non_member');
                setSearchTerm('');
              }}
            >
              <div className="flex items-center">
                <SafeIcon icon={FiUser} className="h-8 w-8 text-gray-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">非會員</p>
                  <p className="text-2xl font-semibold text-gray-900">{displayStats.nonMember}</p>
                </div>
              </div>
            </div>

            {/* 未啟用會員 */}
            <div 
              className={`bg-white p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-all ${
                activeFilter === 'inactive' ? 'ring-2 ring-blue-500 shadow-lg' : ''
              }`}
              onClick={() => {
                setActiveFilter(activeFilter === 'inactive' ? 'all' : 'inactive');
                setSearchTerm('');
              }}
            >
              <div className="flex items-center">
                <SafeIcon icon={FiClock} className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">未啟用</p>
                  <p className="text-2xl font-semibold text-gray-900">{displayStats.inactive}</p>
                </div>
              </div>
            </div>

            {/* 啟用會員 */}
            <div 
              className={`bg-white p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-all ${
                activeFilter === 'activated' ? 'ring-2 ring-blue-500 shadow-lg' : ''
              }`}
              onClick={() => {
                setActiveFilter(activeFilter === 'activated' ? 'all' : 'activated');
                setSearchTerm('');
              }}
            >
              <div className="flex items-center">
                <SafeIcon icon={FiCheckCircle} className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">啟用</p>
                  <p className="text-2xl font-semibold text-gray-900">{displayStats.active}</p>
                </div>
              </div>
            </div>

            {/* 過期會員 */}
            <div 
              className={`bg-white p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-all ${
                activeFilter === 'expired' ? 'ring-2 ring-blue-500 shadow-lg' : ''
              }`}
              onClick={() => {
                setActiveFilter(activeFilter === 'expired' ? 'all' : 'expired');
                setSearchTerm('');
              }}
            >
              <div className="flex items-center">
                <SafeIcon icon={FiX} className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">過期</p>
                  <p className="text-2xl font-semibold text-gray-900">{displayStats.expired}</p>
                </div>
              </div>
            </div>

            {/* 取消會員 */}
            <div 
              className={`bg-white p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-all ${
                activeFilter === 'cancelled' ? 'ring-2 ring-blue-500 shadow-lg' : ''
              }`}
              onClick={() => {
                setActiveFilter(activeFilter === 'cancelled' ? 'all' : 'cancelled');
                setSearchTerm('');
              }}
            >
              <div className="flex items-center">
                <SafeIcon icon={FiX} className="h-8 w-8 text-gray-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">取消</p>
                  <p className="text-2xl font-semibold text-gray-900">{displayStats.cancelled}</p>
                </div>
              </div>
            </div>

            {/* 測試會員 */}
            <div 
              className={`bg-white p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-all ${
                activeFilter === 'test' ? 'ring-2 ring-blue-500 shadow-lg' : ''
              }`}
              onClick={() => {
                setActiveFilter(activeFilter === 'test' ? 'all' : 'test');
                setSearchTerm('');
              }}
            >
              <div className="flex items-center">
                <SafeIcon icon={FiUser} className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">測試</p>
                  <p className="text-2xl font-semibold text-gray-900">{displayStats.test}</p>
                </div>
              </div>
            </div>
          </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 space-y-4"
      >
        {/* Search and Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            <input
              type="text"
              placeholder="搜尋會員姓名、信箱或方案..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <SafeIcon icon={FiUserPlus} />
            <span>新增會員</span>
          </button>
        </div>

      </motion.div>


      {/* Members Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900 w-48">會員資訊</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 w-40">會員卡方案</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">會員狀態</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">購買日期</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">兌換期限</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">開始日期</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">結束日期</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">金額</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => {
                  const StatusIcon = getStatusIcon(member.status);
                  return (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      {/* 會員資訊 */}
                      <td className="py-4 px-3 w-48">
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 rounded-full ${member.plan_type === 'corporate' ? 'bg-purple-500' : 'bg-blue-500'} flex items-center justify-center flex-shrink-0`}>
                            <SafeIcon 
                              icon={member.plan_type === 'corporate' ? FiBriefcase : FiUser} 
                              className="text-white text-xs" 
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="h-9 flex flex-col justify-center space-y-1">
                              {editingMemberId === member.id ? (
                                <>
                                  <input
                                    type="text"
                                    value={editingMember?.user_name || ''}
                                    onChange={(e) => setEditingMember(prev => prev ? {...prev, user_name: e.target.value} : null)}
                                    className="w-[140px] px-0 py-0 text-sm border-0 border-b border-gray-300 rounded-none bg-transparent focus:ring-0 focus:border-blue-500 h-6 font-medium text-gray-900"
                                    placeholder="姓名"
                                  />
                                  <input
                                    type="email"
                                    value={editingMember?.user_email || ''}
                                    onChange={(e) => setEditingMember(prev => prev ? {...prev, user_email: e.target.value} : null)}
                                    className="w-[140px] px-0 py-0 text-sm border-0 border-b border-gray-300 rounded-none bg-transparent focus:ring-0 focus:border-blue-500 h-6 text-gray-600"
                                    placeholder="電子郵件"
                                  />
                                </>
                              ) : (
                                <div>
                                  <div className={`font-medium text-sm truncate h-5 flex items-center ${member.plan_type === 'corporate' ? 'text-purple-600' : 'text-gray-900'}`}>
                                    {member.user_name}
                                    {member.plan_type === 'corporate' && (
                                      <span className="ml-1 text-xs text-purple-500 bg-purple-50 px-1 py-0.5 rounded text-nowrap">
                                        {member.company_name || '企業會員'}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-600 truncate h-4 flex items-center">{member.user_email}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 會員卡方案 */}
                      <td className="py-4 px-4 w-40">
                        <div className="h-9 flex flex-col justify-center">
                          {editingMemberId === member.id ? (
                            <select
                              value={editingMember?.plan_id || member.plan_id || 0}
                              onChange={(e) => handlePlanChange(parseInt(e.target.value))}
                              className="w-[140px] px-0 py-0 text-sm border-0 border-b border-gray-300 rounded-none bg-transparent focus:ring-0 focus:border-blue-500 h-6 font-medium text-gray-900"
                            >
                              {member.id <= 0 && (
                                <option value={0}>選擇會員卡方案</option>
                              )}
                              {memberCardPlans
                                .filter(plan => plan.status === 'PUBLISHED')
                                .map(plan => (
                                  <option key={plan.id} value={plan.id}>
                                    {plan.title}
                                  </option>
                                ))
                              }
                            </select>
                          ) : (
                            <div>
                              <div className="font-medium text-gray-900 text-sm h-5 flex items-center truncate">{member.plan_title}</div>
                              <div className="text-xs text-gray-600 h-4 flex items-center">
                                {member.id > 0 ? `${member.plan_type === 'individual' ? '個人' : '企業'} · ${member.duration_type === 'season' ? '季度' : '年度'}` : '無會員卡方案'}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 會員狀態 */}
                      <td className="py-4 px-4">
                        <div className="h-9 flex items-center">
                          {editingMemberId === member.id ? (
                            <select
                              value={editingMember?.status || member.status}
                              onChange={(e) => setEditingMember(prev => prev ? {...prev, status: e.target.value as Membership['status']} : null)}
                              className="w-[140px] px-0 py-0 text-sm border-0 border-b border-gray-300 rounded-none bg-transparent focus:ring-0 focus:border-blue-500 h-6 font-medium text-gray-900"
                            >
                              <option value="non_member" className="text-gray-700">非會員</option>
                              <option value="inactive" className="text-orange-700">未啟用</option>
                              <option value="activated" className="text-green-700">啟用</option>
                              <option value="expired" className="text-red-700">過期</option>
                              <option value="cancelled" className="text-gray-700">取消</option>
                              <option value="test" className="text-blue-700">測試</option>
                            </select>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <>
                                <SafeIcon icon={StatusIcon} className={`text-sm ${getStatusColor(member.status)}`} />
                                <span className={`text-sm font-medium ${getStatusColor(member.status)}`}>
                                  {getStatusText(member.status)}
                                </span>
                                {member.id > 0 && member.isExpiringSoon && (
                                  <span className="text-xs text-orange-600 bg-orange-50 px-1 py-0.5 rounded">
                                    即將到期
                                  </span>
                                )}
                              </>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 購買日期 */}
                      <td className="py-4 px-4">
                        <div className="h-5 flex items-center">
                          {editingMemberId === member.id ? (
                            <input
                              type="date"
                              value={formatDateForInput(editingMember?.purchase_date)}
                              onChange={(e) => setEditingMember(prev => prev ? {...prev, purchase_date: e.target.value} : null)}
                              className="w-[130px] px-0 py-0 text-sm border-0 border-b border-gray-300 rounded-none bg-transparent focus:ring-0 focus:border-blue-500 h-6 text-gray-900 appearance-none cursor-pointer"
                              style={{ colorScheme: 'light' }}
                            />
                          ) : (
                            <div className="text-sm text-gray-900 h-5 flex items-center">
                              {member.purchase_date ? formatDate(member.purchase_date) : '-'}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 兌換期限 */}
                      <td className="py-4 px-4">
                        <div className="h-9 flex flex-col justify-center">
                          {editingMemberId === member.id ? (
                            <input
                              type="date"
                              value={formatDateForInput(editingMember?.activation_deadline)}
                              onChange={(e) => setEditingMember(prev => prev ? {...prev, activation_deadline: e.target.value} : null)}
                              className="w-[130px] px-0 py-0 text-sm border-0 border-b border-gray-300 rounded-none bg-transparent focus:ring-0 focus:border-blue-500 h-6 text-gray-900 appearance-none cursor-pointer"
                              style={{ colorScheme: 'light' }}
                            />
                          ) : (
                            <div className="text-sm">
                              {member.activation_deadline ? (
                                <>
                                  <div className="text-gray-900 h-5 flex items-center">{formatDate(member.activation_deadline)}</div>
                                  {member.status === 'inactive' && member.daysUntilExpiry !== undefined && (
                                    <div className={`text-xs h-4 flex items-center ${member.daysUntilExpiry <= 7 ? 'text-red-600' : 'text-gray-600'}`}>
                                      {member.daysUntilExpiry > 0 ? `${member.daysUntilExpiry} 天內需開啟` : '期限已過'}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <span className="text-gray-400 h-5 flex items-center">-</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 開始日期 */}
                      <td className="py-4 px-4">
                        <div className="h-5 flex items-center">
                          {editingMemberId === member.id ? (
                            <input
                              type="date"
                              value={formatDateForInput(editingMember?.activation_date)}
                              onChange={(e) => setEditingMember(prev => prev ? {...prev, activation_date: e.target.value} : null)}
                              className="w-[130px] px-0 py-0 text-sm border-0 border-b border-gray-300 rounded-none bg-transparent focus:ring-0 focus:border-blue-500 h-6 text-gray-900 appearance-none cursor-pointer"
                              style={{ colorScheme: 'light' }}
                            />
                          ) : (
                            <div className="text-sm text-gray-900 h-5 flex items-center">
                              {member.activation_date ? formatDate(member.activation_date) : '-'}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 到期日期 */}
                      <td className="py-4 px-4">
                        <div className="h-9 flex flex-col justify-center">
                          {editingMemberId === member.id ? (
                            <input
                              type="date"
                              value={formatDateForInput(editingMember?.expiry_date)}
                              onChange={(e) => setEditingMember(prev => prev ? {...prev, expiry_date: e.target.value} : null)}
                              className="w-[130px] px-0 py-0 text-sm border-0 border-b border-gray-300 rounded-none bg-transparent focus:ring-0 focus:border-blue-500 h-6 text-gray-900 appearance-none cursor-pointer"
                              style={{ colorScheme: 'light' }}
                            />
                          ) : (
                            <div className="text-sm">
                              {member.expiry_date ? (
                                <>
                                  <div className="text-gray-900 h-5 flex items-center">{formatDate(member.expiry_date)}</div>
                                  {member.status === 'activated' && member.daysUntilExpiry !== undefined && (
                                    <div className={`text-xs h-4 flex items-center ${member.daysUntilExpiry <= 30 ? 'text-red-600' : 'text-gray-600'}`}>
                                      {member.daysUntilExpiry > 0 ? `${member.daysUntilExpiry} 天後到期` : '已過期'}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <span className="text-gray-400 h-5 flex items-center">-</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 金額 */}
                      <td className="py-4 px-4">
                        <div className="h-9 flex flex-col justify-center">
                          {editingMemberId === member.id ? (
                            <div className="space-y-1">
                              <input
                                type="number"
                                value={editingMember?.amount_paid || 0}
                                onChange={(e) => setEditingMember(prev => prev ? {...prev, amount_paid: parseFloat(e.target.value) || 0} : null)}
                                className="w-[140px] px-0 py-0 text-sm border-0 border-b border-gray-300 rounded-none bg-transparent focus:ring-0 focus:border-blue-500 h-6 font-medium text-gray-900"
                                min="0"
                                step="1"
                              />
                              {member.auto_renewal && (
                                <div className="text-xs text-blue-600 h-4 flex items-center">自動續費</div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <div className="font-medium text-gray-900 h-5 flex items-center">
                                {member.id > 0 ? formatAmount(member.amount_paid || 0) : '-'}
                              </div>
                              {member.auto_renewal && member.id > 0 && (
                                <div className="text-xs text-blue-600 h-4 flex items-center">自動續費</div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 操作 */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1">
                          {editingMemberId === member.id ? (
                            // 編輯模式的按鈕
                            <>
                              <button
                                onClick={() => handleSaveEdit(member.id)}
                                className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-xs"
                              >
                                <SafeIcon icon={FiSave} className="text-xs" />
                                <span>保存</span>
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-xs"
                              >
                                <SafeIcon icon={FiX} className="text-xs" />
                                <span>取消</span>
                              </button>
                            </>
                          ) : (
                            // 正常模式的按鈕
                            <>
                              <button
                                onClick={() => handleEditMember(member)}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="編輯"
                              >
                                <SafeIcon icon={FiEdit2} className="text-sm" />
                              </button>
                              <button
                                onClick={() => handleDeleteMember(member.id, member.user_name)}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="刪除"
                              >
                                <SafeIcon icon={FiTrash2} className="text-sm" />
                              </button>
                              {member.status === 'inactive' && member.id > 0 && (
                                <button
                                  onClick={() => handleActivateMemberCard(member.id)}
                                  className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-xs"
                                >
                                  <SafeIcon icon={FiCheckCircle} className="text-xs" />
                                  <span>開啟</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 px-4 text-center">
                    <SafeIcon icon={FiUsers} className="text-6xl text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm || activeFilter !== 'all' || memberTypeTab !== 'all' 
                        ? '找不到符合條件的會員' 
                        : '暫無會員記錄'}
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm || activeFilter !== 'all' || memberTypeTab !== 'all'
                        ? '請嘗試調整搜尋條件或篩選設定'
                        : '會員購買會員卡後，記錄會顯示在這裡'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddMemberModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">新增會員</h3>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <SafeIcon icon={FiX} className="text-xl" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 企業選擇 - 只在企業分頁顯示 */}
              {memberTypeTab === 'corporate' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    企業 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newMember.company_name || ''}
                    onChange={(e) => setNewMember({...newMember, company_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">請選擇企業</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.name}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
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
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="輸入電子郵件地址"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  會員卡方案 <span className="text-red-500">*</span>
                </label>
                <select
                  value={newMember.plan_id}
                  onChange={(e) => setNewMember({...newMember, plan_id: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {memberCardPlans
                    .filter(plan => {
                      // 根據當前分頁篩選方案類型
                      if (memberTypeTab === 'individual') {
                        return plan.status === 'PUBLISHED' && plan.user_type === 'individual';
                      } else if (memberTypeTab === 'corporate') {
                        return plan.status === 'PUBLISHED' && plan.user_type === 'corporate';
                      } else {
                        return plan.status === 'PUBLISHED';
                      }
                    })
                    .map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.title} ({plan.user_type === 'individual' ? '個人' : '企業'})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto_activation"
                  checked={newMember.auto_activation}
                  onChange={(e) => setNewMember({...newMember, auto_activation: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="auto_activation" className="text-sm text-gray-700">
                  立即開啟會員卡（否則需要手動開啟）
                </label>
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
        </>
      )}
    </div>
  );
};

export default MemberManagementReal;