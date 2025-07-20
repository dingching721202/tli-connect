'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiSettings, FiUserPlus, FiEdit2, FiTrash2, FiSearch, FiDownload, FiX, FiBriefcase, FiEye, FiBook, FiCalendar, FiTrendingUp, FiUserCheck, FiUserX, FiAward, FiShield, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import SafeIcon from '@/components/common/SafeIcon';
import { 
  isCorporatePlanExpired, 
  canAddNewMember, 
  addCorporateUserWithValidation,
  updateUserMembershipStatus,
  deleteCorporateUserWithValidation,
  calculateMembershipPeriod
} from '@/data/corporateData';

interface CorporateUser {
  id: number;
  planId: string; // 關聯的方案ID
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  joinDate: string; // 加入該方案的時間（固定不變）
  membershipStartDate: string; // 個人會員開始時間（固定不變）
  membershipEndDate: string; // 個人會員結束時間（固定不變）
  status: 'active' | 'inactive' | 'expired';
  isAccountHolder: boolean; // 是否為當前使用該帳號的人
  membershipStatus: {
    isActive: boolean;
    daysRemaining: number;
    willExpireWithPlan: boolean;
  };
  learningProgress: {
    coursesEnrolled: number;
    coursesCompleted: number;
    totalHours: number;
    lastActivity: string;
    completionRate: number;
  };
}

interface CorporatePlan {
  id: string;
  name: string;
  type: 'primary' | 'addon' | 'trial';
  planType: 'quarterly' | 'yearly'; // 該方案的會員類型（季方案或年方案）
  totalSlots: number;
  usedSlots: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'expired';
  purchaseDate: string;
  remainingDays: number;
  description?: string; // 方案描述
}

interface CorporateMembership {
  id: string;
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  industry: string;
  employeeCount: number;
  plans: CorporatePlan[]; // 支援多方案
  totalSlots: number; // 所有方案的總帳號數
  usedSlots: number; // 已使用的總帳號數
}

