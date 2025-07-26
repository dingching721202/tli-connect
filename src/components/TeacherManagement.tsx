'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import { useAuth } from '@/contexts/AuthContext';
import { teacherDataService, Teacher } from '@/data/teacherData';

const {
  FiUsers, FiUserPlus, FiEdit2, FiTrash2, FiSearch, FiDownload, FiX, FiEye,
  FiMail, FiPhone, FiMapPin, FiCalendar, FiBook, FiAward, FiStar,
  FiCheckCircle, FiXCircle, FiClock, FiUser
} = FiIcons;

// Teacher interface is now imported from teacherData service

interface NewTeacher {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  
  teachingCategory: string[];
  expertise: string[];
  experience: string;
  qualification: string[];
  bio: string;
  languages: Array<{language: string; level: string}>;
}

// Dropdown options
const LANGUAGE_OPTIONS = [
  '中文', '英文', '日文', '韓文', '法文', '德文', '西班牙文', '義大利文', '俄文', '阿拉伯文', '泰文', '越南文', '印尼文', '馬來文'
];

const LANGUAGE_LEVELS = [
  '母語', '精通', '流利', '中等', '初級'
];

const EXPERTISE_OPTIONS = [
  '商務華語', '生活華語', '日常會話', 'HSK準備', 'TOCFL準備', '兒童華語', '青少年華語', 
  '成人華語', '企業培訓', '一對一教學', '小班教學', '線上教學', '考試輔導', '文化交流',
  '正音訓練', '寫作指導', '閱讀理解', '聽力訓練'
];

const QUALIFICATION_OPTIONS = [
  'TOCFL認證', '華語教學能力證書', 'HSK考官證書', 'TESOL認證', 'TEFL認證',
  '教師資格證', '中文系學位', '應用語言學學位', '教育學學位', '對外漢語教學證書',
  '普通話水平測試', '國際漢語教師證書', '孔子學院教師證書'
];

const EXPERIENCE_OPTIONS = [
  '1年以下', '1-2年', '3-5年', '6-10年', '11-15年', '16-20年', '20年以上'
];

const TEACHING_CATEGORY_OPTIONS = [
  '中文', '外文', '文化', '商業', '師培'
];

