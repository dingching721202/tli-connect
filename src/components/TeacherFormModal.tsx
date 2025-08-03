'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import { teacherDataService } from '@/data/teachers';

const { FiX } = FiIcons;

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

interface TeacherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
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

const TeacherFormModal: React.FC<TeacherFormModalProps> = ({ isOpen, onClose, onSuccess }) => {
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
    
    alert('教師新增成功！');
    onSuccess?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">新增教師</h3>
            <button onClick={onClose}>
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
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-400 transition-colors font-bold text-lg"
            >
              取消
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TeacherFormModal;