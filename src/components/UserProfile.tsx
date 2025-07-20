'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const {
  FiUser, FiMail, FiPhone, FiCalendar, FiAward, FiEdit2, FiSave, FiX, FiAlertTriangle,
  FiRefreshCw, FiCreditCard, FiSettings
} = FiIcons;

interface EditData {
  name: string;
  phone: string;
  level?: string;
  expertise?: string;
  experience?: string;
  joinDate?: string;
  department?: string;
  permissions?: string[];
}

interface Membership {
  type: 'individual' | 'corporate';
  plan: string;
  planName: string;
  status: 'active' | 'expired' | 'expiring_soon';
  startDate: string;
  endDate: string;
  price: number;
  daysRemaining: number;
  autoRenewal: boolean;
  isExpiringSoon: boolean;
}

const UserProfile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<EditData>({
    name: user?.name || '',
    phone: user?.profile?.phone || '',
    ...user?.profile
  });

  const handleSave = () => {
    if (!user) return;
    
    updateProfile({
      name: editData.name,
      profile: {
        ...user.profile,
        ...editData
      }
    });
    setIsEditing(false);
    alert('✅ 個人資料已成功更新！');
  };

  const handleCancel = () => {
    setEditData({
      name: user?.name || '',
      phone: user?.profile?.phone || '',
      ...user?.profile
    });
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    const currentPassword = prompt('請輸入當前密碼：');
    if (currentPassword === 'password') { // Mock validation
      const newPassword = prompt('請輸入新密碼：');
      if (newPassword && newPassword.length >= 6) {
        const confirmPassword = prompt('請再次輸入新密碼：');
        if (newPassword === confirmPassword) {
          alert('✅ 密碼已成功更新！');
        } else {
          alert('❌ 兩次輸入的密碼不一致！');
        }
      } else {
        alert('❌ 密碼長度至少需要 6 個字符！');
      }
    } else {
      alert('❌ 當前密碼錯誤！');
    }
  };

  const handleToggleAutoRenewal = () => {
    if (confirm('確定要變更自動續約設定嗎？')) {
      alert('✅ 自動續約設定已更新！');
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('⚠️ 警告：您確定要刪除帳號嗎？\n\n此操作無法復原，將會：\n• 刪除所有個人資料\n• 取消所有課程預約\n• 終止會員資格\n\n請輸入 "DELETE" 確認刪除')) {
      const confirmation = prompt('請輸入 "DELETE" 確認刪除帳號：');
      if (confirmation === 'DELETE') {
        alert('❌ 帳號刪除功能暫時停用，請聯繫客服處理。\n\n客服信箱：support@tliconnect.com\n客服電話：02-1234-5678');
      } else {
        alert('❌ 確認文字不正確，帳號刪除已取消。');
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'instructor': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'student': return '學生';
      case 'instructor': return '教師';
      case 'admin': return '管理員';
      default: return '未知';
    }
  };

  const getMembershipStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'expired': return 'text-red-600';
      case 'expiring_soon': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getMembershipStatusName = (status: string) => {
    switch (status) {
      case 'active': return '使用中';
      case 'expired': return '已過期';
      case 'expiring_soon': return '即將到期';
      default: return '未知';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return `NT$ ${price.toLocaleString()}`;
  };

  const getDaysRemainingText = (days: number) => {
    if (days < 0) return `已過期 ${Math.abs(days)} 天`;
    if (days === 0) return '今天到期';
    if (days <= 14) return `${days} 天後到期`;
    return `剩餘 ${days} 天`;
  };

  // Mock membership data
  const membership: Membership | null = user?.role === 'student' ? {
    type: user?.membershipType === 'corporate' ? 'corporate' : 'individual',
    plan: user?.membership?.plan || 'yearly',
    planName: user?.membership?.planName || '年方案',
    status: 'active',
    startDate: user?.membership?.startDate || '2024-11-01',
    endDate: user?.membership?.endDate || '2025-11-01',
    price: user?.membership?.price || 36000,
    daysRemaining: user?.membership?.daysRemaining || 316,
    autoRenewal: user?.membership?.autoRenewal || true,
    isExpiringSoon: user?.membership?.isExpiringSoon || false
  } : null;

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100/60 overflow-hidden"
      >
        {/* Header - 手機優化 */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    用戶
                  </div>
                ) : (
                  <SafeIcon icon={FiUser} className="text-2xl" />
                )}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">{user?.name}</h2>
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user?.role || '')}`}>
                    {getRoleName(user?.role || '')}
                  </span>
                  {membership && (
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      membership.type === 'corporate' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {membership.type === 'corporate' ? '企業會員' : '個人會員'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <SafeIcon icon={isEditing ? FiX : FiEdit2} className="text-lg" />
            </motion.button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Membership Status - Only for students - 手機優化 */}
          {user?.role === 'student' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <SafeIcon icon={FiAward} className="mr-2 text-blue-600" />
                會員資格
              </h3>
              {membership ? (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-200">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">會員方案</label>
                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-1 sm:space-y-0">
                            <span className="font-semibold text-blue-800">{membership.planName}</span>
                            <span className="text-sm text-blue-600">{formatPrice(membership.price)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">會員狀態</label>
                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${getMembershipStatusColor(membership.status)}`}>
                              {getMembershipStatusName(membership.status)}
                            </span>
                            {membership.status === 'expiring_soon' && (
                              <SafeIcon icon={FiAlertTriangle} className="text-yellow-500" />
                            )}
                          </div>
                          <div className={`text-sm mt-1 ${getMembershipStatusColor(membership.status)}`}>
                            {getDaysRemainingText(membership.daysRemaining)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">有效期間</label>
                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                          <div className="text-sm space-y-1">
                            <div>開始：{formatDate(membership.startDate)}</div>
                            <div>到期：{formatDate(membership.endDate)}</div>
                          </div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">自動續約</label>
                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                            <div className="flex items-center space-x-2">
                              <SafeIcon icon={membership.autoRenewal ? FiRefreshCw : FiX} className={membership.autoRenewal ? 'text-green-600' : 'text-gray-600'} />
                              <span className={membership.autoRenewal ? 'text-green-600' : 'text-gray-600'}>
                                {membership.autoRenewal ? '已啟用' : '未啟用'}
                              </span>
                            </div>
                            <button
                              onClick={handleToggleAutoRenewal}
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              變更設定
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - 手機優化 */}
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Link href="/membership" className="flex-1">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <SafeIcon icon={FiCreditCard} />
                        <span>續約會員</span>
                      </motion.button>
                    </Link>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleToggleAutoRenewal}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <SafeIcon icon={FiRefreshCw} />
                      <span>管理續約設定</span>
                    </motion.button>
                  </div>

                  {/* Expiring Soon Warning */}
                  {membership.isExpiringSoon && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                    >
                      <div className="flex items-center space-x-2">
                        <SafeIcon icon={FiAlertTriangle} className="text-yellow-600" />
                        <span className="font-medium text-yellow-800">會員即將到期提醒</span>
                      </div>
                      <p className="text-yellow-700 text-sm mt-1">
                        您的會員資格將在 {membership.daysRemaining} 天後到期，請及時續約以繼續享受會員權益。
                      </p>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <SafeIcon icon={FiUser} className="text-4xl text-gray-400 mx-auto mb-3" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">尚未加入會員</h4>
                  <p className="text-gray-600 mb-4">加入會員享受完整學習體驗</p>
                  <Link href="/membership">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      選擇會員方案
                    </motion.button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Basic Information - 手機優化 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <SafeIcon icon={FiUser} className="mr-2 text-blue-600" />
              基本資料
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{user?.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">電子郵件</label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg flex items-center">
                  <SafeIcon icon={FiMail} className="mr-2 text-gray-400" />
                  <span className="truncate">{user?.email}</span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">電話</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg flex items-center">
                    <SafeIcon icon={FiPhone} className="mr-2 text-gray-400" />
                    {user?.profile?.phone || '未設定'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">加入日期</label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg flex items-center">
                  <SafeIcon icon={FiCalendar} className="mr-2 text-gray-400" />
                  {user?.profile?.joinDate || '未知'}
                </p>
              </div>
            </div>
          </div>

          {/* Role Specific Information - 手機優化 */}
          {user?.role === 'student' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <SafeIcon icon={FiAward} className="mr-2 text-blue-600" />
                學習資料
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">學習程度</label>
                  {isEditing ? (
                    <select
                      value={editData.level || ''}
                      onChange={(e) => setEditData({ ...editData, level: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">請選擇</option>
                      <option value="初級">初級</option>
                      <option value="中級">中級</option>
                      <option value="高級">高級</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {user?.profile?.level || '未設定'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {user?.role === 'instructor' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <SafeIcon icon={FiAward} className="mr-2 text-blue-600" />
                教學資料
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">專業領域</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.expertise || ''}
                      onChange={(e) => setEditData({ ...editData, expertise: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {user?.profile?.expertise || '未設定'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">教學經驗</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.experience || ''}
                      onChange={(e) => setEditData({ ...editData, experience: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {user?.profile?.experience || '未設定'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Security Settings - 手機優化 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <SafeIcon icon={FiSettings} className="mr-2 text-blue-600" />
              安全設定
            </h3>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleChangePassword}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiSettings} className="text-gray-600" />
                  <span className="text-gray-700">變更密碼</span>
                </div>
                <span className="text-gray-500">•••••••••••</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDeleteAccount}
                className="w-full flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiAlertTriangle} className="text-red-600" />
                  <span className="text-red-700">刪除帳號</span>
                </div>
                <span className="text-red-500">危險</span>
              </motion.button>
            </div>
          </div>

          {/* Action Buttons - 手機優化 */}
          {isEditing && (
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <SafeIcon icon={FiSave} />
                <span>儲存變更</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancel}
                className="flex-1 bg-gray-500 text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <SafeIcon icon={FiX} />
                <span>取消</span>
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfile;