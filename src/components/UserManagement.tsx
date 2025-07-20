'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import { useAuth } from '@/contexts/AuthContext';
import { Company, MembershipPlan, getCompanies, getCompanyStatistics, getCorporateUsersByCompany, getCorporateUsersByPlan, addCompany, updateCompany, deleteCompany } from '@/data/corporateData';

const {
  FiUsers, FiUser, FiBriefcase, FiUserPlus, FiEdit2, FiTrash2, FiSearch,
  FiDownload, FiX, FiToggleLeft, FiToggleRight, FiEye, FiPlus,
  FiAward, FiShield, FiCalendar, FiDollarSign, FiPercent,
  FiTrendingUp, FiChevronDown, FiChevronUp } = FiIcons;
import { FaGraduationCap, FaBuilding } from "react-icons/fa";

interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'consultant' | 'admin' | 'corporate_contact';
  membershipType?: 'individual' | 'corporate' | null;
  membershipStatus: 'active' | 'expired' | 'expiring_soon' | 'inactive';
  joinDate: string;
  lastLogin: string;
  lastActivity: string;
  companyName?: string;
  companyId?: number | null;
  phone?: string;
  level?: string;
  expertise?: string;
  experience?: string;
  department?: string;
  membership?: {
    plan: string;
    planName: string;
    startDate: string;
    endDate: string;
    price: number;
    autoRenewal: boolean;
    daysRemaining: number;
    isExpiringSoon: boolean;
    // 個人方案時間（用於企業會員保留原本的方案期限）
    individualPlanStartDate?: string;
    individualPlanEndDate?: string;
    individualPlanType?: 'quarterly' | 'annual';
  } | null;
  enterpriseId?: number;
  masterAccount?: string;
}

interface NewUser {
  // 基本資訊 (所有角色必要)
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'consultant' | 'admin' | 'corporate_contact';
  phone: string;
  password: string;
  confirmPassword: string;
  
  // 學生特有欄位
  membershipType?: 'individual' | 'corporate' | '';
  companyId?: string;
  companyName?: string;
  level?: string; // 學習程度
  department?: string; // 部門 (企業學生用)
  membershipPlan?: string;
  membershipDuration?: number;
  autoRenewal?: boolean;
  startDate?: string;
  endDate?: string;
  
  // 講師特有欄位
  expertise?: string; // 專業領域
  experience?: string; // 教學經驗
  qualification?: string; // 資格認證
  bio?: string; // 個人簡介
  
  // 管理員特有欄位
  position?: string; // 職位
  permissions?: string[]; // 權限
  accessLevel?: 'super_admin' | 'admin' | 'moderator';
  
  // 顧問特有欄位
  consultantArea?: string; // 諮詢領域
  commissionRate?: number; // 佣金比例
  clientManagementExperience?: string; // 客戶管理經驗
  salesTarget?: number; // 業績目標
  
  // 企業窗口特有欄位
  companyRole?: string; // 企業內職位
  managedUsers?: number; // 管理用戶數
  corporateLevel?: 'primary' | 'secondary' | 'hr'; // 企業窗口級別
  contractAuthority?: boolean; // 合約簽署權限
}

interface EnterpriseAccount {
  id: number;
  companyName: string;
  masterEmail: string;
  masterName: string;
  purchaseDate: string;
  activationDeadline: string;
  membershipDuration: number;
  totalSlots: number;
  usedSlots: number;
  availableSlots: number;
  status: 'active' | 'inactive' | 'expired';
  membershipPlans: MembershipPlan[]; // 支援多個方案
  subAccounts: Array<{
    id: number;
    email: string;
    name: string;
    status: 'activated' | 'pending';
    activationDate?: string;
  }>;
}

