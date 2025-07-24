'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCreditCard, FiLoader, FiAlertCircle } from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import { useAuth } from '@/contexts/AuthContext';
import { memberCardService, membershipService } from '@/services/dataService';
import { Membership, MemberCardPlan } from '@/types';

interface MembershipCardProps {
  className?: string;
}

const MembershipCard: React.FC<MembershipCardProps> = ({ className = '' }) => {
  const { user, refreshMembership } = useAuth();
  const [allMemberships, setAllMemberships] = useState<Membership[]>([]);
  const [memberCardPlans, setMemberCardPlans] = useState<MemberCardPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<number | null>(null);

  // 載入會員資料
  useEffect(() => {
    const loadMembershipData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        // 載入所有會員資格
        const memberships = await memberCardService.getAllUserMemberships(user.id);
        setAllMemberships(memberships);
        
        // 載入會員方案資料
        const plans = await membershipService.getPublishedPlans();
        setMemberCardPlans(plans);
      } catch (error) {
        console.error('載入會員資料失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMembershipData();

    // 監聽會員卡和方案更新事件
    const handleCardsUpdate = () => {
      loadMembershipData();
    };

    const handlePlansUpdate = () => {
      loadMembershipData();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('memberCardsUpdated', handleCardsUpdate);
      window.addEventListener('membershipPlansUpdated', handlePlansUpdate);
      
      return () => {
        window.removeEventListener('memberCardsUpdated', handleCardsUpdate);
        window.removeEventListener('membershipPlansUpdated', handlePlansUpdate);
      };
    }
  }, [user]);

  // 啟用會員卡
  const handleActivateMembership = async (membershipId: number) => {
    if (!user) return;

    try {
      setActivatingId(membershipId);
      const result = await memberCardService.activateMemberCard(user.id, membershipId);

      if (result.success) {
        alert('🎉 會員卡啟用成功！\n\n您現在可以開始預約課程和使用所有會員功能了！');
        // 刷新會員資料
        await refreshMembership();
        // 重新載入數據
        const memberships = await memberCardService.getAllUserMemberships(user.id);
        setAllMemberships(memberships);
      } else {
        let errorMessage = '啟用失敗';
        if (result.error === 'ACTIVE_CARD_EXISTS') {
          errorMessage = '您已經有一張啟用中的會員卡，無法重複啟用';
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('啟用會員卡失敗:', error);
      alert('啟用過程中發生錯誤，請稍後再試');
    } finally {
      setActivatingId(null);
    }
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 計算剩餘天數
  const getDaysRemaining = (expireTime: string) => {
    const expire = new Date(expireTime);
    const now = new Date();
    const diffTime = expire.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <SafeIcon icon={FiLoader} className="animate-spin mr-2" />
          載入會員資料中...
        </div>
      </div>
    );
  }

  // 過濾不同狀態的會員資格
  const activeMembership = allMemberships.find(m => m.status === 'ACTIVE');
  const purchasedMemberships = allMemberships.filter(m => m.status === 'PURCHASED');

  // 獲取會員卡方案名稱
  const getPlanName = (memberCardId: number) => {
    const plan = memberCardPlans.find(p => p.member_card_id === memberCardId);
    return plan?.title || '會員方案';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 啟用中的會員卡 */}
      {activeMembership && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <SafeIcon icon={FiCreditCard} className="text-green-600 mr-3 text-xl" />
              <div>
                <h3 className="font-bold text-green-800">{getPlanName(activeMembership.member_card_id)}</h3>
                <p className="text-green-600 text-sm">會員卡已啟用</p>
              </div>
            </div>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              已啟用
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">啟用日期</div>
              <div className="font-medium text-gray-800">
                {formatDate(activeMembership.start_time!)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">到期日期</div>
              <div className={`font-medium ${
                getDaysRemaining(activeMembership.expire_time!) <= 14 
                  ? 'text-yellow-600' 
                  : 'text-gray-800'
              }`}>
                {formatDate(activeMembership.expire_time!)}
              </div>
            </div>
          </div>

          {getDaysRemaining(activeMembership.expire_time!) <= 14 && getDaysRemaining(activeMembership.expire_time!) > 0 && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center">
                <SafeIcon icon={FiAlertCircle} className="text-yellow-600 mr-2" />
                <span className="text-yellow-800 text-sm">
                  您的會員卡將在 {getDaysRemaining(activeMembership.expire_time!)} 天後到期，
                  請考慮續費以繼續享受會員服務
                </span>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* 已購買但未啟用的會員卡 */}
      {purchasedMemberships.map((membership, index) => (
        <motion.div
          key={membership.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <SafeIcon icon={FiCreditCard} className="text-yellow-600 mr-3 text-xl" />
              <div>
                <h3 className="font-bold text-yellow-800">{getPlanName(membership.member_card_id)}</h3>
                <p className="text-yellow-600 text-sm">等待啟用</p>
              </div>
            </div>
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              待啟用
            </span>
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">有效期限</div>
            <div className="font-medium text-gray-800">
              啟用後 {membership.duration_in_days} 天有效
            </div>
          </div>

          <button
            onClick={() => handleActivateMembership(membership.id)}
            disabled={activatingId === membership.id || !!activeMembership}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              activatingId === membership.id
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : activeMembership
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-yellow-600 text-white hover:bg-yellow-700'
            }`}
          >
            {activatingId === membership.id ? (
              <div className="flex items-center justify-center">
                <SafeIcon icon={FiLoader} className="animate-spin mr-2" />
                啟用中...
              </div>
            ) : activeMembership ? (
              '已有啟用會員卡'
            ) : (
              '立即啟用'
            )}
          </button>
        </motion.div>
      ))}

      {/* 沒有會員卡的情況 */}
      {!activeMembership && purchasedMemberships.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-6"
        >
          <div className="text-center">
            <SafeIcon icon={FiCreditCard} className="text-blue-600 mx-auto mb-3 text-3xl" />
            <h3 className="font-bold text-blue-800 mb-2">您還沒有會員卡</h3>
            <p className="text-blue-600 text-sm mb-4">
              購買會員方案即可開始您的學習之旅
            </p>
            <a
              href="/membership"
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <SafeIcon icon={FiCreditCard} className="mr-2" />
              選擇會員方案
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MembershipCard;