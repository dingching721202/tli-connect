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
  FiXCircle, FiChevronDown
} = FiIcons;

const ConsultationManagementSimple: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  // 簡化狀態管理 - 只用一個數據源
  const [allConsultations, setAllConsultations] = useState<Consultation[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">搜索</label>
            <div className="relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="姓名、郵件或企業名稱"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({ type: 'all', status: 'all', searchTerm: '', dateRange: undefined, assignedTo: 'all' });
                setActiveTab('all');
                setDateFilter({ type: 'all' });
              }}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <SafeIcon icon={FiX} className="mr-2" />
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
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
                      <td className="px-4 py-4 w-28">
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
    </div>
  );
};

export default ConsultationManagementSimple;