const UserManagement: React.FC = () => {
  const {} = useAuth();
  const [membershipFilter, setMembershipFilter] = useState<'all' | 'individual' | 'corporate' | 'corporate_companies'>('all');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [, setEditingUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState(getCompanies());
  const [expandedCompanies, setExpandedCompanies] = useState<Set<number>>(new Set());
  const [expandedPlans, setExpandedPlans] = useState<Set<number>>(new Set());
  const [showAddPlanUserModal, setShowAddPlanUserModal] = useState(false);
  const [showEditPlanUserModal, setShowEditPlanUserModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [editingPlanUser, setEditingPlanUser] = useState<any>(null);
  
  // 企業CRUD相關狀態
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  
  // 企業方案CRUD相關狀態
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  
  // 新增方案表單狀態
  const [newPlan, setNewPlan] = useState({
    name: '',
    duration: 12,
    durationType: 'annual' as 'quarterly' | 'annual',
    slots: 0,
    basePrice: 0,
    discountRate: 0,
    startDate: '',
    endDate: ''
  });
  
  // 新增企業表單狀態
  const [newCompany, setNewCompany] = useState({
    name: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    industry: '',
    employeeCount: 0,
    membershipPlan: '',
    totalSlots: 0,
    usedSlots: 0,
    startDate: '',
    endDate: '',
    status: 'active' as 'active' | 'inactive' | 'expired'
  });

  // 新增用戶表單狀態
  const [newUser, setNewUser] = useState<NewUser>({
    // 基本資訊
    name: '',
    email: '',
    role: 'student',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // 學生特有欄位
    membershipType: '',
    companyId: '',
    companyName: '',
    level: '',
    department: '',
    membershipPlan: '',
    membershipDuration: 12,
    autoRenewal: true,
    startDate: '',
    endDate: '',
    
    // 講師特有欄位
    expertise: '',
    experience: '',
    qualification: '',
    bio: '',
    
    // 管理員特有欄位
    position: '',
    permissions: [],
    accessLevel: 'admin',
    
    // 顧問特有欄位
    consultantArea: '',
    commissionRate: 0,
    clientManagementExperience: '',
    salesTarget: 0,
    
    // 企業窗口特有欄位
    companyRole: '',
    managedUsers: 0,
    corporateLevel: 'secondary',
    contractAuthority: false
  });

  // 編輯用戶表單狀態
  const [editUser, setEditUser] = useState<NewUser & { id: string; membershipStatus: string }>({
    id: '',
    name: '',
    email: '',
    role: 'student',
    membershipType: '',
    companyId: '',
    companyName: '',
    phone: '',
    level: '',
    expertise: '',
    experience: '',
    department: '',
    membershipPlan: '',
    membershipDuration: 12,
    autoRenewal: true,
    membershipStatus: 'active',
    startDate: '',
    endDate: '',
    password: '',
    confirmPassword: ''
  });

  // Mock enterprise accounts data
  const [enterpriseAccounts] = useState<EnterpriseAccount[]>([
    {
      id: 1,
      companyName: '台灣科技股份有限公司',
      masterEmail: 'admin@taiwantech.com',
      masterName: '張經理',
      purchaseDate: '2024-01-15',
      activationDeadline: '2025-01-15',
      membershipDuration: 12,
      totalSlots: 10,
      usedSlots: 7,
      availableSlots: 3,
      status: 'active',
      membershipPlans: [
        {
          id: 1,
          name: '企業基礎方案',
          type: 'primary',
          duration: 12,
          durationType: 'annual',
          purchaseDate: '2024-01-15',
          startDate: '2024-01-15',
          endDate: '2025-01-15',
          slots: 10,
          status: 'active',
          basePrice: 12000,
          discountRate: 0.15,
          features: ['All courses', 'Priority support']
        },
        {
          id: 2,
          name: '進階培訓模組',
          type: 'addon',
          duration: 3,
          durationType: 'quarterly',
          purchaseDate: '2024-03-01',
          startDate: '2024-03-01',
          endDate: '2024-06-01',
          status: 'expiring_soon',
          basePrice: 3000,
          discountRate: 0.1,
          features: ['Advanced training']
        },
        {
          id: 3,
          name: 'AI 學習助手',
          type: 'addon',
          duration: 3,
          durationType: 'quarterly',
          purchaseDate: '2024-06-01',
          startDate: '2024-06-01',
          endDate: '2024-09-01',
          status: 'active',
          basePrice: 3600,
          features: ['AI assistant']
        }
      ],
      subAccounts: [
        {
          id: 1,
          email: 'user1@taiwantech.com',
          name: '王小明',
          status: 'activated',
          activationDate: '2024-01-20'
        },
        {
          id: 2,
          email: 'user2@taiwantech.com',
          name: '李小華',
          status: 'activated',
          activationDate: '2024-01-25'
        }
      ]
    },
    {
      id: 2,
      companyName: '創新軟體有限公司',
      masterEmail: 'hr@innovation.com',
      masterName: '陳主管',
      purchaseDate: '2024-02-01',
      activationDeadline: '2025-02-01',
      membershipDuration: 12,
      totalSlots: 5,
      usedSlots: 3,
      availableSlots: 2,
      status: 'active',
      membershipPlans: [
        {
          id: 4,
          name: '企業標準方案',
          type: 'primary',
          duration: 3,
          durationType: 'quarterly',
          purchaseDate: '2024-02-01',
          startDate: '2024-02-01',
          endDate: '2024-05-01',
          slots: 5,
          status: 'active',
          basePrice: 4500,
          discountRate: 0.1,
          features: ['Standard courses']
        },
        {
          id: 5,
          name: '團隊協作工具',
          type: 'addon',
          duration: 3,
          durationType: 'quarterly',
          purchaseDate: '2024-04-01',
          startDate: '2024-04-01',
          endDate: '2024-07-01',
          status: 'active',
          basePrice: 2400,
          features: ['Collaboration tools']
        }
      ],
      subAccounts: [
        {
          id: 3,
          email: 'dev1@innovation.com',
          name: '林工程師',
          status: 'activated',
          activationDate: '2024-02-05'
        }
      ]
    }
  ]);

  const generateMockUsers = (): User[] => {
    const individualUsers: User[] = [
      {
        id: 1,
        name: '王小明',
        email: 'student1@example.com',
        role: 'student',
        membershipType: 'individual',
        membershipStatus: 'active',
        joinDate: '2024-01-15',
        lastLogin: '2024-12-20',
        lastActivity: '2024-12-20',
        companyName: '',
        phone: '0912-345-678',
        level: '中級',
        expertise: '',
        experience: '',
        department: '',
        membership: {
          plan: 'quarterly',
          planName: '季方案',
          startDate: '2024-12-01',
          endDate: '2025-03-01',
          price: 10800,
          autoRenewal: true,
          daysRemaining: 71,
          isExpiringSoon: false
        }
      },
      {
        id: 2,
        name: '李小華',
        email: 'student2@example.com',
        role: 'student',
        membershipType: 'individual',
        membershipStatus: 'expiring_soon',
        joinDate: '2024-02-10',
        lastLogin: '2024-12-19',
        lastActivity: '2024-12-19',
        companyName: '',
        phone: '0923-456-789',
        level: '初級',
        expertise: '',
        experience: '',
        department: '',
        membership: {
          plan: 'quarterly',
          planName: '季方案',
          startDate: '2024-12-15',
          endDate: '2025-01-15',
          price: 4500,
          autoRenewal: false,
          daysRemaining: 5,
          isExpiringSoon: true
        }
      },
      {
        id: 3,
        name: '張老師',
        email: 'instructor1@example.com',
        role: 'instructor',
        membershipStatus: 'active',
        joinDate: '2023-09-01',
        lastLogin: '2024-12-20',
        lastActivity: '2024-12-20',
        companyName: '',
        phone: '0934-567-890',
        level: '',
        expertise: '商務華語',
        experience: '5年',
        department: '',
        membership: null
      },
      {
        id: 4,
        name: '陳管理員',
        email: 'admin@example.com',
        role: 'admin',
        membershipStatus: 'active',
        joinDate: '2023-01-01',
        lastLogin: '2024-12-20',
        lastActivity: '2024-12-20',
        companyName: '',
        phone: '0945-678-901',
        level: '',
        expertise: '',
        experience: '',
        department: '',
        membership: null
      }
    ];

    // Generate corporate users from enterprise accounts
    const corporateUsers: User[] = [];
    enterpriseAccounts.forEach(account => {
      // 找到對應的企業來獲取方案類型
      const company = companies.find(comp => comp.id === account.id);
      const primaryPlan = company?.membershipPlans.find(plan => plan.type === 'primary');
      const planTypeName = primaryPlan?.duration === 3 ? '企業季方案' : '企業年方案';
      
      account.subAccounts.forEach(subAccount => {
        corporateUsers.push({
          id: 100 + subAccount.id,
          name: subAccount.name,
          email: subAccount.email,
          role: 'student',
          membershipType: 'corporate',
          membershipStatus: subAccount.status === 'activated' ? 'active' : 'inactive',
          joinDate: subAccount.activationDate || account.purchaseDate,
          lastLogin: subAccount.status === 'activated' ? '2024-12-19' : '從未登入',
          lastActivity: subAccount.status === 'activated' ? '2024-12-19' : '從未活動',
          companyName: account.companyName,
          companyId: account.id,
          phone: `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
          level: subAccount.status === 'activated' ? '中級' : '',
          expertise: '',
          experience: '',
          department: '資訊部',
          membership: {
            plan: 'corporate',
            planName: planTypeName,
            startDate: account.purchaseDate,
            endDate: account.activationDeadline,
            price: 0,
            autoRenewal: true,
            daysRemaining: Math.ceil((new Date(account.activationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
            isExpiringSoon: false
          },
          enterpriseId: account.id,
          masterAccount: account.masterEmail
        });
      });
    });

    return [...individualUsers, ...corporateUsers];
  };

  const [mockUsers, setMockUsers] = useState<User[]>(generateMockUsers());

  // Helper functions
  const formatDate = (dateString: string): string => {
    if (!dateString || dateString === '從未登入' || dateString === '從未活動') return dateString;
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const calculateEndDate = (startDate: string, planDuration: number): string => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + planDuration);
    return date.toISOString().split('T')[0];
  };

  const getRoleName = (role: string): string => {
    switch (role) {
      case 'student': return '學生';
      case 'instructor': return '老師';
      case 'admin': return '管理員';
      default: return role;
    }
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'instructor': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMembershipTypeName = (type: string): string => {
    switch (type) {
      case 'individual': return '個人會員';
      case 'corporate': return '企業會員';
      default: return '未知';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-600';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusName = (status: string): string => {
    switch (status) {
      case 'active': return '啟用';
      case 'inactive': return '停用';
      case 'expired': return '過期';
      default: return '未知';
    }
  };

  const getMembershipStatusName = (status: string): string => {
    switch (status) {
      case 'active': return '有效';
      case 'expired': return '已過期';
      case 'expiring_soon': return '即將過期';
      case 'inactive': return '未啟用';
      default: return status;
    }
  };

  const getMembershipStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'expiring_soon': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserIcon = (user: User) => {
    if (user.role === 'instructor') return FaGraduationCap;
    if (user.role === 'admin') return FiShield;
    if (user.membershipType === 'corporate') return FiBriefcase;
    return FiUser;
  };

  const getUserIconColor = (user: User): string => {
    if (user.role === 'instructor') return 'bg-green-500';
    if (user.role === 'admin') return 'bg-purple-500';
    if (user.membershipType === 'corporate') return 'bg-indigo-500';
    return 'bg-blue-500';
  };

  // Filter functions
  const getFilteredUsers = (): User[] => {
    const users = mockUsers.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (user.companyName && user.companyName.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchesSearch) return false;

      if (membershipFilter === 'individual' && user.membershipType !== 'individual') return false;
      if (membershipFilter === 'corporate' && user.membershipType !== 'corporate') return false;
      if (membershipFilter === 'corporate' && selectedCompany !== 'all') {
        if (user.companyId !== parseInt(selectedCompany)) return false;
      }

      switch (filterOption) {
        case 'students': return user.role === 'student';
        case 'instructors': return user.role === 'instructor';
        case 'active_memberships': return user.membershipStatus === 'active';
        case 'expired_memberships': return user.membershipStatus === 'expired';
        case 'expiring_soon': return user.membershipStatus === 'expiring_soon';
        case 'inactive': return user.membershipStatus === 'inactive';
        default: return true;
      }
    });

    return users;
  };

  // 新增用戶功能
  const validateUserForm = (): string[] => {
    const errors: string[] = [];

    if (!newUser.name.trim()) errors.push('姓名');
    if (!newUser.email.trim()) errors.push('電子郵件');
    if (!newUser.role) errors.push('角色');

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (newUser.email && !emailPattern.test(newUser.email)) {
      errors.push('電子郵件格式不正確');
    }

    const emailExists = mockUsers.some(user => user.email === newUser.email);
    if (emailExists) {
      errors.push('此電子郵件已被使用');
    }

    if (!newUser.password || newUser.password.length < 6) {
      errors.push('密碼至少需要6個字符');
    }

    if (newUser.password !== newUser.confirmPassword) {
      errors.push('密碼確認不一致');
    }

    // 角色特定驗證
    if (newUser.role === 'student') {
      if (!newUser.membershipType) {
        errors.push('會員類型（學生必填）');
      }

      if (newUser.membershipType === 'corporate' && !newUser.companyId) {
        errors.push('企業（企業會員必填）');
      }

      if (newUser.membershipType === 'individual' && !newUser.membershipPlan) {
        errors.push('會員方案（個人會員必填）');
      }
    } else if (newUser.role === 'instructor') {
      // 講師必填欄位驗證可以根據需要添加
      // 例如：專業領域、教學經驗等是否為必填
    } else if (newUser.role === 'admin') {
      if (!newUser.position?.trim()) {
        errors.push('職位（管理員必填）');
      }
      if (!newUser.accessLevel) {
        errors.push('權限等級（管理員必填）');
      }
    } else if (newUser.role === 'consultant') {
      if (!newUser.consultantArea?.trim()) {
        errors.push('諮詢領域（顧問必填）');
      }
    } else if (newUser.role === 'corporate_contact') {
      if (!newUser.companyRole?.trim()) {
        errors.push('企業內職位（企業窗口必填）');
      }
      if (!newUser.corporateLevel) {
        errors.push('企業窗口級別（企業窗口必填）');
      }
    }

    if (newUser.phone) {
      const phonePattern = /^09\d{8}$/;
      if (!phonePattern.test(newUser.phone)) {
        errors.push('手機號碼格式不正確（格式：09xxxxxxxx）');
      }
    }

    return errors;
  };

  const handleSaveUser = () => {
    const validationErrors = validateUserForm();
    if (validationErrors.length > 0) {
      alert(`❌ 請檢查以下欄位：\n\n• ${validationErrors.join('\n• ')}`);
      return;
    }

    const currentDate = new Date().toISOString().split('T')[0];
    let membershipData = null;
    let membershipStatus: User['membershipStatus'] = 'inactive';

    if (newUser.role === 'student' && newUser.membershipType === 'individual' && newUser.membershipPlan) {
      const planDetails: Record<string, { planName: string; duration: number; price: number }> = {
        'quarterly': { planName: '季方案', duration: 3, price: 10800 },
        'yearly': { planName: '年方案', duration: 12, price: 36000 }
      };

      const plan = planDetails[newUser.membershipPlan];
      if (plan) {
        const startDate = newUser.startDate || currentDate;
        const endDate = newUser.endDate || calculateEndDate(startDate, plan.duration);
        membershipData = {
          plan: newUser.membershipPlan,
          planName: plan.planName,
          startDate: startDate,
          endDate: endDate,
          price: plan.price,
          autoRenewal: newUser.autoRenewal || false,
          daysRemaining: Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
          isExpiringSoon: false
        };
        membershipStatus = 'active';
      }
    } else if (newUser.role === 'student' && newUser.membershipType === 'corporate') {
      const company = companies.find(comp => comp.id === parseInt(newUser.companyId || '0'));
      if (company) {
        // 根據企業的主要方案類型來決定顯示的方案名稱
        const primaryPlan = company.membershipPlans.find(plan => plan.type === 'primary');
        const planTypeName = primaryPlan?.duration === 3 ? '企業季方案' : '企業年方案';
        
        membershipData = {
          plan: 'corporate',
          planName: planTypeName,
          startDate: company.startDate,
          endDate: company.endDate,
          price: 0,
          autoRenewal: true,
          daysRemaining: Math.ceil((new Date(company.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
          isExpiringSoon: false
        };
        membershipStatus = 'active';
      }
    } else if (newUser.role !== 'student') {
      membershipStatus = 'active';
    }

    const newUserData: User = {
      id: Math.max(...mockUsers.map(u => typeof u.id === 'number' ? u.id : 0), 0) + 1,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      membershipType: newUser.role === 'student' ? (newUser.membershipType as 'individual' | 'corporate') : null,
      membershipStatus,
      joinDate: currentDate,
      lastLogin: '從未登入',
      lastActivity: '從未活動',
      companyName: newUser.membershipType === 'corporate' ? newUser.companyName : undefined,
      companyId: newUser.membershipType === 'corporate' ? parseInt(newUser.companyId || '0') : null,
      phone: newUser.phone,
      level: newUser.level,
      expertise: newUser.expertise,
      experience: newUser.experience,
      department: newUser.department,
      membership: membershipData
    };

    setMockUsers(prev => [...prev, newUserData]);
    setNewUser({
      // 基本資訊
      name: '',
      email: '',
      role: 'student',
      phone: '',
      password: '',
      confirmPassword: '',
      
      // 學生特有欄位
      membershipType: '',
      companyId: '',
      companyName: '',
      level: '',
      department: '',
      membershipPlan: '',
      membershipDuration: 12,
      autoRenewal: true,
      startDate: '',
      endDate: '',
      
      // 講師特有欄位
      expertise: '',
      experience: '',
      qualification: '',
      bio: '',
      
      // 管理員特有欄位
      position: '',
      permissions: [],
      accessLevel: 'admin',
      
      // 顧問特有欄位
      consultantArea: '',
      commissionRate: 0,
      clientManagementExperience: '',
      salesTarget: 0,
      
      // 企業窗口特有欄位
      companyRole: '',
      managedUsers: 0,
      corporateLevel: 'secondary',
      contractAuthority: false
    });
    setShowAddUserModal(false);
    alert('✅ 用戶已成功新增！');
  };

  // 編輯用戶功能
  const handleEditUser = (userId: number) => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      setEditUser({
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        
        // 學生特有欄位
        membershipType: user.membershipType || '',
        companyId: user.companyId?.toString() || '',
        companyName: user.companyName || '',
        level: user.level || '',
        department: user.department || '',
        membershipPlan: user.membership?.plan || '',
        membershipDuration: 12,
        autoRenewal: user.membership?.autoRenewal || false,
        startDate: user.membership?.startDate || '',
        endDate: user.membership?.endDate || '',
        
        // 講師特有欄位
        expertise: user.expertise || '',
        experience: user.experience || '',
        qualification: (user as any).qualification || '',
        bio: (user as any).bio || '',
        
        // 管理員特有欄位
        position: (user as any).position || '',
        permissions: (user as any).permissions || [],
        accessLevel: (user as any).accessLevel || 'admin',
        
        // 顧問特有欄位
        consultantArea: (user as any).consultantArea || '',
        commissionRate: (user as any).commissionRate || 0,
        clientManagementExperience: (user as any).clientManagementExperience || '',
        salesTarget: (user as any).salesTarget || 0,
        
        // 企業窗口特有欄位
        companyRole: (user as any).companyRole || '',
        managedUsers: (user as any).managedUsers || 0,
        corporateLevel: (user as any).corporateLevel || 'secondary',
        contractAuthority: (user as any).contractAuthority || false,
        
        membershipStatus: user.membershipStatus || 'active',
        password: '',
        confirmPassword: ''
      });
      setEditingUser(user);
      setShowEditUserModal(true);
    }
  };

  // 編輯用戶表單驗證
  const validateEditUserForm = (): string[] => {
    const errors: string[] = [];

    if (!editUser.name.trim()) errors.push('姓名');
    if (!editUser.email.trim()) errors.push('電子郵件');
    if (!editUser.role) errors.push('角色');

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (editUser.email && !emailPattern.test(editUser.email)) {
      errors.push('電子郵件格式不正確');
    }

    const emailExists = mockUsers.some(user => user.email === editUser.email && user.id.toString() !== editUser.id);
    if (emailExists) {
      errors.push('此電子郵件已被其他用戶使用');
    }

    if (editUser.role === 'student') {
      if (!editUser.membershipType) {
        errors.push('會員類型（學生必填）');
      }

      if (editUser.membershipType === 'corporate' && !editUser.companyId) {
        errors.push('企業（企業會員必填）');
      }

      if (editUser.membershipType === 'individual' && !editUser.membershipPlan) {
        errors.push('會員方案（個人會員必填）');
      }
    }

    if (editUser.phone) {
      const phonePattern = /^09\d{8}$/;
      if (!phonePattern.test(editUser.phone)) {
        errors.push('手機號碼格式不正確（格式：09xxxxxxxx）');
      }
    }

    return errors;
  };

  // 儲存編輯用戶
  const handleSaveEditUser = () => {
    const validationErrors = validateEditUserForm();
    if (validationErrors.length > 0) {
      alert(`❌ 請檢查以下欄位：\n\n• ${validationErrors.join('\n• ')}`);
      return;
    }

    setMockUsers(prevUsers => prevUsers.map(user => {
      if (user.id.toString() === editUser.id) {
        let updatedMembership = user.membership;
        let updatedMembershipStatus = editUser.membershipStatus as User['membershipStatus'];

        if (editUser.role === 'student' && editUser.membershipType === 'individual' && editUser.membershipPlan) {
          const planDetails: Record<string, { planName: string; duration: number; price: number }> = {
            'quarterly': { planName: '季方案', duration: 3, price: 10800 },
            'yearly': { planName: '年方案', duration: 12, price: 36000 }
          };

          const plan = planDetails[editUser.membershipPlan];
          if (plan) {
            const startDate = editUser.startDate || new Date().toISOString().split('T')[0];
            const endDate = editUser.endDate || calculateEndDate(startDate, plan.duration);
            updatedMembership = {
              plan: editUser.membershipPlan,
              planName: plan.planName,
              startDate: startDate,
              endDate: endDate,
              price: plan.price,
              autoRenewal: editUser.autoRenewal || false,
              daysRemaining: Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
              isExpiringSoon: false
            };
            updatedMembershipStatus = 'active';
          }
        } else if (editUser.role === 'student' && editUser.membershipType === 'corporate') {
          // 根據企業的主要方案類型來決定顯示的方案名稱
          const company = companies.find(comp => comp.id === parseInt(editUser.companyId || (user.companyId?.toString() ?? '0')));
          const primaryPlan = company?.membershipPlans.find(plan => plan.type === 'primary');
          const planTypeName = primaryPlan?.duration === 3 ? '企業季方案' : '企業年方案';
          
          updatedMembership = {
            plan: 'corporate',
            planName: planTypeName,
            startDate: editUser.startDate || user.membership?.startDate || new Date().toISOString().split('T')[0],
            endDate: editUser.endDate || user.membership?.endDate || '',
            price: 0,
            autoRenewal: editUser.autoRenewal || false,
            daysRemaining: user.membership?.daysRemaining || 365,
            isExpiringSoon: false
          };
        } else if (editUser.role !== 'student') {
          updatedMembership = null;
          updatedMembershipStatus = 'active';
        }

        return {
          ...user,
          name: editUser.name,
          email: editUser.email,
          role: editUser.role,
          membershipType: editUser.role === 'student' ? (editUser.membershipType as 'individual' | 'corporate') : null,
          membershipStatus: updatedMembershipStatus,
          companyName: editUser.membershipType === 'corporate' ? editUser.companyName : undefined,
          companyId: editUser.membershipType === 'corporate' ? parseInt(editUser.companyId || '0') : null,
          phone: editUser.phone,
          level: editUser.level,
          expertise: editUser.expertise,
          experience: editUser.experience,
          department: editUser.department,
          membership: updatedMembership
        };
      }
      return user;
    }));

    setShowEditUserModal(false);
    setEditingUser(null);
    alert('✅ 用戶資料已更新！');
  };

  // Toggle auto renewal
  const handleToggleAutoRenewal = (userId: number) => {
    setMockUsers(prevUsers => prevUsers.map(user => {
      if (user.id === userId && user.membership) {
        return {
          ...user,
          membership: {
            ...user.membership,
            autoRenewal: !user.membership.autoRenewal
          }
        };
      }
      return user;
    }));
    alert('✅ 自動續約設定已更新！');
  };

  // 刪除用戶功能
  const handleDeleteUser = (userId: number) => {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) return;

    const confirmMessage = `確定要刪除用戶「${user.name}」嗎？此操作無法復原。`;
    if (confirm(confirmMessage)) {
      setMockUsers(prev => prev.filter(u => u.id !== userId));
      alert('✅ 用戶已成功刪除！');
    }
  };

  // 企業CRUD功能
  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 驗證必填字段
    if (!newCompany.name.trim()) {
      alert('❌ 請輸入企業名稱');
      return;
    }
    
    if (!newCompany.contactPerson.trim()) {
      alert('❌ 請輸入聯絡人姓名');
      return;
    }
    
    if (!newCompany.contactEmail.trim()) {
      alert('❌ 請輸入聯絡信箱');
      return;
    }
    
    // 驗證 email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newCompany.contactEmail)) {
      alert('❌ 請輸入有效的信箱格式');
      return;
    }
    
    try {
      const result = addCompany(newCompany);
      
      // 更新企業列表
      setCompanies(getCompanies());
      
      // 如果是從新增用戶頁面來的，自動選中新增的企業
      if (showAddUserModal && newUser.membershipType === 'corporate') {
        setNewUser(prev => ({
          ...prev,
          companyId: result.id.toString(),
          companyName: result.name
        }));
      }
      
      setNewCompany({
        name: '',
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        industry: '',
        employeeCount: 0,
        membershipPlan: '',
        totalSlots: 0,
        usedSlots: 0,
        startDate: '',
        endDate: '',
        status: 'active'
      });
      setShowAddCompanyModal(false);
      alert('✅ 企業新增成功！已自動選中該企業');
    } catch (error) {
      alert('❌ 企業新增失敗！');
    }
  };

  const handleEditCompany = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCompany) return;
    
    // 驗證必填字段
    if (!editingCompany.name.trim()) {
      alert('❌ 請輸入企業名稱');
      return;
    }
    
    if (!editingCompany.contactPerson.trim()) {
      alert('❌ 請輸入聯絡人姓名');
      return;
    }
    
    if (!editingCompany.contactEmail.trim()) {
      alert('❌ 請輸入聯絡信箱');
      return;
    }
    
    // 驗證 email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editingCompany.contactEmail)) {
      alert('❌ 請輸入有效的信箱格式');
      return;
    }
    
    try {
      const result = updateCompany(editingCompany.id!, editingCompany);
      if (result) {
        setShowEditCompanyModal(false);
        setEditingCompany(null);
        alert('✅ 企業資料更新成功！');
      } else {
        alert('❌ 企業資料更新失敗！');
      }
    } catch (error) {
      alert('❌ 企業資料更新失敗！');
    }
  };

  const handleDeleteCompany = (companyId: number) => {
    if (confirm('確定要刪除此企業嗎？這將同時刪除該企業的所有用戶資料。')) {
      try {
        const result = deleteCompany(companyId);
        if (result) {
          alert('✅ 企業刪除成功！');
        } else {
          alert('❌ 企業刪除失敗！');
        }
      } catch (error) {
        alert('❌ 企業刪除失敗！');
      }
    }
  };

  // 企業方案CRUD功能
  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 驗證必填字段
    if (!newPlan.name.trim()) {
      alert('❌ 請輸入方案名稱');
      return;
    }
    
    if (!newPlan.startDate) {
      alert('❌ 請選擇開始日期');
      return;
    }
    
    if (!newPlan.endDate) {
      alert('❌ 請選擇結束日期');
      return;
    }
    
    if (new Date(newPlan.endDate) <= new Date(newPlan.startDate)) {
      alert('❌ 結束日期必須晚於開始日期');
      return;
    }
    
    try {
      // 生成新的方案 ID
      const newId = Date.now();
      const planToAdd = {
        id: newId,
        ...newPlan,
        type: 'primary' as const, // 企業方案統一為主要方案
        purchaseDate: newPlan.startDate,
        status: 'active' as const,
        usedSlots: 0,
        features: []
      };
      
      // 更新企業的方案列表
      setCompanies(prev => prev.map(company => 
        company.id === selectedCompanyId
          ? { ...company, membershipPlans: [...company.membershipPlans, planToAdd] }
          : company
      ));
      
      // 重置表單
      setNewPlan({
        name: '',
        duration: 12,
        durationType: 'annual',
        slots: 0,
        basePrice: 0,
        discountRate: 0,
        startDate: '',
        endDate: ''
      });
      
      setShowAddPlanModal(false);
      setSelectedCompanyId(null);
      alert('✅ 方案新增成功！');
    } catch (error) {
      alert('❌ 方案新增失敗！');
    }
  };

  const handleEditPlan = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingPlan) return;
    
    // 驗證必填字段
    if (!editingPlan.name.trim()) {
      alert('❌ 請輸入方案名稱');
      return;
    }
    
    try {
      // 更新企業的方案列表
      setCompanies(prev => prev.map(company => {
        if (company.id === selectedCompanyId) {
          return {
            ...company,
            membershipPlans: company.membershipPlans.map(plan =>
              plan.id === editingPlan.id ? editingPlan : plan
            ),
          };
        }
        return company;
      }));
      
      setShowEditPlanModal(false);
      setEditingPlan(null);
      alert('✅ 方案更新成功！');
    } catch (error) {
      alert('❌ 方案更新失敗！');
    }
  };

  const handleDeletePlan = (companyId: number, planId: number) => {
    if (confirm('確定要刪除此方案嗎？這將影響該方案下的所有用戶。')) {
      try {
        // 更新企業的方案列表
        setCompanies(prev => prev.map(company => 
          company.id === companyId
            ? { ...company, membershipPlans: company.membershipPlans.filter(plan => plan.id !== planId) }
            : company
        ));
        
        alert('✅ 方案刪除成功！');
      } catch (error) {
        alert('❌ 方案刪除失敗！');
      }
    }
  };

  // 切換企業展開狀態
  const toggleCompanyExpansion = (companyId: number, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setExpandedCompanies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
      } else {
        newSet.add(companyId);
      }
      return newSet;
    });
  };

  // 切換方案展開狀態
  const togglePlanExpansion = (planId: number, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setExpandedPlans(prev => {
      const newSet = new Set(prev);
      if (newSet.has(planId)) {
        newSet.delete(planId);
      } else {
        newSet.add(planId);
      }
      return newSet;
    });
  };

  // CSV匯出功能
  const handleExportCSV = () => {
    const filteredUsers = getFilteredUsers();
    const headers = [
      '姓名', '電子郵件', '角色', '會員類型', '企業名稱',
      '會員方案', '會員狀態', '開始日期', '到期日期', '剩餘天數',
      '最後登入', '最後活動', '加入日期', '電話', '學習程度',
      '專業領域', '教學經驗', '部門', '自動續約'
    ];

    const csvData = filteredUsers.map(user => [
      user.name,
      user.email,
      getRoleName(user.role),
      user.membershipType ? getMembershipTypeName(user.membershipType) : '非會員',
      user.companyName || '-',
      user.membership?.planName || '-',
      getMembershipStatusName(user.membershipStatus),
      user.membership?.startDate ? formatDate(user.membership.startDate) : '-',
      user.membership?.endDate ? formatDate(user.membership.endDate) : '-',
      user.membership?.daysRemaining?.toString() || '-',
      formatDate(user.lastLogin),
      formatDate(user.lastActivity),
      formatDate(user.joinDate),
      user.phone || '-',
      user.level || '-',
      user.expertise || '-',
      user.experience || '-',
      user.department || '-',
      user.membership?.autoRenewal ? '是' : '否'
    ]);

    const BOM = '\uFEFF';
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);

    const timestamp = new Date().toISOString().slice(0, 10);
    const filterText = membershipFilter === 'all' ? '全部' : membershipFilter === 'individual' ? '個人會員' : '企業會員';
    link.setAttribute('download', `TLI用戶管理_${filterText}_${timestamp}.csv`);

    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`✅ CSV檔案匯出成功！\n\n檔案名稱：TLI用戶管理_${filterText}_${timestamp}.csv\n匯出筆數：${filteredUsers.length} 筆`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900">用戶管理</h2>
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <SafeIcon icon={FiUserPlus} className="text-sm" />
            <span>新增用戶</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <SafeIcon icon={FiDownload} className="text-sm" />
            <span>匯出CSV</span>
          </motion.button>
        </div>
      </div>

      {/* Membership Type Filter */}
      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-xl p-2 shadow-lg border border-gray-100/60 flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setMembershipFilter('all');
              setSelectedCompany('all');
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              membershipFilter === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <SafeIcon icon={FiUsers} className="inline mr-2" />
            全部會員
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setMembershipFilter('individual');
              setSelectedCompany('all');
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              membershipFilter === 'individual'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <SafeIcon icon={FiUser} className="inline mr-2" />
            個人會員
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setMembershipFilter('corporate');
              setSelectedCompany('all');
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              membershipFilter === 'corporate'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <SafeIcon icon={FiBriefcase} className="inline mr-2" />
            企業會員
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setMembershipFilter('corporate_companies');
              setSelectedCompany('all');
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              membershipFilter === 'corporate_companies'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <SafeIcon icon={FaBuilding} className="inline mr-2" />
            企業管理
          </motion.button>
        </div>
      </div>


      {/* Search and Filter */}
      <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 bg-white rounded-xl p-6 shadow-lg border border-gray-100/60">
        <div className="flex-1 lg:max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">搜尋用戶</label>
          <div className="relative">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜尋姓名、郵件或企業名稱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="w-full lg:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-2">篩選條件</label>
          <select
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">全部用戶</option>
            <option value="students">學生</option>
            <option value="instructors">老師</option>
            <option value="active_memberships">有效會員</option>
            <option value="expired_memberships">已過期會員</option>
            <option value="expiring_soon">即將過期</option>
            <option value="inactive">未啟用</option>
          </select>
        </div>
        {membershipFilter === 'corporate_companies' && (
          <div className="flex items-end">
            <button
              onClick={() => setShowAddCompanyModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 whitespace-nowrap"
            >
              <SafeIcon icon={FiUserPlus} className="w-4 h-4" />
              <span>新增企業</span>
            </button>
          </div>
        )}
      </div>

      {/* Corporate Companies View */}
      {membershipFilter === 'corporate_companies' && (
        <div className="space-y-6">
          {companies.map((company) => {
            const stats = getCompanyStatistics(company.id.toString());
            const users = getCorporateUsersByCompany(company.id.toString());
            
            return (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100/60 overflow-hidden"
              >
                {/* 企業資訊標題 - 整個區塊可點擊 */}
                <motion.div 
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
                  onClick={(e) => toggleCompanyExpansion(company.id, e)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <SafeIcon icon={FiBriefcase} className="text-white text-xl" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900">{company.name}</h3>
                            <p className="text-gray-600">聯絡人：{company.contactPerson}</p>
                            <p className="text-sm text-gray-500">{company.contactEmail}</p>
                            
                            {/* 收合狀態下顯示的簡要信息 */}
                            <div className="mt-3 space-y-3">
                              
                              {/* 方案信息 - 支援多個方案 */}
                              <div className="space-y-2">
                                {company.membershipPlans.map((plan, index) => {
                                  // 計算剩餘天數和進度
                                  const totalDays = Math.ceil((new Date(plan.endDate).getTime() - new Date(plan.startDate).getTime()) / (1000 * 60 * 60 * 24));
                                  const remainingDays = Math.max(0, Math.ceil((new Date(plan.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
                                  const progressPercentage = Math.max(0, Math.min(100, (remainingDays / totalDays) * 100));
                                  
                                  // 根據方案類型設定顏色
                                  const getColorScheme = (type: string, status: string) => {
                                    if (status === 'expired') return { border: 'border-red-200', bg: 'bg-red-50', text: 'text-red-800', badge: 'text-red-600 bg-red-100', progress: 'bg-red-600', progressBg: 'bg-red-200' };
                                    if (status === 'expiring_soon') return { border: 'border-yellow-200', bg: 'bg-yellow-50', text: 'text-yellow-800', badge: 'text-yellow-600 bg-yellow-100', progress: 'bg-yellow-600', progressBg: 'bg-yellow-200' };
                                    
                                    switch (type) {
                                      case 'primary': return { border: 'border-green-200', bg: 'bg-green-50', text: 'text-green-800', badge: 'text-green-600 bg-green-100', progress: 'bg-green-600', progressBg: 'bg-green-200' };
                                      case 'addon': return { border: 'border-purple-200', bg: 'bg-purple-50', text: 'text-purple-800', badge: 'text-purple-600 bg-purple-100', progress: 'bg-purple-600', progressBg: 'bg-purple-200' };
                                      case 'trial': return { border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-800', badge: 'text-blue-600 bg-blue-100', progress: 'bg-blue-600', progressBg: 'bg-blue-200' };
                                      default: return { border: 'border-gray-200', bg: 'bg-gray-50', text: 'text-gray-800', badge: 'text-gray-600 bg-gray-100', progress: 'bg-gray-600', progressBg: 'bg-gray-200' };
                                    }
                                  };
                                  
                                  const colors = getColorScheme(plan.type, plan.status);
                                  const getTypeLabel = (type: string, durationType: string) => {
                                    const durationMap = {
                                      'quarterly': '季方案', 
                                      'annual': '年方案'
                                    };
                                    const typeMap = {
                                      'primary': '主要方案',
                                      'addon': '附加方案',
                                      'trial': '試用方案'
                                    };
                                    return `${typeMap[type as keyof typeof typeMap] || '企業方案'} (${durationMap[durationType as keyof typeof durationMap] || durationType})`;
                                  };
                                  
                                  // 在收合狀態下只顯示前2個方案，其餘的顯示摺疊提示
                                  if (!expandedCompanies.has(company.id) && index >= 2) {
                                    if (index === 2) {
                                      return (
                                        <div key="more-plans" className="text-center">
                                          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                            + {company.membershipPlans.length - 2} 個方案 (點擊展開查看)
                                          </span>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }
                                  
                                  return (
                                    <div key={plan.id} className={`bg-white/80 rounded-lg border ${colors.border} ${colors.bg} overflow-hidden`}>
                                      {/* 方案標題 - 可點擊 */}
                                      <div 
                                        className="p-3 cursor-pointer hover:bg-white/60 transition-colors duration-200"
                                        onClick={(e) => togglePlanExpansion(plan.id, e)}
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center space-x-2">
                                            <SafeIcon icon={FiAward} className={`w-4 h-4 ${plan.type === 'primary' ? 'text-green-600' : plan.type === 'addon' ? 'text-purple-600' : 'text-blue-600'}`} />
                                            <span className={`text-sm font-semibold ${colors.text}`}>
                                              {plan.name}
                                            </span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            {plan.slots && (
                                              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                                {plan.slots}個帳號
                                              </span>
                                            )}
                                            <span className={`text-xs px-2 py-1 rounded-full ${colors.badge}`}>
                                              {getTypeLabel(plan.type, plan.duration === 3 ? 'quarterly' : 'annual')}
                                            </span>
                                            {plan.status === 'expiring_soon' && (
                                              <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                                                即將到期
                                              </span>
                                            )}
                                            {/* 方案管理按鈕 */}
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingPlan({ ...plan });
                                                setShowEditPlanModal(true);
                                              }}
                                              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                              title="編輯方案"
                                            >
                                              <SafeIcon icon={FiEdit2} className="w-3 h-3" />
                                            </button>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeletePlan(company.id, plan.id);
                                              }}
                                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                              title="刪除方案"
                                            >
                                              <SafeIcon icon={FiTrash2} className="w-3 h-3" />
                                            </button>
                                            <SafeIcon 
                                              icon={expandedPlans.has(plan.id) ? FiChevronUp : FiChevronDown} 
                                              className="w-4 h-4 text-gray-500" 
                                            />
                                          </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 mb-2">
                                          <div className="flex items-center space-x-1">
                                            <SafeIcon icon={FiCalendar} className="w-3 h-3" />
                                            <span>購買: {formatDate(plan.purchaseDate)}</span>
                                          </div>
                                          {plan.slots && (
                                            <div className="flex items-center space-x-1">
                                              <SafeIcon icon={FiUsers} className="w-3 h-3" />
                                              <span>使用: {plan.usedSlots || 0}/{plan.slots} ({plan.slots ? Math.round(((plan.usedSlots || 0) / plan.slots) * 100) : 0}%)</span>
                                            </div>
                                          )}
                                          <div className="flex items-center space-x-1">
                                            <SafeIcon icon={FiCalendar} className="w-3 h-3" />
                                            <span>到期: {formatDate(plan.endDate)}</span>
                                          </div>
                                          <div className="flex items-center space-x-1">
                                            <SafeIcon icon={FiShield} className="w-3 h-3" />
                                            <span>剩餘: {remainingDays}天</span>
                                          </div>
                                          {plan.basePrice !== undefined && (
                                            <div className="flex items-center space-x-1">
                                              <SafeIcon icon={FiDollarSign} className="w-3 h-3" />
                                              <span>價格: NT${plan.basePrice.toLocaleString()}</span>
                                            </div>
                                          )}
                                          {plan.discountRate !== undefined && (
                                            <div className="flex items-center space-x-1">
                                              <SafeIcon icon={FiPercent} className="w-3 h-3" />
                                              <span>折扣: {(plan.discountRate * 100).toFixed(0)}% off</span>
                                            </div>
                                          )}
                                        </div>
                                        
                                        {/* 進度條 */}
                                        <div className="grid grid-cols-2 gap-2 mb-1">
                                          <div>
                                            <div className="text-xs text-gray-500 mb-1">時間進度</div>
                                            <div className={`w-full ${colors.progressBg} rounded-full h-1.5`}>
                                              <div 
                                                className={`${colors.progress} h-1.5 rounded-full transition-all duration-300`}
                                                style={{ width: `${progressPercentage}%` }}
                                              ></div>
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-500 mb-1">帳號使用率</div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                              <div 
                                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                                                style={{ width: `${plan.slots ? ((plan.usedSlots || 0) / plan.slots) * 100 : 0}%` }}
                                              ></div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* 方案詳細資訊 - 只在展開時顯示 */}
                                      {expandedPlans.has(plan.id) && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: 'auto' }}
                                          exit={{ opacity: 0, height: 0 }}
                                          transition={{ duration: 0.3 }}
                                          className="border-t border-gray-200 p-4 bg-white/90"
                                        >
                                          {(() => {
                                            const planUsers = getCorporateUsersByPlan(plan.id);
                                            const activeUsers = planUsers.filter(user => user.status === 'active');
                                            const totalHours = planUsers.reduce((sum, user) => sum + user.learningProgress.totalHours, 0);
                                            const averageCompletion = planUsers.length > 0 ? 
                                              Math.round(planUsers.reduce((sum, user) => sum + user.learningProgress.completionRate, 0) / planUsers.length) : 0;

                                            return (
                                              <div className="space-y-4">
                                                {/* 統計資訊 */}
                                                <div className="grid grid-cols-3 gap-4">
                                                  <div className="bg-green-50 rounded-lg p-3 text-center">
                                                    <div className="text-sm text-green-700">活躍用戶</div>
                                                    <div className="text-lg font-bold text-green-800">{activeUsers.length}</div>
                                                  </div>
                                                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                                                    <div className="text-sm text-purple-700">總學習時數</div>
                                                    <div className="text-lg font-bold text-purple-800">{totalHours}h</div>
                                                  </div>
                                                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                                                    <div className="text-sm text-orange-700">平均完成率</div>
                                                    <div className="text-lg font-bold text-orange-800">{averageCompletion}%</div>
                                                  </div>
                                                </div>

                                                {/* 會員表格 */}
                                                <div className="flex justify-between items-center mb-3">
                                                  <h5 className="text-sm font-semibold text-gray-900">方案會員管理</h5>
                                                  <button
                                                    onClick={() => {
                                                      setSelectedPlanId(plan.id);
                                                      setShowAddPlanUserModal(true);
                                                    }}
                                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                                                  >
                                                    <SafeIcon icon={FiUserPlus} className="w-3 h-3" />
                                                    <span>新增會員</span>
                                                  </button>
                                                </div>
                                                
                                                {planUsers.length > 0 ? (
                                                  <div className="overflow-x-auto">
                                                    <table className="w-full">
                                                      <thead className="bg-gray-50">
                                                        <tr>
                                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">員工資訊</th>
                                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">部門職位</th>
                                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">帳號狀態</th>
                                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">個人方案時間</th>
                                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">學習進度</th>
                                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">最後活動</th>
                                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">加入時間</th>
                                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                                                        </tr>
                                                      </thead>
                                                      <tbody className="divide-y divide-gray-200">
                                                        {planUsers.map((user) => (
                                                          <tr key={user.id} className="hover:bg-gray-50">
                                                            <td className="px-3 py-2">
                                                              <div>
                                                                <div className="font-medium text-gray-900 flex items-center">
                                                                  {user.name}
                                                                  {user.isAccountHolder && (
                                                                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                                      使用中
                                                                    </span>
                                                                  )}
                                                                </div>
                                                                <div className="text-sm text-gray-500">{user.email}</div>
                                                              </div>
                                                            </td>
                                                            <td className="px-3 py-2">
                                                              <div>
                                                                <div className="font-medium text-gray-900">{user.department}</div>
                                                                <div className="text-sm text-gray-500">{user.position}</div>
                                                              </div>
                                                            </td>
                                                            <td className="px-3 py-2">
                                                              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                                                user.status === 'active' 
                                                                  ? 'bg-green-100 text-green-800' 
                                                                  : 'bg-gray-100 text-gray-800'
                                                              }`}>
                                                                {user.status === 'active' ? '啟用' : '未啟用'}
                                                              </span>
                                                            </td>
                                                            <td className="px-3 py-2">
                                                              <div className="space-y-1">
                                                                <div className="text-sm">
                                                                  {user.learningProgress.coursesCompleted}/{user.learningProgress.coursesEnrolled} 課程
                                                                </div>
                                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                                  <div
                                                                    className="bg-green-500 h-1.5 rounded-full"
                                                                    style={{ width: `${user.learningProgress.completionRate}%` }}
                                                                  ></div>
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                  {user.learningProgress.totalHours}小時
                                                                </div>
                                                              </div>
                                                            </td>
                                                            <td className="px-3 py-2">
                                                              <div className="text-sm text-gray-900">
                                                                {formatDate(user.learningProgress.lastActivity)}
                                                              </div>
                                                            </td>
                                                            <td className="px-3 py-2">
                                                              <div className="text-sm text-gray-900">
                                                                {formatDate(user.joinDate)}
                                                              </div>
                                                            </td>
                                                            <td className="px-3 py-2">
                                                              <div className="flex items-center space-x-2">
                                                                <button
                                                                  onClick={() => {
                                                                    setEditingPlanUser(user);
                                                                    setSelectedPlanId(plan.id);
                                                                    setShowEditPlanUserModal(true);
                                                                  }}
                                                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                                  title="編輯"
                                                                >
                                                                  <SafeIcon icon={FiEdit2} className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                  onClick={() => {
                                                                    if (window.confirm(`確定要從此方案中移除 ${user.name} 嗎？`)) {
                                                                      // 處理刪除邏輯
                                                                      alert('會員已從方案中移除');
                                                                    }
                                                                  }}
                                                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                                  title="移除"
                                                                >
                                                                  <SafeIcon icon={FiTrash2} className="w-3 h-3" />
                                                                </button>
                                                              </div>
                                                            </td>
                                                          </tr>
                                                        ))}
                                                      </tbody>
                                                    </table>
                                                  </div>
                                                ) : (
                                                  <div className="text-center text-gray-500 text-sm py-8">
                                                    此方案目前無使用會員
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })()}
                                        </motion.div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-4 ml-4">
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                {formatDate(company.startDate)} - {formatDate(company.endDate)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {/* 企業操作按鈕 */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCompanyId(company.id);
                                  setShowAddPlanModal(true);
                                }}
                                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="新增方案"
                              >
                                <SafeIcon icon={FiPlus} className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCompany(company);
                                  setShowEditCompanyModal(true);
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="編輯企業"
                              >
                                <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCompany(company.id);
                                }}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="刪除企業"
                              >
                                <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                              </button>
                              <SafeIcon 
                                icon={expandedCompanies.has(company.id) ? FiChevronUp : FiChevronDown} 
                                className="w-6 h-6 text-blue-600 transition-transform duration-200" 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* 統計數據和用戶列表 - 只在展開時顯示 */}
                {expandedCompanies.has(company.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6">

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="flex items-center">
                            <SafeIcon icon={FiTrendingUp} className="w-6 h-6 text-green-600" />
                            <div className="ml-3">
                              <div className="text-sm text-green-700">活躍用戶</div>
                              <div className="text-lg font-bold text-green-800">
                                {stats?.activeUsers || 0}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="flex items-center">
                            <SafeIcon icon={FiCalendar} className="w-6 h-6 text-purple-600" />
                            <div className="ml-3">
                              <div className="text-sm text-purple-700">總學習時數</div>
                              <div className="text-lg font-bold text-purple-800">
                                {stats?.totalHours || 0}h
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-orange-50 rounded-lg p-4">
                          <div className="flex items-center">
                            <SafeIcon icon={FiTrendingUp} className="w-6 h-6 text-orange-600" />
                            <div className="ml-3">
                              <div className="text-sm text-orange-700">平均完成率</div>
                              <div className="text-lg font-bold text-orange-800">
                                {Math.round(stats?.averageCompletion || 0)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 用戶列表 */}
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">員工資訊</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">部門職位</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">帳號狀態</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">學習進度</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">最後活動</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {(users || []).map((user) => (
                              <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <div>
                                    <div className="font-medium text-gray-900 flex items-center">
                                      {user.name}
                                      {user.isAccountHolder && (
                                        <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                          使用中
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div>
                                    <div className="font-medium text-gray-900">{user.department}</div>
                                    <div className="text-sm text-gray-500">{user.position}</div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                                    {getStatusName(user.status)}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  {user.learningProgress && (
                                    <div className="space-y-1">
                                      <div className="text-sm">
                                        {user.learningProgress.coursesCompleted}/{user.learningProgress.coursesEnrolled} 課程
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                          className="bg-green-500 h-2 rounded-full"
                                          style={{ width: `${user.learningProgress.completionRate}%` }}
                                        ></div>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {user.learningProgress.totalHours}小時
                                      </div>
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm text-gray-900">
                                    {user.learningProgress ? formatDate(user.learningProgress.lastActivity) : '-'}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Users Table */}
      {membershipFilter !== 'corporate_companies' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">圖標</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用戶</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">會員類型</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">方案</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">會員狀態</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">開始日期</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">到期日期</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最後活動日期</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">加入日期</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">自動續約</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredUsers().map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getUserIconColor(user)}`}>
                      <SafeIcon icon={getUserIcon(user)} className="text-white text-sm" />
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      {user.companyName && (
                        <div className="text-xs text-purple-600 font-medium">{user.companyName}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    {user.masterAccount && (
                      <div className="text-xs text-gray-500">主帳號：{user.masterAccount}</div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {getRoleName(user.role)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {user.membershipType ? getMembershipTypeName(user.membershipType) : '非會員'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {user.membership?.planName || '-'}
                    </span>
                    {user.membership?.price && user.membership.price > 0 && (
                      <div className="text-xs text-green-600">NT$ {user.membership.price.toLocaleString()}</div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMembershipStatusColor(user.membershipStatus)}`}>
                      {getMembershipStatusName(user.membershipStatus)}
                    </span>
                    {user.membership?.daysRemaining !== undefined && user.membership.daysRemaining > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        剩餘 {user.membership.daysRemaining} 天
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.membership?.startDate ? formatDate(user.membership.startDate) : '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.membership?.endDate ? formatDate(user.membership.endDate) : '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.lastActivity)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.joinDate)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {user.membership && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleToggleAutoRenewal(user.id)}
                        className={`${
                          user.membership.autoRenewal ? 'text-green-600' : 'text-gray-400'
                        } hover:text-blue-600 transition-colors`}
                        title={user.membership.autoRenewal ? '點擊關閉自動續約' : '點擊開啟自動續約'}
                      >
                        <SafeIcon 
                          icon={user.membership.autoRenewal ? FiToggleRight : FiToggleLeft} 
                          className="text-xl" 
                        />
                      </motion.button>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => alert('查看用戶詳情功能開發中...')}
                        className="text-blue-600 hover:text-blue-900"
                        title="查看用戶"
                      >
                        <SafeIcon icon={FiEye} className="text-sm" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEditUser(user.id)}
                        className="text-green-600 hover:text-green-900"
                        title="編輯用戶"
                      >
                        <SafeIcon icon={FiEdit2} className="text-sm" />
                      </motion.button>
                      {user.enterpriseId && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setMembershipFilter('corporate');
                            setSelectedCompany(user.enterpriseId!.toString());
                          }}
                          className="text-purple-600 hover:text-purple-900"
                          title="查看企業帳號"
                        >
                          <SafeIcon icon={FiBriefcase} className="text-sm" />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title="刪除用戶"
                      >
                        <SafeIcon icon={FiTrash2} className="text-sm" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {/* 新增用戶Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">新增用戶</h3>
                <button onClick={() => setShowAddUserModal(false)}>
                  <SafeIcon icon={FiX} className="text-white text-xl hover:bg-white/20 rounded-lg p-1 transition-colors" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveUser();
                }}
                className="space-y-6"
              >
                {/* 基本資訊 */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <SafeIcon icon={FiUser} className="mr-2 text-blue-600" />
                    基本資訊
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        姓名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newUser.name}
                        onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="請輸入用戶姓名"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        電子郵件 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="請輸入電子郵件"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        角色 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as 'student' | 'instructor' | 'consultant' | 'admin' | 'corporate_contact' }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="student">學生</option>
                        <option value="instructor">老師</option>
                        <option value="consultant">顧問</option>
                        <option value="admin">管理員</option>
                        <option value="corporate_contact">企業窗口</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">電話</label>
                      <input
                        type="tel"
                        value={newUser.phone}
                        onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="09xxxxxxxx"
                      />
                    </div>
                  </div>
                </div>

                {/* 會員資訊 - 只有學生才顯示 */}
                {newUser.role === 'student' && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <SafeIcon icon={FiAward} className="mr-2 text-green-600" />
                      會員資訊
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          會員類型 <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={newUser.membershipType}
                          onChange={(e) => setNewUser(prev => ({ ...prev, membershipType: e.target.value as 'individual' | 'corporate' | '' }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          required
                        >
                          <option value="">請選擇會員類型</option>
                          <option value="individual">個人會員</option>
                          <option value="corporate">企業會員</option>
                        </select>
                      </div>

                      {/* 個人會員方案選擇 */}
                      {newUser.membershipType === 'individual' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            會員方案 <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={newUser.membershipPlan}
                            onChange={(e) => setNewUser(prev => ({ ...prev, membershipPlan: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            required
                          >
                            <option value="">請選擇方案</option>
                            <option value="quarterly">季方案 - NT$ 10,800</option>
                            <option value="yearly">年方案 - NT$ 36,000</option>
                          </select>
                        </div>
                      )}

                      {/* 企業會員選擇 */}
                      {newUser.membershipType === 'corporate' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              企業 <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={newUser.companyId}
                              onChange={(e) => {
                                if (e.target.value === 'ADD_NEW_COMPANY') {
                                  setShowAddCompanyModal(true);
                                  return;
                                }
                                const company = companies.find(comp => comp.id.toString() === e.target.value);
                                setNewUser(prev => ({ 
                                  ...prev, 
                                  companyId: e.target.value,
                                  companyName: company?.name || ''
                                }));
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                              required
                            >
                              <option value="">請選擇企業</option>
                              <option value="ADD_NEW_COMPANY" className="text-blue-600 font-semibold">
                                + 新增企業
                              </option>
                              {companies.map(company => (
                                <option key={company.id} value={company.id.toString()}>
                                  {company.name} (總額度: {company.totalSlots}, 已用: {company.usedSlots})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">部門</label>
                            <input
                              type="text"
                              value={newUser.department}
                              onChange={(e) => setNewUser(prev => ({ ...prev, department: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                              placeholder="請輸入部門"
                            />
                          </div>
                        </>
                      )}

                      {/* 學習程度 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">學習程度</label>
                        <select
                          value={newUser.level}
                          onChange={(e) => setNewUser(prev => ({ ...prev, level: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">請選擇程度</option>
                          <option value="初級">初級</option>
                          <option value="中級">中級</option>
                          <option value="高級">高級</option>
                        </select>
                      </div>

                      {/* 自動續約 - 只有個人會員才有 */}
                      {newUser.membershipType === 'individual' && (
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="autoRenewal"
                            checked={newUser.autoRenewal}
                            onChange={(e) => setNewUser(prev => ({ ...prev, autoRenewal: e.target.checked }))}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          <label htmlFor="autoRenewal" className="text-sm font-medium text-gray-700">
                            自動續約
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 老師專業資訊 - 只有老師才顯示 */}
                {newUser.role === 'instructor' && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <SafeIcon icon={FaGraduationCap} className="mr-2 text-yellow-600" />
                      專業資訊
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">專業領域</label>
                        <input
                          type="text"
                          value={newUser.expertise}
                          onChange={(e) => setNewUser(prev => ({ ...prev, expertise: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                          placeholder="例：商務華語、生活華語"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">教學經驗</label>
                        <input
                          type="text"
                          value={newUser.experience}
                          onChange={(e) => setNewUser(prev => ({ ...prev, experience: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                          placeholder="例：5年"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">資格認證</label>
                        <input
                          type="text"
                          value={newUser.qualification}
                          onChange={(e) => setNewUser(prev => ({ ...prev, qualification: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                          placeholder="例：華語文能力測驗、對外華語教學能力認證"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">個人簡介</label>
                        <textarea
                          value={newUser.bio}
                          onChange={(e) => setNewUser(prev => ({ ...prev, bio: e.target.value }))}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                          placeholder="請簡述您的教學理念、專長領域等..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 管理員權限設定 - 只有管理員才顯示 */}
                {newUser.role === 'admin' && (
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-6 border border-red-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <SafeIcon icon={FiShield} className="mr-2 text-red-600" />
                      管理員設定
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          職位 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newUser.position}
                          onChange={(e) => setNewUser(prev => ({ ...prev, position: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          placeholder="例：系統管理員、內容管理員"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          權限等級 <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={newUser.accessLevel}
                          onChange={(e) => setNewUser(prev => ({ ...prev, accessLevel: e.target.value as 'super_admin' | 'admin' | 'moderator' }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          required
                        >
                          <option value="moderator">版主 (基礎權限)</option>
                          <option value="admin">管理員 (進階權限)</option>
                          <option value="super_admin">超級管理員 (完整權限)</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">特殊權限</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {['用戶管理', '課程管理', '內容審核', '系統設定', '數據分析', '財務管理', '營運報告', '安全監控'].map((permission) => (
                            <label key={permission} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={newUser.permissions?.includes(permission) || false}
                                onChange={(e) => {
                                  const currentPermissions = newUser.permissions || [];
                                  if (e.target.checked) {
                                    setNewUser(prev => ({ 
                                      ...prev, 
                                      permissions: [...currentPermissions, permission] 
                                    }));
                                  } else {
                                    setNewUser(prev => ({ 
                                      ...prev, 
                                      permissions: currentPermissions.filter(p => p !== permission) 
                                    }));
                                  }
                                }}
                                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                              />
                              <span className="text-sm text-gray-700">{permission}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 顧問專業設定 - 只有顧問才顯示 */}
                {newUser.role === 'consultant' && (
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <SafeIcon icon={FiBriefcase} className="mr-2 text-indigo-600" />
                      顧問設定
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          諮詢領域 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newUser.consultantArea}
                          onChange={(e) => setNewUser(prev => ({ ...prev, consultantArea: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="例：企業華語培訓、留學諮詢"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">佣金比例 (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={newUser.commissionRate}
                          onChange={(e) => setNewUser(prev => ({ ...prev, commissionRate: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="例：15.5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">客戶管理經驗</label>
                        <input
                          type="text"
                          value={newUser.clientManagementExperience}
                          onChange={(e) => setNewUser(prev => ({ ...prev, clientManagementExperience: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="例：3年企業客戶管理經驗"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">年度業績目標 (NTD)</label>
                        <input
                          type="number"
                          min="0"
                          value={newUser.salesTarget}
                          onChange={(e) => setNewUser(prev => ({ ...prev, salesTarget: parseInt(e.target.value) || 0 }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="例：1000000"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 企業窗口設定 - 只有企業窗口才顯示 */}
                {newUser.role === 'corporate_contact' && (
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border border-green-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <SafeIcon icon={FaBuilding} className="mr-2 text-green-600" />
                      企業窗口設定
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          企業內職位 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newUser.companyRole}
                          onChange={(e) => setNewUser(prev => ({ ...prev, companyRole: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="例：人力資源主管、培訓負責人"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          企業窗口級別 <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={newUser.corporateLevel}
                          onChange={(e) => setNewUser(prev => ({ ...prev, corporateLevel: e.target.value as 'primary' | 'secondary' | 'hr' }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          required
                        >
                          <option value="hr">人資窗口 (基礎權限)</option>
                          <option value="secondary">次要窗口 (進階權限)</option>
                          <option value="primary">主要窗口 (完整權限)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">管理用戶數</label>
                        <input
                          type="number"
                          min="0"
                          value={newUser.managedUsers}
                          onChange={(e) => setNewUser(prev => ({ ...prev, managedUsers: parseInt(e.target.value) || 0 }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="例：50"
                        />
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="contractAuthority"
                          checked={newUser.contractAuthority}
                          onChange={(e) => setNewUser(prev => ({ ...prev, contractAuthority: e.target.checked }))}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <label htmlFor="contractAuthority" className="text-sm font-medium text-gray-700">
                          具有合約簽署權限
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* 密碼設定 */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <SafeIcon icon={FiShield} className="mr-2 text-purple-600" />
                    密碼設定
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        密碼 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="至少6個字符"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        確認密碼 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={newUser.confirmPassword}
                        onChange={(e) => setNewUser(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="請再次輸入密碼"
                        required
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
                    新增用戶
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
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

      {/* 編輯用戶Modal */}
      {showEditUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">編輯用戶</h3>
                <button onClick={() => setShowEditUserModal(false)}>
                  <SafeIcon icon={FiX} className="text-white text-xl" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveEditUser();
                }}
                className="space-y-6"
              >
                {/* 基本資訊 */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <SafeIcon icon={FiUser} className="mr-2 text-blue-600" />
                    基本資訊
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        姓名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editUser.name}
                        onChange={(e) => setEditUser(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        電子郵件 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={editUser.email}
                        onChange={(e) => setEditUser(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">電話</label>
                      <input
                        type="tel"
                        value={editUser.phone}
                        onChange={(e) => setEditUser(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="09xxxxxxxx"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        角色 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={editUser.role}
                        onChange={(e) => setEditUser(prev => ({ ...prev, role: e.target.value as 'student' | 'instructor' | 'admin' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="student">學生</option>
                        <option value="instructor">老師</option>
                        <option value="consultant">顧問</option>
                        <option value="admin">管理員</option>
                        <option value="corporate_contact">企業窗口</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 會員資訊 - 只有學生才顯示 */}
                {editUser.role === 'student' && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <SafeIcon icon={FiAward} className="mr-2 text-green-600" />
                      會員資訊
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">會員狀態</label>
                        <select
                          value={editUser.membershipStatus}
                          onChange={(e) => setEditUser(prev => ({ ...prev, membershipStatus: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          <option value="active">有效</option>
                          <option value="expired">已過期</option>
                          <option value="expiring_soon">即將過期</option>
                          <option value="inactive">未啟用</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">會員類型</label>
                        <select
                          value={editUser.membershipType}
                          onChange={(e) => setEditUser(prev => ({ ...prev, membershipType: e.target.value as 'individual' | 'corporate' | '' }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">非會員</option>
                          <option value="individual">個人會員</option>
                          <option value="corporate">企業會員</option>
                        </select>
                      </div>

                      {editUser.membershipType === 'individual' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">會員方案</label>
                            <select
                              value={editUser.membershipPlan}
                              onChange={(e) => setEditUser(prev => ({ ...prev, membershipPlan: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            >
                              <option value="">請選擇方案</option>
                              <option value="quarterly">季方案 - NT$ 10,800</option>
                              <option value="yearly">年方案 - NT$ 36,000</option>
                            </select>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="editAutoRenewal"
                              checked={editUser.autoRenewal}
                              onChange={(e) => setEditUser(prev => ({ ...prev, autoRenewal: e.target.checked }))}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <label htmlFor="editAutoRenewal" className="text-sm font-medium text-gray-700">
                              自動續約
                            </label>
                          </div>
                        </>
                      )}

                      {editUser.membershipType === 'corporate' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">企業</label>
                            <select
                              value={editUser.companyId}
                              onChange={(e) => {
                                const company = companies.find(comp => comp.id.toString() === e.target.value);
                                setEditUser(prev => ({ 
                                  ...prev, 
                                  companyId: e.target.value,
                                  companyName: company?.name || ''
                                }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            >
                              <option value="">請選擇企業</option>
                              {companies.map(company => (
                                <option key={company.id} value={company.id.toString()}>
                                  {company.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">部門</label>
                            <input
                              type="text"
                              value={editUser.department}
                              onChange={(e) => setEditUser(prev => ({ ...prev, department: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">學習程度</label>
                        <select
                          value={editUser.level}
                          onChange={(e) => setEditUser(prev => ({ ...prev, level: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">請選擇程度</option>
                          <option value="初級">初級</option>
                          <option value="中級">中級</option>
                          <option value="高級">高級</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 老師專業資訊 */}
                {editUser.role === 'instructor' && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <SafeIcon icon={FaGraduationCap} className="mr-2 text-yellow-600" />
                      專業資訊
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">專業領域</label>
                        <input
                          type="text"
                          value={editUser.expertise}
                          onChange={(e) => setEditUser(prev => ({ ...prev, expertise: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                          placeholder="例：商務華語、生活華語"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">教學經驗</label>
                        <input
                          type="text"
                          value={editUser.experience}
                          onChange={(e) => setEditUser(prev => ({ ...prev, experience: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                          placeholder="例：5年"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-4 pt-6 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 font-bold text-lg"
                  >
                    更新用戶
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setShowEditUserModal(false)}
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

      {/* 新增方案用戶 Modal */}
      {showAddPlanUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">新增方案會員</h3>
              <button
                onClick={() => setShowAddPlanUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <SafeIcon icon={FiX} className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              // 這裡添加新增用戶到方案的邏輯
              alert('新增用戶到方案功能開發中...');
              setShowAddPlanUserModal(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">姓名</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="輸入員工姓名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">電子郵件</label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="輸入電子郵件"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">部門</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="輸入部門"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">職位</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="輸入職位"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">手機號碼</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="輸入手機號碼"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  新增會員
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPlanUserModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 編輯方案用戶 Modal */}
      {showEditPlanUserModal && editingPlanUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">編輯會員資料</h3>
              <button
                onClick={() => setShowEditPlanUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <SafeIcon icon={FiX} className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              // 這裡添加編輯用戶的邏輯
              alert('編輯用戶功能開發中...');
              setShowEditPlanUserModal(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">姓名</label>
                  <input
                    type="text"
                    defaultValue={editingPlanUser.name}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">電子郵件</label>
                  <input
                    type="email"
                    defaultValue={editingPlanUser.email}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">部門</label>
                  <input
                    type="text"
                    defaultValue={editingPlanUser.department}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">職位</label>
                  <input
                    type="text"
                    defaultValue={editingPlanUser.position}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">手機號碼</label>
                  <input
                    type="tel"
                    defaultValue={editingPlanUser.phone}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">帳號狀態</label>
                  <select
                    defaultValue={editingPlanUser.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">啟用</option>
                    <option value="inactive">未啟用</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  更新資料
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditPlanUserModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 新增企業 Modal */}
      {showAddCompanyModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 pointer-events-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">新增企業</h3>
              <button
                onClick={() => setShowAddCompanyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <SafeIcon icon={FiX} className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddCompany}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">企業名稱 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newCompany.name}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="輸入企業名稱"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">聯絡人 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newCompany.contactPerson}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, contactPerson: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="輸入聯絡人姓名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">聯絡電話</label>
                  <input
                    type="tel"
                    value={newCompany.contactPhone}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, contactPhone: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="輸入聯絡電話"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">聯絡信箱 <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={newCompany.contactEmail}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, contactEmail: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="輸入聯絡信箱"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">企業地址</label>
                  <input
                    type="text"
                    value={newCompany.address}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, address: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="輸入企業地址"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">產業類別</label>
                  <select
                    value={newCompany.industry}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, industry: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">請選擇產業類別</option>
                    <option value="technology">資訊科技</option>
                    <option value="manufacturing">製造業</option>
                    <option value="education">教育業</option>
                    <option value="finance">金融業</option>
                    <option value="healthcare">醫療業</option>
                    <option value="retail">零售業</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">員工人數</label>
                  <input
                    type="number"
                    value={newCompany.employeeCount}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, employeeCount: parseInt(e.target.value) || 0 }))}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="輸入員工人數"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  新增企業
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCompanyModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 編輯企業 Modal */}
      {showEditCompanyModal && editingCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">編輯企業資料</h3>
              <button
                onClick={() => setShowEditCompanyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <SafeIcon icon={FiX} className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleEditCompany}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">企業名稱 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={editingCompany.name}
                    onChange={(e) => setEditingCompany((prev: any) => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">聯絡人 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={editingCompany.contactPerson}
                    onChange={(e) => setEditingCompany((prev: Company | null) => prev ? { ...prev, contactPerson: e.target.value } : null)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">聯絡電話</label>
                  <input
                    type="tel"
                    value={editingCompany.contactPhone}
                    onChange={(e) => setEditingCompany((prev: Company | null) => prev ? { ...prev, contactPhone: e.target.value } : null)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">聯絡信箱 <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={editingCompany.contactEmail}
                    onChange={(e) => setEditingCompany((prev: Company | null) => prev ? { ...prev, contactEmail: e.target.value } : null)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">企業地址</label>
                  <input
                    type="text"
                    value={editingCompany.address}
                    onChange={(e) => setEditingCompany((prev: Company | null) => prev ? { ...prev, address: e.target.value } : null)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">產業類別</label>
                  <select
                    value={editingCompany.industry}
                    onChange={(e) => setEditingCompany((prev: Company | null) => prev ? { ...prev, industry: e.target.value } : null)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="technology">資訊科技</option>
                    <option value="manufacturing">製造業</option>
                    <option value="education">教育業</option>
                    <option value="finance">金融業</option>
                    <option value="healthcare">醫療業</option>
                    <option value="retail">零售業</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">員工人數</label>
                  <input
                    type="number"
                    min="1"
                    value={editingCompany.employeeCount}
                    onChange={(e) => setEditingCompany((prev: Company | null) => prev ? { ...prev, employeeCount: parseInt(e.target.value) || 0 } : null)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">企業狀態</label>
                  <select
                    value={editingCompany.status}
                    onChange={(e) => setEditingCompany((prev: Company | null) => prev ? { ...prev, status: e.target.value as 'active' | 'inactive' | 'expired' } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">啟用</option>
                    <option value="inactive">停用</option>
                    <option value="expired">已到期</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  更新資料
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditCompanyModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 新增方案 Modal */}
      {showAddPlanModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 pointer-events-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">新增企業方案</h3>
              <button
                onClick={() => setShowAddPlanModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <SafeIcon icon={FiX} className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddPlan}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">方案名稱 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="例：企業標準方案"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">計費週期</label>
                  <select
                    value={newPlan.durationType}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, durationType: e.target.value as 'quarterly' | 'annual' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="quarterly">季方案 (3個月)</option>
                    <option value="annual">年方案 (12個月)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">帳號數量</label>
                  <input
                    type="number"
                    min="0"
                    value={newPlan.slots}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, slots: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">方案價格</label>
                  <input
                    type="number"
                    min="0"
                    value={newPlan.basePrice}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, basePrice: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">折扣率 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={(newPlan.discountRate * 100).toString()}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, discountRate: parseFloat(e.target.value) / 100 || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">開始日期 <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={newPlan.startDate}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">結束日期 <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={newPlan.endDate}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  新增方案
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPlanModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 編輯方案 Modal */}
      {showEditPlanModal && editingPlan && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 pointer-events-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">編輯企業方案</h3>
              <button
                onClick={() => setShowEditPlanModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <SafeIcon icon={FiX} className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleEditPlan}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">方案名稱 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan(prev => prev ? { ...prev, name: e.target.value } : null)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">計費週期</label>
                  <select
                    value={editingPlan.durationType}
                    onChange={(e) => setEditingPlan(prev => prev ? { ...prev, durationType: e.target.value as 'quarterly' | 'annual' } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="quarterly">季方案 (3個月)</option>
                    <option value="annual">年方案 (12個月)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">帳號數量</label>
                  <input
                    type="number"
                    min="0"
                    value={editingPlan.slots || 0}
                    onChange={(e) => setEditingPlan(prev => prev ? { ...prev, slots: parseInt(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">方案價格</label>
                  <input
                    type="number"
                    min="0"
                    value={editingPlan.basePrice || 0}
                    onChange={(e) => setEditingPlan(prev => prev ? { ...prev, basePrice: parseInt(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">折扣率 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={((editingPlan.discountRate || 0) * 100).toString()}
                    onChange={(e) => setEditingPlan(prev => prev ? { ...prev, discountRate: parseFloat(e.target.value) / 100 || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">開始日期</label>
                  <input
                    type="date"
                    value={editingPlan.startDate}
                    onChange={(e) => setEditingPlan(prev => prev ? { ...prev, startDate: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">結束日期</label>
                  <input
                    type="date"
                    value={editingPlan.endDate}
                    onChange={(e) => setEditingPlan(prev => prev ? { ...prev, endDate: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  更新方案
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditPlanModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;