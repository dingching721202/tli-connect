'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';

const {
  FiSettings, FiSave, FiRotateCcw, FiClock, FiCalendar, FiUser, FiUserCheck, FiShield,
  FiAlertTriangle, FiCheck, FiEdit2, FiTrash2, FiPlus, FiX, FiInfo, FiBell, FiMail,
  FiMessageSquare, FiToggleLeft, FiToggleRight, FiRefreshCw, FiCopy, FiDownload, FiUpload
} = FiIcons;

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    // 基本設定
    siteName: 'TLI Connect',
    siteDescription: '專業的語言學習平台',
    contactEmail: 'support@tliconnect.com',
    contactPhone: '02-1234-5678',
    
    // 會員設定
    membershipSettings: {
      autoRenewal: true,
      gracePeriodDays: 7,
      reminderDays: [30, 7, 1],
      maxConcurrentSessions: 3
    },
    
    // 通知設定
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      membershipExpiry: true,
      courseReminder: true,
      systemMaintenance: true
    },
    
    // 系統設定
    systemSettings: {
      maintenanceMode: false,
      registrationEnabled: true,
      maxFileUploadSize: 10, // MB
      sessionTimeout: 30 // minutes
    }
  });

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    // 這裡可以實作保存到後端的邏輯
    alert('設定已儲存！');
  };

  const handleReset = () => {
    if (confirm('確定要重置所有設定嗎？')) {
      // 重置邏輯
      alert('設定已重置！');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">系統設定</h2>
          <p className="text-gray-600 mt-1">管理系統的基本配置和功能設定</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={FiRotateCcw} />
            <span>重置</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={FiSave} />
            <span>儲存</span>
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* 基本設定 */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <SafeIcon icon={FiSettings} />
            <span>基本設定</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">網站名稱</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">聯絡電話</label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) => setSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">網站描述</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">聯絡信箱</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 會員設定 */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <SafeIcon icon={FiUser} />
            <span>會員設定</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">自動續約</label>
                <p className="text-xs text-gray-500">會員到期時自動續約</p>
              </div>
              <button
                onClick={() => updateSetting('membershipSettings', 'autoRenewal', !settings.membershipSettings.autoRenewal)}
                className={`p-2 rounded-lg transition-colors ${
                  settings.membershipSettings.autoRenewal ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <SafeIcon icon={settings.membershipSettings.autoRenewal ? FiToggleRight : FiToggleLeft} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">寬限期（天）</label>
                <input
                  type="number"
                  min="0"
                  value={settings.membershipSettings.gracePeriodDays}
                  onChange={(e) => updateSetting('membershipSettings', 'gracePeriodDays', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">最大同時登入數</label>
                <input
                  type="number"
                  min="1"
                  value={settings.membershipSettings.maxConcurrentSessions}
                  onChange={(e) => updateSetting('membershipSettings', 'maxConcurrentSessions', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 通知設定 */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <SafeIcon icon={FiBell} />
            <span>通知設定</span>
          </h3>
          <div className="space-y-4">
            {[
              { key: 'emailEnabled', label: 'Email 通知', desc: '透過電子郵件發送通知' },
              { key: 'smsEnabled', label: 'SMS 通知', desc: '透過簡訊發送通知' },
              { key: 'pushEnabled', label: '推播通知', desc: '透過瀏覽器推播通知' },
              { key: 'membershipExpiry', label: '會員到期通知', desc: '會員即將到期時發送通知' },
              { key: 'courseReminder', label: '課程提醒', desc: '課程開始前發送提醒' },
              { key: 'systemMaintenance', label: '系統維護通知', desc: '系統維護時發送通知' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">{item.label}</label>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <button
                  onClick={() => updateSetting('notifications', item.key, !settings.notifications[item.key as keyof typeof settings.notifications])}
                  className={`p-2 rounded-lg transition-colors ${
                    settings.notifications[item.key as keyof typeof settings.notifications] ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <SafeIcon icon={settings.notifications[item.key as keyof typeof settings.notifications] ? FiToggleRight : FiToggleLeft} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 系統設定 */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <SafeIcon icon={FiShield} />
            <span>系統設定</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">維護模式</label>
                <p className="text-xs text-gray-500">啟用後網站將顯示維護頁面</p>
              </div>
              <button
                onClick={() => updateSetting('systemSettings', 'maintenanceMode', !settings.systemSettings.maintenanceMode)}
                className={`p-2 rounded-lg transition-colors ${
                  settings.systemSettings.maintenanceMode ? 'text-red-600' : 'text-gray-400'
                }`}
              >
                <SafeIcon icon={settings.systemSettings.maintenanceMode ? FiToggleRight : FiToggleLeft} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">開放註冊</label>
                <p className="text-xs text-gray-500">允許新用戶註冊</p>
              </div>
              <button
                onClick={() => updateSetting('systemSettings', 'registrationEnabled', !settings.systemSettings.registrationEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  settings.systemSettings.registrationEnabled ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <SafeIcon icon={settings.systemSettings.registrationEnabled ? FiToggleRight : FiToggleLeft} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">檔案上傳限制（MB）</label>
                <input
                  type="number"
                  min="1"
                  value={settings.systemSettings.maxFileUploadSize}
                  onChange={(e) => updateSetting('systemSettings', 'maxFileUploadSize', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">會話逾時（分鐘）</label>
                <input
                  type="number"
                  min="5"
                  value={settings.systemSettings.sessionTimeout}
                  onChange={(e) => updateSetting('systemSettings', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;