'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import { Membership } from '@/types';
import { memberCards } from '@/data/member_cards';

const { FiCreditCard, FiCalendar, FiCheckCircle, FiClock, FiAlertCircle } = FiIcons;

interface MembershipCardProps {
  dashboardData: {
    membership: Membership | null;
    upcomingClasses: unknown[];
  } | null;
  onActivate: (membershipId: number) => Promise<void>;
  loading: boolean;
}

const MembershipCard: React.FC<MembershipCardProps> = ({ dashboardData, onActivate, loading }) => {
  const [activating, setActivating] = useState(false);

  const handleActivate = async (membershipId: number) => {
    setActivating(true);
    try {
      await onActivate(membershipId);
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (!dashboardData?.membership) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-4">
          <SafeIcon icon={FiCreditCard} className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-700">會員資格</h3>
        </div>
        <div className="text-center py-8">
          <SafeIcon icon={FiAlertCircle} className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium mb-2">尚未購買會員方案</p>
          <p className="text-sm text-gray-400 mb-6">購買會員方案後即可開始學習課程</p>
          
          {/* 購買會員方案按鈕 */}
          <div className="space-y-3">
            <motion.button
              onClick={() => window.location.href = '/membership'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🛒 購買會員方案
            </motion.button>
            
            <div className="text-xs text-gray-400">
              <p>💡 提示：購買後會員卡狀態為「待啟用」</p>
              <p>您可以選擇立即啟用或稍後啟用</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const membership = dashboardData.membership;
  const isActive = membership.status === 'activated' || membership.status === 'ACTIVE';
  const isInactive = membership.status === 'inactive' || membership.status === 'INACTIVE';
  const isExpired = membership.status === 'expired' || membership.status === 'EXPIRED';

  // 根據 member_card_id 獲取會員卡名稱
  const memberCard = memberCards.find(card => card.id === membership.member_card_id);
  const memberCardName = memberCard?.name || '未知會員卡';

  const getStatusColor = () => {
    if (isActive) return 'text-green-600 bg-green-50';
    if (isInactive) return 'text-yellow-600 bg-yellow-50';
    if (isExpired) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getStatusText = () => {
    if (isActive) return '已啟用';
    if (isInactive) return '待啟用';
    if (isExpired) return '已過期';
    return '未知狀態';
  };

  const getStatusIcon = () => {
    if (isActive) return FiCheckCircle;
    if (isInactive) return FiClock;
    if (isExpired) return FiAlertCircle;
    return FiAlertCircle;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getDaysRemaining = () => {
    const expiryDate = membership.expiry_date || membership.expire_time;
    if (!expiryDate) return null;
    const now = new Date();
    const expireDate = new Date(expiryDate);
    const diffTime = expireDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 卡片標題 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiCreditCard} className="w-6 h-6 text-white" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-0.5">會員資格</h3>
              <p className="text-sm text-white/90 -mt-0.5">{memberCardName}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${
            isActive 
              ? 'bg-green-500/90 text-white border-green-400/50' 
              : 'bg-white/20 backdrop-blur-sm text-white border-white/30'
          }`}>
            <div className="flex items-center space-x-1">
              <SafeIcon icon={getStatusIcon()} className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white'}`} />
              <span className={isActive ? 'text-white' : 'text-white'}>{getStatusText()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 卡片內容 */}
      <div className="p-6">
        {/* 購買資訊 - 所有狀態都顯示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* 購買日期 */}
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiCalendar} className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">購買日期</p>
              <p className="font-medium">{(membership.purchase_date || membership.created_at) ? formatDate(membership.purchase_date || membership.created_at) : 'N/A'}</p>
            </div>
          </div>

          {/* 兌換期限 */}
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiClock} className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-sm text-gray-500">兌換期限</p>
              <p className="font-medium">
                {(membership.activation_deadline || membership.activate_expire_time) ? formatDate(membership.activation_deadline || membership.activate_expire_time) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* 會員期間資訊 - 只有已啟用的會員卡才顯示 */}
        {isActive && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* 開始日期 */}
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiCheckCircle} className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-500">開始日期</p>
                <p className="font-medium">{(membership.activation_date || membership.start_time) ? formatDate(membership.activation_date || membership.start_time) : 'N/A'}</p>
              </div>
            </div>

            {/* 結束日期與剩餘天數 */}
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiClock} className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-sm text-gray-500">結束日期</p>
                <div className="flex items-center space-x-2">
                  <p className="font-medium">{(membership.expiry_date || membership.expire_time) ? formatDate(membership.expiry_date || membership.expire_time) : 'N/A'}</p>
                  {daysRemaining !== null && (
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      daysRemaining > 30 ? 'text-blue-600 bg-blue-50' : 
                      daysRemaining > 7 ? 'text-yellow-600 bg-yellow-50' : 
                      'text-red-600 bg-red-50'
                    }`}>
                      {daysRemaining > 0 ? `剩餘 ${daysRemaining} 天` : '已過期'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}


        {/* 到期提醒 */}
        {isActive && daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0 && (
          <div className="bg-yellow-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-600">⚠️ 會員即將到期，請及時續費</p>
          </div>
        )}

        {/* 啟用按鈕 */}
        {isInactive && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-yellow-800 mb-1">會員卡待啟用</p>
                <p className="text-sm text-yellow-600">請在兌換期限前完成啟用</p>
              </div>
              <motion.button
                onClick={() => handleActivate(membership.id)}
                disabled={activating}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {activating ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>啟用中...</span>
                  </div>
                ) : (
                  '立即啟用'
                )}
              </motion.button>
            </div>
          </div>
        )}

        {/* 會員權益提醒 */}
        {isActive && (
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-green-800 font-medium mb-2">✨ 會員權益</p>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• 無限制預約課程</li>
              <li>• 24小時前可免費取消</li>
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MembershipCard;