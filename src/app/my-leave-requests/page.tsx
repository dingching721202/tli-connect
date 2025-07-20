'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';

const {
  FiClock, FiCalendar, FiX, FiUserCheck,
  FiMessageSquare, FiUsers, FiAlertCircle, FiCheckCircle
} = FiIcons;

interface MyLeaveRequest {
  id: string;
  courseName: string;
  courseDate: string;
  courseTime: string;
  leaveReason: string;
  note?: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  studentCount: number;
  classroom: string;
  substituteTeacher?: {
    name: string;
    email: string;
  } | null;
  adminNote?: string;
}

export default function MyLeaveRequestsPage() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MyLeaveRequest | null>(null);

  // Check if user is instructor
  if (!user || user.role !== 'instructor') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">存取被拒</h1>
            <p className="text-gray-600">此頁面僅供教師使用。</p>
          </div>
        </div>
      </div>
    );
  }

  // Mock data - 模擬教師的請假申請記錄
  const myLeaveRequests: MyLeaveRequest[] = [
    {
      id: '1',
      courseName: '商務華語會話',
      courseDate: '2025-01-25',
      courseTime: '09:00-10:30',
      leaveReason: '身體不適',
      note: '突然發燒，不適宜上課',
      requestDate: '2025-01-20',
      status: 'pending',
      studentCount: 12,
      classroom: 'https://meet.google.com/abc-def-ghi'
    },
    {
      id: '2',
      courseName: '華語文法精修',
      courseDate: '2025-01-28',
      courseTime: '14:00-15:30',
      leaveReason: '參加學術會議',
      note: '參加台灣華語教學研討會',
      requestDate: '2025-01-18',
      status: 'approved',
      studentCount: 8,
      classroom: 'https://meet.google.com/def-ghi-jkl',
      substituteTeacher: {
        name: '陳老師',
        email: 'teacher.chen@tli.com'
      },
      adminNote: '已安排陳老師代課，請提前準備教材交接。'
    },
    {
      id: '3',
      courseName: '華語聽力強化',
      courseDate: '2025-01-22',
      courseTime: '10:00-11:30',
      leaveReason: '家庭緊急事務',
      note: '家人住院需要照顧',
      requestDate: '2025-01-19',
      status: 'rejected',
      studentCount: 15,
      classroom: 'https://meet.google.com/ghi-jkl-mno',
      adminNote: '此時段無可用代課老師，建議調整課程時間或提前安排。'
    },
    {
      id: '4',
      courseName: '商務華語寫作',
      courseDate: '2025-01-15',
      courseTime: '15:00-16:30',
      leaveReason: '個人事務',
      note: '需要處理重要個人事務',
      requestDate: '2025-01-10',
      status: 'approved',
      studentCount: 10,
      classroom: 'https://meet.google.com/jkl-mno-pqr',
      substituteTeacher: {
        name: '劉老師',
        email: 'teacher.liu@tli.com'
      }
    }
  ];

  const filteredRequests = myLeaveRequests.filter(request => {
    if (selectedTab === 'all') return true;
    return request.status === selectedTab;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'approved': return 'text-green-700 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-700 bg-red-50 border-red-200';
      case 'cancelled': return 'text-gray-700 bg-gray-50 border-gray-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待審核';
      case 'approved': return '已批准';
      case 'rejected': return '已拒絕';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return FiClock;
      case 'approved': return FiCheckCircle;
      case 'rejected': return FiX;
      case 'cancelled': return FiX;
      default: return FiAlertCircle;
    }
  };

  const handleCancelRequest = (requestId: string, courseName: string) => {
    const request = myLeaveRequests.find(req => req.id === requestId);
    if (request && request.status === 'pending') {
      if (confirm(`確定要取消「${courseName}」的請假申請嗎？`)) {
        alert('✅ 請假申請已取消');
        // Here you would update the request status
      }
    }
  };

  const DetailModal = () => (
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
          <h3 className="text-xl font-bold">請假申請詳情</h3>
          <button
            onClick={() => setShowDetailModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <SafeIcon icon={FiX} className="text-xl" />
          </button>
        </div>

        {selectedRequest && (
          <div className="space-y-6">
            {/* 課程資訊 */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3 text-gray-900">課程資訊</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">課程名稱：</span>
                  <span className="font-medium">{selectedRequest.courseName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">上課時間：</span>
                  <span>{formatDate(selectedRequest.courseDate)} {selectedRequest.courseTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">學生人數：</span>
                  <span>{selectedRequest.studentCount} 位</span>
                </div>
              </div>
            </div>

            {/* 請假資訊 */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-3 text-blue-900">請假資訊</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-600">申請日期：</span>
                  <span>{formatDate(selectedRequest.requestDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">請假原因：</span>
                  <span className="font-medium">{selectedRequest.leaveReason}</span>
                </div>
                {selectedRequest.note && (
                  <div className="mt-2">
                    <div className="text-blue-600 mb-1">詳細說明：</div>
                    <div className="text-gray-700 bg-white p-2 rounded border">
                      {selectedRequest.note}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 審核狀態 */}
            <div className={`p-4 rounded-lg ${
              selectedRequest.status === 'approved' ? 'bg-green-50' :
              selectedRequest.status === 'rejected' ? 'bg-red-50' : 'bg-yellow-50'
            }`}>
              <div className="flex items-center space-x-2 mb-3">
                <SafeIcon 
                  icon={getStatusIcon(selectedRequest.status)} 
                  className={`text-lg ${
                    selectedRequest.status === 'approved' ? 'text-green-600' :
                    selectedRequest.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                  }`} 
                />
                <h4 className={`font-medium ${
                  selectedRequest.status === 'approved' ? 'text-green-900' :
                  selectedRequest.status === 'rejected' ? 'text-red-900' : 'text-yellow-900'
                }`}>
                  審核狀態：{getStatusText(selectedRequest.status)}
                </h4>
              </div>
              
              {selectedRequest.status === 'approved' && selectedRequest.substituteTeacher && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-600">代課老師：</span>
                    <span className="font-medium">{selectedRequest.substituteTeacher.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">聯絡信箱：</span>
                    <span>{selectedRequest.substituteTeacher.email}</span>
                  </div>
                </div>
              )}
              
              {selectedRequest.adminNote && (
                <div className="mt-3">
                  <div className={`mb-1 font-medium ${
                    selectedRequest.status === 'approved' ? 'text-green-600' :
                    selectedRequest.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    管理員備註：
                  </div>
                  <div className="text-gray-700 bg-white p-2 rounded border">
                    {selectedRequest.adminNote}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowDetailModal(false)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              關閉
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">我的請假記錄</h1>
          <p className="text-gray-600">查看您的請假申請狀態和歷史記錄</p>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          {[
            { 
              label: '待審核', 
              count: myLeaveRequests.filter(r => r.status === 'pending').length,
              color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
              icon: FiClock
            },
            { 
              label: '已批准', 
              count: myLeaveRequests.filter(r => r.status === 'approved').length,
              color: 'text-green-600 bg-green-50 border-green-200',
              icon: FiCheckCircle
            },
            { 
              label: '已拒絕', 
              count: myLeaveRequests.filter(r => r.status === 'rejected').length,
              color: 'text-red-600 bg-red-50 border-red-200',
              icon: FiX
            },
            { 
              label: '總計', 
              count: myLeaveRequests.length,
              color: 'text-blue-600 bg-blue-50 border-blue-200',
              icon: FiMessageSquare
            }
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`p-4 rounded-xl border ${stat.color}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stat.count}</div>
                  <div className="text-sm font-medium">{stat.label}</div>
                </div>
                <SafeIcon icon={stat.icon} className="text-2xl" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            {[
              { key: 'pending', label: '待審核', count: myLeaveRequests.filter(r => r.status === 'pending').length },
              { key: 'approved', label: '已批准', count: myLeaveRequests.filter(r => r.status === 'approved').length },
              { key: 'rejected', label: '已拒絕', count: myLeaveRequests.filter(r => r.status === 'rejected').length },
              { key: 'all', label: '全部', count: myLeaveRequests.length }
            ].map((tab) => (
              <motion.button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key as 'pending' | 'approved' | 'rejected' | 'all')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  selectedTab === tab.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {tab.label} ({tab.count})
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Requests List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                  {/* Left Side - Course Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {request.courseName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <SafeIcon icon={FiCalendar} className="text-xs" />
                            <span>{formatDate(request.courseDate)} {request.courseTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <SafeIcon icon={FiUsers} className="text-xs" />
                            <span>{request.studentCount} 位學生</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <SafeIcon icon={FiMessageSquare} className="text-xs" />
                            <span>{request.leaveReason}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </div>

                    {/* Substitute Teacher Info */}
                    {request.substituteTeacher && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center space-x-2 text-green-800">
                          <SafeIcon icon={FiUserCheck} className="text-sm" />
                          <span className="font-medium">代課老師：{request.substituteTeacher.name}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailModal(true);
                        }}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                      >
                        <SafeIcon icon={FiMessageSquare} className="text-xs" />
                        <span>查看詳情</span>
                      </motion.button>
                      
                      {request.status === 'pending' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCancelRequest(request.id, request.courseName)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                        >
                          <SafeIcon icon={FiX} className="text-xs" />
                          <span>取消申請</span>
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <SafeIcon icon={FiClock} className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedTab === 'pending' ? '暫無待審核申請' : 
                 selectedTab === 'approved' ? '暫無已批准申請' :
                 selectedTab === 'rejected' ? '暫無已拒絕申請' : '暫無請假記錄'}
              </h3>
              <p className="text-gray-600">
                您的請假申請記錄會顯示在這裡
              </p>
            </div>
          )}
        </motion.div>

        {/* Detail Modal */}
        {showDetailModal && <DetailModal />}
      </div>
    </div>
  );
}