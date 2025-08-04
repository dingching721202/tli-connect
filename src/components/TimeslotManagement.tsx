'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiUser, FiAlertTriangle, FiX, FiEye, FiSearch, FiFilter, FiInfo, FiEdit, FiUserPlus, FiCheck, FiAlertCircle, FiExternalLink } from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import { useAuth } from '@/contexts/AuthContext';
import { getActiveTeachers, Teacher as TeacherData } from '@/data/teachers';
import { getAllTimeslotsWithBookings, TimeslotWithBookings, cancelTimeslot, restoreTimeslot } from '@/services/timeslotService';

// 使用統一的 TimeslotWithBookings 接口
type TimeslotWithDetails = TimeslotWithBookings;

const TimeslotManagement: React.FC = () => {
  const { user } = useAuth();
  const [timeslots, setTimeslots] = useState<TimeslotWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'started' | 'completed' | 'canceled'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTimeslot, setSelectedTimeslot] = useState<TimeslotWithDetails | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTimeslotForDetail, setSelectedTimeslotForDetail] = useState<TimeslotWithDetails | null>(null);
  const [availableTeachers, setAvailableTeachers] = useState<TeacherData[]>([]);
  const [editingTeacherForTimeslot, setEditingTeacherForTimeslot] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherData | null>(null);
  const [availableTeachersForSlot, setAvailableTeachersForSlot] = useState<TeacherData[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Check if teacher has time conflict
  const checkTeacherTimeConflict = async (teacherId: string, courseDate: string, courseTime: string): Promise<boolean> => {
    try {
      // Get all bookings for the teacher
      const [startTime, endTime] = courseTime.split('-');
      const courseDateStr = courseDate.split('T')[0]; // Get date part only
      
      // Check for conflicts with existing timeslots
      const hasConflict = timeslots.some(slot => {
        // Skip if slot is cancelled
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((slot as any).status === 'CANCELED') return false;
        
        // Check if same teacher and same date
        if (slot.teacherId === teacherId) {
          const slotDateStr = slot.date.split('T')[0];
          if (slotDateStr === courseDateStr) {
            // Check time overlap
            const slotStartTime = slot.startTime.replace(':', '');
            const slotEndTime = slot.endTime.replace(':', '');
            const courseStartTime = startTime.replace(':', '');
            const courseEndTime = endTime.replace(':', '');
            
            return (courseStartTime < slotEndTime && courseEndTime > slotStartTime);
          }
        }
        return false;
      });

      return hasConflict;
    } catch (error) {
      console.error('檢查教師時段衝突失敗:', error);
      return false; // If error, assume no conflict
    }
  };

  // Get suitable teachers based on course type and time availability
  const getSuitableTeachers = (courseName: string): TeacherData[] => {
    // Extract course category from course name
    let requiredCategories: string[] = [];
    
    if (courseName.includes('英文') || courseName.includes('English')) {
      requiredCategories = ['英文', '商業'];
    } else if (courseName.includes('中文') || courseName.includes('華語') || courseName.includes('Chinese')) {
      requiredCategories = ['中文', '商業'];
    } else if (courseName.includes('日文') || courseName.includes('Japanese')) {
      requiredCategories = ['日文'];
    } else {
      // Default to all categories if can't determine
      requiredCategories = ['中文', '英文', '商業', '文化'];
    }

    return availableTeachers.filter(teacher => 
      teacher.teachingCategory.some(category => 
        requiredCategories.includes(category)
      )
    );
  };

  // Check teacher availability when editing starts
  const checkTeacherAvailability = async (courseName: string, courseDate: string, courseTime: string) => {
    setCheckingAvailability(true);
    const suitableTeachers = getSuitableTeachers(courseName);
    const availableTeachersForSlot: TeacherData[] = [];

    for (const teacher of suitableTeachers) {
      const hasConflict = await checkTeacherTimeConflict(teacher.id.toString(), courseDate, courseTime);
      if (!hasConflict) {
        availableTeachersForSlot.push(teacher);
      }
    }

    setAvailableTeachersForSlot(availableTeachersForSlot);
    setCheckingAvailability(false);
  };

  // Handle updating substitute teacher
  const handleUpdateTeacher = async (timeslotId: string) => {
    if (!selectedTeacher) {
      alert('請先選擇新的教師');
      return;
    }

    // Validate that the selected teacher is in the available list
    if (!availableTeachersForSlot.some(teacher => teacher.id === selectedTeacher.id)) {
      alert('⚠️ 所選教師在該時段不可用，請重新選擇');
      return;
    }

    try {
      // Update the timeslot with new teacher
      const updatedTimeslots = timeslots.map(slot => {
        if (slot.id === timeslotId) {
          return {
            ...slot,
            teacherId: selectedTeacher.id.toString(),
            teacherName: selectedTeacher.name
          };
        }
        return slot;
      });

      setTimeslots(updatedTimeslots);
      setEditingTeacherForTimeslot(null);
      setSelectedTeacher(null);
      setAvailableTeachersForSlot([]);
      alert(`✅ 教師已變更為：${selectedTeacher.name}`);
    } catch (error) {
      console.error('變更教師失敗:', error);
      alert('❌ 變更教師失敗');
    }
  };

  // 載入課程時段資料 - 直接使用預約API數據
  useEffect(() => {
    if (!user || !['OPS', 'ADMIN'].includes(user.primary_role)) {
      setLoading(false);
      return;
    }
    
    const loadTimeslots = async () => {
      try {
        setLoading(true);
        console.log('🔍 開始載入時段預約數據...');
        
        // 使用統一的時段服務獲取所有時段預約數據
        const timelsotsWithBookings = getAllTimeslotsWithBookings();
        console.log('✅ 時段預約數據載入完成，總共:', timelsotsWithBookings.length, '個時段');
        
        setTimeslots(timelsotsWithBookings);
        
        // 獲取在職教師列表
        const activeTeachers = getActiveTeachers();
        setAvailableTeachers(activeTeachers);
        
      } catch (error) {
        console.error('❌ 載入課程時段失敗:', error);
        setTimeslots([]);
        setAvailableTeachers([]);
      } finally {
        setLoading(false);
      }
    };

    loadTimeslots();
    
    // 監聽預約更新事件，實時刷新數據
    const handleBookingsUpdate = () => {
      console.log('📱 收到預約更新事件，重新載入時段數據');
      loadTimeslots();
    };
    
    // 監聽時段更新事件（取消/恢復）
    const handleTimeslotUpdate = () => {
      console.log('📅 收到時段更新事件，重新載入時段數據');
      loadTimeslots();
    };
    
    window.addEventListener('bookingsUpdated', handleBookingsUpdate);
    window.addEventListener('timeslotUpdated', handleTimeslotUpdate);
    
    return () => {
      window.removeEventListener('bookingsUpdated', handleBookingsUpdate);
      window.removeEventListener('timeslotUpdated', handleTimeslotUpdate);
    };
  }, [user]);

  // 檢查用戶權限
  if (!user || !['OPS', 'ADMIN'].includes(user.primary_role)) {
    return (
      <div className="text-center py-12">
        <SafeIcon icon={FiAlertTriangle} className="text-6xl text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">權限不足</h3>
        <p className="text-gray-600">此功能僅限課務人員和管理員使用</p>
      </div>
    );
  }

  // 過濾時段（添加防禦性檢查）
  const filteredTimeslots = (timeslots || []).filter(timeslot => {
    // 狀態過濾
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending' && timeslot.timeStatus !== 'pending') {
        return false;
      }
      if (statusFilter === 'started' && timeslot.timeStatus !== 'started') {
        return false;
      }
      if (statusFilter === 'completed' && timeslot.timeStatus !== 'completed') {
        return false;
      }
      if (statusFilter === 'canceled' && timeslot.timeStatus !== 'canceled') {
        return false;
      }
    }

    // 日期過濾
    if (dateFilter) {
      if (timeslot.date !== dateFilter) {
        return false;
      }
    }

    // 搜尋過濾
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const slotDate = new Date(timeslot.date).toLocaleDateString('zh-TW');
      
      return (
        timeslot.title.toLowerCase().includes(searchLower) ||
        timeslot.teacherName.toLowerCase().includes(searchLower) ||
        slotDate.includes(searchTerm) ||
        timeslot.startTime.includes(searchTerm)
      );
    }

    return true;
  });

  // 處理取消時段
  const handleCancelTimeslot = async () => {
    if (!selectedTimeslot) return;

    try {
      setCancelling(true);
      
      // 調用取消時段服務
      const success = cancelTimeslot(selectedTimeslot.id);
      
      if (success) {
        alert(`✅ 課程時段已成功取消！

課程：${selectedTimeslot.title}
教師：${selectedTimeslot.teacherName}
時間：${formatDateTime(`${selectedTimeslot.date} ${selectedTimeslot.startTime}`)} - ${formatTime(`${selectedTimeslot.date} ${selectedTimeslot.endTime}`)}
影響預約：${selectedTimeslot.bookedCount} 個

相關學生將收到取消通知。`);
        
        // 時段服務會自動觸發更新事件，無需手動重新載入
        
      } else {
        alert('❌ 取消課程時段失敗');
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

  // 處理恢復時段
  const handleRestoreTimeslot = async (timeslot: TimeslotWithDetails) => {
    try {
      const success = restoreTimeslot(timeslot.id);
      
      if (success) {
        alert(`✅ 課程時段已成功恢復！

課程：${timeslot.title}
教師：${timeslot.teacherName}
時間：${formatDateTime(`${timeslot.date} ${timeslot.startTime}`)} - ${formatTime(`${timeslot.date} ${timeslot.endTime}`)}

時段現在重新開放預約。`);
        
      } else {
        alert('❌ 恢復課程時段失敗');
      }
      
    } catch (error) {
      console.error('恢復課程時段錯誤:', error);
      alert('恢復過程中發生錯誤，請稍後再試');
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

  // 格式化日期（YYYY-MM-DD格式）
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // 獲取狀態顏色
  const getStatusColor = (timeslot: TimeslotWithDetails) => {
    if (timeslot.timeStatus === 'canceled') {
      return 'text-red-700 bg-red-50 border-red-200';
    }
    if (timeslot.status === 'past' || timeslot.timeStatus === 'completed') {
      return 'text-gray-700 bg-gray-50 border-gray-200';
    }
    if (timeslot.timeStatus === 'started') {
      return 'text-blue-700 bg-blue-50 border-blue-200';
    }
    return 'text-orange-700 bg-orange-50 border-orange-200';
  };

  // 獲取狀態文字
  const getStatusText = (timeslot: TimeslotWithDetails) => {
    if (timeslot.timeStatus === 'canceled') {
      return '已取消';
    }
    if (timeslot.status === 'past' || timeslot.timeStatus === 'completed') {
      return '已結束';
    }
    if (timeslot.timeStatus === 'started') {
      return '已開課';
    }
    return '待開課';
  };

  // 獲取狀態樣式

  // 處理查看詳情
  const handleViewDetail = (timeslot: TimeslotWithDetails) => {
    setSelectedTimeslotForDetail(timeslot);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* 標題 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">時段管理</h2>
          <p className="text-sm text-gray-600 mt-1">管理和取消課程時段</p>
        </div>
      </div>

      {/* 篩選和搜尋 */}
      <div className="space-y-4">
        {/* 搜尋和日期篩選 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜尋課程名稱、教師姓名或時間..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

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

        {/* 狀態切換按鈕 */}
        <div className="flex flex-wrap gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStatusFilter('started')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              statusFilter === 'started'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
            }`}
          >
            已開課
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              statusFilter === 'pending'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
            }`}
          >
            待開課
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStatusFilter('canceled')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              statusFilter === 'canceled'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
            }`}
          >
            已取消
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStatusFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              statusFilter === 'completed'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
            }`}
          >
            已上課
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
            }`}
          >
            全部
          </motion.button>
        </div>
      </div>

      {/* 統計資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{(timeslots || []).length}</div>
              <div className="text-sm text-gray-600">總時段數</div>
            </div>
            <SafeIcon icon={FiCalendar} className="text-2xl text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{(timeslots || []).filter(t => t.timeStatus === 'started').length}</div>
              <div className="text-sm text-gray-600">已開課</div>
            </div>
            <SafeIcon icon={FiUser} className="text-2xl text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{(timeslots || []).filter(t => t.timeStatus === 'pending').length}</div>
              <div className="text-sm text-gray-600">待開課</div>
            </div>
            <SafeIcon icon={FiClock} className="text-2xl text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{(timeslots || []).filter(t => t.timeStatus === 'completed').length}</div>
              <div className="text-sm text-gray-600">已上課</div>
            </div>
            <SafeIcon icon={FiUser} className="text-2xl text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{(timeslots || []).filter(t => t.timeStatus === 'canceled').length}</div>
              <div className="text-sm text-gray-600">已取消</div>
            </div>
            <SafeIcon icon={FiX} className="text-2xl text-blue-600" />
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
            <table className="w-full table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-44 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期時間</th>
                  <th className="w-64 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">課程名稱</th>
                  <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">教師</th>
                  <th className="w-20 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">容量</th>
                  <th className="w-28 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">學生預約</th>
                  <th className="w-24 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                  <th className="w-auto px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
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
                    <td className="w-44 px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{formatDateTime(`${timeslot.date} ${timeslot.startTime}`)}</div>
                        <div className="text-gray-500 text-xs">{timeslot.startTime} - {timeslot.endTime}</div>
                      </div>
                    </td>
                    <td className="w-64 px-6 py-4 text-sm text-gray-900">
                      <div className="truncate">
                        <div className="font-medium text-gray-900 truncate" title={timeslot.title}>{timeslot.title}</div>
                      </div>
                    </td>
                    <td className="w-32 px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="truncate" title={timeslot.teacherName}>{timeslot.teacherName}</div>
                    </td>
                    <td className="w-20 px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {timeslot.capacity}
                    </td>
                    <td className="w-28 px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center justify-center">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          timeslot.bookedCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {timeslot.bookedCount} 位學生
                        </span>
                      </div>
                    </td>
                    <td className="w-24 px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(timeslot)}`}>
                          {getStatusText(timeslot)}
                        </span>
                      </div>
                    </td>
                    <td className="w-auto px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewDetail(timeslot)}
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
                              setEditingTeacherForTimeslot(timeslot.id);
                              checkTeacherAvailability(timeslot.title, timeslot.date, `${timeslot.startTime}-${timeslot.endTime}`);
                            }}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                            title="變更老師"
                          >
                            <SafeIcon icon={FiEdit} className="text-xs" />
                            <span>變更老師</span>
                          </motion.button>
                        )}
                        
                        {/* 取消/恢復按鈕 */}
                        {timeslot.timeStatus === 'canceled' ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRestoreTimeslot(timeslot)}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                            title="恢復時段"
                          >
                            <SafeIcon icon={FiCheck} className="text-xs" />
                            <span>恢復</span>
                          </motion.button>
                        ) : timeslot.canCancel && (
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
          {timeslots.length === 0 ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暫無課程時段</h3>
              <p className="text-gray-600">目前系統中沒有已發布的課程排程，請先到課程管理建立並發布課程排程</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">沒有找到符合條件的時段</h3>
              <p className="text-gray-600">請調整篩選條件或清除篩選重新搜尋</p>
            </>
          )}
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
                    <div>課程：{selectedTimeslot.title}</div>
                    <div>教師：{selectedTimeslot.teacherName}</div>
                    <div>時間：{formatDateTime(`${selectedTimeslot.date} ${selectedTimeslot.startTime}`)} {selectedTimeslot.startTime}-{selectedTimeslot.endTime}</div>
                    <div>影響預約：{selectedTimeslot.bookedCount} 個</div>
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

      {/* 時段詳情模態框 */}
      {showDetailModal && selectedTimeslotForDetail && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">預約詳情</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <SafeIcon icon={FiX} className="text-xl" />
              </button>
            </div>

            <div className="space-y-6">
              {/* 課程資訊 */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3 text-gray-900">課程資訊</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">課程名稱：</span>
                    <span className="font-medium break-words text-right max-w-xs">{selectedTimeslotForDetail.title || '未知課程'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">上課時間：</span>
                    <span className="text-right">{formatDate(selectedTimeslotForDetail.date)} {selectedTimeslotForDetail.startTime || ''}-{selectedTimeslotForDetail.endTime || ''}</span>
                  </div>
                </div>
              </div>

              {/* 教師資訊 */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-3 text-blue-900">教師資訊</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-600">教師姓名：</span>
                    <span className="font-medium text-right">{selectedTimeslotForDetail.teacherName || '未知教師'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">電子信箱：</span>
                    <span className="text-right">{(() => {
                      const teacherId = selectedTimeslotForDetail.teacherId;
                      const teacher = availableTeachers.find(t => t.id.toString() === teacherId);
                      return teacher ? teacher.email : 'teacher@tli.com';
                    })()}</span>
                  </div>
                  {(() => {
                    // 根據教師ID查找教師專業資訊
                    const teacherId = selectedTimeslotForDetail.teacherId;
                    const teacher = availableTeachers.find(t => t.id.toString() === teacherId);
                    
                    if (teacher) {
                      return (
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-blue-600">教學經驗：</span>
                            <span className="text-right">{teacher.experience}</span>
                          </div>
                          <div className="flex justify-between items-start">
                            <span className="text-blue-600">語言能力：</span>
                            <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                              {teacher.languages.map((lang, index) => (
                                <span key={index} className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                  {lang}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-start">
                            <span className="text-blue-600">專業領域：</span>
                            <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                              {teacher.expertise.map((exp, index) => (
                                <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {exp}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-start">
                            <span className="text-blue-600">專業證照：</span>
                            <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                              {teacher.qualification.map((qual, index) => (
                                <span key={index} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                  {qual}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      // 如果找不到教師資訊，顯示預設資訊
                      const defaultTeacherInfo = {
                        expertise: ['商務英語', '簡報技巧', '談判英語'],
                        experience: '10年以上',
                        qualification: ['TESOL', 'Business English Certificate'],
                        languages: ['English(母語)', '中文(流利)']
                      };
                      
                      return (
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-blue-600">教學經驗：</span>
                            <span className="text-right">{defaultTeacherInfo.experience}</span>
                          </div>
                          <div className="flex justify-between items-start">
                            <span className="text-blue-600">語言能力：</span>
                            <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                              {defaultTeacherInfo.languages.map((lang, index) => (
                                <span key={index} className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                  {lang}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-start">
                            <span className="text-blue-600">專業領域：</span>
                            <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                              {defaultTeacherInfo.expertise.map((exp, index) => (
                                <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {exp}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-start">
                            <span className="text-blue-600">專業證照：</span>
                            <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                              {defaultTeacherInfo.qualification.map((qual, index) => (
                                <span key={index} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                  {qual}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>

              {/* 學生名單 */}
              {selectedTimeslotForDetail.bookedCount > 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-green-900">學生名單</h4>
                    <span className="text-sm text-green-700">學生人數：{selectedTimeslotForDetail.bookedCount}人</span>
                  </div>
                  <div className="space-y-3">
                    {!selectedTimeslotForDetail.enrolledStudents || selectedTimeslotForDetail.enrolledStudents.length === 0 ? (
                      <div className="bg-white p-3 rounded border text-center text-gray-500">
                        暫無學生預約
                      </div>
                    ) : (
                      selectedTimeslotForDetail.enrolledStudents.map((student) => (
                        <div key={student.bookingId} className="bg-white p-3 rounded border">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-green-600">學生姓名：</span>
                              <span className="font-medium text-gray-900 text-right">{student.userName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-600">電子信箱：</span>
                              <span className="text-gray-700 text-right">{student.userEmail}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-600">預約時間：</span>
                              <span className="text-gray-700 text-right">{new Date(student.bookedAt).toLocaleString('zh-TW')}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* 課程連結 */}
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium mb-3 text-green-900">課程連結</h4>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      if (selectedTimeslotForDetail?.classroom_link) {
                        window.open(selectedTimeslotForDetail.classroom_link, '_blank');
                      }
                    }}
                    disabled={!selectedTimeslotForDetail?.classroom_link}
                    className={`w-full flex items-center justify-center space-x-2 text-white py-2 px-4 rounded-lg transition-colors ${
                      !selectedTimeslotForDetail?.classroom_link
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    <SafeIcon icon={FiExternalLink} />
                    <span>進入線上教室</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      if (selectedTimeslotForDetail?.material_link) {
                        window.open(selectedTimeslotForDetail.material_link, '_blank');
                      }
                    }}
                    disabled={!selectedTimeslotForDetail?.material_link}
                    className={`w-full flex items-center justify-center space-x-2 text-white py-2 px-4 rounded-lg transition-colors ${
                      !selectedTimeslotForDetail?.material_link
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <SafeIcon icon={FiEye} />
                    <span>查看課程教材</span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                關閉
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Teacher Change Modal */}
      {editingTeacherForTimeslot && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setEditingTeacherForTimeslot(null);
            setSelectedTeacher(null);
            setAvailableTeachersForSlot([]);
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-[700px] max-h-[90vh] flex flex-col border border-gray-100"
          >
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 rounded-full p-2">
                  <SafeIcon icon={FiEdit} className="text-xl" />
                </div>
                <div>
                  <h4 className="text-xl font-bold">變更教師</h4>
                  <p className="text-green-100 mt-1">
                    課程：{timeslots.find(t => t.id === editingTeacherForTimeslot)?.title}
                  </p>
                  <p className="text-green-100 text-sm">
                    時間：{timeslots.find(t => t.id === editingTeacherForTimeslot)?.date} {timeslots.find(t => t.id === editingTeacherForTimeslot)?.startTime}-{timeslots.find(t => t.id === editingTeacherForTimeslot)?.endTime}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
                <SafeIcon icon={FiInfo} className="inline mr-2" />
                {checkingAvailability ? (
                  <span>正在檢查教師時段可用性...</span>
                ) : (
                  <span>已為您篩選出符合該時段可用且專業對口的優秀教師</span>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {checkingAvailability ? (
                <div className="p-8 text-center">
                  <div className="bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <SafeIcon icon={FiClock} className="text-2xl text-green-500 animate-spin" />
                  </div>
                  <h5 className="font-medium text-gray-700 mb-2">檢查教師可用性中</h5>
                  <p className="text-gray-500 text-sm">正在確認教師在該時段沒有課程衝突...</p>
                </div>
              ) : availableTeachersForSlot.length > 0 ? (
                availableTeachersForSlot.map((teacher) => (
                  <motion.div
                    key={teacher.id}
                    whileHover={{ scale: 1.01, backgroundColor: '#f9fafb' }}
                    onClick={() => setSelectedTeacher(teacher)}
                    className={`p-4 cursor-pointer border border-gray-200 rounded-xl mb-3 transition-all duration-200 ${
                      selectedTeacher?.id === teacher.id 
                        ? 'bg-green-50 border-green-300 shadow-md ring-2 ring-green-200' 
                        : 'hover:border-green-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h5 className="font-medium text-gray-900">{teacher.name}</h5>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            teacher.contractType === 'full-time' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {teacher.contractType === 'full-time' ? '全職' : '兼職'}
                          </span>
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                            ⭐ {teacher.rating}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                          <div>
                            <span className="font-medium">專長：</span>
                            {teacher.expertise.join('、')}
                          </div>
                          <div>
                            <span className="font-medium">授課類型：</span>
                            {teacher.teachingCategory.join('、')}
                          </div>
                          <div>
                            <span className="font-medium">經驗：</span>
                            {teacher.experience}
                          </div>
                          <div>
                            <span className="font-medium">教學時數：</span>
                            {teacher.teachingHours}小時
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">證書：</span>
                          {teacher.qualification.join('、')}
                        </div>
                        
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="font-medium">語言：</span>
                          {teacher.languages.join('、')}
                        </div>
                      </div>
                      {selectedTeacher?.id === teacher.id && (
                        <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full ml-4">
                          <SafeIcon icon={FiCheck} className="text-white text-lg" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <SafeIcon icon={FiAlertTriangle} className="text-2xl text-gray-400" />
                  </div>
                  <h5 className="font-medium text-gray-700 mb-2">該時段無可用教師</h5>
                  <p className="text-gray-500 text-sm">符合課程類型的教師在該時段都有課程安排</p>
                </div>
              )}
            </div>
            
            {/* 確認區域 */}
            <div className="sticky bottom-0 p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              {!selectedTeacher ? (
                <div className="text-center py-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <SafeIcon icon={FiAlertCircle} className="inline text-amber-500 mr-2" />
                    <span className="text-amber-700 font-medium">請先選擇新的教師</span>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-500 rounded-full p-2">
                        <SafeIcon icon={FiUserPlus} className="text-white text-sm" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-800">將變更為新教師</p>
                        <p className="text-green-700">{selectedTeacher.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-block text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full whitespace-nowrap">
                        {selectedTeacher.teachingCategory.join('、')}
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        ⭐ {selectedTeacher.rating} | {selectedTeacher.experience}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setEditingTeacherForTimeslot(null);
                    setSelectedTeacher(null);
                    setAvailableTeachersForSlot([]);
                  }}
                  className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  <SafeIcon icon={FiX} className="inline mr-2" />
                  取消
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: selectedTeacher ? 1.05 : 1 }}
                  whileTap={{ scale: selectedTeacher ? 0.95 : 1 }}
                  onClick={() => editingTeacherForTimeslot && handleUpdateTeacher(editingTeacherForTimeslot)}
                  disabled={!selectedTeacher}
                  className={`px-10 py-4 rounded-lg font-bold text-xl transition-all duration-200 min-w-[200px] ${
                    selectedTeacher 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-xl hover:shadow-2xl transform border-2 border-green-400' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <SafeIcon icon={FiCheck} className="inline mr-2 text-lg" />
                  確認變更教師
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default TimeslotManagement;