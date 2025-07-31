'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import type { User, Agent, Referral, CommissionPayment } from '@/types';

interface AgentDashboardData {
  user: User;
  agent: Agent;
  performance: {
    monthlyCommission: number;
    totalEarnings: number;
    newReferrals: number;
    conversionRate: number;
    activeCodes: number;
    topPerformingCode: string;
  };
  recentReferrals: Referral[];
  commissionHistory: CommissionPayment[];
  leaderboard: Array<{
    rank: number;
    name: string;
    level: string;
    earnings: number;
    referrals: number;
  }>;
}

export default function AgentPortal() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<AgentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAgentDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 模擬載入代理商資料
      setDashboardData({
        user: user!,
        agent: {
          id: user!.id,
          user_id: user!.id,
          agent_code: 'AG001',
          level: 'GOLD',
          parent_agent_id: undefined,
          commission_rate: 15,
          total_referrals: 48,
          total_sales_amount: 480000,
          total_commission_earned: 72000,
          status: 'ACTIVE',
          contract_signed_at: '2023-01-01T00:00:00Z',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z'
        },
        performance: {
          monthlyCommission: 15600,
          totalEarnings: 72000,
          newReferrals: 12,
          conversionRate: 68.5,
          activeCodes: 3,
          topPerformingCode: 'AG001-WINTER'
        },
        recentReferrals: [
          {
            id: 1,
            agent_id: user!.id,
            referred_user_id: 101,
            referral_code: 'AG001-WINTER',
            order_id: 1001,
            commission_amount: 2400,
            commission_rate: 15,
            status: 'APPROVED',
            referred_at: '2024-01-10T10:00:00Z',
            converted_at: '2024-01-12T15:30:00Z',
            created_at: '2024-01-10T10:00:00Z',
            updated_at: '2024-01-12T15:30:00Z'
          },
          {
            id: 2,
            agent_id: user!.id,
            referred_user_id: 102,
            referral_code: 'AG001-SPRING',
            commission_amount: 1800,
            commission_rate: 15,
            status: 'PENDING',
            referred_at: '2024-01-14T14:20:00Z',
            created_at: '2024-01-14T14:20:00Z',
            updated_at: '2024-01-14T14:20:00Z'
          }
        ],
        commissionHistory: [
          {
            id: 1,
            agent_id: user!.id,
            period_start: '2024-01-01',
            period_end: '2024-01-31',
            total_amount: 15600,
            referral_ids: [1, 2, 3, 4, 5],
            payment_method: 'BANK_TRANSFER',
            payment_reference: 'PAY-2024-001',
            status: 'PAID',
            paid_at: '2024-02-05T10:00:00Z',
            created_at: '2024-02-01T00:00:00Z',
            updated_at: '2024-02-05T10:00:00Z'
          }
        ],
        leaderboard: [
          { rank: 1, name: '王代理', level: 'PLATINUM', earnings: 95000, referrals: 78 },
          { rank: 2, name: '李代理', level: 'GOLD', earnings: 82000, referrals: 65 },
          { rank: 3, name: user!.name, level: 'GOLD', earnings: 72000, referrals: 48 },
          { rank: 4, name: '張代理', level: 'SILVER', earnings: 58000, referrals: 42 },
          { rank: 5, name: '陳代理', level: 'SILVER', earnings: 45000, referrals: 35 }
        ]
      });
    } catch (error) {
      console.error('Failed to load agent dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (loading) return;
    
    // 檢查用戶角色權限
    if (!user || user.role !== 'AGENT') {
      router.push('/login');
      return;
    }

    // 載入代理商儀表板資料
    loadAgentDashboard();
  }, [user, loading, router, loadAgentDashboard]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'PLATINUM': return 'bg-gray-100 text-gray-800';
      case 'GOLD': return 'bg-yellow-100 text-yellow-800';
      case 'SILVER': return 'bg-gray-100 text-gray-600';
      case 'BRONZE': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PAID': return 'bg-blue-100 text-blue-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入代理商門戶...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* 歡迎區塊 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                代理商中心
              </h1>
              <p className="text-gray-600 mt-2">
                {dashboardData?.user.name} - 代理商編號：{dashboardData?.agent.agent_code}
              </p>
            </div>
            <div className="text-right">
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                代理商門戶
              </div>
              <div className={`px-2 py-1 rounded text-sm font-medium ${getLevelColor(dashboardData?.agent.level || 'BRONZE')}`}>
                等級：{dashboardData?.agent.level}
              </div>
            </div>
          </div>
        </div>

        {/* 績效統計 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">本月佣金</p>
                <p className="text-2xl font-bold text-gray-800">
                  NT$ {dashboardData?.performance.monthlyCommission.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">較上月 +23%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">總收益</p>
                <p className="text-2xl font-bold text-gray-800">
                  NT$ {dashboardData?.performance.totalEarnings.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">累計至今</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">推薦人數</p>
                <p className="text-2xl font-bold text-gray-800">
                  {dashboardData?.agent.total_referrals}
                </p>
                <p className="text-xs text-purple-600">
                  +{dashboardData?.performance.newReferrals} 本月
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">轉換率</p>
                <p className="text-2xl font-bold text-gray-800">
                  {dashboardData?.performance.conversionRate}%
                </p>
                <p className="text-xs text-gray-500">推薦成功率</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 最新推薦 & 佣金歷史 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 最新推薦 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">最新推薦</h2>
              
              <div className="space-y-4">
                {dashboardData?.recentReferrals.map((referral) => (
                  <div key={referral.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800">推薦碼：{referral.referral_code}</h3>
                        <p className="text-sm text-gray-600">
                          推薦時間：{new Date(referral.referred_at).toLocaleString('zh-TW')}
                        </p>
                        {referral.converted_at && (
                          <p className="text-sm text-gray-600">
                            轉換時間：{new Date(referral.converted_at).toLocaleString('zh-TW')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(referral.status)}`}>
                          {referral.status === 'APPROVED' ? '已核准' :
                           referral.status === 'PENDING' ? '待核准' : 
                           referral.status === 'PAID' ? '已付款' : '已拒絕'}
                        </span>
                        <p className="text-lg font-bold text-green-600 mt-1">
                          NT$ {referral.commission_amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 佣金歷史 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">佣金記錄</h2>
              
              <div className="space-y-4">
                {dashboardData?.commissionHistory.map((payment) => (
                  <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {payment.period_start} - {payment.period_end}
                        </h3>
                        <p className="text-sm text-gray-600">
                          付款方式：{payment.payment_method === 'BANK_TRANSFER' ? '銀行轉帳' : payment.payment_method}
                        </p>
                        <p className="text-sm text-gray-600">
                          參考號碼：{payment.payment_reference}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-800">
                          NT$ {payment.total_amount.toLocaleString()}
                        </p>
                        <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status === 'PAID' ? '已付款' :
                           payment.status === 'PENDING' ? '處理中' : 
                           payment.status === 'APPROVED' ? '已核准' : '待核准'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 排行榜 & 推薦工具 */}
          <div className="lg:col-span-1 space-y-8">
            {/* 代理商排行榜 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">本月排行榜</h2>
              
              <div className="space-y-3">
                {dashboardData?.leaderboard.map((agent) => (
                  <div 
                    key={agent.rank}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      agent.name === user?.name ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                        agent.rank === 1 ? 'bg-yellow-500 text-white' :
                        agent.rank === 2 ? 'bg-gray-400 text-white' :
                        agent.rank === 3 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {agent.rank}
                      </span>
                      <div>
                        <p className="font-medium text-gray-800">{agent.name}</p>
                        <p className={`text-xs px-2 py-1 rounded ${getLevelColor(agent.level)}`}>
                          {agent.level}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">
                        NT$ {agent.earnings.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">{agent.referrals}人</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 推薦工具 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">推薦工具</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    您的推薦代碼
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={dashboardData?.agent.agent_code}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50"
                    />
                    <button className="px-4 py-2 bg-yellow-600 text-white rounded-r-lg hover:bg-yellow-700">
                      複製
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    推薦連結
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={`https://tli-connect.com/register?ref=${dashboardData?.agent.agent_code}`}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-xs"
                    />
                    <button className="px-4 py-2 bg-yellow-600 text-white rounded-r-lg hover:bg-yellow-700">
                      複製
                    </button>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="font-medium text-gray-800 mb-2">佣金率</h3>
                  <p className="text-2xl font-bold text-yellow-600">
                    {dashboardData?.agent.commission_rate}%
                  </p>
                  <p className="text-sm text-gray-600">每筆成功轉換</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">快速操作</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/referral')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors"
            >
              <span className="text-2xl mb-2">🎯</span>
              <span className="text-sm font-medium">推薦管理</span>
            </button>
            
            <button
              onClick={() => router.push('/agent-management')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors"
            >
              <span className="text-2xl mb-2">📊</span>
              <span className="text-sm font-medium">績效報表</span>
            </button>
            
            <button
              onClick={() => router.push('/corporate-inquiries')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors"
            >
              <span className="text-2xl mb-2">🏢</span>
              <span className="text-sm font-medium">企業開發</span>
            </button>
            
            <button
              onClick={() => router.push('/profile')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors"
            >
              <span className="text-2xl mb-2">⚙️</span>
              <span className="text-sm font-medium">帳戶設定</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}