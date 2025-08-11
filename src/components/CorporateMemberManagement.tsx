'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import { useAuth } from '@/contexts/AuthContext';
import { corporateSubscriptionStore } from '@/lib/corporateSubscriptionStore';
import { corporateMemberStore } from '@/lib/corporateMemberStore';
import { corporateStore } from '@/lib/corporateStore';
import { CorporateSubscription, CorporateMember, LearningRecord, ReservationRecord } from '@/types/corporateSubscription';
import { Company } from '@/data/corporateData';
import { memberCardPlans } from '@/data/member_card_plans';

const {
  FiUsers, FiUserCheck, FiUserPlus, FiSearch, FiPlus,
  FiX, FiClock, FiCheckCircle, FiChevronDown, FiChevronRight,
  FiEye, FiBook, FiCalendar, FiEdit2, FiTrash2, FiPlay, FiPause, FiSave, FiBriefcase, FiUser
} = FiIcons;

interface CorporateData extends Company {
  subscriptions: CorporateSubscription[];
  members: CorporateMember[];
}

const CorporateMemberManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [corporateData, setCorporateData] = useState<CorporateData[]>([]);
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string | number>>(new Set());
  const [expandedSubscriptions, setExpandedSubscriptions] = useState<Set<number>>(new Set());
  const [selectedMember, setSelectedMember] = useState<CorporateMember | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showMemberDetailModal, setShowMemberDetailModal] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<number | null>(null);
  
  
  
  // 編輯功能
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [editingMember, setEditingMember] = useState<CorporateMember | null>(null);
  
  // 企業編輯功能
  const [editingCompanyId, setEditingCompanyId] = useState<string | number | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showCompanyDetailModal, setShowCompanyDetailModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  
  // 企業訂閱編輯功能
  const [editingSubscriptionId, setEditingSubscriptionId] = useState<number | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<CorporateSubscription | null>(null);
  const [showAddSubscriptionModal, setShowAddSubscriptionModal] = useState(false);
  const [showSubscriptionDetailModal, setShowSubscriptionDetailModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<CorporateSubscription | null>(null);
  const [selectedCompanyForSubscription, setSelectedCompanyForSubscription] = useState<Company | null>(null);
  
  // 新增會員表單
  const [newMember, setNewMember] = useState({
    user_name: '',
    user_email: ''
  });
  
  // 新增企業表單
  const [newCompany, setNewCompany] = useState<Omit<Company, 'id' | 'createdAt'>>({
    name: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    industry: '',
    employeeCount: '',
    status: 'activated'
  });
  
  // 新增訂閱表單
  const [newSubscription, setNewSubscription] = useState({
    corp_id: '',
    plan_id: 0,
    seats_total: 10,
    amount_paid: 0,
    auto_renewal: false
  });
  
  // 統計數據
  const [statistics, setStatistics] = useState({
    totalCompanies: 0,
    activePlans: 0, // 有效的方案
    totalMembers: 0,
    inactiveMembers: 0,
    activatedMembers: 0,
    expiredMembers: 0,
    cancelledMembers: 0,
    testMembers: 0
  });
  
  // 篩選狀態
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // 載入企業會員數據
  const loadCorporateData = useCallback(async () => {
    try {
      setLoading(true);
      const companies = await corporateStore.getAllCompanies();
      const subscriptions = await corporateSubscriptionStore.getAllSubscriptions();
      const members = await corporateMemberStore.getAllMembers();
      
      // 過濾企業數據 - 企業聯絡人只能看到自己所屬的企業
      let filteredCompanies = companies;
      console.log('Current user:', user);
      console.log('User roles:', user?.roles);
      console.log('User corp_id:', user?.corp_id);
      if (user?.roles.includes('CORPORATE_CONTACT') && (user as { corp_id?: string | number }).corp_id) {
        console.log('Filtering companies for CORPORATE_CONTACT user');
        console.log('🔍 CORPORATE DEBUG:');
        console.log('- User corp_id:', (user as { corp_id?: string | number }).corp_id, '(type:', typeof (user as { corp_id?: string | number }).corp_id, ')');
        console.log('- Available companies:', companies.map(c => ({ id: c.id, name: c.name, type: typeof c.id })));
        
        filteredCompanies = companies.filter(company => {
          const match = company.id === (user as { corp_id?: string | number }).corp_id;
          console.log(`- Match check: "${company.id}" === "${(user as { corp_id?: string | number }).corp_id}" = ${match}`);
          return match;
        });
        
        console.log('✅ Filtered companies result:', filteredCompanies.length, 'companies');
        if (filteredCompanies.length > 0) {
          console.log('- Company found:', filteredCompanies[0].name);
        } else {
          console.log('❌ No companies found for corp_id:', (user as { corp_id?: string | number }).corp_id);
        }
      } else if (user?.roles.includes('CORPORATE_CONTACT')) {
        console.log('CORPORATE_CONTACT user but no corp_id found');
      }
      
      // 組合企業數據
      const combinedData: CorporateData[] = filteredCompanies.map(company => {
        const companySubscriptions = subscriptions.filter(sub => sub.corp_id === company.id);
        const companyMembers = members.filter(member => member.corp_id === company.id);
        
        return {
          ...company,
          subscriptions: companySubscriptions,
          members: companyMembers
        };
      });
      
      setCorporateData(combinedData);
      
      // 計算統計數據 - 企業聯絡人只看自己公司的數據
      let filteredSubscriptions = subscriptions;
      let filteredMembers = members;
      
      if (user?.roles.includes('CORPORATE_CONTACT') && (user as { corp_id?: string | number }).corp_id) {
        // 企業聯絡人只看自己公司的訂閱和會員
        const userCorpId = (user as { corp_id?: string | number }).corp_id;
        filteredSubscriptions = subscriptions.filter(sub => sub.corp_id === userCorpId);
        filteredMembers = members.filter(member => member.corp_id === userCorpId);
        console.log('🔍 STATS DEBUG: Filtered for corp_id', userCorpId);
        console.log('- Subscriptions:', filteredSubscriptions.length, '/', subscriptions.length);
        console.log('- Members:', filteredMembers.length, '/', members.length);
      }
      
      const activePlans = filteredSubscriptions.filter(sub => sub.status === 'activated').length;
      const cancelledMembers = filteredMembers.filter(m => m.card_status === 'cancelled').length;
      const testMembers = filteredMembers.filter(m => m.card_status === 'test').length;
      const activatedMembers = filteredMembers.filter(m => m.card_status === 'activated').length;
      const inactiveMembers = filteredMembers.filter(m => m.card_status === 'inactive').length;
      const expiredMembers = filteredMembers.filter(m => m.card_status === 'expired').length;
      
      setStatistics({
        totalCompanies: filteredCompanies.length, // 使用已過濾的公司數量
        activePlans,
        totalMembers: filteredMembers.length,
        inactiveMembers,
        activatedMembers,
        expiredMembers,
        cancelledMembers,
        testMembers
      });
      
    } catch (error) {
      console.error('載入企業會員數據失敗:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCorporateData();
  }, [loadCorporateData]);

  // 獲取企業方案列表
  const getCorporatePlans = () => {
    return memberCardPlans.filter(plan => plan.user_type === 'corporate' && plan.status === 'PUBLISHED');
  };

  // 處理卡片篩選
  const handleFilterClick = (filterType: string) => {
    if (activeFilter === filterType) {
      setActiveFilter(null); // 取消篩選
    } else {
      setActiveFilter(filterType); // 設置新篩選
    }
  };

  // 過濾企業數據
  const getFilteredCorporateData = (): CorporateData[] => {
    let filteredData = corporateData;
    
    // 應用搜索篩選
    if (searchTerm) {
      filteredData = filteredData.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.members.some(member => 
        member.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.user_email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    }
    
    // 應用狀態篩選
    if (activeFilter) {
      if (activeFilter === 'plans') {
        // 方案篩選：只顯示有啟用訂閱的企業，並且只顯示啟用的訂閱
        filteredData = filteredData
          .map(company => ({
            ...company,
            subscriptions: company.subscriptions.filter(sub => sub.status === 'activated')
          }))
          .filter(company => company.subscriptions.length > 0);
      } else {
        filteredData = filteredData.map(company => {
          let filteredMembers = company.members;
          
          switch (activeFilter) {
            case 'companies':
              // 顯示所有企業，不篩選會員
              break;
            case 'inactive':
              filteredMembers = company.members.filter(m => m.card_status === 'inactive');
              break;
            case 'activated':
              filteredMembers = company.members.filter(m => m.card_status === 'activated');
              break;
            case 'expired':
              filteredMembers = company.members.filter(m => m.card_status === 'expired');
              break;
            case 'cancelled':
              filteredMembers = company.members.filter(m => m.card_status === 'cancelled');
              break;
            case 'test':
              filteredMembers = company.members.filter(m => m.card_status === 'test');
              break;
            default:
              break;
          }
          
          return {
            ...company,
            members: filteredMembers
          };
        });
        
        // 過濾掉沒有匹配會員的企業（除了企業篩選）
        if (activeFilter !== 'companies') {
          filteredData = filteredData.filter(company => company.members.length > 0);
        }
      }
    }
    
    return filteredData;
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
        corp_id: subscription.corp_id,
        company_name: subscription.company_name || '',
        plan_title: subscription.plan_title || '',
        duration_type: subscription.duration_type || 'annual',
        duration_days: subscription.duration_days || 365,
        purchase_date: subscription.purchase_date,
        redemption_deadline: subscription.activation_deadline,
        card_status: 'inactive'  // 新增會員預設為未啟用狀態
      });

      // 不立即占用席次，等會員啟用後才計算席次使用數

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
      if (member && member.card_status === 'activated') {
        // 只有啟用的會員被刪除時才需要更新席次使用數
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

  // ===== 企業 CRUD 功能 =====
  
  // 新增企業
  const handleCreateCompany = async () => {
    try {
      // 驗證必填欄位
      if (!newCompany.name.trim() || !newCompany.contactName.trim() || !newCompany.contactEmail.trim()) {
        alert('企業名稱、聯絡人姓名和電子郵件不能為空');
        return;
      }

      // 驗證電子郵件格式
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(newCompany.contactEmail)) {
        alert('電子郵件格式不正確');
        return;
      }

      await corporateStore.createCompany(newCompany);
      
      // 重新載入數據
      await loadCorporateData();
      
      // 重置表單
      setNewCompany({
        name: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        industry: '',
        employeeCount: '',
        status: 'activated'
      });
      
      setShowAddCompanyModal(false);
      alert('✅ 企業新增成功！');
    } catch (error) {
      console.error('新增企業失敗:', error);
      alert('❌ 新增企業失敗：' + (error as Error).message);
    }
  };

  // 編輯企業
  const handleEditCompany = (company: Company) => {
    setEditingCompanyId(company.id);
    setEditingCompany({ ...company });
  };

  // 保存企業編輯
  const handleSaveCompany = async () => {
    if (!editingCompany) return;

    try {
      // 驗證必填欄位
      if (!editingCompany.name.trim() || !editingCompany.contactName.trim() || !editingCompany.contactEmail.trim()) {
        alert('企業名稱、聯絡人姓名和電子郵件不能為空');
        return;
      }

      // 驗證電子郵件格式
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(editingCompany.contactEmail)) {
        alert('電子郵件格式不正確');
        return;
      }

      await corporateStore.updateCompany(editingCompany.id, editingCompany);
      setEditingCompanyId(null);
      setEditingCompany(null);
      
      // 重新載入數據
      await loadCorporateData();
      alert('✅ 企業資料更新成功！');
    } catch (error) {
      console.error('更新企業失敗:', error);
      alert('❌ 更新企業失敗：' + (error as Error).message);
    }
  };

  // 取消企業編輯
  const handleCancelCompanyEdit = () => {
    setEditingCompanyId(null);
    setEditingCompany(null);
  };

  // 刪除企業
  const handleDeleteCompany = async (companyId: string | number, companyName: string) => {
    if (!confirm(`確定要刪除企業「${companyName}」嗎？這將會同時刪除該企業的所有訂閱和會員資料。`)) {
      return;
    }

    try {
      await corporateStore.deleteCompany(companyId);
      
      // 重新載入數據
      await loadCorporateData();
      alert('✅ 企業刪除成功！');
    } catch (error) {
      console.error('刪除企業失敗:', error);
      alert('❌ 刪除企業失敗：' + (error as Error).message);
    }
  };

  // 查看企業詳情
  const handleViewCompanyDetail = (company: Company) => {
    setSelectedCompany(company);
    setShowCompanyDetailModal(true);
  };

  // ===== 企業訂閱 CRUD 功能 =====
  
  // 新增企業訂閱
  const handleCreateSubscription = async () => {
    try {
      // 驗證必填欄位
      if (!newSubscription.corp_id || !newSubscription.plan_id || newSubscription.seats_total <= 0) {
        alert('請選擇企業、方案並設定席次數');
        return;
      }

      if (newSubscription.amount_paid <= 0) {
        alert('金額必須大於 0');
        return;
      }

      await corporateSubscriptionStore.createSubscription({
        corp_id: newSubscription.corp_id,
        plan_id: newSubscription.plan_id,
        seats_total: newSubscription.seats_total,
        amount_paid: newSubscription.amount_paid,
        auto_renewal: newSubscription.auto_renewal
      });
      
      // 重新載入數據
      await loadCorporateData();
      
      // 重置表單
      setNewSubscription({
        corp_id: '',
        plan_id: 0,
        seats_total: 10,
        amount_paid: 0,
        auto_renewal: false
      });
      
      setShowAddSubscriptionModal(false);
      alert('✅ 企業訂閱新增成功！');
    } catch (error) {
      console.error('新增企業訂閱失敗:', error);
      alert('❌ 新增企業訂閱失敗：' + (error as Error).message);
    }
  };

  // 編輯企業訂閱
  const handleEditSubscription = (subscription: CorporateSubscription) => {
    setEditingSubscriptionId(subscription.id);
    setEditingSubscription({ ...subscription });
  };

  // 保存企業訂閱編輯
  const handleSaveSubscription = async () => {
    if (!editingSubscription) return;

    try {
      // 更新所有可編輯的欄位
      await corporateSubscriptionStore.updateSubscription(editingSubscription.id, {
        seats_used: editingSubscription.seats_used,
        seats_available: editingSubscription.seats_total - editingSubscription.seats_used,
        seats_total: editingSubscription.seats_total,
        amount_paid: editingSubscription.amount_paid,
        auto_renewal: editingSubscription.auto_renewal,
        status: editingSubscription.status,
        plan_id: editingSubscription.plan_id,
        plan_title: editingSubscription.plan_title,
        duration_type: editingSubscription.duration_type,
        duration_days: editingSubscription.duration_days
      });
      
      setEditingSubscriptionId(null);
      setEditingSubscription(null);
      
      // 重新載入數據
      await loadCorporateData();
      alert('✅ 企業訂閱更新成功！');
    } catch (error) {
      console.error('更新企業訂閱失敗:', error);
      alert('❌ 更新企業訂閱失敗：' + (error as Error).message);
    }
  };

  // 取消企業訂閱編輯
  const handleCancelSubscriptionEdit = () => {
    setEditingSubscriptionId(null);
    setEditingSubscription(null);
  };

  // 刪除企業訂閱
  const handleDeleteSubscription = async (subscriptionId: number, planTitle: string) => {
    if (!confirm(`確定要刪除訂閱「${planTitle}」嗎？這將會同時刪除該訂閱下的所有會員資料。`)) {
      return;
    }

    try {
      // 需要先在 corporateSubscriptionStore 中添加 deleteSubscription 方法
      // 這裡先做基本的刪除操作，待後續完善
      alert('刪除功能尚未完成，請稍後再試');
      
      console.log('將刪除訂閱:', subscriptionId);
      // TODO: 實作刪除功能
    } catch (error) {
      console.error('刪除企業訂閱失敗:', error);
      alert('❌ 刪除企業訂閱失敗：' + (error as Error).message);
    }
  };

  // 查看企業訂閱詳情
  const handleViewSubscriptionDetail = (subscription: CorporateSubscription) => {
    setSelectedSubscription(subscription);
    setShowSubscriptionDetailModal(true);
  };

  // 為企業新增訂閱
  const handleAddSubscriptionForCompany = (company: Company) => {
    setSelectedCompanyForSubscription(company);
    setNewSubscription({
      corp_id: String(company.id),
      plan_id: 0,
      seats_total: 10,
      amount_paid: 0,
      auto_renewal: false
    });
    setShowAddSubscriptionModal(true);
  };

  // 啟用/停用會員功能
  const handleToggleMemberStatus = async (member: CorporateMember) => {
    try {
      const subscription = corporateData
        .flatMap(company => company.subscriptions)
        .find(sub => sub.id === member.subscription_id);
        
      if (!subscription) {
        alert('找不到對應的企業訂閱');
        return;
      }

      const wasActivated = member.card_status === 'activated';
      let willBeActivated = false;

      if (member.card_status === 'non_member' || member.card_status === 'inactive') {
        // 檢查席次是否已滿
        if (!wasActivated && subscription.seats_used >= subscription.seats_total) {
          alert('席次已滿，無法啟用會員');
          return;
        }
        // 啟用會員卡
        await corporateMemberStore.activateMemberCard(member.id);
        willBeActivated = true;
        alert('✅ 會員卡已成功啟用！');
      } else if (member.card_status === 'activated') {
        // 停用會員卡（設為暫停）
        await corporateMemberStore.updateMember(member.id, {
          card_status: 'expired'
        });
        willBeActivated = false;
        alert('✅ 會員卡已暫停！');
      } else if (member.card_status === 'expired') {
        // 檢查席次是否已滿
        if (subscription.seats_used >= subscription.seats_total) {
          alert('席次已滿，無法重新啟用會員');
          return;
        }
        // 重新啟用已過期的會員卡
        await corporateMemberStore.activateMemberCard(member.id);
        willBeActivated = true;
        alert('✅ 會員卡已重新啟用！');
      }

      // 更新席次使用數
      if (wasActivated && !willBeActivated) {
        // 從啟用變為未啟用，席次使用數減1
        await corporateSubscriptionStore.updateSubscription(subscription.id, {
          seats_used: Math.max(0, subscription.seats_used - 1),
          seats_available: Math.min(subscription.seats_total, subscription.seats_available + 1)
        });
      } else if (!wasActivated && willBeActivated) {
        // 從未啟用變為啟用，席次使用數加1
        await corporateSubscriptionStore.updateSubscription(subscription.id, {
          seats_used: subscription.seats_used + 1,
          seats_available: subscription.seats_available - 1
        });
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
      case 'inactive': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'activated': return 'text-green-700 bg-green-50 border-green-200';
      case 'expired': return 'text-red-700 bg-red-50 border-red-200';
      case 'cancelled': return 'text-gray-700 bg-gray-50 border-gray-200';
      case 'test': return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'non_member': return 'text-gray-700 bg-gray-50 border-gray-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'non_member': return '非會員';
      case 'inactive': return '未啟用';
      case 'activated': return '啟用';
      case 'expired': return '過期';
      case 'cancelled': return '取消';
      case 'test': return '測試';
      default: return status;
    }
  };

  // 企業狀態顏色和圖標
  const getCompanyStatusColor = (status: string) => {
    switch (status) {
      case 'inactive': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'activated': return 'text-green-700 bg-green-50 border-green-200';
      case 'expired': return 'text-red-700 bg-red-50 border-red-200';
      case 'cancelled': return 'text-gray-700 bg-gray-50 border-gray-200';
      case 'test': return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'non_member': return 'text-gray-700 bg-gray-50 border-gray-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getCompanyStatusText = (status: string) => {
    switch (status) {
      case 'non_member': return '非會員';
      case 'inactive': return '未啟用';
      case 'activated': return '啟用';
      case 'expired': return '過期';
      case 'cancelled': return '取消';
      case 'test': return '測試';
      default: return status;
    }
  };

  // 企業訂閱狀態顏色
  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'inactive': return 'bg-blue-100 text-blue-700';
      case 'activated': return 'bg-green-100 text-green-700';
      case 'expired': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      case 'test': return 'bg-purple-100 text-purple-700';
      case 'non_member': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
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
      {/* 企業統計儀表板 - 與全部分頁相同格式 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6"
      >
        {/* 企業 */}
        <div 
          className={`bg-white p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-all ${
            activeFilter === 'companies' ? 'ring-2 ring-blue-500 shadow-lg' : ''
          }`}
          onClick={() => handleFilterClick('companies')}
        >
          <div className="flex items-center">
            <SafeIcon icon={FiUsers} className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">企業</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.totalCompanies}</p>
            </div>
          </div>
        </div>

        {/* 方案 */}
        <div 
          className={`bg-white p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-all ${
            activeFilter === 'plans' ? 'ring-2 ring-blue-500 shadow-lg' : ''
          }`}
          onClick={() => handleFilterClick('plans')}
        >
          <div className="flex items-center">
            <SafeIcon icon={FiBriefcase} className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">方案</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.activePlans}</p>
            </div>
          </div>
        </div>

        {/* 會員 */}
        <div 
          className={`bg-white p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-all ${
            activeFilter === 'members' ? 'ring-2 ring-blue-500 shadow-lg' : ''
          }`}
          onClick={() => handleFilterClick('members')}
        >
          <div className="flex items-center">
            <SafeIcon icon={FiUserCheck} className="h-8 w-8 text-indigo-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">會員</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.totalMembers}</p>
            </div>
          </div>
        </div>

        {/* 未啟用 */}
        <div 
          className={`bg-white p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-all ${
            activeFilter === 'inactive' ? 'ring-2 ring-blue-500 shadow-lg' : ''
          }`}
          onClick={() => handleFilterClick('inactive')}
        >
          <div className="flex items-center">
            <SafeIcon icon={FiClock} className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">未啟用</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.inactiveMembers}</p>
            </div>
          </div>
        </div>

        {/* 啟用 */}
        <div 
          className={`bg-white p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-all ${
            activeFilter === 'activated' ? 'ring-2 ring-blue-500 shadow-lg' : ''
          }`}
          onClick={() => handleFilterClick('activated')}
        >
          <div className="flex items-center">
            <SafeIcon icon={FiCheckCircle} className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">啟用</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.activatedMembers}</p>
            </div>
          </div>
        </div>

        {/* 過期 */}
        <div 
          className={`bg-white p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-all ${
            activeFilter === 'expired' ? 'ring-2 ring-blue-500 shadow-lg' : ''
          }`}
          onClick={() => handleFilterClick('expired')}
        >
          <div className="flex items-center">
            <SafeIcon icon={FiX} className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">過期</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.expiredMembers}</p>
            </div>
          </div>
        </div>

        {/* 取消 */}
        <div 
          className={`bg-white p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-all ${
            activeFilter === 'cancelled' ? 'ring-2 ring-blue-500 shadow-lg' : ''
          }`}
          onClick={() => handleFilterClick('cancelled')}
        >
          <div className="flex items-center">
            <SafeIcon icon={FiX} className="h-8 w-8 text-gray-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">取消</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.cancelledMembers}</p>
            </div>
          </div>
        </div>

        {/* 測試 */}
        <div 
          className={`bg-white p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-all ${
            activeFilter === 'test' ? 'ring-2 ring-blue-500 shadow-lg' : ''
          }`}
          onClick={() => handleFilterClick('test')}
        >
          <div className="flex items-center">
            <SafeIcon icon={FiUser} className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">測試</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.testMembers}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 搜尋控制項與視圖切換 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
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
            {activeFilter && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">篩選：</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {activeFilter === 'companies' ? '企業' :
                   activeFilter === 'plans' ? '方案' :
                   activeFilter === 'members' ? '會員' :
                   activeFilter === 'inactive' ? '未啟用' :
                   activeFilter === 'activated' ? '啟用' :
                   activeFilter === 'expired' ? '過期' :
                   activeFilter === 'cancelled' ? '取消' :
                   activeFilter === 'test' ? '測試' : activeFilter}
                </span>
                <button
                  onClick={() => setActiveFilter(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="清除篩選"
                >
                  <SafeIcon icon={FiX} className="text-sm" />
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowAddCompanyModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="text-sm" />
            <span>新增企業</span>
          </button>
          
          {/* 視圖模式切換 */}
        </div>
      </motion.div>

      {/* 企業組織架構 */}
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
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <SafeIcon 
                      icon={expandedCompanies.has(company.id) ? FiChevronDown : FiChevronRight}
                      className="text-gray-400 cursor-pointer"
                      onClick={() => toggleCompanyExpansion(company.id)}
                    />
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <SafeIcon icon={FiUsers} className="text-white" />
                    </div>
                    <div className="flex-1">
                      {editingCompanyId === company.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editingCompany?.name || ''}
                            onChange={(e) => setEditingCompany(prev => prev ? {...prev, name: e.target.value} : null)}
                            className="w-[200px] px-2 py-1 border border-gray-300 rounded text-lg font-semibold bg-white"
                            placeholder="企業名稱"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={editingCompany?.contactName || ''}
                              onChange={(e) => setEditingCompany(prev => prev ? {...prev, contactName: e.target.value} : null)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                              placeholder="聯絡人姓名"
                            />
                            <input
                              type="email"
                              value={editingCompany?.contactEmail || ''}
                              onChange={(e) => setEditingCompany(prev => prev ? {...prev, contactEmail: e.target.value} : null)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                              placeholder="聯絡人信箱"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={editingCompany?.contactPhone || ''}
                              onChange={(e) => setEditingCompany(prev => prev ? {...prev, contactPhone: e.target.value} : null)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                              placeholder="聯絡電話"
                            />
                            <select
                              value={editingCompany?.industry || ''}
                              onChange={(e) => setEditingCompany(prev => prev ? {...prev, industry: e.target.value} : null)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                            >
                              <option value="科技業">科技業</option>
                              <option value="金融服務">金融服務</option>
                              <option value="製造業">製造業</option>
                              <option value="零售業">零售業</option>
                              <option value="教育業">教育業</option>
                              <option value="醫療業">醫療業</option>
                              <option value="其他">其他</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            <select
                              value={editingCompany?.status || ''}
                              onChange={(e) => setEditingCompany(prev => prev ? {...prev, status: e.target.value as 'non_member' | 'activated' | 'expired' | 'test'} : null)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                            >
                              <option value="non_member">非會員</option>
                              <option value="inactive">未啟用</option>
                              <option value="activated">啟用</option>
                              <option value="expired">過期</option>
                              <option value="test">測試</option>
                            </select>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCompanyStatusColor(company.status)}`}>
                              {getCompanyStatusText(company.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {company.contactName} • {company.contactEmail} • {company.industry}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right text-sm text-gray-500">
                      訂閱: {company.subscriptions.length} | 會員: {company.members.length}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddSubscriptionForCompany(company);
                      }}
                      className="flex items-center space-x-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors text-xs"
                      title="為此企業新增訂閱"
                    >
                      <SafeIcon icon={FiPlus} className="text-xs" />
                      <span>新增訂閱</span>
                    </button>
                    {editingCompanyId === company.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveCompany}
                          className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-xs"
                        >
                          <SafeIcon icon={FiSave} className="text-xs" />
                          <span>保存</span>
                        </button>
                        <button
                          onClick={handleCancelCompanyEdit}
                          className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-xs"
                        >
                          <SafeIcon icon={FiX} className="text-xs" />
                          <span>取消</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleViewCompanyDetail(company)}
                          title="查看企業詳情"
                          className="p-1 text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded"
                        >
                          <SafeIcon icon={FiEye} className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleEditCompany(company)}
                          title="編輯企業資料"
                          className="p-1 text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded"
                        >
                          <SafeIcon icon={FiEdit2} className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDeleteCompany(company.id, company.name)}
                          title="刪除企業"
                          className="p-1 text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 rounded"
                        >
                          <SafeIcon icon={FiTrash2} className="text-sm" />
                        </button>
                      </div>
                    )}
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
                                  <span className={`text-xs px-2 py-1 rounded-full ${getSubscriptionStatusColor(subscription.status)}`}>
                                    {subscription.status === 'activated' ? '啟用' :
                                     subscription.status === 'inactive' ? '未啟用' :
                                     subscription.status === 'expired' ? '過期' : 
                                     subscription.status === 'cancelled' ? '取消' :
                                     subscription.status === 'test' ? '測試' : subscription.status}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-600">
                                    席次: {editingSubscriptionId === subscription.id && editingSubscription ? 
                                      `${editingSubscription.seats_used}/${editingSubscription.seats_total}` : 
                                      `${subscription.seats_used}/${subscription.seats_total}`}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedSubscriptionId(subscription.id);
                                      setShowAddMemberModal(true);
                                    }}
                                    className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs"
                                    title="為此訂閱新增會員"
                                  >
                                    <SafeIcon icon={FiUserPlus} className="text-xs" />
                                    <span>新增會員</span>
                                  </button>
                                  {editingSubscriptionId === subscription.id ? (
                                    <div className="flex space-x-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSaveSubscription();
                                        }}
                                        className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-xs"
                                      >
                                        <SafeIcon icon={FiSave} className="text-xs" />
                                        <span>保存</span>
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCancelSubscriptionEdit();
                                        }}
                                        className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-xs"
                                      >
                                        <SafeIcon icon={FiX} className="text-xs" />
                                        <span>取消</span>
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex space-x-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleViewSubscriptionDetail(subscription);
                                        }}
                                        title="查看訂閱詳情"
                                        className="p-1 text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded"
                                      >
                                        <SafeIcon icon={FiEye} className="text-xs" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditSubscription(subscription);
                                        }}
                                        title="編輯訂閱"
                                        className="p-1 text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded"
                                      >
                                        <SafeIcon icon={FiEdit2} className="text-xs" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteSubscription(subscription.id, subscription.plan_title || '未知方案');
                                        }}
                                        title="刪除訂閱"
                                        className="p-1 text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 rounded"
                                      >
                                        <SafeIcon icon={FiTrash2} className="text-xs" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                                <div>購買日期: {formatDate(subscription.purchase_date)}</div>
                                <div>兌換期限: {formatDate(subscription.activation_deadline)}</div>
                                <div>金額: {formatAmount(subscription.amount_paid)}</div>
                              </div>
                              
                              {/* 編輯訂閱資訊 */}
                              {editingSubscriptionId === subscription.id && editingSubscription && (
                                <div className="mt-3 p-4 bg-blue-50 rounded-lg border">
                                  <h4 className="text-sm font-semibold text-gray-800 mb-3">編輯訂閱資訊</h4>
                                  
                                  {/* 方案選擇 */}
                                  <div className="mb-3">
                                    <label className="text-xs font-medium text-gray-700">企業方案</label>
                                    <select
                                      value={editingSubscription.plan_id}
                                      onChange={(e) => {
                                        const selectedPlan = getCorporatePlans().find(plan => plan.id === parseInt(e.target.value));
                                        if (selectedPlan) {
                                          setEditingSubscription(prev => prev ? {
                                            ...prev,
                                            plan_id: selectedPlan.id,
                                            plan_title: selectedPlan.title,
                                            duration_type: selectedPlan.duration_type,
                                            duration_days: selectedPlan.duration_days,
                                            // 自動更新建議價格（用戶可以後續修改）
                                            amount_paid: parseInt(selectedPlan.sale_price)
                                          } : null);
                                        }
                                      }}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"
                                    >
                                      {getCorporatePlans().map(plan => (
                                        <option key={plan.id} value={plan.id}>
                                          {plan.title} - NT${parseInt(plan.sale_price).toLocaleString()} ({plan.duration_type === 'annual' ? '年方案' : '季方案'})
                                        </option>
                                      ))}
                                    </select>
                                    {(() => {
                                      const currentPlan = getCorporatePlans().find(p => p.id === editingSubscription.plan_id);
                                      return currentPlan && (
                                        <div className="text-xs text-gray-500 mt-1">
                                          {currentPlan.duration_days}天有效 • 建議價格: NT${parseInt(currentPlan.sale_price).toLocaleString()}
                                        </div>
                                      );
                                    })()}
                                  </div>

                                  {/* 席次管理 */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                    <div>
                                      <label className="text-xs font-medium text-gray-700">總席次</label>
                                      <input
                                        type="number"
                                        min="1"
                                        value={editingSubscription.seats_total}
                                        onChange={(e) => {
                                          const newTotal = parseInt(e.target.value) || 1;
                                          setEditingSubscription(prev => prev ? {
                                            ...prev, 
                                            seats_total: newTotal,
                                            seats_available: newTotal - prev.seats_used
                                          } : null);
                                        }}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-gray-700">已使用席次</label>
                                      <input
                                        type="number"
                                        min="0"
                                        max={editingSubscription.seats_total}
                                        value={editingSubscription.seats_used}
                                        onChange={(e) => {
                                          const used = Math.min(parseInt(e.target.value) || 0, editingSubscription.seats_total);
                                          setEditingSubscription(prev => prev ? {
                                            ...prev, 
                                            seats_used: used,
                                            seats_available: prev.seats_total - used
                                          } : null);
                                        }}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-gray-700">可用席次</label>
                                      <input
                                        type="number"
                                        value={editingSubscription.seats_total - editingSubscription.seats_used}
                                        disabled
                                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm mt-1 bg-gray-50"
                                      />
                                    </div>
                                  </div>

                                  {/* 狀態與金額 */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                    <div>
                                      <label className="text-xs font-medium text-gray-700">訂閱狀態</label>
                                      <select
                                        value={editingSubscription.status}
                                        onChange={(e) => setEditingSubscription(prev => prev ? {
                                          ...prev, 
                                          status: e.target.value as 'inactive' | 'activated' | 'expired' | 'cancelled'
                                        } : null)}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"
                                      >
                                        <option value="non_member">非會員</option>
                                        <option value="inactive">未啟用</option>
                                        <option value="activated">啟用</option>
                                                  <option value="expired">過期</option>
                                        <option value="test">測試</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-gray-700">支付金額</label>
                                      <input
                                        type="number"
                                        min="0"
                                        value={editingSubscription.amount_paid}
                                        onChange={(e) => setEditingSubscription(prev => prev ? {
                                          ...prev, 
                                          amount_paid: parseInt(e.target.value) || 0
                                        } : null)}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"
                                      />
                                    </div>
                                    <div className="flex items-center mt-5">
                                      <input
                                        type="checkbox"
                                        checked={editingSubscription.auto_renewal}
                                        onChange={(e) => setEditingSubscription(prev => prev ? {
                                          ...prev, 
                                          auto_renewal: e.target.checked
                                        } : null)}
                                        className="mr-2"
                                      />
                                      <label className="text-xs font-medium text-gray-700">自動續約</label>
                                    </div>
                                  </div>
                                </div>
                              )}
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
                                              分配日期
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
                                                    <option value="non_member">非會員</option>
                                                    <option value="inactive">未啟用</option>
                                                    <option value="activated">啟用</option>
                                                                          <option value="expired">過期</option>
                                                    <option value="test">測試</option>
                                                  </select>
                                                ) : (
                                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.card_status)}`}>
                                                    {getStatusText(member.card_status)}
                                                  </span>
                                                )}
                                              </td>

                                              {/* 分配日期 */}
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

      {/* 新增企業模態框 */}
      <AnimatePresence>
        {showAddCompanyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowAddCompanyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 m-4 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">新增企業</h3>
                <button
                  onClick={() => setShowAddCompanyModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={FiX} className="text-xl" />
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleCreateCompany(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">企業名稱 *</label>
                  <input
                    type="text"
                    required
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="輸入企業名稱"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">聯絡人姓名 *</label>
                    <input
                      type="text"
                      required
                      value={newCompany.contactName}
                      onChange={(e) => setNewCompany({...newCompany, contactName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="輸入聯絡人姓名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">聯絡電話</label>
                    <input
                      type="tel"
                      value={newCompany.contactPhone}
                      onChange={(e) => setNewCompany({...newCompany, contactPhone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="輸入聯絡電話"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">聯絡信箱 *</label>
                  <input
                    type="email"
                    required
                    value={newCompany.contactEmail}
                    onChange={(e) => setNewCompany({...newCompany, contactEmail: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="輸入聯絡信箱"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
                  <input
                    type="text"
                    value={newCompany.address}
                    onChange={(e) => setNewCompany({...newCompany, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="輸入企業地址"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">行業類別</label>
                    <select
                      value={newCompany.industry}
                      onChange={(e) => setNewCompany({...newCompany, industry: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">選擇行業類別</option>
                      <option value="科技業">科技業</option>
                      <option value="金融服務">金融服務</option>
                      <option value="製造業">製造業</option>
                      <option value="零售業">零售業</option>
                      <option value="教育業">教育業</option>
                      <option value="醫療業">醫療業</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">員工人數</label>
                    <select
                      value={newCompany.employeeCount}
                      onChange={(e) => setNewCompany({...newCompany, employeeCount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">選擇員工人數</option>
                      <option value="1-10人">1-10人</option>
                      <option value="11-50人">11-50人</option>
                      <option value="51-100人">51-100人</option>
                      <option value="101-500人">101-500人</option>
                      <option value="501-1000人">501-1000人</option>
                      <option value="1000人以上">1000人以上</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">企業狀態</label>
                  <select
                    value={newCompany.status}
                    onChange={(e) => setNewCompany({...newCompany, status: e.target.value as 'non_member' | 'activated' | 'expired' | 'test'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="non_member">非會員</option>
                    <option value="inactive">未啟用</option>
                    <option value="activated">啟用</option>
                    <option value="expired">過期</option>
                    <option value="test">測試</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddCompanyModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    新增企業
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
        
        {/* 企業詳情模態框 */}
        {showCompanyDetailModal && selectedCompany && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowCompanyDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 m-4 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">企業詳情</h3>
                <button
                  onClick={() => setShowCompanyDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={FiX} className="text-xl" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* 企業基本資料 */}
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-800">基本資料</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <span className="text-sm text-gray-600">企業名稱</span>
                      <p className="font-medium">{selectedCompany.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">行業類別</span>
                      <p className="font-medium">{selectedCompany.industry}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">聯絡人</span>
                      <p className="font-medium">{selectedCompany.contactName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">聯絡信箱</span>
                      <p className="font-medium">{selectedCompany.contactEmail}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">聯絡電話</span>
                      <p className="font-medium">{selectedCompany.contactPhone || '未提供'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">員工人數</span>
                      <p className="font-medium">{selectedCompany.employeeCount}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-sm text-gray-600">地址</span>
                      <p className="font-medium">{selectedCompany.address || '未提供'}</p>
                    </div>
                  </div>
                </div>
                
                {/* 狀態資訊 */}
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-800">狀態資訊</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">企業狀態</span>
                        <p className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                          selectedCompany.status === 'activated' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedCompany.status === 'activated' ? '正常營運' :
                           '過期'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">創建日期</span>
                        <p className="font-medium">{new Date(selectedCompany.createdAt).toLocaleDateString('zh-TW')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {/* 新增企業訂閱模態框 */}
        {showAddSubscriptionModal && selectedCompanyForSubscription && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowAddSubscriptionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 m-4 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">為 {selectedCompanyForSubscription.name} 新增訂閱</h3>
                <button
                  onClick={() => setShowAddSubscriptionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={FiX} className="text-xl" />
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleCreateSubscription(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">方案選擇 *</label>
                  <select
                    required
                    value={newSubscription.plan_id}
                    onChange={(e) => {
                      const planId = parseInt(e.target.value);
                      const plan = memberCardPlans.find(p => p.id === planId && p.user_type === 'corporate');
                      setNewSubscription({
                        ...newSubscription, 
                        plan_id: planId,
                        amount_paid: plan ? parseFloat(plan.sale_price) : 0
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value={0}>選擇企業方案</option>
                    {memberCardPlans
                      .filter(plan => plan.user_type === 'corporate' && plan.status === 'PUBLISHED')
                      .map(plan => (
                        <option key={plan.id} value={plan.id}>
                          {plan.title} - NT$ {parseFloat(plan.sale_price).toLocaleString()}
                        </option>
                      ))
                    }
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">總席次數 *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newSubscription.seats_total}
                      onChange={(e) => setNewSubscription({...newSubscription, seats_total: parseInt(e.target.value) || 1})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="請輸入席次數"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">金額 *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={newSubscription.amount_paid}
                      onChange={(e) => setNewSubscription({...newSubscription, amount_paid: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="請輸入金額"
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="auto_renewal"
                    checked={newSubscription.auto_renewal}
                    onChange={(e) => setNewSubscription({...newSubscription, auto_renewal: e.target.checked})}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="auto_renewal" className="ml-2 block text-sm text-gray-700">
                    自動續約
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddSubscriptionModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    新增訂閱
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
        
        {/* 企業訂閱詳情模態框 */}
        {showSubscriptionDetailModal && selectedSubscription && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowSubscriptionDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 m-4 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">訂閱詳情</h3>
                <button
                  onClick={() => setShowSubscriptionDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={FiX} className="text-xl" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* 訂閱基本資料 */}
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-800">基本資料</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <span className="text-sm text-gray-600">方案名稱</span>
                      <p className="font-medium">{selectedSubscription.plan_title}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">方案類型</span>
                      <p className="font-medium">{selectedSubscription.duration_type === 'annual' ? '年度方案' : '季度方案'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">總席次數</span>
                      <p className="font-medium">{selectedSubscription.seats_total}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">已使用席次</span>
                      <p className="font-medium">{selectedSubscription.seats_used}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">可用席次</span>
                      <p className="font-medium">{selectedSubscription.seats_available}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">付款金額</span>
                      <p className="font-medium">NT$ {selectedSubscription.amount_paid.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                {/* 時間資訊 */}
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-800">時間資訊</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">購買日期</span>
                        <p className="font-medium">{formatDate(selectedSubscription.purchase_date)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">兌換期限</span>
                        <p className="font-medium">{formatDate(selectedSubscription.activation_deadline)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">訂閱狀態</span>
                        <p className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                          getSubscriptionStatusColor(selectedSubscription.status)
                        }`}>
                          {selectedSubscription.status === 'activated' ? '啟用' :
                           selectedSubscription.status === 'inactive' ? '未啟用' :
                           selectedSubscription.status === 'expired' ? '過期' : 
                           selectedSubscription.status === 'cancelled' ? '取消' :
                           selectedSubscription.status === 'test' ? '測試' : '未知'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">自動續約</span>
                        <p className="font-medium">{selectedSubscription.auto_renewal ? '是' : '否'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
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
      case 'inactive': return 'bg-blue-100 text-blue-700';
      case 'activated': return 'bg-green-100 text-green-700';
      case 'expired': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      case 'test': return 'bg-purple-100 text-purple-700';
      case 'non_member': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // 獲取會員卡狀態文字
  const getMemberStatusText = (status: CorporateMember['card_status']): string => {
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
                  <div><span className="text-gray-600">分配日期:</span> {formatDate(member.issued_date)}</div>
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