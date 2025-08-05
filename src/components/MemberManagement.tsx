'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import { memberCardStore } from '@/lib/memberCardStore';
import { Membership } from '@/types/membership';
import { memberCardPlans } from '@/data/member_card_plans';

const {
  FiUsers, FiUser, FiBriefcase, FiUserPlus, FiTrash2, FiSearch,
  FiX, FiChevronDown, FiClock, FiCheckCircle
} = FiIcons;

interface MemberWithCard extends Membership {
  daysUntilExpiry?: number;
  isExpiringSoon?: boolean;
}

interface NewMember {
  name: string;
  email: string;
  plan_id: number;
  auto_activation: boolean;
}

const MemberManagementReal = () => {
  const [memberCards, setMemberCards] = useState<MemberWithCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'purchased' | 'activated' | 'expired' | 'cancelled'>('all');
  const [planTypeFilter, setPlanTypeFilter] = useState<'all' | 'individual' | 'corporate'>('all');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    purchased: 0,
    expired: 0,
    cancelled: 0
  });

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
      const stats = await memberCardStore.getMembershipStatistics();
      
      // 計算到期天數和即將到期狀態
      const cardsWithExpiry = cards.map(card => {
        let daysUntilExpiry: number | undefined;
        let isExpiringSoon = false;

        if (card.status === 'activated' && card.expiry_date) {
          const expiryDate = new Date(card.expiry_date);
          const today = new Date();
          daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
        } else if (card.status === 'purchased' && card.activation_deadline) {
          const deadline = new Date(card.activation_deadline);
          const today = new Date();
          daysUntilExpiry = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;
        }

        return {
          ...card,
          daysUntilExpiry,
          isExpiringSoon
        };
      });

      setMemberCards(cardsWithExpiry);
      setStatistics(stats);
    } catch (error) {
      console.error('載入會員卡資料失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemberCards();
  }, []);

  // 過濾會員資料
  const getFilteredMembers = (): MemberWithCard[] => {
    return memberCards.filter(card => {
      // 搜尋過濾
      const matchesSearch = card.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           card.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (card.plan_title && card.plan_title.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchesSearch) return false;

      // 狀態過濾
      if (statusFilter !== 'all' && card.status !== statusFilter) return false;

      // 方案類型過濾
      if (planTypeFilter !== 'all' && card.plan_type !== planTypeFilter) return false;

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
      case 'purchased': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'activated': return 'text-green-700 bg-green-50 border-green-200';
      case 'expired': return 'text-red-700 bg-red-50 border-red-200';
      case 'cancelled': return 'text-gray-700 bg-gray-50 border-gray-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  // 獲取狀態文字
  const getStatusText = (status: Membership['status']): string => {
    switch (status) {
      case 'purchased': return '已購買未開啟';
      case 'activated': return '已開啟';
      case 'expired': return '已過期';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  };

  // 獲取狀態圖示
  const getStatusIcon = (status: Membership['status']) => {
    switch (status) {
      case 'purchased': return FiClock;
      case 'activated': return FiCheckCircle;
      case 'expired': return FiX;
      case 'cancelled': return FiX;
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
        auto_activation: newMember.auto_activation
      });

      // 重置表單
      setNewMember({
        name: '',
        email: '',
        plan_id: 1,
        auto_activation: false
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

  // 更新會員卡狀態
  const handleUpdateStatus = async (cardId: number, newStatus: Membership['status']) => {
    try {
      const confirmMessage = `確定要將狀態更改為「${getStatusText(newStatus)}」嗎？`;
      if (!confirm(confirmMessage)) return;

      await memberCardStore.updateMemberCardStatus(cardId, newStatus);
      await loadMemberCards();
      alert('✅ 狀態已成功更新！');
    } catch (error) {
      console.error('更新狀態失敗:', error);
      alert('❌ 更新狀態失敗：' + (error as Error).message);
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
        <div className="flex items-center mb-4">
          <SafeIcon icon={FiUsers} className="mr-3 text-2xl text-gray-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            會員管理
          </h1>
        </div>
        <p className="text-gray-600">
          管理基於會員卡購買記錄的真實會員資料
        </p>
      </motion.div>

      {/* Statistics Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
      >
        {[
          { 
            label: '總會員數', 
            count: statistics.total,
            color: 'text-gray-600 bg-gray-50 border-gray-200',
            icon: FiUsers
          },
          { 
            label: '已開啟', 
            count: statistics.active,
            color: 'text-green-600 bg-green-50 border-green-200',
            icon: FiCheckCircle
          },
          { 
            label: '已購買未開啟', 
            count: statistics.purchased,
            color: 'text-orange-600 bg-orange-50 border-orange-200',
            icon: FiClock
          },
          { 
            label: '已過期', 
            count: statistics.expired,
            color: 'text-red-600 bg-red-50 border-red-200',
            icon: FiX
          },
          { 
            label: '已取消', 
            count: statistics.cancelled,
            color: 'text-gray-600 bg-gray-50 border-gray-200',
            icon: FiTrash2
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

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 space-y-4"
      >
        {/* Search and Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜尋會員姓名、信箱或方案..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <SafeIcon icon={FiUserPlus} />
            <span>手動新增會員</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">狀態：</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'purchased' | 'activated' | 'expired' | 'cancelled')}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">全部狀態</option>
              <option value="purchased">已購買未開啟</option>
              <option value="activated">已開啟</option>
              <option value="expired">已過期</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">方案類型：</label>
            <select
              value={planTypeFilter}
              onChange={(e) => setPlanTypeFilter(e.target.value as 'all' | 'individual' | 'corporate')}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">全部類型</option>
              <option value="individual">個人方案</option>
              <option value="corporate">企業方案</option>
            </select>
          </div>
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
                <th className="text-left py-3 px-4 font-medium text-gray-900">會員資訊</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">會員卡方案</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">狀態</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">購買/開啟日期</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">到期資訊</th>
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
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full ${member.plan_type === 'corporate' ? 'bg-purple-500' : 'bg-blue-500'} flex items-center justify-center`}>
                            <SafeIcon 
                              icon={member.plan_type === 'corporate' ? FiBriefcase : FiUser} 
                              className="text-white text-sm" 
                            />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{member.user_name}</div>
                            <div className="text-sm text-gray-600">{member.user_email}</div>
                          </div>
                        </div>
                      </td>

                      {/* 會員卡方案 */}
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{member.plan_title}</div>
                          <div className="text-sm text-gray-600">
                            {member.plan_type === 'individual' ? '個人' : '企業'} · {member.duration_type === 'season' ? '季度' : '年度'}
                          </div>
                        </div>
                      </td>

                      {/* 狀態 */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(member.status)}`}>
                            <SafeIcon icon={StatusIcon} className="mr-1 text-xs" />
                            {getStatusText(member.status)}
                          </span>
                          {member.isExpiringSoon && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                              <SafeIcon icon={FiClock} className="mr-1 text-xs" />
                              即將到期
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 購買/開啟日期 */}
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div className="text-gray-900">
                            購買：{formatDate(member.purchase_date)}
                          </div>
                          {member.activation_date && (
                            <div className="text-gray-600">
                              開啟：{formatDate(member.activation_date)}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 到期資訊 */}
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          {member.status === 'activated' && member.expiry_date ? (
                            <>
                              <div className="text-gray-900">
                                {formatDate(member.expiry_date)}
                              </div>
                              {member.daysUntilExpiry !== undefined && (
                                <div className={`${member.daysUntilExpiry <= 30 ? 'text-red-600' : 'text-gray-600'}`}>
                                  {member.daysUntilExpiry > 0 ? `${member.daysUntilExpiry} 天後到期` : '已過期'}
                                </div>
                              )}
                            </>
                          ) : member.status === 'purchased' && member.activation_deadline ? (
                            <>
                              <div className="text-gray-900">
                                開啟期限：{formatDate(member.activation_deadline)}
                              </div>
                              {member.daysUntilExpiry !== undefined && (
                                <div className={`${member.daysUntilExpiry <= 7 ? 'text-red-600' : 'text-gray-600'}`}>
                                  {member.daysUntilExpiry > 0 ? `${member.daysUntilExpiry} 天內需開啟` : '開啟期限已過'}
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400">無</span>
                          )}
                        </div>
                      </td>

                      {/* 金額 */}
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">
                          {formatAmount(member.amount_paid)}
                        </div>
                        {member.auto_renewal && (
                          <div className="text-xs text-blue-600">自動續費</div>
                        )}
                      </td>

                      {/* 操作 */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {member.status === 'purchased' && (
                            <button
                              onClick={() => handleActivateMemberCard(member.id)}
                              className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-xs"
                            >
                              <SafeIcon icon={FiCheckCircle} className="text-xs" />
                              <span>開啟</span>
                            </button>
                          )}
                          <div className="relative">
                            <select
                              value={member.status}
                              onChange={(e) => {
                                if (e.target.value !== member.status) {
                                  handleUpdateStatus(member.id, e.target.value as Membership['status']);
                                }
                              }}
                              className="appearance-none bg-gray-100 border border-gray-200 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="purchased">已購買未開啟</option>
                              <option value="activated">已開啟</option>
                              <option value="expired">已過期</option>
                              <option value="cancelled">已取消</option>
                            </select>
                            <SafeIcon icon={FiChevronDown} className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center">
                    <SafeIcon icon={FiUsers} className="text-6xl text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm || statusFilter !== 'all' || planTypeFilter !== 'all' 
                        ? '找不到符合條件的會員' 
                        : '暫無會員記錄'}
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm || statusFilter !== 'all' || planTypeFilter !== 'all'
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
              <h3 className="text-xl font-bold">手動新增會員</h3>
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
                  {memberCardPlans.filter(plan => plan.status === 'PUBLISHED').map(plan => (
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
    </div>
  );
};

export default MemberManagementReal;