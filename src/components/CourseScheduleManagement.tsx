'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import {
  CourseSchedule,
  TimeSlot,
  ScheduledSession,
  getCourseSchedules,
  createCourseSchedule,
  updateCourseSchedule,
  deleteCourseSchedule,
  generateScheduledSessions,
  calculateEndDate,
  getCourseScheduleFullTitle
} from '@/data/courseScheduleUtils';
import {
  CourseTemplate,
  getPublishedCourseTemplates
} from '@/data/courseTemplateUtils';
import {
  Teacher,
  getTeachers,
  addTeacher
} from '@/data/courseUtils';

const {
  FiCalendar, FiPlus, FiTrash2, FiEdit2, FiSearch,
  FiSave, FiX, FiEye, FiEyeOff, FiRefreshCw
} = FiIcons;

const CourseScheduleManagement = () => {
  const [schedules, setSchedules] = useState<CourseSchedule[]>([]);
  const [templates, setTemplates] = useState<CourseTemplate[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<CourseSchedule | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 表單狀態
  const [formData, setFormData] = useState<{
    templateId: string;
    templateTitle: string;
    seriesName: string;
    teacherId: string;
    teacherName: string;
    timeSlots: TimeSlot[];
    startDate: string;
    endDate: string;
    excludeDates: string[];
    generatedSessions: ScheduledSession[];
    status: 'draft' | 'published';
  }>({
    templateId: '',
    templateTitle: '',
    seriesName: '',
    teacherId: '',
    teacherName: '',
    timeSlots: [{
      id: `slot_${Date.now()}`,
      weekdays: [],
      startTime: '09:00',
      endTime: '10:30',
      teacherId: ''
    }],
    startDate: '',
    endDate: '',
    excludeDates: [],
    generatedSessions: [],
    status: 'draft'
  });

  // 新教師表單狀態
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    specialties: ''
  });

  // 載入數據
  useEffect(() => {
    const loadData = () => {
      const allSchedules = getCourseSchedules();
      const publishedTemplates = getPublishedCourseTemplates();
      const allTeachers = getTeachers();
      
      setSchedules(allSchedules);
      setTemplates(publishedTemplates);
      setTeachers(allTeachers);
    };
    
    loadData();

    // 監聽更新事件
    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('courseSchedulesUpdated', handleUpdate);
    return () => {
      window.removeEventListener('courseSchedulesUpdated', handleUpdate);
    };
  }, []);

  // 處理開啟模態框
  const handleOpenModal = (schedule?: CourseSchedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        templateId: schedule.templateId,
        templateTitle: schedule.templateTitle,
        seriesName: schedule.seriesName || '',
        teacherId: schedule.teacherId,
        teacherName: schedule.teacherName,
        timeSlots: schedule.timeSlots,
        startDate: schedule.startDate,
        endDate: schedule.endDate,
        excludeDates: schedule.excludeDates,
        generatedSessions: schedule.generatedSessions,
        status: schedule.status
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        templateId: '',
        templateTitle: '',
        seriesName: '',
        teacherId: '',
        teacherName: '',
        timeSlots: [{
          id: `slot_${Date.now()}`,
          weekdays: [],
          startTime: '09:00',
          endTime: '10:30',
          teacherId: ''
        }],
        startDate: '',
        endDate: '',
        excludeDates: [],
        generatedSessions: [],
        status: 'draft'
      });
    }
    setShowModal(true);
  };

  // 處理關閉模態框
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSchedule(null);
  };

  // 處理課程模板選擇
  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        templateId: templateId,
        templateTitle: template.title
      }));
      
      // 自動生成預覽
      generatePreview({
        ...formData,
        templateId: templateId,
        templateTitle: template.title
      }, template);
    }
  };

  // 處理教師選擇
  const handleTeacherSelect = (teacherId: string) => {
    if (teacherId) {
      const teacher = teachers.find(t => t.id === teacherId);
      if (teacher) {
        const updatedData = {
          ...formData,
          teacherId: teacherId,
          teacherName: teacher.name,
          timeSlots: formData.timeSlots.map(slot => ({
            ...slot,
            teacherId: teacherId
          }))
        };
        setFormData(updatedData);
        
        // 自動生成預覽
        setTimeout(() => generatePreview(updatedData), 100);
      }
    } else {
      // 清空教師選擇
      const updatedData = {
        ...formData,
        teacherId: '',
        teacherName: '',
        timeSlots: formData.timeSlots.map(slot => ({
          ...slot,
          teacherId: ''
        }))
      };
      setFormData(updatedData);
      
      // 自動生成預覽
      setTimeout(() => generatePreview(updatedData), 100);
    }
  };

  // 新增時間段
  const handleAddTimeSlot = () => {
    const newSlot: TimeSlot = {
      id: `slot_${Date.now()}`,
      weekdays: [],
      startTime: '09:00',
      endTime: '10:30',
      teacherId: formData.teacherId
    };
    
    setFormData(prev => ({
      ...prev,
      timeSlots: [...prev.timeSlots, newSlot]
    }));
  };

  // 移除時間段
  const handleRemoveTimeSlot = (slotIndex: number) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, index) => index !== slotIndex)
    }));
  };

  // 處理時間段變更
  const handleTimeSlotChange = (slotIndex: number, field: keyof TimeSlot, value: string | string[] | number[]) => {
    const newTimeSlots = [...formData.timeSlots];
    newTimeSlots[slotIndex] = {
      ...newTimeSlots[slotIndex],
      [field]: value
    };
    
    const updatedData = {
      ...formData,
      timeSlots: newTimeSlots
    };
    
    setFormData(updatedData);
    
    // 如果是星期變更，自動生成預覽
    if (field === 'weekdays') {
      setTimeout(() => generatePreview(updatedData), 100);
    }
  };

  // 處理星期切換
  const handleWeekdayToggle = (slotIndex: number, day: number) => {
    const slot = formData.timeSlots[slotIndex];
    const newWeekdays = slot.weekdays.includes(day)
      ? slot.weekdays.filter(d => d !== day)
      : [...slot.weekdays, day].sort();
    
    handleTimeSlotChange(slotIndex, 'weekdays', newWeekdays);
  };

  // 處理排除日期
  const handleExcludeDate = (date: string) => {
    const isExcluded = formData.excludeDates.includes(date);
    const updatedExcludeDates = isExcluded
      ? formData.excludeDates.filter(d => d !== date)
      : [...formData.excludeDates, date];
    
    const updatedData = {
      ...formData,
      excludeDates: updatedExcludeDates
    };
    
    setFormData(updatedData);
    
    // 自動生成預覽
    setTimeout(() => generatePreview(updatedData), 100);
  };

  // 生成預覽
  const generatePreview = (data = formData, template?: CourseTemplate) => {
    const selectedTemplate = template || templates.find(t => t.id === data.templateId);
    if (!selectedTemplate || !data.startDate || !data.timeSlots.length) {
      return;
    }

    const endDate = calculateEndDate(
      data.startDate,
      selectedTemplate.totalSessions,
      data.timeSlots,
      data.excludeDates
    );

    const sessions = generateScheduledSessions(
      selectedTemplate.id,
      selectedTemplate.title,
      selectedTemplate.totalSessions,
      selectedTemplate.sessions,
      data.timeSlots,
      data.startDate,
      data.excludeDates,
      data.teacherName || '待安排'
    );

    setFormData(prev => ({
      ...prev,
      endDate: endDate,
      generatedSessions: sessions
    }));
  };

  // 新增教師
  const handleAddTeacher = () => {
    if (!newTeacher.name || !newTeacher.email) {
      alert('請填寫教師姓名和電子郵件');
      return;
    }
    
    const teacherData = addTeacher({
      name: newTeacher.name,
      email: newTeacher.email,
      phone: '',
      bio: '',
      specialties: newTeacher.specialties ? newTeacher.specialties.split(',').map(s => s.trim()) : [],
      languages: [],
      experience: 0,
      rating: 5.0,
      is_active: true,
      certifications: [],
      education: [],
      teaching_philosophy: ''
    });
    
    setTeachers(prev => [...prev, teacherData]);
    setShowAddTeacherModal(false);
    setNewTeacher({ name: '', email: '', specialties: '' });
    
    alert('✅ 教師已成功新增！');
  };

  // 儲存課程排程
  const handleSaveSchedule = (status: 'draft' | 'published' = 'draft') => {
    if (!formData.templateId || !formData.startDate || !formData.timeSlots.length) {
      alert('請選擇課程、設定開始日期和時間段');
      return;
    }

    if (status === 'published' && formData.generatedSessions.length === 0) {
      alert('發布前請先生成課程預覽');
      return;
    }

    const scheduleData = {
      templateId: formData.templateId,
      templateTitle: formData.templateTitle,
      seriesName: formData.seriesName,
      teacherId: formData.teacherId,
      teacherName: formData.teacherName,
      timeSlots: formData.timeSlots,
      startDate: formData.startDate,
      endDate: formData.endDate,
      excludeDates: formData.excludeDates,
      generatedSessions: formData.generatedSessions,
      status
    };

    if (editingSchedule) {
      // 更新現有排程
      const updatedSchedule = updateCourseSchedule(editingSchedule.id, scheduleData);
      if (updatedSchedule) {
        setSchedules(prev => prev.map(s => s.id === editingSchedule.id ? updatedSchedule : s));
      }
    } else {
      // 創建新排程 - 不要在本地狀態更新，讓事件監聽器處理
      createCourseSchedule(scheduleData);
    }

    handleCloseModal();
    alert(`課程排程已${status === 'published' ? '發布' : '儲存為草稿'}`);
  };

  // 刪除排程
  const handleDeleteSchedule = (scheduleId: string) => {
    if (confirm('確定要刪除此課程排程嗎？此操作無法撤銷。')) {
      const success = deleteCourseSchedule(scheduleId);
      if (success) {
        // 不要在本地狀態更新，讓事件監聽器處理
        alert('課程排程已刪除');
      }
    }
  };

  // 切換發布狀態
  const handleToggleStatus = (scheduleId: string, currentStatus: 'draft' | 'published') => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    const updatedSchedule = updateCourseSchedule(scheduleId, { status: newStatus });
    if (updatedSchedule) {
      // 不要在本地狀態更新，讓事件監聽器處理
    }
  };

  // 過濾排程
  const getFilteredSchedules = (): CourseSchedule[] => {
    return schedules.filter(schedule => {
      // 狀態過濾
      if (filter !== 'all' && schedule.status !== filter) {
        return false;
      }
      
      // 搜尋過濾
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const fullTitle = getCourseScheduleFullTitle(schedule);
        return (
          fullTitle?.toLowerCase().includes(searchLower) ||
          schedule.templateTitle?.toLowerCase().includes(searchLower) ||
          schedule.seriesName?.toLowerCase().includes(searchLower) ||
          schedule.teacherName?.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  };

  // 格式化日期顯示星期
  const formatDateWithWeekday = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    const weekday = weekdays[date.getDay()];
    return `${dateStr} (${weekday})`;
  };

  // 獲取星期名稱
  const getWeekdayName = (day: number) => {
    const names = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    return names[day];
  };

  // 獲取狀態顏色
  const getStatusColor = (status: 'draft' | 'published') => {
    return status === 'published' 
      ? 'bg-green-100 text-green-800 border border-green-200' 
      : 'bg-yellow-100 text-yellow-800 border border-yellow-200';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">日曆排程</h2>
          <p className="text-gray-600 mt-1">為已發布的課程安排上課時間</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <SafeIcon icon={FiCalendar} />
          <span>新增排程</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-64">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋課程標題或教師..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">狀態：</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'draft' | 'published')}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
          >
            <option value="all">全部</option>
            <option value="draft">草稿</option>
            <option value="published">已發布</option>
          </select>
        </div>
      </div>

      {/* Schedules List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {getFilteredSchedules().map((schedule) => (
          <motion.div
            key={schedule.id}
            whileHover={{ scale: 1.02 }}
            className={`border-2 rounded-xl p-6 relative transition-all duration-300 ${
              schedule.status === 'published'
                ? 'border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 shadow-md hover:shadow-lg'
                : 'border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 opacity-75 hover:opacity-90'
            }`}
          >
            {/* Status Indicator */}
            <div className="absolute top-4 right-4">
              <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 ${getStatusColor(schedule.status)}`}>
                <div className={`w-2 h-2 rounded-full ${
                  schedule.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span>{schedule.status === 'published' ? '已發布' : '草稿'}</span>
              </div>
            </div>

            {/* Schedule Info */}
            <div className="mt-8">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className={`text-xl font-bold mb-0 ${
                  schedule.status === 'published' ? 'text-gray-900' : 'text-gray-600'
                }`}>
                  {getCourseScheduleFullTitle(schedule)}
                </h3>
                {schedule.status === 'draft' && (
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    預覽模式
                  </span>
                )}
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">教師：</span>
                  <span className="font-medium text-purple-600">{schedule.teacherName}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">開始日期：</span>
                  <span className="font-medium text-gray-700">{schedule.startDate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">結束日期：</span>
                  <span className="font-medium text-gray-700">{schedule.endDate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">總課堂：</span>
                  <span className="font-medium text-purple-600">{schedule.generatedSessions.length} 堂</span>
                </div>
              </div>

              {/* Time Slots */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">上課時間：</h4>
                <div className="space-y-1">
                  {schedule.timeSlots.map((slot, index) => (
                    <div key={index} className="bg-white rounded-lg p-2 text-xs border">
                      <div className="text-gray-800">
                        {slot.weekdays.map(d => getWeekdayName(d)).join('、')} 
                        {' '}
                        {slot.startTime}-{slot.endTime}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenModal(schedule)}
                    className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                    title="編輯"
                  >
                    <SafeIcon icon={FiEdit2} />
                  </button>
                  <button
                    onClick={() => handleDeleteSchedule(schedule.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="刪除"
                  >
                    <SafeIcon icon={FiTrash2} />
                  </button>
                </div>
                
                {/* Status Toggle Button */}
                <button
                  onClick={() => handleToggleStatus(schedule.id, schedule.status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                    schedule.status === 'published'
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-200'
                  }`}
                  title={schedule.status === 'published' ? '取消發布' : '發布排程'}
                >
                  <SafeIcon icon={schedule.status === 'published' ? FiEyeOff : FiEye} />
                  <span>{schedule.status === 'published' ? '取消發布' : '立即發布'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {getFilteredSchedules().length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiCalendar} className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">沒有找到課程排程</h3>
          <p className="text-gray-500 mb-4">請調整篩選條件或新增課程排程</p>
          <button
            onClick={() => handleOpenModal()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            新增第一個課程排程
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingSchedule ? '編輯課程排程' : '新增課程排程'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <SafeIcon icon={FiX} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Course Selection */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4">選擇課程</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        選擇已發布的課程 *
                      </label>
                      <select
                        value={formData.templateId}
                        onChange={(e) => handleTemplateSelect(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">請選擇課程</option>
                        {templates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.title} ({template.totalSessions} 堂)
                          </option>
                        ))}
                      </select>
                      {templates.length === 0 && (
                        <p className="text-sm text-red-500 mt-1">
                          請先在「課程模組」中發布課程
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        選擇教師
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={formData.teacherId}
                          onChange={(e) => handleTeacherSelect(e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">請選擇教師</option>
                          {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setShowAddTeacherModal(true)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <SafeIcon icon={FiPlus} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Series Name Field - Only show when a course is selected */}
                  {formData.templateId && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        系列名稱（選填）
                      </label>
                      <input
                        type="text"
                        value={formData.seriesName}
                        onChange={(e) => setFormData(prev => ({ ...prev, seriesName: e.target.value }))}
                        placeholder="例：B班、進階班、週末班"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        系列名稱會加在課程標題後面，最終顯示為「{formData.templateTitle}{formData.seriesName ? `-${formData.seriesName}` : ''}」
                      </p>
                    </div>
                  )}
                </div>

                {/* Time Settings */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-900">上課時間設置</h4>
                    <button
                      type="button"
                      onClick={handleAddTimeSlot}
                      className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                    >
                      <SafeIcon icon={FiPlus} className="inline mr-1 text-xs" />
                      新增時間段
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.timeSlots.map((slot, slotIndex) => (
                      <div key={slot.id} className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="flex justify-between items-center mb-4">
                          <h6 className="font-medium text-gray-900">時間段 {slotIndex + 1}</h6>
                          {formData.timeSlots.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTimeSlot(slotIndex)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <SafeIcon icon={FiTrash2} className="text-sm" />
                            </button>
                          )}
                        </div>

                        {/* Weekdays */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            上課星期 *
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                              const isSelected = slot.weekdays.includes(day);
                              return (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => handleWeekdayToggle(slotIndex, day)}
                                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isSelected
                                      ? 'bg-purple-600 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {getWeekdayName(day)}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Time Range */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              開始時間 *
                            </label>
                            <input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => handleTimeSlotChange(slotIndex, 'startTime', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              結束時間 *
                            </label>
                            <input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) => handleTimeSlotChange(slotIndex, 'endTime', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date Settings */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4">日期設定</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        開始日期 *
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, startDate: e.target.value }));
                          setTimeout(() => generatePreview(), 100);
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        結束日期（自動計算）
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        readOnly
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                      />
                    </div>
                  </div>

                  {/* Exclude Dates */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">排除日期</label>
                    <div className="flex flex-wrap gap-2 items-center">
                      <input
                        type="date"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value) {
                            handleExcludeDate(value);
                            // 清空輸入框
                            e.target.value = '';
                          }
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="選擇要排除的日期"
                      />
                      <div className="flex flex-wrap gap-2">
                        {formData.excludeDates.map((date) => (
                          <div
                            key={date}
                            className="flex items-center bg-red-100 px-2 py-1 rounded text-xs"
                          >
                            <span>{formatDateWithWeekday(date)}</span>
                            <button
                              type="button"
                              onClick={() => handleExcludeDate(date)}
                              className="ml-1 text-red-500 hover:text-red-700"
                            >
                              <SafeIcon icon={FiX} className="text-xs" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Generate Preview Button */}
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => generatePreview()}
                      className="w-full bg-green-100 text-green-700 py-2 px-4 rounded-lg hover:bg-green-200 transition-colors font-medium flex items-center justify-center space-x-2"
                    >
                      <SafeIcon icon={FiRefreshCw} />
                      <span>生成課程預覽</span>
                    </button>
                  </div>
                </div>

                {/* Preview */}
                {formData.generatedSessions.length > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-gray-900">
                        預約時間預覽
                        <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                          共 {formData.generatedSessions.length} 堂課
                        </span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => generatePreview()}
                        className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
                      >
                        <SafeIcon icon={FiRefreshCw} className="inline mr-1 text-xs" />
                        重新生成
                      </button>
                    </div>
                    
                    <div className="overflow-y-auto max-h-64">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">標題</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">時間</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">教師</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {formData.generatedSessions.map((session, index) => (
                            <tr key={session.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-3 py-2 text-sm text-gray-900">
                                {formatDateWithWeekday(session.date)}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900">{session.title}</td>
                              <td className="px-3 py-2 text-sm text-gray-900">
                                {session.startTime}-{session.endTime}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900">{session.teacherName}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => handleSaveSchedule('draft')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <SafeIcon icon={FiSave} />
                    <span>儲存草稿</span>
                  </button>
                  <button
                    onClick={() => handleSaveSchedule('published')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    <SafeIcon icon={FiSave} />
                    <span>{editingSchedule ? '更新並發布' : '儲存並發布'}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Teacher Modal */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">新增教師</h3>
                <button onClick={() => setShowAddTeacherModal(false)}>
                  <SafeIcon icon={FiX} className="text-white text-xl" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    教師姓名 *
                  </label>
                  <input
                    type="text"
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="請輸入教師姓名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電子郵件 *
                  </label>
                  <input
                    type="email"
                    value={newTeacher.email}
                    onChange={(e) => setNewTeacher(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="請輸入電子郵件"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    專業領域
                  </label>
                  <input
                    type="text"
                    value={newTeacher.specialties}
                    onChange={(e) => setNewTeacher(prev => ({ ...prev, specialties: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="例：商務華語、華語文法（用逗號分隔）"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleAddTeacher}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
                  >
                    新增教師
                  </button>
                  <button
                    onClick={() => setShowAddTeacherModal(false)}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseScheduleManagement;