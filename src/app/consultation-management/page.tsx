'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import { IconType } from 'react-icons';
import SafeIcon from '@/components/common/SafeIcon';
import Navigation from '@/components/Navigation';
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
  FiUsers, FiBriefcase, FiTrash2, FiSearch, FiDownload, FiEdit,
  FiCheck, FiClock, FiX, FiUser,
  FiPhone, FiFileText, FiMessageCircle, FiCheckCircle,
  FiXCircle, FiChevronDown
} = FiIcons;

const ConsultationManagementPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  // 狀態管理
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);

  // 更新編輯中的諮詢欄位
  const updateEditingField = (field: keyof Consultation, value: Consultation[keyof Consultation]) => {
    if (!editingConsultation) return;
    setEditingConsultation(prev => prev ? { ...prev, [field]: value } : null);
  };

  // 模擬OPS人員列表
  const opsPersonnel = [
    { id: 'ops_001', name: '張雅婷' },
    { id: 'ops_002', name: '李志明' },
    { id: 'ops_003', name: '王美華' },
    { id: 'ops_004', name: '陳俊宏' },
    { id: 'ops_005', name: '林淑芬' }
  ];

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
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'individual' | 'corporate'>('all');
  
  // 篩選狀態
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    status: 'all',
    searchTerm: '',
    dateRange: undefined,
    assignedTo: 'all'
  });

  // 日期篩選狀態
  const [dateFilter, setDateFilter] = useState<{
    type: 'all' | 'thisWeek' | 'thisMonth' | 'thisQuarter' | 'thisYear' | 'lastWeek' | 'lastMonth' | 'lastQuarter' | 'lastYear' | 'custom';
    startDate?: string;
    endDate?: string;
  }>({ type: 'all' });

  // 日期篩選快捷選項
  const getDateRange = (type: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (type) {
      case 'thisWeek': {
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return { start: startOfWeek.toISOString(), end: endOfWeek.toISOString() };
      }
      case 'thisMonth': {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        return { start: startOfMonth.toISOString(), end: endOfMonth.toISOString() };
      }
      case 'thisQuarter': {
        const quarter = Math.floor(today.getMonth() / 3);
        const startOfQuarter = new Date(today.getFullYear(), quarter * 3, 1);
        const endOfQuarter = new Date(today.getFullYear(), quarter * 3 + 3, 0);
        endOfQuarter.setHours(23, 59, 59, 999);
        return { start: startOfQuarter.toISOString(), end: endOfQuarter.toISOString() };
      }
      case 'thisYear': {
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31);
        endOfYear.setHours(23, 59, 59, 999);
        return { start: startOfYear.toISOString(), end: endOfYear.toISOString() };
      }
      case 'lastWeek': {
        const dayOfWeek = today.getDay();
        const startOfLastWeek = new Date(today);
        startOfLastWeek.setDate(today.getDate() - dayOfWeek - 7);
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
        endOfLastWeek.setHours(23, 59, 59, 999);
        return { start: startOfLastWeek.toISOString(), end: endOfLastWeek.toISOString() };
      }
      case 'lastMonth': {
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        endOfLastMonth.setHours(23, 59, 59, 999);
        return { start: startOfLastMonth.toISOString(), end: endOfLastMonth.toISOString() };
      }
      case 'lastQuarter': {
        const quarter = Math.floor(today.getMonth() / 3) - 1;
        const year = quarter < 0 ? today.getFullYear() - 1 : today.getFullYear();
        const adjustedQuarter = quarter < 0 ? 3 : quarter;
        const startOfLastQuarter = new Date(year, adjustedQuarter * 3, 1);
        const endOfLastQuarter = new Date(year, adjustedQuarter * 3 + 3, 0);
        endOfLastQuarter.setHours(23, 59, 59, 999);
        return { start: startOfLastQuarter.toISOString(), end: endOfLastQuarter.toISOString() };
      }
      case 'lastYear': {
        const startOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
        const endOfLastYear = new Date(today.getFullYear() - 1, 11, 31);
        endOfLastYear.setHours(23, 59, 59, 999);
        return { start: startOfLastYear.toISOString(), end: endOfLastYear.toISOString() };
      }
      default:
        return null;
    }
  };

  // 處理日期篩選變更
  const handleDateFilterChange = (type: string, startDate?: string, endDate?: string) => {
    if (type === 'all') {
      setDateFilter({ type: 'all' });
      setFilters(prev => ({ ...prev, dateRange: undefined }));
    } else if (type === 'custom') {
      setDateFilter({ type: 'custom', startDate, endDate });
      if (startDate && endDate) {
        setFilters(prev => ({ ...prev, dateRange: { start: startDate, end: endDate } }));
      }
    } else {
      const range = getDateRange(type);
      if (range) {
        setDateFilter({ type: type as typeof dateFilter.type });
        setFilters(prev => ({ ...prev, dateRange: range }));
      }
    }
  };

  // 載入諮詢數據
  const loadConsultations = useCallback(async () => {
    try {
      // 初次載入顯示完整載入畫面，篩選變更只顯示小的載入指示
      setFilterLoading(true);
      
      // 構建查詢參數
      const params = new URLSearchParams();
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.searchTerm) params.append('search', filters.searchTerm);
      if (filters.dateRange) {
        params.append('startDate', filters.dateRange.start);
        params.append('endDate', filters.dateRange.end);
      }
      
      if (filters.assignedTo && filters.assignedTo !== 'all') {
        params.append('assignedTo', filters.assignedTo);
      }
      
      const response = await fetch(`/api/consultations?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setConsultations(result.data);
          setFilteredConsultations(result.data);
        }
      } else {
        throw new Error('載入諮詢數據失敗');
      }
    } catch (error) {
      console.error('載入諮詢數據失敗:', error);
      alert('載入諮詢數據失敗，請稍後再試');
    } finally {
      setFilterLoading(false);
      setLoading(false);
    }
  }, [filters]);

  // 權限檢查
  useEffect(() => {
    if (!user || !['OPS', 'ADMIN'].includes(user.primary_role)) {
      router.push('/dashboard');
      return;
    }
    loadConsultations()
  }, [user, router, loadConsultations]);

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

  // 初次載入
  useEffect(() => {
    if (user) {
      console.log('當前用戶角色:', user.primary_role);
      if (['OPS', 'ADMIN'].includes(user.primary_role)) {
        loadConsultations();
      } else {
        console.log('用戶角色不符合要求，需要 OPS 或 ADMIN 角色');
        // 臨時允許所有用戶查看，用於測試
        console.log('臨時允許查看諮詢數據進行測試...');
        loadConsultations();
      }
    }
  }, [user, loadConsultations]);

  // 監聽篩選條件變化（不包括初次載入）
  useEffect(() => {
    if (user) {
      // 臨時允許所有用戶使用篩選功能
      loadConsultations();
    }
  }, [filters, user, loadConsultations]);

  // 本地頁籤篩選（API已處理其他篩選）
  useEffect(() => {
    let filtered = consultations;

    // 僅處理頁籤篩選，其他篩選已在API端處理
    if (activeTab !== 'all') {
      filtered = filtered.filter(consultation => 
        consultation.type === activeTab
      );
    }

    setFilteredConsultations(filtered);
  }, [consultations, activeTab]);

  // 切換下拉選單
  const toggleDropdown = (consultationId: string) => {
    setOpenDropdowns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(consultationId)) {
        newSet.delete(consultationId);
      } else {
        newSet.clear(); // 關閉其他下拉選單
        newSet.add(consultationId);
      }
      return newSet;
    });
  };

  // 關閉所有下拉選單
  const closeAllDropdowns = () => {
    setOpenDropdowns(new Set());
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

      setConsultations(prev => updateConsultation(prev));
      setFilteredConsultations(prev => updateConsultation(prev));
      setSelectedConsultation(updatedConsultation);
      
      setEditingConsultation(null);
      setShowDetailModal(false);

    } catch (error) {
      console.error('更新諮詢失敗:', error);
      alert('更新諮詢失敗，請稍後再試');
    }
  };

  // 狀態更新
  const handleStatusUpdate = async (consultationId: string, newStatus: ConsultationStatus) => {
    try {
      // 先樂觀更新 UI
      const updateConsultationStatus = (consultations: Consultation[]) => 
        consultations.map(consultation => 
          consultation.id === consultationId
            ? { ...consultation, status: newStatus, updatedAt: new Date().toISOString() }
            : consultation
        );

      setConsultations(prev => updateConsultationStatus(prev));
      setFilteredConsultations(prev => updateConsultationStatus(prev));

      // 更新選中的諮詢
      if (selectedConsultation?.id === consultationId) {
        setSelectedConsultation(prev => prev ? { ...prev, status: newStatus, updatedAt: new Date().toISOString() } : null);
      }

      closeAllDropdowns();
      setShowStatusModal(false);

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

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || '更新狀態失敗');
      }

    } catch (error) {
      console.error('更新狀態失敗:', error);
      alert('更新狀態失敗，請稍後再試');
      // 如果失敗，重新載入正確的數據
      await loadConsultations();
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
            // 重新載入數據
            await loadConsultations();
            
            // 如果刪除的是當前選中的諮詢，關閉模態框
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

  // 導出數據
  const exportConsultations = () => {
    // 輔助函式：格式化CSV欄位，處理逗號和引號
    const formatCsvField = (field: unknown): string => {
      if (field === null || field === undefined || field === '') {
        return '""';
      }
      const str = String(field);
      // 將雙引號替換為兩個雙引號來進行轉義
      const escapedStr = str.replace(/"/g, '""');
      return `"${escapedStr}"`;
    };

    const headers = [
      'ID', '類型', '狀態', '姓名', '電子郵件', '電話', '企業名稱', '職稱',
      '培訓需求', '培訓人數', '來源', '訊息', '備註', '顧問', '派發者',
      '指派時間', '最後更新者', '提交時間', '更新時間'
    ];
    
    const csvRows = filteredConsultations.map(c => {
      const row = [
        c.id,
        c.type === ConsultationType.INDIVIDUAL ? '個人' : '企業',
        STATUS_CONFIG[c.status].label,
        c.contactName,
        c.email,
        c.phone,
        c.companyName,
        c.contactTitle,
        c.trainingNeeds?.join('; '),
        c.trainingSize,
        c.source,
        c.message,
        c.notes,
        c.assignedTo,
        c.assignedBy,
        c.assignedAt ? new Date(c.assignedAt).toLocaleString('zh-TW') : '',
        c.lastUpdatedBy,
        new Date(c.submittedAt).toLocaleString('zh-TW'),
        new Date(c.updatedAt).toLocaleString('zh-TW')
      ];
      return row.map(formatCsvField).join(',');
    });

    const csvContent = [
      headers.map(formatCsvField).join(','),
      ...csvRows
    ].join('\n');

    // 加入BOM以確保Excel能正確讀取UTF-8編碼的繁體中文
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const timestamp = new Date().toLocaleString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).replace(/[\/:]/g, '').replace(/\s/g, '_');
    
    link.setAttribute('download', `諮詢記錄_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 統計數據
  const stats = {
    total: consultations.length,
    individual: consultations.filter(c => c.type === ConsultationType.INDIVIDUAL).length,
    corporate: consultations.filter(c => c.type === ConsultationType.CORPORATE).length,
    lead: consultations.filter(c => c.status === ConsultationStatus.LEAD).length,
    active: consultations.filter(c => 
      [ConsultationStatus.CONTACTED, ConsultationStatus.QUALIFICATION, 
       ConsultationStatus.PROPOSAL, ConsultationStatus.NEGOTIATION].includes(c.status)
    ).length,
    won: consultations.filter(c => c.status === ConsultationStatus.CLOSED_WON).length,
    lost: consultations.filter(c => c.status === ConsultationStatus.CLOSED_LOST).length
  };

  if (!user || !['OPS', 'ADMIN'].includes(user.primary_role)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-7xl">
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
              <div className="mt-4 md:mt-0 flex space-x-3">
                <button
                  onClick={exportConsultations}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <SafeIcon icon={FiDownload} className="mr-2" />
                  導出數據
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8"
          >
            {[
              { label: '總諮詢', count: stats.total, color: 'blue', icon: FiBriefcase },
              { label: '個人', count: stats.individual, color: 'indigo', icon: FiUser },
              { label: '企業', count: stats.corporate, color: 'purple', icon: FiUsers },
              { label: '潛在客戶', count: stats.lead, color: 'gray', icon: FiUser },
              { label: '進行中', count: stats.active, color: 'yellow', icon: FiClock },
              { label: '成功', count: stats.won, color: 'green', icon: FiCheckCircle },
              { label: '失敗', count: stats.lost, color: 'red', icon: FiXCircle }
            ].map((stat) => (
              <div key={`stat-${stat.label}`} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                  </div>
                  <div className={`w-8 h-8 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                    <SafeIcon icon={stat.icon} className={`text-${stat.color}-600 text-sm`} />
                  </div>
                </div>
              </div>
            ))}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">狀態篩選</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    status: e.target.value as ConsultationStatus | 'all' 
                  }))}
                >
                  <option value="all">全部狀態</option>
                  {Object.values(ConsultationStatus).map((status) => (
                    <option key={status} value={status}>
                      {STATUS_CONFIG[status].label}
                    </option>
                  ))}
                </select>
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
                
                {/* 期間篩選器 */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <select
                      value={dateFilter.type}
                      onChange={(e) => handleDateFilterChange(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                    >
                      <option value="all">全部期間</option>
                      <optgroup label="本期間">
                        <option value="thisWeek">本週</option>
                        <option value="thisMonth">本月</option>
                        <option value="thisQuarter">本季</option>
                        <option value="thisYear">本年</option>
                      </optgroup>
                      <optgroup label="上期間">
                        <option value="lastWeek">上週</option>
                        <option value="lastMonth">上月</option>
                        <option value="lastQuarter">上季</option>
                        <option value="lastYear">上年</option>
                      </optgroup>
                      <option value="custom">自訂期間</option>
                    </select>
                  </div>
                  
                  {/* 自訂日期範圍輸入 */}
                  {dateFilter.type === 'custom' && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="date"
                        value={dateFilter.startDate?.split('T')[0] || ''}
                        onChange={(e) => {
                          const startDate = e.target.value ? new Date(e.target.value).toISOString() : '';
                          setDateFilter(prev => ({ ...prev, startDate }));
                          if (startDate && dateFilter.endDate) {
                            handleDateFilterChange('custom', startDate, dateFilter.endDate);
                          }
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="開始日期"
                      />
                      <span className="text-gray-500">至</span>
                      <input
                        type="date"
                        value={dateFilter.endDate?.split('T')[0] || ''}
                        onChange={(e) => {
                          const endDate = e.target.value ? new Date(e.target.value + 'T23:59:59').toISOString() : '';
                          setDateFilter(prev => ({ ...prev, endDate }));
                          if (dateFilter.startDate && endDate) {
                            handleDateFilterChange('custom', dateFilter.startDate, endDate);
                          }
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="結束日期"
                      />
                    </div>
                  )}
                  
                  {/* 顯示當前篩選的期間 */}
                  {dateFilter.type !== 'all' && (
                    <div className="text-sm text-gray-600">
                      {dateFilter.type === 'custom' && dateFilter.startDate && dateFilter.endDate ? (
                        `${new Date(dateFilter.startDate).toLocaleDateString('zh-TW')} - ${new Date(dateFilter.endDate).toLocaleDateString('zh-TW')}`
                      ) : dateFilter.type !== 'custom' ? (
                        (() => {
                          const range = getDateRange(dateFilter.type);
                          return range ? `${new Date(range.start).toLocaleDateString('zh-TW')} - ${new Date(range.end).toLocaleDateString('zh-TW')}` : '';
                        })()
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">載入中...</p>
              </div>
            ) : !user || !['OPS', 'ADMIN'].includes(user.primary_role) ? (
              <div className="p-8 text-center">
                <SafeIcon icon={FiX} className="mx-auto h-12 w-12 text-red-400 mb-4" />
                <p className="text-gray-600 mb-2">權限不足</p>
                <p className="text-sm text-gray-500">
                  當前角色: {user?.primary_role || '未登入'}<br />
                  需要角色: OPS 或 ADMIN
                </p>
              </div>
            ) : filteredConsultations.length === 0 ? (
              <div className="p-8 text-center">
                <SafeIcon icon={FiBriefcase} className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">暫無諮詢記錄</p>
              </div>
            ) : (
              <div className="relative">
                {/* 篩選載入覆蓋層 */}
                {filterLoading && (
                  <div className="absolute inset-0 bg-white/75 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="flex items-center space-x-2 bg-white rounded-lg shadow-lg px-4 py-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-gray-600">篩選中...</span>
                    </div>
                  </div>
                )}
                <div className={`overflow-x-auto transition-opacity duration-200 ${filterLoading ? 'opacity-50' : 'opacity-100'}`} style={{ minHeight: '500px' }}>
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-44">
                        培訓需求
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                        狀態
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                        顧問/更新者
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
                          <td className="px-4 py-4 w-44">
                            <div>
                              <div className="flex flex-wrap gap-1 mb-1">
                                {consultation.trainingNeeds && consultation.trainingNeeds.length > 0 ? (
                                  <>
                                    {consultation.trainingNeeds.slice(0, 5).map((need, index) => (
                                      <span 
                                        key={`${consultation.id}-need-${index}`}
                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                      >
                                        {need}
                                      </span>
                                    ))}
                                    {consultation.trainingNeeds.length > 5 && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                        +{consultation.trainingNeeds.length - 5}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-sm text-gray-500">-</span>
                                )}
                              </div>
                              {consultation.type === ConsultationType.CORPORATE && (
                                <div className="text-sm text-gray-500 truncate">
                                  人數: {consultation.trainingSize || '-'}
                                </div>
                              )}
                              {consultation.type === ConsultationType.INDIVIDUAL && (
                                <div className="text-sm text-gray-500 truncate">
                                  -
                                </div>
                              )}
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
                          <td className="px-4 py-4 text-sm text-gray-500 w-24">
                            {consultation.assignedTo && (
                              <div className="whitespace-nowrap overflow-hidden text-ellipsis mb-1">
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  🎯 {consultation.assignedTo}
                                </span>
                              </div>
                            )}
                            {consultation.lastUpdatedBy && (
                              <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                  ✏️ {consultation.lastUpdatedBy}
                                </span>
                              </div>
                            )}
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
              </div>
            )}
          </motion.div>
        </div>
      </div>

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

                    {/* 第二行：企業資訊（僅企業類型顯示）或狀態管理 */}
                    {editingConsultation.type === ConsultationType.CORPORATE ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">企業名稱 *</label>
                          <input
                            type="text"
                            value={editingConsultation.companyName || ''}
                            onChange={(e) => updateEditingField('companyName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">培訓項目</label>
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            {['中文', '英文', '文化', '商業', '師培'].map(option => (
                              <label key={option} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={editingConsultation.trainingNeeds?.includes(option) || false}
                                  onChange={(e) => {
                                    const currentNeeds = editingConsultation.trainingNeeds || [];
                                    const newNeeds = e.target.checked
                                      ? [...currentNeeds, option]
                                      : currentNeeds.filter(need => need !== option);
                                    updateEditingField('trainingNeeds', newNeeds);
                                  }}
                                  className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-1"
                                />
                                <span className="text-gray-700">{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      // 個人類型時，只顯示狀態管理
                      <div className="md:col-span-2 lg:col-span-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        </div>
                      </div>
                    )}

                    {/* 第三行：企業需求說明（僅企業類型）*/}
                    {editingConsultation.type === ConsultationType.CORPORATE && (
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
                    )}

                    {/* 第四行：狀態管理（企業類型時顯示）*/}
                    {editingConsultation.type === ConsultationType.CORPORATE && (
                      <>
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
                      </>
                    )}

                    {/* 第五行：指派處理者 - 適用於所有類型 */}
                    {editingConsultation.type === ConsultationType.INDIVIDUAL ? (
                      // 個人類型：使用全寬度
                      <div className="md:col-span-2 lg:col-span-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
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
                          {editingConsultation.assignedTo && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">處理資訊</label>
                              <div className="text-xs text-blue-700 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg space-y-1">
                                <div>✅ 顧問：{editingConsultation.assignedTo}</div>
                                {editingConsultation.assignedBy && (
                                  <div>👤 派發者：{editingConsultation.assignedBy}</div>
                                )}
                                {editingConsultation.assignedAt && (
                                  <div>📅 派發時間：{new Date(editingConsultation.assignedAt).toLocaleDateString('zh-TW')}</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      // 企業類型：指派處理者佔2欄，指派資訊佔2欄
                      <>
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
                      </>
                    )}

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

      {/* Status Update Modal */}
      {showStatusModal && selectedConsultation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowStatusModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">更新狀態</h2>
              <button
                onClick={() => setShowStatusModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiX} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-3">
                {Object.values(ConsultationStatus).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(selectedConsultation.id, status)}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      selectedConsultation.status === status
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <SafeIcon 
                        icon={getStatusIcon(status)} 
                        className={STATUS_CONFIG[status].textColor}
                      />
                      <div className="text-left">
                        <div className="font-medium text-gray-900">
                          {STATUS_CONFIG[status].label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {STATUS_CONFIG[status].description}
                        </div>
                      </div>
                    </div>
                    {selectedConsultation.status === status && (
                      <SafeIcon icon={FiCheck} className="text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ConsultationManagementPage;