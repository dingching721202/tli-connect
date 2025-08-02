'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import { useRouter } from 'next/navigation';
import {
  CourseTemplate,
  CourseSession,
  getCourseTemplates,
  createCourseTemplate,
  updateCourseTemplate,
  deleteCourseTemplate,
  duplicateCourseTemplate,
  syncTemplateToBookingSystem,
  removeCourseFromBookingSystem
} from '@/data/courseTemplateUtils';

const {
  FiBook, FiEdit2, FiTrash2, FiPlus, FiSearch, FiSave, FiX, FiCopy,
  FiEye, FiEyeOff, FiLink, FiFileText, FiCalendar
} = FiIcons;

const CourseTemplateManagement = () => {
  const router = useRouter();
  const [templates, setTemplates] = useState<CourseTemplate[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CourseTemplate | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 表單狀態
  const [formData, setFormData] = useState<Partial<CourseTemplate> & { sessions: CourseSession[] }>({
    title: '',
    description: '',
    category: '中文',
    level: '不限',
    totalSessions: 1,
    capacity: 20, // 預設滿班人數
    globalSettings: {
      defaultTitle: '',
      default_classroom_link: '',
      default_material_link: ''
    },
    sessions: [{
      sessionNumber: 1,
      title: '',
      classroom_link: '',
      material_link: ''
    }],
    status: 'draft'
  });

  // 載入課程模板
  useEffect(() => {
    const loadTemplates = () => {
      const allTemplates = getCourseTemplates();
      setTemplates(allTemplates);
    };
    
    loadTemplates();
    
    // 監聽課程模板更新事件
    const handleTemplatesUpdated = () => {
      console.log('收到課程模板更新事件，重新載入模板');
      loadTemplates();
    };
    
    window.addEventListener('courseTemplatesUpdated', handleTemplatesUpdated);
    
    return () => {
      window.removeEventListener('courseTemplatesUpdated', handleTemplatesUpdated);
    };
  }, []);

  // 處理開啟模態框
  const handleOpenModal = (template?: CourseTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({ ...template });
    } else {
      setEditingTemplate(null);
      setFormData({
        title: '',
        description: '',
        category: '中文',
        level: '不限',
        totalSessions: 1,
        capacity: 20,
        globalSettings: {
          defaultTitle: '',
          default_classroom_link: '',
          default_material_link: ''
        },
        sessions: [{
          sessionNumber: 1,
          title: '',
          classroom_link: '',
          material_link: ''
        }],
        status: 'draft'
      });
    }
    setShowModal(true);
  };

  // 處理關閉模態框
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
    setFormData({
      title: '',
      description: '',
      category: '中文',
      level: '不限',
      totalSessions: 1,
      capacity: 20,
      globalSettings: {
        defaultTitle: '',
        default_classroom_link: '',
        default_material_link: ''
      },
      sessions: [{
        sessionNumber: 1,
        title: '',
        classroom_link: '',
        material_link: ''
      }],
      status: 'draft'
    });
  };

  // 處理總堂數變化
  const handleTotalSessionsChange = (total: number) => {
    const newSessions = Array.from({ length: total }, (_, index) => {
      const existingSession = formData.sessions?.[index];
      if (existingSession) {
        return existingSession;
      } else {
        // 新增的課程預設為空，會自動使用統一設定
        return {
          sessionNumber: index + 1,
          title: '',
          classroom_link: '',
          material_link: ''
        };
      }
    });
    
    setFormData(prev => ({
      ...prev,
      totalSessions: total,
      sessions: newSessions
    }));
  };

  // 處理統一設定變更
  const handleGlobalSettingChange = (field: keyof NonNullable<CourseTemplate['globalSettings']>, value: string) => {
    setFormData(prev => ({
      ...prev,
      globalSettings: {
        ...prev.globalSettings,
        [field]: value
      }
    }));
  };




  // 處理課程內容變化
  const handleSessionChange = (sessionIndex: number, field: keyof CourseSession, value: string) => {
    const newSessions = [...(formData.sessions || [])];
    newSessions[sessionIndex] = {
      ...newSessions[sessionIndex],
      [field]: value
    };
    
    setFormData(prev => ({ ...prev, sessions: newSessions }));
  };

  // 儲存課程模板
  const handleSaveTemplate = (status: 'draft' | 'published' = 'draft') => {
    if (!formData.title?.trim()) {
      alert('請填寫課程名稱');
      return;
    }

    if (status === 'published' && (!formData.description?.trim() || (formData.totalSessions ?? 0) < 1)) {
      alert('發布課程需要填寫描述和至少一堂課程');
      return;
    }

    const templateData = {
      title: formData.title,
      description: formData.description || '',
      category: formData.category || '中文',
      level: formData.level || '不限',
      totalSessions: formData.totalSessions || 1,
      capacity: formData.capacity || 20,
      globalSettings: formData.globalSettings,
      sessions: formData.sessions || [],
      status
    };

    if (editingTemplate) {
      // 更新現有模板
      const updatedTemplate = updateCourseTemplate(editingTemplate.id, templateData);
      if (updatedTemplate) {
        // 不需要手動更新 state，因為會監聽事件自動更新
        // setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? updatedTemplate : t));
        
        // 如果是發布狀態，同步到預約系統
        if (status === 'published') {
          syncTemplateToBookingSystem(updatedTemplate);
        }
        
        // 檢查是否有重要變更需要同步提示
        const hasSignificantChanges = 
          editingTemplate.title !== templateData.title ||
          editingTemplate.totalSessions !== templateData.totalSessions ||
          JSON.stringify(editingTemplate.sessions) !== JSON.stringify(templateData.sessions) ||
          editingTemplate.capacity !== templateData.capacity;
        
        if (hasSignificantChanges) {
          alert(`課程模板已${status === 'published' ? '發布' : '更新'}！\n\n⚡ 系統正在自動同步相關的課程排程，請稍候查看課程排程頁面確認變更。`);
        } else {
          alert(`課程模板已${status === 'published' ? '發布' : '更新'}！`);
        }
      }
    } else {
      // 創建新模板
      const newTemplate = createCourseTemplate(templateData);
      // 不需要手動更新 state，因為會監聽事件自動更新
      // setTemplates(prev => [...prev, newTemplate]);
      
      // 如果是發布狀態，同步到預約系統
      if (status === 'published') {
        syncTemplateToBookingSystem(newTemplate);
      }
      
      alert(`課程模板已${status === 'published' ? '發布並同步至預約系統' : '儲存為草稿'}`);
    }

    handleCloseModal();
  };

  // 刪除課程模板
  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('確定要刪除此課程模板嗎？此操作無法撤銷，並會從預約系統中移除對應課程。')) {
      const success = deleteCourseTemplate(templateId);
      if (success) {
        // 不需要手動更新 state，因為會監聽事件自動更新
        // setTemplates(prev => prev.filter(t => t.id !== templateId));
        // 從預約系統中移除對應課程
        removeCourseFromBookingSystem(templateId);
        alert('課程模板已刪除，並已從預約系統中移除');
      }
    }
  };

  // 複製課程模板
  const handleDuplicateTemplate = (template: CourseTemplate) => {
    const duplicatedTemplate = duplicateCourseTemplate(template.id);
    if (duplicatedTemplate) {
      // 不需要手動更新 state，因為會監聽事件自動更新
      // setTemplates(prev => [...prev, duplicatedTemplate]);
      alert('課程模板已複製');
    }
  };

  // 跳轉到課程日曆頁面
  const handleViewCourseCalendar = (template: CourseTemplate) => {
    if (template.status !== 'published') {
      alert('請先發布課程模板才能查看課程日曆');
      return;
    }
    // 跳轉到主頁面的預約系統，並帶上課程ID參數和錨點
    router.push(`/?courseFilter=${encodeURIComponent(template.id)}#booking`);
  };

  // 切換發布狀態
  const handleToggleStatus = (templateId: string, currentStatus: 'draft' | 'published') => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    const updatedTemplate = updateCourseTemplate(templateId, { status: newStatus });
    if (updatedTemplate) {
      // 不需要手動更新 state，因為會監聽事件自動更新
      // setTemplates(prev => prev.map(t => t.id === templateId ? updatedTemplate : t));
      
      // 同步狀態變更到預約系統
      if (newStatus === 'published') {
        syncTemplateToBookingSystem(updatedTemplate);
      } else {
        // 取消發布時，從預約系統中移除
        removeCourseFromBookingSystem(templateId);
      }
    }
  };

  // 過濾課程模板
  const getFilteredTemplates = (): CourseTemplate[] => {
    return templates.filter(template => {
      // 狀態過濾
      if (filter !== 'all' && template.status !== filter) {
        return false;
      }
      
      // 搜尋過濾
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          template.title?.toLowerCase().includes(searchLower) ||
          template.description?.toLowerCase().includes(searchLower) ||
          template.category?.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
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
          <h2 className="text-2xl font-bold text-gray-900">課程模組</h2>
          <p className="text-gray-600 mt-1">管理課程模板，建立課程架構</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <SafeIcon icon={FiPlus} />
          <span>新增課程</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-64">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋單元名稱、描述或分類..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* Templates List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {getFilteredTemplates().map((template) => (
          <motion.div
            key={template.id}
            whileHover={{ scale: 1.02 }}
            className={`border-2 rounded-xl p-6 relative transition-all duration-300 ${
              template.status === 'published'
                ? 'border-green-300 bg-gradient-to-br from-green-50 to-green-100 shadow-md hover:shadow-lg'
                : 'border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 opacity-75 hover:opacity-90'
            }`}
          >
            {/* Status Indicator */}
            <div className="absolute top-4 right-4">
              <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 ${getStatusColor(template.status)}`}>
                <div className={`w-2 h-2 rounded-full ${
                  template.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span>{template.status === 'published' ? '已發布' : '草稿'}</span>
              </div>
            </div>

            {/* Template Info */}
            <div className="mt-8">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className={`text-xl font-bold mb-0 ${
                  template.status === 'published' ? 'text-gray-900' : 'text-gray-600'
                }`}>
                  {template.title}
                </h3>
                {template.status === 'draft' && (
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    預覽模式
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{template.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">分類：</span>
                  <span className="font-medium text-blue-600">{template.category}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">級別：</span>
                  <span className="font-medium text-blue-600">{template.level}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">總堂數：</span>
                  <span className="font-medium text-blue-600">{template.totalSessions} 堂</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">滿班人數：</span>
                  <span className="font-medium text-blue-600">{template.capacity || 20} 人</span>
                </div>
              </div>

              {/* Course Sessions Preview */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">課程內容：</h4>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {template.sessions.slice(0, 3).map((session, index) => (
                    <div key={`${template.id}-session-${index}`} className="flex items-center space-x-2 text-xs text-gray-600">
                      <span className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {session.sessionNumber}
                      </span>
                      <span className="truncate">{session.title}</span>
                      {session.classroom_link && (
                        <SafeIcon icon={FiLink} className="text-green-500" />
                      )}
                      {session.material_link && (
                        <SafeIcon icon={FiFileText} className="text-purple-500" />
                      )}
                    </div>
                  ))}
                  {template.sessions.length > 3 && (
                    <div className="text-xs text-gray-500">
                      還有 {template.sessions.length - 3} 堂課程...
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenModal(template)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="編輯"
                    >
                      <SafeIcon icon={FiEdit2} />
                    </button>
                    <button
                      onClick={() => handleDuplicateTemplate(template)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      title="複製"
                    >
                      <SafeIcon icon={FiCopy} />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="刪除"
                    >
                      <SafeIcon icon={FiTrash2} />
                    </button>
                    {/* Course Calendar Button - 小尺寸並放在左側 */}
                    {template.status === 'published' && (
                      <button
                        onClick={() => handleViewCourseCalendar(template)}
                        className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                        title="課程日曆"
                      >
                        <SafeIcon icon={FiCalendar} />
                      </button>
                    )}
                  </div>
                  
                  {/* Status Toggle Button */}
                  <button
                    onClick={() => handleToggleStatus(template.id, template.status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                      template.status === 'published'
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-200'
                    }`}
                    title={template.status === 'published' ? '取消發布' : '發布課程'}
                  >
                    <SafeIcon icon={template.status === 'published' ? FiEyeOff : FiEye} />
                    <span>{template.status === 'published' ? '取消發布' : '立即發布'}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {getFilteredTemplates().length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiBook} className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">沒有找到課程模板</h3>
          <p className="text-gray-500 mb-4">請調整篩選條件或新增課程模板</p>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            新增第一個課程模板
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingTemplate ? '編輯課程模板' : '新增課程模板'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <SafeIcon icon={FiX} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4">課程基本資料</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        課程名稱 *
                      </label>
                      <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="例：基礎華語會話"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        課程描述
                      </label>
                      <textarea
                        rows={3}
                        value={formData.description || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="簡要描述課程內容和目標..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        課程分類
                      </label>
                      <select
                        value={formData.category || '中文'}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as CourseTemplate['category'] }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="中文">中文</option>
                        <option value="英文">英文</option>
                        <option value="文化">文化</option>
                        <option value="商業">商業</option>
                        <option value="師資">師資</option>
                        <option value="其它">其它</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        課程級別
                      </label>
                      <select
                        value={formData.level || '不限'}
                        onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as CourseTemplate['level'] }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="不限">不限</option>
                        <option value="初級">初級</option>
                        <option value="中級">中級</option>
                        <option value="中高級">中高級</option>
                        <option value="高級">高級</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        課程堂數 *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.totalSessions || 1}
                        onChange={(e) => handleTotalSessionsChange(parseInt(e.target.value) || 1)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        滿班人數 *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.capacity || 20}
                        onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 20 }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="20"
                      />
                    </div>
                  </div>
                </div>

                {/* Global Settings */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900">統一設定</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    設定整個課程的統一資訊。
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          單元名稱
                        </label>
                      </div>
                      <input
                        type="text"
                        value={formData.globalSettings?.defaultTitle || ''}
                        onChange={(e) => handleGlobalSettingChange('defaultTitle', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="單元名稱"
                      />
                    </div>
                    <div>
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          教室連結
                        </label>
                      </div>
                      <input
                        type="url"
                        value={formData.globalSettings?.default_classroom_link || ''}
                        onChange={(e) => handleGlobalSettingChange('default_classroom_link', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="教室連結"
                      />
                    </div>
                    <div>
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          教材連結
                        </label>
                      </div>
                      <input
                        type="text"
                        value={formData.globalSettings?.default_material_link || ''}
                        onChange={(e) => handleGlobalSettingChange('default_material_link', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="教材連結"
                      />
                    </div>
                  </div>
                </div>

                {/* Course Content */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4">課程內容設置</h4>
                  <div className="space-y-4">
                    {(formData.sessions || []).map((session, index) => (
                      <div key={`form-session-${index}`} className="bg-white rounded-lg p-4 border border-green-200">
                        <h5 className="font-medium text-gray-900 mb-3">Lesson {session.sessionNumber}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              單元名稱
                            </label>
                            <input
                              type="text"
                              value={session.title || ''}
                              onChange={(e) => handleSessionChange(index, 'title', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="單元名稱"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              教室連結
                            </label>
                            <input
                              type="url"
                              value={session.classroom_link || ''}
                              onChange={(e) => handleSessionChange(index, 'classroom_link', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="教室連結"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              教材連結
                            </label>
                            <input
                              type="text"
                              value={session.material_link || ''}
                              onChange={(e) => handleSessionChange(index, 'material_link', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="教材連結"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => handleSaveTemplate('draft')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <SafeIcon icon={FiSave} />
                    <span>儲存草稿</span>
                  </button>
                  <button
                    onClick={() => handleSaveTemplate('published')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <SafeIcon icon={FiSave} />
                    <span>{editingTemplate ? '更新並發布' : '儲存並發布'}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CourseTemplateManagement;