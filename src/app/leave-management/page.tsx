'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';

const {
  FiClock, FiCalendar, FiUser, FiCheck, FiX, FiUserCheck,
  FiMessageSquare, FiUsers, FiBriefcase
} = FiIcons;

interface LeaveRequest {
  id: string;
  teacherName: string;
  teacherEmail: string;
  courseName: string;
  courseDate: string;
  courseTime: string;
  leaveReason: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  studentCount: number;
  classroom: string;
  substituteTeacher?: {
    name: string;
    email: string;
  } | null;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  specialties: string[];
  available: boolean;
}

interface StudentCancellation {
  id: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  courseDate: string;
  courseTime: string;
  instructorName: string;
  cancelReason: string;
  cancelNote?: string;
  cancelDate: string;
  membershipType: 'individual' | 'corporate';
  companyName?: string;
  status: 'pending' | 'processed';
}

export default function LeaveManagementPage() {
  const { user, isOps, isAdmin } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'pending' | 'approved' | 'cancelled' | 'all'>('pending');
  const [showSubstituteModal, setShowSubstituteModal] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);

  // Mock data - 模擬請假申請數據
  const leaveRequests: LeaveRequest[] = [
    {
      id: 'leave-1',
      teacherName: '張老師',
      teacherEmail: 'teacher.zhang@tli.com',
      courseName: '商務華語會話',
      courseDate: '2025-01-25',
      courseTime: '09:00-10:30',
      leaveReason: '家庭緊急事務',
      requestDate: '2025-01-20',
      status: 'pending',
      studentCount: 12,
      classroom: 'https://meet.google.com/abc-def-ghi'
    },
    {
      id: '2',
      teacherName: '王老師',
      teacherEmail: 'teacher.wang@tli.com',
      courseName: '華語文法精修',
      courseDate: '2025-01-28',
      courseTime: '14:00-15:30',
      leaveReason: '參加學術會議',
      requestDate: '2025-01-18',
      status: 'pending',
      studentCount: 8,
      classroom: 'https://meet.google.com/def-ghi-jkl'
    },
    {
      id: '3',
      teacherName: '李老師',
      teacherEmail: 'teacher.li@tli.com',
      courseName: '華語聽力強化',
      courseDate: '2025-01-22',
      courseTime: '10:00-11:30',
      leaveReason: '身體不適',
      requestDate: '2025-01-19',
      status: 'approved',
      studentCount: 15,
      classroom: 'https://meet.google.com/ghi-jkl-mno',
      substituteTeacher: {
        name: '陳老師',
        email: 'teacher.chen@tli.com'
      }
    }
  ];

  // Mock student cancellation records
  const studentCancellations: StudentCancellation[] = [
    {
      id: 'cancel-1',
      studentName: '王小明',
      studentEmail: 'student1@example.com',
      courseName: '商務華語會話',
      courseDate: '2025-01-25',
      courseTime: '09:00-10:30',
      instructorName: '張老師',
      cancelReason: '臨時有事',
      cancelNote: '公司臨時開會，無法參加',
      cancelDate: '2025-01-23',
      membershipType: 'individual',
      status: 'pending'
    },
    {
      id: '2',
      studentName: '李小華',
      studentEmail: 'user2@taiwantech.com',
      courseName: '華語文法精修',
      courseDate: '2025-01-26',
      courseTime: '14:00-15:30',
      instructorName: '王老師',
      cancelReason: '身體不適',
      cancelNote: '感冒發燒，不適宜上課',
      cancelDate: '2025-01-24',
      membershipType: 'corporate',
      companyName: '台灣科技股份有限公司',
      status: 'pending'
    },
    {
      id: '3',
      studentName: '程式設計師A',
      studentEmail: 'dev1@innovation.com',
      courseName: '商務華語會話',
      courseDate: '2025-01-20',
      courseTime: '10:00-11:30',
      instructorName: '張老師',
      cancelReason: '工作衝突',
      cancelDate: '2025-01-18',
      membershipType: 'corporate',
      companyName: '創新軟體有限公司',
      status: 'processed'
    }
  ];

  // Mock available teachers
  const availableTeachers: Teacher[] = [
    {
      id: 'teacher-1',
      name: '陳老師',
      email: 'teacher.chen@tli.com',
      specialties: ['商務華語', '華語會話'],
      available: true
    },
    {
      id: '2',
      name: '劉老師',
      email: 'teacher.liu@tli.com',
      specialties: ['華語文法', '華語寫作'],
      available: true
    },
    {
      id: '3',
      name: '黃老師',
      email: 'teacher.huang@tli.com',
      specialties: ['華語聽力', '華語發音'],
      available: true
    }
  ];

  // Check if user has admin permission
  if (!user || (!isOps && !isAdmin)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">存取被拒</h1>
            <p className="text-gray-600">您沒有權限存取此頁面。</p>
          </div>
        </div>
      </div>
    );
  }

  // Combine leave requests and cancellation records for display
  const allRecords = [
    ...leaveRequests.map(req => ({ ...req, type: 'leave' as const })),
    ...studentCancellations.map(cancel => ({ ...cancel, type: 'cancellation' as const }))
  ];

  const filteredRecords = allRecords.filter(record => {
    if (selectedTab === 'pending') {
      return record.status === 'pending';
    }
    if (selectedTab === 'approved') {
      return record.status === 'approved';
    }
    if (selectedTab === 'cancelled') {
      return record.type === 'cancellation' || record.status === 'cancelled';
    }
    return true; // 'all'
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
      case 'processed': return 'text-purple-700 bg-purple-50 border-purple-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待處理';
      case 'approved': return '已批准';
      case 'rejected': return '已拒絕';
      case 'cancelled': return '已取消';
      case 'processed': return '已處理';
      default: return '未知';
    }
  };

  const handleApproveLeave = (leaveId: string) => {
    setSelectedLeaveRequest(leaveRequests.find(req => req.id === leaveId) || null);
    setShowSubstituteModal(true);
  };

  const handleRejectLeave = () => {
    if (confirm('確定要拒絕這個請假申請嗎？')) {
      alert('✅ 請假申請已拒絕');
      // Here you would update the request status
    }
  };

  const handleCancelCourse = (_leaveId: string, courseName: string) => {
    if (confirm(`確定要取消課程「${courseName}」嗎？`)) {
      alert('✅ 課程已取消，系統將自動通知所有學生');
      // Here you would cancel the course
    }
  };

  const handleAssignSubstitute = (teacherId: string) => {
    const teacher = availableTeachers.find(t => t.id === teacherId);
    if (teacher && selectedLeaveRequest) {
      alert(`✅ 已指派 ${teacher.name} 為代課老師\n\n課程：${selectedLeaveRequest.courseName}\n時間：${selectedLeaveRequest.courseDate} ${selectedLeaveRequest.courseTime}\n\n系統將自動發送通知給所有學生。`);
      setShowSubstituteModal(false);
      setSelectedLeaveRequest(null);
    }
  };

  const SubstituteModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowSubstituteModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">指派代課老師</h3>
          <button
            onClick={() => setShowSubstituteModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <SafeIcon icon={FiX} className="text-xl" />
          </button>
        </div>

        {selectedLeaveRequest && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">課程資訊</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>課程：{selectedLeaveRequest.courseName}</div>
              <div>時間：{formatDate(selectedLeaveRequest.courseDate)} {selectedLeaveRequest.courseTime}</div>
              <div>學生：{selectedLeaveRequest.studentCount} 位</div>
              <div>請假老師：{selectedLeaveRequest.teacherName}</div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="font-medium">選擇代課老師：</h4>
          {availableTeachers.map((teacher) => (
            <motion.div
              key={teacher.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAssignSubstitute(teacher.id)}
              className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{teacher.name}</div>
                  <div className="text-sm text-gray-600">{teacher.email}</div>
                  <div className="text-xs text-blue-600 mt-1">
                    專長：{teacher.specialties.join('、')}
                  </div>
                </div>
                <div className="text-green-600 text-sm">
                  ✓ 可用
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => handleCancelCourse(selectedLeaveRequest?.id || '', selectedLeaveRequest?.courseName || '')}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            取消課程
          </button>
          <button
            onClick={() => setShowSubstituteModal(false)}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            關閉
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  const ReasonModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowReasonModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">請假原因</h3>
          <button
            onClick={() => setShowReasonModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <SafeIcon icon={FiX} className="text-xl" />
          </button>
        </div>

        {selectedLeaveRequest && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium mb-2">{selectedLeaveRequest.teacherName}</div>
              <div className="text-sm text-gray-600 mb-2">
                {selectedLeaveRequest.courseName} - {formatDate(selectedLeaveRequest.courseDate)} {selectedLeaveRequest.courseTime}
              </div>
              <div className="text-sm">
                <span className="font-medium">請假原因：</span>
                {selectedLeaveRequest.leaveReason}
              </div>
            </div>
            <button
              onClick={() => setShowReasonModal(false)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">請假與取消管理</h1>
          <p className="text-gray-600">管理教師請假申請、學生取消預約、指派代課老師和課程安排</p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            {[
              { key: 'pending', label: '待處理', count: allRecords.filter(r => r.status === 'pending').length },
              { key: 'approved', label: '已處理', count: allRecords.filter(r => r.status === 'approved').length },
              { key: 'cancelled', label: '學生取消', count: studentCancellations.length },
              { key: 'all', label: '全部', count: allRecords.length }
            ].map((tab) => (
              <motion.button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key as 'pending' | 'approved' | 'cancelled' | 'all')}
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

        {/* Leave Requests and Cancellation Records List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`rounded-xl shadow-sm border p-6 ${
                  record.type === 'cancellation' 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                  {/* Left Side - Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        {/* Title with type indicator */}
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {record.courseName}
                          </h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            record.type === 'cancellation' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {record.type === 'cancellation' ? '學生取消' : '教師請假'}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <SafeIcon icon={FiUser} className="text-xs" />
                            <span>
                              {record.type === 'cancellation' 
                                ? record.studentName 
                                : record.teacherName}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <SafeIcon icon={FiCalendar} className="text-xs" />
                            <span>{formatDate(record.courseDate)} {record.courseTime}</span>
                          </div>
                          {record.type === 'leave' && (
                            <div className="flex items-center space-x-1">
                              <SafeIcon icon={FiUsers} className="text-xs" />
                              <span>{record.studentCount} 位學生</span>
                            </div>
                          )}
                          {record.type === 'cancellation' && (
                            <div className="flex items-center space-x-1">
                              <SafeIcon icon={FiUser} className="text-xs" />
                              <span>教師：{record.instructorName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(record.status)}`}>
                        {getStatusText(record.status)}
                      </span>
                    </div>

                    {/* Company info for corporate members */}
                    {record.type === 'cancellation' && record.companyName && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center space-x-2 text-purple-800">
                          <SafeIcon icon={FiBriefcase} className="text-sm" />
                          <span className="font-medium">企業：{record.companyName}</span>
                        </div>
                      </div>
                    )}

                    {/* Substitute Teacher Info for approved leave */}
                    {record.type === 'leave' && record.substituteTeacher && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center space-x-2 text-green-800">
                          <SafeIcon icon={FiUserCheck} className="text-sm" />
                          <span className="font-medium">代課老師：{record.substituteTeacher.name}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (record.type === 'leave') {
                            setSelectedLeaveRequest(record);
                            setShowReasonModal(true);
                          } else {
                            // For cancellation records, show cancel reason
                            alert(`取消原因：${record.cancelReason}\n${record.cancelNote ? `詳細說明：${record.cancelNote}` : ''}`);
                          }
                        }}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                      >
                        <SafeIcon icon={FiMessageSquare} className="text-xs" />
                        <span>查看{record.type === 'cancellation' ? '取消' : '請假'}原因</span>
                      </motion.button>
                      
                      {record.type === 'cancellation' && record.status === 'pending' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            alert('✅ 取消記錄已處理');
                            // Here you would update the cancellation status to processed
                          }}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                        >
                          <SafeIcon icon={FiCheck} className="text-xs" />
                          <span>標記已處理</span>
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Right Side - Actions for leave requests only */}
                  {record.type === 'leave' && record.status === 'pending' && (
                    <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleApproveLeave(record.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <SafeIcon icon={FiCheck} className="text-sm" />
                        <span>批准請假</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRejectLeave()}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        <SafeIcon icon={FiX} className="text-sm" />
                        <span>拒絕請假</span>
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <SafeIcon icon={FiClock} className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedTab === 'pending' ? '暫無待處理請假申請' : selectedTab === 'approved' ? '暫無已處理請假申請' : '暫無請假申請'}
              </h3>
              <p className="text-gray-600">
                {selectedTab === 'pending' ? '所有請假申請都已處理完成' : '請假申請會顯示在這裡'}
              </p>
            </div>
          )}
        </motion.div>

        {/* Modals */}
        {showSubstituteModal && <SubstituteModal />}
        {showReasonModal && <ReasonModal />}
      </div>
    </div>
  );
}