export default function CorporateManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'membership' | 'learning'>('membership');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<CorporateUser | null>(null);
  const [selectedPlanForNewUser, setSelectedPlanForNewUser] = useState<string | null>(null);
  const [editingCompanyInfo, setEditingCompanyInfo] = useState(false);
  
  // 企業方案狀態檢查
  const companyId = 1; // 假設當前企業ID為1
  const isPlanExpired = isCorporatePlanExpired(companyId);
  const addMemberValidation = canAddNewMember(companyId);

  // 處理刪除會員
  const handleDeleteUser = (userId: number) => {
    if (confirm('確定要刪除這個會員嗎？')) {
      // 找到要刪除的用戶
      const userToDelete = corporateUsers.find(user => user.id === userId);
      if (!userToDelete) return;

      // 更新用戶列表
      setCorporateUsers(prev => prev.filter(user => user.id !== userId));
      
      // 更新方案使用數量
      setCorporateMembership(prev => ({
        ...prev,
        plans: prev.plans.map(plan => 
          plan.id === userToDelete.planId 
            ? { ...plan, usedSlots: Math.max(0, plan.usedSlots - 1) }
            : plan
        ),
        usedSlots: Math.max(0, prev.usedSlots - 1)
      }));
      
      alert('會員刪除成功');
    }
  };

  // 處理編輯會員基本資訊
  const handleEditUser = (userId: number, updatedInfo: { name: string; email: string; phone: string; department: string; position: string }) => {
    // 更新本地狀態 - 只更新基本資訊，不改變期限
    setCorporateUsers(prev => prev.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          ...updatedInfo
        };
      }
      return user;
    }));
    setEditingUser(null);
    alert('會員資訊更新成功');
  };

  // 處理保存編輯
  const handleSaveEdit = (updatedInfo: { name: string; email: string; phone: string; department: string; position: string }) => {
    if (editingUser) {
      handleEditUser(editingUser.id, updatedInfo);
    }
  };

  // 處理啟用/停用會員
  const handleToggleUserStatus = (userId: number) => {
    const user = corporateUsers.find(u => u.id === userId);
    if (!user || user.status === 'expired') return;

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const actionText = newStatus === 'active' ? '啟用' : '停用';
    
    if (confirm(`確定要${actionText}這個會員嗎？`)) {
      setCorporateUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, status: newStatus as 'active' | 'inactive' | 'expired' }
          : u
      ));
      alert(`會員已${actionText}`);
    }
  };

  // 處理新增使用者到方案
  const handleAddUserToPlan = (planId: string) => {
    setSelectedPlanForNewUser(planId);
    setShowAddUserModal(true);
  };

  // 處理新增使用者
  const handleAddNewUser = (userInfo: { name: string; email: string; phone: string; department: string; position: string }) => {
    if (!selectedPlanForNewUser) return;

    const selectedPlan = corporateMembership.plans.find(p => p.id === selectedPlanForNewUser);
    if (!selectedPlan) return;

    // 計算會員期限
    const joinDate = new Date().toISOString().split('T')[0];
    const membershipPeriod = calculateMembershipPeriod(joinDate, selectedPlan.planType, selectedPlan.endDate);

    // 創建新用戶
    const newUser: CorporateUser = {
      id: Date.now(), // 簡單的ID生成
      planId: selectedPlanForNewUser,
      ...userInfo,
      joinDate,
      membershipStartDate: membershipPeriod.startDate,
      membershipEndDate: membershipPeriod.endDate,
      status: membershipPeriod.daysRemaining > 0 ? 'active' : 'expired',
      isAccountHolder: false,
      membershipStatus: {
        isActive: membershipPeriod.daysRemaining > 0,
        daysRemaining: membershipPeriod.daysRemaining,
        willExpireWithPlan: membershipPeriod.willExpireWithPlan
      },
      learningProgress: {
        coursesEnrolled: 0,
        coursesCompleted: 0,
        totalHours: 0,
        lastActivity: joinDate,
        completionRate: 0
      }
    };

    // 更新用戶列表
    setCorporateUsers(prev => [...prev, newUser]);

    // 更新方案使用數量
    setCorporateMembership(prev => ({
      ...prev,
      plans: prev.plans.map(plan => 
        plan.id === selectedPlanForNewUser 
          ? { ...plan, usedSlots: plan.usedSlots + 1 }
          : plan
      ),
      usedSlots: prev.usedSlots + 1
    }));

    // 關閉模態框
    setShowAddUserModal(false);
    setSelectedPlanForNewUser(null);
    
    alert('使用者新增成功');
  };

  // 處理企業資訊編輯
  const handleEditCompanyInfo = (updatedInfo: {
    companyName: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    industry: string;
    employeeCount: number;
  }) => {
    setCorporateMembership(prev => ({
      ...prev,
      ...updatedInfo
    }));
    setEditingCompanyInfo(false);
    alert('企業資訊更新成功');
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'corporate_contact') {
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  // Mock 企業用戶數據 - 按方案分組
  const [corporateUsers, setCorporateUsers] = useState<CorporateUser[]>([
    // plan_001 (企業基礎方案 - 年方案) 的會員
    {
      id: 1,
      planId: 'plan_001',
      name: '張小明',
      email: 'zhang@taiwantech.com',
      phone: '0912-345-678',
      department: '研發部',
      position: '軟體工程師',
      joinDate: '2023-07-01', // 加入基礎方案的時間（固定）
      membershipStartDate: '2023-07-01', // 年方案開始時間（固定）
      membershipEndDate: '2024-07-01', // 年方案結束時間（固定）
      status: 'expired', // 已過期
      isAccountHolder: true,
      membershipStatus: {
        isActive: false,
        daysRemaining: -146,
        willExpireWithPlan: false
      },
      learningProgress: {
        coursesEnrolled: 5,
        coursesCompleted: 3,
        totalHours: 24,
        lastActivity: '2024-12-20',
        completionRate: 60
      }
    },
    {
      id: 2,
      planId: 'plan_001',
      name: '李小華',
      email: 'li@taiwantech.com',
      phone: '0923-456-789',
      department: '行銷部',
      position: '行銷專員',
      joinDate: '2023-08-15', // 加入基礎方案的時間（固定）
      membershipStartDate: '2023-08-15', // 年方案開始時間（固定）
      membershipEndDate: '2024-08-15', // 年方案結束時間（固定）
      status: 'expired', // 已過期
      isAccountHolder: false,
      membershipStatus: {
        isActive: false,
        daysRemaining: -127,
        willExpireWithPlan: false
      },
      learningProgress: {
        coursesEnrolled: 3,
        coursesCompleted: 2,
        totalHours: 18,
        lastActivity: '2024-12-19',
        completionRate: 67
      }
    },
    {
      id: 3,
      planId: 'plan_001',
      name: '王小美',
      email: 'wang@taiwantech.com',
      phone: '0934-567-890',
      department: '人資部',
      position: '人資專員',
      joinDate: '2023-09-01', // 加入基礎方案的時間（固定）
      membershipStartDate: '2023-09-01', // 年方案開始時間（固定）
      membershipEndDate: '2024-09-01', // 年方案結束時間（固定）
      status: 'expired', // 已過期
      isAccountHolder: false,
      membershipStatus: {
        isActive: false,
        daysRemaining: -110,
        willExpireWithPlan: false
      },
      learningProgress: {
        coursesEnrolled: 2,
        coursesCompleted: 1,
        totalHours: 8,
        lastActivity: '2024-12-10',
        completionRate: 50
      }
    },
    // plan_002 (企業擴充方案 - 季方案) 的會員
    {
      id: 4,
      planId: 'plan_002',
      name: '陳工程師',
      email: 'chen@taiwantech.com',
      phone: '0945-678-901',
      department: '技術部',
      position: '資深工程師',
      joinDate: '2024-10-01', // 加入擴充方案的時間（固定）
      membershipStartDate: '2024-10-01', // 季方案開始時間（固定）
      membershipEndDate: '2025-01-01', // 季方案結束時間（固定）
      status: 'active', // 有效
      isAccountHolder: true,
      membershipStatus: {
        isActive: true,
        daysRemaining: 15,
        willExpireWithPlan: false
      },
      learningProgress: {
        coursesEnrolled: 4,
        coursesCompleted: 4,
        totalHours: 32,
        lastActivity: '2024-12-21',
        completionRate: 100
      }
    },
    {
      id: 5,
      planId: 'plan_002',
      name: '林設計師',
      email: 'lin@taiwantech.com',
      phone: '0956-789-012',
      department: '設計部',
      position: 'UI/UX設計師',
      joinDate: '2024-11-01', // 加入擴充方案的時間（固定）
      membershipStartDate: '2024-11-01', // 季方案開始時間（固定）
      membershipEndDate: '2025-02-01', // 季方案結束時間（固定）
      status: 'active', // 有效
      isAccountHolder: false,
      membershipStatus: {
        isActive: true,
        daysRemaining: 46,
        willExpireWithPlan: false
      },
      learningProgress: {
        coursesEnrolled: 6,
        coursesCompleted: 3,
        totalHours: 24,
        lastActivity: '2024-12-22',
        completionRate: 50
      }
    },
    {
      id: 6,
      planId: 'plan_002',
      name: '黃經理',
      email: 'huang@taiwantech.com',
      phone: '0967-890-123',
      department: '業務部',
      position: '業務經理',
      joinDate: '2024-09-01', // 加入擴充方案的時間（固定）
      membershipStartDate: '2024-09-01', // 季方案開始時間（固定）
      membershipEndDate: '2024-12-01', // 季方案結束時間（固定）
      status: 'expired', // 已過期
      isAccountHolder: false,
      membershipStatus: {
        isActive: false,
        daysRemaining: -22,
        willExpireWithPlan: false
      },
      learningProgress: {
        coursesEnrolled: 8,
        coursesCompleted: 6,
        totalHours: 48,
        lastActivity: '2024-12-20',
        completionRate: 75
      }
    },
    {
      id: 7,
      planId: 'plan_002',
      name: '吳助理',
      email: 'wu@taiwantech.com',
      phone: '0978-901-234',
      department: '行政部',
      position: '行政助理',
      joinDate: '2024-12-01', // 加入擴充方案的時間（固定）
      membershipStartDate: '2024-12-01', // 季方案開始時間（固定）
      membershipEndDate: '2025-03-01', // 季方案結束時間（固定）
      status: 'inactive', // 停用狀態
      isAccountHolder: false,
      membershipStatus: {
        isActive: false,
        daysRemaining: 69,
        willExpireWithPlan: false
      },
      learningProgress: {
        coursesEnrolled: 2,
        coursesCompleted: 0,
        totalHours: 0,
        lastActivity: '2024-12-01',
        completionRate: 0
      }
    },
    {
      id: 4,
      name: '陳工程師',
      email: 'chen@taiwantech.com',
      phone: '0945-678-901',
      department: '技術部',
      position: '資深工程師',
      joinDate: '2024-11-01',
      membershipStartDate: '2024-11-01',
      membershipEndDate: '2025-02-01',
      planType: 'quarterly',
      status: 'active',
      isAccountHolder: false,
      membershipStatus: {
        isActive: true,
        daysRemaining: 40,
        willExpireWithPlan: false
      },
      learningProgress: {
        coursesEnrolled: 4,
        coursesCompleted: 4,
        totalHours: 32,
        lastActivity: '2024-12-21',
        completionRate: 100
      }
    },
    {
      id: 5,
      name: '林設計師',
      email: 'lin@taiwantech.com',
      phone: '0956-789-012',
      department: '設計部',
      position: 'UI/UX設計師',
      joinDate: '2024-06-01', // 在企業方案開始前就加入
      membershipStartDate: '2024-06-01',
      membershipEndDate: '2025-06-01', // 個人年方案，期限到2025-06-01
      planType: 'yearly',
      status: 'active',
      isAccountHolder: false,
      membershipStatus: {
        isActive: true,
        daysRemaining: 162, // 個人期限比企業方案期限(2025-07-01)早一個月
        willExpireWithPlan: false
      },
      learningProgress: {
        coursesEnrolled: 6,
        coursesCompleted: 4,
        totalHours: 36,
        lastActivity: '2024-12-22',
        completionRate: 67
      }
    },
    {
      id: 6,
      name: '黃經理',
      email: 'huang@taiwantech.com',
      phone: '0967-890-123',
      department: '業務部',
      position: '業務經理',
      joinDate: '2024-05-01', // 企業方案開始前加入
      membershipStartDate: '2024-05-01',
      membershipEndDate: '2025-05-01', // 個人年方案，期限超過企業方案期限
      planType: 'yearly',
      status: 'active',
      isAccountHolder: false,
      membershipStatus: {
        isActive: true,
        daysRemaining: 131, // 個人期限比企業方案期限早2個月
        willExpireWithPlan: false
      },
      learningProgress: {
        coursesEnrolled: 8,
        coursesCompleted: 7,
        totalHours: 56,
        lastActivity: '2024-12-23',
        completionRate: 88
      }
    }
  ]);

  // Mock 企業會員資料 - 支援多方案
  const [corporateMembership, setCorporateMembership] = useState<CorporateMembership>({
    id: 'company_001',
    companyName: '台灣科技股份有限公司',
    contactPerson: '王企業窗口',
    contactEmail: 'corporate.contact@taiwantech.com',
    contactPhone: '02-2345-6789',
    address: '台北市信義區信義路五段7號',
    industry: '資訊科技',
    employeeCount: 150,
    totalSlots: 80, // 所有方案總計
    usedSlots: 38, // 更新總使用數（plan_001: 30 + plan_002: 8 = 38）
    plans: [
      {
        id: 'plan_001',
        name: '企業基礎方案 (50人)',
        type: 'primary',
        planType: 'yearly',
        totalSlots: 50,
        usedSlots: 30,
        startDate: '2023-07-01',
        endDate: '2024-07-01', // 已到期
        status: 'expired',
        purchaseDate: '2023-06-15',
        remainingDays: -146,
        description: '企業主要方案，提供年方案會員權益'
      },
      {
        id: 'plan_002',
        name: '企業擴充方案 (30人)',
        type: 'addon',
        planType: 'quarterly',
        totalSlots: 30,
        usedSlots: 8, // 更新為實際會員數（4個會員）
        startDate: '2024-01-01',
        endDate: '2025-01-01', // 仍有效
        status: 'active',
        purchaseDate: '2023-12-15',
        remainingDays: 15,
        description: '擴充方案，提供季方案會員權益'
      }
    ]
  });

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
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



  const renderMembershipTab = () => {
    const totalDays = Math.ceil((new Date(corporateMembership.endDate).getTime() - new Date(corporateMembership.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const progressPercentage = Math.max(0, Math.min(100, (corporateMembership.remainingDays / totalDays) * 100));
    const usagePercentage = (corporateMembership.usedSlots / corporateMembership.totalSlots) * 100;
    
    return (
      <div className="space-y-6">
        {/* 企業資訊卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100/60 overflow-hidden"
        >
          {/* 企業標題區塊 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
                <SafeIcon icon={FiBriefcase} className="text-white text-2xl" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{corporateMembership.companyName}</h2>
                <p className="text-gray-600">產業類別：{corporateMembership.industry}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(corporateMembership.status)}`}>
                    <SafeIcon icon={FiShield} className="w-3 h-3 mr-1" />
                    {getStatusName(corporateMembership.status)}
                  </span>
                  <span className="text-sm text-gray-500">
                    員工人數：{corporateMembership.employeeCount} 人
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 詳細資訊區塊 */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 企業基本資訊 */}
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <SafeIcon icon={FiBriefcase} className="w-5 h-5 mr-2 text-blue-600" />
                    企業基本資訊
                  </h3>
                  <button
                    onClick={() => setEditingCompanyInfo(true)}
                    className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <SafeIcon icon={FiEdit2} className="w-4 h-4 mr-1" />
                    編輯資訊
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">公司名稱</label>
                    <div className="text-lg font-semibold text-gray-900">{corporateMembership.companyName}</div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <SafeIcon icon={FiMapPin} className="w-4 h-4 mr-1" />
                      公司地址
                    </label>
                    <div className="text-gray-900">{corporateMembership.address}</div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">產業類別</label>
                    <div className="text-gray-900">{corporateMembership.industry}</div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">員工規模</label>
                    <div className="text-gray-900">{corporateMembership.employeeCount} 人</div>
                  </div>
                </div>
                
                {/* 聯絡資訊 */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                    <SafeIcon icon={FiUsers} className="w-4 h-4 mr-2 text-green-600" />
                    聯絡資訊
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">聯絡人</label>
                      <div className="text-gray-900">{corporateMembership.contactPerson}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <SafeIcon icon={FiMail} className="w-4 h-4 mr-1" />
                        聯絡信箱
                      </label>
                      <div className="text-gray-900">{corporateMembership.contactEmail}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <SafeIcon icon={FiPhone} className="w-4 h-4 mr-1" />
                        聯絡電話
                      </label>
                      <div className="text-gray-900">{corporateMembership.contactPhone}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 方案資訊 */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <SafeIcon icon={FiAward} className="w-5 h-5 mr-2 text-purple-600" />
                  方案資訊
                </h3>
                
                {/* 總體使用狀況 */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4 mb-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                    <SafeIcon icon={FiUsers} className="w-4 h-4 mr-2 text-blue-600" />
                    總體帳號使用狀況
                  </h4>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">帳號使用率</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {corporateMembership.usedSlots}/{corporateMembership.totalSlots} 個帳號 ({usagePercentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                </div>

                {/* 各方案詳細資訊 */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-900">方案詳細</h4>
                  {corporateMembership.plans.map((plan) => {
                    const planUsagePercentage = (plan.usedSlots / plan.totalSlots) * 100;
                    const isExpired = plan.status === 'expired';
                    const isExpiringSoon = plan.remainingDays <= 30 && plan.remainingDays > 0;
                    
                    return (
                      <div 
                        key={plan.id} 
                        className={`rounded-lg border p-4 ${
                          isExpired 
                            ? 'bg-red-50 border-red-200' 
                            : isExpiringSoon 
                            ? 'bg-orange-50 border-orange-200'
                            : 'bg-green-50 border-green-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <SafeIcon icon={FiAward} className={`w-5 h-5 ${
                              isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-green-600'
                            }`} />
                            <span className={`text-lg font-semibold ${
                              isExpired ? 'text-red-800' : isExpiringSoon ? 'text-orange-800' : 'text-green-800'
                            }`}>
                              {plan.name}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              plan.type === 'primary' 
                                ? 'bg-blue-100 text-blue-700' 
                                : plan.type === 'addon'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {plan.type === 'primary' ? '主方案' : plan.type === 'addon' ? '擴充方案' : '試用方案'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              isExpired 
                                ? 'bg-red-100 text-red-700' 
                                : isExpiringSoon 
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {isExpired ? '已到期' : isExpiringSoon ? '即將到期' : '有效'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center space-x-1">
                            <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                            <span>購買：{formatDate(plan.purchaseDate)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <SafeIcon icon={FiUsers} className="w-4 h-4" />
                            <span>使用：{plan.usedSlots}/{plan.totalSlots} 帳號</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                            <span>期限：{formatDate(plan.endDate)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <SafeIcon icon={FiShield} className="w-4 h-4" />
                            <span className={
                              isExpired ? 'text-red-600 font-medium' : 
                              isExpiringSoon ? 'text-orange-600 font-medium' : 
                              'text-green-600'
                            }>
                              {plan.remainingDays > 0 ? `剩餘 ${plan.remainingDays} 天` : `已過期 ${Math.abs(plan.remainingDays)} 天`}
                            </span>
                          </div>
                        </div>
                        
                        {/* 方案帳號使用狀況 */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">方案帳號使用率</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {planUsagePercentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className={`w-full rounded-full h-2 ${
                            isExpired ? 'bg-red-200' : isExpiringSoon ? 'bg-orange-200' : 'bg-green-200'
                          }`}>
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                isExpired ? 'bg-red-600' : isExpiringSoon ? 'bg-orange-600' : 'bg-green-600'
                              }`}
                              style={{ width: `${planUsagePercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderLearningTab = () => {
    // 按方案分組用戶
    const usersByPlan = corporateUsers.reduce((acc, user) => {
      if (!acc[user.planId]) {
        acc[user.planId] = [];
      }
      acc[user.planId].push(user);
      return acc;
    }, {} as Record<string, CorporateUser[]>);

    return (
      <div className="space-y-6">
        {/* 整體學習統計 */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100/60 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <SafeIcon icon={FiTrendingUp} className="w-5 h-5 mr-2 text-blue-600" />
            整體學習統計
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <SafeIcon icon={FiUsers} className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <div className="text-sm text-gray-600">總員工數</div>
                  <div className="text-2xl font-bold text-blue-600">{corporateUsers.length}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <SafeIcon icon={FiBook} className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <div className="text-sm text-gray-600">總課程數</div>
                  <div className="text-2xl font-bold text-green-600">
                    {corporateUsers.reduce((sum, user) => sum + user.learningProgress.coursesEnrolled, 0)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <SafeIcon icon={FiTrendingUp} className="w-8 h-8 text-purple-600" />
                <div className="ml-3">
                  <div className="text-sm text-gray-600">完成課程</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {corporateUsers.reduce((sum, user) => sum + user.learningProgress.coursesCompleted, 0)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center">
                <SafeIcon icon={FiCalendar} className="w-8 h-8 text-orange-600" />
                <div className="ml-3">
                  <div className="text-sm text-gray-600">總學習時數</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {corporateUsers.reduce((sum, user) => sum + user.learningProgress.totalHours, 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 按方案分組的會員管理 */}
        {corporateMembership.plans.map((plan) => {
          const planUsers = usersByPlan[plan.id] || [];
          const planUsagePercentage = plan.totalSlots > 0 ? (plan.usedSlots / plan.totalSlots) * 100 : 0;
          const isExpired = plan.status === 'expired';
          const isExpiringSoon = plan.remainingDays <= 30 && plan.remainingDays > 0;
          
          return (
            <div key={plan.id} className="mb-8">
              {/* 方案標題和資訊 */}
              <div className={`rounded-lg border p-4 mb-4 ${
                isExpired 
                  ? 'bg-red-50 border-red-200' 
                  : isExpiringSoon 
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className={`text-lg font-semibold flex items-center ${
                      isExpired ? 'text-red-800' : isExpiringSoon ? 'text-orange-800' : 'text-green-800'
                    }`}>
                      <SafeIcon icon={FiAward} className={`w-5 h-5 mr-2 ${
                        isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-green-600'
                      }`} />
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* 新增使用者按鈕 */}
                    <button
                      onClick={() => handleAddUserToPlan(plan.id)}
                      disabled={plan.usedSlots >= plan.totalSlots || isExpired}
                      className={`flex items-center px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                        plan.usedSlots >= plan.totalSlots || isExpired
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                      title={
                        isExpired 
                          ? '方案已到期，無法新增使用者' 
                          : plan.usedSlots >= plan.totalSlots 
                          ? '方案帳號已滿' 
                          : '新增使用者'
                      }
                    >
                      <SafeIcon icon={FiUserPlus} className="w-4 h-4 mr-1" />
                      新增使用者
                    </button>
                    
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      plan.planType === 'yearly' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {plan.planType === 'yearly' ? '年方案會員' : '季方案會員'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      isExpired 
                        ? 'bg-red-100 text-red-700' 
                        : isExpiringSoon 
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {isExpired ? '已到期' : isExpiringSoon ? '即將到期' : '有效'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">方案期限：</span>
                    <span className="font-medium">{formatDate(plan.endDate)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">購買日期：</span>
                    <span className="font-medium">{formatDate(plan.purchaseDate)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">帳號使用：</span>
                    <span className="font-medium">{plan.usedSlots}/{plan.totalSlots} ({planUsagePercentage.toFixed(1)}%)</span>
                  </div>
                  <div>
                    <span className="text-gray-600">剩餘天數：</span>
                    <span className={`font-medium ${
                      isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {plan.remainingDays > 0 ? `${plan.remainingDays} 天` : '已過期'}
                    </span>
                  </div>
                </div>
              </div>
        
              {/* 方案會員表格 */}
              <div className="bg-white rounded-lg border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">員工資訊</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">加入時間</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">會員期限</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">剩餘天數</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">學習進度</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">狀態</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {planUsers.length > 0 ? planUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.department} - {user.position}</div>
                              <div className="text-xs text-gray-400">{user.email}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-900">{formatDate(user.joinDate)}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-900">{formatDate(user.membershipEndDate)}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className={`text-sm font-medium ${
                              user.membershipStatus.daysRemaining > 30 
                                ? 'text-green-600' 
                                : user.membershipStatus.daysRemaining > 7 
                                ? 'text-orange-600' 
                                : 'text-red-600'
                            }`}>
                              {user.membershipStatus.daysRemaining > 0 
                                ? `${user.membershipStatus.daysRemaining} 天` 
                                : '已過期'}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-20">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full" 
                                    style={{ width: `${user.learningProgress.completionRate}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-600">{user.learningProgress.completionRate}%</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {user.learningProgress.coursesCompleted}/{user.learningProgress.coursesEnrolled} 課程
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.status === 'active' 
                                ? 'bg-green-100 text-green-700' 
                                : user.status === 'expired'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {user.status === 'active' ? '啟用' : user.status === 'expired' ? '過期' : '停用'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              {/* 編輯按鈕 - 已過期不可編輯 */}
                              <button 
                                onClick={() => setEditingUser(user)}
                                disabled={user.status === 'expired'}
                                className={`text-sm transition-colors ${
                                  user.status === 'expired'
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-blue-600 hover:text-blue-800'
                                }`}
                                title={user.status === 'expired' ? '已過期會員無法編輯' : '編輯會員資訊'}
                              >
                                <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                              </button>
                              
                              {/* 啟用/停用按鈕 - 已過期不可操作 */}
                              <button 
                                onClick={() => handleToggleUserStatus(user.id)}
                                disabled={user.status === 'expired'}
                                className={`text-sm transition-colors ${
                                  user.status === 'expired'
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : user.status === 'active'
                                    ? 'text-orange-600 hover:text-orange-800'
                                    : 'text-green-600 hover:text-green-800'
                                }`}
                                title={
                                  user.status === 'expired' 
                                    ? '已過期會員無法操作' 
                                    : user.status === 'active' 
                                    ? '停用會員' 
                                    : '啟用會員'
                                }
                              >
                                <SafeIcon icon={user.status === 'active' ? FiUserX : FiUserCheck} className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} className="py-8 px-4 text-center text-gray-500">
                            此方案目前沒有會員
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!user || user.role !== 'corporate_contact') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />
      
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              企業管理
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              管理企業員工帳號、會員資訊及學習狀況
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-xl p-2 shadow-lg border border-gray-200">
              <button
                onClick={() => setActiveTab('membership')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'membership'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                企業資訊
              </button>
              <button
                onClick={() => setActiveTab('learning')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'learning'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                學習狀況
              </button>
            </div>
          </div>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'membership' && renderMembershipTab()}
            {activeTab === 'learning' && renderLearningTab()}
          </motion.div>
        </div>
      </div>

      {/* 編輯會員模態框 */}
      {editingUser && (
        <EditUserModal 
          user={editingUser} 
          onSave={handleSaveEdit} 
          onClose={() => setEditingUser(null)} 
        />
      )}

      {/* 新增使用者模態框 */}
      {showAddUserModal && selectedPlanForNewUser && (
        <AddUserModal 
          planId={selectedPlanForNewUser}
          planInfo={corporateMembership.plans.find(p => p.id === selectedPlanForNewUser)!}
          onSave={handleAddNewUser} 
          onClose={() => {
            setShowAddUserModal(false);
            setSelectedPlanForNewUser(null);
          }} 
        />
      )}

      {/* 編輯企業資訊模態框 */}
      {editingCompanyInfo && (
        <EditCompanyInfoModal 
          companyInfo={corporateMembership}
          onSave={handleEditCompanyInfo} 
          onClose={() => setEditingCompanyInfo(false)} 
        />
      )}
    </div>
  );
}

// 編輯會員模態框元件
function EditUserModal({ 
  user, 
  onSave, 
  onClose 
}: { 
  user: CorporateUser; 
  onSave: (updatedInfo: { name: string; email: string; phone: string; department: string; position: string }) => void; 
  onClose: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    department: user.department,
    position: user.position
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl border border-gray-300 p-8 w-full max-w-xl mx-auto ring-1 ring-black ring-opacity-5"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">編輯會員資訊</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <SafeIcon icon={FiX} className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">電子郵件</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">電話</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">部門</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">職位</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              儲存
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// 新增使用者模態框元件
function AddUserModal({ 
  planId,
  planInfo,
  onSave, 
  onClose 
}: { 
  planId: string;
  planInfo: CorporatePlan;
  onSave: (userInfo: { name: string; email: string; phone: string; department: string; position: string }) => void; 
  onClose: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-12 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl border border-gray-300 p-8 w-full max-w-md mx-auto ring-1 ring-black ring-opacity-5"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">新增使用者</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <SafeIcon icon={FiX} className="w-5 h-5" />
          </button>
        </div>

        {/* 方案資訊 */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">目標方案</h4>
          <div className="space-y-1 text-sm">
            <div className="text-blue-700">{planInfo.name}</div>
            <div className="text-blue-600">
              會員類型：{planInfo.planType === 'yearly' ? '年方案' : '季方案'}
            </div>
            <div className="text-blue-600">
              可用帳號：{planInfo.totalSlots - planInfo.usedSlots}/{planInfo.totalSlots}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">電子郵件 *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">電話 *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">部門 *</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">職位 *</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              新增使用者
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// 編輯企業資訊模態框元件
function EditCompanyInfoModal({ 
  companyInfo, 
  onSave, 
  onClose 
}: { 
  companyInfo: CorporateMembership; 
  onSave: (updatedInfo: {
    companyName: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    industry: string;
    employeeCount: number;
  }) => void; 
  onClose: () => void; 
}) {
  const [formData, setFormData] = useState({
    companyName: companyInfo.companyName,
    contactPerson: companyInfo.contactPerson,
    contactEmail: companyInfo.contactEmail,
    contactPhone: companyInfo.contactPhone,
    address: companyInfo.address,
    industry: companyInfo.industry,
    employeeCount: companyInfo.employeeCount
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl border border-gray-300 p-8 w-full max-w-xl mx-auto max-h-[85vh] overflow-y-auto ring-1 ring-black ring-opacity-5"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">編輯企業資訊</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <SafeIcon icon={FiX} className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">公司名稱 *</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">公司地址 *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">產業類別 *</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">員工規模 *</label>
              <input
                type="number"
                value={formData.employeeCount}
                onChange={(e) => setFormData(prev => ({ ...prev, employeeCount: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">聯絡人 *</label>
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">聯絡信箱 *</label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">聯絡電話 *</label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg">
            <SafeIcon icon={FiShield} className="w-4 h-4 inline mr-1" />
            注意：方案資訊無法修改，如需變更請聯繫客服。
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              儲存變更
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}