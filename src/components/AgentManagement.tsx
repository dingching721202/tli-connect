'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import { useAuth } from '@/contexts/AuthContext';

const {
  FiUsers, FiSettings, FiUserPlus, FiEdit2, FiTrash2, FiSearch, 
  FiDownload, FiX, FiBuilding, FiEye, FiMessageSquare, 
  FiUserCheck, FiExternalLink, FiLink, FiUser, 
  FiCopy, FiTrendingUp, FiAward, FiPercent, 
  FiBriefcase, FiDollarSign
} = FiIcons;

interface Role {
  id: number;
  name: string;
  percentage: number;
  description: string;
}

interface CommissionSetting {
  name: string;
  totalCommission: number;
  roles: Role[];
}

interface Agent {
  id: number;
  name: string;
  email: string;
  phone: string;
  agentType: 'agent' | 'consultant' | 'teacher' | 'student';
  roleId: number;
  roleName: string;
  rolePercentage: number;
  agentCode: string;
  referralLink: string;
  isCompany: boolean;
  companyName: string;
  contactPerson: string;
  bankAccount: string;
  taxId: string;
  address: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'suspended';
  totalSales: number;
  monthSales: number;
  totalCommission: number;
  monthCommission: number;
  salesCount: number;
  monthSalesCount: number;
  lastSaleDate: string | null;
  notes: string;
  hasSuccessfulReferral: boolean; // 新增：是否有成功推薦記錄
}

interface SalesRecord {
  id: number;
  agentId: number;
  agentName: string;
  agentCode: string;
  customerName: string;
  customerEmail: string;
  productType: 'individual' | 'corporate';
  planName: string;
  saleAmount: number;
  commission: number;
  commissionRate: number;
  saleDate: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  referralMethod: 'link' | 'code';
  orderNumber: string;
  notes: string;
}

interface NewAgent {
  name: string;
  email: string;
  phone: string;
  agentType: 'agent' | 'consultant' | 'teacher' | 'student';
  roleId: string;
  companyName: string;
  contactPerson: string;
  isCompany: boolean;
  bankAccount: string;
  taxId: string;
  address: string;
  notes: string;
}

interface NewRole {
  name: string;
  percentage: number;
  description: string;
}

