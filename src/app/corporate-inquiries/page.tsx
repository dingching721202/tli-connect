'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  getCorporateInquiries, 
  updateCorporateInquiry, 
  deleteCorporateInquiry,
  CorporateInquiry 
} from '@/data/membershipPlans';

const {
  FiUsers, FiBriefcase, FiMail, FiCalendar, FiDollarSign,
  FiEye, FiTrash2, FiSearch, FiDownload,
  FiCheck, FiClock, FiX, FiMessageSquare, FiUser
} = FiIcons;

interface FilterState {
  status: CorporateInquiry['status'] | 'all';
  industry: string;
  employeeCount: string;
  searchTerm: string;
}

const CorporateInquiriesPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [inquiries, setInquiries] = useState<CorporateInquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<CorporateInquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<CorporateInquiry | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    industry: 'all',
    employeeCount: 'all',
    searchTerm: ''
  });

  // 檢查權限
  useEffect(() => {
    if (!user || user.role !== 'OPS') {
      router.push('/dashboard');
      return;
    }
    loadInquiries();
  }, [user, router]);

  const loadInquiries = () => {
    try {
      setLoading(true);
      const data = getCorporateInquiries();
      setInquiries(data);
      setFilteredInquiries(data);
    } catch (error) {
      console.error('載入企業詢價失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 篩選邏輯
  useEffect(() => {
    let filtered = inquiries;

    // 狀態篩選
    if (filters.status !== 'all') {
      filtered = filtered.filter(inquiry => inquiry.status === filters.status);
    }

    // 行業篩選
    if (filters.industry !== 'all') {
      filtered = filtered.filter(inquiry => inquiry.industry === filters.industry);
    }

    // 員工規模篩選
    if (filters.employeeCount !== 'all') {
      filtered = filtered.filter(inquiry => inquiry.employeeCount === filters.employeeCount);
    }

    // 搜索篩選
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(inquiry =>
        inquiry.companyName.toLowerCase().includes(searchLower) ||
        inquiry.contactName.toLowerCase().includes(searchLower) ||
        inquiry.email.toLowerCase().includes(searchLower)
      );
    }

    setFilteredInquiries(filtered);
  }, [inquiries, filters]);

  const handleStatusUpdate = async (inquiryId: string, newStatus: CorporateInquiry['status']) => {
    try {
      const updated = updateCorporateInquiry(inquiryId, { status: newStatus });
      if (updated) {
        loadInquiries();
        if (selectedInquiry?.id === inquiryId) {
          setSelectedInquiry(updated);
        }
      }
    } catch (error) {
      console.error('更新狀態失敗:', error);
      alert('更新狀態失敗，請稍後再試');
    }
  };

  const handleDelete = async (inquiryId: string) => {
    if (window.confirm('確定要刪除這個詢價記錄嗎？')) {
      try {
        const success = deleteCorporateInquiry(inquiryId);
        if (success) {
          loadInquiries();
          if (selectedInquiry?.id === inquiryId) {
            setShowDetailModal(false);
            setSelectedInquiry(null);
          }
        }
      } catch (error) {
        console.error('刪除失敗:', error);
        alert('刪除失敗，請稍後再試');
      }
    }
  };

  const getStatusColor = (status: CorporateInquiry['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'quoted': return 'bg-purple-100 text-purple-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: CorporateInquiry['status']) => {
    switch (status) {
      case 'pending': return FiClock;
      case 'contacted': return FiMail;
      case 'quoted': return FiDollarSign;
      case 'closed': return FiCheck;
      default: return FiClock;
    }
  };

  const getStatusText = (status: CorporateInquiry['status']) => {
    switch (status) {
      case 'pending': return '待處理';
      case 'contacted': return '已聯繫';
      case 'quoted': return '已報價';
      case 'closed': return '已結案';
      default: return status;
    }
  };

  const exportInquiries = () => {
    // 簡單的CSV導出
    const headers = ['公司名稱', '聯絡人', 'Email', '電話', '員工規模', '行業', '培訓需求', '預算', '時間', '狀態', '提交時間'];
    const csvContent = [
      headers.join(','),
      ...filteredInquiries.map(inquiry => [
        inquiry.companyName,
        inquiry.contactName,
        inquiry.email,
        inquiry.phone,
        inquiry.employeeCount,
        inquiry.industry,
        inquiry.trainingNeeds.join(';'),
        inquiry.budget || '-',
        inquiry.timeline || '-',
        getStatusText(inquiry.status),
        new Date(inquiry.submittedAt).toLocaleDateString('zh-TW')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `企業詢價記錄_${new Date().toLocaleDateString('zh-TW')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user || user.role !== 'OPS') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">企業詢價管理</h1>
                <p className="text-gray-600">管理和追蹤企業培訓方案詢價記錄</p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-3">
                <button
                  onClick={exportInquiries}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <SafeIcon icon={FiDownload} className="mr-2" />
                  導出數據
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            {[
              { label: '總詢價', count: inquiries.length, color: 'blue', icon: FiBriefcase },
              { label: '待處理', count: inquiries.filter(i => i.status === 'pending').length, color: 'yellow', icon: FiClock },
              { label: '進行中', count: inquiries.filter(i => ['contacted', 'quoted'].includes(i.status)).length, color: 'purple', icon: FiUsers },
              { label: '已結案', count: inquiries.filter(i => i.status === 'closed').length, color: 'green', icon: FiCheck }
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.count}</p>
                  </div>
                  <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                    <SafeIcon icon={stat.icon} className={`text-${stat.color}-600 text-xl`} />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">搜索</label>
                <div className="relative">
                  <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="公司名稱、聯絡人或Email"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">狀態</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as FilterState['status'] }))}
                >
                  <option value="all">全部狀態</option>
                  <option value="pending">待處理</option>
                  <option value="contacted">已聯繫</option>
                  <option value="quoted">已報價</option>
                  <option value="closed">已結案</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">行業</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.industry}
                  onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
                >
                  <option value="all">全部行業</option>
                  <option value="科技業">科技業</option>
                  <option value="製造業">製造業</option>
                  <option value="金融服務">金融服務</option>
                  <option value="醫療保健">醫療保健</option>
                  <option value="教育">教育</option>
                  <option value="零售業">零售業</option>
                  <option value="建築工程">建築工程</option>
                  <option value="政府機關">政府機關</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">員工規模</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.employeeCount}
                  onChange={(e) => setFilters(prev => ({ ...prev, employeeCount: e.target.value }))}
                >
                  <option value="all">全部規模</option>
                  <option value="1-10人">1-10人</option>
                  <option value="11-50人">11-50人</option>
                  <option value="51-100人">51-100人</option>
                  <option value="101-500人">101-500人</option>
                  <option value="500-1000人">500-1000人</option>
                  <option value="1000人以上">1000人以上</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Inquiries List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                詢價記錄 ({filteredInquiries.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">載入中...</p>
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="p-8 text-center">
                <SafeIcon icon={FiBriefcase} className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">暫無詢價記錄</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        公司資訊
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        聯絡方式
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        需求概要
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        狀態
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        提交時間
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInquiries.map((inquiry) => (
                      <tr key={inquiry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{inquiry.companyName}</div>
                            <div className="text-sm text-gray-500">{inquiry.industry} • {inquiry.employeeCount}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{inquiry.contactName}</div>
                            <div className="text-sm text-gray-500">{inquiry.contactTitle || '未填寫'}</div>
                            <div className="text-sm text-blue-600">{inquiry.email}</div>
                            <div className="text-sm text-gray-500">{inquiry.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {inquiry.trainingNeeds.slice(0, 2).join(', ')}
                            {inquiry.trainingNeeds.length > 2 && '...'}
                          </div>
                          <div className="text-sm text-gray-500">
                            預算: {inquiry.budget || '未填寫'} • 時間: {inquiry.timeline || '未填寫'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
                            <SafeIcon icon={getStatusIcon(inquiry.status)} className="mr-1" />
                            {getStatusText(inquiry.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(inquiry.submittedAt).toLocaleDateString('zh-TW', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedInquiry(inquiry);
                                setShowDetailModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              title="查看詳情"
                            >
                              <SafeIcon icon={FiEye} />
                            </button>
                            <button
                              onClick={() => handleDelete(inquiry.id)}
                              className="text-red-600 hover:text-red-800"
                              title="刪除"
                            >
                              <SafeIcon icon={FiTrash2} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedInquiry && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">詢價詳情</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiX} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 左側 */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <SafeIcon icon={FiBriefcase} className="mr-2 text-blue-600" />
                      公司資訊
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">公司名稱：</span>
                        <span className="font-medium">{selectedInquiry.companyName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">行業別：</span>
                        <span className="font-medium">{selectedInquiry.industry}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">員工規模：</span>
                        <span className="font-medium">{selectedInquiry.employeeCount}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <SafeIcon icon={FiUser} className="mr-2 text-blue-600" />
                      聯絡人資訊
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">姓名：</span>
                        <span className="font-medium">{selectedInquiry.contactName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">職稱：</span>
                        <span className="font-medium">{selectedInquiry.contactTitle || '未填寫'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email：</span>
                        <span className="font-medium text-blue-600">{selectedInquiry.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">電話：</span>
                        <span className="font-medium">{selectedInquiry.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 右側 */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <SafeIcon icon={FiUsers} className="mr-2 text-blue-600" />
                      培訓需求
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="mb-3">
                        <span className="text-gray-600 block mb-2">培訓項目：</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedInquiry.trainingNeeds.map((need, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                              {need}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between mb-3">
                        <span className="text-gray-600">預算範圍：</span>
                        <span className="font-medium">{selectedInquiry.budget || '未填寫'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">預計開始：</span>
                        <span className="font-medium">{selectedInquiry.timeline || '未填寫'}</span>
                      </div>
                    </div>
                  </div>

                  {selectedInquiry.message && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <SafeIcon icon={FiMessageSquare} className="mr-2 text-blue-600" />
                        其他需求說明
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedInquiry.message}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <SafeIcon icon={FiCalendar} className="mr-2 text-blue-600" />
                      狀態管理
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">目前狀態：</span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedInquiry.status)}`}>
                          <SafeIcon icon={getStatusIcon(selectedInquiry.status)} className="mr-1" />
                          {getStatusText(selectedInquiry.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {['pending', 'contacted', 'quoted', 'closed'].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusUpdate(selectedInquiry.id, status as CorporateInquiry['status'])}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              selectedInquiry.status === status
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {getStatusText(status as CorporateInquiry['status'])}
                          </button>
                        ))}
                      </div>
                      <div className="mt-4 text-sm text-gray-500">
                        提交時間：{new Date(selectedInquiry.submittedAt).toLocaleString('zh-TW')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CorporateInquiriesPage;