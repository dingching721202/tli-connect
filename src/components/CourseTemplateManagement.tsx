'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import { useRouter } from 'next/navigation';
import {
  CourseTemplate,
  TemplateSession,
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
  const [formData, setFormData] = useState<Partial<CourseTemplate> & { sessions: TemplateSession[] }>({
    title: '',
    description: '',
    category: '中文',
    level: '不限',
    totalSessions: 1,
    capacity: 20, // 預設滿班人數
    globalSettings: {
      defaultTitle: '',
      defaultVirtualClassroomLink: '',
      defaultMaterialLink: ''
    },
    sessions: [{
      sessionNumber: 1,
      title: '',
      virtualClassroomLink: '',
      materialLink: ''
    }],
    status: 'draft'
  });

  // 載入課程模板
  useEffect(() => {
    const loadTemplates = () => {
      const allTemplates = getCourseTemplates();
      setTemplates(allTemplates);
      console.log('📚 課程模板已載入:', allTemplates.length, '個模板');
    };
    
    loadTemplates();

    // 監聽課程模板更新事件
    const handleTemplatesUpdated = () => {
      console.log('🔄 檢測到課程模板更新，重新載入...');
      loadTemplates();
    };

    // 監聽localStorage變化（用於跨頁面同步）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'courseModules' || e.key === 'courseTemplateData') {
        console.log('🔄 檢測到localStorage變化，重新載入模板...');
        loadTemplates();
      }
    };

    window.addEventListener('courseTemplatesUpdated', handleTemplatesUpdated);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('courseTemplatesUpdated', handleTemplatesUpdated);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 處理開啟模態框
  const handleOpenModal = (template?: CourseTemplate) => {
    if (template) {
      setEditingTemplate(template);
      
      // 根據課程的總堂數生成對應數量的課程內容
      const totalSessions = template.totalSessions || template.total_sessions || 1;
      const generatedSessions = Array.from({ length: totalSessions }, (_, index) => {
        // 如果原本有課程內容就使用，否則創建新的
        const existingSession = template.sessions?.[index];
        return {
          sessionNumber: existingSession?.sessionNumber || index + 1,
          // 編輯時保持原始值，不自動填充統一設定
          title: existingSession?.title || '',
          virtualClassroomLink: existingSession?.virtualClassroomLink || '',
          materialLink: existingSession?.materialLink || ''
        };
      });
      
      setFormData({ 
        ...template,
        title: template.title || '',
        description: template.description || '',
        category: template.category || '中文',
        level: template.level || '不限',
        capacity: template.capacity || 20,
        status: template.status || 'draft',
        totalSessions: totalSessions,
        sessions: generatedSessions,
        globalSettings: {
          defaultTitle: template.globalSettings?.defaultTitle || '',
          defaultVirtualClassroomLink: template.globalSettings?.defaultVirtualClassroomLink || '',
          defaultMaterialLink: template.globalSettings?.defaultMaterialLink || ''
        }
      });
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
          defaultVirtualClassroomLink: '',
          defaultMaterialLink: ''
        },
        sessions: [{
          sessionNumber: 1,
          title: '',
          virtualClassroomLink: '',
          materialLink: ''
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
        defaultVirtualClassroomLink: '',
        defaultMaterialLink: ''
      },
      sessions: [{
        sessionNumber: 1,
        title: '',
        virtualClassroomLink: '',
        materialLink: ''
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
          virtualClassroomLink: '',
          materialLink: ''
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
  const handleSessionChange = (sessionIndex: number, field: keyof TemplateSession, value: string) => {
    const newSessions = [...(formData.sessions || [])];
    newSessions[sessionIndex] = {
      ...newSessions[sessionIndex],
      [field]: value
    };
    
    setFormData(prev => ({ ...prev, sessions: newSessions }));
  };

  // 檢查個別欄位是否使用統一設定
  const isUsingGlobalSetting = (sessionIndex: number, field: keyof TemplateSession) => {
    const session = formData.sessions?.[sessionIndex];
    if (!session) return false;

    const fieldMapping = {
      title: 'defaultTitle',
      virtualClassroomLink: 'defaultVirtualClassroomLink', 
      materialLink: 'defaultMaterialLink'
    } as const;

    const globalField = fieldMapping[field];
    if (!globalField) return false;

    const sessionValue = session[field];
    const globalValue = formData.globalSettings?.[globalField];

    // 如果個別欄位為空或與統一設定相同，且統一設定有值，則認為使用統一設定
    return !sessionValue && globalValue;
  };


  // 獲取實際顯示的值（考慮統一設定的回退）
  const getEffectiveValue = (sessionIndex: number, field: keyof TemplateSession) => {
    const session = formData.sessions?.[sessionIndex];
    if (!session) return '';

    const sessionValue = session[field];
    if (sessionValue) return sessionValue;

    // 如果個別設定為空，使用統一設定
    const fieldMapping = {
      title: 'defaultTitle',
      virtualClassroomLink: 'defaultVirtualClassroomLink',
      materialLink: 'defaultMaterialLink'
    } as const;

    const globalField = fieldMapping[field];
    return globalField ? (formData.globalSettings?.[globalField] || '') : '';
  };

  // 清空所有課程內容設置
  const clearAllSessions = () => {
    if (!formData.sessions) return;

    const updatedSessions = formData.sessions.map(session => ({
      ...session,
      title: '',
      virtualClassroomLink: '',
      materialLink: ''
    }));

    setFormData(prev => ({ ...prev, sessions: updatedSessions }));
  };

  // 獲取欄位的placeholder文字
  const getFieldPlaceholder = (field: keyof TemplateSession) => {
    const fieldMapping = {
      title: 'defaultTitle',
      virtualClassroomLink: 'defaultVirtualClassroomLink',
      materialLink: 'defaultMaterialLink'
    } as const;

    const fieldNames = {
      title: '單元名稱',
      virtualClassroomLink: '教室連結',
      materialLink: '教材連結'
    } as const;

    const globalField = fieldMapping[field];
    const globalValue = globalField ? formData.globalSettings?.[globalField] : '';
    
    if (globalValue) {
      return globalValue;
    }

    return fieldNames[field] || '請輸入';
  };

  // 儲存課程模板
  const handleSaveTemplate = (status: 'draft' | 'published' = 'draft') => {
    if (!formData.title?.trim()) {
      alert('請填寫課程名稱');
      return;
    }

    if (status === 'published' && (formData.totalSessions ?? 0) < 1) {
      alert('發布課程需要至少一堂課程');
      return;
    }

    console.log('🔍 儲存前的表單資料:', {
      category: formData.category,
      level: formData.level,
      capacity: formData.capacity
    });

    const moduleData = {
      title: formData.title || '',
      description: formData.description || '',
      cover_image_url: '/images/courses/default.jpg',
      language: 'chinese' as const,
      level: (formData.level === '初級' ? 'beginner' : 
              formData.level === '中級' ? 'intermediate' : 
              formData.level === '中高級' ? 'intermediate' :
              formData.level === '高級' ? 'advanced' : 'beginner') as 'beginner' | 'intermediate' | 'advanced',
      categories: [formData.category || '中文'],
      tags: [],
      total_sessions: formData.totalSessions || 1,
      session_duration_minutes: 120,
      materials: [],
      prerequisites: ['無'],
      learning_objectives: [],
      refund_policy: '開課前7天可全額退費',
      is_active: true,
      status
    };

    console.log('💾 準備儲存的模組資料:', {
      level: moduleData.level,
      categories: moduleData.categories
    });

    // 準備模板額外資料（統一設定與課程內容設置）
    // 處理空白欄位，使其使用統一設定的值
    const processedSessions = (formData.sessions || []).map(session => ({
      ...session,
      title: session.title || formData.globalSettings?.defaultTitle || '',
      virtualClassroomLink: session.virtualClassroomLink || formData.globalSettings?.defaultVirtualClassroomLink || '',
      materialLink: session.materialLink || formData.globalSettings?.defaultMaterialLink || ''
    }));

    const templateData = {
      sessions: processedSessions,
      globalSettings: formData.globalSettings || {
        defaultTitle: '',
        defaultVirtualClassroomLink: '',
        defaultMaterialLink: ''
      },
      capacity: formData.capacity || 20, // 儲存滿班人數
      uiLevel: formData.level || '不限' // 儲存原始的中文級別
    };

    console.log('📋 準備儲存的模板額外資料:', {
      capacity: templateData.capacity
    });

    if (editingTemplate) {
      // 更新現有模板
      const updatedTemplate = updateCourseTemplate(editingTemplate.id, moduleData, templateData);
      if (updatedTemplate) {
        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? updatedTemplate : t));
        
        // 如果是發布狀態，同步到預約系統
        if (status === 'published') {
          syncTemplateToBookingSystem(updatedTemplate);
        }
        
        console.log('✅ 課程模板已更新，包含統一設定與課程內容設置');
        console.log('📊 儲存的課程內容:', processedSessions);
        console.log('📊 統一設定:', templateData.globalSettings);
      }
    } else {
      // 創建新模板
      const newTemplate = createCourseTemplate(moduleData, templateData);
      setTemplates(prev => [...prev, newTemplate]);
      
      // 如果是發布狀態，同步到預約系統
      if (status === 'published') {
        syncTemplateToBookingSystem(newTemplate);
      }
      
      console.log('✅ 新課程模板已創建，包含統一設定與課程內容設置');
      console.log('📊 儲存的課程內容:', processedSessions);
      console.log('📊 統一設定:', templateData.globalSettings);
    }

    // 觸發更新事件，通知其他組件重新載入
    window.dispatchEvent(new CustomEvent('courseTemplatesUpdated'));

    handleCloseModal();
    alert(`課程模板已${status === 'published' ? '發布並同步至預約系統' : '儲存為草稿'}`);
  };

  // 刪除課程模板
  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('確定要刪除此課程模板嗎？此操作無法撤銷，並會刪除所有相關的課程排程和節次，同時從預約系統中移除對應課程。')) {
      const success = deleteCourseTemplate(parseInt(templateId));
      if (success) {
        setTemplates(prev => prev.filter(t => t.id !== templateId));
        // 從預約系統中移除對應課程
        removeCourseFromBookingSystem(parseInt(templateId));
        
        // 觸發更新事件
        window.dispatchEvent(new CustomEvent('courseTemplatesUpdated'));
        
        alert('課程模板已刪除，包括所有相關的課程排程和節次，並已從預約系統中移除');
      } else {
        alert('刪除課程模板時發生錯誤，請稍後再試。');
      }
    }
  };

  // 複製課程模板
  const handleDuplicateTemplate = (template: CourseTemplate) => {
    const duplicatedTemplate = duplicateCourseTemplate(template.id);
    if (duplicatedTemplate) {
      setTemplates(prev => [...prev, duplicatedTemplate]);
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
      setTemplates(prev => prev.map(t => t.id === templateId ? updatedTemplate : t));
      
      // 同步狀態變更到預約系統
      if (newStatus === 'published') {
        syncTemplateToBookingSystem(updatedTemplate);
      } else {
        // 取消發布時，從預約系統中移除
        removeCourseFromBookingSystem(templateId);
      }

      // 觸發更新事件
      window.dispatchEvent(new CustomEvent('courseTemplatesUpdated'));
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
                  {(template.sessions || []).slice(0, 3).map((session, index) => (
                    <div key={`${template.id}-session-${index}`} className="flex items-center space-x-2 text-xs text-gray-600">
                      <span className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {session.sessionNumber}
                      </span>
                      <span className="truncate">{session.title}</span>
                      {session.virtualClassroomLink && (
                        <SafeIcon icon={FiLink} className="text-green-500" />
                      )}
                      {session.materialLink && (
                        <SafeIcon icon={FiFileText} className="text-purple-500" />
                      )}
                    </div>
                  ))}
                  {(template.sessions || []).length > 3 && (
                    <div className="text-xs text-gray-500">
                      還有 {(template.sessions || []).length - 3} 堂課程...
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
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">統一設定</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        設定課程的預設資訊
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={clearAllSessions}
                      className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors"
                      title="清空所有課程內容設置"
                    >
                      清除
                    </button>
                  </div>
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
                        value={formData.globalSettings?.defaultVirtualClassroomLink || ''}
                        onChange={(e) => handleGlobalSettingChange('defaultVirtualClassroomLink', e.target.value)}
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
                        value={formData.globalSettings?.defaultMaterialLink || ''}
                        onChange={(e) => handleGlobalSettingChange('defaultMaterialLink', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="教材連結"
                      />
                    </div>
                  </div>
                </div>

                {/* Course Content */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-900">課程內容設置</h4>
                    <div className="text-xs text-gray-600">
                      💡 空白欄位將使用統一設定
                    </div>
                  </div>
                  <div className="space-y-4">
                    {(formData.sessions || []).map((session, index) => (
                      <div key={`form-session-${index}`} className="bg-white rounded-lg p-4 border border-green-200">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-medium text-gray-900">第 {session.sessionNumber} 堂課</h5>
                        </div>
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
                              placeholder={getFieldPlaceholder('title')}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              教室連結
                            </label>
                            <input
                              type="url"
                              value={session.virtualClassroomLink || ''}
                              onChange={(e) => handleSessionChange(index, 'virtualClassroomLink', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder={getFieldPlaceholder('virtualClassroomLink')}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              教材連結
                            </label>
                            <input
                              type="text"
                              value={session.materialLink || ''}
                              onChange={(e) => handleSessionChange(index, 'materialLink', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder={getFieldPlaceholder('materialLink')}
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