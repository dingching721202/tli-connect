'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiSave, FiX, FiStar, FiUsers, FiCalendar, FiClock, FiUpload, FiDownload, FiBook, FiSettings } from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';
import { memberCardPlanService, MemberCard } from '@/services/unified';

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
  activate_deadline_days?: number;
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
  activate_deadline_days: number;
  member_card_id: number;
  cta_options: {
    show_payment: boolean;
    show_contact: boolean;
  };
}

// 課程資料的介面定義
interface CourseData {
  id: string | number;
  title: string;
  language: string;
  level: string;
  category: string;
  description?: string;
}

const MemberCardPlanManagement: React.FC = () => {
  const [plans, setPlans] = useState<MemberCardPlan[]>([]);
  const [memberCardsData, setMemberCardsData] = useState<MemberCard[]>([]);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [showMemberCardModal, setShowMemberCardModal] = useState(false);
  const [editingMemberCard, setEditingMemberCard] = useState<MemberCard | null>(null);
  const [activeTab, setActiveTab] = useState<'member-cards' | 'plans'>('member-cards');
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
    activate_deadline_days: 30,
    member_card_id: memberCardsData[0]?.id || 1,
    cta_options: {
      show_payment: true,
      show_contact: false
    }
  });

  const [memberCardFormData, setMemberCardFormData] = useState({
    name: '',
    available_course_ids: [] as (number | string)[]
  });

  // 根據分類映射語言
  const getLanguageFromCategory = (category: string): string => {
    const languageMap: { [key: string]: string } = {
      '中文': 'chinese',
      '英文': 'english',
      '文化': 'chinese',
      '商業': 'english',
      '師資': 'chinese',
      '其它': 'chinese'
    };
    return languageMap[category] || 'chinese';
  };

  const loadPlans = useCallback(async () => {
    try {
      // setLoading(true);
      const response = await fetch('/api/member-card-plans/admin');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.data || []);
      }
    } catch (error) {
      console.error('載入會員卡方案失敗:', error);
    } finally {
      // setLoading(false);
    }
  }, []);

  const loadMemberCards = useCallback(async () => {
    try {
      const response = await fetch('/api/member-cards/admin');
      if (response.ok) {
        const data = await response.json();
        setMemberCardsData(data.data || []);
        console.log('✅ 載入會員卡資料:', data.data?.length || 0, '個會員卡');
      }
    } catch (error) {
      console.error('載入會員卡失敗:', error);
    }
  }, []);

  const loadCourses = useCallback(async () => {
    try {
      // 從統一課程服務獲取真實的課程資料
      const coursesData = await memberCardPlanService.getAvailableCourses();
      
      console.log('✅ 成功載入課程資料:', coursesData.length, '個課程');
      setCourses(coursesData);
    } catch (error) {
      console.error('載入課程資料失敗:', error);
      setCourses([]);
    }
  }, []);

  useEffect(() => {
    loadPlans();
    loadCourses();
    loadMemberCards();
  }, [loadPlans, loadCourses, loadMemberCards]);

  useEffect(() => {
    if (formData.cta_options.show_payment) {
      setFormData(prev => ({ ...prev, hide_price: false }));
    }
  }, [formData.cta_options.show_payment]);

  // 當會員卡資料載入完成後，更新預設的 member_card_id
  useEffect(() => {
    if (memberCardsData.length > 0 && formData.member_card_id === 1) {
      setFormData(prev => ({ 
        ...prev, 
        member_card_id: memberCardsData[0].id 
      }));
    }
  }, [memberCardsData, formData.member_card_id]);

  const handleOpenModal = (plan?: MemberCardPlan) => {
    if (plan) {
      console.log('📝 載入編輯方案資料:', {
        id: plan.id,
        title: plan.title,
        hide_price: plan.hide_price,
        popular: plan.popular,
        cta_options: plan.cta_options
      });
      
      // setEditingPlan(plan);
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
        hide_price: plan.hide_price ?? false,
        activate_deadline_days: plan.activate_deadline_days || 30,
        member_card_id: plan.member_card_id,
        cta_options: plan.cta_options || {
          show_payment: true,
          show_contact: false
        }
      });
    } else {
      // setEditingPlan(null);
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
        activate_deadline_days: 30,
        member_card_id: memberCardsData[0]?.id || 1,
        cta_options: {
          show_payment: true,
          show_contact: false
        }
      });
    }
    // setShowModal(true);
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


  // 會員卡管理相關函式
  const handleOpenMemberCardModal = (card?: MemberCard) => {
    if (card) {
      setEditingMemberCard(card);
      setMemberCardFormData({
        name: card.name,
        available_course_ids: card.available_course_ids
      });
    } else {
      setEditingMemberCard(null);
      setMemberCardFormData({
        name: '',
        available_course_ids: []
      });
    }
    setShowMemberCardModal(true);
  };

  const handleCloseMemberCardModal = () => {
    setShowMemberCardModal(false);
    setEditingMemberCard(null);
  };

  const handleSaveMemberCard = async () => {
    try {
      const cardData = {
        name: memberCardFormData.name,
        available_course_ids: memberCardFormData.available_course_ids
      };

      let response;
      if (editingMemberCard) {
        // 編輯模式
        response = await fetch(`/api/member-cards/admin/${editingMemberCard.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cardData)
        });
      } else {
        // 新增模式
        response = await fetch('/api/member-cards/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cardData)
        });
      }

      if (response.ok) {
        // 重新載入會員卡資料
        await loadMemberCards();
        handleCloseMemberCardModal();
        
        // 顯示成功訊息
        const action = editingMemberCard ? '更新' : '新增';
        alert(`會員卡「${memberCardFormData.name}」已成功${action}！`);
      } else {
        const errorData = await response.json();
        console.error('❌ API 錯誤:', errorData);
        alert(`儲存失敗: ${errorData.error || '未知錯誤'}`);
      }
    } catch (error) {
      console.error('儲存會員卡失敗:', error);
      alert('操作失敗，請稍後再試。');
    }
  };

  const handleEditMemberCard = (card: MemberCard) => {
    handleOpenMemberCardModal(card);
  };

  const handleDeleteMemberCard = async (cardId: number) => {
    const cardToDelete = memberCardsData.find(card => card.id === cardId);
    if (!cardToDelete) return;
    
    // 檢查是否有方案使用此會員卡
    const relatedPlans = plans.filter(plan => plan.member_card_id === cardId);
    if (relatedPlans.length > 0) {
      alert(`無法刪除會員卡「${cardToDelete.name}」，因為有 ${relatedPlans.length} 個方案正在使用此會員卡。\n\n請先刪除或修改相關方案後再進行操作。`);
      return;
    }
    
    if (confirm(`確定要刪除會員卡「${cardToDelete.name}」嗎？`)) {
      try {
        const response = await fetch(`/api/member-cards/admin/${cardId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await loadMemberCards(); // 重新載入資料
          alert(`會員卡「${cardToDelete.name}」已成功刪除！`);
        } else {
          const errorData = await response.json();
          alert(`刪除失敗: ${errorData.error || '未知錯誤'}`);
        }
      } catch (error) {
        console.error('刪除會員卡失敗:', error);
        alert('刪除失敗，請稍後再試。');
      }
    }
  };

  const handleCourseSelection = (courseId: string | number, checked: boolean) => {
    const newCourseIds = checked
      ? [...memberCardFormData.available_course_ids, courseId]
      : memberCardFormData.available_course_ids.filter(id => id !== courseId);
    
    setMemberCardFormData({
      ...memberCardFormData,
      available_course_ids: newCourseIds
    });
  };

  const handleSelectAllCourses = (checked: boolean) => {
    const newCourseIds = checked ? courses.map(course => course.id) : [];
    setMemberCardFormData({
      ...memberCardFormData,
      available_course_ids: newCourseIds
    });
  };

  const isAllCoursesSelected = memberCardFormData.available_course_ids.length === courses.length;
  const isSomeCoursesSelected = memberCardFormData.available_course_ids.length > 0 && memberCardFormData.available_course_ids.length < courses.length;

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


  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">會員卡方案管理</h1>
        <p className="text-gray-600">管理會員卡類型和對應的方案設定</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 w-fit">
        <button
          onClick={() => setActiveTab('member-cards')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'member-cards'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          會員卡管理
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'plans'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          方案管理
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'member-cards' ? (
        // 會員卡管理區塊
        <div>
          {/* Member Cards Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">會員卡類型管理</h2>
              <p className="text-gray-600 text-sm mt-1">管理會員卡類型及其可存取的課程</p>
            </div>
            <button
              onClick={() => handleOpenMemberCardModal()}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <SafeIcon icon={FiPlus} />
              <span>新增會員卡</span>
            </button>
          </div>

          {/* Member Cards Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <SafeIcon icon={FiBook} className="text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">會員卡類型</p>
                  <p className="text-2xl font-bold text-gray-900">{memberCardsData.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <SafeIcon icon={FiUsers} className="text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">可用課程</p>
                  <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <SafeIcon icon={FiSettings} className="text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">關聯方案</p>
                  <p className="text-2xl font-bold text-gray-900">{plans.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Member Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {memberCardsData.map((card) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{card.name}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditMemberCard(card)}
                      className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <SafeIcon icon={FiEdit2} size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteMemberCard(card.id)}
                      className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <SafeIcon icon={FiTrash2} size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">可存取課程 ({card.available_course_ids.length})</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {card.available_course_ids.length > 0 ? (
                      card.available_course_ids.map((courseId) => {
                        const course = courses.find(c => c.id === courseId);
                        return course ? (
                          <div key={courseId} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded flex items-center justify-between">
                            <span className="truncate">{course.title}</span>
                            <span className="text-blue-500 text-xs ml-1 flex-shrink-0">
                              {course.category}
                            </span>
                          </div>
                        ) : (
                          <div key={courseId} className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                            課程ID: {courseId} (未找到)
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                        尚未選擇課程
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  關聯方案: {plans.filter(p => p.member_card_id === card.id).length} 個
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        // 方案管理區塊 (原有內容)
        <div>
          {/* Plans Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">方案管理</h2>
              <p className="text-gray-600 text-sm mt-1">管理會員方案的價格、功能和銷售設定</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <SafeIcon icon={FiPlus} />
              <span>新增方案</span>
            </button>
          </div>

          {/* Plans Stats */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    plan.status === 'PUBLISHED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {plan.status === 'PUBLISHED' ? '已發布' : '草稿'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.title}</h3>
              <div className="mb-3">
                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  🎫 {memberCardsData.find(card => card.id === plan.member_card_id)?.name || '未知會員卡'}
                </span>
              </div>
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
                    <div key={`feature-${feature}-${index}`} className="flex items-center space-x-2 text-sm text-gray-600">
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

              {/* Options Badge */}
              <div className="mb-4 flex items-center flex-wrap gap-2">
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
              {(plan.cta_options?.show_payment || plan.cta_options?.show_contact) && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-600 mb-2">用戶可見的按鈕：</p>
                  <div className="flex space-x-2">
                    {plan.cta_options?.show_payment && (
                      <button
                        disabled
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium opacity-75 cursor-not-allowed"
                      >
                        💳 立即付款
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
              )}

              {/* Management Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleStatus(plan)}
                  className={`flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm font-medium ${
                    plan.status === 'PUBLISHED'
                      ? 'bg-gray-400 text-white hover:bg-gray-500'
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
      )}

      {/* Member Card Modal */}
      <AnimatePresence>
        {showMemberCardModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handleCloseMemberCardModal}
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
                  {editingMemberCard ? '編輯會員卡' : '新增會員卡'}
                </h2>
                <button
                  onClick={handleCloseMemberCardModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={FiX} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Member Card Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    會員卡名稱 *
                  </label>
                  <input
                    type="text"
                    value={memberCardFormData.name}
                    onChange={(e) => setMemberCardFormData({ ...memberCardFormData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="請輸入會員卡名稱"
                  />
                </div>

                {/* Available Courses */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    可存取課程 *
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {/* Select All Option */}
                    <div className="border-b border-gray-200 pb-2 mb-3">
                      <label className="flex items-center space-x-2 p-2 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAllCoursesSelected}
                          ref={(input) => {
                            if (input) input.indeterminate = isSomeCoursesSelected;
                          }}
                          onChange={(e) => handleSelectAllCourses(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="text-sm font-medium text-gray-700">全選</span>
                        <span className="text-xs text-gray-500">({memberCardFormData.available_course_ids.length}/{courses.length})</span>
                      </label>
                    </div>
                    
                    {/* Individual Course Options */}
                    <div className="space-y-2">
                      {courses.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500 text-sm">沒有可用的課程</p>
                          <p className="text-xs text-gray-400 mt-1">請先在課程模組中創建並發布課程</p>
                        </div>
                      ) : (
                        courses.map((course) => (
                          <label key={course.id} className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg transition-colors">
                            <input
                              type="checkbox"
                              checked={memberCardFormData.available_course_ids.includes(course.id)}
                              onChange={(e) => handleCourseSelection(course.id, e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{course.title}</p>
                              <p className="text-xs text-gray-500">{course.language} • {course.level} • {course.category}</p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    選中的課程將可以被此會員卡的用戶存取
                  </p>
                </div>

                {/* Selected Courses Summary */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-3">
                    已選擇課程 ({memberCardFormData.available_course_ids.length}/{courses.length})
                  </h4>
                  {memberCardFormData.available_course_ids.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto">
                      <div className="grid grid-cols-1 gap-2">
                        {memberCardFormData.available_course_ids.map((courseId) => {
                          const course = courses.find(c => c.id === courseId);
                          return course ? (
                            <div key={courseId} className="bg-white rounded-lg p-3 border border-blue-200">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-sm font-medium text-gray-900 truncate">
                                    {course.title}
                                  </h5>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      {course.language}
                                    </span>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      {course.level}
                                    </span>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                      {course.category}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleCourseSelection(courseId, false)}
                                  className="ml-3 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                                  title="移除此課程"
                                >
                                  <SafeIcon icon={FiX} size={14} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div key={courseId} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <div className="text-sm text-gray-500">
                                課程ID: {courseId} (未找到對應課程)
                              </div>
                              <button
                                onClick={() => handleCourseSelection(courseId, false)}
                                className="mt-2 text-red-500 hover:text-red-700 text-xs"
                              >
                                移除此無效課程
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-blue-600">尚未選擇任何課程</p>
                      <p className="text-xs text-blue-500 mt-1">請在上方課程列表中選擇課程</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={handleCloseMemberCardModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveMemberCard}
                  disabled={!memberCardFormData.name.trim() || memberCardFormData.available_course_ids.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <SafeIcon icon={FiSave} />
                  <span>儲存</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan Modal - 剩下的模態框代碼會很長，先省略... */}
      {/* 這裡包含完整的方案編輯模態框 */}
    </div>
  );
};

export default MemberCardPlanManagement;