const TeacherManagement: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // New teacher form state
  const [newTeacher, setNewTeacher] = useState<NewTeacher>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    teachingCategory: [],
    expertise: [],
    experience: '',
    qualification: [],
    bio: '',
    languages: []
  });

  // Teacher data state
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Load teacher data on component mount
  useEffect(() => {
    loadTeachers();
    
    // Listen for teacher updates
    const handleTeachersUpdated = () => {
      loadTeachers();
    };
    
    window.addEventListener('teachersUpdated', handleTeachersUpdated);
    
    return () => {
      window.removeEventListener('teachersUpdated', handleTeachersUpdated);
    };
  }, []);

  const loadTeachers = () => {
    setTeachers(teacherDataService.getAllTeachers());
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    if (statusFilter === 'all') return true;
    return teacher.status === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '在職';
      case 'inactive': return '離職';
      case 'suspended': return '停職';
      default: return '未知';
    }
  };

  const getContractTypeText = (type: string) => {
    switch (type) {
      case 'full-time': return '全職';
      case 'part-time': return '兼職';
      case 'freelance': return '自由工作者';
      default: return '未知';
    }
  };

  const handleAddTeacher = () => {
    // Validate form
    const errors: string[] = [];
    if (!newTeacher.name.trim()) errors.push('姓名');
    if (!newTeacher.email.trim()) errors.push('電子郵件');
    if (!newTeacher.phone.trim()) errors.push('電話');
    if (!newTeacher.password.trim()) errors.push('密碼');
    if (newTeacher.password !== newTeacher.confirmPassword) errors.push('密碼確認不符');

    if (errors.length > 0) {
      alert(`請填寫必填欄位：${errors.join(', ')}`);
      return;
    }

    // Check if email exists
    if (teacherDataService.getTeacherByEmail(newTeacher.email)) {
      alert('此電子郵件已被使用');
      return;
    }

    // Create new teacher using service
    teacherDataService.addTeacher({
      name: newTeacher.name,
      email: newTeacher.email,
      phone: newTeacher.phone,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      teachingCategory: newTeacher.teachingCategory.filter(cat => cat.trim() !== ''),
      expertise: newTeacher.expertise.filter(exp => exp.trim() !== ''),
      experience: newTeacher.experience,
      qualification: newTeacher.qualification,
      bio: newTeacher.bio,
      languages: newTeacher.languages.map(lang => `${lang.language}(${lang.level})`),
      salary: 0,
      contractType: 'part-time'
    });

    // Reload teachers data
    loadTeachers();
    
    // Reset form
    setNewTeacher({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      teachingCategory: [],
      expertise: [],
      experience: '',
      qualification: [],
      bio: '',
      languages: []
    });
    
    setShowAddModal(false);
    alert('教師新增成功！');
  };

  const handleDeleteTeacher = (teacherId: number) => {
    const teacher = teacherDataService.getTeacherById(teacherId);
    if (!teacher) return;

    if (confirm(`確定要刪除教師「${teacher.name}」嗎？此操作無法復原。`)) {
      if (teacherDataService.deleteTeacher(teacherId)) {
        loadTeachers();
        alert('教師已刪除');
      } else {
        alert('刪除教師失敗');
      }
    }
  };

  const handleEditTeacher = () => {
    if (!selectedTeacher) return;
    setEditingTeacher({ ...selectedTeacher });
    setIsEditing(true);
  };

  const handleSaveTeacher = () => {
    if (!editingTeacher) return;

    const updated = teacherDataService.updateTeacher(editingTeacher.id, editingTeacher);
    if (updated) {
      setSelectedTeacher(updated);
      setIsEditing(false);
      loadTeachers();
      alert('教師資料已更新');
    } else {
      alert('更新失敗');
    }
  };

  const handleCancelEdit = () => {
    setEditingTeacher(null);
    setIsEditing(false);
  };

  const handleExportCSV = () => {
    const headers = [
      '姓名', '電子郵件', '電話', '教授類別', '年資', '外語能力', '專業領域',
      '資格認證', '授課時數', '評分', '學生總數', '完成課程數',
      '狀態', '加入日期', '最後登入', '備註'
    ];

    const csvData = filteredTeachers.map(teacher => [
      teacher.name || '',
      teacher.email || '',
      teacher.phone || '',
      (teacher.teachingCategory || []).join('; '),
      teacher.experience || '',
      teacher.languages.join('; '),
      teacher.expertise.join('; '),
      teacher.qualification.join('; '),
      teacher.teachingHours || 0,
      teacher.rating || 0,
      teacher.totalStudents || 0,
      teacher.completedCourses || 0,
      getStatusText(teacher.status),
      teacher.joinDate || '',
      teacher.lastLogin || '',
      teacher.bio || ''
    ]);

    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF';
    const csvContent = BOM + [headers, ...csvData]
      .map(row => row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        const cellStr = String(cell).replace(/"/g, '""');
        return cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n') 
          ? `"${cellStr}"` 
          : cellStr;
      }).join(','))
      .join('\r\n');

    const blob = new Blob([csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    const timestamp = new Date().toISOString().slice(0, 10);
    const filterText = statusFilter === 'all' ? '全部' : getStatusText(statusFilter);
    link.setAttribute('download', `TLI教師管理_${filterText}_${timestamp}.csv`);

    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert(`✅ CSV檔案匯出成功！\n\n檔案名稱：TLI教師管理_${filterText}_${timestamp}.csv\n匯出筆數：${filteredTeachers.length} 筆`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900">教師管理</h2>
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <SafeIcon icon={FiUserPlus} className="text-sm" />
            <span>新增教師</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <SafeIcon icon={FiDownload} className="text-sm" />
            <span>匯出CSV</span>
          </motion.button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{teachers.filter(t => t.status === 'active').length}</div>
              <div className="text-sm opacity-90">在職教師</div>
            </div>
            <SafeIcon icon={FiUsers} className="text-2xl opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{teachers.reduce((sum, t) => sum + t.teachingHours, 0)}</div>
              <div className="text-sm opacity-90">總授課時數</div>
            </div>
            <SafeIcon icon={FiClock} className="text-2xl opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{teachers.reduce((sum, t) => sum + t.totalStudents, 0)}</div>
              <div className="text-sm opacity-90">總學生數</div>
            </div>
            <SafeIcon icon={FiUser} className="text-2xl opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{(teachers.reduce((sum, t) => sum + t.rating, 0) / teachers.length).toFixed(1)}</div>
              <div className="text-sm opacity-90">平均評分</div>
            </div>
            <SafeIcon icon={FiStar} className="text-2xl opacity-80" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">搜尋教師</label>
            <div className="relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜尋姓名、信箱或專業領域..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">狀態篩選</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'suspended')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">全部狀態</option>
              <option value="active">在職</option>
              <option value="inactive">離職</option>
              <option value="suspended">停職</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              共 {filteredTeachers.length} 位教師
            </div>
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">教師資訊</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">教授類別</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">年資</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">外語能力</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">專業領域</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">資格認證</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">教學數據</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTeachers.map((teacher) => (
                <motion.tr
                  key={teacher.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <SafeIcon icon={FiUser} className="text-white text-sm" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                        <div className="text-sm text-gray-500">{teacher.email}</div>
                        <div className="text-xs text-gray-400">{teacher.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {teacher.teachingCategory?.slice(0, 2).map((category, index) => (
                        <span key={index} className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                          {category}
                        </span>
                      ))}
                      {(teacher.teachingCategory?.length || 0) > 2 && (
                        <span className="text-xs text-gray-500">+{teacher.teachingCategory.length - 2}</span>
                      )}
                      {(!teacher.teachingCategory || teacher.teachingCategory.length === 0) && (
                        <span className="text-xs text-gray-400">未設定</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {teacher.experience || '未設定'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {teacher.languages.slice(0, 2).map((lang, index) => (
                        <span key={index} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                          {lang}
                        </span>
                      ))}
                      {teacher.languages.length > 2 && (
                        <span className="text-xs text-gray-500">+{teacher.languages.length - 2}</span>
                      )}
                      {teacher.languages.length === 0 && (
                        <span className="text-xs text-gray-400">未設定</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {teacher.expertise.slice(0, 2).map((exp, index) => (
                        <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                          {exp}
                        </span>
                      ))}
                      {teacher.expertise.length > 2 && (
                        <span className="text-xs text-gray-500">+{teacher.expertise.length - 2}</span>
                      )}
                      {teacher.expertise.length === 0 && (
                        <span className="text-xs text-gray-400">未設定</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {teacher.qualification.slice(0, 2).map((qual, index) => (
                        <span key={index} className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                          {qual}
                        </span>
                      ))}
                      {teacher.qualification.length > 2 && (
                        <span className="text-xs text-gray-500">+{teacher.qualification.length - 2}</span>
                      )}
                      {teacher.qualification.length === 0 && (
                        <span className="text-xs text-gray-400">未設定</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>授課: {teacher.teachingHours}h</div>
                      <div>學生: {teacher.totalStudents}人</div>
                      <div className="flex items-center">
                        <SafeIcon icon={FiStar} className="text-yellow-400 text-xs mr-1" />
                        <span>{teacher.rating}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(teacher.status)}`}>
                      {getStatusText(teacher.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setSelectedTeacher(teacher);
                          setIsEditing(false);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="查看/編輯"
                      >
                        <SafeIcon icon={FiEye} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteTeacher(teacher.id)}
                        className="text-red-600 hover:text-red-900"
                        title="刪除"
                      >
                        <SafeIcon icon={FiTrash2} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">新增教師</h3>
                <button onClick={() => setShowAddModal(false)}>
                  <SafeIcon icon={FiX} className="text-white text-xl hover:bg-white/20 rounded-lg p-1 transition-colors" />
                </button>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAddTeacher(); }} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">基本資訊</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      姓名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newTeacher.name}
                      onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="請輸入教師姓名"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      電子郵件 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={newTeacher.email}
                      onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="請輸入電子郵件"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      電話 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={newTeacher.phone}
                      onChange={(e) => setNewTeacher({...newTeacher, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="請輸入電話號碼"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      密碼 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={newTeacher.password}
                      onChange={(e) => setNewTeacher({...newTeacher, password: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="請輸入密碼"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      確認密碼 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={newTeacher.confirmPassword}
                      onChange={(e) => setNewTeacher({...newTeacher, confirmPassword: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="請再次輸入密碼"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">專業資訊</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">教授類別</label>
                    <div className="space-y-2">
                      {newTeacher.teachingCategory.map((category, index) => (
                        <div key={index} className="flex space-x-2">
                          <select
                            value={category}
                            onChange={(e) => {
                              const newCategories = [...newTeacher.teachingCategory];
                              newCategories[index] = e.target.value;
                              setNewTeacher({...newTeacher, teachingCategory: newCategories});
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="">選擇教授類別</option>
                            {TEACHING_CATEGORY_OPTIONS.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              const newCategories = newTeacher.teachingCategory.filter((_, i) => i !== index);
                              setNewTeacher({...newTeacher, teachingCategory: newCategories});
                            }}
                            className="px-2 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <SafeIcon icon={FiX} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setNewTeacher({
                            ...newTeacher, 
                            teachingCategory: [...newTeacher.teachingCategory, '']
                          });
                        }}
                        className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-600 transition-colors"
                      >
                        + 新增教授類別
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">年資</label>
                    <select
                      value={newTeacher.experience}
                      onChange={(e) => setNewTeacher({...newTeacher, experience: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">請選擇年資</option>
                      {EXPERIENCE_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">外語能力</label>
                    <div className="space-y-2">
                      {newTeacher.languages.map((lang, index) => (
                        <div key={index} className="flex space-x-2">
                          <select
                            value={lang.language}
                            onChange={(e) => {
                              const newLanguages = [...newTeacher.languages];
                              newLanguages[index] = {...newLanguages[index], language: e.target.value};
                              setNewTeacher({...newTeacher, languages: newLanguages});
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="">選擇語言</option>
                            {LANGUAGE_OPTIONS.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          <select
                            value={lang.level}
                            onChange={(e) => {
                              const newLanguages = [...newTeacher.languages];
                              newLanguages[index] = {...newLanguages[index], level: e.target.value};
                              setNewTeacher({...newTeacher, languages: newLanguages});
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="">選擇程度</option>
                            {LANGUAGE_LEVELS.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              const newLanguages = newTeacher.languages.filter((_, i) => i !== index);
                              setNewTeacher({...newTeacher, languages: newLanguages});
                            }}
                            className="px-2 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <SafeIcon icon={FiX} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setNewTeacher({
                            ...newTeacher, 
                            languages: [...newTeacher.languages, {language: '', level: ''}]
                          });
                        }}
                        className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-600 transition-colors"
                      >
                        + 新增語言能力
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">專業領域</label>
                    <div className="space-y-2">
                      {newTeacher.expertise.map((exp, index) => (
                        <div key={index} className="flex space-x-2">
                          <select
                            value={exp}
                            onChange={(e) => {
                              const newExpertise = [...newTeacher.expertise];
                              newExpertise[index] = e.target.value;
                              setNewTeacher({...newTeacher, expertise: newExpertise});
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="">選擇專業領域</option>
                            {EXPERTISE_OPTIONS.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              const newExpertise = newTeacher.expertise.filter((_, i) => i !== index);
                              setNewTeacher({...newTeacher, expertise: newExpertise});
                            }}
                            className="px-2 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <SafeIcon icon={FiX} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setNewTeacher({
                            ...newTeacher, 
                            expertise: [...newTeacher.expertise, '']
                          });
                        }}
                        className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-600 transition-colors"
                      >
                        + 新增專業領域
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">資格認證</label>
                    <div className="space-y-2">
                      {newTeacher.qualification.map((qual, index) => (
                        <div key={index} className="flex space-x-2">
                          <select
                            value={qual}
                            onChange={(e) => {
                              const newQualification = [...newTeacher.qualification];
                              newQualification[index] = e.target.value;
                              setNewTeacher({...newTeacher, qualification: newQualification});
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="">選擇資格認證</option>
                            {QUALIFICATION_OPTIONS.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              const newQualification = newTeacher.qualification.filter((_, i) => i !== index);
                              setNewTeacher({...newTeacher, qualification: newQualification});
                            }}
                            className="px-2 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <SafeIcon icon={FiX} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setNewTeacher({
                            ...newTeacher, 
                            qualification: [...newTeacher.qualification, '']
                          });
                        }}
                        className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-600 transition-colors"
                      >
                        + 新增資格認證
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">備註</label>
                    <textarea
                      value={newTeacher.bio}
                      onChange={(e) => setNewTeacher({...newTeacher, bio: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="請輸入備註資訊..."
                    />
                  </div>
                </div>
              </div>


              {/* Form Actions */}
              <div className="flex space-x-4 pt-6 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 font-bold text-lg"
                >
                  新增教師
                </motion.button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-400 transition-colors font-bold text-lg"
                >
                  取消
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">
                  {isEditing ? `編輯教師 - ${selectedTeacher.name}` : `教師詳情 - ${selectedTeacher.name}`}
                </h3>
                <div className="flex items-center space-x-2">
                  {!isEditing && (
                    <button
                      onClick={handleEditTeacher}
                      className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm transition-colors"
                    >
                      編輯
                    </button>
                  )}
                  <button onClick={() => {
                    setShowDetailModal(false);
                    setIsEditing(false);
                    setEditingTeacher(null);
                  }}>
                    <SafeIcon icon={FiX} className="text-white text-xl hover:bg-white/20 rounded-lg p-1 transition-colors" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-900 mb-3">基本資訊</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <span className="text-blue-600 w-16">姓名：</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingTeacher?.name || ''}
                          onChange={(e) => setEditingTeacher(prev => prev ? {...prev, name: e.target.value} : null)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-gray-900"
                        />
                      ) : (
                        <span>{selectedTeacher.name}</span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-600 w-16">信箱：</span>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editingTeacher?.email || ''}
                          onChange={(e) => setEditingTeacher(prev => prev ? {...prev, email: e.target.value} : null)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-gray-900"
                        />
                      ) : (
                        <span>{selectedTeacher.email}</span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-600 w-16">電話：</span>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editingTeacher?.phone || ''}
                          onChange={(e) => setEditingTeacher(prev => prev ? {...prev, phone: e.target.value} : null)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-gray-900"
                        />
                      ) : (
                        <span>{selectedTeacher.phone}</span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-600 w-16">狀態：</span>
                      {isEditing ? (
                        <select
                          value={editingTeacher?.status || ''}
                          onChange={(e) => setEditingTeacher(prev => prev ? {...prev, status: e.target.value as 'active' | 'inactive' | 'suspended'} : null)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-gray-900"
                        >
                          <option value="active">在職</option>
                          <option value="inactive">離職</option>
                          <option value="suspended">停職</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedTeacher.status)}`}>
                          {getStatusText(selectedTeacher.status)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-semibold text-green-900 mb-3">教學數據</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-green-600">授課時數：</span>{selectedTeacher.teachingHours} 小時</div>
                    <div><span className="text-green-600">學生總數：</span>{selectedTeacher.totalStudents} 人</div>
                    <div><span className="text-green-600">完成課程：</span>{selectedTeacher.completedCourses} 堂</div>
                    <div className="flex items-center">
                      <span className="text-green-600">評分：</span>
                      <div className="flex items-center ml-2">
                        <SafeIcon icon={FiStar} className="text-yellow-400 text-sm" />
                        <span className="ml-1">{selectedTeacher.rating}</span>
                      </div>
                    </div>
                    <div><span className="text-green-600">加入日期：</span>{selectedTeacher.joinDate}</div>
                    <div><span className="text-green-600">最後登入：</span>{selectedTeacher.lastLogin}</div>
                  </div>
                </div>
              </div>

              {/* Professional Info */}
              <div className="bg-yellow-50 rounded-xl p-4">
                <h4 className="font-semibold text-yellow-900 mb-3">專業資訊</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-yellow-600">教授類別：</span>
                    {!isEditing ? (
                      <div className="mt-1">
                        {selectedTeacher.teachingCategory?.map((category, index) => (
                          <span key={index} className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                            {category}
                          </span>
                        ))}
                        {(!selectedTeacher.teachingCategory || selectedTeacher.teachingCategory.length === 0) && (
                          <span className="text-xs text-gray-400">未設定</span>
                        )}
                      </div>
                    ) : (
                      <div className="mt-1 space-y-1">
                        {(editingTeacher?.teachingCategory || []).map((category, index) => (
                          <div key={index} className="flex space-x-1">
                            <select
                              value={category}
                              onChange={(e) => {
                                const newCategories = [...(editingTeacher?.teachingCategory || [])];
                                newCategories[index] = e.target.value;
                                setEditingTeacher(prev => prev ? {...prev, teachingCategory: newCategories} : null);
                              }}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-gray-900 text-xs"
                            >
                              <option value="">選擇教授類別</option>
                              {TEACHING_CATEGORY_OPTIONS.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                const newCategories = (editingTeacher?.teachingCategory || []).filter((_, i) => i !== index);
                                setEditingTeacher(prev => prev ? {...prev, teachingCategory: newCategories} : null);
                              }}
                              className="px-1 py-1 text-red-600 hover:bg-red-50 rounded text-xs"
                            >
                              <SafeIcon icon={FiX} size={12} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const newCategories = [...(editingTeacher?.teachingCategory || []), ''];
                            setEditingTeacher(prev => prev ? {...prev, teachingCategory: newCategories} : null);
                          }}
                          className="w-full px-2 py-1 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-yellow-500 hover:text-yellow-600 text-xs"
                        >
                          + 新增教授類別
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-yellow-600">年資：</span>
                    {isEditing ? (
                      <select
                        value={editingTeacher?.experience || ''}
                        onChange={(e) => setEditingTeacher(prev => prev ? {...prev, experience: e.target.value} : null)}
                        className="ml-2 px-2 py-1 border border-gray-300 rounded text-gray-900"
                      >
                        <option value="">請選擇年資</option>
                        {EXPERIENCE_OPTIONS.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="ml-2">{selectedTeacher.experience || '未設定'}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-yellow-600">外語能力：</span>
                    {!isEditing ? (
                      <div className="mt-1">
                        {selectedTeacher.languages.map((lang, index) => (
                          <span key={index} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                            {lang}
                          </span>
                        ))}
                        {selectedTeacher.languages.length === 0 && (
                          <span className="text-xs text-gray-400">未設定</span>
                        )}
                      </div>
                    ) : (
                      <div className="mt-1 space-y-1">
                        {(editingTeacher?.languages || []).map((lang, index) => {
                          // Parse existing language format like "中文(母語)"
                          const match = lang.match(/^(.+)\((.+)\)$/);
                          const language = match ? match[1] : lang;
                          const level = match ? match[2] : '';
                          
                          return (
                            <div key={index} className="flex space-x-1">
                              <select
                                value={language}
                                onChange={(e) => {
                                  const newLanguages = [...(editingTeacher?.languages || [])];
                                  newLanguages[index] = `${e.target.value}(${level})`;
                                  setEditingTeacher(prev => prev ? {...prev, languages: newLanguages} : null);
                                }}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-gray-900 text-xs"
                              >
                                <option value="">選擇語言</option>
                                {LANGUAGE_OPTIONS.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                              <select
                                value={level}
                                onChange={(e) => {
                                  const newLanguages = [...(editingTeacher?.languages || [])];
                                  newLanguages[index] = `${language}(${e.target.value})`;
                                  setEditingTeacher(prev => prev ? {...prev, languages: newLanguages} : null);
                                }}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-gray-900 text-xs"
                              >
                                <option value="">選擇程度</option>
                                {LANGUAGE_LEVELS.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => {
                                  const newLanguages = (editingTeacher?.languages || []).filter((_, i) => i !== index);
                                  setEditingTeacher(prev => prev ? {...prev, languages: newLanguages} : null);
                                }}
                                className="px-1 py-1 text-red-600 hover:bg-red-50 rounded text-xs"
                              >
                                <SafeIcon icon={FiX} size={12} />
                              </button>
                            </div>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => {
                            const newLanguages = [...(editingTeacher?.languages || []), '(請選擇)'];
                            setEditingTeacher(prev => prev ? {...prev, languages: newLanguages} : null);
                          }}
                          className="w-full px-2 py-1 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-yellow-500 hover:text-yellow-600 text-xs"
                        >
                          + 新增語言
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-yellow-600">專業領域：</span>
                    {!isEditing ? (
                      <div className="mt-1">
                        {selectedTeacher.expertise.map((exp, index) => (
                          <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                            {exp}
                          </span>
                        ))}
                        {selectedTeacher.expertise.length === 0 && (
                          <span className="text-xs text-gray-400">未設定</span>
                        )}
                      </div>
                    ) : (
                      <div className="mt-1 space-y-1">
                        {(editingTeacher?.expertise || []).map((exp, index) => (
                          <div key={index} className="flex space-x-1">
                            <select
                              value={exp}
                              onChange={(e) => {
                                const newExpertise = [...(editingTeacher?.expertise || [])];
                                newExpertise[index] = e.target.value;
                                setEditingTeacher(prev => prev ? {...prev, expertise: newExpertise} : null);
                              }}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-gray-900 text-xs"
                            >
                              <option value="">選擇專業領域</option>
                              {EXPERTISE_OPTIONS.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                const newExpertise = (editingTeacher?.expertise || []).filter((_, i) => i !== index);
                                setEditingTeacher(prev => prev ? {...prev, expertise: newExpertise} : null);
                              }}
                              className="px-1 py-1 text-red-600 hover:bg-red-50 rounded text-xs"
                            >
                              <SafeIcon icon={FiX} size={12} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const newExpertise = [...(editingTeacher?.expertise || []), ''];
                            setEditingTeacher(prev => prev ? {...prev, expertise: newExpertise} : null);
                          }}
                          className="w-full px-2 py-1 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-yellow-500 hover:text-yellow-600 text-xs"
                        >
                          + 新增專業領域
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-yellow-600">資格認證：</span>
                    {!isEditing ? (
                      <div className="mt-1">
                        {selectedTeacher.qualification.map((qual, index) => (
                          <span key={index} className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                            {qual}
                          </span>
                        ))}
                        {selectedTeacher.qualification.length === 0 && (
                          <span className="text-xs text-gray-400">未設定</span>
                        )}
                      </div>
                    ) : (
                      <div className="mt-1 space-y-1">
                        {(editingTeacher?.qualification || []).map((qual, index) => (
                          <div key={index} className="flex space-x-1">
                            <select
                              value={qual}
                              onChange={(e) => {
                                const newQualification = [...(editingTeacher?.qualification || [])];
                                newQualification[index] = e.target.value;
                                setEditingTeacher(prev => prev ? {...prev, qualification: newQualification} : null);
                              }}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-gray-900 text-xs"
                            >
                              <option value="">選擇資格認證</option>
                              {QUALIFICATION_OPTIONS.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                const newQualification = (editingTeacher?.qualification || []).filter((_, i) => i !== index);
                                setEditingTeacher(prev => prev ? {...prev, qualification: newQualification} : null);
                              }}
                              className="px-1 py-1 text-red-600 hover:bg-red-50 rounded text-xs"
                            >
                              <SafeIcon icon={FiX} size={12} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const newQualification = [...(editingTeacher?.qualification || []), ''];
                            setEditingTeacher(prev => prev ? {...prev, qualification: newQualification} : null);
                          }}
                          className="w-full px-2 py-1 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-yellow-500 hover:text-yellow-600 text-xs"
                        >
                          + 新增資格認證
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {(selectedTeacher.bio || isEditing) && (
                  <div className="mt-3">
                    <span className="text-yellow-600">備註：</span>
                    {isEditing ? (
                      <textarea
                        value={editingTeacher?.bio || ''}
                        onChange={(e) => setEditingTeacher(prev => prev ? {...prev, bio: e.target.value} : null)}
                        rows={3}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded text-gray-900"
                        placeholder="請輸入備註資訊..."
                      />
                    ) : (
                      <p className="mt-1 text-gray-700 bg-white p-3 rounded border">{selectedTeacher.bio}</p>
                    )}
                  </div>
                )}
              </div>


              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                {isEditing ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveTeacher}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      保存
                    </motion.button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                    >
                      取消
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setIsEditing(false);
                      setEditingTeacher(null);
                    }}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    關閉
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TeacherManagement;