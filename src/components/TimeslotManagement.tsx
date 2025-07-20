'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiUser, FiAlertTriangle, FiX, FiEye, FiSearch, FiFilter } from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import { useAuth } from '@/contexts/AuthContext';
import { timeslotService, staffService } from '@/services/dataService';
import { ClassTimeslot } from '@/types';

interface TimeslotWithDetails extends ClassTimeslot {
  bookingCount: number;
  canCancel: boolean;
}

const TimeslotManagement: React.FC = () => {
  const { user } = useAuth();
  const [timeslots, setTimeslots] = useState<TimeslotWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'CREATED' | 'CANCELED'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTimeslot, setSelectedTimeslot] = useState<TimeslotWithDetails | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // 載入課程時段資料
  useEffect(() => {
    if (!user || user.role !== 'OPS') {
      setLoading(false);
      return;
    }
    const loadTimeslots = async () => {
      try {
        setLoading(true);
        const allTimeslots = await timeslotService.getAllTimeslots();
        
        // 為每個時段計算預約數量和取消權限
        const enrichedTimeslots: TimeslotWithDetails[] = allTimeslots.map(timeslot => {
          const now = new Date();
          const slotStart = new Date(timeslot.start_time);
          const canCancel = timeslot.status === 'CREATED' && slotStart > now;
          
          return {
            ...timeslot,
            bookingCount: timeslot.reserved_count || 0,
            canCancel
          };
        });
        
        setTimeslots(enrichedTimeslots);
      } catch (error) {
        console.error('載入課程時段失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTimeslots();
  }, [user]);

  // 檢查用戶權限
  if (!user || user.role !== 'OPS') {
    return (
      <div className="text-center py-12">
        <SafeIcon icon={FiAlertTriangle} className="text-6xl text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">權限不足</h3>
        <p className="text-gray-600">此功能僅限課務人員使用</p>
      </div>
    );
  }

  // 過濾時段
  const filteredTimeslots = timeslots.filter(timeslot => {
    // 狀態過濾
    if (statusFilter !== 'all' && timeslot.status !== statusFilter) {
      return false;
    }

    // 日期過濾
    if (dateFilter) {
      const slotDate = new Date(timeslot.start_time).toISOString().split('T')[0];
      if (slotDate !== dateFilter) {
        return false;
      }
    }

    // 搜尋過濾
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const slotDate = new Date(timeslot.start_time).toLocaleDateString('zh-TW');
      const slotTime = new Date(timeslot.start_time).toTimeString().slice(0, 5);
      
      return (
        timeslot.id.toString().includes(searchLower) ||
        slotDate.includes(searchTerm) ||
        slotTime.includes(searchTerm)
      );
    }

    return true;
  });

  // 處理取消時段
  const handleCancelTimeslot = async () => {
    if (!selectedTimeslot) return;

    try {
      setCancelling(true);
      
      // 呼叫取消 API (US08)
      const result = await staffService.cancelTimeslot(selectedTimeslot.id);
      
      if (result.success) {
        alert(`✅ 課程時段已成功取消！

時段 ID：${selectedTimeslot.id}
時間：${formatDateTime(selectedTimeslot.start_time)} - ${formatTime(selectedTimeslot.end_time)}
影響預約：${selectedTimeslot.bookingCount} 個

相關學生將收到取消通知。`);
        
        // 重新載入時段資料
        const allTimeslots = await timeslotService.getAllTimeslots();
        const enrichedTimeslots: TimeslotWithDetails[] = allTimeslots.map(timeslot => {
          const now = new Date();
          const slotStart = new Date(timeslot.start_time);
          const canCancel = timeslot.status === 'CREATED' && slotStart > now;
          
          return {
            ...timeslot,
            bookingCount: timeslot.reserved_count || 0,
            canCancel
          };
        });
        
        setTimeslots(enrichedTimeslots);
        
      } else {
        let errorMessage = '取消課程時段失敗';
        
        if (result.error === 'Timeslot not found') {
          errorMessage = '找不到指定的課程時段。';
        }
        
        alert(`❌ ${errorMessage}`);
      }
      
    } catch (error) {
      console.error('取消課程時段錯誤:', error);
      alert('取消過程中發生錯誤，請稍後再試');
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
      setSelectedTimeslot(null);
    }
  };

  // 格式化日期時間
  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  // 格式化時間
  const formatTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toTimeString().slice(0, 5);
  };

  // 獲取狀態顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED': return 'text-green-700 bg-green-50 border-green-200';
      case 'CANCELED': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  // 獲取狀態文字
  const getStatusText = (status: string) => {
    switch (status) {
      case 'CREATED': return '正常';
      case 'CANCELED': return '已取消';
      default: return '未知';
    }
  };

  return (
    <div className="space-y-6">
      {/* 標題 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">課程時段管理</h2>
          <p className="text-sm text-gray-600 mt-1">管理和取消課程時段</p>
        </div>
      </div>

      {/* 篩選和搜尋 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋時段 ID 或時間..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">全部狀態</option>
          <option value="CREATED">正常</option>
          <option value="CANCELED">已取消</option>
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="篩選日期"
        />

        <button
          onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setDateFilter('');
          }}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <SafeIcon icon={FiFilter} className="text-sm" />
          <span>清除篩選</span>
        </button>
      </div>

      {/* 統計資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{timeslots.length}</div>
              <div className="text-sm text-gray-600">總時段數</div>
            </div>
            <SafeIcon icon={FiCalendar} className="text-2xl text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{timeslots.filter(t => t.status === 'CREATED').length}</div>
              <div className="text-sm text-gray-600">正常時段</div>
            </div>
            <SafeIcon icon={FiClock} className="text-2xl text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">{timeslots.filter(t => t.status === 'CANCELED').length}</div>
              <div className="text-sm text-gray-600">已取消</div>
            </div>
            <SafeIcon icon={FiX} className="text-2xl text-red-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{timeslots.reduce((sum, t) => sum + t.bookingCount, 0)}</div>
              <div className="text-sm text-gray-600">總預約數</div>
            </div>
            <SafeIcon icon={FiUser} className="text-2xl text-blue-600" />
          </div>
        </div>
      </div>

      {/* 時段列表 */}
      {loading ? (
        <div className="text-center py-12">
          <SafeIcon icon={FiClock} className="text-6xl text-gray-400 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">載入中...</h3>
          <p className="text-gray-600">正在載入課程時段資料</p>
        </div>
      ) : filteredTimeslots.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">時段 ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期時間</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">容量</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">預約數</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTimeslots.map((timeslot) => (
                  <motion.tr
                    key={timeslot.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{timeslot.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{formatDateTime(timeslot.start_time)}</div>
                        <div className="text-gray-500">{formatTime(timeslot.start_time)} - {formatTime(timeslot.end_time)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {timeslot.capacity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          timeslot.bookingCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {timeslot.bookingCount} 個預約
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(timeslot.status)}`}>
                        {getStatusText(timeslot.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                          title="查看詳情"
                        >
                          <SafeIcon icon={FiEye} className="text-xs" />
                          <span>詳情</span>
                        </motion.button>
                        
                        {timeslot.canCancel && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedTimeslot(timeslot);
                              setShowCancelModal(true);
                            }}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                            title="取消時段"
                          >
                            <SafeIcon icon={FiX} className="text-xs" />
                            <span>取消</span>
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <SafeIcon icon={FiCalendar} className="text-4xl text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">沒有找到符合條件的時段</h3>
          <p className="text-gray-600">請調整篩選條件或清除篩選重新搜尋</p>
        </div>
      )}

      {/* 取消確認模態框 */}
      {showCancelModal && selectedTimeslot && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !cancelling && setShowCancelModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">取消課程時段</h3>
              <button
                onClick={() => !cancelling && setShowCancelModal(false)}
                disabled={cancelling}
                className="text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed"
              >
                <SafeIcon icon={FiX} className="text-xl" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <SafeIcon icon={FiAlertTriangle} className="text-red-600 text-xl mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900 mb-2">確定要取消此課程時段嗎？</h4>
                  <div className="text-sm text-red-800 space-y-1">
                    <div>時段 ID：#{selectedTimeslot.id}</div>
                    <div>時間：{formatDateTime(selectedTimeslot.start_time)} {formatTime(selectedTimeslot.start_time)}-{formatTime(selectedTimeslot.end_time)}</div>
                    <div>影響預約：{selectedTimeslot.bookingCount} 個</div>
                  </div>
                  <div className="mt-3 p-2 bg-red-100 rounded text-xs text-red-700">
                    ⚠️ 此操作將：
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      <li>自動取消所有相關學生預約</li>
                      <li>發送取消通知給受影響學生</li>
                      <li>此操作無法撤銷</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCancelTimeslot}
                disabled={cancelling}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {cancelling ? '取消中...' : '確認取消時段'}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:cursor-not-allowed"
              >
                保留時段
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default TimeslotManagement;