const AgentManagement: React.FC = () => {
  const {} = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'agent' | 'consultant' | 'teacher' | 'student' | 'settings'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('this-month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);

  // 代理設定狀態
  const [commissionSettings, setCommissionSettings] = useState<Record<string, CommissionSetting>>({
    'agent': {
      name: '代理',
      totalCommission: 25,
      roles: [
        { id: 1, name: '資深代理', percentage: 15, description: '具備豐富經驗的代理' },
        { id: 2, name: '新手代理', percentage: 10, description: '剛加入的代理' }
      ]
    },
    'consultant': {
      name: '顧問',
      totalCommission: 20,
      roles: [
        { id: 1, name: '業務經理', percentage: 8, description: '負責業務開發的顧問' },
        { id: 2, name: '客服專員', percentage: 5, description: '負責客戶服務的顧問' },
        { id: 3, name: '行銷專員', percentage: 7, description: '負責行銷推廣的顧問' }
      ]
    },
    'teacher': {
      name: '老師',
      totalCommission: 15,
      roles: [
        { id: 1, name: '資深老師', percentage: 12, description: '具備教學經驗的老師' },
        { id: 2, name: '新進老師', percentage: 8, description: '剛加入的老師' }
      ]
    },
    'student': {
      name: '學生',
      totalCommission: 10,
      roles: [
        { id: 1, name: '優秀學生', percentage: 8, description: '表現優秀的學生' },
        { id: 2, name: '一般學生', percentage: 5, description: '一般學生推薦' }
      ]
    },
    'corporate_contact': {
      name: '企業窗口',
      totalCommission: 12,
      roles: [
        { id: 1, name: '資深窗口', percentage: 10, description: '經驗豐富的企業窗口' },
        { id: 2, name: '一般窗口', percentage: 8, description: '一般企業窗口' }
      ]
    }
  });

  // 新增代理表單
  const [newAgent, setNewAgent] = useState<NewAgent>({
    name: '',
    email: '',
    phone: '',
    agentType: 'agent',
    roleId: '',
    companyName: '',
    contactPerson: '',
    isCompany: false,
    bankAccount: '',
    taxId: '',
    address: '',
    notes: ''
  });

  // 新增角色表單
  const [newRole, setNewRole] = useState<NewRole>({
    name: '',
    percentage: 0,
    description: ''
  });

  // Mock 代理數據
  const [mockAgents, setMockAgents] = useState<Agent[]>([
    {
      id: 1,
      name: '張老師',
      email: 'zhang.teacher@example.com',
      phone: '0912-345-678',
      agentType: 'agent-teacher',
      roleId: 1,
      roleName: '資深代理',
      rolePercentage: 15,
      agentCode: 'AGT001',
      referralLink: 'https://tliconnect.com/ref/AGT001',
      isCompany: false,
      companyName: '',
      contactPerson: '',
      bankAccount: '123-456-789012',
      taxId: '',
      address: '台北市大安區信義路四段1號',
      joinDate: '2024-01-15',
      status: 'active',
      totalSales: 156800,
      monthSales: 48600,
      totalCommission: 23520,
      monthCommission: 7290,
      salesCount: 12,
      monthSalesCount: 4,
      lastSaleDate: '2025-01-18',
      notes: '表現優異的代理老師',
      hasSuccessfulReferral: true
    },
    {
      id: 2,
      name: '王小華',
      email: 'wang.sales@example.com',
      phone: '0923-456-789',
      agentType: 'consultant',
      roleId: 1,
      roleName: '業務經理',
      rolePercentage: 8,
      agentCode: 'CON001',
      referralLink: 'https://tliconnect.com/ref/CON001',
      isCompany: false,
      companyName: '',
      contactPerson: '',
      bankAccount: '987-654-321098',
      taxId: '',
      address: '台北市信義區松仁路100號',
      joinDate: '2024-02-01',
      status: 'active',
      totalSales: 298400,
      monthSales: 89200,
      totalCommission: 23872,
      monthCommission: 7136,
      salesCount: 18,
      monthSalesCount: 6,
      lastSaleDate: '2025-01-19',
      notes: '業務能力強，客戶關係良好',
      hasSuccessfulReferral: true
    },
    {
      id: 5,
      name: '陳老師',
      email: 'chen.teacher@example.com',
      phone: '0934-567-890',
      agentType: 'teacher',
      roleId: 1,
      roleName: '資深老師',
      rolePercentage: 12,
      agentCode: 'TCH001',
      referralLink: 'https://tli-connect.com/membership?ref=TCH001',
      isCompany: false,
      companyName: '',
      contactPerson: '',
      bankAccount: '345-678-901234',
      taxId: '',
      address: '台北市中山區南京東路三段219號',
      joinDate: '2024-03-01',
      status: 'active',
      totalSales: 120000,
      monthSales: 36000,
      totalCommission: 14400,
      monthCommission: 4320,
      salesCount: 8,
      monthSalesCount: 2,
      lastSaleDate: '2024-12-10',
      notes: '教學經驗豐富，學生推薦成功',
      hasSuccessfulReferral: true
    },
    {
      id: 6,
      name: '林同學',
      email: 'lin.student@example.com',
      phone: '0945-678-901',
      agentType: 'student',
      roleId: 1,
      roleName: '優秀學生',
      rolePercentage: 8,
      agentCode: 'STU001',
      referralLink: 'https://tli-connect.com/membership?ref=STU001',
      isCompany: false,
      companyName: '',
      contactPerson: '',
      bankAccount: '456-789-012345',
      taxId: '',
      address: '台北市文山區木柵路四段159號',
      joinDate: '2024-06-01',
      status: 'active',
      totalSales: 54000,
      monthSales: 18000,
      totalCommission: 4320,
      monthCommission: 1440,
      salesCount: 3,
      monthSalesCount: 1,
      lastSaleDate: '2024-12-05',
      notes: '積極推薦同學，表現優秀',
      hasSuccessfulReferral: true
    },
    {
      id: 7,
      name: '黃老師',
      email: 'huang.teacher@example.com',
      phone: '0956-789-012',
      agentType: 'teacher',
      roleId: 2,
      roleName: '新進老師',
      rolePercentage: 8,
      agentCode: 'TCH002',
      referralLink: 'https://tli-connect.com/membership?ref=TCH002',
      isCompany: false,
      companyName: '',
      contactPerson: '',
      bankAccount: '567-890-123456',
      taxId: '',
      address: '台北市士林區中正路223號',
      joinDate: '2024-09-01',
      status: 'active',
      totalSales: 0,
      monthSales: 0,
      totalCommission: 0,
      monthCommission: 0,
      salesCount: 0,
      monthSalesCount: 0,
      lastSaleDate: null,
      notes: '新進老師，尚未有推薦記錄',
      hasSuccessfulReferral: false
    },
    {
      id: 8,
      name: '吳同學',
      email: 'wu.student@example.com',
      phone: '0967-890-123',
      agentType: 'student',
      roleId: 2,
      roleName: '一般學生',
      rolePercentage: 5,
      agentCode: 'STU002',
      referralLink: 'https://tli-connect.com/membership?ref=STU002',
      isCompany: false,
      companyName: '',
      contactPerson: '',
      bankAccount: '678-901-234567',
      taxId: '',
      address: '台北市內湖區成功路四段61號',
      joinDate: '2024-10-01',
      status: 'active',
      totalSales: 0,
      monthSales: 0,
      totalCommission: 0,
      monthCommission: 0,
      salesCount: 0,
      monthSalesCount: 0,
      lastSaleDate: null,
      notes: '新加入學生，尚未有推薦記錄',
      hasSuccessfulReferral: false
    },
    {
      id: 3,
      name: '創新科技有限公司',
      email: 'contact@innovation.com',
      phone: '02-1234-5678',
      agentType: 'agent-teacher',
      roleId: 2,
      roleName: '新手代理',
      rolePercentage: 10,
      agentCode: 'AGT002',
      referralLink: 'https://tliconnect.com/ref/AGT002',
      isCompany: true,
      companyName: '創新科技有限公司',
      contactPerson: '李經理',
      bankAccount: '555-666-777888',
      taxId: '12345678',
      address: '新北市板橋區文化路二段100號',
      joinDate: '2024-03-10',
      status: 'active',
      totalSales: 67200,
      monthSales: 22400,
      totalCommission: 6720,
      monthCommission: 2240,
      salesCount: 5,
      monthSalesCount: 2,
      lastSaleDate: '2025-01-16',
      notes: '企業代理，主要推廣企業課程',
      hasSuccessfulReferral: true
    },
    {
      id: 4,
      name: '陳小美',
      email: 'chen.marketing@example.com',
      phone: '0934-567-890',
      agentType: 'consultant',
      roleId: 3,
      roleName: '行銷專員',
      rolePercentage: 7,
      agentCode: 'CON002',
      referralLink: 'https://tliconnect.com/ref/CON002',
      isCompany: false,
      companyName: '',
      contactPerson: '',
      bankAccount: '111-222-333444',
      taxId: '',
      address: '台中市西屯區台灣大道三段200號',
      joinDate: '2024-04-05',
      status: 'active',
      totalSales: 134600,
      monthSales: 31200,
      totalCommission: 9422,
      monthCommission: 2184,
      salesCount: 9,
      monthSalesCount: 3,
      lastSaleDate: '2025-01-17',
      notes: '擅長線上行銷推廣',
      hasSuccessfulReferral: true
    }
  ]);

  // Mock 銷售紀錄
  const [mockSalesRecords] = useState<SalesRecord[]>([
    {
      id: 1,
      agentId: 1,
      agentName: '張老師',
      agentCode: 'AGT001',
      customerName: '王小明',
      customerEmail: 'customer1@example.com',
      productType: 'individual',
      planName: '年方案',
      saleAmount: 36000,
      commission: 5400,
      commissionRate: 15,
      saleDate: '2025-01-18',
      paymentStatus: 'paid',
      referralMethod: 'link',
      orderNumber: 'ORD20250118001',
      notes: '透過推廣連結完成'
    },
    {
      id: 2,
      agentId: 2,
      agentName: '王小華',
      agentCode: 'CON001',
      customerName: '台灣科技股份有限公司',
      customerEmail: 'admin@taiwantech.com',
      productType: 'corporate',
      planName: '企業方案 (10人)',
      saleAmount: 160000,
      commission: 12800,
      commissionRate: 8,
      saleDate: '2025-01-19',
      paymentStatus: 'paid',
      referralMethod: 'code',
      orderNumber: 'ORD20250119001',
      notes: '客戶輸入代理代碼完成'
    },
    {
      id: 3,
      agentId: 1,
      agentName: '張老師',
      agentCode: 'AGT001',
      customerName: '李小華',
      customerEmail: 'customer2@example.com',
      productType: 'individual',
      planName: '季方案',
      saleAmount: 10800,
      commission: 1620,
      commissionRate: 15,
      saleDate: '2025-01-15',
      paymentStatus: 'paid',
      referralMethod: 'link',
      orderNumber: 'ORD20250115001',
      notes: '透過推廣連結完成'
    },
    {
      id: 4,
      agentId: 4,
      agentName: '陳小美',
      agentCode: 'CON002',
      customerName: '林小雅',
      customerEmail: 'customer3@example.com',
      productType: 'individual',
      planName: '月方案',
      saleAmount: 4500,
      commission: 315,
      commissionRate: 7,
      saleDate: '2025-01-17',
      paymentStatus: 'pending',
      referralMethod: 'code',
      orderNumber: 'ORD20250117001',
      notes: '客戶輸入代理代碼完成'
    }
  ]);

  // Helper functions
  const formatPrice = (amount: number): string => {
    return `NT$ ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getAgentTypeColor = (type: string): string => {
    switch (type) {
      case 'agent-teacher': return 'bg-blue-100 text-blue-800';
      case 'consultant': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAgentTypeName = (type: string): string => {
    switch (type) {
      case 'agent-teacher': return '代理&老師';
      case 'consultant': return '顧問';
      default: return '未知';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-600';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusName = (status: string): string => {
    switch (status) {
      case 'active': return '啟用';
      case 'inactive': return '停用';
      case 'suspended': return '暫停';
      default: return '未知';
    }
  };

  const getPaymentStatusColor = (status: string): string => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusName = (status: string): string => {
    switch (status) {
      case 'paid': return '已付款';
      case 'pending': return '待付款';
      case 'failed': return '付款失敗';
      default: return '未知';
    }
  };

  // Filter functions
  const getFilteredAgents = (): Agent[] => {
    const filtered = mockAgents.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          agent.agentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (agent.companyName && agent.companyName.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeTab === 'agent' && agent.agentType !== 'agent') return false;
      if (activeTab === 'consultant' && agent.agentType !== 'consultant') return false;
      if (activeTab === 'teacher' && (agent.agentType !== 'teacher' || !agent.hasSuccessfulReferral)) return false;
      if (activeTab === 'student' && (agent.agentType !== 'student' || !agent.hasSuccessfulReferral)) return false;

      return true;
    });

    return filtered.sort((a, b) => b.totalSales - a.totalSales);
  };

  const getFilteredSalesRecords = (): SalesRecord[] => {
    const filteredAgents = getFilteredAgents();
    const agentIds = filteredAgents.map(agent => agent.id);

    const filtered = mockSalesRecords.filter(record => {
      if (!agentIds.includes(record.agentId)) return false;

      // Date filtering
      const recordDate = new Date(record.saleDate);
      const today = new Date();
      
      switch (dateFilter) {
        case 'today':
          return recordDate.toDateString() === today.toDateString();
        case 'this-week':
          const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
          return recordDate >= weekStart;
        case 'this-month':
          return recordDate.getMonth() === today.getMonth() && recordDate.getFullYear() === today.getFullYear();
        case 'this-year':
          return recordDate.getFullYear() === today.getFullYear();
        case 'custom':
          if (startDate && endDate) {
            return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
          }
          return true;
        default:
          return true;
      }
    });

    return filtered.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
  };

  // Statistics
  const getStatistics = () => {
    const filteredAgents = getFilteredAgents();
    const filteredSales = getFilteredSalesRecords();

    const totalSales = filteredSales.reduce((sum, record) => sum + record.saleAmount, 0);
    const totalCommission = filteredSales.reduce((sum, record) => sum + record.commission, 0);
    const averagePerAgent = filteredAgents.length > 0 ? totalSales / filteredAgents.length : 0;
    const topPerformer = filteredAgents.length > 0 ? filteredAgents[0] : null;

    return {
      totalAgents: filteredAgents.length,
      totalSales,
      totalCommission,
      averagePerAgent,
      topPerformer,
      salesCount: filteredSales.length
    };
  };

  // Commission calculation
  const calculateTotalPercentage = (agentType: string): number => {
    return commissionSettings[agentType].roles.reduce((sum, role) => sum + role.percentage, 0);
  };

  // Handlers
  const handleAddAgent = () => {
    const validationErrors = validateAgentForm();
    if (validationErrors.length > 0) {
      alert(`❌ 請檢查以下欄位：\n\n• ${validationErrors.join('\n• ')}`);
      return;
    }

    const selectedRole = commissionSettings['agent'].roles.find(role => role.id === parseInt(newAgent.roleId));
    
    const agentCode = generateAgentCode('agent');
    const agentData: Agent = {
      id: Math.max(...mockAgents.map(a => a.id), 0) + 1,
      ...newAgent,
      agentType: 'agent',
      roleId: parseInt(newAgent.roleId),
      roleName: selectedRole?.name || '',
      rolePercentage: selectedRole?.percentage || 0,
      agentCode: agentCode,
      referralLink: `https://tli-connect.com/membership?ref=${agentCode}`,
      hasSuccessfulReferral: true,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active',
      totalSales: 0,
      monthSales: 0,
      totalCommission: 0,
      monthCommission: 0,
      salesCount: 0,
      monthSalesCount: 0,
      lastSaleDate: null
    };

    setMockAgents(prev => [...prev, agentData]);
    setNewAgent({
      name: '',
      email: '',
      phone: '',
      agentType: 'agent',
      roleId: '',
      companyName: '',
      contactPerson: '',
      isCompany: false,
      bankAccount: '',
      taxId: '',
      address: '',
      notes: ''
    });
    setShowAddAgentModal(false);
    alert('✅ 代理已成功新增！');
  };

  const generateAgentCode = (agentType: 'agent' | 'consultant' | 'teacher' | 'student'): string => {
    const prefixMap = {
      'agent': 'AGT',
      'consultant': 'CON', 
      'teacher': 'TCH',
      'student': 'STU'
    };
    const prefix = prefixMap[agentType];
    const existingCodes = mockAgents
      .filter(agent => agent.agentType === agentType)
      .map(agent => agent.agentCode);
    
    let counter = 1;
    let code: string;
    do {
      code = `${prefix}${counter.toString().padStart(3, '0')}`;
      counter++;
    } while (existingCodes.includes(code));
    
    return code;
  };

  const validateAgentForm = (): string[] => {
    const errors: string[] = [];
    if (!newAgent.name.trim()) errors.push('姓名/公司名稱');
    if (!newAgent.email.trim()) errors.push('電子郵件');
    if (!newAgent.roleId) errors.push('代理角色');

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (newAgent.email && !emailPattern.test(newAgent.email)) {
      errors.push('電子郵件格式不正確');
    }

    const emailExists = mockAgents.some(agent => agent.email === newAgent.email);
    if (emailExists) {
      errors.push('此電子郵件已被使用');
    }

    if (newAgent.isCompany) {
      if (!newAgent.companyName.trim()) errors.push('公司名稱');
      if (!newAgent.contactPerson.trim()) errors.push('聯絡人');
      if (!newAgent.taxId.trim()) errors.push('統一編號');
    }

    return errors;
  };

  const handleAddRole = (agentType: string) => {
    if (!newRole.name.trim()) {
      alert('請輸入角色名稱');
      return;
    }

    if (newRole.percentage <= 0 || newRole.percentage > 100) {
      alert('分紅比例必須在 1-100 之間');
      return;
    }

    const currentTotal = calculateTotalPercentage(agentType);
    if (currentTotal + newRole.percentage > 100) {
      alert(`分紅比例總和不能超過 100%\n目前總和：${currentTotal}%\n新增後將為：${currentTotal + newRole.percentage}%`);
      return;
    }

    const newRoleData: Role = {
      id: Math.max(...commissionSettings[agentType].roles.map(r => r.id), 0) + 1,
      ...newRole
    };

    setCommissionSettings(prev => ({
      ...prev,
      [agentType]: {
        ...prev[agentType],
        roles: [...prev[agentType].roles, newRoleData]
      }
    }));

    setNewRole({ name: '', percentage: 0, description: '' });
    setShowRoleModal(false);
    alert('✅ 角色已成功新增！');
  };

  const handleDeleteRole = (agentType: string, roleId: number) => {
    if (confirm('確定要刪除此角色嗎？')) {
      setCommissionSettings(prev => ({
        ...prev,
        [agentType]: {
          ...prev[agentType],
          roles: prev[agentType].roles.filter(role => role.id !== roleId)
        }
      }));
      alert('✅ 角色已刪除！');
    }
  };

  const handleCopyReferralLink = (link: string) => {
    navigator.clipboard.writeText(link);
    alert('✅ 推廣連結已複製到剪貼板！');
  };

  const handleCopyAgentCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('✅ 代理代碼已複製到剪貼板！');
  };

  const handleExportData = () => {
    const filteredAgents = getFilteredAgents();
    const filteredSales = getFilteredSalesRecords();

    // Export agents data
    const agentHeaders = ['代理名稱', '代理代碼', '代理類型', '角色', '分紅比例', '總銷售額', '月銷售額', '總分紅', '月分紅', '加入日期', '狀態'];
    const agentData = filteredAgents.map(agent => [
      agent.name,
      agent.agentCode,
      getAgentTypeName(agent.agentType),
      agent.roleName,
      `${agent.rolePercentage}%`,
      formatPrice(agent.totalSales),
      formatPrice(agent.monthSales),
      formatPrice(agent.totalCommission),
      formatPrice(agent.monthCommission),
      formatDate(agent.joinDate),
      getStatusName(agent.status)
    ]);

    const agentCsvContent = [agentHeaders, ...agentData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Export sales data
    const salesHeaders = ['訂單編號', '代理名稱', '代理代碼', '客戶名稱', '產品類型', '方案名稱', '銷售額', '分紅金額', '分紅比例', '銷售日期', '付款狀態', '推廣方式'];
    const salesData = filteredSales.map(record => [
      record.orderNumber,
      record.agentName,
      record.agentCode,
      record.customerName,
      record.productType === 'individual' ? '個人方案' : '企業方案',
      record.planName,
      formatPrice(record.saleAmount),
      formatPrice(record.commission),
      `${record.commissionRate}%`,
      formatDate(record.saleDate),
      getPaymentStatusName(record.paymentStatus),
      record.referralMethod === 'link' ? '推廣連結' : '代理代碼'
    ]);

    const salesCsvContent = [salesHeaders, ...salesData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Create and download files
    const timestamp = new Date().toISOString().slice(0, 10);
    
    // Download agents data
    const BOM = '\uFEFF';
    const agentBlob = new Blob([BOM + agentCsvContent], { type: 'text/csv;charset=utf-8;' });
    const agentLink = document.createElement('a');
    const agentUrl = URL.createObjectURL(agentBlob);
    agentLink.setAttribute('href', agentUrl);
    agentLink.setAttribute('download', `代理管理_${timestamp}.csv`);
    agentLink.style.visibility = 'hidden';
    document.body.appendChild(agentLink);
    agentLink.click();
    document.body.removeChild(agentLink);

    // Download sales data
    const salesBlob = new Blob([BOM + salesCsvContent], { type: 'text/csv;charset=utf-8;' });
    const salesLink = document.createElement('a');
    const salesUrl = URL.createObjectURL(salesBlob);
    salesLink.setAttribute('href', salesUrl);
    salesLink.setAttribute('download', `銷售紀錄_${timestamp}.csv`);
    salesLink.style.visibility = 'hidden';
    document.body.appendChild(salesLink);
    salesLink.click();
    document.body.removeChild(salesLink);

    alert('✅ 數據已匯出！\n\n已下載兩個檔案：\n• 代理管理數據\n• 銷售紀錄數據');
  };

  const stats = getStatistics();

  // Tab configuration
  const tabs = [
    { id: 'all' as const, name: '全部', icon: FiUsers, count: mockAgents.length },
    { id: 'agent' as const, name: '代理', icon: FiUserCheck, count: mockAgents.filter(a => a.agentType === 'agent').length },
    { id: 'consultant' as const, name: '顧問', icon: FiBriefcase, count: mockAgents.filter(a => a.agentType === 'consultant').length },
    { id: 'teacher' as const, name: '老師', icon: FiUser, count: mockAgents.filter(a => a.agentType === 'teacher' && a.hasSuccessfulReferral).length },
    { id: 'student' as const, name: '學生', icon: FiUsers, count: mockAgents.filter(a => a.agentType === 'student' && a.hasSuccessfulReferral).length },
    { id: 'settings' as const, name: '代理設定', icon: FiSettings, count: null }
  ];

  // Render functions
  const renderAgentList = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">代理總數</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAgents}</p>
            </div>
            <SafeIcon icon={FiUsers} className="text-2xl text-blue-600" />
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">總銷售額</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalSales)}</p>
            </div>
            <SafeIcon icon={FiDollarSign} className="text-2xl text-green-600" />
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">總分紅</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalCommission)}</p>
            </div>
            <SafeIcon icon={FiPercent} className="text-2xl text-purple-600" />
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">平均銷售額</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.averagePerAgent)}</p>
            </div>
            <SafeIcon icon={FiTrendingUp} className="text-2xl text-orange-600" />
          </div>
        </motion.div>
      </div>

      {/* Top Performer */}
      {stats.topPerformer && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiAward} className="text-white text-xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">本期最佳代理</h3>
              <p className="text-yellow-700">
                <span className="font-medium">{stats.topPerformer.name}</span> 
                ({stats.topPerformer.agentCode}) - 
                銷售額 {formatPrice(stats.topPerformer.totalSales)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 bg-white rounded-xl p-6 shadow-lg border border-gray-100/60">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">搜尋代理</label>
          <div className="relative">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜尋代理名稱、代碼或郵件..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="w-full lg:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-2">時間篩選</label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">全部時間</option>
            <option value="today">今天</option>
            <option value="this-week">本週</option>
            <option value="this-month">本月</option>
            <option value="this-year">今年</option>
            <option value="custom">自訂期間</option>
          </select>
        </div>
        {dateFilter === 'custom' && (
          <>
            <div className="w-full lg:w-40">
              <label className="block text-sm font-medium text-gray-700 mb-2">開始日期</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="w-full lg:w-40">
              <label className="block text-sm font-medium text-gray-700 mb-2">結束日期</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        )}
      </div>

      {/* Agents Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">代理資訊</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">類型/角色</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">推廣工具</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">銷售表現</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">分紅收入</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getFilteredAgents().map((agent) => (
                <motion.tr
                  key={agent.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center">
                        <SafeIcon icon={agent.isCompany ? FiBuilding : FiUser} className="text-white text-sm" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{agent.name}</div>
                        <div className="text-sm text-gray-500">{agent.email}</div>
                        {agent.isCompany && (
                          <div className="text-xs text-purple-600">聯絡人：{agent.contactPerson}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getAgentTypeColor(agent.agentType)}`}>
                        {getAgentTypeName(agent.agentType)}
                      </span>
                      <div className="text-sm text-gray-900">{agent.roleName}</div>
                      <div className="text-xs text-gray-500">分紅 {agent.rolePercentage}%</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <SafeIcon icon={FiLink} className="text-blue-600 text-sm" />
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{agent.agentCode}</code>
                        <button
                          onClick={() => handleCopyAgentCode(agent.agentCode)}
                          className="text-blue-600 hover:text-blue-800"
                          title="複製代理代碼"
                        >
                          <SafeIcon icon={FiCopy} className="text-xs" />
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <SafeIcon icon={FiExternalLink} className="text-green-600 text-sm" />
                        <span className="text-xs text-gray-600">推廣連結</span>
                        <button
                          onClick={() => handleCopyReferralLink(agent.referralLink)}
                          className="text-green-600 hover:text-green-800"
                          title="複製推廣連結"
                        >
                          <SafeIcon icon={FiCopy} className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        總額：{formatPrice(agent.totalSales)}
                      </div>
                      <div className="text-sm text-gray-600">
                        本月：{formatPrice(agent.monthSales)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {agent.salesCount} 筆 (本月 {agent.monthSalesCount} 筆)
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-green-600">
                        總額：{formatPrice(agent.totalCommission)}
                      </div>
                      <div className="text-sm text-green-700">
                        本月：{formatPrice(agent.monthCommission)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(agent.status)}`}>
                      {getStatusName(agent.status)}
                    </span>
                    {agent.lastSaleDate && (
                      <div className="text-xs text-gray-500 mt-1">
                        最後銷售：{formatDate(agent.lastSaleDate)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedAgent(agent);
                          setShowCommissionModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="查看詳細"
                      >
                        <SafeIcon icon={FiEye} className="text-sm" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => alert('編輯代理功能開發中...')}
                        className="text-green-600 hover:text-green-900"
                        title="編輯代理"
                      >
                        <SafeIcon icon={FiEdit2} className="text-sm" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => alert('發送訊息功能開發中...')}
                        className="text-purple-600 hover:text-purple-900"
                        title="發送訊息"
                      >
                        <SafeIcon icon={FiMessageSquare} className="text-sm" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Records */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100/60 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">銷售紀錄</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">訂單資訊</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">代理</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">客戶</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">產品</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">金額</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">分紅</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getFilteredSalesRecords().map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">{record.orderNumber}</div>
                      <div className="text-sm text-gray-500">{formatDate(record.saleDate)}</div>
                      <div className="text-xs text-blue-600">
                        {record.referralMethod === 'link' ? '推廣連結' : '代理代碼'}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">{record.agentName}</div>
                      <div className="text-sm text-gray-500">{record.agentCode}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">{record.customerName}</div>
                      <div className="text-sm text-gray-500">{record.customerEmail}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">{record.planName}</div>
                      <div className="text-sm text-gray-500">
                        {record.productType === 'individual' ? '個人方案' : '企業方案'}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{formatPrice(record.saleAmount)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-green-600">{formatPrice(record.commission)}</div>
                      <div className="text-sm text-gray-500">{record.commissionRate}%</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(record.paymentStatus)}`}>
                      {getPaymentStatusName(record.paymentStatus)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCommissionSettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">代理設定</h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => alert('儲存設定功能開發中...')}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          儲存所有設定
        </motion.button>
      </div>

      {Object.entries(commissionSettings).map(([agentType, settings]) => (
        <div key={agentType} className="bg-white rounded-xl shadow-lg border border-gray-100/60 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <SafeIcon icon={agentType === 'agent-teacher' ? FiUserCheck : FiBriefcase} className="mr-2 text-blue-600" />
              {settings.name} 分紅設定
            </h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setNewRole({ name: '', percentage: 0, description: '' });
                setEditingRole(agentType);
                setShowRoleModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              新增角色
            </motion.button>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">總分紅比例設定</span>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.totalCommission}
                  onChange={(e) => setCommissionSettings(prev => ({
                    ...prev,
                    [agentType]: { ...prev[agentType], totalCommission: parseInt(e.target.value) }
                  }))}
                  className="w-20 px-3 py-1 border border-gray-300 rounded text-center"
                />
                <span className="text-sm font-medium text-gray-700">%</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium text-gray-900">角色分紅設定</h4>
              <div className="text-sm text-gray-600">
                已使用：{calculateTotalPercentage(agentType)}% / 100%
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {settings.roles.map((role) => (
                <motion.div
                  key={role.id}
                  whileHover={{ scale: 1.02 }}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{role.name}</h5>
                      <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteRole(agentType, role.id)}
                      className="text-red-600 hover:text-red-800 ml-2"
                    >
                      <SafeIcon icon={FiTrash2} className="text-sm" />
                    </motion.button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">分紅比例</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={role.percentage}
                        onChange={(e) => {
                          const newPercentage = parseInt(e.target.value) || 0;
                          const otherRoles = settings.roles.filter(r => r.id !== role.id);
                          const otherTotal = otherRoles.reduce((sum, r) => sum + r.percentage, 0);
                          
                          if (otherTotal + newPercentage <= 100) {
                            setCommissionSettings(prev => ({
                              ...prev,
                              [agentType]: {
                                ...prev[agentType],
                                roles: prev[agentType].roles.map(r =>
                                  r.id === role.id ? { ...r, percentage: newPercentage } : r
                                )
                              }
                            }));
                          } else {
                            alert(`分紅比例總和不能超過 100%\n其他角色總和：${otherTotal}%\n最大可設定：${100 - otherTotal}%`);
                          }
                        }}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                      />
                      <span className="text-sm font-medium text-gray-700">%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  calculateTotalPercentage(agentType) > 100 ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(calculateTotalPercentage(agentType), 100)}%` }}
              ></div>
            </div>
            {calculateTotalPercentage(agentType) > 100 && (
              <p className="text-red-600 text-sm">⚠️ 分紅比例總和超過 100%，請調整各角色比例</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">代理管理面板</h2>
          <p className="text-gray-600 mt-1">管理代理夥伴、分紅設定與銷售追蹤</p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportData}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <SafeIcon icon={FiDownload} className="text-sm" />
            <span>匯出數據</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddAgentModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <SafeIcon icon={FiUserPlus} className="text-sm" />
            <span>新增代理</span>
          </motion.button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <SafeIcon icon={tab.icon} className="text-lg" />
              <span>{tab.name}</span>
              {tab.count !== null && (
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'settings' ? renderCommissionSettings() : renderAgentList()}
      </motion.div>

      {/* Add Agent Modal */}
      {showAddAgentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">新增代理</h3>
                <button onClick={() => setShowAddAgentModal(false)}>
                  <SafeIcon icon={FiX} className="text-white text-xl" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={(e) => { e.preventDefault(); handleAddAgent(); }} className="space-y-6">

                {/* 基本資料 */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">基本資料</h4>
                  
                  {/* 個人/企業切換 */}
                  <div className="mb-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newAgent.isCompany}
                        onChange={(e) => setNewAgent(prev => ({ ...prev, isCompany: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">企業代理</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {newAgent.isCompany ? '公司名稱' : '姓名'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newAgent.name}
                        onChange={(e) => setNewAgent(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder={newAgent.isCompany ? "請輸入公司名稱" : "請輸入姓名"}
                        required
                      />
                    </div>
                    {newAgent.isCompany && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          聯絡人 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newAgent.contactPerson}
                          onChange={(e) => setNewAgent(prev => ({ ...prev, contactPerson: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="請輸入聯絡人姓名"
                          required
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        電子郵件 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={newAgent.email}
                        onChange={(e) => setNewAgent(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="請輸入電子郵件"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">電話</label>
                      <input
                        type="tel"
                        value={newAgent.phone}
                        onChange={(e) => setNewAgent(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="請輸入電話號碼"
                      />
                    </div>
                    {newAgent.isCompany && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          統一編號 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newAgent.taxId}
                          onChange={(e) => setNewAgent(prev => ({ ...prev, taxId: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="請輸入統一編號"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 角色設定 */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">代理角色設定</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      選擇代理角色 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newAgent.roleId}
                      onChange={(e) => setNewAgent(prev => ({ ...prev, roleId: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="">請選擇代理角色</option>
                      {commissionSettings['agent'].roles.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.name} - {role.percentage}% 分紅
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-600 mt-2">
                      其他角色（顧問、老師、學生）會在建立會員時自動增加
                    </p>
                  </div>
                </div>

                {/* 其他資訊 */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">其他資訊</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">銀行帳號</label>
                      <input
                        type="text"
                        value={newAgent.bankAccount}
                        onChange={(e) => setNewAgent(prev => ({ ...prev, bankAccount: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="用於分紅匯款"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">地址</label>
                      <input
                        type="text"
                        value={newAgent.address}
                        onChange={(e) => setNewAgent(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="聯絡地址"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">備註</label>
                      <textarea
                        rows={3}
                        value={newAgent.notes}
                        onChange={(e) => setNewAgent(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="額外備註資訊..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 pt-6 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 font-bold text-lg"
                  >
                    新增代理
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setShowAddAgentModal(false)}
                    className="px-8 py-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Commission Detail Modal */}
      {showCommissionModal && selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">代理詳細資料 - {selectedAgent.name}</h3>
                <button onClick={() => setShowCommissionModal(false)}>
                  <SafeIcon icon={FiX} className="text-white text-xl" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Agent Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <SafeIcon icon={FiDollarSign} className="text-2xl text-blue-600" />
                    <h4 className="text-lg font-semibold text-gray-900">總銷售表現</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">總銷售額</span>
                      <span className="font-medium">{formatPrice(selectedAgent.totalSales)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">月銷售額</span>
                      <span className="font-medium">{formatPrice(selectedAgent.monthSales)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">銷售筆數</span>
                      <span className="font-medium">{selectedAgent.salesCount} 筆</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <SafeIcon icon={FiPercent} className="text-2xl text-green-600" />
                    <h4 className="text-lg font-semibold text-gray-900">分紅收入</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">總分紅</span>
                      <span className="font-medium text-green-600">{formatPrice(selectedAgent.totalCommission)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">月分紅</span>
                      <span className="font-medium text-green-600">{formatPrice(selectedAgent.monthCommission)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">分紅比例</span>
                      <span className="font-medium">{selectedAgent.rolePercentage}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <SafeIcon icon={FiLink} className="text-2xl text-purple-600" />
                    <h4 className="text-lg font-semibold text-gray-900">推廣工具</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">代理代碼</label>
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{selectedAgent.agentCode}</code>
                        <button
                          onClick={() => handleCopyAgentCode(selectedAgent.agentCode)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          <SafeIcon icon={FiCopy} className="text-sm" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">推廣連結</label>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm truncate">{selectedAgent.referralLink}</span>
                        <button
                          onClick={() => handleCopyReferralLink(selectedAgent.referralLink)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          <SafeIcon icon={FiCopy} className="text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sales Records for this agent */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">銷售紀錄</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">訂單</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">客戶</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">產品</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">金額</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">分紅</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {mockSalesRecords
                        .filter(record => record.agentId === selectedAgent.id)
                        .map((record) => (
                          <tr key={record.id}>
                            <td className="px-4 py-3">
                              <div>
                                <div className="font-medium text-gray-900">{record.orderNumber}</div>
                                <div className="text-xs text-blue-600">
                                  {record.referralMethod === 'link' ? '推廣連結' : '代理代碼'}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <div className="font-medium text-gray-900">{record.customerName}</div>
                                <div className="text-sm text-gray-500">{record.customerEmail}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <div className="font-medium text-gray-900">{record.planName}</div>
                                <div className="text-sm text-gray-500">
                                  {record.productType === 'individual' ? '個人方案' : '企業方案'}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {formatPrice(record.saleAmount)}
                            </td>
                            <td className="px-4 py-3 font-medium text-green-600">
                              {formatPrice(record.commission)}
                            </td>
                            <td className="px-4 py-3 text-gray-500">
                              {formatDate(record.saleDate)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-md w-full"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">新增角色</h3>
                <button onClick={() => setShowRoleModal(false)}>
                  <SafeIcon icon={FiX} className="text-white text-xl" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={(e) => { e.preventDefault(); handleAddRole(editingRole!); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    角色名稱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newRole.name}
                    onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="例：資深代理"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分紅比例 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newRole.percentage}
                      onChange={(e) => setNewRole(prev => ({ ...prev, percentage: parseInt(e.target.value) || 0 }))}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      required
                    />
                    <span className="text-gray-700 font-medium">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    目前總和：{editingRole ? calculateTotalPercentage(editingRole) : 0}% / 100%
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">角色描述</label>
                  <textarea
                    rows={3}
                    value={newRole.description}
                    onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="描述此角色的職責與特點..."
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    新增角色
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setShowRoleModal(false)}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AgentManagement;