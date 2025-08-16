'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import { useAuth } from '@/contexts/AuthContext';
import { agentService } from '@/services/unified/agentService';
import { Agent } from '@/data/agents';
import { users } from '@/data/users';

const {
  FiUsers, FiUser, FiDollarSign, FiTrendingUp, FiBarChart, FiSearch,
  FiEye, FiEdit2, FiX, FiSave, FiCalendar, FiMail, FiPhone, FiBriefcase, FiAward, FiTarget
} = FiIcons;

interface AgentWithUser extends Agent {
  user_name?: string;
  user_email?: string;
  user_phone?: string;
}

export default function AgentManagement() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<AgentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'AGENT' | 'CONSULTANT' | 'TEACHER_AGENT' | 'STUDENT_AGENT'>('all');
  const [selectedAgent, setSelectedAgent] = useState<AgentWithUser | null>(null);
  const [editingAgent, setEditingAgent] = useState<AgentWithUser | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [statistics, setStatistics] = useState<{
    totalAgents: number;
    activeAgents: number;
    totalSales: number;
    totalCommission: number;
  } | null>(null);

  // Load agents data
  const loadAgents = async () => {
    try {
      setLoading(true);
      const [agentsData, stats] = await Promise.all([
        agentService.getAllAgents(),
        agentService.getAgentStatistics()
      ]);

      // Merge agent data with user data
      const agentsWithUsers = agentsData.map(agent => {
        const userData = users.find(u => u.id === agent.user_id);
        return {
          ...agent,
          user_name: userData?.name,
          user_email: userData?.email,
          user_phone: userData?.phone
        };
      });

      setAgents(agentsWithUsers);
      setStatistics(stats);
    } catch (error) {
      console.error('載入代理商數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  // Filter agents based on search and filters
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = 
      agent.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.agent_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    const matchesType = typeFilter === 'all' || agent.agent_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Handle edit agent
  const handleEditAgent = (agent: AgentWithUser) => {
    setEditingAgent({ ...agent });
    setShowEditModal(true);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editingAgent) return;
    
    try {
      await agentService.updateAgent(editingAgent.id, editingAgent);
      await loadAgents(); // Reload data
      setShowEditModal(false);
      setEditingAgent(null);
    } catch (error) {
      console.error('更新代理商失敗:', error);
    }
  };

  // Calculate commission rate color
  const getCommissionRateColor = (rate: number) => {
    if (rate >= 15) return 'text-green-600';
    if (rate >= 10) return 'text-blue-600';
    if (rate >= 5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get agent type display name
  const getAgentTypeDisplayName = (type: string) => {
    switch (type) {
      case 'AGENT': return '一般代理';
      case 'CONSULTANT': return '顧問';
      case 'TEACHER_AGENT': return '教師代理';
      case 'STUDENT_AGENT': return '學生代理';
      default: return type;
    }
  };

  // Show unauthorized message for non-admin/staff users
  if (!user || (!user.roles.includes('ADMIN') && !user.roles.includes('STAFF'))) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <SafeIcon icon={FiUsers} className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">權限不足</h3>
          <p className="mt-1 text-sm text-gray-500">
            您需要管理員或職員權限才能訪問代理管理功能。
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">代理管理</h1>
          <p className="text-gray-600">管理代理商資訊和銷售數據</p>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <SafeIcon icon={FiUsers} className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">總代理數</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalAgents}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <SafeIcon icon={FiTrendingUp} className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">活躍代理</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.activeAgents}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <SafeIcon icon={FiDollarSign} className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">總銷售額</p>
                <p className="text-2xl font-bold text-gray-900">NT$ {statistics.totalSales.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <SafeIcon icon={FiBarChart} className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">總分潤</p>
                <p className="text-2xl font-bold text-gray-900">NT$ {statistics.totalCommission.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="搜尋代理商姓名、信箱、代理代碼或公司名稱"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">所有狀態</option>
            <option value="ACTIVE">活躍</option>
            <option value="INACTIVE">非活躍</option>
            <option value="SUSPENDED">暫停</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'AGENT' | 'CONSULTANT' | 'TEACHER_AGENT' | 'STUDENT_AGENT')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">所有類型</option>
            <option value="AGENT">一般代理</option>
            <option value="CONSULTANT">顧問</option>
            <option value="TEACHER_AGENT">教師代理</option>
            <option value="STUDENT_AGENT">學生代理</option>
          </select>
        </div>
      </div>

      {/* Agents List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  代理資訊
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  類型/狀態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  分潤比例
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  銷售業績
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最後銷售
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAgents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <SafeIcon icon={FiUser} className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{agent.user_name}</div>
                        <div className="text-sm text-gray-500">{agent.agent_code}</div>
                        <div className="text-xs text-gray-400">{agent.user_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-gray-900">{getAgentTypeDisplayName(agent.agent_type)}</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(agent.status)}`}>
                        {agent.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getCommissionRateColor(agent.commission_rate)}`}>
                      {agent.commission_rate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">NT$ {agent.total_sales.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{agent.sales_count} 筆交易</div>
                    <div className="text-xs text-green-600">分潤: NT$ {agent.total_commission.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {agent.last_sale_date ? agent.last_sale_date : '無記錄'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedAgent(agent);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                        title="查看詳細"
                      >
                        <SafeIcon icon={FiEye} className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditAgent(agent)}
                        className="text-yellow-600 hover:text-yellow-900 p-1 rounded-md hover:bg-yellow-50"
                        title="編輯"
                      >
                        <SafeIcon icon={FiEdit2} className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <SafeIcon icon={FiUsers} className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">沒有找到代理商</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                ? '請調整搜尋條件或篩選器' 
                : '目前沒有代理商資料'}
            </p>
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      {showDetailModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">代理商詳細資訊</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <SafeIcon icon={FiX} className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wider">基本資訊</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <SafeIcon icon={FiUser} className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">姓名</p>
                        <p className="text-sm font-medium text-gray-900">{selectedAgent.user_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <SafeIcon icon={FiMail} className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">電子信箱</p>
                        <p className="text-sm font-medium text-gray-900">{selectedAgent.user_email}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <SafeIcon icon={FiPhone} className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">電話</p>
                        <p className="text-sm font-medium text-gray-900">{selectedAgent.user_phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <SafeIcon icon={FiTarget} className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">代理代碼</p>
                        <p className="text-sm font-medium text-gray-900">{selectedAgent.agent_code}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <SafeIcon icon={FiBriefcase} className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">代理類型</p>
                        <p className="text-sm font-medium text-gray-900">{getAgentTypeDisplayName(selectedAgent.agent_type)}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <SafeIcon icon={FiAward} className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">狀態</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(selectedAgent.status)}`}>
                          {selectedAgent.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wider">業務資訊</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <SafeIcon icon={FiDollarSign} className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">分潤比例</p>
                        <p className={`text-sm font-medium ${getCommissionRateColor(selectedAgent.commission_rate)}`}>
                          {selectedAgent.commission_rate}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <SafeIcon icon={FiTrendingUp} className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">總銷售額</p>
                        <p className="text-sm font-medium text-gray-900">NT$ {selectedAgent.total_sales.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <SafeIcon icon={FiBarChart} className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">總分潤</p>
                        <p className="text-sm font-medium text-green-600">NT$ {selectedAgent.total_commission.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <SafeIcon icon={FiUsers} className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">銷售筆數</p>
                        <p className="text-sm font-medium text-gray-900">{selectedAgent.sales_count}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <SafeIcon icon={FiCalendar} className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">最後銷售日期</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedAgent.last_sale_date || '無記錄'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                {(selectedAgent.is_company || selectedAgent.address || selectedAgent.bank_account || selectedAgent.notes) && (
                  <div className="col-span-1 md:col-span-2 space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wider">額外資訊</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedAgent.is_company && (
                        <div>
                          <p className="text-sm text-gray-600">企業資訊</p>
                          <div className="mt-1 space-y-1">
                            <p className="text-sm font-medium text-gray-900">{selectedAgent.company_name}</p>
                            {selectedAgent.contact_person && (
                              <p className="text-xs text-gray-600">聯絡人: {selectedAgent.contact_person}</p>
                            )}
                            {selectedAgent.tax_id && (
                              <p className="text-xs text-gray-600">統編: {selectedAgent.tax_id}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedAgent.address && (
                        <div>
                          <p className="text-sm text-gray-600">地址</p>
                          <p className="text-sm font-medium text-gray-900">{selectedAgent.address}</p>
                        </div>
                      )}

                      {selectedAgent.bank_account && (
                        <div>
                          <p className="text-sm text-gray-600">銀行帳號</p>
                          <p className="text-sm font-medium text-gray-900">{selectedAgent.bank_account}</p>
                        </div>
                      )}

                      {selectedAgent.notes && (
                        <div className="col-span-1 md:col-span-2">
                          <p className="text-sm text-gray-600">備註</p>
                          <p className="text-sm font-medium text-gray-900">{selectedAgent.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Referral Link */}
                <div className="col-span-1 md:col-span-2">
                  <p className="text-sm text-gray-600">推薦連結</p>
                  <div className="mt-1 flex items-center space-x-2">
                    <p className="text-sm font-mono text-gray-900 bg-gray-50 px-3 py-2 rounded flex-1">
                      {selectedAgent.referral_link}
                    </p>
                    <button
                      onClick={() => navigator.clipboard.writeText(selectedAgent.referral_link)}
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      複製
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                關閉
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">編輯代理商資訊</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <SafeIcon icon={FiX} className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Edit Fields */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wider">基本設定</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">代理類型</label>
                    <select
                      value={editingAgent.agent_type}
                      onChange={(e) => setEditingAgent({ ...editingAgent, agent_type: e.target.value as 'AGENT' | 'CONSULTANT' | 'TEACHER_AGENT' | 'STUDENT_AGENT' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="AGENT">一般代理</option>
                      <option value="CONSULTANT">顧問</option>
                      <option value="TEACHER_AGENT">教師代理</option>
                      <option value="STUDENT_AGENT">學生代理</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">狀態</label>
                    <select
                      value={editingAgent.status}
                      onChange={(e) => setEditingAgent({ ...editingAgent, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ACTIVE">活躍</option>
                      <option value="INACTIVE">非活躍</option>
                      <option value="SUSPENDED">暫停</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">分潤比例 (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editingAgent.commission_rate}
                      onChange={(e) => setEditingAgent({ ...editingAgent, commission_rate: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">銀行帳號</label>
                    <input
                      type="text"
                      value={editingAgent.bank_account || ''}
                      onChange={(e) => setEditingAgent({ ...editingAgent, bank_account: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Advanced Edit Fields */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wider">進階設定</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
                    <textarea
                      value={editingAgent.address || ''}
                      onChange={(e) => setEditingAgent({ ...editingAgent, address: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingAgent.is_company}
                        onChange={(e) => setEditingAgent({ ...editingAgent, is_company: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">企業代理</span>
                    </label>
                  </div>

                  {editingAgent.is_company && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">公司名稱</label>
                        <input
                          type="text"
                          value={editingAgent.company_name || ''}
                          onChange={(e) => setEditingAgent({ ...editingAgent, company_name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">聯絡人</label>
                        <input
                          type="text"
                          value={editingAgent.contact_person || ''}
                          onChange={(e) => setEditingAgent({ ...editingAgent, contact_person: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">統一編號</label>
                        <input
                          type="text"
                          value={editingAgent.tax_id || ''}
                          onChange={(e) => setEditingAgent({ ...editingAgent, tax_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Notes */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
                  <textarea
                    value={editingAgent.notes || ''}
                    onChange={(e) => setEditingAgent({ ...editingAgent, notes: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <SafeIcon icon={FiSave} className="h-4 w-4 mr-2" />
                儲存
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}