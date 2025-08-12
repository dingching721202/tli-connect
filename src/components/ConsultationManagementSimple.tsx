'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import { IconType } from 'react-icons';
import SafeIcon from '@/components/common/SafeIcon';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Consultation, 
  ConsultationStatus, 
  ConsultationType, 
  STATUS_CONFIG,
  FilterState 
} from '@/types/consultation';

const {
  FiUsers, FiBriefcase, FiTrash2, FiSearch, FiClock, FiX, FiUser,
  FiPhone, FiFileText, FiMessageCircle, FiCheckCircle,
  FiXCircle, FiChevronDown, FiEdit
} = FiIcons;

const ConsultationManagementSimple: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  // 簡化狀態管理 - 只用一個數據源
  const [allConsultations, setAllConsultations] = useState<Consultation[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'individual' | 'corporate'>('all');
  
  // 篩選狀態
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    status: 'all',
    searchTerm: '',
    dateRange: undefined,
    assignedTo: 'all'
  });


  // 職員人員列表
  const opsPersonnel = [
    { id: 'ops_001', name: '張雅婷' },
    { id: 'ops_002', name: '李志明' },
    { id: 'ops_003', name: '王美華' },
    { id: 'ops_004', name: '陳俊宏' },
    { id: 'ops_005', name: '林淑芬' }
  ];

  // 更新編輯中的諮詢欄位
  const updateEditingField = (field: keyof Consultation, value: Consultation[keyof Consultation]) => {
    if (!editingConsultation) return;
    setEditingConsultation(prev => prev ? { ...prev, [field]: value } : null);
  };

  // 處理指派
  const handleAssignment = (assignedTo: string) => {
    if (!editingConsultation || !user) return;
    
    setEditingConsultation(prev => prev ? {
      ...prev,
      assignedTo,
      assignedBy: user.name,
      assignedAt: new Date().toISOString()
    } : null);
  };

  // 載入所有數據
  const loadAllConsultations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/consultations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setAllConsultations(result.data);
          setFilteredConsultations(result.data);
        }
      } else {
        throw new Error('載入諮詢數據失敗');
      }
    } catch (error) {
      console.error('載入諮詢數據失敗:', error);
      alert('載入諮詢數據失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }, []);

  // 本地篩選邏輯
  const activeStatuses = useMemo(() => [
    ConsultationStatus.CONTACTED, 
    ConsultationStatus.QUALIFICATION, 
    ConsultationStatus.PROPOSAL, 
    ConsultationStatus.NEGOTIATION
  ], []);
  
  const applyFilters = useCallback(() => {
    let filtered = [...allConsultations];

    // 類型篩選
    if (activeTab === 'individual') {
      filtered = filtered.filter(c => c.type === ConsultationType.INDIVIDUAL);
    } else if (activeTab === 'corporate') {
      filtered = filtered.filter(c => c.type === ConsultationType.CORPORATE);
    }

    // 狀態篩選
    if (filters.status === 'active') {
      filtered = filtered.filter(c => activeStatuses.includes(c.status));
    } else if (filters.status !== 'all') {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    // 搜索篩選
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.contactName.toLowerCase().includes(searchTerm) ||
        c.email.toLowerCase().includes(searchTerm) ||
        (c.companyName && c.companyName.toLowerCase().includes(searchTerm))
      );
    }

    // 顧問篩選
    if (filters.assignedTo && filters.assignedTo !== 'all') {
      filtered = filtered.filter(c => c.assignedTo === filters.assignedTo);
    }

    setFilteredConsultations(filtered);
  }, [allConsultations, activeTab, filters, activeStatuses]);

  // 統計數據（基於完整數據集）
  const stats = {
    total: allConsultations.length,
    individual: allConsultations.filter(c => c.type === ConsultationType.INDIVIDUAL).length,
    corporate: allConsultations.filter(c => c.type === ConsultationType.CORPORATE).length,
    lead: allConsultations.filter(c => c.status === ConsultationStatus.LEAD).length,
    active: allConsultations.filter(c => activeStatuses.includes(c.status)).length,
    won: allConsultations.filter(c => c.status === ConsultationStatus.CLOSED_WON).length,
    lost: allConsultations.filter(c => c.status === ConsultationStatus.CLOSED_LOST).length
  };

  // 初始化
  useEffect(() => {
    if (!user || !user.roles.some(role => ['STAFF', 'ADMIN'].includes(role))) {
      router.push('/dashboard');
      return;
    }
    loadAllConsultations();
  }, [user, router, loadAllConsultations]);

  // 監聽篩選條件變化
  useEffect(() => {
    applyFilters();
  }, [applyFilters, allConsultations.length]);

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.status-dropdown')) {
        closeAllDropdowns();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 狀態更新
  const handleStatusUpdate = async (consultationId: string, newStatus: ConsultationStatus) => {
    try {
      // 樂觀更新 UI
      const updateConsultationStatus = (consultations: Consultation[]) => 
        consultations.map(consultation => 
          consultation.id === consultationId
            ? { ...consultation, status: newStatus, updatedAt: new Date().toISOString() }
            : consultation
        );

      setAllConsultations(prev => updateConsultationStatus(prev));
      setOpenDropdowns(new Set());

      // 發送 API 請求
      const response = await fetch('/api/consultations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: consultationId,
          status: newStatus
        }),
      });

      if (!response.ok) {
        throw new Error('更新狀態失敗');
      }
    } catch (error) {
      console.error('更新狀態失敗:', error);
      alert('更新狀態失敗，請稍後再試');
      // 重新載入數據
      loadAllConsultations();
    }
  };

  // 開始編輯諮詢
  const handleEditConsultation = (consultation: Consultation) => {
    setEditingConsultation({ ...consultation });
    setSelectedConsultation(consultation);
    setShowDetailModal(true);
  };

  // 取消編輯
  const handleCancelEdit = () => {
    setEditingConsultation(null);
    setShowDetailModal(false);
    setSelectedConsultation(null);
  };

  // 保存編輯
  const handleSaveEdit = async () => {
    if (!editingConsultation || !user) return;

    try {
      // 添加最後更新者資訊
      const updatedConsultation = {
        ...editingConsultation,
        lastUpdatedBy: user.name,
        updatedAt: new Date().toISOString()
      };

      const response = await fetch('/api/consultations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedConsultation),
      });

      if (!response.ok) {
        throw new Error('更新諮詢失敗');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || '更新諮詢失敗');
      }

      // 更新本地狀態
      const updateConsultation = (consultations: Consultation[]) => 
        consultations.map(consultation => 
          consultation.id === editingConsultation.id
            ? updatedConsultation
            : consultation
        );

      setAllConsultations(prev => updateConsultation(prev));
      setSelectedConsultation(updatedConsultation);
      
      setEditingConsultation(null);
      setShowDetailModal(false);

    } catch (error) {
      console.error('更新諮詢失敗:', error);
      alert('更新諮詢失敗，請稍後再試');
    }
  };

  // 刪除諮詢
  const handleDelete = async (consultationId: string) => {
    if (window.confirm('確定要刪除這個諮詢記錄嗎？')) {
      try {
        const response = await fetch(`/api/consultations?id=${consultationId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // 更新本地狀態
            const removeConsultation = (consultations: Consultation[]) => 
              consultations.filter(consultation => consultation.id !== consultationId);
            
            setAllConsultations(prev => removeConsultation(prev));
            
            if (selectedConsultation?.id === consultationId) {
              setShowDetailModal(false);
              setSelectedConsultation(null);
            }
          } else {
            throw new Error(result.message || '刪除失敗');
          }
        } else {
          throw new Error('刪除失敗');
        }
      } catch (error) {
        console.error('刪除失敗:', error);
        alert('刪除失敗，請稍後再試');
      }
    }
  };

  // 獲取狀態圖標
  const getStatusIcon = (status: ConsultationStatus): IconType => {
    const iconName = STATUS_CONFIG[status].icon;
    const iconMap: { [key: string]: IconType } = {
      'FiUser': FiUser,
      'FiPhone': FiPhone,
      'FiSearch': FiSearch,
      'FiFileText': FiFileText,
      'FiMessageCircle': FiMessageCircle,
      'FiCheckCircle': FiCheckCircle,
      'FiXCircle': FiXCircle
    };
    return iconMap[iconName] || FiUser;
  };

  // 切換下拉選單
  const toggleDropdown = (consultationId: string) => {
    setOpenDropdowns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(consultationId)) {
        newSet.delete(consultationId);
      } else {
        newSet.clear();
        newSet.add(consultationId);
      }
      return newSet;
    });
  };

  // 關閉所有下拉選單
  const closeAllDropdowns = () => {
    setOpenDropdowns(new Set());
  };


  if (!user || !user.roles.some(role => ['STAFF', 'ADMIN'].includes(role))) {
    return null;
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">諮詢管理</h1>
            <p className="text-gray-600">管理和追蹤個人及企業諮詢的處理狀況</p>
          </div>
        </div>
      </motion.div>

      {/* Filter Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8"
      >
        {[
          { 
            label: '總諮詢', 
            count: stats.total, 
            color: 'blue', 
            icon: FiBriefcase,
            filterType: 'all' as const
          },
          { 
            label: '個人', 
            count: stats.individual, 
            color: 'indigo', 
            icon: FiUser,
            filterType: 'individual' as const
          },
          { 
            label: '企業', 
            count: stats.corporate, 
            color: 'purple', 
            icon: FiUsers,
            filterType: 'corporate' as const
          },
          { 
            label: '潛在客戶', 
            count: stats.lead, 
            color: 'gray', 
            icon: FiUser,
            filterType: 'lead' as const
          },
          { 
            label: '進行中', 
            count: stats.active, 
            color: 'yellow', 
            icon: FiClock,
            filterType: 'active' as const
          },
          { 
            label: '成功', 
            count: stats.won, 
            color: 'green', 
            icon: FiCheckCircle,
            filterType: 'won' as const
          },
          { 
            label: '失敗', 
            count: stats.lost, 
            color: 'red', 
            icon: FiXCircle,
            filterType: 'lost' as const
          }
        ].map((stat) => {
          const isActive = (
            (stat.filterType === 'all' && filters.status === 'all' && activeTab === 'all') ||
            (stat.filterType === 'individual' && activeTab === 'individual') ||
            (stat.filterType === 'corporate' && activeTab === 'corporate') ||
            (stat.filterType === 'lead' && filters.status === ConsultationStatus.LEAD) ||
            (stat.filterType === 'active' && filters.status === 'active') ||
            (stat.filterType === 'won' && filters.status === ConsultationStatus.CLOSED_WON) ||
            (stat.filterType === 'lost' && filters.status === ConsultationStatus.CLOSED_LOST)
          );

          return (
            <button
              key={`stat-${stat.label}`}
              onClick={() => {
                if (stat.filterType === 'all') {
                  setActiveTab('all');
                  setFilters(prev => ({ ...prev, status: 'all' }));
                } else if (stat.filterType === 'individual' || stat.filterType === 'corporate') {
                  setActiveTab(stat.filterType);
                  setFilters(prev => ({ ...prev, status: 'all' }));
                } else if (stat.filterType === 'lead') {
                  setActiveTab('all');
                  setFilters(prev => ({ ...prev, status: ConsultationStatus.LEAD }));
                } else if (stat.filterType === 'active') {
                  setActiveTab('all');
                  setFilters(prev => ({ ...prev, status: 'active' as const }));
                } else if (stat.filterType === 'won') {
                  setActiveTab('all');
                  setFilters(prev => ({ ...prev, status: ConsultationStatus.CLOSED_WON }));
                } else if (stat.filterType === 'lost') {
                  setActiveTab('all');
                  setFilters(prev => ({ ...prev, status: ConsultationStatus.CLOSED_LOST }));
                }
              }}
              className={`bg-white rounded-xl shadow-sm border p-4 text-left transition-all duration-200 hover:shadow-md ${
                isActive 
                  ? `border-${stat.color}-300 ring-2 ring-${stat.color}-100 bg-${stat.color}-50` 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-medium ${
                    isActive ? `text-${stat.color}-700` : 'text-gray-600'
                  }`}>{stat.label}</p>
                  <p className={`text-2xl font-bold ${
                    isActive ? `text-${stat.color}-900` : 'text-gray-900'
                  }`}>{stat.count}</p>
                </div>
                <div className={`w-8 h-8 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <SafeIcon icon={stat.icon} className={`text-${stat.color}-600 text-sm`} />
                </div>
              </div>
            </button>
          );
        })}
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all' as const, label: '全部', count: stats.total },
              { key: 'individual' as const, label: '個人', count: stats.individual },
              { key: 'corporate' as const, label: '企業', count: stats.corporate }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
      >
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">搜索</label>
              <div className="relative">
                <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                <input
                  type="text"
                  placeholder="姓名、郵件或企業名稱"
                  className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">顧問篩選</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.assignedTo}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  assignedTo: e.target.value
                }))}
              >
                <option value="all">全部顧問</option>
                {opsPersonnel.map(person => (
                  <option key={person.id} value={person.name}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="lg:w-32">
            <button
              onClick={() => {
                setFilters({ type: 'all', status: 'all', searchTerm: '', dateRange: undefined, assignedTo: 'all' });
                setActiveTab('all');
              }}
              className="w-full flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              <SafeIcon icon={FiX} className="mr-1" size={14} />
              清除篩選
            </button>
          </div>
        </div>
      </motion.div>

      {/* Consultation List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              諮詢記錄 ({filteredConsultations.length})
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">載入中...</p>
          </div>
        ) : filteredConsultations.length === 0 ? (
          <div className="p-8 text-center">
            <SafeIcon icon={FiBriefcase} className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">暫無諮詢記錄</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    類型
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                    聯絡資訊
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    企業資訊
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    狀態
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                    時間
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredConsultations.map((consultation) => {
                  const isCorporate = consultation.type === ConsultationType.CORPORATE;
                  
                  return (
                    <tr key={consultation.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 w-20">
                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold shadow-sm border whitespace-nowrap ${
                          isCorporate 
                            ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200' 
                            : 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200'
                        }`}>
                          <SafeIcon 
                            icon={isCorporate ? FiUsers : FiUser} 
                            className="mr-1" 
                            size={12} 
                          />
                          {isCorporate ? '企業' : '個人'}
                        </span>
                      </td>
                      <td className="px-4 py-4 w-36">
                        <div>
                          <div className="text-sm font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                            {consultation.contactName}
                          </div>
                          <div className="text-sm text-blue-600 whitespace-nowrap overflow-hidden text-ellipsis">{consultation.email}</div>
                          <div className="text-sm text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                            {consultation.phone || '未提供'}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 w-32">
                        <div>
                          <div className="text-sm font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                            {consultation.companyName || '-'}
                          </div>
                          <div className="text-sm text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                            {consultation.contactTitle || '-'}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 w-16">
                        <div className="relative status-dropdown">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDropdown(consultation.id);
                            }}
                            className={`flex items-center px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer w-full ${STATUS_CONFIG[consultation.status].bgColor} ${STATUS_CONFIG[consultation.status].textColor}`}
                          >
                            <SafeIcon 
                              icon={getStatusIcon(consultation.status)} 
                              className="mr-1" 
                              size={10} 
                            />
                            <span className="truncate flex-1 text-left">
                              {STATUS_CONFIG[consultation.status].label}
                            </span>
                            <SafeIcon 
                              icon={FiChevronDown} 
                              className={`ml-0.5 transition-transform ${openDropdowns.has(consultation.id) ? 'rotate-180' : ''}`}
                              size={8} 
                            />
                          </button>
                          
                          {openDropdowns.has(consultation.id) && (
                            <div 
                              className="absolute top-full left-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {Object.values(ConsultationStatus).map((status) => (
                                <button
                                  key={status}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusUpdate(consultation.id, status);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center ${
                                    consultation.status === status ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                  }`}
                                >
                                  <SafeIcon 
                                    icon={getStatusIcon(status)} 
                                    className={`mr-2 ${STATUS_CONFIG[status].textColor}`}
                                    size={12}
                                  />
                                  {STATUS_CONFIG[status].label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 w-36">
                        <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                          提交: {new Date(consultation.submittedAt).toLocaleDateString('zh-TW')}
                        </div>
                        <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                          更新: {new Date(consultation.updatedAt).toLocaleDateString('zh-TW')}
                        </div>
                      </td>
                      <td className="px-4 py-4 w-20">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditConsultation(consultation)}
                            className="text-blue-600 hover:text-blue-800"
                            title="編輯詳情"
                          >
                            <SafeIcon icon={FiEdit} />
                          </button>
                          <button
                            onClick={() => handleDelete(consultation.id)}
                            className="text-red-600 hover:text-red-800"
                            title="刪除"
                          >
                            <SafeIcon icon={FiTrash2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      {showDetailModal && selectedConsultation && editingConsultation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCancelEdit}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">編輯諮詢</h2>
              <button
                onClick={handleCancelEdit}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiX} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-6">
                {/* 統一表單佈局 */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 第一行：基本資訊 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">類型 *</label>
                      <select
                        value={editingConsultation.type}
                        onChange={(e) => updateEditingField('type', e.target.value as ConsultationType)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={ConsultationType.INDIVIDUAL}>個人</option>
                        <option value={ConsultationType.CORPORATE}>企業</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
                      <input
                        type="text"
                        value={editingConsultation.contactName}
                        onChange={(e) => updateEditingField('contactName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={editingConsultation.email}
                        onChange={(e) => updateEditingField('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">電話</label>
                      <input
                        type="tel"
                        value={editingConsultation.phone || ''}
                        onChange={(e) => updateEditingField('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="請輸入電話號碼"
                      />
                    </div>

                    {/* 第二行：企業資訊（所有類型顯示）*/}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        企業名稱{editingConsultation.type === ConsultationType.CORPORATE ? ' *' : ''}
                      </label>
                      <input
                        type="text"
                        value={editingConsultation.companyName || ''}
                        onChange={(e) => updateEditingField('companyName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required={editingConsultation.type === ConsultationType.CORPORATE}
                        placeholder="請輸入企業名稱"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">職稱</label>
                      <input
                        type="text"
                        value={editingConsultation.contactTitle || ''}
                        onChange={(e) => updateEditingField('contactTitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="請輸入職稱"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">培訓人數</label>
                      <select
                        value={editingConsultation.trainingSize || ''}
                        onChange={(e) => updateEditingField('trainingSize', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">請選擇培訓人數</option>
                        <option value="<50">&lt;50</option>
                        <option value="50–100">50–100</option>
                        <option value="100–300">100–300</option>
                        <option value="300–500">300–500</option>
                        <option value="500+">500+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">主要培訓需求</label>
                      <select
                        value={editingConsultation.trainingNeeds?.[0] || ''}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          updateEditingField('trainingNeeds', newValue ? [newValue] : []);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">請選擇主要培訓需求</option>
                        <option value="Language">Language</option>
                        <option value="Culture">Culture</option>
                        <option value="Business">Business</option>
                        <option value="Instructor Training">Instructor Training</option>
                      </select>
                    </div>

                    {/* 第三行：需求說明（所有類型）*/}
                    <div className="md:col-span-2 lg:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">需求說明</label>
                      <textarea
                        value={editingConsultation.message || ''}
                        onChange={(e) => updateEditingField('message', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="請簡述您的培訓需求..."
                      />
                    </div>

                    {/* 第四行：狀態管理（所有類型）*/}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">目前狀態</label>
                      <select
                        value={editingConsultation.status}
                        onChange={(e) => updateEditingField('status', e.target.value as ConsultationStatus)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {Object.values(ConsultationStatus).map((status) => (
                          <option key={status} value={status}>
                            {STATUS_CONFIG[status].label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">提交時間</label>
                      <div className="text-sm text-gray-600 px-3 py-2 bg-white border border-gray-300 rounded-lg">
                        {new Date(editingConsultation.submittedAt).toLocaleString('zh-TW')}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">更新時間</label>
                      <div className="text-sm text-gray-600 px-3 py-2 bg-white border border-gray-300 rounded-lg">
                        {new Date(editingConsultation.updatedAt).toLocaleString('zh-TW')}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">最後更新者</label>
                      <div className="text-sm text-gray-600 px-3 py-2 bg-white border border-gray-300 rounded-lg">
                        {editingConsultation.lastUpdatedBy || '系統'}
                      </div>
                    </div>

                    {/* 第五行：指派處理者 - 適用於所有類型 */}
                    <div className="md:col-span-1 lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">顧問</label>
                      <select
                        value={editingConsultation.assignedTo || ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignment(e.target.value);
                          } else {
                            updateEditingField('assignedTo', '');
                            updateEditingField('assignedBy', '');
                            updateEditingField('assignedAt', '');
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">請選擇顧問</option>
                        {opsPersonnel.map(person => (
                          <option key={person.id} value={person.name}>
                            {person.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-1 lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">處理資訊</label>
                      {editingConsultation.assignedTo ? (
                        <div className="text-xs text-blue-700 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg space-y-1">
                          <div>✅ 顧問：{editingConsultation.assignedTo}</div>
                          {editingConsultation.assignedBy && (
                            <div>👤 派發者：{editingConsultation.assignedBy}</div>
                          )}
                          {editingConsultation.assignedAt && (
                            <div>📅 派發時間：{new Date(editingConsultation.assignedAt).toLocaleDateString('zh-TW')}</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                          尚未指派顧問
                        </div>
                      )}
                    </div>

                    {/* 備註 - 全寬度 */}
                    <div className="md:col-span-2 lg:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
                      <textarea
                        value={editingConsultation.notes || ''}
                        onChange={(e) => updateEditingField('notes', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="請輸入備註資訊..."
                      />
                    </div>
                  </div>
                </div>
              </div>
              
            </form>
            
            {/* 按鈕區域 */}
            <div className="border-t border-gray-200 px-6 py-4 bg-white">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  確認保存
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ConsultationManagementSimple;