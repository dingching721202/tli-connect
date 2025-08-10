'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiCheck, FiExternalLink, FiTrendingUp, FiUsers, FiDollarSign, FiCalendar } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { getReferralCodesByUser, ReferralCode } from '@/data/referralData';

const ReferralSystemPage: React.FC = () => {
  const { user } = useAuth();
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'codes' | 'stats'>('codes');

  useEffect(() => {
    if (user) {
      // 所有用戶（包括管理員）都只能看到自己的推薦代碼
      const codes = getReferralCodesByUser(user.id.toString());
      setReferralCodes(codes);
    }
  }, [user]);

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
    const userCodes = referralCodes.filter(code => code.referrerId === user?.id.toString());
    
    return {
      totalReferrals: userCodes.reduce((sum, code) => sum + code.currentUses, 0),
      successfulReferrals: userCodes.reduce((sum, code) => sum + code.currentUses, 0),
      totalCommission: userCodes.length * 100, // Placeholder calculation
      monthlyCommission: 0 // Placeholder
    };
  };

  const userCodes = referralCodes.filter(code => code.referrerId === user?.id.toString());
  const stats = getTotalStats();

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">推薦系統</h1>
        <p className="text-gray-600 mt-1">
          管理您的推薦代碼與收益
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('codes')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'codes'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          推薦代碼
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'stats'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          統計數據
        </button>
      </div>

      <div className="space-y-6">
        {activeTab === 'codes' && (
          <div className="space-y-6">
            {/* Existing Codes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                您的推薦代碼
              </h3>
              {userCodes.length === 0 ? (
                <div className="bg-white rounded-lg border p-8">
                  <div className="text-center text-gray-500">
                    您還沒有生成任何推薦代碼
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {userCodes.map(code => (
                    <div key={code.id} className="bg-white rounded-lg border p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">推薦方案 {code.id}</h4>
                          <div className="text-sm text-gray-600">
                            代碼：<span className="font-mono">{code.code}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleCopyCode(code.code)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="複製代碼"
                          >
                            {copiedCode === code.code ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleCopyLink(`https://example.com/ref/${code.code}`)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="複製推廣連結"
                          >
                            {copiedCode === `https://example.com/ref/${code.code}` ? <FiCheck className="w-4 h-4" /> : <FiExternalLink className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">總推薦</div>
                          <div className="font-semibold">{code.currentUses}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">成功推薦</div>
                          <div className="font-semibold text-green-600">{code.currentUses}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">總佣金</div>
                          <div className="font-semibold">NT${(code.currentUses * 100).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">本月佣金</div>
                          <div className="font-semibold text-blue-600">NT$0</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <FiUsers className="w-8 h-8 text-blue-600" />
                  <div className="ml-3">
                    <div className="text-sm text-gray-600">總推薦數</div>
                    <div className="text-2xl font-bold text-blue-600">{stats.totalReferrals}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <FiTrendingUp className="w-8 h-8 text-green-600" />
                  <div className="ml-3">
                    <div className="text-sm text-gray-600">成功推薦</div>
                    <div className="text-2xl font-bold text-green-600">{stats.successfulReferrals}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <FiDollarSign className="w-8 h-8 text-purple-600" />
                  <div className="ml-3">
                    <div className="text-sm text-gray-600">總佣金</div>
                    <div className="text-2xl font-bold text-purple-600">
                      NT${stats.totalCommission.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center">
                  <FiCalendar className="w-8 h-8 text-orange-600" />
                  <div className="ml-3">
                    <div className="text-sm text-gray-600">本月佣金</div>
                    <div className="text-2xl font-bold text-orange-600">
                      NT${stats.monthlyCommission.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralSystemPage;