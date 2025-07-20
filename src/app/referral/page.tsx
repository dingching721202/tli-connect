'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiCheck, FiExternalLink, FiTrendingUp, FiUsers, FiDollarSign, FiCalendar } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { getReferralCodesByUser, ReferralCode } from '@/data/referralData';

export default function ReferralPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'codes' | 'stats'>('codes');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // 所有用戶（包括管理員）都只能看到自己的推薦代碼
    const codes = getReferralCodesByUser(user.id);
    setReferralCodes(codes);
  }, [user, router]);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedCode(link);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const getTotalStats = () => {
    // 所有用戶都只看自己的統計數據
    const userCodes = referralCodes.filter(code => code.userId === user?.id);
    
    return {
      totalReferrals: userCodes.reduce((sum, code) => sum + code.totalReferrals, 0),
      successfulReferrals: userCodes.reduce((sum, code) => sum + code.successfulReferrals, 0),
      totalCommission: userCodes.reduce((sum, code) => sum + code.totalCommission, 0),
      monthlyCommission: userCodes.reduce((sum, code) => sum + code.monthlyCommission, 0)
    };
  };

  const userCodes = referralCodes.filter(code => code.userId === user?.id);
  const stats = getTotalStats();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />
      
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              推薦系統
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              管理您的推薦代碼與收益，分享給朋友獲得佣金回饋
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-xl p-2 shadow-lg border border-gray-200">
              <button
                onClick={() => setActiveTab('codes')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'codes'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                推薦代碼
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'stats'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                統計數據
              </button>
            </div>
          </div>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100/60 p-8"
          >
            {activeTab === 'codes' && (
              <div className="space-y-6">
                {/* Existing Codes */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    您的推薦代碼
                  </h3>
                  {userCodes.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiUsers className="w-12 h-12 text-gray-400" />
                      </div>
                      <h4 className="text-xl font-medium text-gray-700 mb-2">還沒有推薦代碼</h4>
                      <p className="text-gray-500">您還沒有生成任何推薦代碼</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {userCodes.map(code => (
                        <motion.div 
                          key={code.id} 
                          whileHover={{ scale: 1.02 }}
                          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-xl font-bold text-gray-900">{code.membershipPlanName}</h4>
                              <div className="text-sm text-gray-600 mt-1">
                                代碼：<span className="font-mono text-blue-600 font-medium">{code.code}</span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleCopyCode(code.code)}
                                className="p-3 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="複製代碼"
                              >
                                {copiedCode === code.code ? <FiCheck className="w-5 h-5" /> : <FiCopy className="w-5 h-5" />}
                              </button>
                              <button
                                onClick={() => handleCopyLink(code.referralLink)}
                                className="p-3 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                title="複製推廣連結"
                              >
                                {copiedCode === code.referralLink ? <FiCheck className="w-5 h-5" /> : <FiExternalLink className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-lg p-4">
                              <div className="text-sm text-gray-600">總推薦</div>
                              <div className="text-2xl font-bold text-gray-900">{code.totalReferrals}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                              <div className="text-sm text-gray-600">成功推薦</div>
                              <div className="text-2xl font-bold text-green-600">{code.successfulReferrals}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                              <div className="text-sm text-gray-600">總佣金</div>
                              <div className="text-lg font-bold text-purple-600">NT${code.totalCommission.toLocaleString()}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                              <div className="text-sm text-gray-600">本月佣金</div>
                              <div className="text-lg font-bold text-orange-600">NT${code.monthlyCommission.toLocaleString()}</div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-gray-900">統計數據</h3>
                
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200"
                  >
                    <div className="flex items-center">
                      <FiUsers className="w-10 h-10 text-blue-600" />
                      <div className="ml-4">
                        <div className="text-sm text-blue-700">總推薦數</div>
                        <div className="text-3xl font-bold text-blue-800">{stats.totalReferrals}</div>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200"
                  >
                    <div className="flex items-center">
                      <FiTrendingUp className="w-10 h-10 text-green-600" />
                      <div className="ml-4">
                        <div className="text-sm text-green-700">成功推薦</div>
                        <div className="text-3xl font-bold text-green-800">{stats.successfulReferrals}</div>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200"
                  >
                    <div className="flex items-center">
                      <FiDollarSign className="w-10 h-10 text-purple-600" />
                      <div className="ml-4">
                        <div className="text-sm text-purple-700">總佣金</div>
                        <div className="text-2xl font-bold text-purple-800">
                          NT${stats.totalCommission.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200"
                  >
                    <div className="flex items-center">
                      <FiCalendar className="w-10 h-10 text-orange-600" />
                      <div className="ml-4">
                        <div className="text-sm text-orange-700">本月佣金</div>
                        <div className="text-2xl font-bold text-orange-800">
                          NT${stats.monthlyCommission.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Additional Stats */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">推薦表現</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {stats.totalReferrals > 0 ? Math.round((stats.successfulReferrals / stats.totalReferrals) * 100) : 0}%
                      </div>
                      <div className="text-sm text-gray-600 mt-1">成功率</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        NT${stats.successfulReferrals > 0 ? Math.round(stats.totalCommission / stats.successfulReferrals).toLocaleString() : 0}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">平均佣金</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {userCodes.length}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">活躍代碼</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}